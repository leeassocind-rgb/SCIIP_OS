/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2350 Runtime Health Snapshot
 ************************************************************/

function sciipRun2350_RuntimeHealthSnapshot() {
  const processor = '2350_RuntimeHealthSnapshot';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const snapshotSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_HEALTH_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'snapshotScope',
      'snapshotName',
      'snapshotStatus',
      'snapshotResult',
      'runtimeHealthStatus',
      'overallRuntimeScore',
      'harnessStatus',
      'registeredTestCount',
      'executableTestCount',
      'missingTestCount',
      'snapshotFinding',
      'snapshotRecommendation',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_HEALTH_SNAPSHOT|' + dateKey;

  if (sciipSheetBusinessKeyExists_(snapshotSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeHealthSnapshotsCreated: 0,
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
      status: 'SKIPPED_NO_REGRESSION_TEST_HARNESS',
      runtimeHealthSnapshotsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const missingTestCount = Number(sourceRecord.missingTestCount || 0);
  const registeredTestCount = Number(sourceRecord.registeredTestCount || 0);
  const executableTestCount = Number(sourceRecord.executableTestCount || 0);

  let snapshotStatus = 'HEALTHY';
  let snapshotResult = 'RUNTIME_HEALTH_CONFIRMED';
  let runtimeHealthStatus = 'HEALTHY';
  let overallRuntimeScore = 100;
  let snapshotFinding =
    'Runtime health snapshot confirms the runtime engine is healthy and regression harness is ready.';
  let snapshotRecommendation =
    'Proceed toward runtime health ledger and readiness certification.';

  if (missingTestCount > 0) {
    snapshotStatus = 'ATTENTION_REQUIRED';
    snapshotResult = 'RUNTIME_HEALTH_ATTENTION_REQUIRED';
    runtimeHealthStatus = 'TEST_COVERAGE_GAP';
    overallRuntimeScore = 80;
    snapshotFinding =
      'Runtime health snapshot detected missing registered processor test coverage.';
    snapshotRecommendation =
      'Add missing processor tests before certifying the runtime engine as production ready.';
  }

  const now = new Date();

  const snapshotPayload = {
    snapshotType: 'SCIIP_RUNTIME_HEALTH_SNAPSHOT',
    sourceRegressionTestHarnessBusinessKey: sourceRecord.businessKey || '',
    runtimeHealthStatus,
    overallRuntimeScore,
    harnessStatus: sourceRecord.harnessStatus || '',
    registeredTestCount,
    executableTestCount,
    missingTestCount,
    snapshotStatus,
    snapshotResult,
    snapshotFinding,
    snapshotRecommendation,
    snapshottedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.harnessStatus || '',
    harnessResult: sourceRecord.harnessResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  snapshotSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.harnessStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Health Snapshot',
    snapshotStatus,
    snapshotResult,
    runtimeHealthStatus,
    overallRuntimeScore,
    sourceRecord.harnessStatus || '',
    registeredTestCount,
    executableTestCount,
    missingTestCount,
    snapshotFinding,
    snapshotRecommendation,
    JSON.stringify(snapshotPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeHealthSnapshotsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    snapshotStatus,
    runtimeHealthStatus,
    overallRuntimeScore,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2350_RuntimeHealthSnapshot() {
  const result = sciipRun2350_RuntimeHealthSnapshot();

  Logger.log(JSON.stringify({
    test: 'sciipTest2350_RuntimeHealthSnapshot',
    result
  }));

  return result;
}