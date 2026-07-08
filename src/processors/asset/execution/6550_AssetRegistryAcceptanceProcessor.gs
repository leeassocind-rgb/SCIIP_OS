/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6550_AssetRegistryAcceptanceProcessor.gs
 *
 * Processor: 6550_AssetRegistryAcceptance
 *
 * Purpose:
 * Accepts the asset registry execution layer and authorizes the next asset operationalization subsystem.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_CERTIFICATION
 * - Creates ASSET_REGISTRY_ACCEPTANCE
 * - Creates ASSET_REGISTRY_ACCEPTANCE_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6550_AssetRegistryAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6550_AssetRegistryAcceptance',
    action: 'ASSET_REGISTRY_ACCEPTANCE',
    sourceSheet: 'ASSET_REGISTRY_CERTIFICATION',
    targetSheet: 'ASSET_REGISTRY_ACCEPTANCE',
    ledgerSheet: 'ASSET_REGISTRY_ACCEPTANCE_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6550GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6550FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Accepts the asset registry execution layer and authorizes the next asset operationalization subsystem.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_CERTIFIED',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6560_AssetRegistryOperationalizationProcessor'
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
        'assetRegistryAcceptanceId',
        'assetRegistryAcceptanceStatus',
        'assetRegistryAcceptanceLayer',
        'assetRegistryAcceptanceScope',
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

      var sourceRecords = sciip6550GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6550FilterReadyRecords_(sourceRecords);
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
            requiredSourceStatus: 'ASSET_REGISTRY_CERTIFIED',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6550_AssetRegistryAcceptance so required asset registry execution records exist.'
          })
        });
        sciip6550AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6560_AssetRegistryOperationalizationProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_EXECUTION_ACCEPTED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6550FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6560_AssetRegistryOperationalizationProcessor',
          executionSummary: 'Accepts the asset registry execution layer and authorizes the next asset operationalization subsystem.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRegistryAcceptanceId'] = '6550_AssetRegistryAcceptance|ASSET_REGISTRY_EXECUTION_ACCEPTED';
        row['assetRegistryAcceptanceStatus'] = 'ASSET_REGISTRY_EXECUTION_ACCEPTED';
        row['assetRegistryAcceptanceLayer'] = 'asset_registry_execution';
        row['assetRegistryAcceptanceScope'] = 'Accepts the asset registry execution layer and authorizes the next asset operationalization subsystem.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
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
          executionStatus: 'ASSET_REGISTRY_EXECUTION_ACCEPTED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6560_AssetRegistryOperationalizationProcessor'
        })
      });
      sciip6550AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_EXECUTION_ACCEPTED', matchingRecords.length, created, skippedDuplicate, 0, '6560_AssetRegistryOperationalizationProcessor', now);
      return result;
    }
  });
}

function run6550_AssetRegistryAcceptanceProcessor() {
  return sciipRun6550_AssetRegistryAcceptanceProcessor();
}

function sciipTest6550_AssetRegistryAcceptanceProcessor() {
  var result = sciipRun6550_AssetRegistryAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6550_AssetRegistryAcceptanceProcessor', result: result }));
  return result;
}

function sciip6550GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6550FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6550RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6550RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRegistryAcceptanceStatus'],
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_REGISTRY_CERTIFIED') return true;
  }
  return false;
}

function sciip6550FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6550AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}
