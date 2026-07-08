/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6660_IdentityExecutionReadinessProcessor.gs
 * Processor: 6660_IdentityExecutionReadiness
 * Purpose: Prepares the identity execution layer after accepted asset execution records exist.
 */

function sciipRun6660_IdentityExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6660_IdentityExecutionReadiness',
    action: 'IDENTITY_EXECUTION_READINESS',
    targetSheet: 'IDENTITY_EXECUTION_READINESS',
    ledgerSheet: 'IDENTITY_EXECUTION_READINESS_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Prepares the identity execution layer after accepted asset execution records exist.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_ACCEPTANCE',
          requiredSourceStatus: 'ASSET_EXECUTION_ACCEPTED',
          executionStatus: 'IDENTITY_EXECUTION_READY',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6670_IdentityCandidateImportProcessor'
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
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6660|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_READY',
        sourceSheet: 'ASSET_ACCEPTANCE',
        sourceStatusRequired: 'ASSET_EXECUTION_ACCEPTED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Prepares the identity execution layer after accepted asset execution records exist.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_READY',
        sourceSheet: 'ASSET_ACCEPTANCE',
        sourceStatusRequired: 'ASSET_EXECUTION_ACCEPTED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EXECUTION_READY',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6670_IdentityCandidateImportProcessor',
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
          executionStatus: 'IDENTITY_EXECUTION_READY',
          sourceSheet: 'ASSET_ACCEPTANCE',
          requiredSourceStatus: 'ASSET_EXECUTION_ACCEPTED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6670_IdentityCandidateImportProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_READY',
        sourceSheet: 'ASSET_ACCEPTANCE',
        sourceStatusRequired: 'ASSET_EXECUTION_ACCEPTED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EXECUTION_READY',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6670_IdentityCandidateImportProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6660_IdentityExecutionReadinessProcessor() {
  return sciipRun6660_IdentityExecutionReadinessProcessor();
}

function sciipTest6660_IdentityExecutionReadinessProcessor() {
  var result = sciipRun6660_IdentityExecutionReadinessProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6660_IdentityExecutionReadinessProcessor',
    result: result
  }));
  return result;
}
