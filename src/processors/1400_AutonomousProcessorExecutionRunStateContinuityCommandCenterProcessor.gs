/**
 * 1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER
 */

const SCIIP_1400_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER';
const SCIIP_1400_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER';
const SCIIP_1400_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1400ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1400_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1400EnsureSheet_(ss, SCIIP_1400_TARGET_SHEET, sciip1400TargetHeaders_());

  if (sciip1400BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterUpdatesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1400_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterUpdatesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1400HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1400Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1400Get_(row, sourceMap, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1400NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterUpdatesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let signalDigestEntriesReviewed = 0;
  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1400Get_(row, sourceMap, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1400Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1400CollectList_(signalTypes, sciip1400Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1400CollectList_(severities, sciip1400Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1400CollectList_(sourceStatuses, sciip1400Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    signalDigestEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Signal_Digest_Entries_Reviewed']) || 0);
    signalLedgerEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    sourceLedgerEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1400Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1400Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1400Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const commandCenterId = `APRSC_COMMAND_CENTER_${Utilities.getUuid()}`;

  let operationalState = 'CONTINUITY_HEALTHY';
  let executiveStatus = 'GREEN';
  let priority = 'NORMAL';
  let recommendedAction = 'No action required. Continuity chain is healthy and available for downstream processors.';

  if (failedEntries > 0 ||
      Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
      Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1) {
    operationalState = 'CONTINUITY_REVIEW_REQUIRED';
    executiveStatus = 'YELLOW';
    priority = 'ELEVATED';
    recommendedAction = 'Review continuity signal digest ledger before downstream continuity reporting or promotion.';
  } else if (underlyingLedgerEntriesReviewed === 0) {
    operationalState = 'CONTINUITY_NO_UNDERLYING_ACTIVITY';
    executiveStatus = 'BLUE';
    priority = 'LOW';
    recommendedAction = 'No immediate action required. Monitor if no underlying continuity activity persists.';
  }

  const commandCenterSummary =
    `Run state continuity command center update for ${dateKey}: ${operationalState}. ` +
    `${relevantRows.length} signal digest ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    commandCenterId,
    businessKey,
    dateKey,
    SCIIP_1400_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    operationalState,
    executiveStatus,
    priority,
    signalDigestEntriesReviewed,
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    commandCenterSummary,
    recommendedAction,
    operationalState === 'CONTINUITY_REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'SUCCESS',
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityCommandCenterUpdatesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
    result
  }));
  return result;
}

function sciip1400TargetHeaders_() {
  return [
    'Command_Center_Update_Id',
    'Business_Key',
    'Command_Center_Date',
    'Source_Sheet',
    'Source_Signal_Digest_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Operational_State',
    'Executive_Status',
    'Priority',
    'Signal_Digest_Entries_Reviewed',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Command_Center_Summary',
    'Recommended_Action',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1400EnsureSheet_(ss, sheetName, headers) {
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

function sciip1400HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1400Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1400CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1400BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1400_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1400HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1400ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1400_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1400ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1400HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1400Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1400Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1400NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1400NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1400ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1400ResolveDateKey_(value) {
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

function sciip1400NormalizeDateKey_(value) {
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