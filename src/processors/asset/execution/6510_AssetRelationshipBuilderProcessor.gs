/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6510_AssetRelationshipBuilderProcessor.gs
 *
 * Processor: 6510_AssetRelationshipBuilder
 *
 * Purpose:
 * Prepares asset relationship execution bindings for identity, graph, GIS, and registry continuity.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_BUILD
 * - Creates ASSET_RELATIONSHIP_BUILD
 * - Creates ASSET_RELATIONSHIP_BUILD_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6510_AssetRelationshipBuilderProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6510_AssetRelationshipBuilder',
    action: 'ASSET_RELATIONSHIP_BUILDER',
    sourceSheet: 'ASSET_REGISTRY_BUILD',
    targetSheet: 'ASSET_RELATIONSHIP_BUILD',
    ledgerSheet: 'ASSET_RELATIONSHIP_BUILD_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6510GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6510FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Prepares asset relationship execution bindings for identity, graph, GIS, and registry continuity.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_BUILD_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6520_AssetRegistryValidationProcessor'
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
        'assetRelationshipBuildId',
        'assetRelationshipBuildStatus',
        'assetRelationshipBuildLayer',
        'assetRelationshipBuildScope',
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

      var sourceRecords = sciip6510GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6510FilterReadyRecords_(sourceRecords);
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
            requiredSourceStatus: 'ASSET_REGISTRY_BUILD_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6510_AssetRelationshipBuilder so required asset registry execution records exist.'
          })
        });
        sciip6510AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6520_AssetRegistryValidationProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_RELATIONSHIP_BUILD_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6510FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6520_AssetRegistryValidationProcessor',
          executionSummary: 'Prepares asset relationship execution bindings for identity, graph, GIS, and registry continuity.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRelationshipBuildId'] = '6510_AssetRelationshipBuilder|ASSET_RELATIONSHIP_BUILD_READY';
        row['assetRelationshipBuildStatus'] = 'ASSET_RELATIONSHIP_BUILD_READY';
        row['assetRelationshipBuildLayer'] = 'asset_registry_execution';
        row['assetRelationshipBuildScope'] = 'Prepares asset relationship execution bindings for identity, graph, GIS, and registry continuity.';

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
          executionStatus: 'ASSET_RELATIONSHIP_BUILD_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6520_AssetRegistryValidationProcessor'
        })
      });
      sciip6510AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_RELATIONSHIP_BUILD_READY', matchingRecords.length, created, skippedDuplicate, 0, '6520_AssetRegistryValidationProcessor', now);
      return result;
    }
  });
}

function run6510_AssetRelationshipBuilderProcessor() {
  return sciipRun6510_AssetRelationshipBuilderProcessor();
}

function sciipTest6510_AssetRelationshipBuilderProcessor() {
  var result = sciipRun6510_AssetRelationshipBuilderProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6510_AssetRelationshipBuilderProcessor', result: result }));
  return result;
}

function sciip6510GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6510FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6510RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6510RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRelationshipBuildStatus'],
    record.assetRelationshipBuildStatus,
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
    if (String(candidates[i] || '') === 'ASSET_REGISTRY_BUILD_READY') return true;
  }
  return false;
}

function sciip6510FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6510AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
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
