'use strict';

const { createDefaultTokenizer, TOKEN_TYPES } = require('./sciip-phrase-tokenizer');

const PHRASE_TYPES = Object.freeze({
  ELECTRICAL_SPECIFICATION: 'ELECTRICAL_SPECIFICATION',
  CLEAR_HEIGHT: 'CLEAR_HEIGHT',
  DOCK_HIGH_COUNT: 'DOCK_HIGH_COUNT',
  GRADE_LEVEL_COUNT: 'GRADE_LEVEL_COUNT',
  TRUCK_COURT_DEPTH: 'TRUCK_COURT_DEPTH',
  AUTO_PARKING_COUNT: 'AUTO_PARKING_COUNT',
  TRAILER_PARKING_COUNT: 'TRAILER_PARKING_COUNT',
  BUILDING_AREA: 'BUILDING_AREA',
  LAND_AREA: 'LAND_AREA',
  COLUMN_SPACING: 'COLUMN_SPACING',
  FIRE_SUPPRESSION: 'FIRE_SUPPRESSION'
});

const DEFAULT_OPTIONS = Object.freeze({
  executionMode: 'DIAGNOSTIC_ONLY',
  includeUnmatchedTokens: true,
  minimumConfidence: 0.80
});

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

function normalizeWord(token) {
  return token && [TOKEN_TYPES.WORD, TOKEN_TYPES.UNIT].includes(token.type) ? token.normalized : '';
}

function numberLike(token, unit) {
  if (!token || token.type !== TOKEN_TYPES.NUMBER || typeof token.value !== 'number') return false;
  return unit ? token.unit === unit : true;
}

function phraseFrom(source, tokens, startIndex, endIndex, phraseType, confidence, attributes = {}) {
  const selected = tokens.slice(startIndex, endIndex + 1);
  const start = selected[0].span.start;
  const end = selected[selected.length - 1].span.end;
  return deepFreeze({
    phraseType,
    text: source.slice(start, end),
    normalizedText: source.slice(start, end).toLowerCase().replace(/\s+/g, ' ').trim(),
    tokens: selected,
    tokenRange: Object.freeze({ start: startIndex, end: endIndex }),
    span: Object.freeze({ start, end }),
    confidence,
    attributes: deepFreeze({ ...attributes }),
    evidence: deepFreeze({ rule: phraseType, sourceSpanPreserved: true })
  });
}

class PhraseBuilderConfigurationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'PhraseBuilderConfigurationError';
    this.details = deepFreeze({ ...details });
  }
}

class SCIIPPhraseBuilder {
  constructor(options = {}) {
    this._tokenizer = options.tokenizer || createDefaultTokenizer();
    this._options = deepFreeze({ ...DEFAULT_OPTIONS, ...(options.options || options) });
    if (!this._tokenizer || typeof this._tokenizer.tokenize !== 'function') {
      throw new PhraseBuilderConfigurationError('A valid SCIIP phrase tokenizer is required.');
    }
    Object.freeze(this);
  }

  build(input, context = {}) {
    const tokenization = typeof input === 'string' || input == null
      ? this._tokenizer.tokenize(input, context)
      : input;
    if (!tokenization || !Array.isArray(tokenization.tokens) || typeof tokenization.source !== 'string') {
      throw new TypeError('build expects source text or a tokenizer result.');
    }

    const candidates = this._generateCandidates(tokenization.source, tokenization.tokens);
    const phrases = this._selectNonOverlapping(candidates);
    const claimed = new Set();
    for (const phrase of phrases) {
      for (let i = phrase.tokenRange.start; i <= phrase.tokenRange.end; i += 1) claimed.add(i);
    }
    const unmatchedTokens = this._options.includeUnmatchedTokens
      ? tokenization.tokens.filter((_, index) => !claimed.has(index))
      : [];

    return deepFreeze({
      source: tokenization.source,
      tokenization,
      phrases,
      unmatchedTokens,
      context: deepFreeze({ ...tokenization.context, ...context }),
      builderVersion: 'ile-v1.0.0-sprint3.0',
      executionMode: this._options.executionMode,
      productionWrites: 0,
      commitEnabled: false,
      existingParserAuthoritative: true
    });
  }

