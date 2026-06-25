/************************************************************
 * 700_AutonomousActionRoutingProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - MONITORING_SIGNALS
 *
 * Output:
 * - AUTONOMOUS_ACTION_ROUTING
 ************************************************************/

const AUTONOMOUS_ACTION_ROUTING_SHEET =
  'AUTONOMOUS_ACTION_ROUTING';

const AUTONOMOUS_ACTION_ROUTING_HEADERS = [
  'Action_Route_ID',
  'Business_Key',
  'Route_Date',
  'Monitoring_Signal_ID',
  'Monitoring_ID',
  'Scenario_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Detected_Signal_Type',
  'Recommended_Action_Route',
  'Action_Route_Type',
  'Action_Route_Title',
  'Action_Route_Objective',
  'Destination_Workflow',
  'Routing_Reason',
  'Routing_Priority',
  'Escalation_Status',
  'Assigned_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousActionRoutingSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_ACTION_ROUTING_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_ACTION_ROUTING_SHEET);
  }

  sheet.getRange(1, 1, 1, AUTONOMOUS_ACTION_ROUTING_HEADERS.length)
    .setValues([AUTONOMOUS_ACTION_ROUTING_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunAutonomousActionRoutingProcessor() {
  const processor = '700_AutonomousActionRoutingProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureAutonomousActionRoutingSchema();

  const routeDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `AUTONOMOUS_ACTION_ROUTING|${routeDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      actionRoutesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const monitoringSignals = sciipGetRecordsByDate_(
    'MONITORING_SIGNALS',
    'Signal_Date',
    routeDate
  );

  if (monitoringSignals.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      monitoringSignalsReviewed: 0,
      actionRoutesCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const routes = sciipCreateAutonomousActionRoutes_({
    businessKey,
    routeDate,
    monitoringSignals,
    processor
  });

  routes.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    monitoringSignalsReviewed: monitoringSignals.length,
    actionRoutesCreated: routes.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateAutonomousActionRoutes_(args) {
  const now = new Date();

  const rows = args.monitoringSignals.map(signal => {
    const monitoringSignalId = sciipExtractFirstAvailable_(signal, [
      'Monitoring_Signal_ID'
    ]);

    const monitoringId = sciipExtractFirstAvailable_(signal, [
      'Monitoring_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable_(signal, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(signal, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(signal, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable_(signal, [
      'Signal_Category'
    ]);

    const detectedSignalType = sciipExtractFirstAvailable_(signal, [
      'Detected_Signal_Type'
    ]);

    const recommendedActionRoute = sciipExtractFirstAvailable_(signal, [
      'Recommended_Action_Route'
    ]);

    const profile =
      sciipInferAutonomousActionRouteProfile_(signal);

    const rowKey =
      `${args.businessKey}|${profile.actionRouteType}|${sciipNormalizeMissionKey_(monitoringSignalId || monitoringId || scenarioId || hypothesisId || profile.actionRouteTitle)}`;

    return [
      sciipGenerateId_('ART'),
      rowKey,
      args.routeDate,
      monitoringSignalId,
      monitoringId,
      scenarioId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      detectedSignalType,
      recommendedActionRoute,
      profile.actionRouteType,
      profile.actionRouteTitle,
      profile.actionRouteObjective,
      profile.destinationWorkflow,
      profile.routingReason,
      profile.routingPriority,
      profile.escalationStatus,
      'PENDING_ROUTE_REVIEW',
      `MONITORING_SIGNALS:${monitoringSignalId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateAutonomousActionRoutingRows_(rows);
}

function sciipInferAutonomousActionRouteProfile_(signal) {
  const hypothesisType = sciipExtractFirstAvailable_(signal, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable_(signal, [
    'Signal_Category'
  ]);

  const detectedSignalType = sciipExtractFirstAvailable_(signal, [
    'Detected_Signal_Type'
  ]);

  const detectedSignalStatement = sciipExtractFirstAvailable_(signal, [
    'Detected_Signal_Statement'
  ]);

  const detectionBasis = sciipExtractFirstAvailable_(signal, [
    'Detection_Basis'
  ]);

  const triggerState = sciipExtractFirstAvailable_(signal, [
    'Trigger_State'
  ]);

  const escalationReadiness = sciipExtractFirstAvailable_(signal, [
    'Escalation_Readiness'
  ]);

  const recommendedActionRoute = sciipExtractFirstAvailable_(signal, [
    'Recommended_Action_Route'
  ]);

  const signalConfidence =
    sciipExtractFirstAvailable_(signal, [
      'Signal_Confidence'
    ]) || 'LOW';

  const signalPriority =
    sciipExtractFirstAvailable_(signal, [
      'Signal_Priority'
    ]) || 'MEDIUM';

  let actionRouteType = 'MONITORING_CONTINUATION_ROUTE';
  let actionRouteTitle = 'Continue monitoring route';
  let actionRouteObjective =
    'Continue monitoring the signal until stronger evidence or trigger conditions appear.';
  let destinationWorkflow = 'SCENARIO_MONITORING';
  let escalationStatus = 'NOT_ESCALATED';
  let routingPriority = signalPriority;

  const routeText = String(recommendedActionRoute || '').toUpperCase();
  const signalText = String(detectedSignalType || '').toUpperCase();
  const escalationText = String(escalationReadiness || '').toUpperCase();

  if (
    routeText.includes('OPERATOR_REVIEW') ||
    signalText.includes('OPERATOR_REVIEW') ||
    escalationText.includes('OPERATOR')
  ) {
    actionRouteType = 'OPERATOR_REVIEW_ROUTE';
    actionRouteTitle = 'Operator review route';
    actionRouteObjective =
      'Route signal to operator review before autonomous confidence, graph, signal weight, or processor behavior changes are made.';
    destinationWorkflow = 'OPERATOR_CONSOLE';
    escalationStatus = 'ESCALATED_TO_OPERATOR_REVIEW';
    routingPriority = 'HIGH';
  }

  if (
    routeText.includes('INTELLIGENCE_REQUIREMENT') ||
    routeText.includes('INTELLIGENCE')
  ) {
    actionRouteType = 'INTELLIGENCE_REQUIREMENT_ROUTE';
    actionRouteTitle = 'Intelligence requirement route';
    actionRouteObjective =
      'Route signal into a new or prioritized intelligence requirement for further research and validation.';
    destinationWorkflow = 'INTELLIGENCE_REQUIREMENTS';
    escalationStatus = 'ESCALATED_TO_INTELLIGENCE_REQUIREMENT';
  }

  if (
    routeText.includes('PROPERTY_REVIEW') ||
    hypothesisType === 'PROPERTY_HYPOTHESIS'
  ) {
    actionRouteType = 'PROPERTY_REVIEW_ROUTE';
    actionRouteTitle = 'Property review route';
    actionRouteObjective =
      'Route signal into property review for asset facts, GIS data, ownership, tenant activity, availability, and comparable evidence.';
    destinationWorkflow = 'PROPERTY_REVIEW_QUEUE';
  }

  if (
    routeText.includes('COMPANY_RESEARCH') ||
    hypothesisType === 'COMPANY_HYPOTHESIS'
  ) {
    actionRouteType = 'COMPANY_RESEARCH_ROUTE';
    actionRouteTitle = 'Company research route';
    actionRouteObjective =
      'Route signal into company research for funding, hiring, permits, supplier/OEM relationships, occupier movement, and real estate demand evidence.';
    destinationWorkflow = 'COMPANY_RESEARCH_QUEUE';
  }

  if (
    routeText.includes('RISK') ||
    hypothesisType === 'RISK_HYPOTHESIS'
  ) {
    actionRouteType = 'RISK_REVIEW_ROUTE';
    actionRouteTitle = 'Risk review route';
    actionRouteObjective =
      'Route signal into risk review, counterevidence collection, severity assessment, and potential alerting.';
    destinationWorkflow = 'RISK_REVIEW_QUEUE';
    escalationStatus = 'ESCALATED_TO_RISK_REVIEW';
    routingPriority = 'HIGH';
  }

  if (
    routeText.includes('OPPORTUNITY') ||
    hypothesisType === 'OPPORTUNITY_HYPOTHESIS'
  ) {
    actionRouteType = 'OPPORTUNITY_REVIEW_ROUTE';
    actionRouteTitle = 'Opportunity review route';
    actionRouteObjective =
      'Route signal into opportunity review, target validation, timing review, and possible action recommendation.';
    destinationWorkflow = 'OPPORTUNITY_REVIEW_QUEUE';
    escalationStatus = 'ESCALATED_TO_OPPORTUNITY_REVIEW';
    routingPriority = 'HIGH';
  }

  if (
    routeText.includes('SYSTEM_IMPROVEMENT') ||
    hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS'
  ) {
    actionRouteType = 'SYSTEM_IMPROVEMENT_ROUTE';
    actionRouteTitle = 'System improvement route';
    actionRouteObjective =
      'Route signal into processor improvement, schema review, workflow automation, or graph completeness review.';
    destinationWorkflow = 'SYSTEM_IMPROVEMENT_QUEUE';
  }

  if (
    routeText.includes('CONTINUE') ||
    routeText.includes('BASELINE')
  ) {
    actionRouteType = 'MONITORING_CONTINUATION_ROUTE';
    actionRouteTitle = 'Continue monitoring route';
    actionRouteObjective =
      'Keep this signal under active monitoring without escalation until stronger evidence appears.';
    destinationWorkflow = 'SCENARIO_MONITORING';
    escalationStatus = 'NOT_ESCALATED';
  }

  const routingReason = [
    `Detected signal type: ${detectedSignalType || 'UNKNOWN'}.`,
    `Signal category: ${signalCategory || 'UNKNOWN'}.`,
    `Trigger state: ${triggerState || 'UNKNOWN'}.`,
    `Escalation readiness: ${escalationReadiness || 'UNKNOWN'}.`,
    `Recommended action route: ${recommendedActionRoute || 'UNKNOWN'}.`,
    `Signal confidence: ${signalConfidence}.`,
    `Detection basis: ${detectionBasis || 'No detection basis recorded.'}`,
    `Signal statement: ${detectedSignalStatement || 'No signal statement recorded.'}`
  ].join('\n');

  return {
    actionRouteType,
    actionRouteTitle,
    actionRouteObjective,
    destinationWorkflow,
    routingReason,
    routingPriority,
    escalationStatus
  };
}

function sciipDeduplicateAutonomousActionRoutingRows_(rows) {
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

function sciipTestAutonomousActionRoutingProcessor() {
  const result =
    sciipRunAutonomousActionRoutingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousActionRoutingProcessor',
    result
  }));

  return result;
}