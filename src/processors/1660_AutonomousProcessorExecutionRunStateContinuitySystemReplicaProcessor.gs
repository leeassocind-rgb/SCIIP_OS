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

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor() {
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