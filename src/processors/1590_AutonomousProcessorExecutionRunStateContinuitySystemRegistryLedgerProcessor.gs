/************************************************************
 * SCIIP_OS v4.1
 * 1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor() {
  const processor =
    '1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY',
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
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_REGISTRY_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    registryBusinessKey: sourceRecord.businessKey || '',
    registryStatus: sourceRecord.systemRegistryStatus || '',
    registryName: sourceRecord.systemRegistryName || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemRegistryScope || '',
    sourceRecord.systemRegistryName || '',
    sourceRecord.systemRegistryStatus || '',
    sourceRecord.systemRegistrySummary || '',
    sourceRecord.systemIndexDateKey || '',
    sourceRecord.systemIndexScope || '',
    sourceRecord.systemIndexName || '',
    sourceRecord.systemIndexStatus || '',
    sourceRecord.sourcePayloadJson || '',
    JSON.stringify(ledgerPayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor',
      result
    })
  );

  return result;
}