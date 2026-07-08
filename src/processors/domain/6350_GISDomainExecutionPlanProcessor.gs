/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6350_GISDomainExecutionPlanProcessor.gs
 *
 * Processor: 6350_GISDomainExecutionPlan
 *
 * Purpose:
 * Creates the GIS domain execution plan required before GIS-native processors begin.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads GRAPH_DOMAIN_EXECUTION_PLAN
 * - Creates GIS_DOMAIN_EXECUTION_PLAN
 * - Creates GIS_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6350_GISDomainExecutionPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6350_GISDomainExecutionPlan',
    action: 'GIS_DOMAIN_EXECUTION_PLAN',
    sourceSheet: 'GRAPH_DOMAIN_EXECUTION_PLAN',
    targetSheet: 'GIS_DOMAIN_EXECUTION_PLAN',
    ledgerSheet: 'GIS_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6350GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6350FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the GIS domain execution plan required before GIS-native processors begin.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6360_DomainExecutionCoordinationLedgerProcessor'
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

      var sourceRecords = sciip6350GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6350FilterReadyRecords_(sourceRecords);
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
            nextAction: 'Run upstream processor before 6350_GISDomainExecutionPlan so required domain execution records exist.'
          })
        });
        sciip6350AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6360_DomainExecutionCoordinationLedgerProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'GIS_DOMAIN_EXECUTION_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6350FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6350_GISDomainExecutionPlan|GIS_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionStatus: 'GIS_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionLayer: 'gis',
          domainExecutionScope: 'Defines the GIS execution plan for spatial, market, proximity, and map-ready industrial intelligence.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'GRAPH_DOMAIN_EXECUTION_PLAN',
          nextProcessor: '6360_DomainExecutionCoordinationLedgerProcessor',
          executionSummary: 'Creates the GIS domain execution plan required before GIS-native processors begin.',
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
          executionStatus: 'GIS_DOMAIN_EXECUTION_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6360_DomainExecutionCoordinationLedgerProcessor'
        })
      });
      sciip6350AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'GIS_DOMAIN_EXECUTION_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6360_DomainExecutionCoordinationLedgerProcessor', now);
      return result;
    }
  });
}

function run6350_GISDomainExecutionPlanProcessor() {
  return sciipRun6350_GISDomainExecutionPlanProcessor();
}

function sciipTest6350_GISDomainExecutionPlanProcessor() {
  var result = sciipRun6350_GISDomainExecutionPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6350_GISDomainExecutionPlanProcessor', result: result }));
  return result;
}

function sciip6350GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6350FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6350RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6350RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'GRAPH_DOMAIN_EXECUTION_PLAN_READY';
}

function sciip6350FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6350AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
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
