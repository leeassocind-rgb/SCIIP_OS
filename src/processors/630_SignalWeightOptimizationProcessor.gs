/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 630_SignalWeightOptimizationProcessor
 *
 * KNOWLEDGE_EVOLUTION → SIGNAL_WEIGHT_OPTIMIZATION
 *
 * Migration note:
 * Preserves original 630 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR = '630_SignalWeightOptimizationProcessor';
const SIGNAL_WEIGHT_OPTIMIZATION_SHEET = 'SIGNAL_WEIGHT_OPTIMIZATION';

const SIGNAL_WEIGHT_OPTIMIZATION_HEADERS = [
  'Signal_Weight_ID',
  'Business_Key',
  'Optimization_Date',
  'Evolution_ID',
  'Learning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Learning_Type',
  'Evolution_Type',
  'Signal_Category',
  'Current_Weight_Assumption',
  'Recommended_Weight_Action',
  'Recommended_Weight_Direction',
  'Recommended_Weight_Magnitude',
  'Optimization_Rationale',
  'Affected_Processor',
  'Affected_Graph_Object',
  'Implementation_Status',
  'Optimization_Priority',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureSignalWeightOptimizationSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SIGNAL_WEIGHT_OPTIMIZATION_SHEET,
    SIGNAL_WEIGHT_OPTIMIZATION_HEADERS
  );
}

function sciipRunSignalWeightOptimizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
    action: 'SIGNAL_WEIGHT_OPTIMIZATION_BUILD',
    sourceSheet: 'KNOWLEDGE_EVOLUTION',
    targetSheet: SIGNAL_WEIGHT_OPTIMIZATION_SHEET,
    ledgerSheet: 'SIGNAL_WEIGHT_OPTIMIZATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const evolutions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('KNOWLEDGE_EVOLUTION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: evolutions.length,
        outputCount: evolutions.length || 1,
        summary: 'Signal weight optimization runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
          inputSheets: ['KNOWLEDGE_EVOLUTION']
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
      const outputSheet = sciipEnsureSignalWeightOptimizationSchema();
      const optimizationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const optimizationBusinessKey = 'SIGNAL_WEIGHT_OPTIMIZATION|' + optimizationDate;

      if (sciipRuntimeBusinessKeyPrefixExists630_(definition.targetSheet, optimizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            signalWeightsOptimized: 0,
            skippedDuplicate: 1,
            optimizationBusinessKey: optimizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const evolutions = sciipGetRuntimeRecordsByDate630_(
        'KNOWLEDGE_EVOLUTION',
        'Evolution_Date',
        optimizationDate
      );

      if (evolutions.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeEvolutionsReviewed: 0,
            signalWeightsOptimized: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const optimizations = sciipCreateSignalWeightOptimizations630_({
        businessKey: optimizationBusinessKey,
        optimizationDate: optimizationDate,
        evolutions: evolutions,
        processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR
      });

      optimizations.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SIGNAL_WEIGHT_OPTIMIZATION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: optimizations.length,
        recordsRead: evolutions.length,
        processed: optimizations.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          knowledgeEvolutionsReviewed: evolutions.length,
          signalWeightsOptimized: optimizations.length,
          skippedDuplicate: 0,
          optimizationBusinessKey: optimizationBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists630_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate630_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue630_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue630_(value) {
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

function sciipExtractFirstAvailable630_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey630_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateSignalWeightOptimizations630_(args) {
  const now = new Date();

  const rows = args.evolutions.map(evolution => {
    const evolutionId = sciipExtractFirstAvailable630_(evolution, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable630_(evolution, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable630_(evolution, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable630_(evolution, [
      'Hypothesis_Type'
    ]);

    const learningType = sciipExtractFirstAvailable630_(evolution, [
      'Learning_Type'
    ]);

    const evolutionType = sciipExtractFirstAvailable630_(evolution, [
      'Evolution_Type'
    ]);

    const profile =
      sciipInferSignalWeightOptimizationProfile630_(evolution);

    const rowKey =
      `${args.businessKey}|${profile.signalCategory}|${sciipNormalizeMissionKey630_(evolutionId || learningId || hypothesisId || profile.signalCategory)}`;

    return [
      sciipGenerateId_('SWO'),
      rowKey,
      args.optimizationDate,
      evolutionId,
      learningId,
      hypothesisId,
      hypothesisType,
      learningType,
      evolutionType,
      profile.signalCategory,
      profile.currentWeightAssumption,
      profile.recommendedWeightAction,
      profile.recommendedWeightDirection,
      profile.recommendedWeightMagnitude,
      profile.optimizationRationale,
      profile.affectedProcessor,
      profile.affectedGraphObject,
      'PROPOSED',
      profile.optimizationPriority,
      `KNOWLEDGE_EVOLUTION:${evolutionId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateSignalWeightOptimizationRows630_(rows);
}

function sciipInferSignalWeightOptimizationProfile630_(evolution) {
  const hypothesisType = sciipExtractFirstAvailable630_(evolution, [
    'Hypothesis_Type'
  ]);

  const learningType = sciipExtractFirstAvailable630_(evolution, [
    'Learning_Type'
  ]);

  const evolutionType = sciipExtractFirstAvailable630_(evolution, [
    'Evolution_Type'
  ]);

  const signalWeightAdjustment = sciipExtractFirstAvailable630_(evolution, [
    'Signal_Weight_Adjustment'
  ]);

  const evolutionPriority =
    sciipExtractFirstAvailable630_(evolution, [
      'Evolution_Priority'
    ]) || 'MEDIUM';

  const evolutionRationale = sciipExtractFirstAvailable630_(evolution, [
    'Evolution_Rationale'
  ]);

  let signalCategory = 'GENERAL_MARKET_SIGNAL';
  let affectedProcessor = '560_HypothesisGenerationProcessor';
  let affectedGraphObject = 'MARKET_INTELLIGENCE_GRAPH';
  let currentWeightAssumption = 'BASELINE_WEIGHT';
  let recommendedWeightAction = 'MAINTAIN_SIGNAL_WEIGHT';
  let recommendedWeightDirection = 'NO_CHANGE';
  let recommendedWeightMagnitude = 'NONE';
  let optimizationPriority = evolutionPriority;

  const adjustment = String(signalWeightAdjustment || '').toUpperCase();
  const combined = [
    hypothesisType,
    learningType,
    evolutionType,
    signalWeightAdjustment,
    evolutionRationale
  ].join(' ').toLowerCase();

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    signalCategory = 'PROPERTY_SIGNAL';
    affectedProcessor = '560_HypothesisGenerationProcessor';
    affectedGraphObject = 'PROPERTY_KNOWLEDGE_GRAPH';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    signalCategory = 'COMPANY_SIGNAL';
    affectedProcessor = '560_HypothesisGenerationProcessor';
    affectedGraphObject = 'COMPANY_KNOWLEDGE_GRAPH';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    signalCategory = 'RISK_SIGNAL';
    affectedProcessor = '560_HypothesisGenerationProcessor';
    affectedGraphObject = 'RISK_INTELLIGENCE_GRAPH';
    optimizationPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    signalCategory = 'OPPORTUNITY_SIGNAL';
    affectedProcessor = '250_OpportunityDetectionProcessor';
    affectedGraphObject = 'OPPORTUNITY_INTELLIGENCE_GRAPH';
    optimizationPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    signalCategory = 'SYSTEM_SIGNAL';
    affectedProcessor = '490_SystemLearningProcessor';
    affectedGraphObject = 'SCIIP_OPERATING_GRAPH';
  }

  if (
    adjustment === 'INCREASE_WEIGHT' ||
    combined.includes('pattern_reinforcement') ||
    combined.includes('increase_weight')
  ) {
    recommendedWeightAction = 'INCREASE_SIGNAL_WEIGHT';
    recommendedWeightDirection = 'UP';
    recommendedWeightMagnitude =
      optimizationPriority === 'HIGH' ? 'MODERATE' : 'LOW';
  }

  if (
    adjustment === 'DECREASE_WEIGHT' ||
    combined.includes('pattern_suppression') ||
    combined.includes('decrease_weight')
  ) {
    recommendedWeightAction = 'DECREASE_SIGNAL_WEIGHT';
    recommendedWeightDirection = 'DOWN';
    recommendedWeightMagnitude =
      optimizationPriority === 'HIGH' ? 'MODERATE' : 'LOW';
  }

  if (
    adjustment === 'FLAG_FOR_REVIEW' ||
    adjustment === 'REVIEW_BEFORE_WEIGHT_CHANGE' ||
    combined.includes('conflict') ||
    combined.includes('operator_review')
  ) {
    recommendedWeightAction = 'FLAG_WEIGHT_FOR_OPERATOR_REVIEW';
    recommendedWeightDirection = 'REVIEW';
    recommendedWeightMagnitude = 'PENDING_REVIEW';
    optimizationPriority = 'HIGH';
  }

  if (
    adjustment === 'MAINTAIN_CURRENT_WEIGHT' ||
    combined.includes('needs_more_evidence') ||
    combined.includes('pending_evidence')
  ) {
    recommendedWeightAction = 'MAINTAIN_SIGNAL_WEIGHT';
    recommendedWeightDirection = 'NO_CHANGE';
    recommendedWeightMagnitude = 'NONE';
  }

  const optimizationRationale = [
    `Signal category: ${signalCategory}.`,
    `Hypothesis type: ${hypothesisType || 'UNKNOWN'}.`,
    `Learning type: ${learningType || 'UNKNOWN'}.`,
    `Evolution type: ${evolutionType || 'UNKNOWN'}.`,
    `Knowledge evolution recommended signal adjustment: ${signalWeightAdjustment || 'UNKNOWN'}.`,
    `Recommended action: ${recommendedWeightAction}.`,
    `Rationale: ${evolutionRationale || 'No evolution rationale recorded.'}`
  ].join('\n');

  return {
    signalCategory,
    currentWeightAssumption,
    recommendedWeightAction,
    recommendedWeightDirection,
    recommendedWeightMagnitude,
    optimizationRationale,
    affectedProcessor,
    affectedGraphObject,
    optimizationPriority
  };
}

function sciipDeduplicateSignalWeightOptimizationRows630_(rows) {
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

function sciipTestSignalWeightOptimizationProcessor() {
  const result =
    sciipRunSignalWeightOptimizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestSignalWeightOptimizationProcessor',
    result
  }));

  return result;
}