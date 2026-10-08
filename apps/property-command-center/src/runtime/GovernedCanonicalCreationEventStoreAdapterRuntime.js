import fs from "node:fs";
import path from "node:path";

function ensureObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function validateEvent(event) {
  ensureObject(event, "event");
  const required = [
    "eventType",
    "canonicalPropertyId",
    "sourcePropertyId",
    "normalizedAddress",
    "idempotencyKey",
    "observationTimestamp",
    "authorityReference",
    "sourceProvenance",
    "identityEvidence"
  ];
  for (const key of required) {
    if (event[key] === undefined || event[key] === null || event[key] === "") {
      throw new Error(`missing required event field: ${key}`);
    }
  }
  if (event.eventType !== "CANONICAL_IDENTITY_CREATED") {
    throw new Error(`unsupported eventType: ${event.eventType}`);
  }
  return event;
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const text = fs.readFileSync(filePath, "utf8");
  if (!text.trim()) return [];
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch (err) {
        throw new Error(`invalid JSONL at line ${i + 1}: ${err.message}`);
      }
    });
}

function atomicRewrite(filePath, records) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  const payload = records.map(x => JSON.stringify(x)).join("\n") + (records.length ? "\n" : "");
  fs.writeFileSync(tmp, payload, "utf8");
  fs.renameSync(tmp, filePath);
}

export function buildGovernedCanonicalCreationEventStoreAdapter({
  eventLogPath,
  authorized = false
} = {}) {
  if (!eventLogPath || typeof eventLogPath !== "string") {
    throw new Error("eventLogPath is required");
  }

  return {
    contract: "GOVERNED_CANONICAL_CREATION_EVENT_STORE_ADAPTER_V1",

    lookupByIdempotencyKey(idempotencyKey) {
      if (!idempotencyKey) return null;
      return readJsonl(eventLogPath).find(x => x.idempotencyKey === idempotencyKey) || null;
    },

    lookupByCanonicalPropertyId(canonicalPropertyId) {
      if (!canonicalPropertyId) return [];
      return readJsonl(eventLogPath).filter(
        x => x.eventType === "CANONICAL_IDENTITY_CREATED" &&
             x.canonicalPropertyId === canonicalPropertyId
      );
    },

    appendCreationEvent(event) {
      validateEvent(event);

      if (!authorized) {
        return { appended: false, state: "UNAUTHORIZED" };
      }

      const records = readJsonl(eventLogPath);

      const duplicateIdempotency = records.find(
        x => x.idempotencyKey === event.idempotencyKey
      );
      if (duplicateIdempotency) {
        return {
          appended: false,
          state: "DUPLICATE_IDEMPOTENCY_KEY",
          existing: duplicateIdempotency
        };
      }

      const duplicateCanonicalCreation = records.find(
        x => x.eventType === "CANONICAL_IDENTITY_CREATED" &&
             x.canonicalPropertyId === event.canonicalPropertyId
      );
      if (duplicateCanonicalCreation) {
        return {
          appended: false,
          state: "DUPLICATE_CANONICAL_CREATION_EVENT",
          existing: duplicateCanonicalCreation
        };
      }

      const next = [...records, event];
      atomicRewrite(eventLogPath, next);

      return {
        appended: true,
        state: "CANONICAL_CREATION_EVENT_APPENDED",
        idempotencyKey: event.idempotencyKey,
        canonicalPropertyId: event.canonicalPropertyId
      };
    },

    readAfterAppend({ idempotencyKey, canonicalPropertyId }) {
      const byKey = this.lookupByIdempotencyKey(idempotencyKey);
      const byCanonical = this.lookupByCanonicalPropertyId(canonicalPropertyId);
      return {
        verified:
          !!byKey &&
          byCanonical.length === 1 &&
          byCanonical[0].idempotencyKey === idempotencyKey,
        byKey,
        byCanonical
      };
    },

    readAll() {
      return readJsonl(eventLogPath);
    }
  };
}
