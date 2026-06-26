/**
 * 1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER
 */

const SCIIP_1350_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';
const SCIIP_1350_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER';
const SCIIP_1350_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1350ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1350_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1350EnsureSheet_(ss, SCIIP_1350_TARGET_SHEET, sciip1350TargetHeaders_());

  if (sciip1350BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1350_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1350HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1350Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1350Get_(row, sourceMap, [
      'Digest_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1350NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceBusinessKeys = [];
  const sourceDigestIds = [];
  const sourceStatuses = {};
  let totalLedgerEntriesReviewed = 0;
  let totalSuccessfulEntries = 0;
  let totalDuplicateEntries = 0;
  let totalFailedEntries = 0;

  relevantRows.forEach(row => {
    const sourceBusinessKey = sciip1350Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const digestId = sciip1350Get_(row, sourceMap, ['Digest_Id', 'Digest_ID', 'digestId']);
    const status = String(sciip1350Get_(row, sourceMap, ['Status', 'status']) || '').toUpperCase();

    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (digestId) sourceDigestIds.push(String(digestId));
    if (status) sourceStatuses[status] = true;

    totalLedgerEntriesReviewed += Number(sciip1350Get_(row, sourceMap, ['Ledger_Entries_Reviewed']) || 0);
    totalSuccessfulEntries += Number(sciip1350Get_(row, sourceMap, ['Successful_Continuity_Ledger_Entries']) || 0);
    totalDuplicateEntries += Number(sciip1350Get_(row, sourceMap, ['Duplicate_Continuity_Ledger_Entries']) || 0);
    totalFailedEntries += Number(sciip1350Get_(row, sourceMap, ['Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_DIGEST_LEDGER_${Utilities.getUuid()}`;

  const ledgerSummary =
    `Continuity digest ledger entry for ${dateKey}: ` +
    `${relevantRows.length} digest entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `${totalLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${totalSuccessfulEntries} successful; ${totalDuplicateEntries} duplicate/idempotent; ${totalFailedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1350_SOURCE_SHEET,
    relevantRows.length,
    sourceDigestIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(sourceStatuses).join(', '),
    totalLedgerEntriesReviewed,
    totalSuccessfulEntries,
    totalDuplicateEntries,
    totalFailedEntries,
    ledgerSummary,
    totalFailedEntries > 0 ? 'REVIEW_REQUIRED' : 'SUCCESS',
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
    result
  }));
  return result;
}

function sciip1350TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Digest_Entries_Reviewed',
    'Source_Digest_Ids',
    'Source_Business_Keys',
    'Source_Statuses',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1350EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1350HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1350Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1350BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1350_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1350HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1350ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1350NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

function sciip1350ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1350_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1350ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1350HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1350Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const digestDate = sciip1350Get_(row, map, ['Digest_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1350NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1350NormalizeDateKey_(digestDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1350ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}