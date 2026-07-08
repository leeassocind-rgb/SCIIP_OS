/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6610_AssetEventGenerationProcessor.gs
 * Processor: 6610_AssetEventGeneration
 * Purpose: Generates event-sourced asset events for downstream graph and GIS execution.
 */

function sciipRun6610_AssetEventGenerationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6610_AssetEventGeneration',
    action: 'ASSET_EVENT_GENERATION',
    targetSheet: 'ASSET_EVENT_GENERATION',
    ledgerSheet: 'ASSET_EVENT_GENERATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Generates event-sourced asset events for downstream graph and GIS execution.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_REGISTRY_POPULATION',
          requiredSourceStatus: 'ASSET_REGISTRY_POPULATED',
          executionStatus: 'ASSET_EVENT_GENERATED',
          nextProcessor: '6620_AssetGraphNodeCreationProcessor'
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
      var assetExecutionId = '6610|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_EVENT_GENERATED',
        sourceSheet: 'ASSET_REGISTRY_POPULATION',
        sourceStatusRequired: 'ASSET_REGISTRY_POPULATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Generates event-sourced asset events for downstream graph and GIS execution.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EVENT_GENERATED',
        sourceSheet: 'ASSET_REGISTRY_POPULATION',
        sourceStatusRequired: 'ASSET_REGISTRY_POPULATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EVENT_GENERATED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6620_AssetGraphNodeCreationProcessor',
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
          executionStatus: 'ASSET_EVENT_GENERATED',
          sourceSheet: 'ASSET_REGISTRY_POPULATION',
          requiredSourceStatus: 'ASSET_REGISTRY_POPULATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6620_AssetGraphNodeCreationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EVENT_GENERATED',
        sourceSheet: 'ASSET_REGISTRY_POPULATION',
        sourceStatusRequired: 'ASSET_REGISTRY_POPULATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EVENT_GENERATED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6620_AssetGraphNodeCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6610_AssetEventGenerationProcessor() {
  return sciipRun6610_AssetEventGenerationProcessor();
}

function sciipTest6610_AssetEventGenerationProcessor() {
  var result = sciipRun6610_AssetEventGenerationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6610_AssetEventGenerationProcessor',
    result: result
  }));
  return result;
}
