/************************************************************
 * SCIIP_OS v4.1
 * 1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor() {
  const processor =
    '1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER',
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
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const checkpointSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT',
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
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(checkpointSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const checkpointPayload = {
    checkpointType: 'CONTINUITY_SYSTEM_CHECKPOINT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    replicaBusinessKey: sourceRecord.sourceBusinessKey || '',
    replicaName: sourceRecord.systemReplicaName || '',
    replicaStatus: sourceRecord.systemReplicaStatus || '',
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    checkpointStatus: 'ACTIVE',
    checkpointDateKey: dateKey,
    checkpointedAt: now.toISOString()
  };

  checkpointSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Checkpoint',
    'ACTIVE',
    'Continuity system replica ledger captured as durable execution checkpoint.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemReplicaName || '',
    sourceRecord.systemReplicaStatus || '',
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    JSON.stringify(checkpointPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor',
      result
    })
  );

  return result;
}