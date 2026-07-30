/**
 * SCIIP Industrial Language Engine — Sprint 5
 * Governed Industrial Property Model Builder
 *
 * Diagnostic-only. No production writes. Existing parser remains authoritative.
 */

"use strict";

const MODEL_VERSION = "ile-property-model-v1.0.0";

const CONCEPT_PATHS = Object.freeze({
  ADDRESS: ["asset", "identity", "address"],
  BUILDING_AREA: ["asset", "areas", "building"],
  OFFICE_AREA: ["asset", "areas", "office"],
  WAREHOUSE_AREA: ["asset", "areas", "warehouse"],
  LAND_AREA: ["asset", "areas", "land"],
  CLEAR_HEIGHT: ["asset", "physical", "clearHeight"],
  POWER: ["asset", "utilities", "power"],
  DOCK_HIGH: ["asset", "loading", "dockHigh"],
  GRADE_LEVEL: ["asset", "loading", "gradeLevel"],
  TRUCK_COURT: ["asset", "loading", "truckCourt"],
  AUTO_PARKING: ["asset", "parking", "auto"],
  TRAILER_PARKING: ["asset", "parking", "trailer"],
  ESFR: ["asset", "fireProtection", "esfr"],
  SPRINKLER: ["asset", "fireProtection", "sprinkler"],
  COLUMN_SPACING: ["asset", "physical", "columnSpacing"],
  HVAC: ["asset", "buildingSystems", "hvac"],
  RAIL: ["asset", "transportation", "rail"],
  CRANE: ["asset", "buildingSystems", "crane"],
  SOLAR: ["asset", "energy", "solar"],
  BATTERY_STORAGE: ["asset", "energy", "batteryStorage"],
  YARD: ["asset", "site", "yard"]
});

const AREA_FACTORS_TO_SF = Object.freeze({
  SF: 1,
  SQFT: 1,
  "SQ FT": 1,
  ACRE: 43560,
  ACRES: 43560,
  AC: 43560
});

const LENGTH_FACTORS_TO_FT = Object.freeze({
  FT: 1,
  FEET: 1,
  FOOT: 1,
  IN: 1 / 12,
  INCH: 1 / 12,
  INCHES: 1 / 12
});

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return value;
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((acc, key) => {
    acc[key] = stableClone(value[key]);
    return acc;
  }, {});
}

function normalizeUnit(unit) {
  return String(unit || "").trim().toUpperCase().replace(/\./g, "");
}

function normalizeArea(value, unit) {
  const numeric = Number(value);
  const normalizedUnit = normalizeUnit(unit || "SF");
  if (!Number.isFinite(numeric)) throw new TypeError("Area value must be numeric.");
  const factor = AREA_FACTORS_TO_SF[normalizedUnit];
  if (!factor) throw new RangeError(`Unsupported area unit: ${unit}`);
  return {
    value: Number((numeric * factor).toFixed(4)),
    unit: "SF",
    sourceValue: numeric,
    sourceUnit: normalizedUnit
  };
}

function normalizeLength(value, unit) {
  const numeric = Number(value);
  const normalizedUnit = normalizeUnit(unit || "FT");
  if (!Number.isFinite(numeric)) throw new TypeError("Length value must be numeric.");
  const factor = LENGTH_FACTORS_TO_FT[normalizedUnit];
  if (!factor) throw new RangeError(`Unsupported length unit: ${unit}`);
  return {
    value: Number((numeric * factor).toFixed(4)),
    unit: "FT",
    sourceValue: numeric,
    sourceUnit: normalizedUnit
  };
}

function normalizeCount(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) throw new TypeError("Count must be a non-negative number.");
  return { value: Math.round(numeric), unit: "COUNT" };
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") return value;
  const text = String(value).trim().toLowerCase();
  if (["true", "yes", "y", "present", "available", "1"].includes(text)) return true;
  if (["false", "no", "n", "absent", "none", "0"].includes(text)) return false;
  throw new TypeError(`Cannot normalize boolean value: ${value}`);
}

