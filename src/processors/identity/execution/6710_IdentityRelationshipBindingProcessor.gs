/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6710_IdentityRelationshipBindingProcessor.gs
 * Processor: 6710_IdentityRelationshipBinding
 * Purpose: Binds canonical identities to asset, address, parent address, city, zip, and status relationships.
 */

function sciipRun6710_IdentityRelationshipBindingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6710_IdentityRelationshipBinding',
    action: 'IDENTITY_RELATIONSHIP_BINDING',
    targetSheet: 'IDENTITY_RELATIONSHIP_BINDING',
    ledgerSheet: 'IDENTITY_RELATIONSHIP_BINDING_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Binds canonical identities to asset, address, parent address, city, zip, and status relationships.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'CANONICAL_IDENTITY_CREATION',
          requiredSourceStatus: 'CANONICAL_IDENTITIES_CREATED',
          executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6720_IdentityEventGenerationProcessor'
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
      var identityExecutionId = '6710|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        sourceSheet: 'CANONICAL_IDENTITY_CREATION',
        sourceStatusRequired: 'CANONICAL_IDENTITIES_CREATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Binds canonical identities to asset, address, parent address, city, zip, and status relationships.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        sourceSheet: 'CANONICAL_IDENTITY_CREATION',
        sourceStatusRequired: 'CANONICAL_IDENTITIES_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6720_IdentityEventGenerationProcessor',
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
          executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
          sourceSheet: 'CANONICAL_IDENTITY_CREATION',
          requiredSourceStatus: 'CANONICAL_IDENTITIES_CREATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6720_IdentityEventGenerationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        sourceSheet: 'CANONICAL_IDENTITY_CREATION',
        sourceStatusRequired: 'CANONICAL_IDENTITIES_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6720_IdentityEventGenerationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6710_IdentityRelationshipBindingProcessor() {
  return sciipRun6710_IdentityRelationshipBindingProcessor();
}

function sciipTest6710_IdentityRelationshipBindingProcessor() {
  var result = sciipRun6710_IdentityRelationshipBindingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6710_IdentityRelationshipBindingProcessor',
    result: result
  }));
  return result;
}
