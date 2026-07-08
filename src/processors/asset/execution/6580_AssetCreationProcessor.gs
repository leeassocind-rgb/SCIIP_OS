/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6580_AssetCreationProcessor.gs
 * Processor: 6580_AssetCreation
 * Purpose: Creates durable asset records from resolved identities.
 */

function sciipRun6580_AssetCreationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6580_AssetCreation',
    action: 'ASSET_CREATION',
    targetSheet: 'ASSET_CREATION',
    ledgerSheet: 'ASSET_CREATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Creates durable asset records from resolved identities.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
          requiredSourceStatus: 'ASSET_IDENTITY_RESOLVED',
          executionStatus: 'ASSET_CREATED',
          nextProcessor: '6590_AssetAddressBindingProcessor'
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
      var assetExecutionId = '6580|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_CREATED',
        sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
        sourceStatusRequired: 'ASSET_IDENTITY_RESOLVED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Creates durable asset records from resolved identities.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_CREATED',
        sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
        sourceStatusRequired: 'ASSET_IDENTITY_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_CREATED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6590_AssetAddressBindingProcessor',
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
          executionStatus: 'ASSET_CREATED',
          sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
          requiredSourceStatus: 'ASSET_IDENTITY_RESOLVED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6590_AssetAddressBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_CREATED',
        sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
        sourceStatusRequired: 'ASSET_IDENTITY_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_CREATED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6590_AssetAddressBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6580_AssetCreationProcessor() {
  return sciipRun6580_AssetCreationProcessor();
}

function sciipTest6580_AssetCreationProcessor() {
  var result = sciipRun6580_AssetCreationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6580_AssetCreationProcessor',
    result: result
  }));
  return result;
}
