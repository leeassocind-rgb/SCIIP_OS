// SCIIP Explorer 4.0 — Governed Existing-Property Canonical Update Adapter V1
// Source implementation only. No concrete production store is bound here.

import crypto from "node:crypto";

export const SCIIP_EXISTING_PROPERTY_CANONICAL_UPDATE_ADAPTER_VERSION =
  "SCIIP_EXISTING_PROPERTY_CANONICAL_UPDATE_ADAPTER_V1";

const sha256 = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

const assertFn = (name, fn) => {
  if (typeof fn !== "function") throw new Error(`${name} function required`);
};

const stableEnvelopeDigest = (envelope) =>
  sha256({
    targetBinding: envelope.targetBinding,
    field: envelope.field,
    beforeValue: envelope.beforeValue,
    afterValue: envelope.afterValue,
    idempotencyKey: envelope.idempotencyKey
  });

export function buildGovernedExistingPropertyCanonicalUpdateAdapter(deps) {
  if (!deps || typeof deps !== "object") throw new Error("deps object required");

  assertFn("lookupExistingProperty", deps.lookupExistingProperty);
  assertFn("compareAndSetField", deps.compareAndSetField);
  assertFn("lookupIdempotencyReceipt", deps.lookupIdempotencyReceipt);
  assertFn("writeIdempotencyReceipt", deps.writeIdempotencyReceipt);
  assertFn("appendProvenanceReceipt", deps.appendProvenanceReceipt);
  assertFn("readBackExistingProperty", deps.readBackExistingProperty);

  const physicalStore = String(deps.physicalStore || "").trim();
  if (!physicalStore) throw new Error("physicalStore attribution required");

  return {
    version: SCIIP_EXISTING_PROPERTY_CANONICAL_UPDATE_ADAPTER_VERSION,
    physicalStore,

    async dryRun(envelope) {
      validateEnvelope(envelope);

      const current = await deps.lookupExistingProperty(envelope.targetBinding);
      if (!current) return fail("TARGET_NOT_FOUND");

      if (current[envelope.field] !== envelope.beforeValue) {
        return fail("BEFORE_STATE_MISMATCH", {
          observedValue: current[envelope.field]
        });
      }

      const prior = await deps.lookupIdempotencyReceipt(envelope.idempotencyKey);
      if (prior) {
        const currentDigest = stableEnvelopeDigest(envelope);
        if (prior.envelopeDigest !== currentDigest) {
          return fail("CONFLICTING_REPLAY");
        }
        return {
          status: "IDEMPOTENT_REPLAY",
          committed: false,
          duplicateSuppressed: true,
          idempotentReplayVerified: true,
          receipt: prior
        };
      }

      const beforeDigest = sha256({
        targetBinding: envelope.targetBinding,
        field: envelope.field,
        value: current[envelope.field]
      });
      const afterDigest = sha256({
        targetBinding: envelope.targetBinding,
        field: envelope.field,
        value: envelope.afterValue
      });

      return {
        status: "DRY_RUN_READY",
        committed: false,
        targetBinding: envelope.targetBinding,
        field: envelope.field,
        beforeValue: envelope.beforeValue,
        afterValue: envelope.afterValue,
        physicalStore,
        beforeDigest,
        afterDigest,
        envelopeDigest: stableEnvelopeDigest(envelope)
      };
    },

    async commit(envelope) {
      validateEnvelope(envelope);

      const prior = await deps.lookupIdempotencyReceipt(envelope.idempotencyKey);
      if (prior) {
        const currentDigest = stableEnvelopeDigest(envelope);
        if (prior.envelopeDigest !== currentDigest) {
          return fail("CONFLICTING_REPLAY");
        }

        const replayReadback = await deps.readBackExistingProperty(envelope.targetBinding);
        const replayMatched =
          !!replayReadback &&
          replayReadback[envelope.field] === envelope.afterValue;

        if (!replayMatched) {
          return fail("IDEMPOTENT_REPLAY_READBACK_MISMATCH");
        }

        return {
          status: "IDEMPOTENT_REPLAY",
          committed: false,
          duplicateSuppressed: true,
          idempotentReplayVerified: true,
          readback: replayReadback,
          receipt: prior
        };
      }

      const current = await deps.lookupExistingProperty(envelope.targetBinding);
      if (!current) return fail("TARGET_NOT_FOUND");

      if (current[envelope.field] !== envelope.beforeValue) {
        return fail("BEFORE_STATE_MISMATCH", {
          observedValue: current[envelope.field]
        });
      }

      const beforeDigest = sha256({
        targetBinding: envelope.targetBinding,
        field: envelope.field,
        value: current[envelope.field]
      });

      const afterDigest = sha256({
        targetBinding: envelope.targetBinding,
        field: envelope.field,
        value: envelope.afterValue
      });

      const cas = await deps.compareAndSetField({
        targetBinding: envelope.targetBinding,
        field: envelope.field,
        expectedBeforeValue: envelope.beforeValue,
        afterValue: envelope.afterValue
      });

      if (!cas || cas.committed !== true) {
        return fail("COMPARE_AND_SET_REJECTED");
      }

      const readback = await deps.readBackExistingProperty(envelope.targetBinding);
      const readbackMatched =
        !!readback && readback[envelope.field] === envelope.afterValue;

      if (!readbackMatched) {
        return fail("POST_COMMIT_READBACK_MISMATCH", {
          holdFurtherWrites: true
        });
      }

      const receipt = {
        adapterVersion: SCIIP_EXISTING_PROPERTY_CANONICAL_UPDATE_ADAPTER_VERSION,
        targetBinding: envelope.targetBinding,
        field: envelope.field,
        beforeValue: envelope.beforeValue,
        afterValue: envelope.afterValue,
        idempotencyKey: envelope.idempotencyKey,
        envelopeDigest: stableEnvelopeDigest(envelope),
        beforeDigest,
        afterDigest,
        physicalStore,
        committed: true
      };

      await deps.writeIdempotencyReceipt(receipt);
      await deps.appendProvenanceReceipt({
        ...receipt,
        authorizationEvidence: envelope.authorizationEvidence,
        appendOnly: true
      });

      return {
        status: "COMMITTED",
        committed: true,
        readback,
        readbackMatched: true,
        idempotentReplayVerified: false,
        receipt
      };
    }
  };
}

function validateEnvelope(envelope) {
  if (!envelope || typeof envelope !== "object") throw new Error("envelope required");

  const required = [
    "targetBinding",
    "field",
    "beforeValue",
    "afterValue",
    "idempotencyKey",
    "authorizationEvidence"
  ];

  for (const k of required) {
    if (envelope[k] === undefined || envelope[k] === null || envelope[k] === "") {
      throw new Error(`${k} required`);
    }
  }

  if (envelope.beforeValue === envelope.afterValue) {
    throw new Error("afterValue must differ from beforeValue");
  }

  if (envelope.populationMembershipMutation === true) {
    throw new Error("population membership mutation forbidden");
  }

  if (envelope.automaticRetry === true) {
    throw new Error("automatic retry forbidden");
  }

  if (envelope.automaticChaining === true) {
    throw new Error("automatic chaining forbidden");
  }
}

function fail(reason, extra={}) {
  return {
    status: "BLOCKED",
    committed: false,
    reason,
    ...extra
  };
}
