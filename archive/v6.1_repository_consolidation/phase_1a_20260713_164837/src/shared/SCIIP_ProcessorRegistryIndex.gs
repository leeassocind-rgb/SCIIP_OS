/************************************************************
 * SCIIP_OS v5.1
 * 2120 Processor Registry Index
 ************************************************************/

function sciipRun2120_ProcessorRegistryIndex() {
  const processor = '2120_ProcessorRegistryIndex';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'registryKey',
      'processorNumber',
      'processorFunction',
      'testFunction',
      'inputSheet',
      'outputSheet',
      'status',
      'track',
      'version',
      'registryPayloadJson',
      'createdAt'
    ]
  );

  const indexSheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_INDEX|' + dateKey;

  if (sciipSheetBusinessKeyExists_(indexSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows = sciipGetSheetRecords_(sourceSheet);

  if (!ledgerRows || ledgerRows.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTRY_LEDGER',
      processorRegistryIndexesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestBusinessKey = ledgerRows[ledgerRows.length - 1].businessKey || '';
  const registeredProcessorCount = ledgerRows.length;
  const validatedProcessorCount = ledgerRows.filter(function(row) {
    return String(row.status || '').toUpperCase() === 'VALIDATED';
  }).length;

  const trackMap = {};
  ledgerRows.forEach(function(row) {
    const track = row.track || 'UNKNOWN';
    trackMap[track] = true;
  });

  const trackCount = Object.keys(trackMap).length;
  const now = new Date();

  const payload = {
    indexType: 'SCIIP_PROCESSOR_REGISTRY_INDEX',
    registeredProcessorCount,
    validatedProcessorCount,
    trackCount,
    latestRegistryLedgerBusinessKey: latestBusinessKey,
    indexedAt: now.toISOString()
  };

  indexSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Index',
    'INDEXED',
    registeredProcessorCount,
    validatedProcessorCount,
    trackCount,
    latestBusinessKey,
    JSON.stringify(payload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2120_ProcessorRegistryIndex() {
  const result = sciipRun2120_ProcessorRegistryIndex();

  Logger.log(JSON.stringify({
    test: 'sciipTest2120_ProcessorRegistryIndex',
    result
  }));

  return result;
}