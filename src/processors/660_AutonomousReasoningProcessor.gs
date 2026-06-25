/************************************************************
 * 660_AutonomousReasoningProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - STRATEGIC_MEMORY
 *
 * Output:
 * - AUTONOMOUS_REASONING
 ************************************************************/

const AUTONOMOUS_REASONING_SHEET =
  'AUTONOMOUS_REASONING';

const AUTONOMOUS_REASONING_HEADERS = [
  'Reasoning_ID',
  'Business_Key',
  'Reasoning_Date',
  'Memory_ID',
  'Calibration_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Memory_Type',
  'Reasoning_Type',
  'Reasoning_Title',
  'Reasoning_Statement',
  'Strategic_Interpretation',
  'Future_Implication',
  'Recommended_Intelligence_Action',
  'Recommended_Operating_Action',
  'Next_Strategic_Question',
  'Reasoning_Confidence',
  'Reasoning_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousReasoningSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_REASONING_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_REASONING_SHEET);
  }

  sheet.getRange(1, 1, 1, AUTONOMOUS_REASONING_HEADERS.length)
    .setValues([AUTONOMOUS_REASONING_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunAutonomousReasoningProcessor() {
  const processor = '660_AutonomousReasoningProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureAutonomousReasoningSchema();

  const reasoningDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `AUTONOMOUS_REASONING|${reasoningDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      reasoningOutputsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const memories = sciipGetRecordsByDate_(
    'STRATEGIC_MEMORY',
    'Memory_Date',
    reasoningDate
  );

  if (memories.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      memoriesReviewed: 0,
      reasoningOutputsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const reasoningOutputs = sciipCreateAutonomousReasoningOutputs_({
    businessKey,
    reasoningDate,
    memories,
    processor
  });

  reasoningOutputs.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    memoriesReviewed: memories.length,
    reasoningOutputsCreated: reasoningOutputs.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateAutonomousReasoningOutputs_(args) {
  const now = new Date();

  const rows = args.memories.map(memory => {
    const memoryId = sciipExtractFirstAvailable_(memory, [
      'Memory_ID'
    ]);

    const calibrationId = sciipExtractFirstAvailable_(memory, [
      'Calibration_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(memory, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(memory, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable_(memory, [
      'Signal_Category'
    ]);

    const memoryType = sciipExtractFirstAvailable_(memory, [
      'Memory_Type'
    ]);

    const profile =
      sciipInferAutonomousReasoningProfile_(memory);

    const rowKey =
      `${args.businessKey}|${profile.reasoningType}|${sciipNormalizeMissionKey_(memoryId || calibrationId || hypothesisId || profile.reasoningTitle)}`;

    return [
      sciipGenerateId_('RSN'),
      rowKey,
      args.reasoningDate,
      memoryId,
      calibrationId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      memoryType,
      profile.reasoningType,
      profile.reasoningTitle,
      profile.reasoningStatement,
      profile.strategicInterpretation,
      profile.futureImplication,
      profile.recommendedIntelligenceAction,
      profile.recommendedOperatingAction,
      profile.nextStrategicQuestion,
      profile.reasoningConfidence,
      'GENERATED',
      `STRATEGIC_MEMORY:${memoryId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateAutonomousReasoningRows_(rows);
}

function sciipInferAutonomousReasoningProfile_(memory) {
  const hypothesisType = sciipExtractFirstAvailable_(memory, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable_(memory, [
    'Signal_Category'
  ]);

  const memoryType = sciipExtractFirstAvailable_(memory, [
    'Memory_Type'
  ]);

  const memoryStatement = sciipExtractFirstAvailable_(memory, [
    'Memory_Statement'
  ]);

  const strategicPrinciple = sciipExtractFirstAvailable_(memory, [
    'Strategic_Principle'
  ]);

  const patternToReinforce = sciipExtractFirstAvailable_(memory, [
    'Pattern_To_Reinforce'
  ]);

  const patternToSuppress = sciipExtractFirstAvailable_(memory, [
    'Pattern_To_Suppress'
  ]);

  const reasoningInstruction = sciipExtractFirstAvailable_(memory, [
    'Reasoning_Instruction'
  ]);

  const futureUseCase = sciipExtractFirstAvailable_(memory, [
    'Future_Use_Case'
  ]);

  const memoryConfidence =
    sciipExtractFirstAvailable_(memory, [
      'Memory_Confidence'
    ]) || 'LOW';

  let reasoningType = 'GENERAL_AUTONOMOUS_REASONING';
  let reasoningTitle = `Autonomous reasoning from ${signalCategory || 'strategic memory'}`;
  let strategicInterpretation =
    'SCIIP should preserve this memory as context for future hypothesis generation, evidence prioritization, and graph reasoning.';
  let futureImplication =
    'Future intelligence outputs should consider this memory when similar signals appear.';
  let recommendedIntelligenceAction =
    'Use this memory to inform future intelligence requirements, hypotheses, and validation plans.';
  let recommendedOperatingAction =
    'No immediate operating action required. Preserve the reasoning output for downstream scenario and prediction processors.';
  let nextStrategicQuestion =
    'What future signals would confirm that this memory should materially influence SCIIP reasoning?';
  let reasoningConfidence = memoryConfidence;

  const memoryTypeText = String(memoryType || '').toUpperCase();

  if (memoryTypeText === 'REINFORCEMENT_MEMORY') {
    reasoningType = 'REINFORCEMENT_REASONING';
    strategicInterpretation =
      'SCIIP has identified a pattern that should receive greater attention in future reasoning.';
    futureImplication =
      patternToReinforce || 'Similar signals should be more likely to influence future hypothesis generation.';
    recommendedIntelligenceAction =
      'Create or prioritize future intelligence requirements when similar reinforced signals appear.';
    recommendedOperatingAction =
      'Increase reasoning attention to this signal category in future autonomous processing.';
    nextStrategicQuestion =
      'Where else is this reinforced pattern appearing across properties, companies, markets, or system workflows?';
  }

  if (memoryTypeText === 'SUPPRESSION_MEMORY') {
    reasoningType = 'SUPPRESSION_REASONING';
    strategicInterpretation =
      'SCIIP has identified a pattern that should receive less weight unless stronger evidence is present.';
    futureImplication =
      patternToSuppress || 'Similar signals should be treated cautiously in future reasoning.';
    recommendedIntelligenceAction =
      'Require stronger corroborating evidence before escalating similar signals.';
    recommendedOperatingAction =
      'Reduce autonomous escalation of similar weak or previously rejected signals.';
    nextStrategicQuestion =
      'What evidence threshold should be required before this suppressed pattern becomes actionable again?';
  }

  if (memoryTypeText === 'OPERATOR_REVIEW_MEMORY') {
    reasoningType = 'GOVERNED_REASONING';
    strategicInterpretation =
      'SCIIP has identified a reasoning pattern that should not be autonomously resolved without operator review.';
    futureImplication =
      'Similar unresolved or contested signals should be routed to operator review before confidence or weighting changes.';
    recommendedIntelligenceAction =
      'Prepare concise operator-review packets when similar evidence conflicts arise.';
    recommendedOperatingAction =
      'Maintain governance over autonomous calibration and graph confidence changes.';
    nextStrategicQuestion =
      'What operator decision would allow SCIIP to safely automate this reasoning path in the future?';
    reasoningConfidence = 'MEDIUM';
  }

  if (memoryTypeText === 'STABILITY_MEMORY') {
    reasoningType = 'STABILITY_REASONING';
    strategicInterpretation =
      'SCIIP should preserve the signal history but avoid changing model behavior until stronger validated evidence accumulates.';
    futureImplication =
      'Similar future signals should remain at baseline priority unless additional evidence strengthens them.';
    recommendedIntelligenceAction =
      'Continue monitoring similar signals but do not escalate automatically.';
    recommendedOperatingAction =
      'Maintain baseline processor behavior.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    reasoningTitle = 'Property autonomous reasoning';
    nextStrategicQuestion =
      'Which property-level facts or GIS signals would make this reasoning more actionable?';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    reasoningTitle = 'Company autonomous reasoning';
    nextStrategicQuestion =
      'Which company movement, funding, hiring, permit, or facility signals would confirm this reasoning?';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    reasoningTitle = 'Risk autonomous reasoning';
    recommendedIntelligenceAction =
      'Prioritize risk-related intelligence requirements and counterevidence review.';
    recommendedOperatingAction =
      'Route high-impact risk reasoning into future alerting, briefing, or scenario processors.';
    reasoningConfidence = memoryConfidence === 'LOW' ? 'MEDIUM' : memoryConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    reasoningTitle = 'Opportunity autonomous reasoning';
    recommendedIntelligenceAction =
      'Prioritize opportunity-related intelligence requirements, target validation, and actionability review.';
    recommendedOperatingAction =
      'Route high-priority opportunity reasoning into future scenario, briefing, or action recommendation processors.';
    reasoningConfidence = memoryConfidence === 'LOW' ? 'MEDIUM' : memoryConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    reasoningTitle = 'Operating system autonomous reasoning';
    recommendedOperatingAction =
      'Evaluate whether processor logic, schema design, graph completeness, or workflow automation should be improved.';
    nextStrategicQuestion =
      'What operating-system change would most improve future SCIIP reasoning quality?';
  }

  const reasoningStatement = [
    `Memory type: ${memoryType || 'UNKNOWN'}.`,
    `Signal category: ${signalCategory || 'UNKNOWN'}.`,
    `Strategic principle: ${strategicPrinciple || 'No strategic principle recorded.'}`,
    `Reasoning instruction: ${reasoningInstruction || 'No reasoning instruction recorded.'}`,
    `Future use case: ${futureUseCase || 'No future use case recorded.'}`,
    `Memory basis: ${memoryStatement || 'No memory statement recorded.'}`
  ].join('\n');

  return {
    reasoningType,
    reasoningTitle,
    reasoningStatement,
    strategicInterpretation,
    futureImplication,
    recommendedIntelligenceAction,
    recommendedOperatingAction,
    nextStrategicQuestion,
    reasoningConfidence
  };
}

function sciipDeduplicateAutonomousReasoningRows_(rows) {
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

function sciipTestAutonomousReasoningProcessor() {
  const result =
    sciipRunAutonomousReasoningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousReasoningProcessor',
    result
  }));

  return result;
}