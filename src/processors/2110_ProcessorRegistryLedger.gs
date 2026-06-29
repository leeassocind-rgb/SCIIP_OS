/************************************************************
 * SCIIP_OS v5.1
 * 2110 Processor Registry Ledger
 ************************************************************/

function sciipRun2110_ProcessorRegistryLedger() {
  const processor = '2110_ProcessorRegistryLedger';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_LEDGER|' + dateKey;

  if (sciipSheetBusinessKeyExists_(sheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const registeredProcessors = sciipListRegisteredProcessors_();

  if (!registeredProcessors || registeredProcessors.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_REGISTERED_PROCESSORS',
      processorRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  registeredProcessors.forEach(function(item) {
    const payload = {
      registryKey: item.registryKey,
      processorNumber: item.processorNumber,
      processorFunction: item.processorFunction,
      testFunction: item.testFunction,
      inputSheet: item.inputSheet,
      outputSheet: item.outputSheet,
      status: item.status,
      track: item.track,
      version: item.version,
      ledgeredAt: now.toISOString()
    };

    sheet.appendRow([
      businessKey,
      dateKey,
      processor,
      item.registryKey,
      item.processorNumber,
      item.processorFunction,
      item.testFunction,
      item.inputSheet,
      item.outputSheet,
      item.status,
      item.track,
      item.version,
      JSON.stringify(payload),
      now.toISOString()
    ]);
  });

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryLedgerEntriesCreated: registeredProcessors.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2110_ProcessorRegistryLedger() {
  const result = sciipRun2110_ProcessorRegistryLedger();

  Logger.log(JSON.stringify({
    test: 'sciipTest2110_ProcessorRegistryLedger',
    result
  }));

  return result;
}