/************************************************************
 * SCIIP_OS v5.1
 * 2140 Processor Registry Mirror
 ************************************************************/

function sciipRun2140_ProcessorRegistryMirror() {
  const processor = '2140_ProcessorRegistryMirror';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const mirrorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'mirrorScope',
      'mirrorName',
      'mirrorStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_MIRROR|' + dateKey;

  if (sciipSheetBusinessKeyExists_(mirrorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryMirrorsCreated: 0,
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
      status: 'SKIPPED_NO_REGISTRY_SNAPSHOT',
      processorRegistryMirrorsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const mirrorPayload = {
    mirrorType: 'SCIIP_PROCESSOR_REGISTRY_MIRROR',
    mirroredFromBusinessKey: sourceRecord.businessKey || '',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    mirroredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.snapshotStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  mirrorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.snapshotStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Mirror',
    'MIRRORED',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(mirrorPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryMirrorsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2140_ProcessorRegistryMirror() {
  const result = sciipRun2140_ProcessorRegistryMirror();

  Logger.log(JSON.stringify({
    test: 'sciipTest2140_ProcessorRegistryMirror',
    result
  }));

  return result;
}