/**
 * SCIIP Explorer 3.0 — M2.90
 * Governed Canonical Persistence Adapter & Commit Boundary Runtime
 *
 * Safety invariant: this runtime defines and validates the persistence boundary.
 * It does not enable automatic canonical writes.
 */
export const M2_90_RUNTIME = Object.freeze({
  milestone: "M2.90",
  runtime: "governed-canonical-persistence-adapter-commit-boundary-runtime",
  persistenceAdapter: "NOT_BOUND",
  canonicalWriteAuthority: false,
  automaticCommit: false,
  governedMutationEnabled: false,
  committedCount: 0,
  capabilities: Object.freeze([
    "deterministic-idempotency-key",
    "expected-version-check",
    "version-conflict-detection",
    "atomic-commit-intent",
    "rollback-receipt-contract",
    "durable-commit-receipt-contract",
    "property-scoped-execution"
  ])
});

export function createCanonicalCommitIntent({
  propertyId,
  candidateId,
  expectedVersion,
  payloadHash
} = {}) {
  if (!propertyId || !candidateId || expectedVersion === undefined || !payloadHash) {
    throw new Error("M2.90 commit intent requires propertyId, candidateId, expectedVersion, and payloadHash");
  }
  const idempotencyKey = [
    "SCIIP", "M2.90", String(propertyId), String(candidateId),
    String(expectedVersion), String(payloadHash)
  ].join(":");
  return Object.freeze({
    propertyId: String(propertyId),
    candidateId: String(candidateId),
    expectedVersion,
    payloadHash: String(payloadHash),
    idempotencyKey,
    atomic: true,
    writeAuthorized: false,
    automaticCommit: false
  });
}

export function verifyPersistenceBoundary({
  adapterBound = false,
  canonicalWriteAuthority = false,
  automaticCommit = false
} = {}) {
  return Object.freeze({
    adapterBound: Boolean(adapterBound),
    canonicalWriteAuthority: Boolean(canonicalWriteAuthority),
    automaticCommit: Boolean(automaticCommit),
    safeDefault:
      !adapterBound &&
      !canonicalWriteAuthority &&
      !automaticCommit
  });
}
