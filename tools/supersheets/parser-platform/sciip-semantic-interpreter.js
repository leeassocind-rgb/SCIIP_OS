'use strict';

const { createDefaultPhraseBuilder, PHRASE_TYPES } = require('./sciip-phrase-builder');
const { createDefaultOntology } = require('./sciip-language-ontology');

const INTERPRETATION_STATUS = Object.freeze({
  INTERPRETED: 'INTERPRETED',
  UNMAPPED: 'UNMAPPED',
  REJECTED: 'REJECTED'
});

const DEFAULT_OPTIONS = Object.freeze({
  executionMode: 'DIAGNOSTIC_ONLY',
  minimumConfidence: 0.80,
  includeUnmapped: true
});

const PHRASE_CONCEPT_MAP = Object.freeze({
  [PHRASE_TYPES.ELECTRICAL_SPECIFICATION]: 'POWER',
  [PHRASE_TYPES.CLEAR_HEIGHT]: 'CLEAR_HEIGHT',
  [PHRASE_TYPES.DOCK_HIGH_COUNT]: 'DOCK_HIGH',
  [PHRASE_TYPES.GRADE_LEVEL_COUNT]: 'GRADE_LEVEL',
  [PHRASE_TYPES.TRUCK_COURT_DEPTH]: 'TRUCK_COURT',
  [PHRASE_TYPES.AUTO_PARKING_COUNT]: 'AUTO_PARKING',
  [PHRASE_TYPES.TRAILER_PARKING_COUNT]: 'TRAILER_PARKING',
  [PHRASE_TYPES.BUILDING_AREA]: 'BUILDING_AREA',
  [PHRASE_TYPES.LAND_AREA]: 'LAND_AREA',
  [PHRASE_TYPES.COLUMN_SPACING]: 'COLUMN_SPACING'
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }

class SemanticInterpreterConfigurationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'SemanticInterpreterConfigurationError';
    this.details = deepFreeze({ ...details });
  }
}

class SCIIPSemanticInterpreter {
  constructor(options = {}) {
    this._phraseBuilder = options.phraseBuilder || createDefaultPhraseBuilder();
    this._ontology = options.ontology || createDefaultOntology();
    this._options = deepFreeze({ ...DEFAULT_OPTIONS, ...(options.options || {}) });
    this._phraseConceptMap = deepFreeze({ ...PHRASE_CONCEPT_MAP, ...(options.phraseConceptMap || {}) });

    if (!this._phraseBuilder || typeof this._phraseBuilder.build !== 'function') {
      throw new SemanticInterpreterConfigurationError('A valid SCIIP phrase builder is required.');
    }
    if (!this._ontology || typeof this._ontology.getConcept !== 'function') {
      throw new SemanticInterpreterConfigurationError('A valid SCIIP language ontology is required.');
    }
    this._validateMappings();
    Object.freeze(this);
  }

  interpret(input, context = {}) {
    const phraseResult = this._resolvePhraseResult(input, context);
    const interpretations = [];
    const unmapped = [];

    for (const phrase of phraseResult.phrases) {
      const result = this._interpretPhrase(phrase);
      if (result.status === INTERPRETATION_STATUS.INTERPRETED) interpretations.push(result);
      else if (this._options.includeUnmapped) unmapped.push(result);
    }

    return deepFreeze({
      source: phraseResult.source,
      phraseResult,
      interpretations,
      unmapped,
      context: deepFreeze({ ...phraseResult.context, ...context }),
      interpreterVersion: 'ile-v1.0.0-sprint4.0',
      executionMode: this._options.executionMode,
      productionWrites: 0,
      commitEnabled: false,
      existingParserAuthoritative: true
    });
  }

  interpretMany(inputs, context = {}) {
    if (!Array.isArray(inputs)) throw new TypeError('interpretMany expects an array.');
    return deepFreeze(inputs.map((input, index) => this.interpret(input, { ...context, inputIndex: index })));
  }

  statistics(result) {
    const interpretations = result && Array.isArray(result.interpretations) ? result.interpretations : [];
    const unmapped = result && Array.isArray(result.unmapped) ? result.unmapped : [];
    const byConcept = {};
    for (const item of interpretations) byConcept[item.concept.id] = (byConcept[item.concept.id] || 0) + 1;
    const averageConfidence = interpretations.length
      ? Number((interpretations.reduce((sum, item) => sum + item.confidence, 0) / interpretations.length).toFixed(6))
      : 0;
    return deepFreeze({
      interpretationCount: interpretations.length,
      unmappedCount: unmapped.length,
      averageConfidence,
      byConcept,
      executionMode: this._options.executionMode,
      productionWrites: 0,
      commitEnabled: false
    });
  }

  _resolvePhraseResult(input, context) {
    if (typeof input === 'string' || input == null) return this._phraseBuilder.build(input, context);
    if (input && Array.isArray(input.phrases) && typeof input.source === 'string') return input;
    throw new TypeError('interpret expects source text or a phrase-builder result.');
  }

