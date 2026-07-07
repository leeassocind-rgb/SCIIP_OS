/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICAS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICAS_RUNTIME_LEDGER',

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
          originalProcessor: '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessorLegacy1660_();
      return sciipWrapLegacyRuntimeResult1660_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1660_(legacyResult, context, transaction) {
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
 * SCIIP_OS v4.1
 * 1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessorLegacy1660_() {
  const processor =
    '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const replicaSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(replicaSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const replicaPayload = {
    replicaType: 'CONTINUITY_SYSTEM_REPLICA',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    mirrorBusinessKey: sourceRecord.sourceBusinessKey || '',
    mirrorName: sourceRecord.systemMirrorName || '',
    mirrorStatus: sourceRecord.systemMirrorStatus || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    replicaStatus: 'ACTIVE',
    replicaDateKey: dateKey,
    replicatedAt: now.toISOString()
  };

  replicaSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Replica',
    'ACTIVE',
    'Continuity system mirror ledger replicated into durable system replica state.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemMirrorName || '',
    sourceRecord.systemMirrorStatus || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    JSON.stringify(replicaPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
      result
    })
  );

  return result;
}