function confidenceOf(item) {
  const value = Number(item && item.confidence);
  return Number.isFinite(value) ? value : 0;
}

function evidenceWidth(item) {
  const start = Number(item && item.startOffset);
  const end = Number(item && item.endOffset);
  return Number.isFinite(start) && Number.isFinite(end) && end >= start ? end - start : 0;
}

function compareCandidates(a, b) {
  const confidenceDelta = confidenceOf(b) - confidenceOf(a);
  if (confidenceDelta !== 0) return confidenceDelta;
  const widthDelta = evidenceWidth(b) - evidenceWidth(a);
  if (widthDelta !== 0) return widthDelta;
  const aStart = Number.isFinite(Number(a.startOffset)) ? Number(a.startOffset) : Number.MAX_SAFE_INTEGER;
  const bStart = Number.isFinite(Number(b.startOffset)) ? Number(b.startOffset) : Number.MAX_SAFE_INTEGER;
  if (aStart !== bStart) return aStart - bStart;
  return JSON.stringify(stableClone(a)).localeCompare(JSON.stringify(stableClone(b)));
}

function chooseCandidate(items) {
  return [...items].sort(compareCandidates)[0];
}

function valueOf(item) {
  if (item && Object.prototype.hasOwnProperty.call(item, "semanticValue")) return item.semanticValue;
  if (item && Object.prototype.hasOwnProperty.call(item, "value")) return item.value;
  return null;
}

function normalizeConceptValue(concept, item) {
  const raw = valueOf(item);

  switch (concept) {
    case "BUILDING_AREA":
    case "OFFICE_AREA":
    case "WAREHOUSE_AREA":
    case "LAND_AREA":
      if (raw && typeof raw === "object") return normalizeArea(raw.value, raw.unit);
      return normalizeArea(raw, item.unit);

    case "CLEAR_HEIGHT":
    case "TRUCK_COURT":
      if (raw && typeof raw === "object") return normalizeLength(raw.value, raw.unit);
      return normalizeLength(raw, item.unit);

    case "DOCK_HIGH":
    case "GRADE_LEVEL":
    case "AUTO_PARKING":
    case "TRAILER_PARKING":
      if (raw && typeof raw === "object") return normalizeCount(raw.value);
      return normalizeCount(raw);

    case "POWER": {
      const source = raw && typeof raw === "object" ? raw : {};
      const amps = Number(source.amps ?? item.amps ?? raw);
      if (!Number.isFinite(amps) || amps < 0) throw new TypeError("POWER requires non-negative amps.");
      const result = { amps: Math.round(amps), unit: "AMPS" };
      if (source.voltage ?? item.voltage) result.voltage = String(source.voltage ?? item.voltage);
      if (source.phase ?? item.phase) result.phase = Number(source.phase ?? item.phase);
      return result;
    }

    case "ESFR":
    case "SPRINKLER":
    case "HVAC":
    case "RAIL":
    case "CRANE":
    case "SOLAR":
    case "BATTERY_STORAGE":
      return { present: normalizeBoolean(raw) };

    case "COLUMN_SPACING":
      if (raw && typeof raw === "object") {
        return {
          width: normalizeLength(raw.width, raw.unit || "FT"),
          depth: normalizeLength(raw.depth, raw.unit || "FT")
        };
      }
      throw new TypeError("COLUMN_SPACING requires width and depth.");

    case "ADDRESS":
      return { formatted: String(raw || "").trim() };

    case "YARD":
      if (raw && typeof raw === "object" && raw.value != null) return normalizeArea(raw.value, raw.unit || "SF");
      return normalizeArea(raw, item.unit || "SF");

    default:
      return stableClone(raw);
  }
}

function setPath(target, path, value) {
  let cursor = target;
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[path[path.length - 1]] = value;
}

