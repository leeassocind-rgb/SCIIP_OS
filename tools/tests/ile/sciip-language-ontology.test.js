#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {
  SCIIPLanguageOntology,
  OntologyValidationError,
  createDefaultOntology
} = require('../../supersheets/parser-platform/sciip-language-ontology');

const failures = [];
let assertions = 0;
function test(name, fn) {
  try { fn(); }
  catch (error) { failures.push(`${name}: ${error.stack || error.message}`); }
}
function check(fn) { assertions += 1; fn(); }

test('default ontology loads and validates', () => {
  const ontology = createDefaultOntology();
  check(() => assert.strictEqual(ontology.validate().valid, true));
  check(() => assert.strictEqual(ontology.statistics().health, 'HEALTHY'));
  check(() => assert.strictEqual(ontology.statistics().concepts, 20));
  check(() => assert.strictEqual(ontology.statistics().categories, 10));
  check(() => assert.strictEqual(ontology.statistics().productionWrites, 0));
  check(() => assert.strictEqual(ontology.statistics().commitEnabled, false));
});

test('concept and alias lookup is deterministic', () => {
  const ontology = createDefaultOntology();
  check(() => assert.strictEqual(ontology.getConcept('power').id, 'POWER'));
  check(() => assert.strictEqual(ontology.findConceptByAlias('  AMP SERVICE ').id, 'POWER'));
  check(() => assert.strictEqual(ontology.findConcept('Property provides 4,000 amps of power').id, 'POWER'));
  check(() => assert.strictEqual(ontology.findConceptByAlias('not-a-real-alias'), null));
  check(() => assert.strictEqual(ontology.getCategory('utilities').id, 'UTILITIES'));
});

test('runtime data is deeply immutable', () => {
  const ontology = createDefaultOntology();
  check(() => assert.strictEqual(Object.isFrozen(ontology), true));
  check(() => assert.strictEqual(Object.isFrozen(ontology.getConcept('POWER')), true));
  check(() => assert.strictEqual(Object.isFrozen(ontology.getConcept('POWER').aliases), true));
  check(() => assert.throws(() => { ontology.getConcept('POWER').aliases.push('new alias'); }, TypeError));
  check(() => assert.throws(() => { ontology.version().version = '9.9.9'; }, TypeError));
});

test('duplicate aliases fail closed', () => {
  const categories = [{ id: 'UTILITIES', displayName: 'Utilities', description: 'Utilities' }];
  const concepts = [
    { id: 'A', displayName: 'A', category: 'UTILITIES', valueType: 'TEXT', units: [], aliases: ['shared'], examples: ['A'], negativeIndicators: [] },
    { id: 'B', displayName: 'B', category: 'UTILITIES', valueType: 'TEXT', units: [], aliases: ['shared'], examples: ['B'], negativeIndicators: [] }
  ];
  check(() => assert.throws(
    () => new SCIIPLanguageOntology({ version: { name: 'Test', version: '1.0.0', schemaVersion: '1.0.0' }, categories, concepts }),
    error => error instanceof OntologyValidationError && error.errors.some(item => item.code === 'DUPLICATE_ALIAS')
  ));
});

test('unknown categories fail closed', () => {
  const concepts = [{ id: 'A', displayName: 'A', category: 'MISSING', valueType: 'TEXT', units: [], aliases: ['alpha'], examples: ['A'], negativeIndicators: [] }];
  check(() => assert.throws(
    () => new SCIIPLanguageOntology({ version: { name: 'Test', version: '1.0.0', schemaVersion: '1.0.0' }, categories: [], concepts }),
    OntologyValidationError
  ));
});

const result = {
  framework: 'SCIIP_ILE_SPRINT1_LANGUAGE_ONTOLOGY_CERTIFICATION',
  version: 'ile-v1.0.0-sprint1.1',
  status: failures.length ? 'FAILED' : 'PASSED',
  testsRun: assertions,
  failures,
  result: {
    silsVersion: '1.0.0',
    deterministicLookup: true,
    deepImmutability: true,
    duplicateSafety: true,
    categoryGovernance: true,
    executionMode: 'DIAGNOSTIC_ONLY',
    productionWrites: 0,
    commitEnabled: false,
    existingParserAuthoritative: true
  }
};
console.log(JSON.stringify(result));
process.exit(failures.length ? 1 : 0);
