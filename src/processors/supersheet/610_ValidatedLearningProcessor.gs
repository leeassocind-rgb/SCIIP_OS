/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 610_ValidatedLearningProcessor
 *
 * HYPOTHESIS_VALIDATION_DECISIONS → VALIDATED_LEARNINGS
 *
 * Migration note:
 * Preserves original 610 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const VALIDATED_LEARNING_PROCESSOR = '610_ValidatedLearningProcessor';
const VALIDATED_LEARNINGS_SHEET = 'VALIDATED_LEARNINGS';

const VALIDATED_LEARNINGS_HEADERS = [
  'Learning_ID',
  'Business_Key',
  'Learning_Date',
  'Validation_Decision_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Validation_Decision',
  'Learning_Type',
  'Learning_Title',
  'Learning_Statement',
  'What_SCIIP_Learned',
  'Graph_Update_Recommendation',
  'Processor_Update_Recommendation',
  'Future_Signal_Weighting',
  'Learning_Confidence',
  'Learning_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureValidatedLearningsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    VALIDATED_LEARNINGS_SHEET,
    VALIDATED_LEARNINGS_HEADERS
  );
}

function sciipRunValidatedLearningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: VALIDATED_LEARNING_PROCESSOR,
    action: 'VALIDATED_LEARNINGS_BUILD',
    sourceSheet: 'HYPOTHESIS_VALIDATION_DECISIONS',
    targetSheet: VALIDATED_LEARNINGS_SHEET,
    ledgerSheet: 'VALIDATED_LEARNINGS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const validationDecisions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('HYPOTHESIS_VALIDATION_DECISIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: validationDecisions.length,
        outputCount: validationDecisions.length || 1,
        summary: 'Validated learning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: VALIDATED_LEARNING_PROCESSOR,
          inputSheets: ['HYPOTHESIS_VALIDATION_DECISIONS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureValidatedLearningsSchema();
      const learningDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const learningBusinessKey = 'VALIDATED_LEARNING|' + learningDate;

      if (sciipRuntimeBusinessKeyPrefixExists610_(definition.targetSheet, learningBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: VALIDATED_LEARNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            learningsCreated: 0,
            skippedDuplicate: 1,
            learningBusinessKey: learningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const validationDecisions = sciipGetRuntimeRecordsByDate610_(
        'HYPOTHESIS_VALIDATION_DECISIONS',
        'Decision_Date',
        learningDate
      );

      if (validationDecisions.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: VALIDATED_LEARNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            validationDecisionsReviewed: 0,
            learningsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const learnings = sciipCreateValidatedLearnings610_({
        businessKey: learningBusinessKey,
        learningDate: learningDate,
        validationDecisions: validationDecisions,
        processor: VALIDATED_LEARNING_PROCESSOR
      });

      learnings.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: VALIDATED_LEARNING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: learnings.length,
        recordsRead: validationDecisions.length,
        processed: learnings.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          validationDecisionsReviewed: validationDecisions.length,
          learningsCreated: learnings.length,
          skippedDuplicate: 0,
          learningBusinessKey: learningBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists610_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate610_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue610_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue610_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipExtractFirstAvailable610_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey610_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateValidatedLearnings610_(args) {
  const now = new Date();

  const rows = args.validationDecisions.map(decision => {
    const validationDecisionId = sciipExtractFirstAvailable610_(decision, [
      'Validation_Decision_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable610_(decision, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable610_(decision, [
      'Hypothesis_Type'
    ]);

    const validationDecision = sciipExtractFirstAvailable610_(decision, [
      'Validation_Decision'
    ]);

    const profile =
      sciipInferValidatedLearningProfile610_(decision);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey610_(validationDecisionId || hypothesisId || profile.learningTitle)}`;

    return [
      sciipGenerateId_('LRN'),
      rowKey,
      args.learningDate,
      validationDecisionId,
      hypothesisId,
      hypothesisType,
      validationDecision,
      profile.learningType,
      profile.learningTitle,
      profile.learningStatement,
      profile.whatSciipLearned,
      profile.graphUpdateRecommendation,
      profile.processorUpdateRecommendation,
      profile.futureSignalWeighting,
      profile.learningConfidence,
      profile.learningStatus,
      `HYPOTHESIS_VALIDATION_DECISIONS:${validationDecisionId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateValidatedLearningRows610_(rows);
}

function sciipInferValidatedLearningProfile610_(decision) {
  const hypothesisType = sciipExtractFirstAvailable610_(decision, [
    'Hypothesis_Type'
  ]);

  const validationDecision = sciipExtractFirstAvailable610_(decision, [
    'Validation_Decision'
  ]);

  const decisionRationale = sciipExtractFirstAvailable610_(decision, [
    'Decision_Rationale'
  ]);

  const supportingEvidence = sciipExtractFirstAvailable610_(decision, [
    'Supporting_Evidence'
  ]);

  const counterEvidence = sciipExtractFirstAvailable610_(decision, [
    'Counter_Evidence'
  ]);

  const evidenceGaps = sciipExtractFirstAvailable610_(decision, [
    'Evidence_Gaps'
  ]);

  const decisionConfidence =
    sciipExtractFirstAvailable610_(decision, [
      'Decision_Confidence'
    ]) || 'LOW';

  let learningType = 'MARKET_LEARNING';
  let learningTitle = `Learning from ${hypothesisType || 'hypothesis'} decision`;
  let learningStatement =
    'SCIIP captured a hypothesis validation decision as permanent learning history.';
  let whatSciipLearned =
    'SCIIP learned that the hypothesis requires additional evidence before it can become validated knowledge.';
  let graphUpdateRecommendation =
    'Preserve the hypothesis, validation decision, evidence gaps, and source linkage in the knowledge graph.';
  let processorUpdateRecommendation =
    'No processor change required. Continue routing similar hypotheses through evidence collection and validation.';
  let futureSignalWeighting =
    'MAINTAIN_CURRENT_WEIGHT';
  let learningStatus =
    'PENDING_ADDITIONAL_EVIDENCE';

  const decisionText = String(validationDecision || '').toUpperCase();

  if (decisionText === 'VALIDATED') {
    whatSciipLearned =
      'SCIIP learned that the hypothesis is supported by sufficient evidence and should strengthen future pattern recognition.';
    graphUpdateRecommendation =
      'Promote the hypothesis into validated graph knowledge and link it to supporting source evidence.';
    futureSignalWeighting =
      'INCREASE_WEIGHT';
    learningStatus =
      'VALIDATED_LEARNING';
  }

  if (decisionText === 'REJECTED') {
    whatSciipLearned =
      'SCIIP learned that the hypothesis was not supported and similar future signals should be treated with caution.';
    graphUpdateRecommendation =
      'Preserve rejected hypothesis history and link rejection rationale to future counter-signal recognition.';
    futureSignalWeighting =
      'DECREASE_WEIGHT';
    learningStatus =
      'REJECTED_LEARNING';
  }

  if (decisionText === 'CONTESTED') {
    whatSciipLearned =
      'SCIIP learned that the hypothesis contains conflicting evidence and requires human or additional validation.';
    graphUpdateRecommendation =
      'Preserve both supporting evidence and counterevidence as unresolved graph knowledge.';
    futureSignalWeighting =
      'FLAG_FOR_REVIEW';
    learningStatus =
      'CONTESTED_LEARNING';
  }

  if (decisionText === 'READY_FOR_OPERATOR_REVIEW') {
    whatSciipLearned =
      'SCIIP learned that the hypothesis has enough structure to require operator review but not enough final evidence for autonomous validation.';
    graphUpdateRecommendation =
      'Route the hypothesis and evidence assessment to operator review while preserving traceability.';
    futureSignalWeighting =
      'REVIEW_BEFORE_WEIGHT_CHANGE';
    learningStatus =
      'OPERATOR_REVIEW_REQUIRED';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    learningType = 'PROPERTY_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve property hypothesis generation, property evidence collection, and asset-level confidence scoring.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    learningType = 'COMPANY_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve company signal detection, occupier movement inference, and company requirement scoring.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    learningType = 'RISK_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve risk detection, severity scoring, and counterevidence routing.';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    learningType = 'OPPORTUNITY_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve opportunity detection, actionability scoring, and pursuit prioritization.';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    learningType = 'OPERATING_SYSTEM_LEARNING';
    processorUpdateRecommendation =
      'Use this learning to improve processor logic, schema design, graph completeness, or workflow automation.';
  }

  learningStatement =
    [
      `Validation decision: ${validationDecision || 'UNKNOWN'}.`,
      `Decision rationale: ${decisionRationale || 'No rationale recorded.'}`,
      `Supporting evidence: ${supportingEvidence || 'No supporting evidence recorded.'}`,
      `Counterevidence: ${counterEvidence || 'No counterevidence recorded.'}`,
      `Evidence gaps: ${evidenceGaps || 'No evidence gaps recorded.'}`
    ].join('\n');

  return {
    learningType,
    learningTitle,
    learningStatement,
    whatSciipLearned,
    graphUpdateRecommendation,
    processorUpdateRecommendation,
    futureSignalWeighting,
    learningConfidence: decisionConfidence,
    learningStatus
  };
}

function sciipDeduplicateValidatedLearningRows610_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestValidatedLearningProcessor() {
  const result = sciipRunValidatedLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestValidatedLearningProcessor',
    result: result
  }));

  return result;
}
