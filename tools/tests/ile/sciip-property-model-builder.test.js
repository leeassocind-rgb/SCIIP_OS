"use strict";

const assert = require("assert");
const path = require("path");

const builder = require(path.resolve(
  __dirname,
  "../../supersheets/parser-platform/sciip-property-model-builder.js"
));

let testsRun = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    testsRun += 1;
  } catch (error) {
    failures.push({ test: name, error: error.stack || String(error) });
  }
}

function interpretation(concept, semanticValue, overrides = {}) {
  return {
    concept,
    semanticValue,
    confidence: 0.9,
    text: `${concept} evidence`,
    startOffset: 10,
    endOffset: 20,
    reasoning: ["governed test evidence"],
    ...overrides
  };
}

test("exports model version", () => {
  assert.strictEqual(builder.MODEL_VERSION, "ile-property-model-v1.0.0");
});

test("builds deterministic model", () => {
  const input = [
    interpretation("CLEAR_HEIGHT", { value: 36, unit: "FT" }),
    interpretation("BUILDING_AREA", { value: 100000, unit: "SF" }),
    interpretation("POWER", { amps: 4000, voltage: "277/480V", phase: 3 })
  ];
  assert.deepStrictEqual(builder.buildPropertyModel(input), builder.buildPropertyModel([...input].reverse()));
});

test("normalizes acres to square feet", () => {
  const result = builder.normalizeArea(2, "AC");
  assert.strictEqual(result.value, 87120);
  assert.strictEqual(result.unit, "SF");
});

test("normalizes inches to feet", () => {
  const result = builder.normalizeLength(18, "IN");
  assert.strictEqual(result.value, 1.5);
  assert.strictEqual(result.unit, "FT");
});

test("normalizes counts", () => {
  assert.deepStrictEqual(builder.normalizeCount(81.6), { value: 82, unit: "COUNT" });
});

test("assembles governed property sections", () => {
  const model = builder.buildPropertyModel([
    interpretation("BUILDING_AREA", { value: 664859, unit: "SF" }),
    interpretation("CLEAR_HEIGHT", { value: 42, unit: "FT" }),
    interpretation("DOCK_HIGH", 82),
    interpretation("GRADE_LEVEL", 4),
    interpretation("AUTO_PARKING", 265),
    interpretation("TRAILER_PARKING", 398),
    interpretation("ESFR", true),
    interpretation("POWER", { amps: 4000, voltage: "277/480V", phase: 3 })
  ]);
  assert.strictEqual(model.asset.areas.building.value, 664859);
  assert.strictEqual(model.asset.physical.clearHeight.value, 42);
  assert.strictEqual(model.asset.loading.dockHigh.value, 82);
  assert.strictEqual(model.asset.loading.gradeLevel.value, 4);
  assert.strictEqual(model.asset.parking.auto.value, 265);
  assert.strictEqual(model.asset.parking.trailer.value, 398);
  assert.strictEqual(model.asset.fireProtection.esfr.present, true);
  assert.strictEqual(model.asset.utilities.power.amps, 4000);
});

test("selects highest-confidence duplicate", () => {
  const model = builder.buildPropertyModel([
    interpretation("CLEAR_HEIGHT", { value: 32, unit: "FT" }, { confidence: 0.7 }),
    interpretation("CLEAR_HEIGHT", { value: 36, unit: "FT" }, { confidence: 0.95 })
  ]);
  assert.strictEqual(model.asset.physical.clearHeight.value, 36);
  assert.strictEqual(model.conflicts.length, 1);
  assert.strictEqual(model.evidence[0].resolution, "DUPLICATE_RESOLVED");
});

test("uses widest evidence span as tie-breaker", () => {
  const model = builder.buildPropertyModel([
    interpretation("DOCK_HIGH", 70, { confidence: 0.9, startOffset: 10, endOffset: 15 }),
    interpretation("DOCK_HIGH", 82, { confidence: 0.9, startOffset: 10, endOffset: 30 })
  ]);
  assert.strictEqual(model.asset.loading.dockHigh.value, 82);
});

