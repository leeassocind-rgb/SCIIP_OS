/************************************************************
 * 670_PredictiveScenarioProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - AUTONOMOUS_REASONING
 *
 * Output:
 * - PREDICTIVE_SCENARIOS
 ************************************************************/

const PREDICTIVE_SCENARIOS_SHEET =
  'PREDICTIVE_SCENARIOS';

const PREDICTIVE_SCENARIOS_HEADERS = [
  'Scenario_ID',
  'Business_Key',
  'Scenario_Date',
  'Reasoning_ID',
  'Memory_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Reasoning_Type',
  'Scenario_Type',
  'Scenario_Title',
  'Scenario_Statement',
  'Scenario_Driver',
  'Expected_Direction',
  'Probability_Assessment',
  'Strategic_Implication',
  'Market_Implication',
  'Operating_Implication',
  'Early_Indicators',
  'Monitoring_Action',
  'Scenario_Confidence',
  'Scenario_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsurePredictiveScenariosSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(PREDICTIVE_SCENARIOS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(PREDICTIVE_SCENARIOS_SHEET);
  }

  sheet.getRange(1, 1, 1, PREDICTIVE_SCENARIOS_HEADERS.length)
    .setValues([PREDICTIVE_SCENARIOS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunPredictiveScenarioProcessor() {
  const processor = '670_PredictiveScenarioProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsurePredictiveScenariosSchema();

  const scenarioDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `PREDICTIVE_SCENARIO|${scenarioDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      scenariosCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const reasoningOutputs = sciipGetRecordsByDate_(
    'AUTONOMOUS_REASONING',
    'Reasoning_Date',
    scenarioDate
  );

  if (reasoningOutputs.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      reasoningOutputsReviewed: 0,
      scenariosCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const scenarios = sciipCreatePredictiveScenarios_({
    businessKey,
    scenarioDate,
    reasoningOutputs,
    processor
  });

  scenarios.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    reasoningOutputsReviewed: reasoningOutputs.length,
    scenariosCreated: scenarios.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreatePredictiveScenarios_(args) {
  const now = new Date();

  const rows = args.reasoningOutputs.map(reasoning => {
    const reasoningId = sciipExtractFirstAvailable_(reasoning, [
      'Reasoning_ID'
    ]);

    const memoryId = sciipExtractFirstAvailable_(reasoning, [
      'Memory_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(reasoning, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(reasoning, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable_(reasoning, [
      'Signal_Category'
    ]);

    const reasoningType = sciipExtractFirstAvailable_(reasoning, [
      'Reasoning_Type'
    ]);

    const profile =
      sciipInferPredictiveScenarioProfile_(reasoning);

    const rowKey =
      `${args.businessKey}|${profile.scenarioType}|${sciipNormalizeMissionKey_(reasoningId || memoryId || hypothesisId || profile.scenarioTitle)}`;

    return [
      sciipGenerateId_('SCN'),
      rowKey,
      args.scenarioDate,
      reasoningId,
      memoryId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      reasoningType,
      profile.scenarioType,
      profile.scenarioTitle,
      profile.scenarioStatement,
      profile.scenarioDriver,
      profile.expectedDirection,
      profile.probabilityAssessment,
      profile.strategicImplication,
      profile.marketImplication,
      profile.operatingImplication,
      profile.earlyIndicators,
      profile.monitoringAction,
      profile.scenarioConfidence,
      'ACTIVE_SCENARIO',
      `AUTONOMOUS_REASONING:${reasoningId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicatePredictiveScenarioRows_(rows);
}

function sciipInferPredictiveScenarioProfile_(reasoning) {
  const hypothesisType = sciipExtractFirstAvailable_(reasoning, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable_(reasoning, [
    'Signal_Category'
  ]);

  const reasoningType = sciipExtractFirstAvailable_(reasoning, [
    'Reasoning_Type'
  ]);

  const strategicInterpretation = sciipExtractFirstAvailable_(reasoning, [
    'Strategic_Interpretation'
  ]);

  const futureImplication = sciipExtractFirstAvailable_(reasoning, [
    'Future_Implication'
  ]);

  const recommendedIntelligenceAction = sciipExtractFirstAvailable_(reasoning, [
    'Recommended_Intelligence_Action'
  ]);

  const recommendedOperatingAction = sciipExtractFirstAvailable_(reasoning, [
    'Recommended_Operating_Action'
  ]);

  const nextStrategicQuestion = sciipExtractFirstAvailable_(reasoning, [
    'Next_Strategic_Question'
  ]);

  const reasoningConfidence =
    sciipExtractFirstAvailable_(reasoning, [
      'Reasoning_Confidence'
    ]) || 'LOW';

  let scenarioType = 'GENERAL_MARKET_SCENARIO';
  let scenarioTitle = `Predictive scenario: ${signalCategory || 'general signal'}`;
  let scenarioDriver =
    signalCategory || 'General SCIIP intelligence signal';
  let expectedDirection = 'UNCERTAIN';
  let probabilityAssessment = 'POSSIBLE';
  let strategicImplication =
    futureImplication || 'This scenario may affect future SCIIP reasoning and intelligence prioritization.';
  let marketImplication =
    'Market implication is not yet specific enough for autonomous conclusion.';
  let operatingImplication =
    recommendedOperatingAction || 'Continue monitoring through future SCIIP processors.';
  let earlyIndicators =
    'Additional related signals, repeated evidence patterns, stronger source confirmation, or operator validation.';
  let monitoringAction =
    recommendedIntelligenceAction || 'Monitor for additional evidence and related signals.';
  let scenarioConfidence = reasoningConfidence;

  const reasoningTypeText = String(reasoningType || '').toUpperCase();

  if (reasoningTypeText === 'REINFORCEMENT_REASONING') {
    scenarioType = 'REINFORCED_PATTERN_SCENARIO';
    expectedDirection = 'INCREASING_RELEVANCE';
    probabilityAssessment = reasoningConfidence === 'MEDIUM' ? 'LIKELY' : 'POSSIBLE';
    marketImplication =
      'The underlying signal pattern may become more important if repeated across additional properties, companies, or market events.';
    earlyIndicators =
      'Repeated matching signals, stronger corroborating evidence, additional related hypotheses, or increased confidence from future validation.';
  }

  if (reasoningTypeText === 'SUPPRESSION_REASONING') {
    scenarioType = 'WEAKENED_PATTERN_SCENARIO';
    expectedDirection = 'DECREASING_RELEVANCE';
    probabilityAssessment = 'POSSIBLE';
    marketImplication =
      'The underlying signal pattern may be less reliable unless stronger supporting evidence appears.';
    earlyIndicators =
      'Repeated weak signals without corroboration, rejected hypotheses, contradictory evidence, or declining confidence.';
  }

  if (reasoningTypeText === 'GOVERNED_REASONING') {
    scenarioType = 'OPERATOR_REVIEW_SCENARIO';
    expectedDirection = 'PENDING_OPERATOR_DECISION';
    probabilityAssessment = 'REQUIRES_REVIEW';
    strategicImplication =
      'SCIIP should not autonomously resolve this scenario until operator review clarifies the proper reasoning path.';
    operatingImplication =
      'Route similar future cases to operator review before changing confidence, weight, or graph structure.';
    earlyIndicators =
      'Conflicting evidence, contested validation outcomes, high-priority unresolved reasoning, or repeated review flags.';
    monitoringAction =
      'Prepare operator-review packets and preserve supporting evidence and counterevidence.';
    scenarioConfidence = 'MEDIUM';
  }

  if (reasoningTypeText === 'STABILITY_REASONING') {
    scenarioType = 'STABILITY_SCENARIO';
    expectedDirection = 'BASELINE_CONTINUITY';
    probabilityAssessment = 'POSSIBLE';
    strategicImplication =
      'SCIIP should preserve the signal but avoid changing future model behavior until stronger evidence accumulates.';
    operatingImplication =
      'Maintain baseline processor behavior while monitoring for new evidence.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    scenarioTitle = 'Property predictive scenario';
    scenarioDriver = 'Property-level intelligence signal';
    marketImplication =
      'The scenario may affect property-level opportunity, risk, availability, tenant movement, asset confidence, or GIS-based reasoning.';
    earlyIndicators =
      'New property events, ownership changes, tenant activity, listing changes, GIS attribute updates, power/yard changes, or comparable activity.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    scenarioTitle = 'Company predictive scenario';
    scenarioDriver = 'Company-level intelligence signal';
    marketImplication =
      'The scenario may indicate future occupier movement, expansion, contraction, supplier activity, OEM linkage, or real estate demand.';
    earlyIndicators =
      'Funding, hiring, permits, facility movement, supplier announcements, OEM relationships, lease activity, or operational expansion.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    scenarioTitle = 'Risk predictive scenario';
    scenarioDriver = 'Risk intelligence signal';
    scenarioType = `RISK_${scenarioType}`;
    probabilityAssessment =
      probabilityAssessment === 'REQUIRES_REVIEW' ? probabilityAssessment : 'POSSIBLE';
    strategicImplication =
      'This scenario may expose a measurable risk that should be monitored for severity, timing, affected entities, and mitigation pathway.';
    operatingImplication =
      'Route into risk monitoring, counterevidence collection, and future alerting if repeated or strengthened.';
    earlyIndicators =
      'Negative market signals, vacancy exposure, tenant exposure, regulatory constraints, timing delays, contradictory evidence, or broker-observed weakness.';
    scenarioConfidence = reasoningConfidence === 'LOW' ? 'MEDIUM' : reasoningConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    scenarioTitle = 'Opportunity predictive scenario';
    scenarioDriver = 'Opportunity intelligence signal';
    scenarioType = `OPPORTUNITY_${scenarioType}`;
    strategicImplication =
      'This scenario may indicate an actionable opportunity if demand, timing, ownership fit, pricing, and target relevance are confirmed.';
    operatingImplication =
      'Route into opportunity monitoring, target validation, and future action recommendation if strengthened.';
    earlyIndicators =
      'Tenant demand, pricing gaps, ownership fit, limited supply, expansion signals, off-market movement, or repeated opportunity hypotheses.';
    scenarioConfidence = reasoningConfidence === 'LOW' ? 'MEDIUM' : reasoningConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    scenarioTitle = 'Operating system predictive scenario';
    scenarioDriver = 'SCIIP operating-system signal';
    scenarioType = `SYSTEM_${scenarioType}`;
    marketImplication =
      'Market implication is indirect; the scenario primarily affects SCIIP reasoning quality and operating performance.';
    operatingImplication =
      'Evaluate whether processor logic, schema design, graph completeness, workflow automation, or operator routing should change.';
    earlyIndicators =
      'Repeated processor friction, skipped records, duplicate patterns, missing fields, graph gaps, failed validation paths, or operator feedback.';
  }

  const scenarioStatement = [
    `SCIIP generated a forward-looking scenario from autonomous reasoning.`,
    `Reasoning type: ${reasoningType || 'UNKNOWN'}.`,
    `Signal category: ${signalCategory || 'UNKNOWN'}.`,
    `Strategic interpretation: ${strategicInterpretation || 'No strategic interpretation recorded.'}`,
    `Future implication: ${futureImplication || 'No future implication recorded.'}`,
    `Next strategic question: ${nextStrategicQuestion || 'No next strategic question recorded.'}`
  ].join('\n');

  return {
    scenarioType,
    scenarioTitle,
    scenarioStatement,
    scenarioDriver,
    expectedDirection,
    probabilityAssessment,
    strategicImplication,
    marketImplication,
    operatingImplication,
    earlyIndicators,
    monitoringAction,
    scenarioConfidence
  };
}

function sciipDeduplicatePredictiveScenarioRows_(rows) {
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

function sciipTestPredictiveScenarioProcessor() {
  const result =
    sciipRunPredictiveScenarioProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestPredictiveScenarioProcessor',
    result
  }));

  return result;
}