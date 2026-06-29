/************************************************************
 * SCIIP_OS v5.1
 * 2170 Processor Registry Checkpoint Ledger
 ************************************************************/

function sciipRun2170_ProcessorRegistryCheckpointLedger() {
  const processor = '2170_ProcessorRegistryCheckpointLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointScope',
      'checkpointName',
      'checkpointStatus',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointLedgerScope',
      'checkpointLedgerName',
      'checkpointLedgerStatus',
      'ledgeredCheckpointBusinessKey',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'latestRegistryLedgerBusinessKey',
      'checkpointLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryCheckpointLedgerEntriesCreated: 0,
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
      status: 'SKIPPED_NO_REGISTRY_CHECKPOINT',
      processorRegistryCheckpointLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SCIIP_PROCESSOR_REGISTRY_CHECKPOINT_LEDGER',
    ledgeredCheckpointBusinessKey: sourceRecord.businessKey || '',
    registeredProcessorCount: sourceRecord.registeredProcessorCount || 0,
    validatedProcessorCount: sourceRecord.validatedProcessorCount || 0,
    trackCount: sourceRecord.trackCount || 0,
    latestRegistryLedgerBusinessKey:
      sourceRecord.latestRegistryLedgerBusinessKey || '',
    ledgeredAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.checkpointStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.checkpointStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Checkpoint Ledger',
    'LEDGERED',
    sourceRecord.businessKey || '',
    sourceRecord.registeredProcessorCount || 0,
    sourceRecord.validatedProcessorCount || 0,
    sourceRecord.trackCount || 0,
    sourceRecord.latestRegistryLedgerBusinessKey || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryCheckpointLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2170_ProcessorRegistryCheckpointLedger() {
  const result = sciipRun2170_ProcessorRegistryCheckpointLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2170_ProcessorRegistryCheckpointLedger',
    result
  }));

  return result;
}