  buildMany(inputs, context = {}) {
    if (!Array.isArray(inputs)) throw new TypeError('buildMany expects an array.');
    return deepFreeze(inputs.map((input, index) => this.build(input, { ...context, inputIndex: index })));
  }

  statistics(result) {
    const phrases = result && Array.isArray(result.phrases) ? result.phrases : [];
    const byType = {};
    for (const phrase of phrases) byType[phrase.phraseType] = (byType[phrase.phraseType] || 0) + 1;
    return deepFreeze({
      phraseCount: phrases.length,
      unmatchedTokenCount: result && result.unmatchedTokens ? result.unmatchedTokens.length : 0,
      byType,
      executionMode: this._options.executionMode,
      productionWrites: 0,
      commitEnabled: false
    });
  }

  _generateCandidates(source, tokens) {
    const candidates = [];
    for (let i = 0; i < tokens.length; i += 1) {
      const matchers = [
        this._electrical.bind(this), this._clearHeight.bind(this), this._dockHigh.bind(this),
        this._gradeLevel.bind(this), this._truckCourt.bind(this), this._parking.bind(this),
        this._area.bind(this), this._columnSpacing.bind(this), this._fireSuppression.bind(this)
      ];
      for (const matcher of matchers) {
        const candidate = matcher(source, tokens, i);
        if (candidate && candidate.confidence >= this._options.minimumConfidence) candidates.push(candidate);
      }
    }
    return candidates;
  }

  _electrical(source, t, i) {
    const first = t[i];
    if (!numberLike(first, 'amps')) return null;
    let end = i;
    const attributes = { amperage: first.value, amperageUnit: 'amps' };
    if (t[end + 1] && t[end + 1].type === TOKEN_TYPES.VOLTAGE) {
      end += 1; attributes.voltage = t[end].value;
    }
    if (t[end + 1] && t[end + 1].type === TOKEN_TYPES.PHASE) {
      end += 1; attributes.phase = t[end].value;
    }
    return phraseFrom(source, t, i, end, PHRASE_TYPES.ELECTRICAL_SPECIFICATION, end > i ? 1.0 : 0.94, attributes);
  }

  _clearHeight(source, t, i) {
    if (!numberLike(t[i], 'ft')) return null;
    const next = normalizeWord(t[i + 1]);
    if (next === 'clear') return phraseFrom(source, t, i, i + 1, PHRASE_TYPES.CLEAR_HEIGHT, 1.0, { height: t[i].value, unit: 'ft' });
    if (next === 'clear' && normalizeWord(t[i + 2]) === 'height') return phraseFrom(source, t, i, i + 2, PHRASE_TYPES.CLEAR_HEIGHT, 1.0, { height: t[i].value, unit: 'ft' });
    return null;
  }

  _dockHigh(source, t, i) {
    if (!numberLike(t[i])) return null;
    if (normalizeWord(t[i + 1]) === 'dock' && normalizeWord(t[i + 2]) === 'high') {
      return phraseFrom(source, t, i, i + 2, PHRASE_TYPES.DOCK_HIGH_COUNT, 1.0, { count: t[i].value });
    }
    if (normalizeWord(t[i + 1]) === 'dh') return phraseFrom(source, t, i, i + 1, PHRASE_TYPES.DOCK_HIGH_COUNT, 0.98, { count: t[i].value });
    return null;
  }

  _gradeLevel(source, t, i) {
    if (!numberLike(t[i])) return null;
    if (normalizeWord(t[i + 1]) === 'grade' && normalizeWord(t[i + 2]) === 'level') {
      return phraseFrom(source, t, i, i + 2, PHRASE_TYPES.GRADE_LEVEL_COUNT, 1.0, { count: t[i].value });
    }
    if (normalizeWord(t[i + 1]) === 'gl') return phraseFrom(source, t, i, i + 1, PHRASE_TYPES.GRADE_LEVEL_COUNT, 0.98, { count: t[i].value });
    return null;
  }