test("uses earliest source span as second tie-breaker", () => {
  const model = builder.buildPropertyModel([
    interpretation("GRADE_LEVEL", 2, { confidence: 0.9, startOffset: 50, endOffset: 60 }),
    interpretation("GRADE_LEVEL", 4, { confidence: 0.9, startOffset: 10, endOffset: 20 })
  ]);
  assert.strictEqual(model.asset.loading.gradeLevel.value, 4);
});

test("validates required concepts", () => {
  const model = builder.buildPropertyModel(
    [interpretation("POWER", { amps: 2000 })],
    { requiredConcepts: ["POWER", "CLEAR_HEIGHT"] }
  );
  assert.strictEqual(model.validation.valid, false);
  assert.deepStrictEqual(model.validation.errors, ["Missing required concept: CLEAR_HEIGHT"]);
});

test("can fail closed on required concepts", () => {
  assert.throws(() => builder.buildPropertyModel(
    [interpretation("POWER", { amps: 2000 })],
    { requiredConcepts: ["BUILDING_AREA"], failOnValidationError: true }
  ), /Property model validation failed/);
});

test("warns when building area exceeds land area", () => {
  const model = builder.buildPropertyModel([
    interpretation("BUILDING_AREA", { value: 100000, unit: "SF" }),
    interpretation("LAND_AREA", { value: 1, unit: "AC" })
  ]);
  assert.strictEqual(model.validation.warnings.length, 1);
});

test("warns on implausible clear height", () => {
  const model = builder.buildPropertyModel([
    interpretation("CLEAR_HEIGHT", { value: 150, unit: "FT" })
  ]);
  assert.strictEqual(model.validation.warnings.length, 1);
});

test("rejects unsupported concepts", () => {
  assert.throws(
    () => builder.buildPropertyModel([interpretation("UNKNOWN_CONCEPT", 1)]),
    /Unsupported concept/
  );
});

test("rejects non-array input", () => {
  assert.throws(() => builder.buildPropertyModel({}), /must be an array/);
});

test("rejects invalid area units", () => {
  assert.throws(() => builder.normalizeArea(5, "HECTARES"), /Unsupported area unit/);
});

test("rejects invalid length units", () => {
  assert.throws(() => builder.normalizeLength(5, "M"), /Unsupported length unit/);
});

test("rejects negative counts", () => {
  assert.throws(() => builder.normalizeCount(-1), /non-negative/);
});

test("preserves evidence traceability", () => {
  const model = builder.buildPropertyModel([
    interpretation("TRUCK_COURT", { value: 185, unit: "FT" }, {
      text: "185' truck court",
      startOffset: 100,
      endOffset: 116
    })
  ]);
  assert.strictEqual(model.evidence[0].text, "185' truck court");
  assert.strictEqual(model.evidence[0].startOffset, 100);
  assert.strictEqual(model.evidence[0].endOffset, 116);
});

test("produces stable evidence ordering", () => {
  const model = builder.buildPropertyModel([
    interpretation("POWER", { amps: 4000 }),
    interpretation("BUILDING_AREA", { value: 100000, unit: "SF" }),
    interpretation("CLEAR_HEIGHT", { value: 36, unit: "FT" })
  ]);
  assert.deepStrictEqual(
    model.evidence.map(item => item.concept),
    ["BUILDING_AREA", "CLEAR_HEIGHT", "POWER"]
  );
});

test("produces stable resolved concept ordering", () => {
  const model = builder.buildPropertyModel([
    interpretation("TRAILER_PARKING", 20),
    interpretation("AUTO_PARKING", 100),
    interpretation("DOCK_HIGH", 10)
  ]);
  assert.deepStrictEqual(
    model.governance.resolvedConcepts,
    ["AUTO_PARKING", "DOCK_HIGH", "TRAILER_PARKING"]
  );
});

test("output is deeply immutable", () => {
  const model = builder.buildPropertyModel([
    interpretation("CLEAR_HEIGHT", { value: 36, unit: "FT" })
  ]);
  assert.strictEqual(Object.isFrozen(model), true);
  assert.strictEqual(Object.isFrozen(model.asset), true);
  assert.strictEqual(Object.isFrozen(model.asset.physical.clearHeight), true);
});

