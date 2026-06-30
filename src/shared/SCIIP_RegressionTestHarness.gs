/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2340 Regression Test Harness
 ************************************************************/

function sciipRun2340_RegressionTestHarness() {
  const processor = '2340_RegressionTestHarness';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const harnessSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_REGRESSION_TEST_HARNESS',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'harnessScope',
      'harnessName',
      'harnessStatus',
      'harnessResult',
      'registeredTestCount',
      'executableTestCount',
      'missingTestCount',
      'testHarnessMode',
      'registeredTestsJson',
      'missingTestsJson',
      'harnessPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_REGRESSION_TEST_HARNESS|' + dateKey;

  if (sciipSheetBusinessKeyExists_(harnessSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      regressionTestHarnessesCreated: 0,
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
      status: 'SKIPPED_NO_RUNTIME_METRICS_INDEX',
      regressionTestHarnessesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const registry = sciipListRegisteredProcessors_();

  const registeredTests = [];
  const missingTests = [];

  registry.forEach(function(item) {
    const testFunction = item.testFunction || '';

    if (testFunction && typeof globalThis[testFunction] === 'function') {
      registeredTests.push({
        registryKey: item.registryKey,
        processorNumber: item.processorNumber,
        testFunction: testFunction,
        processorFunction: item.processorFunction,
        status: 'TEST_AVAILABLE'
      });
    } else {
      missingTests.push({
        registryKey: item.registryKey,
        processorNumber: item.processorNumber,
        testFunction: testFunction,
        processorFunction: item.processorFunction,
        status: 'TEST_MISSING'
      });
    }
  });

  const registeredTestCount = registry.length;
  const executableTestCount = registeredTests.length;
  const missingTestCount = missingTests.length;

  const harnessStatus =
    missingTestCount === 0 ? 'READY' : 'ATTENTION_REQUIRED';

  const harnessResult =
    missingTestCount === 0
      ? 'REGRESSION_TEST_HARNESS_READY'
      : 'REGRESSION_TESTS_MISSING';

  const now = new Date();

  const harnessPayload = {
    harnessType: 'SCIIP_REGRESSION_TEST_HARNESS',
    sourceRuntimeMetricsIndexBusinessKey: sourceRecord.businessKey || '',
    registeredTestCount,
    executableTestCount,
    missingTestCount,
    testHarnessMode: 'DISCOVERY_ONLY',
    registeredTests,
    missingTests,
    harnessStatus,
    harnessResult,
    createdAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.metricsStatus || '',
    overallRuntimeScore: sourceRecord.overallRuntimeScore || '',
    createdAt: sourceRecord.createdAt || ''
  };

  harnessSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.metricsStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Regression Test Harness',
    harnessStatus,
    harnessResult,
    registeredTestCount,
    executableTestCount,
    missingTestCount,
    'DISCOVERY_ONLY',
    JSON.stringify(registeredTests),
    JSON.stringify(missingTests),
    JSON.stringify(harnessPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    regressionTestHarnessesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    harnessStatus,
    executableTestCount,
    missingTestCount,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2340_RegressionTestHarness() {
  const result = sciipRun2340_RegressionTestHarness();

  Logger.log(JSON.stringify({
    test: 'sciipTest2340_RegressionTestHarness',
    result
  }));

  return result;
}