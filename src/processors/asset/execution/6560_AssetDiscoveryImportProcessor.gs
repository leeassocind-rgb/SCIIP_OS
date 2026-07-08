/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6560_AssetDiscoveryImportProcessor.gs
 * Processor: 6560_AssetDiscoveryImport
 * Purpose: Discovers asset-ready source records from the active Asset Registry execution layer.
 */

function sciipRun6560_AssetDiscoveryImportProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6560_AssetDiscoveryImport',
    action: 'ASSET_DISCOVERY_IMPORT',
    targetSheet: 'ASSET_DISCOVERY_IMPORT',
    ledgerSheet: 'ASSET_DISCOVERY_IMPORT_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Discovers asset-ready source records from the active Asset Registry execution layer.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_REGISTRY_EXECUTION',
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
          executionStatus: 'ASSET_DISCOVERY_IMPORTED',
          nextProcessor: '6570_AssetIdentityResolutionProcessor'
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
      var assetExecutionId = '6560|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_DISCOVERY_IMPORTED',
        sourceSheet: 'ASSET_REGISTRY_EXECUTION',
        sourceStatusRequired: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Discovers asset-ready source records from the active Asset Registry execution layer.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_DISCOVERY_IMPORTED',
        sourceSheet: 'ASSET_REGISTRY_EXECUTION',
        sourceStatusRequired: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_DISCOVERY_IMPORTED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6570_AssetIdentityResolutionProcessor',
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
          executionStatus: 'ASSET_DISCOVERY_IMPORTED',
          sourceSheet: 'ASSET_REGISTRY_EXECUTION',
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6570_AssetIdentityResolutionProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_DISCOVERY_IMPORTED',
        sourceSheet: 'ASSET_REGISTRY_EXECUTION',
        sourceStatusRequired: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_DISCOVERY_IMPORTED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6570_AssetIdentityResolutionProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6560_AssetDiscoveryImportProcessor() {
  return sciipRun6560_AssetDiscoveryImportProcessor();
}

function sciipTest6560_AssetDiscoveryImportProcessor() {
  var result = sciipRun6560_AssetDiscoveryImportProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6560_AssetDiscoveryImportProcessor',
    result: result
  }));
  return result;
}
