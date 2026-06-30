/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2330 Runtime Metrics Index
 ************************************************************/

function sciipRun2330_RuntimeMetricsIndex() {
  const processor = '2330_RuntimeMetricsIndex';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const metricsSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_METRICS_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'metricsScope',
      'metricsName',
      'metricsStatus',
      'runtimeHealthStatus',
      'runtimeHealthScore',
      'throughputScore',
      'reliabilityScore',
      'availabilityScore',
      'overallRuntimeScore',
      'metricsPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_METRICS_INDEX|' + dateKey;

  if (sciipSheetBusinessKeyExists_(metricsSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeMetricsIndexesCreated: 0,
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
      status: 'SKIPPED_NO_EXECUTION_MONITOR',
      runtimeMetricsIndexesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const runtimeHealthScore = Number(sourceRecord.runtimeHealthScore || 100);
  const detectedErrorCount = Number(sourceRecord.detectedErrorCount || 0);
  const retryEligibleCount = Number(sourceRecord.retryEligibleCount || 0);
  const retryBlockedCount = Number(sourceRecord.retryBlockedCount || 0);

  const throughputScore = Math.max(0, 100 - detectedErrorCount * 5);
  const reliabilityScore = Math.max(0, 100 - retryEligibleCount * 10);
  const availabilityScore = Math.max(0, 100 - retryBlockedCount * 20);

  const overallRuntimeScore = Math.round(
    (
      runtimeHealthScore +
      throughputScore +
      reliabilityScore +
      availabilityScore
    ) / 4
  );

  const now = new Date();

  const metricsPayload = {
    metricsType: 'SCIIP_RUNTIME_METRICS_INDEX',
    sourceExecutionMonitorBusinessKey: sourceRecord.businessKey || '',
    runtimeHealthStatus: sourceRecord.runtimeHealthStatus || '',
    runtimeHealthScore,
    throughputScore,
    reliabilityScore,
    availabilityScore,
    overallRuntimeScore,
    indexedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.monitorStatus || '',
    monitorResult: sourceRecord.monitorResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  metricsSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.monitorStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Metrics Index',
    'INDEXED',
    sourceRecord.runtimeHealthStatus || '',
    runtimeHealthScore,
    throughputScore,
    reliabilityScore,
    availabilityScore,
    overallRuntimeScore,
    JSON.stringify(metricsPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeMetricsIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    overallRuntimeScore,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2330_RuntimeMetricsIndex() {
  const result = sciipRun2330_RuntimeMetricsIndex();

  Logger.log(JSON.stringify({
    test: 'sciipTest2330_RuntimeMetricsIndex',
    result
  }));

  return result;
}