/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6600_AssetRegistryPopulationProcessor.gs
 * Processor: 6600_AssetRegistryPopulation
 * Purpose: Populates the permanent asset registry execution surface.
 */

function sciipRun6600_AssetRegistryPopulationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6600_AssetRegistryPopulation',
    action: 'ASSET_REGISTRY_POPULATION',
    targetSheet: 'ASSET_REGISTRY_POPULATION',
    ledgerSheet: 'ASSET_REGISTRY_POPULATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Populates the permanent asset registry execution surface.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_ADDRESS_BINDING',
          requiredSourceStatus: 'ASSET_ADDRESS_BOUND',
          executionStatus: 'ASSET_REGISTRY_POPULATED',
          nextProcessor: '6610_AssetEventGenerationProcessor'
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
      var assetExecutionId = '6600|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_REGISTRY_POPULATED',
        sourceSheet: 'ASSET_ADDRESS_BINDING',
        sourceStatusRequired: 'ASSET_ADDRESS_BOUND',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Populates the permanent asset registry execution surface.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_REGISTRY_POPULATED',
        sourceSheet: 'ASSET_ADDRESS_BINDING',
        sourceStatusRequired: 'ASSET_ADDRESS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_REGISTRY_POPULATED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6610_AssetEventGenerationProcessor',
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
          executionStatus: 'ASSET_REGISTRY_POPULATED',
          sourceSheet: 'ASSET_ADDRESS_BINDING',
          requiredSourceStatus: 'ASSET_ADDRESS_BOUND',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6610_AssetEventGenerationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_REGISTRY_POPULATED',
        sourceSheet: 'ASSET_ADDRESS_BINDING',
        sourceStatusRequired: 'ASSET_ADDRESS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_REGISTRY_POPULATED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6610_AssetEventGenerationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6600_AssetRegistryPopulationProcessor() {
  return sciipRun6600_AssetRegistryPopulationProcessor();
}

function sciipTest6600_AssetRegistryPopulationProcessor() {
  var result = sciipRun6600_AssetRegistryPopulationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6600_AssetRegistryPopulationProcessor',
    result: result
  }));
  return result;
}
