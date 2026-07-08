/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6760_GraphExecutionReadinessProcessor.gs
 * Processor: 6760_GraphExecutionReadiness
 * Purpose: Prepares the graph execution layer after accepted identity execution records exist.
 */

function sciipRun6760_GraphExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6760_GraphExecutionReadiness',
    action: 'GRAPH_EXECUTION_READINESS',
    targetSheet: 'GRAPH_EXECUTION_READINESS',
    ledgerSheet: 'GRAPH_EXECUTION_READINESS_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Prepares the graph execution layer after accepted identity execution records exist.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_ACCEPTANCE',
          requiredSourceStatus: 'IDENTITY_EXECUTION_ACCEPTED',
          executionStatus: 'GRAPH_EXECUTION_READY',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-graph-execution',
          nextProcessor: '6770_GraphNodeCreationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'graphExecutionId',
        'graphBusinessKey',
        'graphStatus',
        'graphPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var graphExecutionId = '6760|' + context.businessKey;
      var graphBusinessKey = 'GRAPH_EXECUTION|' + context.businessKey;
      var graphPayload = {
        processor: context.processor,
        executionStatus: 'GRAPH_EXECUTION_READY',
        sourceSheet: 'IDENTITY_ACCEPTANCE',
        sourceStatusRequired: 'IDENTITY_EXECUTION_ACCEPTED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Prepares the graph execution layer after accepted identity execution records exist.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'GRAPH_EXECUTION_READY',
        sourceSheet: 'IDENTITY_ACCEPTANCE',
        sourceStatusRequired: 'IDENTITY_EXECUTION_ACCEPTED',
        recordsRead: 1,
        recordsCreated: 1,
        graphExecutionId: graphExecutionId,
        graphBusinessKey: graphBusinessKey,
        graphStatus: 'GRAPH_EXECUTION_READY',
        graphPayloadJson: JSON.stringify(graphPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-graph-execution',
        nextProcessor: '6770_GraphNodeCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'GRAPH_EXECUTION_READY',
          sourceSheet: 'IDENTITY_ACCEPTANCE',
          requiredSourceStatus: 'IDENTITY_EXECUTION_ACCEPTED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6770_GraphNodeCreationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'GRAPH_EXECUTION_READY',
        sourceSheet: 'IDENTITY_ACCEPTANCE',
        sourceStatusRequired: 'IDENTITY_EXECUTION_ACCEPTED',
        recordsRead: 1,
        recordsCreated: 1,
        graphExecutionId: graphExecutionId,
        graphBusinessKey: graphBusinessKey,
        graphStatus: 'GRAPH_EXECUTION_READY',
        graphPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-graph-execution',
        nextProcessor: '6770_GraphNodeCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6760_GraphExecutionReadinessProcessor() {
  return sciipRun6760_GraphExecutionReadinessProcessor();
}

function sciipTest6760_GraphExecutionReadinessProcessor() {
  var result = sciipRun6760_GraphExecutionReadinessProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6760_GraphExecutionReadinessProcessor',
    result: result
  }));
  return result;
}
