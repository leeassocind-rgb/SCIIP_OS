/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_RUNTIME_LEDGER',

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
          originalProcessor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationProcessorLegacy1460_();
      return sciipWrapLegacyRuntimeResult1460_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1460_(legacyResult, context, transaction) {
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
 * 1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION
 */

const SCIIP_1460_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER';
const SCIIP_1460_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION';
const SCIIP_1460_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION';

function sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationProcessorLegacy1460_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1460ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1460_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1460EnsureSheet_(ss, SCIIP_1460_TARGET_SHEET, sciip1460TargetHeaders_());

  if (sciip1460BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityFinalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1460_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityFinalizationsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1460HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1460Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1460Get_(row, map, [
      'Ledger_Date',
      'Brief_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1460NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityFinalizationsCreated: 0,
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

  let dailyBriefsReviewed = 0;
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
    const ledgerEntryId = sciip1460Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1460Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1460CollectList_(operationalStates, sciip1460Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1460CollectList_(executiveStatuses, sciip1460Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1460CollectList_(priorities, sciip1460Get_(row, map, ['Priorities', 'Priority']));
    sciip1460CollectList_(signalTypes, sciip1460Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1460CollectList_(severities, sciip1460Get_(row, map, ['Severities', 'Severity']));
    sciip1460CollectList_(sourceStatuses, sciip1460Get_(row, map, ['Source_Statuses', 'Status']));

    const briefTitle = sciip1460Get_(row, map, ['Brief_Titles', 'Brief_Title']);
    const briefHeadline = sciip1460Get_(row, map, ['Brief_Headlines', 'Brief_Headline']);
    const dailyBrief = sciip1460Get_(row, map, ['Daily_Briefs', 'Daily_Brief']);
    const recommendedAction = sciip1460Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);

    if (briefTitle) briefTitles.push(String(briefTitle));
    if (briefHeadline) briefHeadlines.push(String(briefHeadline));
    if (dailyBrief) dailyBriefs.push(String(dailyBrief));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    dailyBriefsReviewed += Number(sciip1460Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1460Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    executiveSummariesReviewed += Number(sciip1460Get_(row, map, ['Executive_Summaries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1460Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1460Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1460Get_(row, map, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1460Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1460Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1460Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1460Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const finalizationId = `APRSC_FINALIZATION_${Utilities.getUuid()}`;

  let finalizationState = 'CONTINUITY_FINALIZED';
  let finalizationDecision = 'APPROVED_FOR_CLOSURE';
  let finalizationStatus = 'SUCCESS';
  let recommendedNextStep = 'Proceed to continuity finalization ledger and closure processors.';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
  ) {
    finalizationState = 'CONTINUITY_FINALIZED_WITH_REVIEW';
    finalizationDecision = 'APPROVED_WITH_REVIEW_FLAG';
    finalizationStatus = 'REVIEW_REQUIRED';
    recommendedNextStep = 'Proceed with ledgering, but review continuity chain before downstream promotion.';
  } else if (
    underlyingLedgerEntriesReviewed === 0 ||
    Object.keys(executiveStatuses).indexOf('BLUE') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_NO_UNDERLYING_ACTIVITY') !== -1
  ) {
    finalizationState = 'CONTINUITY_FINALIZED_NO_ACTIVITY';
    finalizationDecision = 'APPROVED_NO_ACTIVITY';
    finalizationStatus = 'SUCCESS';
    recommendedNextStep = 'Proceed with ledgering. Monitor if no underlying continuity activity persists.';
  }

  const finalizationSummary =
    `Continuity finalization for ${dateKey}: ${finalizationState}. ` +
    `${relevantRows.length} daily brief ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${dailyBriefsReviewed} daily brief${dailyBriefsReviewed === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    finalizationId,
    businessKey,
    dateKey,
    SCIIP_1460_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    executiveSummariesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    finalizationState,
    finalizationDecision,
    finalizationSummary,
    recommendedActions.join(' | '),
    recommendedNextStep,
    finalizationStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityFinalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityFinalizationProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
    result
  }));
  return result;
}

function sciip1460TargetHeaders_() {
  return [
    'Finalization_Id',
    'Business_Key',
    'Finalization_Date',
    'Source_Sheet',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Executive_Summaries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Finalization_State',
    'Finalization_Decision',
    'Finalization_Summary',
    'Recommended_Actions',
    'Recommended_Next_Step',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1460EnsureSheet_(ss, sheetName, headers) {
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

function sciip1460HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1460Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1460CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1460BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1460_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1460HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1460ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1460_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1460ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1460HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1460Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1460Get_(row, map, [
      'Ledger_Date',
      'Brief_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1460NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1460NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1460ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1460ResolveDateKey_(value) {
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

function sciip1460NormalizeDateKey_(value) {
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