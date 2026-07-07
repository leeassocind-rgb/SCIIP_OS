/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEXS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEXS_RUNTIME_LEDGER',

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
          originalProcessor: '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessorLegacy1700_();
      return sciipWrapLegacyRuntimeResult1700_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1700_(legacyResult, context, transaction) {
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
 * 1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessorLegacy1700_() {
  const processor =
    '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const indexSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointBusinessKey',
      'checkpointStatus',
      'reviewDeliverablesJson',
      'architectureReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(indexSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const deliverables = [
    'Current Architecture Assessment',
    'Technical Debt and Duplication Audit',
    'Shared Infrastructure Roadmap',
    'Runtime 2.0 Design',
    'Processor Template 2.0',
    'Event Bus Architecture',
    'Knowledge Graph 2.0 Architecture',
    'Migration Plan from v4.1 to v5.0',
    'Executive Architecture Summary'
  ];

  const architectureReviewPayload = {
    reviewType: 'SCIIP_OS_V5_ARCHITECTURE_REVIEW_INDEX',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    reviewTrack: 'V5_ARCHITECTURE_REVIEW',
    currentVersion: 'SCIIP_OS v4.1',
    targetVersion: 'SCIIP_OS v5.0',
    sourceCheckpointLedgerBusinessKey: sourceRecord.businessKey || '',
    checkpointBusinessKey: sourceRecord.sourceBusinessKey || '',
    checkpointStatus: sourceRecord.systemCheckpointStatus || '',
    architectureReviewStatus: 'OPEN',
    architectureReviewPhase: 'INDEX',
    deliverables: deliverables,
    openedAt: now.toISOString()
  };

  indexSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'SCIIP_OS_ARCHITECTURE',
    'SCIIP_OS v5.0 Architecture Review Index',
    'OPEN',
    'INDEX',
    'Architecture review track opened after completion of the 1600-series continuity state hardening block.',
    'V5_ARCHITECTURE_REVIEW',
    'SCIIP_OS v4.1',
    'SCIIP_OS v5.0',
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemCheckpointStatus || '',
    JSON.stringify(deliverables),
    JSON.stringify(architectureReviewPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
      result
    })
  );

  return result;
}