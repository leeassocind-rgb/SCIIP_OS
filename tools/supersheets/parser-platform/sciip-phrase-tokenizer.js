'use strict';

const { createDefaultOntology, normalizeKey } = require('./sciip-language-ontology');

const TOKEN_TYPES = Object.freeze({
  NUMBER: 'NUMBER',
  UNIT: 'UNIT',
  WORD: 'WORD',
  SYMBOL: 'SYMBOL',
  PERCENT: 'PERCENT',
  VOLTAGE: 'VOLTAGE',
  PHASE: 'PHASE',
  DIMENSION: 'DIMENSION',
  AREA: 'AREA',
  UNKNOWN: 'UNKNOWN'
});

const DEFAULT_OPTIONS = Object.freeze({
  includeWhitespace: false,
  includePunctuation: true,
  recognizeCompounds: true,
  preserveSource: true,
  executionMode: 'DIAGNOSTIC_ONLY'
});

const UNIT_ALIASES = Object.freeze({
  amp: 'amps', amps: 'amps', ampere: 'amps', amperes: 'amps', a: 'amps',
  kva: 'kva', kw: 'kw', mw: 'mw', kwh: 'kwh', mwh: 'mwh',
  ft: 'ft', foot: 'ft', feet: 'ft', "'": 'ft',
  sf: 'sf', sqft: 'sf', 'sq ft': 'sf', 'square feet': 'sf',
  ac: 'acres', acre: 'acres', acres: 'acres',
  door: 'doors', doors: 'doors', position: 'positions', positions: 'positions',
  space: 'spaces', spaces: 'spaces', stall: 'stalls', stalls: 'stalls',
  ton: 'tons', tons: 'tons', percent: 'percent', '%': 'percent'
});

class TokenizerConfigurationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'TokenizerConfigurationError';
    this.details = Object.freeze({ ...details });
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}

