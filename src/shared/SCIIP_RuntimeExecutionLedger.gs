/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2290 Runtime Execution Ledger
 ************************************************************/

function sciipRun2290_RuntimeExecutionLedger() {
  const processor = '2290_RuntimeExecutionLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_RUNTIME',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'runtimeScope',
      'runtimeName',
      'runtimeStatus',
      'runtimeResult',
      'executionMode',
      'nextStageNumber',
      'resolvedProcessorCount',
      'executedProcessorCount',
      'failedProcessorCount',
      'skippedProcessorCount',
      'runtimeExecutionResultsJson',
      'runtimePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_EXECUTION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'runtimeLedgerScope',
      'runtimeLedgerName',
      'runtimeLedgerStatus',
      'ledgeredRuntimeBusinessKey',
      'runtimeStatus',
      'runtimeResult',
      'executionMode',
      'nextStageNumber',
      'resolvedProcessorCount',
      'executedProcessorCount',
      'failedProcessorCount',
      'skippedProcessorCount',
      'runtimeExecutionResultsJson',
      'runtimeLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_EXECUTION_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeExecutionLedgerEntriesCreated: 0,
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
      status: 'SKIPPED_NO_EXECUTION_RUNTIME',
      runtimeExecutionLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SCIIP_RUNTIME_EXECUTION_LEDGER',
    ledgeredRuntimeBusinessKey: sourceRecord.businessKey || '',
    runtimeStatus: sourceRecord.runtimeStatus || '',
    runtimeResult: sourceRecord.runtimeResult || '',
    executionMode: sourceRecord.executionMode || '',
    nextStageNumber: Number(sourceRecord.nextStageNumber || 0),
    resolvedProcessorCount: Number(sourceRecord.resolvedProcessorCount || 0),
    executedProcessorCount: Number(sourceRecord.executedProcessorCount || 0),
    failedProcessorCount: Number(sourceRecord.failedProcessorCount || 0),
    skippedProcessorCount: Number(sourceRecord.skippedProcessorCount || 0),
    ledgeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.runtimeStatus || '',
    runtimeResult: sourceRecord.runtimeResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.runtimeStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Execution Ledger',
    'LEDGERED',
    sourceRecord.businessKey || '',
    sourceRecord.runtimeStatus || '',
    sourceRecord.runtimeResult || '',
    sourceRecord.executionMode || '',
    sourceRecord.nextStageNumber || 0,
    sourceRecord.resolvedProcessorCount || 0,
    sourceRecord.executedProcessorCount || 0,
    sourceRecord.failedProcessorCount || 0,
    sourceRecord.skippedProcessorCount || 0,
    sourceRecord.runtimeExecutionResultsJson || '[]',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeExecutionLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2290_RuntimeExecutionLedger() {
  const result = sciipRun2290_RuntimeExecutionLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2290_RuntimeExecutionLedger',
    result
  }));

  return result;
}