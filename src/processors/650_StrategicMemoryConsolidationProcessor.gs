/************************************************************
 * 650_StrategicMemoryConsolidationProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - AUTONOMOUS_MODEL_CALIBRATION
 *
 * Output:
 * - STRATEGIC_MEMORY
 ************************************************************/

const STRATEGIC_MEMORY_SHEET =
  'STRATEGIC_MEMORY';

const STRATEGIC_MEMORY_HEADERS = [
  'Memory_ID',
  'Business_Key',
  'Memory_Date',
  'Calibration_ID',
  'Signal_Weight_ID',
  'Evolution_ID',
  'Learning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Memory_Type',
  'Memory_Title',
  'Memory_Statement',
  'Strategic_Principle',
  'Pattern_To_Reinforce',
  'Pattern_To_Suppress',
  'Reasoning_Instruction',
  'Future_Use_Case',
  'Memory_Confidence',
  'Memory_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureStrategicMemorySchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(STRATEGIC_MEMORY_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(STRATEGIC_MEMORY_SHEET);
  }

  sheet.getRange(1, 1, 1, STRATEGIC_MEMORY_HEADERS.length)
    .setValues([STRATEGIC_MEMORY_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunStrategicMemoryConsolidationProcessor() {
  const processor = '650_StrategicMemoryConsolidationProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureStrategicMemorySchema();

  const memoryDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `STRATEGIC_MEMORY|${memoryDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      memoriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const calibrations = sciipGetRecordsByDate_(
    'AUTONOMOUS_MODEL_CALIBRATION',
    'Calibration_Date',
    memoryDate
  );

  if (calibrations.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      calibrationsReviewed: 0,
      memoriesCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const memories = sciipCreateStrategicMemories_({
    businessKey,
    memoryDate,
    calibrations,
    processor
  });

  memories.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    calibrationsReviewed: calibrations.length,
    memoriesCreated: memories.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateStrategicMemories_(args) {
  const now = new Date();

  const rows = args.calibrations.map(calibration => {
    const calibrationId = sciipExtractFirstAvailable_(calibration, [
      'Calibration_ID'
    ]);

    const signalWeightId = sciipExtractFirstAvailable_(calibration, [
      'Signal_Weight_ID'
    ]);

    const evolutionId = sciipExtractFirstAvailable_(calibration, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable_(calibration, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(calibration, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(calibration, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable_(calibration, [
      'Signal_Category'
    ]);

    const profile =
      sciipInferStrategicMemoryProfile_(calibration);

    const rowKey =
      `${args.businessKey}|${profile.memoryType}|${sciipNormalizeMissionKey_(calibrationId || signalWeightId || evolutionId || learningId || hypothesisId || profile.memoryTitle)}`;

    return [
      sciipGenerateId_('MEM'),
      rowKey,
      args.memoryDate,
      calibrationId,
      signalWeightId,
      evolutionId,
      learningId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      profile.memoryType,
      profile.memoryTitle,
      profile.memoryStatement,
      profile.strategicPrinciple,
      profile.patternToReinforce,
      profile.patternToSuppress,
      profile.reasoningInstruction,
      profile.futureUseCase,
      profile.memoryConfidence,
      'CONSOLIDATED',
      `AUTONOMOUS_MODEL_CALIBRATION:${calibrationId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateStrategicMemoryRows_(rows);
}

function sciipInferStrategicMemoryProfile_(calibration) {
  const hypothesisType = sciipExtractFirstAvailable_(calibration, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable_(calibration, [
    'Signal_Category'
  ]);

  const calibrationType = sciipExtractFirstAvailable_(calibration, [
    'Calibration_Type'
  ]);

  const calibrationAction = sciipExtractFirstAvailable_(calibration, [
    'Calibration_Action'
  ]);

  const calibrationDirection = sciipExtractFirstAvailable_(calibration, [
    'Calibration_Direction'
  ]);

  const calibrationMagnitude = sciipExtractFirstAvailable_(calibration, [
    'Calibration_Magnitude'
  ]);

  const calibrationRationale = sciipExtractFirstAvailable_(calibration, [
    'Calibration_Rationale'
  ]);

  const expectedModelEffect = sciipExtractFirstAvailable_(calibration, [
    'Expected_Model_Effect'
  ]);

  const calibrationPriority =
    sciipExtractFirstAvailable_(calibration, [
      'Calibration_Priority'
    ]) || 'MEDIUM';

  let memoryType = 'GENERAL_STRATEGIC_MEMORY';
  let memoryTitle = `Strategic memory: ${signalCategory || 'general signal'}`;
  let strategicPrinciple =
    'Preserve validated calibration history so future SCIIP reasoning can improve without overwriting prior evidence.';
  let patternToReinforce = 'NONE';
  let patternToSuppress = 'NONE';
  let reasoningInstruction =
    'Use this memory as context when generating future hypotheses, weighing evidence, and routing validation work.';
  let futureUseCase =
    'Future autonomous reasoning, hypothesis generation, evidence prioritization, and graph confidence adjustment.';
  let memoryConfidence =
    calibrationPriority === 'HIGH' ? 'MEDIUM' : 'LOW';

  const action = String(calibrationAction || '').toUpperCase();
  const direction = String(calibrationDirection || '').toUpperCase();

  if (
    action === 'CALIBRATE_MODEL_TO_PRIORITIZE_SIGNAL' ||
    direction === 'INCREASE_SENSITIVITY'
  ) {
    memoryType = 'REINFORCEMENT_MEMORY';
    patternToReinforce =
      `${signalCategory || 'This signal category'} should receive greater attention in future reasoning.`;
    reasoningInstruction =
      'When similar signals appear again, raise their priority during hypothesis generation and evidence routing.';
    memoryConfidence =
      calibrationMagnitude === 'MODERATE' ? 'MEDIUM' : memoryConfidence;
  }

  if (
    action === 'CALIBRATE_MODEL_TO_DOWNWEIGHT_SIGNAL' ||
    direction === 'DECREASE_SENSITIVITY'
  ) {
    memoryType = 'SUPPRESSION_MEMORY';
    patternToSuppress =
      `${signalCategory || 'This signal category'} should receive reduced weight unless supported by stronger evidence.`;
    reasoningInstruction =
      'When similar signals appear again, require stronger evidence before escalating them into high-priority hypotheses.';
    memoryConfidence =
      calibrationMagnitude === 'MODERATE' ? 'MEDIUM' : memoryConfidence;
  }

  if (
    action === 'ROUTE_CALIBRATION_TO_OPERATOR_REVIEW' ||
    direction === 'PENDING_REVIEW'
  ) {
    memoryType = 'OPERATOR_REVIEW_MEMORY';
    strategicPrinciple =
      'SCIIP should preserve unresolved calibration conflicts and route similar future cases to operator review.';
    reasoningInstruction =
      'Do not autonomously change confidence or signal weighting for similar cases until operator review resolves the conflict.';
    futureUseCase =
      'Operator review routing, conflict-aware reasoning, and calibration governance.';
    memoryConfidence = 'MEDIUM';
  }

  if (
    action === 'MAINTAIN_MODEL_BEHAVIOR' ||
    direction === 'NO_CHANGE'
  ) {
    memoryType = 'STABILITY_MEMORY';
    strategicPrinciple =
      'SCIIP should preserve this signal history but avoid changing future model behavior until stronger validated evidence exists.';
    reasoningInstruction =
      'Maintain baseline reasoning behavior for similar future signals unless additional validated learning accumulates.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    memoryTitle = 'Property strategic memory';
    futureUseCase =
      'Future property hypothesis generation, asset confidence scoring, GIS evidence routing, and property graph enrichment.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    memoryTitle = 'Company strategic memory';
    futureUseCase =
      'Future company signal detection, occupier movement inference, supplier/OEM analysis, and company graph enrichment.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    memoryTitle = 'Risk strategic memory';
    futureUseCase =
      'Future risk detection, severity scoring, counterevidence routing, and mitigation prioritization.';
    memoryConfidence = 'MEDIUM';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    memoryTitle = 'Opportunity strategic memory';
    futureUseCase =
      'Future opportunity detection, actionability scoring, pursuit prioritization, and market timing reasoning.';
    memoryConfidence = 'MEDIUM';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    memoryTitle = 'Operating system strategic memory';
    futureUseCase =
      'Future processor improvement, graph completeness review, schema evolution, workflow automation, and autonomous reasoning calibration.';
  }

  const memoryStatement = [
    `Calibration type: ${calibrationType || 'UNKNOWN'}.`,
    `Calibration action: ${calibrationAction || 'UNKNOWN'}.`,
    `Calibration direction: ${calibrationDirection || 'UNKNOWN'}.`,
    `Calibration magnitude: ${calibrationMagnitude || 'UNKNOWN'}.`,
    `Expected model effect: ${expectedModelEffect || 'No expected effect recorded.'}`,
    `Rationale: ${calibrationRationale || 'No calibration rationale recorded.'}`
  ].join('\n');

  return {
    memoryType,
    memoryTitle,
    memoryStatement,
    strategicPrinciple,
    patternToReinforce,
    patternToSuppress,
    reasoningInstruction,
    futureUseCase,
    memoryConfidence
  };
}

function sciipDeduplicateStrategicMemoryRows_(rows) {
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

function sciipTestStrategicMemoryConsolidationProcessor() {
  const result =
    sciipRunStrategicMemoryConsolidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestStrategicMemoryConsolidationProcessor',
    result
  }));

  return result;
}