"use strict";

/**
 * SCIIP Industrial Language Engine — Sprint 5A
 * End-to-End Pipeline Orchestrator and Contract Adapter
 *
 * Diagnostic-only. No production writes. Existing parser remains authoritative.
 */

const { createDefaultPhraseTokenizer } = (() => {
  const tokenizerModule = require("./sciip-phrase-tokenizer");
  return {
    createDefaultPhraseTokenizer:
      tokenizerModule.createDefaultPhraseTokenizer ||
      tokenizerModule.createDefaultTokenizer
  };
})();

const { createDefaultPhraseBuilder } = require("./sciip-phrase-builder");
const { createDefaultSemanticInterpreter } = require("./sciip-semantic-interpreter");
const { buildPropertyModel } = require("./sciip-property-model-builder");

const PIPELINE_VERSION = "ile-v1.0.0-sprint5a.0";
const EXECUTION_MODE = "DIAGNOSTIC_ONLY";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return value;
}

function stableClone(value) {
  if (Array.isArray(value)) return value.map(stableClone);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value).sort().reduce((result, key) => {
    result[key] = stableClone(value[key]);
    return result;
  }, {});
}

function conceptIdOf(interpretation) {
  if (!interpretation || typeof interpretation !== "object") return "";
  if (typeof interpretation.conceptId === "string") return interpretation.conceptId;
  if (typeof interpretation.concept === "string") return interpretation.concept;
  if (interpretation.concept && typeof interpretation.concept.id === "string") {
    return interpretation.concept.id;
  }
  return "";
}

function semanticPayload(interpretation) {
  const concept = conceptIdOf(interpretation).toUpperCase();
  const value = interpretation && interpretation.value;
  const attributes = value && typeof value === "object" && value.attributes
    ? value.attributes
    : {};
  const primary = value && typeof value === "object" && "primary" in value
    ? value.primary
    : interpretation.semanticValue;

  switch (concept) {
    case "BUILDING_AREA":
    case "LAND_AREA":
      return {
        value: attributes.area ?? primary,
        unit: attributes.unit || "SF"
      };

    case "CLEAR_HEIGHT":
      return {
        value: attributes.height ?? primary,
        unit: attributes.unit || "FT"
      };

    case "TRUCK_COURT":
      return {
        value: attributes.depth ?? primary,
        unit: attributes.unit || "FT"
      };

    case "DOCK_HIGH":
    case "GRADE_LEVEL":
    case "AUTO_PARKING":
    case "TRAILER_PARKING":
      return attributes.count ?? primary;

    case "POWER":
      return {
        amps: attributes.amperage ?? primary,
        voltage: Array.isArray(attributes.voltage)
          ? `${attributes.voltage[0]}/${attributes.voltage[1]}v`
          : attributes.voltage || undefined,
        phase: attributes.phase || undefined
      };

    case "COLUMN_SPACING": {
      const dimensions = attributes.dimensions ?? primary;
      return {
        width: Array.isArray(dimensions) ? dimensions[0] : undefined,
        depth: Array.isArray(dimensions) ? dimensions[1] : undefined,
        unit: attributes.unit || "FT"
      };
    }

    case "ESFR":
    case "SPRINKLER":
      return true;

    default:
      return primary;
  }
}

function adaptInterpretation(interpretation) {
  const concept = conceptIdOf(interpretation).toUpperCase();
  const evidence = interpretation.evidence || {};
  const span = evidence.span || interpretation.span || {};
  const reasoning = Array.isArray(interpretation.reasoning)
    ? [...interpretation.reasoning]
    : [];

  return deepFreeze({
    concept,
    semanticValue: semanticPayload(interpretation),
    confidence: Number(interpretation.confidence || 0),
    text: evidence.sourceText || interpretation.phrase?.text || "",
    startOffset: Number.isFinite(Number(span.start)) ? Number(span.start) : null,
    endOffset: Number.isFinite(Number(span.end)) ? Number(span.end) : null,
    reasoning,
    source: deepFreeze({
      interpreterStatus: interpretation.status || null,
      ontologyConcept: interpretation.concept
        ? stableClone(interpretation.concept)
        : null,
      evidence: stableClone(evidence)
    })
  });
}

function adaptInterpretations(interpreterResult) {
  if (!interpreterResult || !Array.isArray(interpreterResult.interpretations)) {
    throw new TypeError("A valid semantic interpreter result is required.");
  }
  return deepFreeze(
    interpreterResult.interpretations
      .map(adaptInterpretation)
      .filter(item => item.concept)
  );
}

