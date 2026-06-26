/************************************************************
 * SCIIP_OS v4.1
 * 1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor() {
  const processor =
    '1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_CHECKPOINT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    checkpointBusinessKey: sourceRecord.businessKey || '',
    checkpointName: sourceRecord.systemCheckpointName || '',
    checkpointStatus: sourceRecord.systemCheckpointStatus || '',
    checkpointDateKey: sourceRecord.checkpointDateKey || dateKey,
    replicaBusinessKey: sourceRecord.replicaBusinessKey || '',
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemCheckpointScope || '',
    sourceRecord.systemCheckpointName || '',
    sourceRecord.systemCheckpointStatus || '',
    sourceRecord.systemCheckpointSummary || '',
    sourceRecord.checkpointDateKey || dateKey,
    sourceRecord.replicaBusinessKey || '',
    sourceRecord.replicaName || '',
    sourceRecord.replicaStatus || '',
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.checkpointPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor',
      result
    })
  );

  return result;
}