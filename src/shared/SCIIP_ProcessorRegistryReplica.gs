/************************************************************
 * SCIIP_OS v5.1
 * 2150 Processor Registry Replica
 ************************************************************/

function sciipRun2150_ProcessorRegistryReplica() {
  const processor = '2150_ProcessorRegistryReplica';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const replicaSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'replicaScope',
      'replicaName',
      'replicaStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_REPLICA|' + dateKey;

  if (sciipSheetBusinessKeyExists_(replicaSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryReplicasCreated: 0,
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
      status: 'SKIPPED_NO_REGISTRY_MIRROR',
      processorRegistryReplicasCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const replicaPayload = {
    replicaType: 'SCIIP_PROCESSOR_REGISTRY_REPLICA',
    replicatedFromBusinessKey: sourceRecord.businessKey || '',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    replicatedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.mirrorStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  replicaSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.mirrorStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Replica',
    'REPLICATED',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(replicaPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryReplicasCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2150_ProcessorRegistryReplica() {
  const result = sciipRun2150_ProcessorRegistryReplica();

  Logger.log(JSON.stringify({
    test: 'sciipTest2150_ProcessorRegistryReplica',
    result
  }));

  return result;
}