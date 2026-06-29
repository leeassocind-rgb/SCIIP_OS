/************************************************************
 * SCIIP_OS v5.1
 * 2130 Processor Registry Snapshot
 ************************************************************/

function sciipRun2130_ProcessorRegistrySnapshot() {
  const processor = '2130_ProcessorRegistrySnapshot';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'indexScope',
      'indexName',
      'indexStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'indexPayloadJson',
      'createdAt'
    ]
  );

  const snapshotSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_SNAPSHOT',
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
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_SNAPSHOT|' + dateKey;

  if (sciipSheetBusinessKeyExists_(snapshotSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistrySnapshotsCreated: 0,
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
      status: 'SKIPPED_NO_REGISTRY_INDEX',
      processorRegistrySnapshotsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const snapshotPayload = {
    snapshotType: 'SCIIP_PROCESSOR_REGISTRY_SNAPSHOT',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    snapshotAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.indexStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  snapshotSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.indexStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Snapshot',
    'SNAPSHOTTED',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(snapshotPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistrySnapshotsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2130_ProcessorRegistrySnapshot() {
  const result = sciipRun2130_ProcessorRegistrySnapshot();

  Logger.log(JSON.stringify({
    test: 'sciipTest2130_ProcessorRegistrySnapshot',
    result
  }));

  return result;
}