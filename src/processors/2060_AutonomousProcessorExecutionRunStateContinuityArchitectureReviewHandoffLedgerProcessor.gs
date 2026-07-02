/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessorLegacy2060_();
      return sciipWrapLegacyRuntimeResult2060_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2060_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessorLegacy2060_() {
  const processor =
    '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffScope',
      'handoffName',
      'handoffStatus',
      'handoffSummary',
      'handoffResult',
      'handoffBusinessKey',
      'handoffNodeType',
      'handoffNodeKey',
      'handoffNodeLabel',
      'handoffRelationshipType',
      'handoffRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffLedgerScope',
      'handoffLedgerName',
      'handoffLedgerStatus',
      'handoffLedgerSummary',
      'ledgeredHandoffBusinessKey',
      'handoffResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const handoffResult = sourceRecord.handoffResult || 'HANDOFF_READY';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.handoffStatus || sourceRecord.sourceStatus || '',
    handoffResult,
    handoffBusinessKey: sourceRecord.handoffBusinessKey || '',
    handoffNodeType: sourceRecord.handoffNodeType || '',
    handoffNodeKey: sourceRecord.handoffNodeKey || '',
    handoffNodeLabel: sourceRecord.handoffNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const handoffLedgerPayload = {
    handoffLedgerType: 'ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceHandoffBusinessKey: sourceRecord.businessKey || '',
    handoffResult,
    ledgeredHandoffBusinessKey: sourceRecord.handoffBusinessKey || '',
    ledgeredNodeType: sourceRecord.handoffNodeType || '',
    ledgeredNodeKey: sourceRecord.handoffNodeKey || '',
    ledgeredNodeLabel: sourceRecord.handoffNodeLabel || '',
    nextTrackRecommendation:
      'Proceed to reusable Architecture Review processor framework analysis after final handoff ledger.',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.handoffStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Handoff Ledger',
    'LEDGERED',
    'Architecture review handoff written into permanent handoff ledger history.',
    sourceRecord.businessKey || '',
    handoffResult,
    sourceRecord.handoffNodeType || '',
    sourceRecord.handoffNodeKey || '',
    sourceRecord.handoffNodeLabel || '',
    sourceRecord.handoffRelationshipType || '',
    sourceRecord.handoffRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(handoffLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
      result
    })
  );

  return result;
}