/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6270_GraphDomainCapabilityActivationProcessor.gs
 *
 * Processor: 6270_GraphDomainCapabilityActivation
 *
 * Purpose:
 * Activates the graph domain capability on top of the completed SCIIP_OS runtime foundation.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_EXECUTION_LEDGER
 * - Creates GRAPH_DOMAIN_CAPABILITY_ACTIVATIONS
 * - Creates GRAPH_DOMAIN_CAPABILITY_ACTIVATION_LEDGER
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream domain execution ledger records are not present
 * - Preserves permanent activation ledger history
 */

function sciipRun6270_GraphDomainCapabilityActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6270_GraphDomainCapabilityActivation',
    action: 'GRAPHDOMAINCAPABILITYACTIVATION',
    sourceSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    targetSheet: 'GRAPH_DOMAIN_CAPABILITY_ACTIVATIONS',
    ledgerSheet: 'GRAPH_DOMAIN_CAPABILITY_ACTIVATION_LEDGER',

    buildPayload: function(context, definition) {
      var sourceRecords = [];

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
        SCIIP_RUNTIME_SHEET_FACTORY &&
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
      ) {
        sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      }

      var matchingRecords = sciip6270FilterCapabilityRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: matchingRecords.length,
        outputCount: matchingRecords.length,
        summary: 'SCIIP_OS v5.5 graph domain capability activation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          sourceProcessor: '6260_IdentityDomainCapabilityActivation',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6280_GISDomainCapabilityActivationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
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
        'sourceBusinessKey',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityLayer',
        'activationStatus',
        'activationScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'activationSummary',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'activationStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      var matchingRecords = sciip6270FilterCapabilityRecords_(sourceRecords);

      if (!matchingRecords || matchingRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            activationStatus: 'SKIPPED_NO_INPUTS',
            requiredCapabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 6230_DomainCapabilityExecutionLedgerProcessor before 6270 so capability execution records exist.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            activationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            recordsCreated: 0,
            skippedDuplicate: 0,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            nextProcessor: '6260_IdentityDomainCapabilityActivation',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: new Date()
          }
        );

        return skippedResult;
      }

      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      matchingRecords.forEach(function(record) {
        var sourceBusinessKey = record.businessKey || record.Business_Key || record.BusinessKey || '';
        var capabilityName = record.domainCapabilityName || record.DomainCapabilityName || 'GraphDomainCapabilityActivation';
        var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
          context.processor,
          definition.targetSheet,
          'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            sourceBusinessKey: sourceBusinessKey,
            domainCapabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
            domainCapabilityName: capabilityName,
            domainCapabilityLayer: 'graph',
            activationStatus: 'GRAPH_DOMAIN_CAPABILITY_ACTIVE',
            activationScope: 'Activates graph-native node, edge, relationship, and domain event execution readiness.',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            sourceProcessor: '6260_IdentityDomainCapabilityActivation',
            nextProcessor: '6280_GISDomainCapabilityActivationProcessor',
            activationSummary: 'Activates graph-native node, edge, relationship, and domain event execution readiness.',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          activationStatus: 'GRAPH_DOMAIN_CAPABILITY_ACTIVE',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6280_GISDomainCapabilityActivationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          activationStatus: 'GRAPH_DOMAIN_CAPABILITY_ACTIVE',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6280_GISDomainCapabilityActivationProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6270_GraphDomainCapabilityActivationProcessor() {
  return sciipRun6270_GraphDomainCapabilityActivationProcessor();
}

function sciipTest6270_GraphDomainCapabilityActivationProcessor() {
  var result = sciipRun6270_GraphDomainCapabilityActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6270_GraphDomainCapabilityActivationProcessor',
    result: result
  }));

  return result;
}

function sciip6270FilterCapabilityRecords_(records) {
  return (records || []).filter(function(record) {
    var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
    var layer = record.domainCapabilityLayer || record.DomainCapabilityLayer || '';
    return String(capabilityId) === 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION' || String(layer).toLowerCase() === 'graph';
  });
}