function parseNumber(raw) {
  const cleaned = String(raw).replace(/,/g, '');
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function canonicalUnit(raw) {
  const key = normalizeKey(raw).replace(/\.$/, '');
  return UNIT_ALIASES[key] || null;
}

function makeToken({ type, raw, normalized, value = null, unit = null, start, end, metadata = {} }) {
  return deepFreeze({
    type,
    raw,
    normalized,
    value,
    unit,
    span: Object.freeze({ start, end }),
    metadata: deepFreeze({ ...metadata })
  });
}

class SCIIPPhraseTokenizer {
  constructor(options = {}) {
    this._ontology = options.ontology || createDefaultOntology();
    this._options = deepFreeze({ ...DEFAULT_OPTIONS, ...(options.options || options) });
    if (!this._ontology || typeof this._ontology.concepts !== 'function') {
      throw new TokenizerConfigurationError('A valid SCIIP language ontology is required.');
    }
    this._knownUnits = this._buildKnownUnits();
    Object.freeze(this);
  }

  tokenize(input, context = {}) {
    const source = String(input == null ? '' : input);
    if (!source) return deepFreeze(this._result(source, [], context));

    const lexical = this._scan(source);
    const tokens = this._options.recognizeCompounds
      ? this._recognizeCompounds(source, lexical)
      : lexical;

    return deepFreeze(this._result(source, tokens, context));
  }

  tokenizeMany(inputs, context = {}) {
    if (!Array.isArray(inputs)) {
      throw new TypeError('tokenizeMany expects an array.');
    }
    return deepFreeze(inputs.map((input, index) => this.tokenize(input, { ...context, inputIndex: index })));
  }

  statistics(result) {
    const tokens = result && Array.isArray(result.tokens) ? result.tokens : [];
    const byType = {};
    for (const token of tokens) byType[token.type] = (byType[token.type] || 0) + 1;
    return deepFreeze({
      tokenCount: tokens.length,
      byType,
      productionWrites: 0,
      commitEnabled: false,
      executionMode: this._options.executionMode
    });
  }

  options() { return this._options; }

  _result(source, tokens, context) {
    return {
      source: this._options.preserveSource ? source : null,
      normalizedSource: normalizeKey(source),
      tokens,
      context: deepFreeze({ ...context }),
      tokenizerVersion: 'ile-v1.0.0-sprint2.0',
      executionMode: this._options.executionMode,
      productionWrites: 0,
      commitEnabled: false
    };
  }

  _buildKnownUnits() {
    const units = new Set(Object.keys(UNIT_ALIASES));
    for (const concept of this._ontology.concepts()) {
      for (const unit of concept.units || []) units.add(normalizeKey(unit));
    }
    return units;
  }

  _scan(source) {
    const tokens = [];
    const matcher = /\s+|\d[\d,]*(?:\.\d+)?|[A-Za-z]+(?:-[A-Za-z]+)*|[%/'′″"×x]|[^\sA-Za-z0-9]/g;
    let match;
    while ((match = matcher.exec(source)) !== null) {
      const raw = match[0];
      const start = match.index;
      const end = start + raw.length;
      if (/^\s+$/.test(raw)) continue;

      if (/^\d[\d,]*(?:\.\d+)?$/.test(raw)) {
        tokens.push(makeToken({ type: TOKEN_TYPES.NUMBER, raw, normalized: raw.replace(/,/g, ''), value: parseNumber(raw), start, end }));
        continue;
      }

      const unit = canonicalUnit(raw);
      if (unit) {
        tokens.push(makeToken({ type: TOKEN_TYPES.UNIT, raw, normalized: unit, unit, start, end }));
        continue;
      }

      if (/^[A-Za-z]+(?:-[A-Za-z]+)*$/.test(raw)) {
        tokens.push(makeToken({ type: TOKEN_TYPES.WORD, raw, normalized: normalizeKey(raw), start, end }));
        continue;
      }

      if (this._options.includePunctuation) {
        tokens.push(makeToken({ type: TOKEN_TYPES.SYMBOL, raw, normalized: raw, start, end }));
      }
    }
    return tokens;
  }

  _recognizeCompounds(source, tokens) {
    const output = [];
    let i = 0;
    while (i < tokens.length) {
      const remaining = tokens.slice(i);
      const compound = this._matchVoltage(source, remaining)
        || this._matchPhase(source, remaining)
        || this._matchPercent(source, remaining)
        || this._matchDimension(source, remaining)
        || this._matchArea(source, remaining)
        || this._matchNumberUnit(source, remaining);
      if (compound) {
        output.push(compound.token);
        i += compound.consumed;
      } else {
        output.push(tokens[i]);
        i += 1;
      }
    }
    return output;
  }

  _slice(source, first, last) { return source.slice(first.span.start, last.span.end); }

  _matchVoltage(source, t) {
    if (t.length < 3 || t[0].type !== TOKEN_TYPES.NUMBER || t[1].raw !== '/' || t[2].type !== TOKEN_TYPES.NUMBER) return null;
    let consumed = 3;
    if (t[3] && t[3].type === TOKEN_TYPES.WORD && /^v(?:olts?)?$/i.test(t[3].raw)) consumed = 4;
    const last = t[consumed - 1];
    const raw = this._slice(source, t[0], last);
    return { consumed, token: makeToken({ type: TOKEN_TYPES.VOLTAGE, raw, normalized: `${t[0].value}/${t[2].value}v`, value: [t[0].value, t[2].value], unit: 'volts', start: t[0].span.start, end: last.span.end }) };
  }

  _matchPhase(source, t) {
    if (t.length < 2 || t[0].type !== TOKEN_TYPES.NUMBER || t[1].type !== TOKEN_TYPES.WORD || !/^phase$/i.test(t[1].raw)) return null;
    const raw = this._slice(source, t[0], t[1]);
    return { consumed: 2, token: makeToken({ type: TOKEN_TYPES.PHASE, raw, normalized: `${t[0].value} phase`, value: t[0].value, unit: 'phase', start: t[0].span.start, end: t[1].span.end }) };
  }

  _matchPercent(source, t) {
    if (t.length < 2 || t[0].type !== TOKEN_TYPES.NUMBER) return null;
    const percentLike = (t[1].type === TOKEN_TYPES.UNIT && t[1].unit === 'percent') || t[1].raw === '%';
    if (!percentLike) return null;
    const raw = this._slice(source, t[0], t[1]);
    return { consumed: 2, token: makeToken({ type: TOKEN_TYPES.PERCENT, raw, normalized: `${t[0].value}%`, value: t[0].value, unit: 'percent', start: t[0].span.start, end: t[1].span.end }) };
  }

  _matchDimension(source, t) {
    if (t.length < 3 || t[0].type !== TOKEN_TYPES.NUMBER || !['x', '×'].includes(t[1].raw.toLowerCase()) || t[2].type !== TOKEN_TYPES.NUMBER) return null;
    let consumed = 3;
    if (t[3] && t[3].type === TOKEN_TYPES.UNIT && t[3].unit === 'ft') consumed = 4;
    const last = t[consumed - 1];
    const raw = this._slice(source, t[0], last);
    return { consumed, token: makeToken({ type: TOKEN_TYPES.DIMENSION, raw, normalized: `${t[0].value}x${t[2].value}`, value: [t[0].value, t[2].value], unit: consumed === 4 ? 'ft' : null, start: t[0].span.start, end: last.span.end }) };
  }

  _matchArea(source, t) {
    if (t.length < 2 || t[0].type !== TOKEN_TYPES.NUMBER) return null;
    if (t[1].type === TOKEN_TYPES.UNIT && ['sf', 'acres'].includes(t[1].unit)) {
      const raw = this._slice(source, t[0], t[1]);
      return { consumed: 2, token: makeToken({ type: TOKEN_TYPES.AREA, raw, normalized: `${t[0].value} ${t[1].unit}`, value: t[0].value, unit: t[1].unit, start: t[0].span.start, end: t[1].span.end }) };
    }
    if (t.length >= 3 && t[1].type === TOKEN_TYPES.WORD && /^sq(?:uare)?$/i.test(t[1].raw) && t[2].type === TOKEN_TYPES.WORD && /^(?:ft|feet)$/i.test(t[2].raw)) {
      const raw = this._slice(source, t[0], t[2]);
      return { consumed: 3, token: makeToken({ type: TOKEN_TYPES.AREA, raw, normalized: `${t[0].value} sf`, value: t[0].value, unit: 'sf', start: t[0].span.start, end: t[2].span.end }) };
    }
    return null;
  }

  _matchNumberUnit(source, t) {
    if (t.length < 2 || t[0].type !== TOKEN_TYPES.NUMBER || t[1].type !== TOKEN_TYPES.UNIT) return null;
    const raw = this._slice(source, t[0], t[1]);
    return { consumed: 2, token: makeToken({ type: TOKEN_TYPES.NUMBER, raw, normalized: `${t[0].value} ${t[1].unit}`, value: t[0].value, unit: t[1].unit, start: t[0].span.start, end: t[1].span.end, metadata: { compound: true } }) };
  }
}

function createDefaultTokenizer(options = {}) {
  return new SCIIPPhraseTokenizer(options);
}

module.exports = {
  SCIIPPhraseTokenizer,
  TokenizerConfigurationError,
  TOKEN_TYPES,
  UNIT_ALIASES,
  createDefaultTokenizer,
  canonicalUnit,
  parseNumber
};