  _interpretPhrase(phrase) {
    const conceptId = phrase.phraseType === PHRASE_TYPES.FIRE_SUPPRESSION
      ? this._resolveFireSuppressionConcept(phrase)
      : this._phraseConceptMap[phrase.phraseType];

    if (!conceptId) return this._unmapped(phrase, 'NO_GOVERNED_MAPPING');
    const concept = this._ontology.getConcept(conceptId);
    if (!concept) return this._unmapped(phrase, 'ONTOLOGY_CONCEPT_NOT_FOUND');

    const confidence = this._confidence(phrase, concept);
    if (confidence < this._options.minimumConfidence) {
      return deepFreeze({
        status: INTERPRETATION_STATUS.REJECTED,
        phrase,
        conceptId,
        confidence,
        reasonCode: 'BELOW_MINIMUM_CONFIDENCE',
        evidence: this._evidence(phrase),
        reasoning: deepFreeze([
          `Mapped phrase type ${phrase.phraseType} to ontology concept ${conceptId}.`,
          `Interpretation confidence ${confidence.toFixed(2)} is below the governed minimum ${this._options.minimumConfidence.toFixed(2)}.`
        ])
      });
    }

    return deepFreeze({
      status: INTERPRETATION_STATUS.INTERPRETED,
      phrase,
      concept: deepFreeze(clone(concept)),
      value: this._semanticValue(phrase, concept),
      confidence,
      evidence: this._evidence(phrase),
      reasoning: this._reasoning(phrase, concept, confidence),
      governance: deepFreeze({
        ontologyValidated: true,
        deterministicMapping: true,
        sourceSpanTraceable: true,
        productionWriteAllowed: false
      })
    });
  }

  _resolveFireSuppressionConcept(phrase) {
    const system = String(phrase.attributes && phrase.attributes.system || '').toUpperCase();
    if (system === 'ESFR') return 'ESFR';
    if (system === 'SPRINKLER') return 'SPRINKLER';
    return null;
  }

  _semanticValue(phrase, concept) {
    const attributes = clone(phrase.attributes || {});
    const primaryValue = attributes.amperage ?? attributes.height ?? attributes.count ?? attributes.depth ?? attributes.area ?? attributes.dimensions ?? attributes.system ?? null;
    return deepFreeze({
      primary: primaryValue,
      valueType: concept.valueType,
      attributes,
      sourceText: phrase.text
    });
  }

  _confidence(phrase, concept) {
    let score = Number(phrase.confidence || 0);
    const text = String(phrase.normalizedText || phrase.text || '').toLowerCase();
    const aliasMatch = Array.isArray(concept.aliases) && concept.aliases.some(alias => text.includes(String(alias).toLowerCase()));
    if (aliasMatch) score = Math.min(1, score + 0.02);
    const negativeMatch = Array.isArray(concept.negativeIndicators) && concept.negativeIndicators.some(term => text.includes(String(term).toLowerCase()));
    if (negativeMatch) score = Math.max(0, score - 0.25);
    return Number(score.toFixed(6));
  }

  _evidence(phrase) {
    return deepFreeze({
      sourceText: phrase.text,
      normalizedText: phrase.normalizedText,
      span: clone(phrase.span),
      tokenRange: clone(phrase.tokenRange),
      tokens: phrase.tokens.map(token => deepFreeze({ type: token.type, text: token.text, normalized: token.normalized, span: clone(token.span) })),
      phraseRule: phrase.evidence && phrase.evidence.rule || phrase.phraseType,
      sourceSpanPreserved: Boolean(phrase.evidence && phrase.evidence.sourceSpanPreserved)
    });
  }

  _reasoning(phrase, concept, confidence) {
    const reasons = [
      `Mapped governed phrase type ${phrase.phraseType} to SILS concept ${concept.id}.`,
      `Confirmed concept ${concept.id} exists in the active ontology.`,
      `Preserved source span ${phrase.span.start}-${phrase.span.end} and token evidence.`,
      `Accepted deterministic interpretation at confidence ${confidence.toFixed(2)}.`
    ];
    if (phrase.attributes && phrase.attributes.voltage) reasons.push('Electrical voltage evidence is present.');
    if (phrase.attributes && phrase.attributes.phase) reasons.push('Electrical phase evidence is present.');
    return deepFreeze(reasons);
  }

  _unmapped(phrase, reasonCode) {
    return deepFreeze({
      status: INTERPRETATION_STATUS.UNMAPPED,
      phrase,
      conceptId: null,
      confidence: 0,
      reasonCode,
      evidence: this._evidence(phrase),
      reasoning: deepFreeze([`No governed ontology interpretation was accepted for phrase type ${phrase.phraseType}.`])
    });
  }

  _validateMappings() {
    const errors = [];
    for (const [phraseType, conceptId] of Object.entries(this._phraseConceptMap)) {
      if (!Object.values(PHRASE_TYPES).includes(phraseType)) errors.push({ phraseType, conceptId, code: 'UNKNOWN_PHRASE_TYPE' });
      if (!this._ontology.getConcept(conceptId)) errors.push({ phraseType, conceptId, code: 'UNKNOWN_CONCEPT' });
    }
    for (const required of ['ESFR', 'SPRINKLER']) {
      if (!this._ontology.getConcept(required)) errors.push({ phraseType: PHRASE_TYPES.FIRE_SUPPRESSION, conceptId: required, code: 'UNKNOWN_CONCEPT' });
    }
    if (errors.length) throw new SemanticInterpreterConfigurationError('Semantic interpreter mappings failed validation.', { errors });
  }
}

function createDefaultSemanticInterpreter(options = {}) { return new SCIIPSemanticInterpreter(options); }

module.exports = {
  SCIIPSemanticInterpreter,
  SemanticInterpreterConfigurationError,
  INTERPRETATION_STATUS,
  PHRASE_CONCEPT_MAP,
  createDefaultSemanticInterpreter,
  deepFreeze
};
