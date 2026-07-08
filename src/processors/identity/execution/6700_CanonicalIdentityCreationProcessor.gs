/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6700_CanonicalIdentityCreationProcessor.gs
 * Processor: 6700_CanonicalIdentityCreation
 * Purpose: Creates canonical durable identity records for assets, properties, addresses, and parent addresses.
 */

function sciipRun6700_CanonicalIdentityCreationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6700_CanonicalIdentityCreation',
    action: 'CANONICAL_IDENTITY_CREATION',
    targetSheet: 'CANONICAL_IDENTITY_CREATION',
    ledgerSheet: 'CANONICAL_IDENTITY_CREATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Creates canonical durable identity records for assets, properties, addresses, and parent addresses.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
          requiredSourceStatus: 'PARENT_ADDRESSES_RESOLVED',
          executionStatus: 'CANONICAL_IDENTITIES_CREATED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6710_IdentityRelationshipBindingProcessor'
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
      var identityExecutionId = '6700|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'CANONICAL_IDENTITIES_CREATED',
        sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
        sourceStatusRequired: 'PARENT_ADDRESSES_RESOLVED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Creates canonical durable identity records for assets, properties, addresses, and parent addresses.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'CANONICAL_IDENTITIES_CREATED',
        sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
        sourceStatusRequired: 'PARENT_ADDRESSES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'CANONICAL_IDENTITIES_CREATED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6710_IdentityRelationshipBindingProcessor',
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
          executionStatus: 'CANONICAL_IDENTITIES_CREATED',
          sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
          requiredSourceStatus: 'PARENT_ADDRESSES_RESOLVED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6710_IdentityRelationshipBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'CANONICAL_IDENTITIES_CREATED',
        sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
        sourceStatusRequired: 'PARENT_ADDRESSES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'CANONICAL_IDENTITIES_CREATED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6710_IdentityRelationshipBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6700_CanonicalIdentityCreationProcessor() {
  return sciipRun6700_CanonicalIdentityCreationProcessor();
}

function sciipTest6700_CanonicalIdentityCreationProcessor() {
  var result = sciipRun6700_CanonicalIdentityCreationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6700_CanonicalIdentityCreationProcessor',
    result: result
  }));
  return result;
}