  _truckCourt(source, t, i) {
    if (!numberLike(t[i], 'ft')) return null;
    if (normalizeWord(t[i + 1]) === 'truck' && normalizeWord(t[i + 2]) === 'court') {
      return phraseFrom(source, t, i, i + 2, PHRASE_TYPES.TRUCK_COURT_DEPTH, 1.0, { depth: t[i].value, unit: 'ft' });
    }
    return null;
  }

  _parking(source, t, i) {
    if (!numberLike(t[i])) return null;
    const a = normalizeWord(t[i + 1]);
    const b = normalizeWord(t[i + 2]);
    if (a === 'auto' && ['parking', 'spaces', 'stalls'].includes(b)) {
      return phraseFrom(source, t, i, i + 2, PHRASE_TYPES.AUTO_PARKING_COUNT, 1.0, { count: t[i].value });
    }
    if (a === 'trailer' && ['parking', 'spaces', 'stalls'].includes(b)) {
      return phraseFrom(source, t, i, i + 2, PHRASE_TYPES.TRAILER_PARKING_COUNT, 1.0, { count: t[i].value });
    }
    return null;
  }

  _area(source, t, i) {
    const token = t[i];
    if (!token || token.type !== TOKEN_TYPES.AREA) return null;
    const next = normalizeWord(t[i + 1]);
    const prev = normalizeWord(t[i - 1]);
    if (token.unit === 'acres' || next === 'land' || prev === 'land') {
      return phraseFrom(source, t, i, next === 'land' ? i + 1 : i, PHRASE_TYPES.LAND_AREA, 0.96, { area: token.value, unit: token.unit });
    }
    if (['building', 'warehouse', 'available'].includes(next)) {
      return phraseFrom(source, t, i, i + 1, PHRASE_TYPES.BUILDING_AREA, 0.96, { area: token.value, unit: token.unit });
    }
    return phraseFrom(source, t, i, i, PHRASE_TYPES.BUILDING_AREA, 0.90, { area: token.value, unit: token.unit });
  }

  _columnSpacing(source, t, i) {
    if (!t[i] || t[i].type !== TOKEN_TYPES.DIMENSION) return null;
    if (normalizeWord(t[i + 1]) === 'column' && normalizeWord(t[i + 2]) === 'spacing') {
      return phraseFrom(source, t, i, i + 2, PHRASE_TYPES.COLUMN_SPACING, 1.0, { dimensions: t[i].value, unit: t[i].unit });
    }
    return null;
  }

  _fireSuppression(source, t, i) {
    const word = normalizeWord(t[i]);
    if (word === 'esfr') return phraseFrom(source, t, i, i, PHRASE_TYPES.FIRE_SUPPRESSION, 1.0, { system: 'ESFR' });
    if (word === 'sprinkler' || word === 'sprinklers') return phraseFrom(source, t, i, i, PHRASE_TYPES.FIRE_SUPPRESSION, 0.90, { system: 'SPRINKLER' });
    return null;
  }

  _selectNonOverlapping(candidates) {
    const sorted = [...candidates].sort((a, b) =>
      b.confidence - a.confidence ||
      (b.tokenRange.end - b.tokenRange.start) - (a.tokenRange.end - a.tokenRange.start) ||
      a.span.start - b.span.start ||
      a.phraseType.localeCompare(b.phraseType)
    );
    const selected = [];
    for (const candidate of sorted) {
      const overlaps = selected.some(existing => candidate.span.start < existing.span.end && existing.span.start < candidate.span.end);
      if (!overlaps) selected.push(candidate);
    }
    return selected.sort((a, b) => a.span.start - b.span.start || a.span.end - b.span.end);
  }
}

function createDefaultPhraseBuilder(options = {}) { return new SCIIPPhraseBuilder(options); }

module.exports = {
  SCIIPPhraseBuilder,
  PhraseBuilderConfigurationError,
  PHRASE_TYPES,
  createDefaultPhraseBuilder,
  deepFreeze
};
