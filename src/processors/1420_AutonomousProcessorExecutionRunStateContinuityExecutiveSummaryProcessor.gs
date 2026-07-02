/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessorLegacy1420_();
      return sciipWrapLegacyRuntimeResult1420_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1420_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/**
 * 1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY
 */

const SCIIP_1420_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER';
const SCIIP_1420_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY';
const SCIIP_1420_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY';

function sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessorLegacy1420_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1420ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1420_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1420EnsureSheet_(ss, SCIIP_1420_TARGET_SHEET, sciip1420TargetHeaders_());

  if (sciip1420BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummariesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1420_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummariesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1420HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1420Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1420Get_(row, sourceMap, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1420NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummariesCreated: 0,
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

  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let signalDigestEntriesReviewed = 0;
  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const recommendedActions = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1420Get_(row, sourceMap, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1420Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1420CollectList_(operationalStates, sciip1420Get_(row, sourceMap, ['Operational_States', 'Operational_State']));
    sciip1420CollectList_(executiveStatuses, sciip1420Get_(row, sourceMap, ['Executive_Statuses', 'Executive_Status']));
    sciip1420CollectList_(priorities, sciip1420Get_(row, sourceMap, ['Priorities', 'Priority']));
    sciip1420CollectList_(signalTypes, sciip1420Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1420CollectList_(severities, sciip1420Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1420CollectList_(sourceStatuses, sciip1420Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    const recommendedAction = sciip1420Get_(row, sourceMap, ['Recommended_Actions', 'Recommended_Action']);
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    commandCenterUpdatesReviewed += Number(sciip1420Get_(row, sourceMap, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Source_Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    signalDigestEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Signal_Digest_Entries_Reviewed']) || 0);
    signalLedgerEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1420Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1420Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1420Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const summaryId = `APRSC_EXEC_SUMMARY_${Utilities.getUuid()}`;

  const executiveStatus = sciip1420ResolveExecutiveStatus_(executiveStatuses, failedEntries, sourceStatuses, operationalStates);
  const priority = sciip1420ResolvePriority_(priorities, executiveStatus);
  const operationalState = Object.keys(operationalStates).join(', ') || 'CONTINUITY_UNKNOWN';

  const headline =
    executiveStatus === 'GREEN'
      ? 'Run state continuity remains healthy.'
      : executiveStatus === 'YELLOW'
        ? 'Run state continuity requires review.'
        : 'Run state continuity has limited or no underlying activity.';

  const summaryText =
    `${headline} For ${dateKey}, SCIIP_OS reviewed ${relevantRows.length} command center ledger ` +
    `entr${relevantRows.length === 1 ? 'y' : 'ies'}, ${commandCenterUpdatesReviewed} command center update${commandCenterUpdatesReviewed === 1 ? '' : 's'}, ` +
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
    summaryId,
    businessKey,
    dateKey,
    SCIIP_1420_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    operationalState,
    executiveStatus,
    priority,
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    signalDigestEntriesReviewed,
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    headline,
    summaryText,
    recommendedAction,
    status,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityExecutiveSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
    result
  }));
  return result;
}

function sciip1420TargetHeaders_() {
  return [
    'Executive_Summary_Id',
    'Business_Key',
    'Summary_Date',
    'Source_Sheet',
    'Command_Center_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Operational_State',
    'Executive_Status',
    'Priority',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Signal_Digest_Entries_Reviewed',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Executive_Headline',
    'Executive_Summary',
    'Recommended_Action',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1420ResolveExecutiveStatus_(executiveStatuses, failedEntries, sourceStatuses, operationalStates) {
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

function sciip1420ResolvePriority_(priorities, executiveStatus) {
  if (Object.keys(priorities).indexOf('ELEVATED') !== -1 || executiveStatus === 'YELLOW') {
    return 'ELEVATED';
  }

  if (Object.keys(priorities).indexOf('LOW') !== -1 || executiveStatus === 'BLUE') {
    return 'LOW';
  }

  return 'NORMAL';
}

function sciip1420EnsureSheet_(ss, sheetName, headers) {
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

function sciip1420HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1420Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1420CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1420BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1420_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1420HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1420ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1420_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1420ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1420HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1420Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1420Get_(row, map, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1420NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1420NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1420ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1420ResolveDateKey_(value) {
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

function sciip1420NormalizeDateKey_(value) {
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