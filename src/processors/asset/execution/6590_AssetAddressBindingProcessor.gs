/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6590_AssetAddressBindingProcessor.gs
 * Processor: 6590_AssetAddressBinding
 * Purpose: Binds created assets to address-oriented registry attributes.
 */

function sciipRun6590_AssetAddressBindingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6590_AssetAddressBinding',
    action: 'ASSET_ADDRESS_BINDING',
    targetSheet: 'ASSET_ADDRESS_BINDING',
    ledgerSheet: 'ASSET_ADDRESS_BINDING_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Binds created assets to address-oriented registry attributes.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_CREATION',
          requiredSourceStatus: 'ASSET_CREATED',
          executionStatus: 'ASSET_ADDRESS_BOUND',
          nextProcessor: '6600_AssetRegistryPopulationProcessor'
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
      var assetExecutionId = '6590|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_ADDRESS_BOUND',
        sourceSheet: 'ASSET_CREATION',
        sourceStatusRequired: 'ASSET_CREATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Binds created assets to address-oriented registry attributes.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_ADDRESS_BOUND',
        sourceSheet: 'ASSET_CREATION',
        sourceStatusRequired: 'ASSET_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_ADDRESS_BOUND',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6600_AssetRegistryPopulationProcessor',
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
          executionStatus: 'ASSET_ADDRESS_BOUND',
          sourceSheet: 'ASSET_CREATION',
          requiredSourceStatus: 'ASSET_CREATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6600_AssetRegistryPopulationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_ADDRESS_BOUND',
        sourceSheet: 'ASSET_CREATION',
        sourceStatusRequired: 'ASSET_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_ADDRESS_BOUND',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6600_AssetRegistryPopulationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6590_AssetAddressBindingProcessor() {
  return sciipRun6590_AssetAddressBindingProcessor();
}

function sciipTest6590_AssetAddressBindingProcessor() {
  var result = sciipRun6590_AssetAddressBindingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6590_AssetAddressBindingProcessor',
    result: result
  }));
  return result;
}
