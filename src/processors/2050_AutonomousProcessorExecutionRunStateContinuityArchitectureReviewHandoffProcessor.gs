/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFFS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFFS_RUNTIME_LEDGER',

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
          originalProcessor: '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessorLegacy2050_();
      return sciipWrapLegacyRuntimeResult2050_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2050_(legacyResult, context, transaction) {
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
 * 2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessorLegacy2050_() {
  const processor =
    '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionLedgerScope',
      'completionLedgerName',
      'completionLedgerStatus',
      'completionLedgerSummary',
      'ledgeredCompletionBusinessKey',
      'completionResult',
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
      'completionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const handoffSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(handoffSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const completionResult = sourceRecord.completionResult || 'COMPLETED';

  const handoffResult =
    String(completionResult).toUpperCase() === 'COMPLETED'
      ? 'HANDOFF_READY'
      : 'HANDOFF_BLOCKED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.completionLedgerStatus || sourceRecord.sourceStatus || '',
    completionResult,
    ledgeredCompletionBusinessKey:
      sourceRecord.ledgeredCompletionBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const handoffPayload = {
    handoffType: 'ARCHITECTURE_REVIEW_HANDOFF',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCompletionLedgerBusinessKey: sourceRecord.businessKey || '',
    completionResult,
    handoffResult,
    handoffBusinessKey: sourceRecord.ledgeredCompletionBusinessKey || '',
    handoffNodeType: sourceRecord.ledgeredNodeType || '',
    handoffNodeKey: sourceRecord.ledgeredNodeKey || '',
    handoffNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    nextTrackRecommendation:
      'Begin framework abstraction review for repeated Architecture Review Track processor patterns.',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    handedOffAt: now.toISOString()
  };

  handoffSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.completionLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_HANDOFF',
    'SCIIP_OS v5.0 Architecture Review Handoff',
    handoffResult,
    'Architecture review completion ledger prepared for downstream handoff.',
    handoffResult,
    sourceRecord.ledgeredCompletionBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(handoffPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
      result
    })
  );

  return result;
}