function evidenceRecord(item, concept, resolution) {
  return {
    concept,
    confidence: confidenceOf(item),
    text: item.text || item.phrase || "",
    startOffset: Number.isFinite(Number(item.startOffset)) ? Number(item.startOffset) : null,
    endOffset: Number.isFinite(Number(item.endOffset)) ? Number(item.endOffset) : null,
    reasoning: Array.isArray(item.reasoning) ? [...item.reasoning] : [],
    resolution
  };
}

function validateInterpretation(item, index) {
  if (!item || typeof item !== "object") throw new TypeError(`Interpretation ${index} must be an object.`);
  const concept = String(item.concept || item.conceptId || "").trim().toUpperCase();
  if (!concept) throw new TypeError(`Interpretation ${index} is missing concept.`);
  if (!CONCEPT_PATHS[concept]) throw new RangeError(`Unsupported concept: ${concept}`);
  return concept;
}

function validateModel(model, options = {}) {
  const errors = [];
  const warnings = [];
  const requiredConcepts = Array.isArray(options.requiredConcepts)
    ? options.requiredConcepts.map(value => String(value).toUpperCase())
    : [];

  const resolved = new Set(model.governance.resolvedConcepts);
  for (const concept of requiredConcepts) {
    if (!resolved.has(concept)) errors.push(`Missing required concept: ${concept}`);
  }

  const buildingArea = model.asset?.areas?.building?.value;
  const landArea = model.asset?.areas?.land?.value;
  if (Number.isFinite(buildingArea) && Number.isFinite(landArea) && buildingArea > landArea) {
    warnings.push("Building area exceeds land area; confirm units or parcel coverage.");
  }

  const clearHeight = model.asset?.physical?.clearHeight?.value;
  if (Number.isFinite(clearHeight) && (clearHeight < 8 || clearHeight > 100)) {
    warnings.push("Clear height is outside the governed industrial plausibility range.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

function buildPropertyModel(interpretations, options = {}) {
  if (!Array.isArray(interpretations)) throw new TypeError("interpretations must be an array.");

  const grouped = new Map();
  interpretations.forEach((item, index) => {
    const concept = validateInterpretation(item, index);
    if (!grouped.has(concept)) grouped.set(concept, []);
    grouped.get(concept).push(item);
  });

  const model = {
    modelVersion: MODEL_VERSION,
    executionMode: "DIAGNOSTIC_ONLY",
    asset: {},
    evidence: [],
    conflicts: [],
    governance: {
      existingParserAuthoritative: true,
      productionWrites: 0,
      commitEnabled: false,
      inputInterpretationCount: interpretations.length,
      resolvedConcepts: []
    }
  };

  for (const concept of [...grouped.keys()].sort()) {
    const candidates = grouped.get(concept);
    const selected = chooseCandidate(candidates);
    const normalized = normalizeConceptValue(concept, selected);
    setPath(model, CONCEPT_PATHS[concept], normalized);
    model.governance.resolvedConcepts.push(concept);
    model.evidence.push(evidenceRecord(selected, concept, candidates.length > 1 ? "DUPLICATE_RESOLVED" : "SOLE_CANDIDATE"));

    if (candidates.length > 1) {
      model.conflicts.push({
        concept,
        candidateCount: candidates.length,
        selectedConfidence: confidenceOf(selected),
        discarded: candidates
          .filter(candidate => candidate !== selected)
          .sort(compareCandidates)
          .map(candidate => evidenceRecord(candidate, concept, "DISCARDED"))
      });
    }
  }

  model.evidence.sort((a, b) => a.concept.localeCompare(b.concept));
  model.conflicts.sort((a, b) => a.concept.localeCompare(b.concept));

  const validation = validateModel(model, options);
  model.validation = validation;

  if (options.failOnValidationError && !validation.valid) {
    const error = new Error(`Property model validation failed: ${validation.errors.join("; ")}`);
    error.validation = validation;
    throw error;
  }

  return deepFreeze(stableClone(model));
}

module.exports = Object.freeze({
  MODEL_VERSION,
  CONCEPT_PATHS,
  buildPropertyModel,
  validateModel,
  normalizeArea,
  normalizeLength,
  normalizeCount,
  deepFreeze
});
