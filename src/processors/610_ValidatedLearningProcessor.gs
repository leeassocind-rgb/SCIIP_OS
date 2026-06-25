/************************************************************
 * 610_ValidatedLearningProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - HYPOTHESIS_VALIDATION_DECISIONS
 *
 * Output:
 * - VALIDATED_LEARNINGS
 ************************************************************/

const VALIDATED_LEARNINGS_SHEET =
  'VALIDATED_LEARNINGS';

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
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(VALIDATED_LEARNINGS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(VALIDATED_LEARNINGS_SHEET);
  }

  sheet.getRange(1, 1, 1, VALIDATED_LEARNINGS_HEADERS.length)
    .setValues([VALIDATED_LEARNINGS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunValidatedLearningProcessor() {
  const processor = '610_ValidatedLearningProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureValidatedLearningsSchema();

  const learningDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `VALIDATED_LEARNING|${learningDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      learningsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const validationDecisions = sciipGetRecordsByDate_(
    'HYPOTHESIS_VALIDATION_DECISIONS',
    'Decision_Date',
    learningDate
  );

  if (validationDecisions.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      validationDecisionsReviewed: 0,
      learningsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const learnings = sciipCreateValidatedLearnings_({
    businessKey,
    learningDate,
    validationDecisions,
    processor
  });

  learnings.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    validationDecisionsReviewed: validationDecisions.length,
    learningsCreated: learnings.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateValidatedLearnings_(args) {
  const now = new Date();

  const rows = args.validationDecisions.map(decision => {
    const validationDecisionId = sciipExtractFirstAvailable_(decision, [
      'Validation_Decision_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(decision, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(decision, [
      'Hypothesis_Type'
    ]);

    const validationDecision = sciipExtractFirstAvailable_(decision, [
      'Validation_Decision'
    ]);

    const profile =
      sciipInferValidatedLearningProfile_(decision);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey_(validationDecisionId || hypothesisId || profile.learningTitle)}`;

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

  return sciipDeduplicateValidatedLearningRows_(rows);
}

function sciipInferValidatedLearningProfile_(decision) {
  const hypothesisType = sciipExtractFirstAvailable_(decision, [
    'Hypothesis_Type'
  ]);

  const validationDecision = sciipExtractFirstAvailable_(decision, [
    'Validation_Decision'
  ]);

  const decisionRationale = sciipExtractFirstAvailable_(decision, [
    'Decision_Rationale'
  ]);

  const supportingEvidence = sciipExtractFirstAvailable_(decision, [
    'Supporting_Evidence'
  ]);

  const counterEvidence = sciipExtractFirstAvailable_(decision, [
    'Counter_Evidence'
  ]);

  const evidenceGaps = sciipExtractFirstAvailable_(decision, [
    'Evidence_Gaps'
  ]);

  const decisionConfidence =
    sciipExtractFirstAvailable_(decision, [
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

function sciipDeduplicateValidatedLearningRows_(rows) {
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
  const result =
    sciipRunValidatedLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestValidatedLearningProcessor',
    result
  }));

  return result;
}