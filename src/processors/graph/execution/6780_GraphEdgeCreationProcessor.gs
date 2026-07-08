/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6780_GraphEdgeCreationProcessor.gs
 * Processor: 6780_GraphEdgeCreation
 * Purpose: Creates graph-ready edge execution records for asset, identity, address, city, zip, and status relationships.
 */

function sciipRun6780_GraphEdgeCreationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6780_GraphEdgeCreation',
    action: 'GRAPH_EDGE_CREATION',
    targetSheet: 'GRAPH_EDGE_CREATION',
    ledgerSheet: 'GRAPH_EDGE_CREATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Creates graph-ready edge execution records for asset, identity, address, city, zip, and status relationships.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'GRAPH_NODE_CREATION',
          requiredSourceStatus: 'GRAPH_NODES_CREATED',
          executionStatus: 'GRAPH_EDGES_CREATED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-graph-execution',
          nextProcessor: '6790_AssetIdentityGraphRelationshipProcessor'
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
      var graphExecutionId = '6780|' + context.businessKey;
      var graphBusinessKey = 'GRAPH_EXECUTION|' + context.businessKey;
      var graphPayload = {
        processor: context.processor,
        executionStatus: 'GRAPH_EDGES_CREATED',
        sourceSheet: 'GRAPH_NODE_CREATION',
        sourceStatusRequired: 'GRAPH_NODES_CREATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Creates graph-ready edge execution records for asset, identity, address, city, zip, and status relationships.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'GRAPH_EDGES_CREATED',
        sourceSheet: 'GRAPH_NODE_CREATION',
        sourceStatusRequired: 'GRAPH_NODES_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        graphExecutionId: graphExecutionId,
        graphBusinessKey: graphBusinessKey,
        graphStatus: 'GRAPH_EDGES_CREATED',
        graphPayloadJson: JSON.stringify(graphPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-graph-execution',
        nextProcessor: '6790_AssetIdentityGraphRelationshipProcessor',
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
          executionStatus: 'GRAPH_EDGES_CREATED',
          sourceSheet: 'GRAPH_NODE_CREATION',
          requiredSourceStatus: 'GRAPH_NODES_CREATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6790_AssetIdentityGraphRelationshipProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'GRAPH_EDGES_CREATED',
        sourceSheet: 'GRAPH_NODE_CREATION',
        sourceStatusRequired: 'GRAPH_NODES_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        graphExecutionId: graphExecutionId,
        graphBusinessKey: graphBusinessKey,
        graphStatus: 'GRAPH_EDGES_CREATED',
        graphPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-graph-execution',
        nextProcessor: '6790_AssetIdentityGraphRelationshipProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6780_GraphEdgeCreationProcessor() {
  return sciipRun6780_GraphEdgeCreationProcessor();
}

function sciipTest6780_GraphEdgeCreationProcessor() {
  var result = sciipRun6780_GraphEdgeCreationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6780_GraphEdgeCreationProcessor',
    result: result
  }));
  return result;
}
