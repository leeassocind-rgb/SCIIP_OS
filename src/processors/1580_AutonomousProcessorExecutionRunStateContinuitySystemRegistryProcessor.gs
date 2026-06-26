/************************************************************
 * SCIIP_OS v4.1
 * 1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor
 ************************************************************/

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor() {
  const processor =
    '1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor';

  const ss = sciipGetSpreadsheet_();

  let processingDate = sciipResolveLatestProcessingDate_();
  let dateKey = '';

  if (processingDate instanceof Date && !isNaN(processingDate.getTime())) {
    dateKey = sciipFormatDateKey_(processingDate);
  } else if (processingDate) {
    const parsedDate = new Date(processingDate);
    if (!isNaN(parsedDate.getTime())) {
      dateKey = sciipFormatDateKey_(parsedDate);
    }
  }

  if (!dateKey || dateKey === '1969-12-31' || dateKey === '1970-01-01') {
    dateKey = '2026-06-25';
  }

  const sourceSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerSheet_(ss);

  const registrySheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemRegistrySheet_(ss);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY|' +
    dateKey;

  if (
    sciipAutonomousProcessorExecutionRunStateContinuitySystemRegistryBusinessKeyExists_(
      registrySheet,
      businessKey
    )
  ) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceValues = sourceSheet.getDataRange().getValues();

  if (sourceValues.length < 2) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceHeaders = sourceValues[0];
  const latestSourceRow = sourceValues[sourceValues.length - 1];

  const sourceRecord = {};
  sourceHeaders.forEach(function(header, index) {
    sourceRecord[header] = latestSourceRow[index];
  });

  const now = new Date();

  registrySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Registry',
    'ACTIVE',
    'System index ledger registered as authoritative continuity system state.',
    sourceRecord.systemIndexDateKey || dateKey,
    sourceRecord.systemIndexScope || '',
    sourceRecord.systemIndexName || '',
    sourceRecord.systemIndexStatus || '',
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemRegistryEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemRegistrySheet_(ss) {
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemRegistryScope',
      'systemRegistryName',
      'systemRegistryStatus',
      'systemRegistrySummary',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'sourcePayloadJson',
      'createdAt'
    ]);
  }

  return sheet;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerSheet_(ss) {
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexSummary',
      'systemIndexEntryCount',
      'systemIndexStatus',
      'sourcePayloadJson',
      'createdAt'
    ]);
  }

  return sheet;
}

function sciipAutonomousProcessorExecutionRunStateContinuitySystemRegistryBusinessKeyExists_(
  sheet,
  businessKey
) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return false;
  }

  const headers = values[0];
  const businessKeyIndex = headers.indexOf('businessKey');

  if (businessKeyIndex === -1) {
    return false;
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][businessKeyIndex]) === String(businessKey)) {
      return true;
    }
  }

  return false;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor',
      result
    })
  );

  return result;
}