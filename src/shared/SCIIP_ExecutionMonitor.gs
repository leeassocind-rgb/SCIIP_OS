/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2320 Execution Monitor
 ************************************************************/

function sciipRun2320_ExecutionMonitor() {
  const processor = '2320_ExecutionMonitor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const monitorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_EXECUTION_MONITOR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'monitorScope',
      'monitorName',
      'monitorStatus',
      'monitorResult',
      'detectedErrorCount',
      'retryEligibleCount',
      'retryBlockedCount',
      'runtimeHealthStatus',
      'runtimeHealthScore',
      'monitorFinding',
      'monitorRecommendation',
      'monitorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_EXECUTION_MONITOR|' + dateKey;

  if (sciipSheetBusinessKeyExists_(monitorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executionMonitorsCreated: 0,
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
      status: 'SKIPPED_NO_RETRY_POLICY_ENGINE',
      executionMonitorsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const detectedErrorCount = Number(sourceRecord.detectedErrorCount || 0);
  const retryEligibleCount = Number(sourceRecord.retryEligibleCount || 0);
  const retryBlockedCount = Number(sourceRecord.retryBlockedCount || 0);

  let runtimeHealthStatus = 'HEALTHY';
  let runtimeHealthScore = 100;
  let monitorResult = 'RUNTIME_HEALTHY';
  let monitorFinding =
    'Runtime monitor detected no errors requiring intervention.';
  let monitorRecommendation =
    'Continue normal autonomous runtime operation.';

  if (retryBlockedCount > 0) {
    runtimeHealthStatus = 'ATTENTION_REQUIRED';
    runtimeHealthScore = 60;
    monitorResult = 'RUNTIME_ATTENTION_REQUIRED';
    monitorFinding =
      'Runtime monitor detected blocked retry conditions requiring review.';
    monitorRecommendation =
      'Review blocked processors before continuing autonomous execution.';
  } else if (retryEligibleCount > 0) {
    runtimeHealthStatus = 'RETRY_READY';
    runtimeHealthScore = 75;
    monitorResult = 'RUNTIME_RETRY_READY';
    monitorFinding =
      'Runtime monitor detected retry-eligible processor failures.';
    monitorRecommendation =
      'Execute retry policy workflow before advancing the runtime pipeline.';
  } else if (detectedErrorCount > 0) {
    runtimeHealthStatus = 'WARNINGS_DETECTED';
    runtimeHealthScore = 85;
    monitorResult = 'RUNTIME_WARNINGS_DETECTED';
    monitorFinding =
      'Runtime monitor detected non-blocking runtime warnings.';
    monitorRecommendation =
      'Review warnings and continue execution if acceptable.';
  }

  const now = new Date();

  const monitorPayload = {
    monitorType: 'SCIIP_EXECUTION_MONITOR',
    sourceRetryPolicyBusinessKey: sourceRecord.businessKey || '',
    detectedErrorCount,
    retryEligibleCount,
    retryBlockedCount,
    retryPolicyStatus: sourceRecord.retryPolicyStatus || '',
    retryPolicyResult: sourceRecord.retryPolicyResult || '',
    runtimeHealthStatus,
    runtimeHealthScore,
    monitorResult,
    monitorFinding,
    monitorRecommendation,
    monitoredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.retryPolicyStatus || '',
    retryPolicyResult: sourceRecord.retryPolicyResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  monitorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.retryPolicyStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Execution Monitor',
    runtimeHealthStatus,
    monitorResult,
    detectedErrorCount,
    retryEligibleCount,
    retryBlockedCount,
    runtimeHealthStatus,
    runtimeHealthScore,
    monitorFinding,
    monitorRecommendation,
    JSON.stringify(monitorPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    executionMonitorsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    runtimeHealthStatus,
    runtimeHealthScore,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2320_ExecutionMonitor() {
  const result = sciipRun2320_ExecutionMonitor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2320_ExecutionMonitor',
    result
  }));

  return result;
}