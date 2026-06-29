/************************************************************
 * SCIIP_OS v5.1
 * 2180 Processor Registry Validation
 ************************************************************/

function sciipRun2180_ProcessorRegistryValidation() {
  const processor = '2180_ProcessorRegistryValidation';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
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

  const validationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'SCIIP_PROCESSOR_REGISTRY_VALIDATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'validationScope',
      'validationName',
      'validationStatus',
      'validationResult',
      'registeredProcessorCount',
      'validatedProcessorCount',
      'trackCount',
      'validationFinding',
      'validationRecommendation',
      'validationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey = 'SCIIP_PROCESSOR_REGISTRY_VALIDATION|' + dateKey;

  if (sciipSheetBusinessKeyExists_(validationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      processorRegistryValidationsCreated: 0,
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
      status: 'SKIPPED_NO_REGISTRY_CHECKPOINT_LEDGER',
      processorRegistryValidationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const registeredProcessorCount =
    Number(sourceRecord.registeredProcessorCount || 0);

  const validatedProcessorCount =
    Number(sourceRecord.validatedProcessorCount || 0);

  const trackCount =
    Number(sourceRecord.trackCount || 0);

  const validationResult =
    registeredProcessorCount > 0 &&
    validatedProcessorCount === registeredProcessorCount
      ? 'VALIDATED'
      : 'VALIDATION_ATTENTION_REQUIRED';

  const validationFinding =
    validationResult === 'VALIDATED'
      ? 'Processor registry checkpoint ledger confirms all registered processors are validated.'
      : 'Processor registry checkpoint ledger indicates one or more registered processors are not validated.';

  const validationRecommendation =
    validationResult === 'VALIDATED'
      ? 'Continue using the registry as the authoritative processor inventory for SCIIP_OS framework orchestration.'
      : 'Review processor registry records and update validation status before enabling automated orchestration.';

  const now = new Date();

  const validationPayload = {
    validationType: 'SCIIP_PROCESSOR_REGISTRY_VALIDATION',
    registeredProcessorCount: registeredProcessorCount,
    validatedProcessorCount: validatedProcessorCount,
    trackCount: trackCount,
    validationResult: validationResult,
    validationFinding: validationFinding,
    validationRecommendation: validationRecommendation,
    sourceCheckpointLedgerBusinessKey: sourceRecord.businessKey || '',
    validatedAt: now.toISOString()
  };

  const sourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.checkpointLedgerStatus || '',
    createdAt: sourceRecord.createdAt || ''
  };

  validationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.checkpointLedgerStatus || '',
    'SCIIP_PROCESSOR_REGISTRY',
    'SCIIP Processor Registry Validation',
    validationResult,
    validationResult,
    registeredProcessorCount,
    validatedProcessorCount,
    trackCount,
    validationFinding,
    validationRecommendation,
    JSON.stringify(validationPayload),
    JSON.stringify(sourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    processorRegistryValidationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    validationResult,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTest2180_ProcessorRegistryValidation() {
  const result = sciipRun2180_ProcessorRegistryValidation();

  Logger.log(JSON.stringify({
    test: 'sciipTest2180_ProcessorRegistryValidation',
    result
  }));

  return result;
}