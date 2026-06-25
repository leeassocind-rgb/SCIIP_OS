/************************************************************
 * 630_SignalWeightOptimizationProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - KNOWLEDGE_EVOLUTION
 *
 * Output:
 * - SIGNAL_WEIGHT_OPTIMIZATION
 ************************************************************/

const SIGNAL_WEIGHT_OPTIMIZATION_SHEET =
  'SIGNAL_WEIGHT_OPTIMIZATION';

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
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(SIGNAL_WEIGHT_OPTIMIZATION_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SIGNAL_WEIGHT_OPTIMIZATION_SHEET);
  }

  sheet.getRange(1, 1, 1, SIGNAL_WEIGHT_OPTIMIZATION_HEADERS.length)
    .setValues([SIGNAL_WEIGHT_OPTIMIZATION_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunSignalWeightOptimizationProcessor() {
  const processor = '630_SignalWeightOptimizationProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureSignalWeightOptimizationSchema();

  const optimizationDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `SIGNAL_WEIGHT_OPTIMIZATION|${optimizationDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      signalWeightsOptimized: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const evolutions = sciipGetRecordsByDate_(
    'KNOWLEDGE_EVOLUTION',
    'Evolution_Date',
    optimizationDate
  );

  if (evolutions.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      knowledgeEvolutionsReviewed: 0,
      signalWeightsOptimized: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const optimizations = sciipCreateSignalWeightOptimizations_({
    businessKey,
    optimizationDate,
    evolutions,
    processor
  });

  optimizations.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    knowledgeEvolutionsReviewed: evolutions.length,
    signalWeightsOptimized: optimizations.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateSignalWeightOptimizations_(args) {
  const now = new Date();

  const rows = args.evolutions.map(evolution => {
    const evolutionId = sciipExtractFirstAvailable_(evolution, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable_(evolution, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(evolution, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(evolution, [
      'Hypothesis_Type'
    ]);

    const learningType = sciipExtractFirstAvailable_(evolution, [
      'Learning_Type'
    ]);

    const evolutionType = sciipExtractFirstAvailable_(evolution, [
      'Evolution_Type'
    ]);

    const profile =
      sciipInferSignalWeightOptimizationProfile_(evolution);

    const rowKey =
      `${args.businessKey}|${profile.signalCategory}|${sciipNormalizeMissionKey_(evolutionId || learningId || hypothesisId || profile.signalCategory)}`;

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

  return sciipDeduplicateSignalWeightOptimizationRows_(rows);
}

function sciipInferSignalWeightOptimizationProfile_(evolution) {
  const hypothesisType = sciipExtractFirstAvailable_(evolution, [
    'Hypothesis_Type'
  ]);

  const learningType = sciipExtractFirstAvailable_(evolution, [
    'Learning_Type'
  ]);

  const evolutionType = sciipExtractFirstAvailable_(evolution, [
    'Evolution_Type'
  ]);

  const signalWeightAdjustment = sciipExtractFirstAvailable_(evolution, [
    'Signal_Weight_Adjustment'
  ]);

  const evolutionPriority =
    sciipExtractFirstAvailable_(evolution, [
      'Evolution_Priority'
    ]) || 'MEDIUM';

  const evolutionRationale = sciipExtractFirstAvailable_(evolution, [
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

function sciipDeduplicateSignalWeightOptimizationRows_(rows) {
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