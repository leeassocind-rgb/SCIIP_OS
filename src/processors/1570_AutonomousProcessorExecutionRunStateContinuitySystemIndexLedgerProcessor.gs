/************************************************************
 * SCIIP_OS v4.1
 * 1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER
 ************************************************************/

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor() {
  const processor =
    '1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const processingDate = sciipResolveLatestProcessingDate_();
  const dateKey = sciipFormatDateKey_(processingDate);

  const sourceSheet = sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexSheet_(
    ss
  );

  const ledgerSheet = sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerSheet_(
    ss
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER|' +
    dateKey;

  if (
    sciipBusinessKeyPrefixExists_(
      ledgerSheet,
      businessKey
    )
  ) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexLedgerEntriesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuitySystemIndexLedgerEntriesCreated: 0,
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

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemIndexDateKey || dateKey,
    sourceRecord.systemIndexScope || 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceRecord.systemIndexName || 'Continuity System Index',
    sourceRecord.systemIndexSummary || '',
    sourceRecord.systemIndexEntryCount || '',
    sourceRecord.systemIndexStatus || '',
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemIndexLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
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

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexSheet_(ss) {
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'businessKey',
      'dateKey',
      'processor',
      'status',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexSummary',
      'systemIndexEntryCount',
      'systemIndexStatus',
      'createdAt'
    ]);
  }

  return sheet;
}