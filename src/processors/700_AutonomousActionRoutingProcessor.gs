/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 700_AutonomousActionRoutingProcessor
 *
 * MONITORING_SIGNALS → AUTONOMOUS_ACTION_ROUTING
 *
 * Migration note:
 * Preserves original 700 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_ACTION_ROUTING_PROCESSOR = '700_AutonomousActionRoutingProcessor';
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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_ACTION_ROUTING',
    AUTONOMOUS_ACTION_ROUTING_HEADERS
  );
}

function sciipRunAutonomousActionRoutingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
    action: 'AUTONOMOUS_ACTION_ROUTING_BUILD',
    sourceSheet: 'MONITORING_SIGNALS',
    targetSheet: 'AUTONOMOUS_ACTION_ROUTING',
    ledgerSheet: 'AUTONOMOUS_ACTION_ROUTING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const monitoringSignals = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('MONITORING_SIGNALS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: monitoringSignals.length,
        outputCount: monitoringSignals.length || 1,
        summary: 'Autonomous action routing runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
          inputSheets: ['MONITORING_SIGNALS']
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
      const outputSheet = sciipEnsureAutonomousActionRoutingSchema();
      const routeDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const autonomousActionRoutingBusinessKey = 'AUTONOMOUS_ACTION_ROUTING|' + routeDate;

      if (sciipRuntimeBusinessKeyPrefixExists700_(definition.targetSheet, autonomousActionRoutingBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            actionRoutesCreated: 0,
            skippedDuplicate: 1,
            autonomousActionRoutingBusinessKey: autonomousActionRoutingBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const monitoringSignals = sciipGetRuntimeRecordsByDate700_(
        'MONITORING_SIGNALS',
        'Signal_Date',
        routeDate
      );

      if (monitoringSignals.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            monitoringSignalsReviewed: 0,
            actionRoutesCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const routes = sciipCreateAutonomousActionRoutes700_({
        businessKey: autonomousActionRoutingBusinessKey,
        routeDate: routeDate,
        monitoringSignals: monitoringSignals,
        processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR
      });

      routes.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_ACTION_ROUTING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: routes.length,
        recordsRead: monitoringSignals.length,
        processed: routes.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          monitoringSignalsReviewed: monitoringSignals.length,
          actionRoutesCreated: routes.length,
          skippedDuplicate: 0,
          autonomousActionRoutingBusinessKey: autonomousActionRoutingBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists700_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate700_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue700_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue700_(value) {
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

function sciipExtractFirstAvailable700_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey700_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipGenerateId700_(prefix) {
  const safePrefix = String(prefix || 'ID').toUpperCase();
  return safePrefix + '|' + Utilities.getUuid();
}

function sciipCreateAutonomousActionRoutes700_(args) {
  const now = new Date();

  const rows = args.monitoringSignals.map(signal => {
    const monitoringSignalId = sciipExtractFirstAvailable700_(signal, [
      'Monitoring_Signal_ID'
    ]);

    const monitoringId = sciipExtractFirstAvailable700_(signal, [
      'Monitoring_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable700_(signal, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable700_(signal, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable700_(signal, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable700_(signal, [
      'Signal_Category'
    ]);

    const detectedSignalType = sciipExtractFirstAvailable700_(signal, [
      'Detected_Signal_Type'
    ]);

    const recommendedActionRoute = sciipExtractFirstAvailable700_(signal, [
      'Recommended_Action_Route'
    ]);

    const profile =
      sciipInferAutonomousActionRouteProfile700_(signal);

    const rowKey =
      `${args.businessKey}|${profile.actionRouteType}|${sciipNormalizeMissionKey700_(monitoringSignalId || monitoringId || scenarioId || hypothesisId || profile.actionRouteTitle)}`;

    return [
      sciipGenerateId700_('ART'),
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

  return sciipDeduplicateAutonomousActionRoutingRows700_(rows);
}

function sciipInferAutonomousActionRouteProfile700_(signal) {
  const hypothesisType = sciipExtractFirstAvailable700_(signal, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable700_(signal, [
    'Signal_Category'
  ]);

  const detectedSignalType = sciipExtractFirstAvailable700_(signal, [
    'Detected_Signal_Type'
  ]);

  const detectedSignalStatement = sciipExtractFirstAvailable700_(signal, [
    'Detected_Signal_Statement'
  ]);

  const detectionBasis = sciipExtractFirstAvailable700_(signal, [
    'Detection_Basis'
  ]);

  const triggerState = sciipExtractFirstAvailable700_(signal, [
    'Trigger_State'
  ]);

  const escalationReadiness = sciipExtractFirstAvailable700_(signal, [
    'Escalation_Readiness'
  ]);

  const recommendedActionRoute = sciipExtractFirstAvailable700_(signal, [
    'Recommended_Action_Route'
  ]);

  const signalConfidence =
    sciipExtractFirstAvailable700_(signal, [
      'Signal_Confidence'
    ]) || 'LOW';

  const signalPriority =
    sciipExtractFirstAvailable700_(signal, [
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

function sciipDeduplicateAutonomousActionRoutingRows700_(rows) {
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
    result: result
  }));

  return result;
}
