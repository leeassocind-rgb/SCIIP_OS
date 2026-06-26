/************************************************************
 * SCIIP_OS v4.1
 * 1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor() {
  const processor =
    '1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER',
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
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_STATE_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    stateBusinessKey: sourceRecord.businessKey || '',
    stateName: sourceRecord.systemStateName || '',
    stateStatus: sourceRecord.systemStateStatus || '',
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
    sourceRecord.systemStateScope || '',
    sourceRecord.systemStateName || '',
    sourceRecord.systemStateStatus || '',
    sourceRecord.systemStateSummary || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    sourceRecord.statePayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor',
      result
    })
  );

  return result;
}