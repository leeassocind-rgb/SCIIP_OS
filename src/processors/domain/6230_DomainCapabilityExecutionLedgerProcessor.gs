/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6230_DomainCapabilityExecutionLedgerProcessor.gs
 *
 * Processor: 6230_DomainCapabilityExecutionLedger
 *
 * Purpose:
 * Creates the permanent execution ledger for SCIIP_OS v5.5 domain capabilities
 * registered by 6220_DomainCapabilityRegistry.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_REGISTRY
 * - Creates DOMAIN_CAPABILITY_EXECUTION_LEDGER
 * - Creates DOMAIN_CAPABILITY_EXECUTION_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework
 * - Row-level duplicate-safe with SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey
 * - Skip-safe when 6220 has not produced registry records
 * - Preserves permanent ledger history
 */

function sciipRun6230_DomainCapabilityExecutionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6230_DomainCapabilityExecutionLedger',
    action: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    sourceSheet: 'DOMAIN_CAPABILITY_REGISTRY',
    targetSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    ledgerSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var registryRecords = [];

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
        SCIIP_RUNTIME_SHEET_FACTORY &&
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
      ) {
        registryRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      }

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: registryRecords.length,
        outputCount: registryRecords.length,
        summary: 'SCIIP_OS v5.5 domain capability execution ledger payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          sourceProcessor: '6220_DomainCapabilityRegistry',
          registryRecordCount: registryRecords.length,
          nextProcessor: '6240_AssetDomainCapabilityActivationProcessor'
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
        'domainCapabilityExecutionStatus',
        'domainCapabilityExecutionMode',
        'domainCapabilityRuntimeDependency',
        'domainCapabilityExecutionSequence',
        'sourceProcessor',
        'nextProcessor',
        'executionReadinessSummary',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionLedgerStatus',
        'sourceSheet',
        'targetSheet',
        'registryRecordsRead',
        'executionLedgerRecordsCreated',
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

      var registryRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!registryRecords || registryRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          message: JSON.stringify({
            executionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 6220_DomainCapabilityRegistryProcessor before 6230 so records exist in DOMAIN_CAPABILITY_REGISTRY.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            executionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            registryRecordsRead: 0,
            executionLedgerRecordsCreated: 0,
            skippedDuplicate: 0,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            nextProcessor: '6220_DomainCapabilityRegistryProcessor',
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

      registryRecords.forEach(function(record, index) {
        var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
        var capabilityName = record.domainCapabilityName || record.DomainCapabilityName || '';
        var capabilityLayer = record.domainCapabilityLayer || record.DomainCapabilityLayer || '';
        var capabilityMode = record.domainCapabilityExecutionMode || record.DomainCapabilityExecutionMode || '';
        var runtimeDependency = record.domainCapabilityRuntimeDependency || record.DomainCapabilityRuntimeDependency || '';
        var sourceBusinessKey = record.businessKey || record.Business_Key || record.BusinessKey || '';
        var nextProcessor = record.nextProcessor || record.NextProcessor || '';

        if (!capabilityId) {
          return;
        }

        var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
          context.processor,
          definition.targetSheet,
          capabilityId,
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
            domainCapabilityId: capabilityId,
            domainCapabilityName: capabilityName,
            domainCapabilityLayer: capabilityLayer,
            domainCapabilityExecutionStatus: 'READY_FOR_ACTIVATION',
            domainCapabilityExecutionMode: capabilityMode || 'RUNTIME_DOMAIN_PROCESSOR',
            domainCapabilityRuntimeDependency: runtimeDependency || 'SCIIP_RUNTIME_PROCESSOR_BASE|Runtime v5.2|v5.4-runtime-6200',
            domainCapabilityExecutionSequence: index + 1,
            sourceProcessor: '6220_DomainCapabilityRegistry',
            nextProcessor: nextProcessor,
            executionReadinessSummary: 'Domain capability registered and ready for runtime-backed activation.',
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
        recordsRead: registryRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionLedgerStatus: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER_READY',
          registryRecordsRead: registryRecords.length,
          executionLedgerRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6240_AssetDomainCapabilityActivationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          executionLedgerStatus: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER_READY',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          registryRecordsRead: registryRecords.length,
          executionLedgerRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6240_AssetDomainCapabilityActivationProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6230_DomainCapabilityExecutionLedgerProcessor() {
  return sciipRun6230_DomainCapabilityExecutionLedgerProcessor();
}

function sciipTest6230_DomainCapabilityExecutionLedgerProcessor() {
  var result = sciipRun6230_DomainCapabilityExecutionLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6230_DomainCapabilityExecutionLedgerProcessor',
    result: result
  }));

  return result;
}
