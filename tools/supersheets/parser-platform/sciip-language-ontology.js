'use strict';

const path = require('path');

class OntologyValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'OntologyValidationError';
    this.errors = Object.freeze(errors.map(error => Object.freeze({ ...error })));
  }
}

function normalizeKey(value) {
  return String(value == null ? '' : value).trim().toLowerCase().replace(/\s+/g, ' ');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadDefaultData() {
  const root = path.join(__dirname, 'sils');
  return {
    version: require(path.join(root, 'VERSION.json')),
    categories: require(path.join(root, 'categories.json')),
    concepts: require(path.join(root, 'concepts.json'))
  };
}

class SCIIPLanguageOntology {
  constructor(options = {}) {
    const defaults = options.version || options.categories || options.concepts ? {} : loadDefaultData();
    this._version = clone(options.version || defaults.version || {});
    this._categories = clone(options.categories || defaults.categories || []);
    this._concepts = clone(options.concepts || defaults.concepts || []);
    this._validation = this._validateData();
    if (!this._validation.valid) {
      throw new OntologyValidationError('SILS ontology validation failed.', this._validation.errors);
    }
    this._conceptIndex = new Map();
    this._aliasIndex = new Map();
    this._categoryIndex = new Map();
    this._buildIndexes();
    deepFreeze(this._version);
    deepFreeze(this._categories);
    deepFreeze(this._concepts);
    this._statistics = deepFreeze(this._buildStatistics());
    Object.freeze(this);
  }

  version() { return this._version; }
  concepts() { return this._concepts; }
  categories() { return this._categories; }
  statistics() { return this._statistics; }
  validate() { return this._validation; }

  getConcept(id) {
    const key = String(id == null ? '' : id).trim().toUpperCase();
    return this._conceptIndex.get(key) || null;
  }

  hasConcept(id) { return this.getConcept(id) !== null; }

  findConceptByAlias(alias) {
    return this._aliasIndex.get(normalizeKey(alias)) || null;
  }

  findConcept(input) {
    const exact = this.findConceptByAlias(input);
    if (exact) return exact;
    const normalized = normalizeKey(input);
    if (!normalized) return null;
    const matches = [];
    for (const [alias, concept] of this._aliasIndex.entries()) {
      if (normalized.includes(alias)) matches.push({ alias, concept });
    }
    matches.sort((a, b) => b.alias.length - a.alias.length || a.concept.id.localeCompare(b.concept.id));
    return matches.length ? matches[0].concept : null;
  }

  getAliases(id) {
    const concept = this.getConcept(id);
    return concept ? concept.aliases : Object.freeze([]);
  }

  getCategory(id) {
    const key = String(id == null ? '' : id).trim().toUpperCase();
    return this._categoryIndex.get(key) || null;
  }

  export() {
    return deepFreeze({
      version: clone(this._version),
      categories: clone(this._categories),
      concepts: clone(this._concepts),
      statistics: clone(this._statistics)
    });
  }

  _buildIndexes() {
    for (const category of this._categories) this._categoryIndex.set(category.id, category);
    for (const concept of this._concepts) {
      this._conceptIndex.set(concept.id, concept);
      for (const alias of concept.aliases) this._aliasIndex.set(normalizeKey(alias), concept);
    }
  }

  _buildStatistics() {
    const byCategory = {};
    const unitSet = new Set();
    let negativeIndicators = 0;
    for (const concept of this._concepts) {
      byCategory[concept.category] = (byCategory[concept.category] || 0) + 1;
      for (const unit of concept.units) unitSet.add(normalizeKey(unit));
      negativeIndicators += concept.negativeIndicators.length;
    }
    return {
      name: this._version.name,
      version: this._version.version,
      schemaVersion: this._version.schemaVersion,
      executionMode: this._version.executionMode,
      concepts: this._concepts.length,
      aliases: this._aliasIndex.size,
      categories: this._categories.length,
      units: unitSet.size,
      negativeIndicators,
      conceptsByCategory: byCategory,
      validationErrors: 0,
      health: 'HEALTHY',
      productionWrites: 0,
      commitEnabled: false
    };
  }

  _validateData() {
    const errors = [];
    const add = (code, message, pathValue) => errors.push({ code, message, path: pathValue || null });
    if (!this._version || typeof this._version !== 'object') add('VERSION_REQUIRED', 'VERSION metadata must be an object.', 'version');
    for (const key of ['name', 'version', 'schemaVersion']) {
      if (!this._version[key]) add('VERSION_FIELD_REQUIRED', `VERSION.${key} is required.`, `version.${key}`);
    }
    if (!Array.isArray(this._categories) || !this._categories.length) add('CATEGORIES_REQUIRED', 'At least one category is required.', 'categories');
    if (!Array.isArray(this._concepts) || !this._concepts.length) add('CONCEPTS_REQUIRED', 'At least one concept is required.', 'concepts');

    const categoryIds = new Set();
    for (let i = 0; i < this._categories.length; i += 1) {
      const category = this._categories[i] || {};
      const base = `categories[${i}]`;
      if (!category.id) add('CATEGORY_ID_REQUIRED', 'Category id is required.', `${base}.id`);
      if (!category.displayName) add('CATEGORY_DISPLAY_NAME_REQUIRED', 'Category displayName is required.', `${base}.displayName`);
      if (category.id && category.id !== String(category.id).toUpperCase()) add('CATEGORY_ID_FORMAT', 'Category id must be uppercase.', `${base}.id`);
      if (categoryIds.has(category.id)) add('DUPLICATE_CATEGORY_ID', `Duplicate category id: ${category.id}`, `${base}.id`);
      categoryIds.add(category.id);
    }

    const conceptIds = new Set();
    const aliases = new Map();
    const validValueTypes = new Set(['NUMBER', 'COUNT', 'LENGTH', 'AREA', 'BOOLEAN', 'TEXT', 'DIMENSION_PAIR']);
    for (let i = 0; i < this._concepts.length; i += 1) {
      const concept = this._concepts[i] || {};
      const base = `concepts[${i}]`;
      if (!concept.id) add('CONCEPT_ID_REQUIRED', 'Concept id is required.', `${base}.id`);
      if (!concept.displayName) add('CONCEPT_DISPLAY_NAME_REQUIRED', 'Concept displayName is required.', `${base}.displayName`);
      if (!categoryIds.has(concept.category)) add('UNKNOWN_CATEGORY', `Unknown category: ${concept.category}`, `${base}.category`);
      if (!validValueTypes.has(concept.valueType)) add('INVALID_VALUE_TYPE', `Invalid valueType: ${concept.valueType}`, `${base}.valueType`);
      if (!Array.isArray(concept.aliases) || !concept.aliases.length) add('ALIASES_REQUIRED', 'Concept must define at least one alias.', `${base}.aliases`);
      if (!Array.isArray(concept.units)) add('UNITS_ARRAY_REQUIRED', 'Concept units must be an array.', `${base}.units`);
      if (!Array.isArray(concept.examples) || !concept.examples.length) add('EXAMPLES_REQUIRED', 'Concept must define at least one example.', `${base}.examples`);
      if (!Array.isArray(concept.negativeIndicators)) add('NEGATIVE_INDICATORS_ARRAY_REQUIRED', 'negativeIndicators must be an array.', `${base}.negativeIndicators`);
      if (concept.id && concept.id !== String(concept.id).toUpperCase()) add('CONCEPT_ID_FORMAT', 'Concept id must be uppercase.', `${base}.id`);
      if (conceptIds.has(concept.id)) add('DUPLICATE_CONCEPT_ID', `Duplicate concept id: ${concept.id}`, `${base}.id`);
      conceptIds.add(concept.id);
      for (let j = 0; j < (concept.aliases || []).length; j += 1) {
        const alias = normalizeKey(concept.aliases[j]);
        if (!alias) add('EMPTY_ALIAS', 'Alias cannot be empty.', `${base}.aliases[${j}]`);
        if (aliases.has(alias)) add('DUPLICATE_ALIAS', `Alias '${alias}' belongs to both ${aliases.get(alias)} and ${concept.id}.`, `${base}.aliases[${j}]`);
        aliases.set(alias, concept.id);
      }
    }
    return deepFreeze({ valid: errors.length === 0, errors });
  }
}

function createDefaultOntology() {
  return new SCIIPLanguageOntology();
}

module.exports = {
  SCIIPLanguageOntology,
  OntologyValidationError,
  createDefaultOntology,
  normalizeKey
};
