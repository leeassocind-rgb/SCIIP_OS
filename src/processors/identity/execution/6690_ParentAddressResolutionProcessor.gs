/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6690_ParentAddressResolutionProcessor.gs
 * Processor: 6690_ParentAddressResolution
 * Purpose: Resolves parent address identities so property records can be grouped without overwrites.
 */

function sciipRun6690_ParentAddressResolutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6690_ParentAddressResolution',
    action: 'PARENT_ADDRESS_RESOLUTION',
    targetSheet: 'PARENT_ADDRESS_RESOLUTION',
    ledgerSheet: 'PARENT_ADDRESS_RESOLUTION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Resolves parent address identities so property records can be grouped without overwrites.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
          requiredSourceStatus: 'IDENTITY_ALIASES_RESOLVED',
          executionStatus: 'PARENT_ADDRESSES_RESOLVED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6700_CanonicalIdentityCreationProcessor'
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
      var identityExecutionId = '6690|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'PARENT_ADDRESSES_RESOLVED',
        sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
        sourceStatusRequired: 'IDENTITY_ALIASES_RESOLVED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Resolves parent address identities so property records can be grouped without overwrites.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'PARENT_ADDRESSES_RESOLVED',
        sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
        sourceStatusRequired: 'IDENTITY_ALIASES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'PARENT_ADDRESSES_RESOLVED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6700_CanonicalIdentityCreationProcessor',
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
          executionStatus: 'PARENT_ADDRESSES_RESOLVED',
          sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
          requiredSourceStatus: 'IDENTITY_ALIASES_RESOLVED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6700_CanonicalIdentityCreationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'PARENT_ADDRESSES_RESOLVED',
        sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
        sourceStatusRequired: 'IDENTITY_ALIASES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'PARENT_ADDRESSES_RESOLVED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6700_CanonicalIdentityCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6690_ParentAddressResolutionProcessor() {
  return sciipRun6690_ParentAddressResolutionProcessor();
}

function sciipTest6690_ParentAddressResolutionProcessor() {
  var result = sciipRun6690_ParentAddressResolutionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6690_ParentAddressResolutionProcessor',
    result: result
  }));
  return result;
}
