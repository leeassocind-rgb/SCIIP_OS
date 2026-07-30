"use strict";

/**
 * SCIIP ILE Sprint 6 — Governed Integration Adapter
 * Converts canonical ILE property models into diagnostic SCIIP evidence records.
 * Existing parser remains authoritative. Zero production writes.
 */

const VERSION = "ile-v1.0.0-sprint6.0";
const EXECUTION_MODE = "DIAGNOSTIC_ONLY";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return value;
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((out, key) => {
    out[key] = stableObject(value[key]);
    return out;
  }, {});
}

function scalar(value) {
  if (value == null) return null;
  if (typeof value !== "object") return value;
  if ("value" in value) return value.value;
  if ("present" in value) return Boolean(value.present);
  return stableObject(value);
}

function unitOf(value) {
  if (!value || typeof value !== "object") return null;
  return value.unit || value.units || null;
}

function evidenceFor(model, concept) {
  const ledger = Array.isArray(model?.evidence) ? model.evidence : [];
  return ledger
    .filter(item => String(item.concept || "").toUpperCase() === concept)
    .map(item => stableObject(item));
}

function confidenceFor(model, concept) {
  const evidence = evidenceFor(model, concept);
  if (!evidence.length) return 0;
  return Math.max(...evidence.map(item => Number(item.confidence || 0)));
}

const PATHS = Object.freeze([
  ["BUILDING_AREA", ["asset", "areas", "building"]],
  ["OFFICE_AREA", ["asset", "areas", "office"]],
  ["WAREHOUSE_AREA", ["asset", "areas", "warehouse"]],
  ["LAND_AREA", ["asset", "areas", "land"]],
  ["CLEAR_HEIGHT", ["asset", "physical", "clearHeight"]],
  ["COLUMN_SPACING", ["asset", "physical", "columnSpacing"]],
  ["POWER", ["asset", "utilities", "power"]],
  ["DOCK_HIGH", ["asset", "loading", "dockHigh"]],
  ["GRADE_LEVEL", ["asset", "loading", "gradeLevel"]],
  ["TRUCK_COURT", ["asset", "loading", "truckCourt"]],
  ["AUTO_PARKING", ["asset", "parking", "auto"]],
  ["TRAILER_PARKING", ["asset", "parking", "trailer"]],
  ["ESFR", ["asset", "fireProtection", "esfr"]],
  ["SPRINKLER", ["asset", "fireProtection", "sprinkler"]],
  ["RAIL", ["asset", "specialized", "rail"]],
  ["CRANE", ["asset", "specialized", "crane"]],
  ["SOLAR", ["asset", "utilities", "solar"]],
  ["BATTERY_STORAGE", ["asset", "utilities", "batteryStorage"]],
  ["YARD", ["asset", "site", "yard"]]
]);

function getPath(object, path) {
  return path.reduce((value, key) => value == null ? undefined : value[key], object);
}

function toEvidenceRecord(model, concept, path, context = {}) {
  const raw = getPath(model, path);
  if (raw == null) return null;

  const sourceEvidence = evidenceFor(model, concept);
  return deepFreeze(stableObject({
    evidenceId: `ILE:${context.documentId || "UNKNOWN"}:${concept}`,
    schemaVersion: "SCIIP_EVIDENCE_V1",
    sourceSystem: "SCIIP_ILE",
    parserAuthority: "DIAGNOSTIC_SECONDARY",
    concept,
    value: scalar(raw),
    unit: unitOf(raw),
    confidence: confidenceFor(model, concept),
    evidence: sourceEvidence,
    context: {
      documentId: context.documentId || null,
      pageNumber: context.pageNumber ?? null,
      sheetName: context.sheetName || null,
      propertyId: context.propertyId || null,
      sourceType: context.sourceType || null
    },
    translation: {
      adapterVersion: VERSION,
      executionMode: EXECUTION_MODE,
      deterministic: true,
      productionWrites: 0
    }
  }));
}

function translatePropertyModel(model, context = {}) {
  if (!model || typeof model !== "object" || !model.asset) {
    throw new TypeError("A canonical property model is required.");
  }

  const records = PATHS
    .map(([concept, path]) => toEvidenceRecord(model, concept, path, context))
    .filter(Boolean)
    .sort((a, b) => a.concept.localeCompare(b.concept));

  return deepFreeze({
    version: VERSION,
    executionMode: EXECUTION_MODE,
    context: stableObject(context),
    evidenceRecords: records,
    ledger: {
      translatedConcepts: records.map(record => record.concept),
      translatedCount: records.length,
      sourceEvidenceCount: records.reduce(
        (sum, record) => sum + record.evidence.length, 0
      )
    },
    governance: {
      deterministic: true,
      duplicateSafe: true,
      productionWrites: 0,
      commitEnabled: false,
      existingParserAuthoritative: true
    }
  });
}

function normalizeComparable(record) {
  return {
    concept: String(record?.concept || "").toUpperCase(),
    value: record?.value ?? null,
    unit: record?.unit || null,
    confidence: Number(record?.confidence || 0)
  };
}

function comparableKey(record) {
  return JSON.stringify(stableObject({
    value: record.value,
    unit: record.unit
  }));
}

function compareEvidence(legacyRecords = [], ileRecords = []) {
  const legacy = new Map(legacyRecords.map(r => {
    const n = normalizeComparable(r); return [n.concept, n];
  }));
  const ile = new Map(ileRecords.map(r => {
    const n = normalizeComparable(r); return [n.concept, n];
  }));

  const concepts = [...new Set([...legacy.keys(), ...ile.keys()])].sort();
  const comparisons = concepts.map(concept => {
    const left = legacy.get(concept) || null;
    const right = ile.get(concept) || null;
    let status = "MATCH";
    if (!left) status = "ILE_ONLY";
    else if (!right) status = "LEGACY_ONLY";
    else if (comparableKey(left) !== comparableKey(right)) status = "MISMATCH";

    return {
      concept,
      status,
      legacy: left,
      ile: right,
      recommendation: status === "MATCH" ? "NO_ACTION" : "REVIEW_REQUIRED"
    };
  });

  const summary = comparisons.reduce((out, item) => {
    out[item.status] = (out[item.status] || 0) + 1;
    return out;
  }, { MATCH: 0, MISMATCH: 0, ILE_ONLY: 0, LEGACY_ONLY: 0 });

  return deepFreeze(stableObject({
    version: VERSION,
    comparisons,
    summary,
    reviewRequired: comparisons.some(item => item.status !== "MATCH"),
    productionWrites: 0,
    existingParserAuthoritative: true
  }));
}

module.exports = Object.freeze({
  VERSION,
  EXECUTION_MODE,
  PATHS,
  deepFreeze,
  stableObject,
  translatePropertyModel,
  compareEvidence,
  toEvidenceRecord
});