function stageContract(name, inputCount, outputCount, valid = true, notes = []) {
  return deepFreeze({
    name,
    valid,
    inputCount,
    outputCount,
    notes: [...notes]
  });
}

class SCIIPILEPipeline {
  constructor(options = {}) {
    this._tokenizer =
      options.tokenizer ||
      (typeof createDefaultPhraseTokenizer === "function"
        ? createDefaultPhraseTokenizer()
        : null);
    this._phraseBuilder = options.phraseBuilder || createDefaultPhraseBuilder();
    this._semanticInterpreter =
      options.semanticInterpreter || createDefaultSemanticInterpreter();
    this._propertyModelBuilder =
      options.propertyModelBuilder || buildPropertyModel;
    this._options = deepFreeze({
      requiredConcepts: [],
      failOnValidationError: false,
      ...(options.options || {})
    });

    if (!this._tokenizer || typeof this._tokenizer.tokenize !== "function") {
      throw new TypeError("A valid tokenizer is required.");
    }
    if (!this._phraseBuilder || typeof this._phraseBuilder.build !== "function") {
      throw new TypeError("A valid phrase builder is required.");
    }
    if (
      !this._semanticInterpreter ||
      typeof this._semanticInterpreter.interpret !== "function"
    ) {
      throw new TypeError("A valid semantic interpreter is required.");
    }
    if (typeof this._propertyModelBuilder !== "function") {
      throw new TypeError("A valid property model builder is required.");
    }

    Object.freeze(this);
  }

  run(input, context = {}) {
    const source = String(input == null ? "" : input);
    const tokenResult = this._tokenizer.tokenize(source, context);
    const phraseResult = this._phraseBuilder.build(tokenResult, context);
    const interpreterResult = this._semanticInterpreter.interpret(
      phraseResult,
      context
    );
    const adaptedInterpretations = adaptInterpretations(interpreterResult);
    const propertyModel = this._propertyModelBuilder(adaptedInterpretations, {
      requiredConcepts: this._options.requiredConcepts,
      failOnValidationError: this._options.failOnValidationError
    });

    const contracts = [
      stageContract(
        "TEXT_TO_TOKENS",
        source.length,
        tokenResult.tokens.length,
        tokenResult.source === source
      ),
      stageContract(
        "TOKENS_TO_PHRASES",
        tokenResult.tokens.length,
        phraseResult.phrases.length,
        phraseResult.source === source
      ),
      stageContract(
        "PHRASES_TO_INTERPRETATIONS",
        phraseResult.phrases.length,
        interpreterResult.interpretations.length,
        true,
        [`unmapped=${interpreterResult.unmapped.length}`]
      ),
      stageContract(
        "INTERPRETATIONS_TO_PROPERTY_MODEL",
        adaptedInterpretations.length,
        propertyModel.governance.resolvedConcepts.length,
        propertyModel.validation.valid,
        propertyModel.validation.warnings
      )
    ];

    return deepFreeze(stableClone({
      pipelineVersion: PIPELINE_VERSION,
      executionMode: EXECUTION_MODE,
      source,
      context: { ...context },
      stages: {
        tokenResult,
        phraseResult,
        interpreterResult,
        adaptedInterpretations,
        propertyModel
      },
      contracts,
      certification: {
        contractCompatibility: contracts.every(contract => contract.valid),
        evidencePreserved: adaptedInterpretations.every(
          item =>
            typeof item.text === "string" &&
            item.startOffset !== null &&
            item.endOffset !== null
        ),
        deterministic: true,
        existingParserAuthoritative: true,
        productionWrites: 0,
        commitEnabled: false
      }
    }));
  }

  runMany(inputs, context = {}) {
    if (!Array.isArray(inputs)) {
      throw new TypeError("runMany expects an array.");
    }
    return deepFreeze(
      inputs.map((input, index) =>
        this.run(input, { ...context, inputIndex: index })
      )
    );
  }
}

function createDefaultILEPipeline(options = {}) {
  return new SCIIPILEPipeline(options);
}

module.exports = Object.freeze({
  PIPELINE_VERSION,
  EXECUTION_MODE,
  SCIIPILEPipeline,
  createDefaultILEPipeline,
  adaptInterpretation,
  adaptInterpretations,
  semanticPayload,
  conceptIdOf,
  deepFreeze
});
