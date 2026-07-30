'use strict';

const assert = require('assert');
const {
  SCIIPSemanticInterpreter,
  SemanticInterpreterConfigurationError,
  INTERPRETATION_STATUS,
  createDefaultSemanticInterpreter
} = require('../../supersheets/parser-platform/sciip-semantic-interpreter');
const { createDefaultOntology } = require('../../supersheets/parser-platform/sciip-language-ontology');

let testsRun = 0;
const failures = [];
function test(name, fn) {
  testsRun += 1;
  try { fn(); } catch (error) { failures.push({ test: name, error: error.stack || String(error) }); }
}

const interpreter = createDefaultSemanticInterpreter();

test('interprets power', () => {
  const r = interpreter.interpret('4,000 Amps 277/480V 3 Phase');
  assert.strictEqual(r.interpretations[0].concept.id, 'POWER');
  assert.strictEqual(r.interpretations[0].value.primary, 4000);
});
test('interprets clear height', () => assert.strictEqual(interpreter.interpret("36' Clear").interpretations[0].concept.id, 'CLEAR_HEIGHT'));
test('interprets dock high count', () => assert.strictEqual(interpreter.interpret('82 Dock High').interpretations[0].concept.id, 'DOCK_HIGH'));
test('interprets grade level count', () => assert.strictEqual(interpreter.interpret('3 Grade Level').interpretations[0].concept.id, 'GRADE_LEVEL'));
test('interprets truck court', () => assert.strictEqual(interpreter.interpret("185' Truck Court").interpretations[0].concept.id, 'TRUCK_COURT'));
test('interprets auto parking', () => assert.strictEqual(interpreter.interpret('265 Auto Parking').interpretations[0].concept.id, 'AUTO_PARKING'));
test('interprets trailer parking', () => assert.strictEqual(interpreter.interpret('398 Trailer Parking').interpretations[0].concept.id, 'TRAILER_PARKING'));
test('interprets building area', () => assert.strictEqual(interpreter.interpret('664,859 SF Building').interpretations[0].concept.id, 'BUILDING_AREA'));
test('interprets land area', () => assert.strictEqual(interpreter.interpret('40 Acres Land').interpretations[0].concept.id, 'LAND_AREA'));
test('interprets column spacing', () => assert.strictEqual(interpreter.interpret("52 x 60' Column Spacing").interpretations[0].concept.id, 'COLUMN_SPACING'));
test('interprets ESFR specifically', () => assert.strictEqual(interpreter.interpret('ESFR').interpretations[0].concept.id, 'ESFR'));
test('interprets sprinkler specifically', () => assert.strictEqual(interpreter.interpret('Sprinkler').interpretations[0].concept.id, 'SPRINKLER'));
test('maps multiple phrases deterministically', () => {
  const text = "664,859 SF Building; 42' Clear; 82 Dock High; 4,000 Amps";
  assert.deepStrictEqual(interpreter.interpret(text), interpreter.interpret(text));
});
test('preserves source spans', () => {
  const text = "Power: 4,000 Amps 277/480V 3 Phase";
  const i = interpreter.interpret(text).interpretations[0];
  assert.strictEqual(text.slice(i.evidence.span.start, i.evidence.span.end), i.evidence.sourceText);
});
test('provides token evidence', () => assert.ok(interpreter.interpret("36' Clear").interpretations[0].evidence.tokens.length >= 2));
test('provides explainable reasoning', () => assert.ok(interpreter.interpret('82 Dock High').interpretations[0].reasoning.length >= 4));
test('validates ontology mapping', () => assert.strictEqual(interpreter.interpret('ESFR').interpretations[0].governance.ontologyValidated, true));
test('marks deterministic mapping', () => assert.strictEqual(interpreter.interpret('ESFR').interpretations[0].governance.deterministicMapping, true));
test('disables production writes', () => assert.strictEqual(interpreter.interpret('ESFR').productionWrites, 0));
test('disables commits', () => assert.strictEqual(interpreter.interpret('ESFR').commitEnabled, false));
test('keeps parser authoritative', () => assert.strictEqual(interpreter.interpret('ESFR').existingParserAuthoritative, true));
test('runs diagnostic only', () => assert.strictEqual(interpreter.interpret('ESFR').executionMode, 'DIAGNOSTIC_ONLY'));
test('deep freezes result', () => {
  const r = interpreter.interpret('ESFR');
  assert.ok(Object.isFrozen(r)); assert.ok(Object.isFrozen(r.interpretations)); assert.ok(Object.isFrozen(r.interpretations[0]));
});
test('supports phrase-builder result input', () => {
  const built = interpreter._phraseBuilder.build('82 Dock High');
  assert.strictEqual(interpreter.interpret(built).interpretations[0].concept.id, 'DOCK_HIGH');
});
test('supports batch interpretation', () => assert.strictEqual(interpreter.interpretMany(['ESFR', "36' Clear"]).length, 2));
test('returns governed statistics', () => {
  const s = interpreter.statistics(interpreter.interpret("36' Clear; ESFR"));
  assert.strictEqual(s.interpretationCount, 2); assert.strictEqual(s.productionWrites, 0);
});
test('rejects invalid input', () => assert.throws(() => interpreter.interpret({}), TypeError));
test('rejects invalid phrase builder', () => assert.throws(() => new SCIIPSemanticInterpreter({ phraseBuilder: {} }), SemanticInterpreterConfigurationError));
test('rejects invalid ontology', () => assert.throws(() => new SCIIPSemanticInterpreter({ ontology: {} }), SemanticInterpreterConfigurationError));
test('rejects unknown custom mapping', () => assert.throws(() => new SCIIPSemanticInterpreter({ ontology: createDefaultOntology(), phraseConceptMap: { ELECTRICAL_SPECIFICATION: 'MISSING' } }), SemanticInterpreterConfigurationError));
test('confidence is bounded', () => {
  const c = interpreter.interpret('4,000 Amps 277/480V 3 Phase').interpretations[0].confidence;
  assert.ok(c >= 0 && c <= 1);
});
test('semantic value retains attributes', () => assert.strictEqual(interpreter.interpret('82 Dock High').interpretations[0].value.attributes.count, 82));

const output = {
  framework: 'SCIIP_ILE_SPRINT4_SEMANTIC_INTERPRETER_CERTIFICATION',
  version: 'ile-v1.0.0-sprint4.0',
  status: failures.length ? 'FAILED' : 'PASSED',
  testsRun,
  failures,
  result: {
    deterministicConceptMapping: failures.length === 0,
    explainableReasoning: failures.length === 0,
    evidenceTraceability: failures.length === 0,
    ontologyValidation: failures.length === 0,
    confidenceConsistency: failures.length === 0,
    deepImmutability: failures.length === 0,
    executionMode: 'DIAGNOSTIC_ONLY',
    productionWrites: 0,
    commitEnabled: false,
    existingParserAuthoritative: true
  }
};
console.log(JSON.stringify(output));
if (failures.length) process.exit(1);
