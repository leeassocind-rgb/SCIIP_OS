/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6650_AssetAcceptanceProcessor.gs
 * Processor: 6650_AssetAcceptance
 * Purpose: Accepts the completed asset execution layer and hands off to identity execution readiness.
 */

function sciipRun6650_AssetAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6650_AssetAcceptance',
    action: 'ASSET_ACCEPTANCE',
    targetSheet: 'ASSET_ACCEPTANCE',
    ledgerSheet: 'ASSET_ACCEPTANCE_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Accepts the completed asset execution layer and hands off to identity execution readiness.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
          requiredSourceStatus: 'ASSET_EXECUTION_CERTIFIED',
          executionStatus: 'ASSET_EXECUTION_ACCEPTED',
          nextProcessor: '6660_IdentityExecutionReadinessProcessor'
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
      var assetExecutionId = '6650|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_ACCEPTED',
        sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'ASSET_EXECUTION_CERTIFIED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Accepts the completed asset execution layer and hands off to identity execution readiness.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_ACCEPTED',
        sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'ASSET_EXECUTION_CERTIFIED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EXECUTION_ACCEPTED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6660_IdentityExecutionReadinessProcessor',
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
          executionStatus: 'ASSET_EXECUTION_ACCEPTED',
          sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
          requiredSourceStatus: 'ASSET_EXECUTION_CERTIFIED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6660_IdentityExecutionReadinessProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_ACCEPTED',
        sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'ASSET_EXECUTION_CERTIFIED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EXECUTION_ACCEPTED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6660_IdentityExecutionReadinessProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6650_AssetAcceptanceProcessor() {
  return sciipRun6650_AssetAcceptanceProcessor();
}

function sciipTest6650_AssetAcceptanceProcessor() {
  var result = sciipRun6650_AssetAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6650_AssetAcceptanceProcessor',
    result: result
  }));
  return result;
}
