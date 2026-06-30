/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2300 Runtime Error Handler
 ************************************************************/

function sciipRun2300_RuntimeErrorHandler() {
  const processor = '2300_RuntimeErrorHandler';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const errorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_ERROR_HANDLER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'errorScope',
      'errorHandlerName',
      'errorHandlerStatus',
      'errorHandlerResult',
      'runtimeStatus',
      'runtimeResult',
      'failedProcessorCount',
      'skippedProcessorCount',
      'detectedErrorCount',
      'detectedErrorsJson',
      'errorHandlerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_ERROR_HANDLER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(errorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeErrorHandlersCreated: 0,
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
      status: 'SKIPPED_NO_RUNTIME_EXECUTION_LEDGER',
      runtimeErrorHandlersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let runtimeExecutionResults = [];

  try {
    runtimeExecutionResults = JSON.parse(
      sourceRecord.runtimeExecutionResultsJson || '[]'
    );
  } catch (err) {
    runtimeExecutionResults = [];
  }

  const detectedErrors = runtimeExecutionResults.filter(function(item) {
    const status = String(item.status || '').toUpperCase();
    return (
      status === 'FAILED' ||
      status === 'SKIPPED_FUNCTION_NOT_FOUND' ||
      status.indexOf('ERROR') >= 0
    );
  });

  const failedProcessorCount = Number(sourceRecord.failedProcessorCount || 0);
  const skippedProcessorCount = Number(sourceRecord.skippedProcessorCount || 0);
  const detectedErrorCount = detectedErrors.length;

  let errorHandlerStatus = 'CLEAR';
  let errorHandlerResult = 'NO_RUNTIME_ERRORS_DETECTED';

  if (failedProcessorCount > 0 || detectedErrorCount > 0) {
    errorHandlerStatus = 'ERRORS_DETECTED';
    errorHandlerResult = 'RUNTIME_ERRORS_REQUIRE_REVIEW';
  } else if (skippedProcessorCount > 0) {
    errorHandlerStatus = 'WARNINGS_DETECTED';
    errorHandlerResult = 'RUNTIME_SKIPS_REQUIRE_REVIEW';
  }

  const now = new Date();

  const errorHandlerPayload = {
    errorHandlerType: 'SCIIP_RUNTIME_ERROR_HANDLER',
    sourceRuntimeExecutionLedgerBusinessKey: sourceRecord.businessKey || '',
    runtimeStatus: sourceRecord.runtimeStatus || '',
    runtimeResult: sourceRecord.runtimeResult || '',
    failedProcessorCount,
    skippedProcessorCount,
    detectedErrorCount,
    detectedErrors,
    errorHandlerStatus,
    errorHandlerResult,
    handledAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.runtimeLedgerStatus || '',
    runtimeStatus: sourceRecord.runtimeStatus || '',
    runtimeResult: sourceRecord.runtimeResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  errorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.runtimeLedgerStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Error Handler',
    errorHandlerStatus,
    errorHandlerResult,
    sourceRecord.runtimeStatus || '',
    sourceRecord.runtimeResult || '',
    failedProcessorCount,
    skippedProcessorCount,
    detectedErrorCount,
    JSON.stringify(detectedErrors),
    JSON.stringify(errorHandlerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeErrorHandlersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    errorHandlerStatus,
    detectedErrorCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2300_RuntimeErrorHandler() {
  const result = sciipRun2300_RuntimeErrorHandler();

  Logger.log(JSON.stringify({
    test: 'sciipTest2300_RuntimeErrorHandler',
    result
  }));

  return result;
}