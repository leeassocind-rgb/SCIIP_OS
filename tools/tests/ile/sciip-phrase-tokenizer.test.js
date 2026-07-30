'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { createDefaultTokenizer, SCIIPPhraseTokenizer, TOKEN_TYPES, canonicalUnit, parseNumber } = require('../../supersheets/parser-platform/sciip-phrase-tokenizer');

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

function tokenOf(result, type) { return result.tokens.find(token => token.type === type); }

test('exports token types', () => assert.strictEqual(TOKEN_TYPES.VOLTAGE, 'VOLTAGE'));
test('parses comma number', () => assert.strictEqual(parseNumber('4,000'), 4000));
test('normalizes amp unit', () => assert.strictEqual(canonicalUnit('AMP'), 'amps'));
test('empty input is deterministic', () => assert.deepStrictEqual(createDefaultTokenizer().tokenize('').tokens, []));
test('tokenizes power number and unit', () => {
  const result = createDefaultTokenizer().tokenize('4,000 Amps');
  assert.strictEqual(result.tokens[0].type, TOKEN_TYPES.NUMBER);
  assert.strictEqual(result.tokens[0].value, 4000);
  assert.strictEqual(result.tokens[0].unit, 'amps');
});
test('recognizes voltage', () => {
  const token = tokenOf(createDefaultTokenizer().tokenize('277/480V'), TOKEN_TYPES.VOLTAGE);
  assert.deepStrictEqual(token.value, [277, 480]);
});
test('recognizes phase', () => assert.strictEqual(tokenOf(createDefaultTokenizer().tokenize('3 Phase'), TOKEN_TYPES.PHASE).value, 3));
test('recognizes percent', () => assert.strictEqual(tokenOf(createDefaultTokenizer().tokenize('5% Office'), TOKEN_TYPES.PERCENT).value, 5));
test('recognizes area sf', () => {
  const token = tokenOf(createDefaultTokenizer().tokenize('664,859 SF Building'), TOKEN_TYPES.AREA);
  assert.strictEqual(token.value, 664859);
  assert.strictEqual(token.unit, 'sf');
});
test('recognizes acreage', () => assert.strictEqual(tokenOf(createDefaultTokenizer().tokenize('38.2 Acres'), TOKEN_TYPES.AREA).unit, 'acres'));
test('recognizes dimension pair', () => assert.deepStrictEqual(tokenOf(createDefaultTokenizer().tokenize('52 x 60 ft'), TOKEN_TYPES.DIMENSION).value, [52, 60]));
test('preserves exact source span', () => {
  const result = createDefaultTokenizer().tokenize('Power: 4,000 Amps');
  const token = result.tokens.find(item => item.unit === 'amps');
  assert.strictEqual(result.source.slice(token.span.start, token.span.end), token.raw);
});
test('words are normalized', () => assert.strictEqual(createDefaultTokenizer().tokenize('CLEAR').tokens[0].normalized, 'clear'));
test('punctuation can be excluded', () => {
  const tokenizer = new SCIIPPhraseTokenizer({ includePunctuation: false });
  assert.ok(!tokenizer.tokenize('Power: 4000 Amps').tokens.some(t => t.type === TOKEN_TYPES.SYMBOL));
});
test('compound recognition can be disabled', () => {
  const tokenizer = new SCIIPPhraseTokenizer({ recognizeCompounds: false });
  assert.strictEqual(tokenizer.tokenize('4000 Amps').tokens.length, 2);
});
test('tokenizeMany preserves input index', () => {
  const results = createDefaultTokenizer().tokenizeMany(['36 ft', '40 ft']);
  assert.strictEqual(results[1].context.inputIndex, 1);
});
test('tokenizeMany rejects non-array', () => assert.throws(() => createDefaultTokenizer().tokenizeMany('x'), TypeError));
test('result is deeply immutable', () => {
  const result = createDefaultTokenizer().tokenize('4000 Amps');
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.tokens));
  assert.ok(Object.isFrozen(result.tokens[0]));
  assert.ok(Object.isFrozen(result.tokens[0].span));
});
test('statistics are deterministic', () => {
  const tokenizer = createDefaultTokenizer();
  const a = tokenizer.statistics(tokenizer.tokenize('4000 Amps 3 Phase'));
  const b = tokenizer.statistics(tokenizer.tokenize('4000 Amps 3 Phase'));
  assert.deepStrictEqual(a, b);
});
test('diagnostic safeguards remain enabled', () => {
  const result = createDefaultTokenizer().tokenize('ESFR');
  assert.strictEqual(result.executionMode, 'DIAGNOSTIC_ONLY');
  assert.strictEqual(result.productionWrites, 0);
  assert.strictEqual(result.commitEnabled, false);
});
test('representative industrial sentence tokenizes', () => {
  const result = createDefaultTokenizer().tokenize("664,859 SF | 42' Clear | 82 Dock High | 4,000 Amps 277/480V 3 Phase");
  assert.ok(result.tokens.some(t => t.type === TOKEN_TYPES.AREA));
  assert.ok(result.tokens.some(t => t.type === TOKEN_TYPES.VOLTAGE));
  assert.ok(result.tokens.some(t => t.type === TOKEN_TYPES.PHASE));
});
test('unicode multiplication sign tokenizes dimension', () => assert.deepStrictEqual(tokenOf(createDefaultTokenizer().tokenize('50 × 52 ft'), TOKEN_TYPES.DIMENSION).value, [50, 52]));
test('decimal values are preserved', () => assert.strictEqual(tokenOf(createDefaultTokenizer().tokenize('12.5 Acres'), TOKEN_TYPES.AREA).value, 12.5));
test('context is preserved and frozen', () => {
  const result = createDefaultTokenizer().tokenize('ESFR', { documentId: 'DOC-1' });
  assert.strictEqual(result.context.documentId, 'DOC-1');
  assert.ok(Object.isFrozen(result.context));
});

let failures = [];
for (const item of tests) {
  try { item.fn(); } catch (error) { failures.push({ test: item.name, error: error.stack || error.message }); }
}
const report = {
  framework: 'SCIIP_ILE_SPRINT2_PHRASE_TOKENIZER_CERTIFICATION',
  version: 'ile-v1.0.0-sprint2.0',
  status: failures.length ? 'FAILED' : 'PASSED',
  testsRun: tests.length,
  failures,
  result: {
    deterministicTokenization: failures.length === 0,
    sourceSpanIntegrity: failures.length === 0,
    compoundRecognition: failures.length === 0,
    deepImmutability: failures.length === 0,
    executionMode: 'DIAGNOSTIC_ONLY',
    productionWrites: 0,
    commitEnabled: false,
    existingParserAuthoritative: true
  }
};

if (process.env.SCIIP_ILE_REPORT_PATH) {
  const output = path.resolve(process.env.SCIIP_ILE_REPORT_PATH);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify(report));
if (failures.length) process.exitCode = 1;
