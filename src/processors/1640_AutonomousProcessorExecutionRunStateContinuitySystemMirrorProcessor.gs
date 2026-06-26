/************************************************************
 * SCIIP_OS v4.1
 * 1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor() {
  const processor =
    '1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const mirrorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR',
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
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(mirrorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const mirrorPayload = {
    mirrorType: 'CONTINUITY_SYSTEM_MIRROR',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    snapshotBusinessKey: sourceRecord.sourceBusinessKey || '',
    snapshotName: sourceRecord.systemSnapshotName || '',
    snapshotStatus: sourceRecord.systemSnapshotStatus || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    stateName: sourceRecord.stateName || '',
    stateStatus: sourceRecord.stateStatus || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    registryName: sourceRecord.registryName || '',
    registryStatus: sourceRecord.registryStatus || '',
    mirrorStatus: 'ACTIVE',
    mirrorDateKey: dateKey,
    mirroredAt: now.toISOString()
  };

  mirrorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Mirror',
    'ACTIVE',
    'Continuity system snapshot ledger mirrored into active system representation.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemSnapshotName || '',
    sourceRecord.systemSnapshotStatus || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.stateName || '',
    sourceRecord.stateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    JSON.stringify(mirrorPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor',
      result
    })
  );

  return result;
}