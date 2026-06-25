/************************************************************
 * 690_MonitoringSignalDetectionProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - SCENARIO_MONITORING
 *
 * Output:
 * - MONITORING_SIGNALS
 ************************************************************/

const MONITORING_SIGNALS_SHEET =
  'MONITORING_SIGNALS';

const MONITORING_SIGNALS_HEADERS = [
  'Monitoring_Signal_ID',
  'Business_Key',
  'Signal_Date',
  'Monitoring_ID',
  'Scenario_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Monitoring_Type',
  'Detected_Signal_Type',
  'Detected_Signal_Title',
  'Detected_Signal_Statement',
  'Detection_Basis',
  'Trigger_Condition',
  'Trigger_State',
  'Escalation_Readiness',
  'Recommended_Action_Route',
  'Signal_Confidence',
  'Signal_Priority',
  'Signal_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureMonitoringSignalsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(MONITORING_SIGNALS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(MONITORING_SIGNALS_SHEET);
  }

  sheet.getRange(1, 1, 1, MONITORING_SIGNALS_HEADERS.length)
    .setValues([MONITORING_SIGNALS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunMonitoringSignalDetectionProcessor() {
  const processor = '690_MonitoringSignalDetectionProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureMonitoringSignalsSchema();

  const signalDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `MONITORING_SIGNAL|${signalDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      monitoringSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const monitoringRequirements = sciipGetRecordsByDate_(
    'SCENARIO_MONITORING',
    'Monitoring_Date',
    signalDate
  );

  if (monitoringRequirements.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      monitoringRequirementsReviewed: 0,
      monitoringSignalsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const signals =
    sciipCreateMonitoringSignals_({
      businessKey,
      signalDate,
      monitoringRequirements,
      processor
    });

  signals.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    monitoringRequirementsReviewed: monitoringRequirements.length,
    monitoringSignalsCreated: signals.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateMonitoringSignals_(args) {
  const now = new Date();

  const rows = args.monitoringRequirements.map(monitoring => {
    const monitoringId = sciipExtractFirstAvailable_(monitoring, [
      'Monitoring_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable_(monitoring, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(monitoring, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(monitoring, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable_(monitoring, [
      'Signal_Category'
    ]);

    const monitoringType = sciipExtractFirstAvailable_(monitoring, [
      'Monitoring_Type'
    ]);

    const profile =
      sciipInferMonitoringSignalProfile_(monitoring);

    const rowKey =
      `${args.businessKey}|${profile.detectedSignalType}|${sciipNormalizeMissionKey_(monitoringId || scenarioId || hypothesisId || profile.detectedSignalTitle)}`;

    return [
      sciipGenerateId_('MSG'),
      rowKey,
      args.signalDate,
      monitoringId,
      scenarioId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      monitoringType,
      profile.detectedSignalType,
      profile.detectedSignalTitle,
      profile.detectedSignalStatement,
      profile.detectionBasis,
      profile.triggerCondition,
      profile.triggerState,
      profile.escalationReadiness,
      profile.recommendedActionRoute,
      profile.signalConfidence,
      profile.signalPriority,
      'DETECTED_MONITORING_SIGNAL',
      `SCENARIO_MONITORING:${monitoringId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateMonitoringSignalRows_(rows);
}

function sciipInferMonitoringSignalProfile_(monitoring) {
  const hypothesisType = sciipExtractFirstAvailable_(monitoring, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable_(monitoring, [
    'Signal_Category'
  ]);

  const monitoringType = sciipExtractFirstAvailable_(monitoring, [
    'Monitoring_Type'
  ]);

  const monitoringTitle = sciipExtractFirstAvailable_(monitoring, [
    'Monitoring_Title'
  ]);

  const monitoringObjective = sciipExtractFirstAvailable_(monitoring, [
    'Monitoring_Objective'
  ]);

  const triggerCondition = sciipExtractFirstAvailable_(monitoring, [
    'Trigger_Condition'
  ]);

  const earlyIndicators = sciipExtractFirstAvailable_(monitoring, [
    'Early_Indicators'
  ]);

  const escalationCondition = sciipExtractFirstAvailable_(monitoring, [
    'Escalation_Condition'
  ]);

  const recommendedResponse = sciipExtractFirstAvailable_(monitoring, [
    'Recommended_Response'
  ]);

  const monitoringPriority =
    sciipExtractFirstAvailable_(monitoring, [
      'Monitoring_Priority'
    ]) || 'MEDIUM';

  let detectedSignalType = 'EXPECTED_MONITORING_SIGNAL';
  let detectedSignalTitle = `Monitoring signal: ${monitoringTitle || signalCategory || 'general signal'}`;
  let triggerState = 'WATCHING';
  let escalationReadiness = 'NOT_READY';
  let recommendedActionRoute = 'CONTINUE_MONITORING';
  let signalConfidence = monitoringPriority === 'HIGH' ? 'MEDIUM' : 'LOW';
  let signalPriority = monitoringPriority;

  const monitoringTypeText = String(monitoringType || '').toUpperCase();

  if (monitoringTypeText.includes('REINFORCED')) {
    detectedSignalType = 'REINFORCED_PATTERN_SIGNAL';
    triggerState = 'WATCHING_FOR_REPEAT_CONFIRMATION';
    escalationReadiness = 'READY_IF_REPEATED';
    recommendedActionRoute = 'ROUTE_TO_INTELLIGENCE_REQUIREMENT_IF_CONFIRMED';
    signalPriority = 'HIGH';
  }

  if (monitoringTypeText.includes('WEAKENED')) {
    detectedSignalType = 'WEAKENED_PATTERN_SIGNAL';
    triggerState = 'WATCHING_FOR_STRONGER_CORROBORATION';
    escalationReadiness = 'NOT_READY';
    recommendedActionRoute = 'REQUIRE_STRONGER_EVIDENCE_BEFORE_ESCALATION';
  }

  if (monitoringTypeText.includes('OPERATOR_REVIEW')) {
    detectedSignalType = 'OPERATOR_REVIEW_SIGNAL';
    triggerState = 'REVIEW_REQUIRED_IF_CONFLICT_REPEATS';
    escalationReadiness = 'READY_FOR_OPERATOR_REVIEW';
    recommendedActionRoute = 'ROUTE_TO_OPERATOR_REVIEW';
    signalConfidence = 'MEDIUM';
    signalPriority = 'HIGH';
  }

  if (monitoringTypeText.includes('STABILITY')) {
    detectedSignalType = 'STABILITY_SIGNAL';
    triggerState = 'BASELINE_MONITORING';
    escalationReadiness = 'NOT_READY';
    recommendedActionRoute = 'CONTINUE_BASELINE_MONITORING';
    signalPriority = 'LOW';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    detectedSignalType = `PROPERTY_${detectedSignalType}`;
    detectedSignalTitle = 'Property monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_PROPERTY_REVIEW_IF_TRIGGERED';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    detectedSignalType = `COMPANY_${detectedSignalType}`;
    detectedSignalTitle = 'Company monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_COMPANY_RESEARCH_IF_TRIGGERED';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    detectedSignalType = `RISK_${detectedSignalType}`;
    detectedSignalTitle = 'Risk monitoring signal';
    escalationReadiness = 'READY_FOR_RISK_REVIEW';
    recommendedActionRoute =
      'ROUTE_TO_RISK_REVIEW_OR_ALERTING';
    signalPriority = 'HIGH';
    signalConfidence = signalConfidence === 'LOW' ? 'MEDIUM' : signalConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    detectedSignalType = `OPPORTUNITY_${detectedSignalType}`;
    detectedSignalTitle = 'Opportunity monitoring signal';
    escalationReadiness = 'READY_FOR_OPPORTUNITY_REVIEW';
    recommendedActionRoute =
      'ROUTE_TO_OPPORTUNITY_REVIEW_OR_ACTION_RECOMMENDATION';
    signalPriority = 'HIGH';
    signalConfidence = signalConfidence === 'LOW' ? 'MEDIUM' : signalConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    detectedSignalType = `SYSTEM_${detectedSignalType}`;
    detectedSignalTitle = 'Operating system monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_SYSTEM_IMPROVEMENT_REVIEW';
  }

  const detectionBasis = [
    `Monitoring type: ${monitoringType || 'UNKNOWN'}.`,
    `Signal category: ${signalCategory || 'UNKNOWN'}.`,
    `Monitoring objective: ${monitoringObjective || 'No monitoring objective recorded.'}`,
    `Early indicators: ${earlyIndicators || 'No early indicators recorded.'}`,
    `Escalation condition: ${escalationCondition || 'No escalation condition recorded.'}`,
    `Recommended response: ${recommendedResponse || 'No recommended response recorded.'}`
  ].join('\n');

  const detectedSignalStatement = [
    'SCIIP generated a monitoring signal from an active scenario monitoring requirement.',
    `Detected signal type: ${detectedSignalType}.`,
    `Trigger state: ${triggerState}.`,
    `Escalation readiness: ${escalationReadiness}.`,
    `Recommended action route: ${recommendedActionRoute}.`
  ].join('\n');

  return {
    detectedSignalType,
    detectedSignalTitle,
    detectedSignalStatement,
    detectionBasis,
    triggerCondition,
    triggerState,
    escalationReadiness,
    recommendedActionRoute,
    signalConfidence,
    signalPriority
  };
}

function sciipDeduplicateMonitoringSignalRows_(rows) {
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

function sciipTestMonitoringSignalDetectionProcessor() {
  const result =
    sciipRunMonitoringSignalDetectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestMonitoringSignalDetectionProcessor',
    result
  }));

  return result;
}