/**
 * 1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER
 */

const SCIIP_1450_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF';
const SCIIP_1450_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER';
const SCIIP_1450_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1450ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1450_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1450EnsureSheet_(ss, SCIIP_1450_TARGET_SHEET, sciip1450TargetHeaders_());

  if (sciip1450BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1450_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1450HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1450Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1450Get_(row, map, [
      'Brief_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1450NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceBriefIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let executiveSummaryLedgerEntriesReviewed = 0;
  let executiveSummariesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const briefTitles = [];
  const briefHeadlines = [];
  const dailyBriefs = [];
  const recommendedActions = [];

  relevantRows.forEach(row => {
    const briefId = sciip1450Get_(row, map, ['Daily_Brief_Id', 'Brief_Id', 'DailyBrief_Id']);
    const sourceBusinessKey = sciip1450Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (briefId) sourceBriefIds.push(String(briefId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1450CollectList_(operationalStates, sciip1450Get_(row, map, ['Operational_State', 'Operational_States']));
    sciip1450CollectList_(executiveStatuses, sciip1450Get_(row, map, ['Executive_Status', 'Executive_Statuses']));
    sciip1450CollectList_(priorities, sciip1450Get_(row, map, ['Priority', 'Priorities']));
    sciip1450CollectList_(signalTypes, sciip1450Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1450CollectList_(severities, sciip1450Get_(row, map, ['Severities', 'Severity']));
    sciip1450CollectList_(sourceStatuses, sciip1450Get_(row, map, ['Source_Statuses', 'Status']));

    const briefTitle = sciip1450Get_(row, map, ['Brief_Title']);
    const briefHeadline = sciip1450Get_(row, map, ['Brief_Headline']);
    const dailyBrief = sciip1450Get_(row, map, ['Daily_Brief']);
    const recommendedAction = sciip1450Get_(row, map, ['Recommended_Action']);

    if (briefTitle) briefTitles.push(String(briefTitle));
    if (briefHeadline) briefHeadlines.push(String(briefHeadline));
    if (dailyBrief) dailyBriefs.push(String(dailyBrief));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    executiveSummaryLedgerEntriesReviewed += Number(sciip1450Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    executiveSummariesReviewed += Number(sciip1450Get_(row, map, ['Executive_Summaries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1450Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1450Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1450Get_(row, map, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1450Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1450Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1450Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1450Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_DAILY_BRIEF_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity daily brief ledger entry for ${dateKey}: ` +
    `${relevantRows.length} daily brief${relevantRows.length === 1 ? '' : 's'} recorded; ` +
    `executive status: ${Object.keys(executiveStatuses).join(', ') || 'NONE'}; ` +
    `priority: ${Object.keys(priorities).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1450_SOURCE_SHEET,
    relevantRows.length,
    sourceBriefIds.join(', '),
    sourceBusinessKeys.join(', '),
    briefTitles.join(' | '),
    briefHeadlines.join(' | '),
    dailyBriefs.join(' | '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    executiveSummaryLedgerEntriesReviewed,
    executiveSummariesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    recommendedActions.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDailyBriefLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
    result
  }));
  return result;
}

function sciip1450TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Daily_Briefs_Reviewed',
    'Source_Daily_Brief_Ids',
    'Source_Business_Keys',
    'Brief_Titles',
    'Brief_Headlines',
    'Daily_Briefs',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Executive_Summaries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Recommended_Actions',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1450EnsureSheet_(ss, sheetName, headers) {
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

function sciip1450HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1450Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1450CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1450BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1450_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1450HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1450ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1450_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1450ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1450HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1450Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const briefDate = sciip1450Get_(row, map, [
      'Brief_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1450NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1450NormalizeDateKey_(briefDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1450ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1450ResolveDateKey_(value) {
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

function sciip1450NormalizeDateKey_(value) {
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