test("governance keeps parser authoritative", () => {
  const model = builder.buildPropertyModel([]);
  assert.strictEqual(model.governance.existingParserAuthoritative, true);
  assert.strictEqual(model.governance.productionWrites, 0);
  assert.strictEqual(model.governance.commitEnabled, false);
});

test("execution mode is diagnostic only", () => {
  const model = builder.buildPropertyModel([]);
  assert.strictEqual(model.executionMode, "DIAGNOSTIC_ONLY");
});

test("normalizes power structure", () => {
  const model = builder.buildPropertyModel([
    interpretation("POWER", { amps: 3999.6, voltage: "277/480V", phase: 3 })
  ]);
  assert.deepStrictEqual(model.asset.utilities.power, {
    amps: 4000,
    phase: 3,
    unit: "AMPS",
    voltage: "277/480V"
  });
});

test("normalizes boolean presence", () => {
  const model = builder.buildPropertyModel([
    interpretation("ESFR", "yes"),
    interpretation("SOLAR", "no")
  ]);
  assert.strictEqual(model.asset.fireProtection.esfr.present, true);
  assert.strictEqual(model.asset.energy.solar.present, false);
});

test("normalizes column spacing", () => {
  const model = builder.buildPropertyModel([
    interpretation("COLUMN_SPACING", { width: 50, depth: 52, unit: "FT" })
  ]);
  assert.strictEqual(model.asset.physical.columnSpacing.width.value, 50);
  assert.strictEqual(model.asset.physical.columnSpacing.depth.value, 52);
});

test("supports address identity", () => {
  const model = builder.buildPropertyModel([
    interpretation("ADDRESS", "2125 W Lowell St, Rialto, CA")
  ]);
  assert.strictEqual(model.asset.identity.address.formatted, "2125 W Lowell St, Rialto, CA");
});

test("supports yard normalization", () => {
  const model = builder.buildPropertyModel([
    interpretation("YARD", { value: 10, unit: "AC" })
  ]);
  assert.strictEqual(model.asset.site.yard.value, 435600);
});

test("conflict records discarded evidence", () => {
  const model = builder.buildPropertyModel([
    interpretation("AUTO_PARKING", 100, { confidence: 0.8 }),
    interpretation("AUTO_PARKING", 120, { confidence: 0.9 })
  ]);
  assert.strictEqual(model.conflicts[0].discarded.length, 1);
  assert.strictEqual(model.conflicts[0].discarded[0].resolution, "DISCARDED");
});

test("empty input produces valid governed model", () => {
  const model = builder.buildPropertyModel([]);
  assert.strictEqual(model.validation.valid, true);
  assert.deepStrictEqual(model.governance.resolvedConcepts, []);
});

test("source input is not mutated", () => {
  const input = [interpretation("CLEAR_HEIGHT", { value: 36, unit: "FT" })];
  const before = JSON.stringify(input);
  builder.buildPropertyModel(input);
  assert.strictEqual(JSON.stringify(input), before);
});

test("model serializes deterministically", () => {
  const input = [
    interpretation("POWER", { amps: 4000 }),
    interpretation("CLEAR_HEIGHT", { value: 36, unit: "FT" })
  ];
  const a = JSON.stringify(builder.buildPropertyModel(input));
  const b = JSON.stringify(builder.buildPropertyModel([...input].reverse()));
  assert.strictEqual(a, b);
});

const report = {
  framework: "SCIIP_ILE_SPRINT5_PROPERTY_MODEL_BUILDER_CERTIFICATION",
  version: "ile-v1.0.0-sprint5.0",
  status: failures.length === 0 ? "PASSED" : "FAILED",
  testsRun,
  failures,
  result: {
    deterministicModelAssembly: failures.length === 0,
    canonicalSchemaValidation: failures.length === 0,
    duplicateConceptResolution: failures.length === 0,
    unitNormalization: failures.length === 0,
    requiredFieldValidation: failures.length === 0,
    stableOutputOrdering: failures.length === 0,
    deepImmutability: failures.length === 0,
    executionMode: "DIAGNOSTIC_ONLY",
    productionWrites: 0,
    commitEnabled: false,
    existingParserAuthoritative: true
  }
};

console.log(JSON.stringify(report));
process.exitCode = failures.length === 0 ? 0 : 1;
