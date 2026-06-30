/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2310 Retry Policy Engine
 ************************************************************/

function sciipRun2310_RetryPolicyEngine() {
  const processor = '2310_RetryPolicyEngine';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const retrySheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RETRY_POLICY_ENGINE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'retryScope',
      'retryPolicyName',
      'retryPolicyStatus',
      'retryPolicyResult',
      'detectedErrorCount',
      'retryEligibleCount',
      'retryBlockedCount',
      'maxRetryAttempts',
      'retryBackoffStrategy',
      'retryEligibleProcessorsJson',
      'retryBlockedProcessorsJson',
      'retryPolicyPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RETRY_POLICY_ENGINE|' + dateKey;

  if (sciipSheetBusinessKeyExists_(retrySheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      retryPolicyEnginesCreated: 0,
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
      status: 'SKIPPED_NO_RUNTIME_ERROR_HANDLER',
      retryPolicyEnginesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  let detectedErrors = [];

  try {
    detectedErrors = JSON.parse(sourceRecord.detectedErrorsJson || '[]');
  } catch (err) {
    detectedErrors = [];
  }

  const maxRetryAttempts = 3;
  const retryBackoffStrategy = 'EXPONENTIAL_BACKOFF';

  const retryEligibleProcessors = [];
  const retryBlockedProcessors = [];

  detectedErrors.forEach(function(item) {
    const status = String(item.status || '').toUpperCase();

    if (status === 'FAILED') {
      retryEligibleProcessors.push({
        registryKey: item.registryKey || '',
        processorNumber: item.processorNumber || '',
        processorFunction: item.processorFunction || '',
        status: item.status || '',
        retryReason: item.errorMessage || 'Processor failed during runtime execution.',
        maxRetryAttempts: maxRetryAttempts,
        retryBackoffStrategy: retryBackoffStrategy
      });
    } else {
      retryBlockedProcessors.push({
        registryKey: item.registryKey || '',
        processorNumber: item.processorNumber || '',
        processorFunction: item.processorFunction || '',
        status: item.status || '',
        blockedReason: 'Processor is not eligible for automatic retry under current policy.'
      });
    }
  });

  const detectedErrorCount = Number(sourceRecord.detectedErrorCount || detectedErrors.length);
  const retryEligibleCount = retryEligibleProcessors.length;
  const retryBlockedCount = retryBlockedProcessors.length;

  let retryPolicyStatus = 'NO_RETRY_REQUIRED';
  let retryPolicyResult = 'NO_ERRORS_ELIGIBLE_FOR_RETRY';

  if (retryEligibleCount > 0) {
    retryPolicyStatus = 'RETRY_READY';
    retryPolicyResult = 'RETRY_ELIGIBLE_PROCESSORS_IDENTIFIED';
  } else if (retryBlockedCount > 0) {
    retryPolicyStatus = 'RETRY_BLOCKED';
    retryPolicyResult = 'ERRORS_NOT_ELIGIBLE_FOR_AUTOMATIC_RETRY';
  }

  const now = new Date();

  const retryPolicyPayload = {
    retryPolicyType: 'SCIIP_RETRY_POLICY_ENGINE',
    sourceRuntimeErrorHandlerBusinessKey: sourceRecord.businessKey || '',
    detectedErrorCount,
    retryEligibleCount,
    retryBlockedCount,
    maxRetryAttempts,
    retryBackoffStrategy,
    retryEligibleProcessors,
    retryBlockedProcessors,
    retryPolicyStatus,
    retryPolicyResult,
    evaluatedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.errorHandlerStatus || '',
    errorHandlerResult: sourceRecord.errorHandlerResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  retrySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.errorHandlerStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Retry Policy Engine',
    retryPolicyStatus,
    retryPolicyResult,
    detectedErrorCount,
    retryEligibleCount,
    retryBlockedCount,
    maxRetryAttempts,
    retryBackoffStrategy,
    JSON.stringify(retryEligibleProcessors),
    JSON.stringify(retryBlockedProcessors),
    JSON.stringify(retryPolicyPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    retryPolicyEnginesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    retryPolicyStatus,
    retryEligibleCount,
    retryBlockedCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2310_RetryPolicyEngine() {
  const result = sciipRun2310_RetryPolicyEngine();

  Logger.log(JSON.stringify({
    test: 'sciipTest2310_RetryPolicyEngine',
    result
  }));

  return result;
}