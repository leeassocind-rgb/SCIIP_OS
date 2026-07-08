/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6210_DomainCapabilityExpansionReadinessProcessor.gs
 *
 * Processor: 6210_DomainCapabilityExpansionReadiness
 *
 * Purpose:
 * Self-certifies that SCIIP_OS has completed the v5.4 runtime foundation
 * and is ready to begin v5.5 domain capability execution.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Self-certifying domain-layer processor
 * - No source-sheet dependency
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework
 * - Creates required readiness and ledger sheets automatically
 * - Preserves permanent ledger history
 */

function sciipRun6210_DomainCapabilityExpansionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6210_DomainCapabilityExpansionReadiness',
    action: 'DOMAIN_CAPABILITY_EXPANSION_READINESS',
    targetSheet: 'DOMAIN_CAPABILITY_EXPANSION_READINESS',
    ledgerSheet: 'DOMAIN_CAPABILITY_EXPANSION_READINESS_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'SCIIP_OS v5.5 domain capability expansion readiness payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          runtimeScope: 'Runtime Framework|Production Runtime|Autonomous Runtime|Control Plane|Supervisor',
          nextProcessor: '6220_DomainCapabilityRegistryProcessor'
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

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'readinessId',
        'readinessStatus',
        'runtimeMilestone',
        'domainMilestone',
        'runtimeFoundationStatus',
        'domainExpansionScope',
        'readinessSummary',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'readinessStatus',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var readinessId = 'DOMAIN_EXPANSION_READINESS|v5.5|6210';
      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        readinessId,
        SCIIP_RUNTIME.getDateKey({})
      ]);

      var created = 0;
      var skippedDuplicate = 0;

      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            readinessId: readinessId,
            readinessStatus: 'DOMAIN_CAPABILITY_EXPANSION_READY',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            runtimeFoundationStatus: 'ACCEPTED',
            domainExpansionScope: 'Asset|SuperSheet|Identity|Knowledge Graph|GIS',
            readinessSummary: 'SCIIP_OS v5.5 domain capability expansion readiness certified. Runtime foundation through 6200 is accepted and ready for domain execution.',
            nextProcessor: '6220_DomainCapabilityRegistryProcessor',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: 1,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          readinessStatus: 'DOMAIN_CAPABILITY_EXPANSION_READY',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          transactionId: transaction.transactionId,
          nextProcessor: '6220_DomainCapabilityRegistryProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          readinessStatus: 'DOMAIN_CAPABILITY_EXPANSION_READY',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6220_DomainCapabilityRegistryProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6210_DomainCapabilityExpansionReadinessProcessor() {
  return sciipRun6210_DomainCapabilityExpansionReadinessProcessor();
}

function sciipTest6210_DomainCapabilityExpansionReadinessProcessor() {
  var result = sciipRun6210_DomainCapabilityExpansionReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6210_DomainCapabilityExpansionReadinessProcessor',
    result: result
  }));

  return result;
}
