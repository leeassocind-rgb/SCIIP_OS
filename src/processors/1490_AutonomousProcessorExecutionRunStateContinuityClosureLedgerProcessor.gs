/**
 * 1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER
 */

const SCIIP_1490_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE';
const SCIIP_1490_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER';
const SCIIP_1490_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1490ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1490_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1490EnsureSheet_(ss, SCIIP_1490_TARGET_SHEET, sciip1490TargetHeaders_());

  if (sciip1490BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityClosureLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1490_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityClosureLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1490HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1490Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1490Get_(row, map, [
      'Closure_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1490NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityClosureLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceClosureIds = [];
  const sourceBusinessKeys = [];
  const closureStates = {};
  const closureDecisions = {};
  const closureSeverities = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];
  const closureSummaries = [];
  const nextSteps = [];

  relevantRows.forEach(row => {
    const closureId = sciip1490Get_(row, map, ['Closure_Id', 'Closure_ID']);
    const sourceBusinessKey = sciip1490Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (closureId) sourceClosureIds.push(String(closureId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1490CollectList_(closureStates, sciip1490Get_(row, map, ['Closure_State']));
    sciip1490CollectList_(closureDecisions, sciip1490Get_(row, map, ['Closure_Decision']));
    sciip1490CollectList_(closureSeverities, sciip1490Get_(row, map, ['Closure_Severity']));
    sciip1490CollectList_(finalizationStates, sciip1490Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1490CollectList_(finalizationDecisions, sciip1490Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1490CollectList_(operationalStates, sciip1490Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1490CollectList_(executiveStatuses, sciip1490Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1490CollectList_(priorities, sciip1490Get_(row, map, ['Priorities', 'Priority']));
    sciip1490CollectList_(signalTypes, sciip1490Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1490CollectList_(severities, sciip1490Get_(row, map, ['Severities', 'Severity']));
    sciip1490CollectList_(sourceStatuses, sciip1490Get_(row, map, ['Source_Statuses', 'Status']));

    const finalizationSummary = sciip1490Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1490Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1490Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const closureSummary = sciip1490Get_(row, map, ['Closure_Summary']);
    const nextStep = sciip1490Get_(row, map, ['Next_Step']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (nextStep) nextSteps.push(String(nextStep));

    finalizationLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1490Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1490Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1490Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1490Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1490Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1490Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_CLOSURE_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(closureStates).indexOf('CONTINUITY_CLOSED_WITH_REVIEW_FLAG') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity closure ledger entry for ${dateKey}: ` +
    `${relevantRows.length} closure entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `closure state: ${Object.keys(closureStates).join(', ') || 'NONE'}; ` +
    `closure decision: ${Object.keys(closureDecisions).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1490_SOURCE_SHEET,
    relevantRows.length,
    sourceClosureIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(closureSeverities).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    closureSummaries.join(' | '),
    nextSteps.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityClosureLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
    result
  }));
  return result;
}

function sciip1490TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Closures_Reviewed',
    'Source_Closure_Ids',
    'Source_Business_Keys',
    'Closure_States',
    'Closure_Decisions',
    'Closure_Severities',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Closure_Summaries',
    'Next_Steps',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1490EnsureSheet_(ss, sheetName, headers) {
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

function sciip1490HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1490Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1490CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1490BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1490_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1490HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1490ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1490_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1490ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1490HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1490Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const closureDate = sciip1490Get_(row, map, [
      'Closure_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1490NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1490NormalizeDateKey_(closureDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1490ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1490ResolveDateKey_(value) {
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

function sciip1490NormalizeDateKey_(value) {
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