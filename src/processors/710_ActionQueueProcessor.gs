/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 710_ActionQueueProcessor
 *
 * AUTONOMOUS_ACTION_ROUTING → ACTION_QUEUE
 *
 * Migration note:
 * Preserves original 710 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetActionQueueProcessorName710_() {
  return '710_ActionQueueProcessor';
}

function sciipGetActionQueueHeaders710_() {
  return [
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
}

function sciipEnsureActionQueueSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'ACTION_QUEUE',
    sciipGetActionQueueHeaders710_()
  );
}

function sciipRunActionQueueProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetActionQueueProcessorName710_(),
    action: 'ACTION_QUEUE_BUILD',
    sourceSheet: 'AUTONOMOUS_ACTION_ROUTING',
    targetSheet: 'ACTION_QUEUE',
    ledgerSheet: 'ACTION_QUEUE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const actionRoutes = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_ACTION_ROUTING');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: actionRoutes.length,
        outputCount: actionRoutes.length || 1,
        summary: 'Action queue runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetActionQueueProcessorName710_(),
          inputSheets: ['AUTONOMOUS_ACTION_ROUTING']
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
      const outputSheet = sciipEnsureActionQueueSchema();
      const queueDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const actionQueueBusinessKey = 'ACTION_QUEUE|' + queueDate;

      if (sciipRuntimeBusinessKeyPrefixExists710_(definition.targetSheet, actionQueueBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetActionQueueProcessorName710_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionItemsCreated: 0,
            skippedDuplicate: 1,
            actionQueueBusinessKey: actionQueueBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const actionRoutes = sciipGetRuntimeRecordsByDate710_(
        'AUTONOMOUS_ACTION_ROUTING',
        'Route_Date',
        queueDate
      );

      if (actionRoutes.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetActionQueueProcessorName710_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionRoutesReviewed: 0,
            actionItemsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const actionItems = sciipCreateActionQueueItems710_({
        businessKey: actionQueueBusinessKey,
        queueDate: queueDate,
        actionRoutes: actionRoutes,
        processor: sciipGetActionQueueProcessorName710_()
      });

      actionItems.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetActionQueueProcessorName710_(),
        businessKey: context.businessKey,
        recordsCreated: actionItems.length,
        recordsRead: actionRoutes.length,
        processed: actionItems.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          actionRoutesReviewed: actionRoutes.length,
          actionItemsCreated: actionItems.length,
          skippedDuplicate: 0,
          actionQueueBusinessKey: actionQueueBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists710_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate710_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue710_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue710_(value) {
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

function sciipExtractFirstAvailable710_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey710_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipGenerateId710_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateActionQueueItems710_(args) {
  const now = new Date();

  const rows = args.actionRoutes.map(route => {
    const actionRouteId = sciipExtractFirstAvailable710_(route, [
      'Action_Route_ID'
    ]);

    const monitoringSignalId = sciipExtractFirstAvailable710_(route, [
      'Monitoring_Signal_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable710_(route, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable710_(route, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable710_(route, [
      'Hypothesis_Type'
    ]);

    const actionRouteType = sciipExtractFirstAvailable710_(route, [
      'Action_Route_Type'
    ]);

    const destinationWorkflow = sciipExtractFirstAvailable710_(route, [
      'Destination_Workflow'
    ]);

    const profile =
      sciipInferActionQueueProfile710_(route);

    const rowKey =
      `${args.businessKey}|${profile.actionItemType}|${sciipNormalizeMissionKey710_(actionRouteId || monitoringSignalId || scenarioId || hypothesisId || profile.actionTitle)}`;

    return [
      sciipGenerateId710_('AQI'),
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

  return sciipDeduplicateActionQueueRows710_(rows);
}

function sciipInferActionQueueProfile710_(route) {
  const hypothesisType = sciipExtractFirstAvailable710_(route, [
    'Hypothesis_Type'
  ]);

  const actionRouteType = sciipExtractFirstAvailable710_(route, [
    'Action_Route_Type'
  ]);

  const actionRouteTitle = sciipExtractFirstAvailable710_(route, [
    'Action_Route_Title'
  ]);

  const actionRouteObjective = sciipExtractFirstAvailable710_(route, [
    'Action_Route_Objective'
  ]);

  const destinationWorkflow = sciipExtractFirstAvailable710_(route, [
    'Destination_Workflow'
  ]);

  const routingReason = sciipExtractFirstAvailable710_(route, [
    'Routing_Reason'
  ]);

  const routingPriority =
    sciipExtractFirstAvailable710_(route, [
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

function sciipDeduplicateActionQueueRows710_(rows) {
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
    result: result
  }));

  return result;
}
