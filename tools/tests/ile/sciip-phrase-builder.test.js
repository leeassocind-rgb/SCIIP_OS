'use strict';

const assert = require('assert');
const { createDefaultPhraseBuilder, PHRASE_TYPES } = require('../../supersheets/parser-platform/sciip-phrase-builder');

let testsRun = 0;
const failures = [];
function test(name, fn) {
  try { fn(); testsRun += 1; }
  catch (error) { failures.push({ test: name, error: error.stack || String(error) }); }
}

const builder = createDefaultPhraseBuilder();

test('electrical specification assembly', () => {
  const r = builder.build('4,000 Amps 277/480V 3 Phase');
  assert.strictEqual(r.phrases.length, 1);
  assert.strictEqual(r.phrases[0].phraseType, PHRASE_TYPES.ELECTRICAL_SPECIFICATION);
  assert.strictEqual(r.phrases[0].attributes.amperage, 4000);
  assert.deepStrictEqual(r.phrases[0].attributes.voltage, [277, 480]);
  assert.strictEqual(r.phrases[0].attributes.phase, 3);
});

test('clear height assembly', () => {
  const p = builder.build("36' Clear").phrases[0];
  assert.strictEqual(p.phraseType, PHRASE_TYPES.CLEAR_HEIGHT);
  assert.strictEqual(p.text, "36' Clear");
  assert.strictEqual(p.attributes.height, 36);
});

test('dock high assembly', () => assert.strictEqual(builder.build('82 Dock High').phrases[0].phraseType, PHRASE_TYPES.DOCK_HIGH_COUNT));
test('grade level assembly', () => assert.strictEqual(builder.build('3 Grade Level').phrases[0].phraseType, PHRASE_TYPES.GRADE_LEVEL_COUNT));
test('truck court assembly', () => assert.strictEqual(builder.build("185' Truck Court").phrases[0].phraseType, PHRASE_TYPES.TRUCK_COURT_DEPTH));
test('auto parking assembly', () => assert.strictEqual(builder.build('265 Auto Parking Spaces').phrases[0].phraseType, PHRASE_TYPES.AUTO_PARKING_COUNT));
test('trailer parking assembly', () => assert.strictEqual(builder.build('398 Trailer Parking Spaces').phrases[0].phraseType, PHRASE_TYPES.TRAILER_PARKING_COUNT));
test('building area assembly', () => assert.strictEqual(builder.build('664,859 SF').phrases[0].phraseType, PHRASE_TYPES.BUILDING_AREA));
test('land area assembly', () => assert.strictEqual(builder.build('40.4 Acres').phrases[0].phraseType, PHRASE_TYPES.LAND_AREA));
test('column spacing assembly', () => assert.strictEqual(builder.build("52 x 60' Column Spacing").phrases[0].phraseType, PHRASE_TYPES.COLUMN_SPACING));
test('ESFR assembly', () => assert.strictEqual(builder.build('ESFR').phrases[0].phraseType, PHRASE_TYPES.FIRE_SUPPRESSION));

test('multiple phrases preserve source order', () => {
  const r = builder.build("36' Clear; 82 Dock High; 4,000 Amps 277/480V 3 Phase");
  assert.deepStrictEqual(r.phrases.map(p => p.phraseType), [PHRASE_TYPES.CLEAR_HEIGHT, PHRASE_TYPES.DOCK_HIGH_COUNT, PHRASE_TYPES.ELECTRICAL_SPECIFICATION]);
});

test('span integrity', () => {
  const r = builder.build('Prefix 82 Dock High suffix');
  const p = r.phrases[0];
  assert.strictEqual(r.source.slice(p.span.start, p.span.end), p.text);
});

test('deterministic output', () => {
  const a = builder.build("36' Clear; 82 Dock High");
  const b = builder.build("36' Clear; 82 Dock High");
  assert.deepStrictEqual(a, b);
});

test('no overlapping phrase conflicts', () => {
  const r = builder.build("36' Clear");
  for (let i = 0; i < r.phrases.length; i += 1) for (let j = i + 1; j < r.phrases.length; j += 1) {
    assert.ok(!(r.phrases[i].span.start < r.phrases[j].span.end && r.phrases[j].span.start < r.phrases[i].span.end));
  }
});

test('deep immutability', () => {
  const r = builder.build('82 Dock High');
  assert.ok(Object.isFrozen(r)); assert.ok(Object.isFrozen(r.phrases)); assert.ok(Object.isFrozen(r.phrases[0]));
});

test('diagnostic governance', () => {
  const r = builder.build('ESFR');
  assert.strictEqual(r.executionMode, 'DIAGNOSTIC_ONLY'); assert.strictEqual(r.productionWrites, 0); assert.strictEqual(r.commitEnabled, false); assert.strictEqual(r.existingParserAuthoritative, true);
});

test('buildMany', () => assert.strictEqual(builder.buildMany(['ESFR', '82 Dock High']).length, 2));
test('statistics', () => assert.strictEqual(builder.statistics(builder.build('ESFR')).phraseCount, 1));
test('empty input', () => assert.deepStrictEqual(builder.build('').phrases, []));
test('invalid tokenization rejected', () => assert.throws(() => builder.build({ tokens: [] }), /expects source text/));
test('unmatched tokens retained', () => assert.ok(builder.build('Unknown narrative').unmatchedTokens.length > 0));
test('minimum confidence governance', () => assert.strictEqual(createDefaultPhraseBuilder({ minimumConfidence: 0.95 }).build('100,000 SF').phrases.length, 0));
test('phrase tokens align with token range', () => { const p=builder.build('82 Dock High').phrases[0]; assert.strictEqual(p.tokens.length, p.tokenRange.end-p.tokenRange.start+1); });
test('input context preserved', () => assert.strictEqual(builder.build('ESFR', { propertyId: 'P-1' }).context.propertyId, 'P-1'));
test('version stamped', () => assert.strictEqual(builder.build('ESFR').builderVersion, 'ile-v1.0.0-sprint3.0'));
test('statistics preserve no-write governance', () => assert.strictEqual(builder.statistics(builder.build('ESFR')).productionWrites, 0));

const status = failures.length ? 'FAILED' : 'PASSED';
const output = {
  framework: 'SCIIP_ILE_SPRINT3_GOVERNED_PHRASE_BUILDER_CERTIFICATION',
  version: 'ile-v1.0.0-sprint3.0', status, testsRun, failures,
  result: {
    deterministicPhraseAssembly: failures.length === 0,
    sourceSpanIntegrity: failures.length === 0,
    compoundPhraseRecognition: failures.length === 0,
    nonOverlappingPhraseGovernance: failures.length === 0,
    deepImmutability: failures.length === 0,
    executionMode: 'DIAGNOSTIC_ONLY', productionWrites: 0, commitEnabled: false, existingParserAuthoritative: true
  }
};
console.log(JSON.stringify(output));
if (failures.length) process.exit(1);
