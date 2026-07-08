/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6380_DomainExecutionAcceptanceProcessor.gs
 *
 * Processor: 6380_DomainExecutionAcceptance
 *
 * Purpose:
 * Creates the acceptance gate for the 6300-series execution readiness batch.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_EXECUTION_HANDOFF
 * - Creates DOMAIN_EXECUTION_ACCEPTANCE
 * - Creates DOMAIN_EXECUTION_ACCEPTANCE_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6380_DomainExecutionAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6380_DomainExecutionAcceptance',
    action: 'DOMAIN_EXECUTION_ACCEPTANCE',
    sourceSheet: 'DOMAIN_EXECUTION_HANDOFF',
    targetSheet: 'DOMAIN_EXECUTION_ACCEPTANCE',
    ledgerSheet: 'DOMAIN_EXECUTION_ACCEPTANCE_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6380GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6380FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the acceptance gate for the 6300-series execution readiness batch.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6390_AssetRegistryExecutionReadinessProcessor'
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
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6380GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6380FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6380_DomainExecutionAcceptance so required domain execution records exist.'
          })
        });
        sciip6380AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6390_AssetRegistryExecutionReadinessProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'DOMAIN_EXECUTION_LAYER_ACCEPTED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6380FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6380_DomainExecutionAcceptance|DOMAIN_EXECUTION_LAYER_ACCEPTED',
          domainExecutionStatus: 'DOMAIN_EXECUTION_LAYER_ACCEPTED',
          domainExecutionLayer: 'acceptance',
          domainExecutionScope: 'Accepts the full 6300-series domain execution readiness layer and certifies SCIIP_OS for the next execution subsystem.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'DOMAIN_EXECUTION_HANDOFF',
          nextProcessor: '6390_AssetRegistryExecutionReadinessProcessor',
          executionSummary: 'Creates the acceptance gate for the 6300-series execution readiness batch.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'DOMAIN_EXECUTION_LAYER_ACCEPTED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6390_AssetRegistryExecutionReadinessProcessor'
        })
      });
      sciip6380AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'DOMAIN_EXECUTION_LAYER_ACCEPTED', matchingRecords.length, created, skippedDuplicate, 0, '6390_AssetRegistryExecutionReadinessProcessor', now);
      return result;
    }
  });
}

function run6380_DomainExecutionAcceptanceProcessor() {
  return sciipRun6380_DomainExecutionAcceptanceProcessor();
}

function sciipTest6380_DomainExecutionAcceptanceProcessor() {
  var result = sciipRun6380_DomainExecutionAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6380_DomainExecutionAcceptanceProcessor', result: result }));
  return result;
}

function sciip6380GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6380FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6380RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6380RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'DOMAIN_EXECUTION_HANDOFF_READY';
}

function sciip6380FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6380AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}
