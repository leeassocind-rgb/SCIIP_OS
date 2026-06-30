/************************************************************
 * SCIIP_OS v5.1 Runtime Engine
 * 2360 Runtime Health Ledger
 ************************************************************/

function sciipRun2360_RuntimeHealthLedger() {
  const processor = '2360_RuntimeHealthLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_RUNTIME_HEALTH_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'healthLedgerScope',
      'healthLedgerName',
      'healthLedgerStatus',
      'ledgeredHealthSnapshotBusinessKey',
      'runtimeHealthStatus',
      'overallRuntimeScore',
      'snapshotStatus',
      'snapshotResult',
      'healthFinding',
      'healthRecommendation',
      'healthLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_RUNTIME_HEALTH_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      runtimeHealthLedgerEntriesCreated: 0,
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
      status: 'SKIPPED_NO_RUNTIME_HEALTH_SNAPSHOT',
      runtimeHealthLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const healthLedgerPayload = {
    ledgerType: 'SCIIP_RUNTIME_HEALTH_LEDGER',
    ledgeredHealthSnapshotBusinessKey: sourceRecord.businessKey || '',
    runtimeHealthStatus: sourceRecord.runtimeHealthStatus || '',
    overallRuntimeScore: Number(sourceRecord.overallRuntimeScore || 0),
    snapshotStatus: sourceRecord.snapshotStatus || '',
    snapshotResult: sourceRecord.snapshotResult || '',
    healthFinding: sourceRecord.snapshotFinding || '',
    healthRecommendation: sourceRecord.snapshotRecommendation || '',
    ledgeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.snapshotStatus || '',
    snapshotResult: sourceRecord.snapshotResult || '',
    createdAt: sourceRecord.createdAt || ''
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.snapshotStatus || '',
    'SCIIP_RUNTIME_ENGINE',
    'SCIIP Runtime Health Ledger',
    'LEDGERED',
    sourceRecord.businessKey || '',
    sourceRecord.runtimeHealthStatus || '',
    sourceRecord.overallRuntimeScore || 0,
    sourceRecord.snapshotStatus || '',
    sourceRecord.snapshotResult || '',
    sourceRecord.snapshotFinding || '',
    sourceRecord.snapshotRecommendation || '',
    JSON.stringify(healthLedgerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    runtimeHealthLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2360_RuntimeHealthLedger() {
  const result = sciipRun2360_RuntimeHealthLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2360_RuntimeHealthLedger',
    result
  }));

  return result;
}