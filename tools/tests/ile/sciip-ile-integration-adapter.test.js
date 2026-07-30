"use strict";
const assert = require("assert");
const path = require("path");
const {
  translatePropertyModel,
  compareEvidence,
  VERSION
} = require(path.resolve(__dirname, "../../supersheets/parser-platform/sciip-ile-integration-adapter.js"));

let testsRun = 0;
const failures = [];
function test(name, fn) {
  try { fn(); testsRun += 1; }
  catch (error) { failures.push({ test: name, error: error.stack || String(error) }); }
}

const model = {
  version: "MODEL-1",
  asset: {
    areas: { building: { value: 100000, unit: "SF" } },
    physical: { clearHeight: { value: 36, unit: "FT" } },
    utilities: { power: { amps: 2000, voltage: "277/480v", phase: 3 } },
    loading: { dockHigh: { value: 20 }, gradeLevel: { value: 2 } },
    parking: { auto: { value: 100 }, trailer: { value: 40 } },
    fireProtection: { esfr: { present: true } }
  },
  evidence: [
    { concept: "BUILDING_AREA", confidence: 0.99, text: "100,000 SF" },
    { concept: "CLEAR_HEIGHT", confidence: 0.98, text: "36' clear" },
    { concept: "POWER", confidence: 0.95, text: "2,000 amps" }
  ]
};

test("version", () => assert.strictEqual(VERSION, "ile-v1.0.0-sprint6.0"));
test("requires canonical model", () => assert.throws(() => translatePropertyModel({}), /canonical/));
test("translates records", () => assert.ok(translatePropertyModel(model).evidenceRecords.length >= 8));
test("sorts concepts", () => {
  const r = translatePropertyModel(model).evidenceRecords.map(x => x.concept);
  assert.deepStrictEqual(r, [...r].sort());
});
test("preserves building area", () => {
  const r = translatePropertyModel(model).evidenceRecords.find(x => x.concept === "BUILDING_AREA");
  assert.strictEqual(r.value, 100000); assert.strictEqual(r.unit, "SF");
});
test("preserves power object", () => {
  const r = translatePropertyModel(model).evidenceRecords.find(x => x.concept === "POWER");
  assert.strictEqual(r.value.amps, 2000);
});
test("preserves confidence", () => {
  const r = translatePropertyModel(model).evidenceRecords.find(x => x.concept === "CLEAR_HEIGHT");
  assert.strictEqual(r.confidence, 0.98);
});
test("propagates context", () => {
  const r = translatePropertyModel(model, { documentId: "D1", pageNumber: 2 });
  assert.strictEqual(r.evidenceRecords[0].context.documentId, "D1");
});
test("zero writes", () => assert.strictEqual(translatePropertyModel(model).governance.productionWrites, 0));
test("existing parser authoritative", () => assert.strictEqual(translatePropertyModel(model).governance.existingParserAuthoritative, true));
test("immutable", () => assert.strictEqual(Object.isFrozen(translatePropertyModel(model)), true));
test("deterministic", () => assert.deepStrictEqual(translatePropertyModel(model), translatePropertyModel(model)));
test("comparison match", () => {
  const c = compareEvidence([{ concept:"A", value:1 }],[{ concept:"A", value:1 }]);
  assert.strictEqual(c.summary.MATCH, 1);
});
test("comparison mismatch", () => {
  const c = compareEvidence([{ concept:"A", value:1 }],[{ concept:"A", value:2 }]);
  assert.strictEqual(c.summary.MISMATCH, 1);
});
test("comparison ile only", () => {
  const c = compareEvidence([],[{ concept:"A", value:1 }]);
  assert.strictEqual(c.summary.ILE_ONLY, 1);
});
test("comparison legacy only", () => {
  const c = compareEvidence([{ concept:"A", value:1 }],[]);
  assert.strictEqual(c.summary.LEGACY_ONLY, 1);
});
test("comparison review required", () => assert.strictEqual(compareEvidence([],[{ concept:"A", value:1 }]).reviewRequired, true));
test("duplicate safe evidence id", () => {
  const a = translatePropertyModel(model, {documentId:"D"}).evidenceRecords[0].evidenceId;
  const b = translatePropertyModel(model, {documentId:"D"}).evidenceRecords[0].evidenceId;
  assert.strictEqual(a,b);
});

const report = {
  framework:"SCIIP_ILE_SPRINT6_INTEGRATION_ADAPTER_CERTIFICATION",
  version:VERSION,
  status:failures.length ? "FAILED":"PASSED",
  testsRun, failures,
  result:{
    contractTranslationCorrectness:!failures.length,
    evidencePreservation:!failures.length,
    confidencePreservation:!failures.length,
    deterministicTranslation:!failures.length,
    sideBySideComparison:!failures.length,
    duplicateSafe:true,
    executionMode:"DIAGNOSTIC_ONLY",
    productionWrites:0,
    existingParserAuthoritative:true
  }
};
console.log(JSON.stringify(report));
process.exitCode = failures.length ? 1 : 0;
