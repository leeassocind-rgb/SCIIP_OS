/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6570_AssetIdentityResolutionProcessor.gs
 * Processor: 6570_AssetIdentityResolution
 * Purpose: Resolves durable asset identity keys from discovered asset records.
 */

function sciipRun6570_AssetIdentityResolutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6570_AssetIdentityResolution',
    action: 'ASSET_IDENTITY_RESOLUTION',
    targetSheet: 'ASSET_IDENTITY_RESOLUTION',
    ledgerSheet: 'ASSET_IDENTITY_RESOLUTION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Resolves durable asset identity keys from discovered asset records.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_DISCOVERY_IMPORT',
          requiredSourceStatus: 'ASSET_DISCOVERY_IMPORTED',
          executionStatus: 'ASSET_IDENTITY_RESOLVED',
          nextProcessor: '6580_AssetCreationProcessor'
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
      var assetExecutionId = '6570|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_IDENTITY_RESOLVED',
        sourceSheet: 'ASSET_DISCOVERY_IMPORT',
        sourceStatusRequired: 'ASSET_DISCOVERY_IMPORTED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Resolves durable asset identity keys from discovered asset records.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_IDENTITY_RESOLVED',
        sourceSheet: 'ASSET_DISCOVERY_IMPORT',
        sourceStatusRequired: 'ASSET_DISCOVERY_IMPORTED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_IDENTITY_RESOLVED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6580_AssetCreationProcessor',
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
          executionStatus: 'ASSET_IDENTITY_RESOLVED',
          sourceSheet: 'ASSET_DISCOVERY_IMPORT',
          requiredSourceStatus: 'ASSET_DISCOVERY_IMPORTED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6580_AssetCreationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_IDENTITY_RESOLVED',
        sourceSheet: 'ASSET_DISCOVERY_IMPORT',
        sourceStatusRequired: 'ASSET_DISCOVERY_IMPORTED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_IDENTITY_RESOLVED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6580_AssetCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6570_AssetIdentityResolutionProcessor() {
  return sciipRun6570_AssetIdentityResolutionProcessor();
}

function sciipTest6570_AssetIdentityResolutionProcessor() {
  var result = sciipRun6570_AssetIdentityResolutionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6570_AssetIdentityResolutionProcessor',
    result: result
  }));
  return result;
}
