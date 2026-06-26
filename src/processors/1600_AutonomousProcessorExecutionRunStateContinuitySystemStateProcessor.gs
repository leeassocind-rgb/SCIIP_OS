/************************************************************
 * SCIIP_OS v4.1
 * 1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor() {
  const processor =
    '1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemRegistryScope',
      'systemRegistryName',
      'systemRegistryStatus',
      'systemRegistrySummary',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'sourcePayloadJson',
      'ledgerPayloadJson',
      'createdAt'
    ]
  );

  const stateSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(stateSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const statePayload = {
    stateType: 'CONTINUITY_SYSTEM_STATE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    registryBusinessKey: sourceRecord.sourceBusinessKey || '',
    registryName: sourceRecord.systemRegistryName || '',
    registryStatus: sourceRecord.systemRegistryStatus || '',
    stateStatus: 'ACTIVE',
    stateDateKey: dateKey,
    recordedAt: now.toISOString()
  };

  stateSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System State',
    'ACTIVE',
    'Current continuity system registry ledger resolved into active system state.',
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemRegistryName || '',
    sourceRecord.systemRegistryStatus || '',
    JSON.stringify(statePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor',
      result
    })
  );

  return result;
}