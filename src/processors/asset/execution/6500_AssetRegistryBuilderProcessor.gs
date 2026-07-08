/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6500_AssetRegistryBuilderProcessor.gs
 *
 * Processor: 6500_AssetRegistryBuilder
 *
 * Purpose:
 * Builds the durable asset registry execution record from the asset discovery execution layer.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_DISCOVERY_EXECUTION
 * - Creates ASSET_REGISTRY_BUILD
 * - Creates ASSET_REGISTRY_BUILD_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6500_AssetRegistryBuilderProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6500_AssetRegistryBuilder',
    action: 'ASSET_REGISTRY_BUILDER',
    sourceSheet: 'ASSET_DISCOVERY_EXECUTION',
    targetSheet: 'ASSET_REGISTRY_BUILD',
    ledgerSheet: 'ASSET_REGISTRY_BUILD_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6500GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6500FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Builds the durable asset registry execution record from the asset discovery execution layer.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_DISCOVERY_EXECUTED',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6510_AssetRelationshipBuilderProcessor'
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
        'assetRegistryBuildId',
        'assetRegistryBuildStatus',
        'assetRegistryBuildLayer',
        'assetRegistryBuildScope',
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

      var sourceRecords = sciip6500GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6500FilterReadyRecords_(sourceRecords);
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
            requiredSourceStatus: 'ASSET_DISCOVERY_EXECUTED',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6500_AssetRegistryBuilder so required asset registry execution records exist.'
          })
        });
        sciip6500AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6510_AssetRelationshipBuilderProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_BUILD_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6500FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6510_AssetRelationshipBuilderProcessor',
          executionSummary: 'Builds the durable asset registry execution record from the asset discovery execution layer.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRegistryBuildId'] = '6500_AssetRegistryBuilder|ASSET_REGISTRY_BUILD_READY';
        row['assetRegistryBuildStatus'] = 'ASSET_REGISTRY_BUILD_READY';
        row['assetRegistryBuildLayer'] = 'asset_registry_execution';
        row['assetRegistryBuildScope'] = 'Builds the durable asset registry execution record from the asset discovery execution layer.';

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
          executionStatus: 'ASSET_REGISTRY_BUILD_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6510_AssetRelationshipBuilderProcessor'
        })
      });
      sciip6500AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_BUILD_READY', matchingRecords.length, created, skippedDuplicate, 0, '6510_AssetRelationshipBuilderProcessor', now);
      return result;
    }
  });
}

function run6500_AssetRegistryBuilderProcessor() {
  return sciipRun6500_AssetRegistryBuilderProcessor();
}

function sciipTest6500_AssetRegistryBuilderProcessor() {
  var result = sciipRun6500_AssetRegistryBuilderProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6500_AssetRegistryBuilderProcessor', result: result }));
  return result;
}

function sciip6500GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6500FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6500RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6500RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRegistryBuildStatus'],
    record.assetRegistryBuildStatus,
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
    if (String(candidates[i] || '') === 'ASSET_DISCOVERY_EXECUTED') return true;
  }
  return false;
}

function sciip6500FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6500AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
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
