"use strict";

const assert = require("assert");
const path = require("path");

const {
  createDefaultILEPipeline,
  adaptInterpretation,
  adaptInterpretations,
  PIPELINE_VERSION
} = require(path.resolve(
  __dirname,
  "../../supersheets/parser-platform/sciip-ile-pipeline.js"
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

const STANDARD =
  "664,859 SF building, 42' clear, 82 dock high doors, 4 grade level doors, " +
  "4,000 amps 277/480V 3 phase, 185' truck court, 265 auto spaces, " +
  "398 trailer stalls, ESFR sprinklered";

test("exports governed pipeline version", () => {
  assert.strictEqual(PIPELINE_VERSION, "ile-v1.0.0-sprint5a.0");
});

test("creates default pipeline", () => {
  const pipeline = createDefaultILEPipeline();
  assert.strictEqual(typeof pipeline.run, "function");
});

test("runs standard warehouse text end to end", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.strictEqual(result.certification.contractCompatibility, true);
  assert.strictEqual(
    result.stages.propertyModel.asset.areas.building.value,
    664859
  );
});

test("produces clear height", () => {
  const model = createDefaultILEPipeline().run(STANDARD).stages.propertyModel;
  assert.strictEqual(model.asset.physical.clearHeight.value, 42);
});

test("produces dock-high count", () => {
  const model = createDefaultILEPipeline().run(STANDARD).stages.propertyModel;
  assert.strictEqual(model.asset.loading.dockHigh.value, 82);
});

test("produces grade-level count", () => {
  const model = createDefaultILEPipeline().run(STANDARD).stages.propertyModel;
  assert.strictEqual(model.asset.loading.gradeLevel.value, 4);
});

test("produces governed power structure", () => {
  const power =
    createDefaultILEPipeline().run(STANDARD).stages.propertyModel.asset
      .utilities.power;
  assert.strictEqual(power.amps, 4000);
  assert.strictEqual(power.voltage, "277/480v");
  assert.strictEqual(power.phase, 3);
});

test("produces truck court depth", () => {
  const model = createDefaultILEPipeline().run(STANDARD).stages.propertyModel;
  assert.strictEqual(model.asset.loading.truckCourt.value, 185);
});

test("produces auto parking count", () => {
  const model = createDefaultILEPipeline().run(STANDARD).stages.propertyModel;
  assert.strictEqual(model.asset.parking.auto.value, 265);
});

test("produces trailer parking count", () => {
  const model = createDefaultILEPipeline().run(STANDARD).stages.propertyModel;
  assert.strictEqual(model.asset.parking.trailer.value, 398);
});

test("produces ESFR presence", () => {
  const model = createDefaultILEPipeline().run(STANDARD).stages.propertyModel;
  assert.strictEqual(model.asset.fireProtection.esfr.present, true);
});

test("preserves source text", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.strictEqual(result.source, STANDARD);
  assert.strictEqual(result.stages.tokenResult.source, STANDARD);
});

test("preserves evidence spans", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.strictEqual(result.certification.evidencePreserved, true);
});

test("generates four contract records", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.strictEqual(result.contracts.length, 4);
});

test("uses diagnostic-only execution", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.strictEqual(result.executionMode, "DIAGNOSTIC_ONLY");
});

test("keeps existing parser authoritative", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.strictEqual(result.certification.existingParserAuthoritative, true);
});

test("performs zero production writes", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.strictEqual(result.certification.productionWrites, 0);
  assert.strictEqual(result.certification.commitEnabled, false);
});

test("returns deeply immutable result", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.strictEqual(Object.isFrozen(result), true);
  assert.strictEqual(Object.isFrozen(result.stages), true);
  assert.strictEqual(Object.isFrozen(result.stages.propertyModel), true);
});

test("is deterministic for identical input", () => {
  const pipeline = createDefaultILEPipeline();
  assert.deepStrictEqual(pipeline.run(STANDARD), pipeline.run(STANDARD));
});

test("supports empty input", () => {
  const result = createDefaultILEPipeline().run("");
  assert.strictEqual(result.stages.propertyModel.validation.valid, true);
  assert.strictEqual(
    result.stages.propertyModel.governance.resolvedConcepts.length,
    0
  );
});

test("supports null input as empty text", () => {
  const result = createDefaultILEPipeline().run(null);
  assert.strictEqual(result.source, "");
});

test("supports runMany", () => {
  const results = createDefaultILEPipeline().runMany([
    "100,000 SF building",
    "36' clear"
  ]);
  assert.strictEqual(results.length, 2);
  assert.strictEqual(results[0].context.inputIndex, 0);
  assert.strictEqual(results[1].context.inputIndex, 1);
});

test("runMany rejects non-array input", () => {
  assert.throws(
    () => createDefaultILEPipeline().runMany("bad"),
    /expects an array/
  );
});

test("propagates context", () => {
  const result = createDefaultILEPipeline().run("36' clear", {
    documentId: "DOC-1",
    pageNumber: 4
  });
  assert.strictEqual(result.context.documentId, "DOC-1");
  assert.strictEqual(result.context.pageNumber, 4);
});

