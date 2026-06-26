/**
 * 1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF
 */

const SCIIP_1440_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER';
const SCIIP_1440_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF';
const SCIIP_1440_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1440ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1440_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

const targetSheet = sciip1440EnsureSheet_(ss, SCIIP_1440_TARGET_SHEET, SCIIP_1440_TARGET_HEADERS_());
  if (sciip1440BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1440_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1440HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1440Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1440Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1440NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let executiveSummariesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const headlines = [];
  const summaries = [];
  const recommendedActions = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1440Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1440Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1440CollectList_(operationalStates, sciip1440Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1440CollectList_(executiveStatuses, sciip1440Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1440CollectList_(priorities, sciip1440Get_(row, map, ['Priorities', 'Priority']));
    sciip1440CollectList_(signalTypes, sciip1440Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1440CollectList_(severities, sciip1440Get_(row, map, ['Severities', 'Severity']));
    sciip1440CollectList_(sourceStatuses, sciip1440Get_(row, map, ['Source_Statuses', 'Status']));

    const headline = sciip1440Get_(row, map, ['Executive_Headlines', 'Executive_Headline']);
    const summary = sciip1440Get_(row, map, ['Executive_Summaries', 'Executive_Summary']);
    const recommendedAction = sciip1440Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);

    if (headline) headlines.push(String(headline));
    if (summary) summaries.push(String(summary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    executiveSummariesReviewed += Number(sciip1440Get_(row, map, ['Executive_Summaries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1440Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1440Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1440Get_(row, map, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1440Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1440Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1440Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1440Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const executiveStatus = sciip1440ResolveExecutiveStatus_(executiveStatuses, failedEntries, sourceStatuses, operationalStates);
  const priority = sciip1440ResolvePriority_(priorities, executiveStatus);
  const operationalState = Object.keys(operationalStates).join(', ') || 'CONTINUITY_UNKNOWN';

  const briefId = `APRSC_DAILY_BRIEF_${Utilities.getUuid()}`;

  const title = `Run State Continuity Daily Brief — ${dateKey}`;

  const headline =
    headlines.length
      ? headlines[0]
      : executiveStatus === 'GREEN'
        ? 'Run state continuity remains healthy.'
        : executiveStatus === 'YELLOW'
          ? 'Run state continuity requires review.'
          : 'Run state continuity has limited or no underlying activity.';

  const dailyBrief =
    `${headline} ` +
    `Operational State: ${operationalState}. ` +
    `Executive Status: ${executiveStatus}. Priority: ${priority}. ` +
    `Reviewed ${relevantRows.length} executive summary ledger entr${relevantRows.length === 1 ? 'y' : 'ies'}, ` +
    `${executiveSummariesReviewed} executive summar${executiveSummariesReviewed === 1 ? 'y' : 'ies'}, ` +
    `${commandCenterUpdatesReviewed} command center update${commandCenterUpdatesReviewed === 1 ? '' : 's'}, ` +
    `and ${underlyingLedgerEntriesReviewed} underlying continuity ledger entr${underlyingLedgerEntriesReviewed === 1 ? 'y' : 'ies'}. ` +
    `Results: ${successfulEntries} successful, ${duplicateEntries} duplicate/idempotent, ${failedEntries} failed.`;

  const recommendedAction =
    recommendedActions.length
      ? recommendedActions.join(' | ')
      : executiveStatus === 'GREEN'
        ? 'No action required. Continue autonomous continuity chain.'
        : 'Review continuity chain before downstream reporting or promotion.';

  const status = executiveStatus === 'YELLOW' ? 'REVIEW_REQUIRED' : 'SUCCESS';

  targetSheet.appendRow([
    briefId,
    businessKey,
    dateKey,
    SCIIP_1440_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    title,
    headline,
    dailyBrief,
    operationalState,
    executiveStatus,
    priority,
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    executiveSummariesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    recommendedAction,
    status,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
    result
  }));
  return result;
}

function SCIIP_1440_TARGET_HEADERS_() {
  return [
    'Daily_Brief_Id',
    'Business_Key',
    'Brief_Date',
    'Source_Sheet',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Brief_Title',
    'Brief_Headline',
    'Daily_Brief',
    'Operational_State',
    'Executive_Status',
    'Priority',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Executive_Summaries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Recommended_Action',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1440ResolveExecutiveStatus_(executiveStatuses, failedEntries, sourceStatuses, operationalStates) {
  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1
  ) {
    return 'YELLOW';
  }

  if (
    Object.keys(operationalStates).indexOf('CONTINUITY_NO_UNDERLYING_ACTIVITY') !== -1 ||
    Object.keys(executiveStatuses).indexOf('BLUE') !== -1
  ) {
    return 'BLUE';
  }

  return 'GREEN';
}

function sciip1440ResolvePriority_(priorities, executiveStatus) {
  if (Object.keys(priorities).indexOf('ELEVATED') !== -1 || executiveStatus === 'YELLOW') {
    return 'ELEVATED';
  }

  if (Object.keys(priorities).indexOf('LOW') !== -1 || executiveStatus === 'BLUE') {
    return 'LOW';
  }

  return 'NORMAL';
}

function sciip1440EnsureSheet_(ss, sheetName, headers) {
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

function sciip1440HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1440Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1440CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1440BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1440_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1440HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1440ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1440_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1440ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1440HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1440Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1440Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1440NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1440NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1440ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1440ResolveDateKey_(value) {
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

function sciip1440NormalizeDateKey_(value) {
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