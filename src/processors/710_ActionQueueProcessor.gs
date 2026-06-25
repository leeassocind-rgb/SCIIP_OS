/************************************************************
 * 710_ActionQueueProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - AUTONOMOUS_ACTION_ROUTING
 *
 * Output:
 * - ACTION_QUEUE
 ************************************************************/

const ACTION_QUEUE_SHEET =
  'ACTION_QUEUE';

const ACTION_QUEUE_HEADERS = [
  'Action_Item_ID',
  'Business_Key',
  'Queue_Date',
  'Action_Route_ID',
  'Monitoring_Signal_ID',
  'Scenario_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Action_Route_Type',
  'Destination_Workflow',
  'Action_Item_Type',
  'Action_Title',
  'Action_Objective',
  'Execution_Instructions',
  'Required_Input',
  'Expected_Output',
  'Priority',
  'Due_Status',
  'Queue_Status',
  'Assigned_Owner',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureActionQueueSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(ACTION_QUEUE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(ACTION_QUEUE_SHEET);
  }

  sheet.getRange(1, 1, 1, ACTION_QUEUE_HEADERS.length)
    .setValues([ACTION_QUEUE_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunActionQueueProcessor() {
  const processor = '710_ActionQueueProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureActionQueueSchema();

  const queueDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `ACTION_QUEUE|${queueDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      actionItemsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const actionRoutes = sciipGetRecordsByDate_(
    'AUTONOMOUS_ACTION_ROUTING',
    'Route_Date',
    queueDate
  );

  if (actionRoutes.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      actionRoutesReviewed: 0,
      actionItemsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const actionItems =
    sciipCreateActionQueueItems_({
      businessKey,
      queueDate,
      actionRoutes,
      processor
    });

  actionItems.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    actionRoutesReviewed: actionRoutes.length,
    actionItemsCreated: actionItems.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateActionQueueItems_(args) {
  const now = new Date();

  const rows = args.actionRoutes.map(route => {
    const actionRouteId = sciipExtractFirstAvailable_(route, [
      'Action_Route_ID'
    ]);

    const monitoringSignalId = sciipExtractFirstAvailable_(route, [
      'Monitoring_Signal_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable_(route, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(route, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(route, [
      'Hypothesis_Type'
    ]);

    const actionRouteType = sciipExtractFirstAvailable_(route, [
      'Action_Route_Type'
    ]);

    const destinationWorkflow = sciipExtractFirstAvailable_(route, [
      'Destination_Workflow'
    ]);

    const profile =
      sciipInferActionQueueProfile_(route);

    const rowKey =
      `${args.businessKey}|${profile.actionItemType}|${sciipNormalizeMissionKey_(actionRouteId || monitoringSignalId || scenarioId || hypothesisId || profile.actionTitle)}`;

    return [
      sciipGenerateId_('AQI'),
      rowKey,
      args.queueDate,
      actionRouteId,
      monitoringSignalId,
      scenarioId,
      hypothesisId,
      hypothesisType,
      actionRouteType,
      destinationWorkflow,
      profile.actionItemType,
      profile.actionTitle,
      profile.actionObjective,
      profile.executionInstructions,
      profile.requiredInput,
      profile.expectedOutput,
      profile.priority,
      profile.dueStatus,
      'QUEUED',
      profile.assignedOwner,
      `AUTONOMOUS_ACTION_ROUTING:${actionRouteId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateActionQueueRows_(rows);
}

function sciipInferActionQueueProfile_(route) {
  const hypothesisType = sciipExtractFirstAvailable_(route, [
    'Hypothesis_Type'
  ]);

  const actionRouteType = sciipExtractFirstAvailable_(route, [
    'Action_Route_Type'
  ]);

  const actionRouteTitle = sciipExtractFirstAvailable_(route, [
    'Action_Route_Title'
  ]);

  const actionRouteObjective = sciipExtractFirstAvailable_(route, [
    'Action_Route_Objective'
  ]);

  const destinationWorkflow = sciipExtractFirstAvailable_(route, [
    'Destination_Workflow'
  ]);

  const routingReason = sciipExtractFirstAvailable_(route, [
    'Routing_Reason'
  ]);

  const routingPriority =
    sciipExtractFirstAvailable_(route, [
      'Routing_Priority'
    ]) || 'MEDIUM';

  let actionItemType = 'GENERAL_ACTION_ITEM';
  let actionTitle = actionRouteTitle || 'Review routed SCIIP action';
  let actionObjective =
    actionRouteObjective || 'Review routed action and determine next step.';
  let executionInstructions =
    'Review the routed signal, source record, routing reason, and determine whether additional research, review, or escalation is required.';
  let requiredInput =
    'Action route record, source monitoring signal, scenario context, and routing reason.';
  let expectedOutput =
    'Completed review with decision, notes, and next action.';
  let priority = routingPriority;
  let dueStatus = routingPriority === 'HIGH' ? 'DUE_NOW' : 'NORMAL';
  let assignedOwner = 'OPERATOR';

  const routeText = String(actionRouteType || '').toUpperCase();
  const workflowText = String(destinationWorkflow || '').toUpperCase();

  if (
    routeText.includes('OPERATOR_REVIEW') ||
    workflowText.includes('OPERATOR')
  ) {
    actionItemType = 'OPERATOR_REVIEW_ACTION';
    actionTitle = 'Operator review required';
    executionInstructions =
      'Review the routed signal before SCIIP changes graph confidence, signal weights, processor behavior, or action recommendations.';
    expectedOutput =
      'Operator decision: approve, reject, defer, or request additional evidence.';
    priority = 'HIGH';
    dueStatus = 'DUE_NOW';
    assignedOwner = 'OPERATOR';
  }

  if (
    routeText.includes('INTELLIGENCE_REQUIREMENT') ||
    workflowText.includes('INTELLIGENCE')
  ) {
    actionItemType = 'INTELLIGENCE_REQUIREMENT_ACTION';
    actionTitle = 'Create or prioritize intelligence requirement';
    executionInstructions =
      'Convert the routed signal into a new or prioritized intelligence requirement for research and validation.';
    expectedOutput =
      'New or updated intelligence requirement linked to the originating signal.';
    assignedOwner = 'SCIIP_INTELLIGENCE_PIPELINE';
  }

  if (
    routeText.includes('PROPERTY_REVIEW') ||
    hypothesisType === 'PROPERTY_HYPOTHESIS'
  ) {
    actionItemType = 'PROPERTY_REVIEW_ACTION';
    actionTitle = 'Property review action';
    executionInstructions =
      'Review property registry, property events, GIS data, ownership, tenant activity, availability, power, yard, and comparable evidence.';
    expectedOutput =
      'Property review result with updated facts, evidence notes, and recommended graph update.';
    assignedOwner = 'PROPERTY_REVIEW_QUEUE';
  }

  if (
    routeText.includes('COMPANY_RESEARCH') ||
    hypothesisType === 'COMPANY_HYPOTHESIS'
  ) {
    actionItemType = 'COMPANY_RESEARCH_ACTION';
    actionTitle = 'Company research action';
    executionInstructions =
      'Research company funding, hiring, permits, facility movement, supplier/OEM relationships, occupier activity, and real estate demand signals.';
    expectedOutput =
      'Company research result with evidence, confidence, and recommended follow-up.';
    assignedOwner = 'COMPANY_RESEARCH_QUEUE';
  }

  if (
    routeText.includes('RISK') ||
    hypothesisType === 'RISK_HYPOTHESIS'
  ) {
    actionItemType = 'RISK_REVIEW_ACTION';
    actionTitle = 'Risk review action';
    executionInstructions =
      'Assess risk severity, affected entities, timing, counterevidence, mitigation options, and whether alerting is required.';
    expectedOutput =
      'Risk review result with severity, affected entities, mitigation path, and alert recommendation.';
    priority = 'HIGH';
    dueStatus = 'DUE_NOW';
    assignedOwner = 'RISK_REVIEW_QUEUE';
  }

  if (
    routeText.includes('OPPORTUNITY') ||
    hypothesisType === 'OPPORTUNITY_HYPOTHESIS'
  ) {
    actionItemType = 'OPPORTUNITY_REVIEW_ACTION';
    actionTitle = 'Opportunity review action';
    executionInstructions =
      'Assess demand, timing, target fit, ownership fit, pricing gap, actionability, and recommended pursuit path.';
    expectedOutput =
      'Opportunity review result with target, timing, confidence, and recommended action.';
    priority = 'HIGH';
    dueStatus = 'DUE_NOW';
    assignedOwner = 'OPPORTUNITY_REVIEW_QUEUE';
  }

  if (
    routeText.includes('SYSTEM_IMPROVEMENT') ||
    hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS'
  ) {
    actionItemType = 'SYSTEM_IMPROVEMENT_ACTION';
    actionTitle = 'System improvement review';
    executionInstructions =
      'Review processor logic, schema design, graph completeness, workflow automation, duplicate patterns, skipped records, and operator feedback.';
    expectedOutput =
      'System improvement recommendation with affected processor, schema, or workflow.';
    assignedOwner = 'SYSTEM_IMPROVEMENT_QUEUE';
  }

  if (
    routeText.includes('MONITORING_CONTINUATION')
  ) {
    actionItemType = 'MONITORING_CONTINUATION_ACTION';
    actionTitle = 'Continue monitoring action';
    executionInstructions =
      'Keep the signal under monitoring and do not escalate until stronger evidence or trigger conditions appear.';
    expectedOutput =
      'Monitoring retained with no escalation.';
    priority = 'LOW';
    dueStatus = 'MONITOR';
    assignedOwner = 'SCENARIO_MONITORING';
  }

  requiredInput = [
    requiredInput,
    `Destination workflow: ${destinationWorkflow || 'UNKNOWN'}.`,
    `Routing reason: ${routingReason || 'No routing reason recorded.'}`
  ].join('\n');

  return {
    actionItemType,
    actionTitle,
    actionObjective,
    executionInstructions,
    requiredInput,
    expectedOutput,
    priority,
    dueStatus,
    assignedOwner
  };
}

function sciipDeduplicateActionQueueRows_(rows) {
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

function sciipTestActionQueueProcessor() {
  const result =
    sciipRunActionQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionQueueProcessor',
    result
  }));

  return result;
}