test("adapts interpreter concept object", () => {
  const adapted = adaptInterpretation({
    status: "INTERPRETED",
    concept: { id: "CLEAR_HEIGHT", valueType: "LENGTH" },
    value: {
      primary: 36,
      attributes: { height: 36, unit: "ft" }
    },
    confidence: 1,
    evidence: {
      sourceText: "36' clear",
      span: { start: 0, end: 9 }
    },
    reasoning: ["test"]
  });
  assert.strictEqual(adapted.concept, "CLEAR_HEIGHT");
  assert.deepStrictEqual(adapted.semanticValue, { value: 36, unit: "ft" });
});

test("adapts power payload", () => {
  const adapted = adaptInterpretation({
    concept: { id: "POWER" },
    value: {
      primary: 4000,
      attributes: {
        amperage: 4000,
        voltage: "277/480v",
        phase: 3
      }
    },
    confidence: 1,
    evidence: { sourceText: "power", span: { start: 0, end: 5 } }
  });
  assert.strictEqual(adapted.semanticValue.amps, 4000);
  assert.strictEqual(adapted.semanticValue.phase, 3);
});

test("rejects malformed interpreter result", () => {
  assert.throws(() => adaptInterpretations({}), /valid semantic interpreter/);
});

test("required-concept validation propagates", () => {
  const result = createDefaultILEPipeline({
    options: { requiredConcepts: ["POWER", "CLEAR_HEIGHT"] }
  }).run("36' clear");
  assert.strictEqual(result.stages.propertyModel.validation.valid, false);
  assert.deepStrictEqual(
    result.stages.propertyModel.validation.errors,
    ["Missing required concept: POWER"]
  );
});

test("fail-closed validation propagates", () => {
  const pipeline = createDefaultILEPipeline({
    options: {
      requiredConcepts: ["POWER"],
      failOnValidationError: true
    }
  });
  assert.throws(
    () => pipeline.run("36' clear"),
    /Property model validation failed/
  );
});

test("unknown text remains non-destructive", () => {
  const result = createDefaultILEPipeline().run(
    "Beautiful architecture with premium finishes"
  );
  assert.strictEqual(
    result.stages.propertyModel.governance.resolvedConcepts.length,
    0
  );
  assert.strictEqual(result.certification.productionWrites, 0);
});

test("duplicate concepts resolve deterministically", () => {
  const result = createDefaultILEPipeline().run(
    "32' clear and 36' clear"
  );
  const model = result.stages.propertyModel;
  assert.strictEqual(model.asset.physical.clearHeight.value, 32);
  assert.strictEqual(model.conflicts.length, 1);
});

test("mixed area units normalize", () => {
  const result = createDefaultILEPipeline().run(
    "2 acres land and 50,000 SF building"
  );
  const model = result.stages.propertyModel;
  assert.strictEqual(model.asset.areas.land.value, 87120);
  assert.strictEqual(model.asset.areas.building.value, 50000);
});

test("column spacing flows end to end", () => {
  const result = createDefaultILEPipeline().run(
    "50 x 52 ft column spacing"
  );
  const spacing = result.stages.propertyModel.asset.physical.columnSpacing;
  assert.strictEqual(spacing.width.value, 50);
  assert.strictEqual(spacing.depth.value, 52);
});

test("unmapped phrase information remains available", () => {
  const result = createDefaultILEPipeline().run("ESFR and unusual feature");
  assert.ok(Array.isArray(result.stages.interpreterResult.unmapped));
});

test("model serializes stably", () => {
  const pipeline = createDefaultILEPipeline();
  const first = JSON.stringify(pipeline.run(STANDARD));
  const second = JSON.stringify(pipeline.run(STANDARD));
  assert.strictEqual(first, second);
});

test("input text is not mutated", () => {
  const source = new String(STANDARD);
  const before = source.toString();
  createDefaultILEPipeline().run(source);
  assert.strictEqual(source.toString(), before);
});

test("contract stage names remain stable", () => {
  const result = createDefaultILEPipeline().run(STANDARD);
  assert.deepStrictEqual(
    result.contracts.map(contract => contract.name),
    [
      "TEXT_TO_TOKENS",
      "TOKENS_TO_PHRASES",
      "PHRASES_TO_INTERPRETATIONS",
      "INTERPRETATIONS_TO_PROPERTY_MODEL"
    ]
  );
});

const report = {
  framework: "SCIIP_ILE_SPRINT5A_END_TO_END_PIPELINE_CERTIFICATION",
  version: PIPELINE_VERSION,
  status: failures.length === 0 ? "PASSED" : "FAILED",
  testsRun,
  failures,
  result: {
    endToEndContractCompatibility: failures.length === 0,
    deterministicOutput: failures.length === 0,
    canonicalPropertyModelGeneration: failures.length === 0,
    evidencePreservation: failures.length === 0,
    stableOrdering: failures.length === 0,
    duplicateResolution: failures.length === 0,
    validationPropagation: failures.length === 0,
    contextPropagation: failures.length === 0,
    executionMode: "DIAGNOSTIC_ONLY",
    productionWrites: 0,
    commitEnabled: false,
    existingParserAuthoritative: true
  }
};

console.log(JSON.stringify(report));
process.exitCode = failures.length === 0 ? 0 : 1;
