/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6620_AssetGraphNodeCreationProcessor.gs
 * Processor: 6620_AssetGraphNodeCreation
 * Purpose: Creates graph-native asset node creation records.
 */

function sciipRun6620_AssetGraphNodeCreationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6620_AssetGraphNodeCreation',
    action: 'ASSET_GRAPH_NODE_CREATION',
    targetSheet: 'ASSET_GRAPH_NODE_CREATION',
    ledgerSheet: 'ASSET_GRAPH_NODE_CREATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Creates graph-native asset node creation records.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_EVENT_GENERATION',
          requiredSourceStatus: 'ASSET_EVENT_GENERATED',
          executionStatus: 'ASSET_GRAPH_NODE_CREATED',
          nextProcessor: '6630_AssetGISBindingProcessor'
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
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6620|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_GRAPH_NODE_CREATED',
        sourceSheet: 'ASSET_EVENT_GENERATION',
        sourceStatusRequired: 'ASSET_EVENT_GENERATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Creates graph-native asset node creation records.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_GRAPH_NODE_CREATED',
        sourceSheet: 'ASSET_EVENT_GENERATION',
        sourceStatusRequired: 'ASSET_EVENT_GENERATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_GRAPH_NODE_CREATED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6630_AssetGISBindingProcessor',
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
          executionStatus: 'ASSET_GRAPH_NODE_CREATED',
          sourceSheet: 'ASSET_EVENT_GENERATION',
          requiredSourceStatus: 'ASSET_EVENT_GENERATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6630_AssetGISBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_GRAPH_NODE_CREATED',
        sourceSheet: 'ASSET_EVENT_GENERATION',
        sourceStatusRequired: 'ASSET_EVENT_GENERATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_GRAPH_NODE_CREATED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6630_AssetGISBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6620_AssetGraphNodeCreationProcessor() {
  return sciipRun6620_AssetGraphNodeCreationProcessor();
}

function sciipTest6620_AssetGraphNodeCreationProcessor() {
  var result = sciipRun6620_AssetGraphNodeCreationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6620_AssetGraphNodeCreationProcessor',
    result: result
  }));
  return result;
}
