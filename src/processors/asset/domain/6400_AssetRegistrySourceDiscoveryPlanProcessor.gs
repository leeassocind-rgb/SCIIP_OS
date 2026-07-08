/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6400_AssetRegistrySourceDiscoveryPlanProcessor.gs
 *
 * Processor: 6400_AssetRegistrySourceDiscoveryPlan
 *
 * Purpose:
 * Defines the source discovery plan for asset registry execution across property, asset, address, city, zip, and status sources.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_EXECUTION_READINESS
 * - Creates ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN
 * - Creates ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6400_AssetRegistrySourceDiscoveryPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6400_AssetRegistrySourceDiscoveryPlan',
    action: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN',
    sourceSheet: 'ASSET_REGISTRY_EXECUTION_READINESS',
    targetSheet: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN',
    ledgerSheet: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6400GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6400FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Defines the source discovery plan for asset registry execution across property, asset, address, city, zip, and status sources.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6410_AssetRegistrySchemaReadinessProcessor'
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
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
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

      var sourceRecords = sciip6400GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6400FilterReadyRecords_(sourceRecords);
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
            requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6400_AssetRegistrySourceDiscoveryPlan so required asset registry execution records exist.'
          })
        });
        sciip6400AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6410_AssetRegistrySchemaReadinessProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6400FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6400_AssetRegistrySourceDiscoveryPlan|ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Defines the source discovery plan for asset registry execution across property, asset, address, city, zip, and status sources.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_EXECUTION_READINESS',
          nextProcessor: '6410_AssetRegistrySchemaReadinessProcessor',
          executionSummary: 'Defines the source discovery plan for asset registry execution across property, asset, address, city, zip, and status sources.',
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
          executionStatus: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6410_AssetRegistrySchemaReadinessProcessor'
        })
      });
      sciip6400AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6410_AssetRegistrySchemaReadinessProcessor', now);
      return result;
    }
  });
}

function run6400_AssetRegistrySourceDiscoveryPlanProcessor() {
  return sciipRun6400_AssetRegistrySourceDiscoveryPlanProcessor();
}

function sciipTest6400_AssetRegistrySourceDiscoveryPlanProcessor() {
  var result = sciipRun6400_AssetRegistrySourceDiscoveryPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6400_AssetRegistrySourceDiscoveryPlanProcessor', result: result }));
  return result;
}

function sciip6400GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6400FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6400RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6400RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_EXECUTION_READY';
}

function sciip6400FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6400AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
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
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}
