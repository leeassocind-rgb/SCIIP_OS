/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessorLegacy1410_();
      return sciipWrapLegacyRuntimeResult1410_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1410_(legacyResult, context, transaction) {
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
 * 1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER
 */

const SCIIP_1410_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER';
const SCIIP_1410_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER';
const SCIIP_1410_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessorLegacy1410_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1410ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1410_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1410EnsureSheet_(ss, SCIIP_1410_TARGET_SHEET, sciip1410TargetHeaders_());

  if (sciip1410BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1410_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1410HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1410Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1410Get_(row, sourceMap, [
      'Command_Center_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1410NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceCommandCenterIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const sourceStatuses = {};
  const signalTypes = {};
  const severities = {};

  let sourceSignalDigestLedgerEntriesReviewed = 0;
  let signalDigestEntriesReviewed = 0;
  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const recommendedActions = [];

  relevantRows.forEach(row => {
    const commandCenterId = sciip1410Get_(row, sourceMap, [
      'Command_Center_Update_Id',
      'Command_Center_Id',
      'CommandCenter_Id'
    ]);

    const sourceBusinessKey = sciip1410Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (commandCenterId) sourceCommandCenterIds.push(String(commandCenterId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1410CollectList_(signalTypes, sciip1410Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1410CollectList_(severities, sciip1410Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1410CollectList_(sourceStatuses, sciip1410Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    sciip1410CollectList_(operationalStates, sciip1410Get_(row, sourceMap, ['Operational_State']));
    sciip1410CollectList_(executiveStatuses, sciip1410Get_(row, sourceMap, ['Executive_Status']));
    sciip1410CollectList_(priorities, sciip1410Get_(row, sourceMap, ['Priority']));

    const recommendedAction = sciip1410Get_(row, sourceMap, ['Recommended_Action']);
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    sourceSignalDigestLedgerEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Source_Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    signalDigestEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Signal_Digest_Entries_Reviewed']) || 0);
    signalLedgerEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    sourceLedgerEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1410Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1410Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1410Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_COMMAND_CENTER_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity command center ledger entry for ${dateKey}: ` +
    `${relevantRows.length} command center update${relevantRows.length === 1 ? '' : 's'} recorded; ` +
    `operational state: ${Object.keys(operationalStates).join(', ') || 'NONE'}; ` +
    `executive status: ${Object.keys(executiveStatuses).join(', ') || 'NONE'}; ` +
    `priority: ${Object.keys(priorities).join(', ') || 'NONE'}; ` +
    `${failedEntries} failed underlying continuity entries.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1410_SOURCE_SHEET,
    relevantRows.length,
    sourceCommandCenterIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    sourceSignalDigestLedgerEntriesReviewed,
    signalDigestEntriesReviewed,
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    ledgerSummary,
    recommendedActions.join(' | '),
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityCommandCenterLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
    result
  }));
  return result;
}

function sciip1410TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Command_Center_Updates_Reviewed',
    'Source_Command_Center_Update_Ids',
    'Source_Business_Keys',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Source_Signal_Digest_Ledger_Entries_Reviewed',
    'Signal_Digest_Entries_Reviewed',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Ledger_Summary',
    'Recommended_Actions',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1410EnsureSheet_(ss, sheetName, headers) {
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

function sciip1410HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1410Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1410CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1410BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1410_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1410HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1410ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1410_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1410ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1410HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1410Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const commandCenterDate = sciip1410Get_(row, map, [
      'Command_Center_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1410NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1410NormalizeDateKey_(commandCenterDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1410ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1410ResolveDateKey_(value) {
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

function sciip1410NormalizeDateKey_(value) {
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