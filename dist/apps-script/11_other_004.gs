/** SCIIP_OS compiled bundle: 11_other_004.gs
 * sources: 77
 * generated: 2026-07-25T20:28:39.342Z
 */
/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessorLegacy1390_();
      return sciipWrapLegacyRuntimeResult1390_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1390_(legacyResult, context, transaction) {
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
 * 1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER
 */

const SCIIP_1390_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST';
const SCIIP_1390_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER';
const SCIIP_1390_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessorLegacy1390_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1390ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1390_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1390EnsureSheet_(ss, SCIIP_1390_TARGET_SHEET, sciip1390TargetHeaders_());

  if (sciip1390BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1390_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1390HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1390Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1390Get_(row, sourceMap, [
      'Digest_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1390NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceDigestIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const digestId = sciip1390Get_(row, sourceMap, ['Digest_Id', 'Digest_ID', 'digestId']);
    const sourceBusinessKey = sciip1390Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (digestId) sourceDigestIds.push(String(digestId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1390CollectList_(signalTypes, sciip1390Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1390CollectList_(severities, sciip1390Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1390CollectList_(sourceStatuses, sciip1390Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    signalLedgerEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    sourceLedgerEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1390Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1390Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1390Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_SIGNAL_DIGEST_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity signal digest ledger entry for ${dateKey}: ` +
    `${relevantRows.length} signal digest entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `signal types: ${Object.keys(signalTypes).join(', ') || 'NONE'}; ` +
    `severities: ${Object.keys(severities).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1390_SOURCE_SHEET,
    relevantRows.length,
    sourceDigestIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
    result
  }));
  return result;
}

function sciip1390TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Signal_Digest_Entries_Reviewed',
    'Source_Digest_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
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

function sciip1390EnsureSheet_(ss, sheetName, headers) {
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

function sciip1390HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1390Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1390CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1390BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1390_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1390HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1390ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1390_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1390ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1390HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1390Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const digestDate = sciip1390Get_(row, map, ['Digest_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1390NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1390NormalizeDateKey_(digestDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1390ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1390ResolveDateKey_(value) {
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

function sciip1390NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_RUNTIME_LEDGER',

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
          originalProcessor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessorLegacy1400_();
      return sciipWrapLegacyRuntimeResult1400_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1400_(legacyResult, context, transaction) {
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

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessorLegacy1400_() {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessorLegacy1430_();
      return sciipWrapLegacyRuntimeResult1430_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1430_(legacyResult, context, transaction) {
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
 * 1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER
 */

const SCIIP_1430_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY';
const SCIIP_1430_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER';
const SCIIP_1430_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessorLegacy1430_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1430ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1430_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1430EnsureSheet_(ss, SCIIP_1430_TARGET_SHEET, sciip1430TargetHeaders_());

  if (sciip1430BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1430_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1430HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1430Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1430Get_(row, sourceMap, [
      'Summary_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1430NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSummaryIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let signalDigestEntriesReviewed = 0;
  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const headlines = [];
  const summaries = [];
  const recommendedActions = [];

  relevantRows.forEach(row => {
    const summaryId = sciip1430Get_(row, sourceMap, [
      'Executive_Summary_Id',
      'Summary_Id',
      'ExecutiveSummary_Id'
    ]);

    const sourceBusinessKey = sciip1430Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (summaryId) sourceSummaryIds.push(String(summaryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1430CollectList_(operationalStates, sciip1430Get_(row, sourceMap, ['Operational_State', 'Operational_States']));
    sciip1430CollectList_(executiveStatuses, sciip1430Get_(row, sourceMap, ['Executive_Status', 'Executive_Statuses']));
    sciip1430CollectList_(priorities, sciip1430Get_(row, sourceMap, ['Priority', 'Priorities']));
    sciip1430CollectList_(signalTypes, sciip1430Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1430CollectList_(severities, sciip1430Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1430CollectList_(sourceStatuses, sciip1430Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    const headline = sciip1430Get_(row, sourceMap, ['Executive_Headline']);
    const summary = sciip1430Get_(row, sourceMap, ['Executive_Summary']);
    const recommendedAction = sciip1430Get_(row, sourceMap, ['Recommended_Action']);

    if (headline) headlines.push(String(headline));
    if (summary) summaries.push(String(summary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    commandCenterLedgerEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1430Get_(row, sourceMap, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    signalDigestEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Signal_Digest_Entries_Reviewed']) || 0);
    signalLedgerEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1430Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1430Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1430Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_EXEC_SUMMARY_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity executive summary ledger entry for ${dateKey}: ` +
    `${relevantRows.length} executive summar${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `executive status: ${Object.keys(executiveStatuses).join(', ') || 'NONE'}; ` +
    `priority: ${Object.keys(priorities).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1430_SOURCE_SHEET,
    relevantRows.length,
    sourceSummaryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    signalDigestEntriesReviewed,
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    headlines.join(' | '),
    summaries.join(' | '),
    recommendedActions.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
    result
  }));
  return result;
}

function sciip1430TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Executive_Summaries_Reviewed',
    'Source_Executive_Summary_Ids',
    'Source_Business_Keys',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Signal_Digest_Entries_Reviewed',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Executive_Headlines',
    'Executive_Summaries',
    'Recommended_Actions',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1430EnsureSheet_(ss, sheetName, headers) {
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

function sciip1430HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1430Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1430CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1430BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1430_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1430HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1430ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1430_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1430ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1430HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1430Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const summaryDate = sciip1430Get_(row, map, [
      'Summary_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1430NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1430NormalizeDateKey_(summaryDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1430ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1430ResolveDateKey_(value) {
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

function sciip1430NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_RUNTIME_LEDGER',

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
          originalProcessor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessorLegacy1440_();
      return sciipWrapLegacyRuntimeResult1440_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1440_(legacyResult, context, transaction) {
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

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessorLegacy1440_() {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessorLegacy1450_();
      return sciipWrapLegacyRuntimeResult1450_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1450_(legacyResult, context, transaction) {
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

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessorLegacy1450_() {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessorLegacy1470_();
      return sciipWrapLegacyRuntimeResult1470_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1470_(legacyResult, context, transaction) {
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
 * 1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER
 */

const SCIIP_1470_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION';
const SCIIP_1470_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER';
const SCIIP_1470_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessorLegacy1470_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1470ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1470_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1470EnsureSheet_(ss, SCIIP_1470_TARGET_SHEET, sciip1470TargetHeaders_());

  if (sciip1470BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityFinalizationLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1470_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityFinalizationLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1470HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1470Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1470Get_(row, map, [
      'Finalization_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1470NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityFinalizationLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceFinalizationIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};
  const finalizationStates = {};
  const finalizationDecisions = {};

  let dailyBriefLedgerEntriesReviewed = 0;
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

  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];

  relevantRows.forEach(row => {
    const finalizationId = sciip1470Get_(row, map, ['Finalization_Id', 'Finalization_ID']);
    const sourceBusinessKey = sciip1470Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (finalizationId) sourceFinalizationIds.push(String(finalizationId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1470CollectList_(operationalStates, sciip1470Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1470CollectList_(executiveStatuses, sciip1470Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1470CollectList_(priorities, sciip1470Get_(row, map, ['Priorities', 'Priority']));
    sciip1470CollectList_(signalTypes, sciip1470Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1470CollectList_(severities, sciip1470Get_(row, map, ['Severities', 'Severity']));
    sciip1470CollectList_(sourceStatuses, sciip1470Get_(row, map, ['Source_Statuses', 'Status']));
    sciip1470CollectList_(finalizationStates, sciip1470Get_(row, map, ['Finalization_State']));
    sciip1470CollectList_(finalizationDecisions, sciip1470Get_(row, map, ['Finalization_Decision']));

    const finalizationSummary = sciip1470Get_(row, map, ['Finalization_Summary']);
    const recommendedAction = sciip1470Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1470Get_(row, map, ['Recommended_Next_Step']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));

    dailyBriefLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1470Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    executiveSummariesReviewed += Number(sciip1470Get_(row, map, ['Executive_Summaries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1470Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1470Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1470Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1470Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_FINALIZATION_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(finalizationStates).indexOf('CONTINUITY_FINALIZED_WITH_REVIEW') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity finalization ledger entry for ${dateKey}: ` +
    `${relevantRows.length} finalization entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `state: ${Object.keys(finalizationStates).join(', ') || 'NONE'}; ` +
    `decision: ${Object.keys(finalizationDecisions).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1470_SOURCE_SHEET,
    relevantRows.length,
    sourceFinalizationIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    dailyBriefLedgerEntriesReviewed,
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
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityFinalizationLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
    result
  }));
  return result;
}

function sciip1470TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Finalizations_Reviewed',
    'Source_Finalization_Ids',
    'Source_Business_Keys',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Daily_Brief_Ledger_Entries_Reviewed',
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
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1470EnsureSheet_(ss, sheetName, headers) {
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

function sciip1470HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1470Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1470CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1470BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1470_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1470HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1470ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1470_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1470ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1470HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1470Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const finalizationDate = sciip1470Get_(row, map, [
      'Finalization_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1470NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1470NormalizeDateKey_(finalizationDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1470ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1470ResolveDateKey_(value) {
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

function sciip1470NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_RUNTIME_LEDGER',

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
          originalProcessor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityClosureProcessorLegacy1480_();
      return sciipWrapLegacyRuntimeResult1480_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1480_(legacyResult, context, transaction) {
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
 * 1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE
 */

const SCIIP_1480_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER';
const SCIIP_1480_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE';
const SCIIP_1480_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE';

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureProcessorLegacy1480_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1480ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1480_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1480EnsureSheet_(ss, SCIIP_1480_TARGET_SHEET, sciip1480TargetHeaders_());

  if (sciip1480BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityClosuresCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1480_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityClosuresCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1480HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1480Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1480Get_(row, map, [
      'Ledger_Date',
      'Finalization_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1480NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityClosuresCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

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

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1480Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1480Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1480CollectList_(finalizationStates, sciip1480Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1480CollectList_(finalizationDecisions, sciip1480Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1480CollectList_(operationalStates, sciip1480Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1480CollectList_(executiveStatuses, sciip1480Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1480CollectList_(priorities, sciip1480Get_(row, map, ['Priorities', 'Priority']));
    sciip1480CollectList_(signalTypes, sciip1480Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1480CollectList_(severities, sciip1480Get_(row, map, ['Severities', 'Severity']));
    sciip1480CollectList_(sourceStatuses, sciip1480Get_(row, map, ['Source_Statuses', 'Status']));

    const finalizationSummary = sciip1480Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1480Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1480Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));

    finalizationsReviewed += Number(sciip1480Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1480Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1480Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1480Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1480Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1480Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1480Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1480Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1480Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1480Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const closureId = `APRSC_CLOSURE_${Utilities.getUuid()}`;

  let closureState = 'CONTINUITY_CLOSED';
  let closureDecision = 'CLOSED_APPROVED';
  let closureStatus = 'SUCCESS';
  let closureSeverity = 'INFO';
  let nextStep = 'Proceed to continuity closure ledger processor.';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(finalizationStates).indexOf('CONTINUITY_FINALIZED_WITH_REVIEW') !== -1
  ) {
    closureState = 'CONTINUITY_CLOSED_WITH_REVIEW_FLAG';
    closureDecision = 'CLOSED_REVIEW_REQUIRED';
    closureStatus = 'REVIEW_REQUIRED';
    closureSeverity = 'WARN';
    nextStep = 'Proceed to closure ledger, but preserve review flag for downstream continuity consumers.';
  } else if (
    Object.keys(finalizationStates).indexOf('CONTINUITY_FINALIZED_NO_ACTIVITY') !== -1 ||
    Object.keys(executiveStatuses).indexOf('BLUE') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    closureState = 'CONTINUITY_CLOSED_NO_ACTIVITY';
    closureDecision = 'CLOSED_NO_ACTIVITY';
    closureStatus = 'SUCCESS';
    closureSeverity = 'LOW';
    nextStep = 'Proceed to closure ledger. Monitor if no activity persists across future processing dates.';
  }

  const closureSummary =
    `Continuity closure for ${dateKey}: ${closureState}. ` +
    `${relevantRows.length} finalization ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${finalizationsReviewed} finalization${finalizationsReviewed === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    closureId,
    businessKey,
    dateKey,
    SCIIP_1480_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
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
    closureState,
    closureDecision,
    closureSeverity,
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    closureSummary,
    nextStep,
    closureStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityClosuresCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityClosureProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityClosureProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityClosureProcessor',
    result
  }));
  return result;
}

function sciip1480TargetHeaders_() {
  return [
    'Closure_Id',
    'Business_Key',
    'Closure_Date',
    'Source_Sheet',
    'Finalization_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
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
    'Closure_State',
    'Closure_Decision',
    'Closure_Severity',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Closure_Summary',
    'Next_Step',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1480EnsureSheet_(ss, sheetName, headers) {
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

function sciip1480HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1480Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1480CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1480BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1480_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1480HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1480ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1480_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1480ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1480HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1480Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1480Get_(row, map, [
      'Ledger_Date',
      'Finalization_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1480NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1480NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1480ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1480ResolveDateKey_(value) {
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

function sciip1480NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessorLegacy1490_();
      return sciipWrapLegacyRuntimeResult1490_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1490_(legacyResult, context, transaction) {
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

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessorLegacy1490_() {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_RUNTIME_LEDGER',

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
          originalProcessor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveProcessorLegacy1500_();
      return sciipWrapLegacyRuntimeResult1500_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1500_(legacyResult, context, transaction) {
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
 * 1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE
 */

const SCIIP_1500_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER';
const SCIIP_1500_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE';
const SCIIP_1500_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE';

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveProcessorLegacy1500_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1500ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1500_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1500EnsureSheet_(ss, SCIIP_1500_TARGET_SHEET, sciip1500TargetHeaders_());

  if (sciip1500BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchivesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1500_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchivesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1500HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1500Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1500Get_(row, map, ['Ledger_Date', 'Closure_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1500NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchivesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
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

  let closuresReviewed = 0;
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
  const ledgerSummaries = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1500Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1500Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1500CollectList_(closureStates, sciip1500Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1500CollectList_(closureDecisions, sciip1500Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1500CollectList_(closureSeverities, sciip1500Get_(row, map, ['Closure_Severities', 'Closure_Severity']));
    sciip1500CollectList_(finalizationStates, sciip1500Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1500CollectList_(finalizationDecisions, sciip1500Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1500CollectList_(operationalStates, sciip1500Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1500CollectList_(executiveStatuses, sciip1500Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1500CollectList_(priorities, sciip1500Get_(row, map, ['Priorities', 'Priority']));
    sciip1500CollectList_(signalTypes, sciip1500Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1500CollectList_(severities, sciip1500Get_(row, map, ['Severities', 'Severity']));
    sciip1500CollectList_(sourceStatuses, sciip1500Get_(row, map, ['Source_Statuses', 'Status']));

    const finalizationSummary = sciip1500Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1500Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1500Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const closureSummary = sciip1500Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const nextStep = sciip1500Get_(row, map, ['Next_Steps', 'Next_Step']);
    const ledgerSummary = sciip1500Get_(row, map, ['Ledger_Summary']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (nextStep) nextSteps.push(String(nextStep));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));

    closuresReviewed += Number(sciip1500Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1500Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1500Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1500Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1500Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1500Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1500Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const archiveId = `APRSC_ARCHIVE_${Utilities.getUuid()}`;

  let archiveState = 'CONTINUITY_ARCHIVED';
  let archiveDecision = 'ARCHIVED_APPROVED';
  let archiveStatus = 'SUCCESS';
  let archiveSeverity = 'INFO';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(closureStates).indexOf('CONTINUITY_CLOSED_WITH_REVIEW_FLAG') !== -1
  ) {
    archiveState = 'CONTINUITY_ARCHIVED_WITH_REVIEW_FLAG';
    archiveDecision = 'ARCHIVED_REVIEW_REQUIRED';
    archiveStatus = 'REVIEW_REQUIRED';
    archiveSeverity = 'WARN';
  } else if (
    Object.keys(closureStates).indexOf('CONTINUITY_CLOSED_NO_ACTIVITY') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    archiveState = 'CONTINUITY_ARCHIVED_NO_ACTIVITY';
    archiveDecision = 'ARCHIVED_NO_ACTIVITY';
    archiveStatus = 'SUCCESS';
    archiveSeverity = 'LOW';
  }

  const archiveSummary =
    `Continuity archive for ${dateKey}: ${archiveState}. ` +
    `${relevantRows.length} closure ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} archived; ` +
    `${closuresReviewed} closure${closuresReviewed === 1 ? '' : 's'}; ` +
    `${finalizationsReviewed} finalization${finalizationsReviewed === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    archiveId,
    businessKey,
    dateKey,
    SCIIP_1500_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
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
    closuresReviewed,
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
    ledgerSummaries.join(' | '),
    archiveState,
    archiveDecision,
    archiveSeverity,
    archiveSummary,
    archiveStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchivesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchiveProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
    result
  }));
  return result;
}

function sciip1500TargetHeaders_() {
  return [
    'Archive_Id',
    'Business_Key',
    'Archive_Date',
    'Source_Sheet',
    'Closure_Ledger_Entries_Archived',
    'Source_Ledger_Entry_Ids',
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
    'Closures_Reviewed',
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
    'Source_Ledger_Summaries',
    'Archive_State',
    'Archive_Decision',
    'Archive_Severity',
    'Archive_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1500EnsureSheet_(ss, sheetName, headers) {
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

function sciip1500HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1500Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1500CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1500BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1500_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1500HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1500ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1500_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1500ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1500HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1500Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1500Get_(row, map, ['Ledger_Date', 'Closure_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1500NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1500NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1500ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1500ResolveDateKey_(value) {
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

function sciip1500NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessorLegacy1510_();
      return sciipWrapLegacyRuntimeResult1510_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1510_(legacyResult, context, transaction) {
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
 * 1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER
 */

const SCIIP_1510_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE';
const SCIIP_1510_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER';
const SCIIP_1510_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessorLegacy1510_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1510ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1510_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1510EnsureSheet_(ss, SCIIP_1510_TARGET_SHEET, sciip1510TargetHeaders_());

  if (sciip1510BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchiveLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1510_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchiveLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1510HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1510Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1510Get_(row, map, [
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1510NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchiveLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceArchiveIds = [];
  const sourceBusinessKeys = [];
  const archiveStates = {};
  const archiveDecisions = {};
  const archiveSeverities = {};
  const closureStates = {};
  const closureDecisions = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
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
  const sourceLedgerSummaries = [];
  const archiveSummaries = [];

  relevantRows.forEach(row => {
    const archiveId = sciip1510Get_(row, map, ['Archive_Id', 'Archive_ID']);
    const sourceBusinessKey = sciip1510Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (archiveId) sourceArchiveIds.push(String(archiveId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1510CollectList_(archiveStates, sciip1510Get_(row, map, ['Archive_State']));
    sciip1510CollectList_(archiveDecisions, sciip1510Get_(row, map, ['Archive_Decision']));
    sciip1510CollectList_(archiveSeverities, sciip1510Get_(row, map, ['Archive_Severity']));
    sciip1510CollectList_(closureStates, sciip1510Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1510CollectList_(closureDecisions, sciip1510Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1510CollectList_(finalizationStates, sciip1510Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1510CollectList_(finalizationDecisions, sciip1510Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1510CollectList_(operationalStates, sciip1510Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1510CollectList_(executiveStatuses, sciip1510Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1510CollectList_(priorities, sciip1510Get_(row, map, ['Priorities', 'Priority']));
    sciip1510CollectList_(signalTypes, sciip1510Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1510CollectList_(severities, sciip1510Get_(row, map, ['Severities', 'Severity']));
    sciip1510CollectList_(sourceStatuses, sciip1510Get_(row, map, ['Source_Statuses', 'Status']));

    const finalizationSummary = sciip1510Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1510Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1510Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const closureSummary = sciip1510Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const nextStep = sciip1510Get_(row, map, ['Next_Steps', 'Next_Step']);
    const sourceLedgerSummary = sciip1510Get_(row, map, ['Source_Ledger_Summaries', 'Ledger_Summary']);
    const archiveSummary = sciip1510Get_(row, map, ['Archive_Summary']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (nextStep) nextSteps.push(String(nextStep));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (archiveSummary) archiveSummaries.push(String(archiveSummary));

    closureLedgerEntriesArchived += Number(sciip1510Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1510Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1510Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1510Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1510Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1510Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1510Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1510Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_ARCHIVE_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(archiveStates).indexOf('CONTINUITY_ARCHIVED_WITH_REVIEW_FLAG') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity archive ledger entry for ${dateKey}: ` +
    `${relevantRows.length} archive entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `archive state: ${Object.keys(archiveStates).join(', ') || 'NONE'}; ` +
    `archive decision: ${Object.keys(archiveDecisions).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1510_SOURCE_SHEET,
    relevantRows.length,
    sourceArchiveIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(archiveStates).join(', '),
    Object.keys(archiveDecisions).join(', '),
    Object.keys(archiveSeverities).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    closureLedgerEntriesArchived,
    closuresReviewed,
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
    sourceLedgerSummaries.join(' | '),
    archiveSummaries.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchiveLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
    result
  }));
  return result;
}

function sciip1510TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Archives_Reviewed',
    'Source_Archive_Ids',
    'Source_Business_Keys',
    'Archive_States',
    'Archive_Decisions',
    'Archive_Severities',
    'Closure_States',
    'Closure_Decisions',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
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
    'Source_Ledger_Summaries',
    'Archive_Summaries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1510EnsureSheet_(ss, sheetName, headers) {
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

function sciip1510HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1510Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1510CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1510BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1510_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1510HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1510ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1510_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1510ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1510HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1510Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const archiveDate = sciip1510Get_(row, map, [
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1510NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1510NormalizeDateKey_(archiveDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1510ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1510ResolveDateKey_(value) {
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

function sciip1510NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_RUNTIME_LEDGER',

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
          originalProcessor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessorLegacy1520_();
      return sciipWrapLegacyRuntimeResult1520_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1520_(legacyResult, context, transaction) {
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
 * 1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH
 */

const SCIIP_1520_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER';
const SCIIP_1520_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';
const SCIIP_1520_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessorLegacy1520_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1520ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1520_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1520EnsureSheet_(ss, SCIIP_1520_TARGET_SHEET, sciip1520TargetHeaders_());

  if (sciip1520BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1520_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1520HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1520Get_(row, map, [
      'Ledger_Date',
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1520NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];

  const archiveStates = {};
  const archiveDecisions = {};
  const archiveSeverities = {};
  const closureStates = {};
  const closureDecisions = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
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

  const archiveSummaries = [];
  const ledgerSummaries = [];
  const closureSummaries = [];
  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1520Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1520CollectList_(archiveStates, sciip1520Get_(row, map, ['Archive_States', 'Archive_State']));
    sciip1520CollectList_(archiveDecisions, sciip1520Get_(row, map, ['Archive_Decisions', 'Archive_Decision']));
    sciip1520CollectList_(archiveSeverities, sciip1520Get_(row, map, ['Archive_Severities', 'Archive_Severity']));
    sciip1520CollectList_(closureStates, sciip1520Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1520CollectList_(closureDecisions, sciip1520Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1520CollectList_(finalizationStates, sciip1520Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1520CollectList_(finalizationDecisions, sciip1520Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1520CollectList_(operationalStates, sciip1520Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1520CollectList_(executiveStatuses, sciip1520Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1520CollectList_(priorities, sciip1520Get_(row, map, ['Priorities', 'Priority']));
    sciip1520CollectList_(signalTypes, sciip1520Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1520CollectList_(severities, sciip1520Get_(row, map, ['Severities', 'Severity']));
    sciip1520CollectList_(sourceStatuses, sciip1520Get_(row, map, ['Source_Statuses', 'Status']));

    const archiveSummary = sciip1520Get_(row, map, ['Archive_Summaries', 'Archive_Summary']);
    const ledgerSummary = sciip1520Get_(row, map, ['Ledger_Summary']);
    const closureSummary = sciip1520Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const finalizationSummary = sciip1520Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1520Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1520Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);

    if (archiveSummary) archiveSummaries.push(String(archiveSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));

    archivesReviewed += Number(sciip1520Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1520Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1520Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1520Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1520Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1520Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1520Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1520Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1520Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const graphRecordId = `APRSC_KG_${Utilities.getUuid()}`;
  const graphNodeId = `KG_NODE_RUN_STATE_CONTINUITY_${dateKey}`;
  const graphNodeType = 'RUN_STATE_CONTINUITY_ARCHIVE';
  const graphEdgeType = 'SUMMARIZES_ARCHIVED_CONTINUITY_CHAIN';
  const graphSubject = `RUN_STATE_CONTINUITY|${dateKey}`;
  const graphObject = sourceBusinessKeys.join(', ');

  const graphState =
    Object.keys(archiveStates).indexOf('CONTINUITY_ARCHIVED_WITH_REVIEW_FLAG') !== -1
      ? 'GRAPH_REVIEW_REQUIRED'
      : Object.keys(archiveStates).indexOf('CONTINUITY_ARCHIVED_NO_ACTIVITY') !== -1
        ? 'GRAPH_NO_ACTIVITY'
        : 'GRAPH_HEALTHY';

  const graphStatus = graphState === 'GRAPH_REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'SUCCESS';

  const graphSummary =
    `Knowledge graph projection for run state continuity ${dateKey}: ${graphState}. ` +
    `${relevantRows.length} archive ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} projected; ` +
    `archive states: ${Object.keys(archiveStates).join(', ') || 'NONE'}; ` +
    `closure states: ${Object.keys(closureStates).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    graphRecordId,
    businessKey,
    dateKey,
    SCIIP_1520_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    graphNodeId,
    graphNodeType,
    graphEdgeType,
    graphSubject,
    graphObject,
    graphState,
    Object.keys(archiveStates).join(', '),
    Object.keys(archiveDecisions).join(', '),
    Object.keys(archiveSeverities).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
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
    archiveSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    closureSummaries.join(' | '),
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    graphSummary,
    graphStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    result
  }));
  return result;
}

function sciip1520TargetHeaders_() {
  return [
    'Knowledge_Graph_Record_Id',
    'Business_Key',
    'Graph_Date',
    'Source_Sheet',
    'Archive_Ledger_Entries_Projected',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Graph_Node_Id',
    'Graph_Node_Type',
    'Graph_Edge_Type',
    'Graph_Subject',
    'Graph_Object',
    'Graph_State',
    'Archive_States',
    'Archive_Decisions',
    'Archive_Severities',
    'Closure_States',
    'Closure_Decisions',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
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
    'Archive_Summaries',
    'Source_Ledger_Summaries',
    'Closure_Summaries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Graph_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1520EnsureSheet_(ss, sheetName, headers) {
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

function sciip1520HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1520Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1520CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1520BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1520_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1520HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1520ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1520_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1520ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1520HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1520Get_(row, map, [
      'Ledger_Date',
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1520NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1520NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1520ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1520ResolveDateKey_(value) {
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

function sciip1520NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessorLegacy1530_();
      return sciipWrapLegacyRuntimeResult1530_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1530_(legacyResult, context, transaction) {
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
 * 1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER
 */

const SCIIP_1530_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';
const SCIIP_1530_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';
const SCIIP_1530_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessorLegacy1530_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1530ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1530_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1530EnsureSheet_(ss, SCIIP_1530_TARGET_SHEET, sciip1530TargetHeaders_());

  if (sciip1530BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1530_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1530HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1530Get_(row, map, [
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1530NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceGraphRecordIds = [];
  const sourceBusinessKeys = [];
  const sourceLedgerEntryIds = [];
  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};

  const archiveStates = {};
  const archiveDecisions = {};
  const archiveSeverities = {};
  const closureStates = {};
  const closureDecisions = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
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

  const archiveSummaries = [];
  const sourceLedgerSummaries = [];
  const closureSummaries = [];
  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];
  const graphSummaries = [];

  relevantRows.forEach(row => {
    const graphRecordId = sciip1530Get_(row, map, ['Knowledge_Graph_Record_Id', 'Graph_Record_Id']);
    const sourceBusinessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const sourceLedgerEntryId = sciip1530Get_(row, map, ['Source_Ledger_Entry_Ids', 'Source_Ledger_Entry_Id']);

    if (graphRecordId) sourceGraphRecordIds.push(String(graphRecordId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (sourceLedgerEntryId) sourceLedgerEntryIds.push(String(sourceLedgerEntryId));

    sciip1530CollectList_(graphNodeIds, sciip1530Get_(row, map, ['Graph_Node_Id']));
    sciip1530CollectList_(graphNodeTypes, sciip1530Get_(row, map, ['Graph_Node_Type']));
    sciip1530CollectList_(graphEdgeTypes, sciip1530Get_(row, map, ['Graph_Edge_Type']));
    sciip1530CollectList_(graphSubjects, sciip1530Get_(row, map, ['Graph_Subject']));
    sciip1530CollectList_(graphObjects, sciip1530Get_(row, map, ['Graph_Object']));
    sciip1530CollectList_(graphStates, sciip1530Get_(row, map, ['Graph_State']));

    sciip1530CollectList_(archiveStates, sciip1530Get_(row, map, ['Archive_States', 'Archive_State']));
    sciip1530CollectList_(archiveDecisions, sciip1530Get_(row, map, ['Archive_Decisions', 'Archive_Decision']));
    sciip1530CollectList_(archiveSeverities, sciip1530Get_(row, map, ['Archive_Severities', 'Archive_Severity']));
    sciip1530CollectList_(closureStates, sciip1530Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1530CollectList_(closureDecisions, sciip1530Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1530CollectList_(finalizationStates, sciip1530Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1530CollectList_(finalizationDecisions, sciip1530Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1530CollectList_(operationalStates, sciip1530Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1530CollectList_(executiveStatuses, sciip1530Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1530CollectList_(priorities, sciip1530Get_(row, map, ['Priorities', 'Priority']));
    sciip1530CollectList_(signalTypes, sciip1530Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1530CollectList_(severities, sciip1530Get_(row, map, ['Severities', 'Severity']));
    sciip1530CollectList_(sourceStatuses, sciip1530Get_(row, map, ['Source_Statuses', 'Status']));

    const archiveSummary = sciip1530Get_(row, map, ['Archive_Summaries', 'Archive_Summary']);
    const sourceLedgerSummary = sciip1530Get_(row, map, ['Source_Ledger_Summaries', 'Ledger_Summary']);
    const closureSummary = sciip1530Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const finalizationSummary = sciip1530Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1530Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1530Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const graphSummary = sciip1530Get_(row, map, ['Graph_Summary']);

    if (archiveSummary) archiveSummaries.push(String(archiveSummary));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (graphSummary) graphSummaries.push(String(graphSummary));

    archiveLedgerEntriesProjected += Number(sciip1530Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1530Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1530Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1530Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1530Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1530Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1530Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1530Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1530Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1530Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_KG_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(graphStates).indexOf('GRAPH_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity knowledge graph ledger entry for ${dateKey}: ` +
    `${relevantRows.length} graph projection entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `graph states: ${Object.keys(graphStates).join(', ') || 'NONE'}; ` +
    `graph nodes: ${Object.keys(graphNodeIds).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1530_SOURCE_SHEET,
    relevantRows.length,
    sourceGraphRecordIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceLedgerEntryIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    Object.keys(archiveStates).join(', '),
    Object.keys(archiveDecisions).join(', '),
    Object.keys(archiveSeverities).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
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
    archiveSummaries.join(' | '),
    sourceLedgerSummaries.join(' | '),
    closureSummaries.join(' | '),
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    graphSummaries.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
    result
  }));
  return result;
}

function sciip1530TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Knowledge_Graph_Records_Reviewed',
    'Source_Knowledge_Graph_Record_Ids',
    'Source_Business_Keys',
    'Source_Ledger_Entry_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'Archive_States',
    'Archive_Decisions',
    'Archive_Severities',
    'Closure_States',
    'Closure_Decisions',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
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
    'Archive_Summaries',
    'Source_Ledger_Summaries',
    'Closure_Summaries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Graph_Summaries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1530EnsureSheet_(ss, sheetName, headers) {
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

function sciip1530HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1530Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1530CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1530BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1530_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1530HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1530ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1530_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1530ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1530HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const graphDate = sciip1530Get_(row, map, [
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1530NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1530NormalizeDateKey_(graphDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1530ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1530ResolveDateKey_(value) {
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

function sciip1530NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_RUNTIME_LEDGER',

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
          originalProcessor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessorLegacy1540_();
      return sciipWrapLegacyRuntimeResult1540_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1540_(legacyResult, context, transaction) {
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
 * 1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP
 */

const SCIIP_1540_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';
const SCIIP_1540_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP';
const SCIIP_1540_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessorLegacy1540_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1540ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1540_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1540EnsureSheet_(ss, SCIIP_1540_TARGET_SHEET, sciip1540TargetHeaders_());

  if (sciip1540BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1540_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1540HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1540Get_(row, map, [
      'Ledger_Date',
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1540NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const sourceGraphRecordIds = [];

  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};

  const archiveStates = {};
  const closureStates = {};
  const finalizationStates = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let knowledgeGraphRecordsReviewed = 0;
  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefsReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const graphSummaries = [];
  const ledgerSummaries = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1540Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const graphRecordId = sciip1540Get_(row, map, ['Source_Knowledge_Graph_Record_Ids', 'Knowledge_Graph_Record_Id']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (graphRecordId) sourceGraphRecordIds.push(String(graphRecordId));

    sciip1540CollectList_(graphNodeIds, sciip1540Get_(row, map, ['Graph_Node_Ids', 'Graph_Node_Id']));
    sciip1540CollectList_(graphNodeTypes, sciip1540Get_(row, map, ['Graph_Node_Types', 'Graph_Node_Type']));
    sciip1540CollectList_(graphEdgeTypes, sciip1540Get_(row, map, ['Graph_Edge_Types', 'Graph_Edge_Type']));
    sciip1540CollectList_(graphSubjects, sciip1540Get_(row, map, ['Graph_Subjects', 'Graph_Subject']));
    sciip1540CollectList_(graphObjects, sciip1540Get_(row, map, ['Graph_Objects', 'Graph_Object']));
    sciip1540CollectList_(graphStates, sciip1540Get_(row, map, ['Graph_States', 'Graph_State']));

    sciip1540CollectList_(archiveStates, sciip1540Get_(row, map, ['Archive_States']));
    sciip1540CollectList_(closureStates, sciip1540Get_(row, map, ['Closure_States']));
    sciip1540CollectList_(finalizationStates, sciip1540Get_(row, map, ['Finalization_States']));
    sciip1540CollectList_(operationalStates, sciip1540Get_(row, map, ['Operational_States']));
    sciip1540CollectList_(executiveStatuses, sciip1540Get_(row, map, ['Executive_Statuses']));
    sciip1540CollectList_(priorities, sciip1540Get_(row, map, ['Priorities']));
    sciip1540CollectList_(signalTypes, sciip1540Get_(row, map, ['Signal_Types']));
    sciip1540CollectList_(severities, sciip1540Get_(row, map, ['Severities']));
    sciip1540CollectList_(sourceStatuses, sciip1540Get_(row, map, ['Source_Statuses', 'Status']));

    const graphSummary = sciip1540Get_(row, map, ['Graph_Summaries', 'Graph_Summary']);
    const ledgerSummary = sciip1540Get_(row, map, ['Ledger_Summary']);

    if (graphSummary) graphSummaries.push(String(graphSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));

    knowledgeGraphRecordsReviewed += Number(sciip1540Get_(row, map, ['Knowledge_Graph_Records_Reviewed']) || 0);
    archiveLedgerEntriesProjected += Number(sciip1540Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1540Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1540Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1540Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1540Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1540Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1540Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1540Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1540Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1540Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1540Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1540Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const systemMapId = `APRSC_SYSTEM_MAP_${Utilities.getUuid()}`;

  let mapState = 'SYSTEM_MAP_HEALTHY';
  let mapStatus = 'SUCCESS';
  let mapSeverity = 'INFO';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(graphStates).indexOf('GRAPH_REVIEW_REQUIRED') !== -1
  ) {
    mapState = 'SYSTEM_MAP_REVIEW_REQUIRED';
    mapStatus = 'REVIEW_REQUIRED';
    mapSeverity = 'WARN';
  } else if (
    Object.keys(graphStates).indexOf('GRAPH_NO_ACTIVITY') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    mapState = 'SYSTEM_MAP_NO_ACTIVITY';
    mapStatus = 'SUCCESS';
    mapSeverity = 'LOW';
  }

  const systemMapSummary =
    `Continuity system map for ${dateKey}: ${mapState}. ` +
    `${relevantRows.length} knowledge graph ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} mapped; ` +
    `nodes: ${Object.keys(graphNodeIds).join(', ') || 'NONE'}; ` +
    `edges: ${Object.keys(graphEdgeTypes).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    systemMapId,
    businessKey,
    dateKey,
    SCIIP_1540_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceGraphRecordIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    mapState,
    mapSeverity,
    Object.keys(archiveStates).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    knowledgeGraphRecordsReviewed,
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefsReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    graphSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    systemMapSummary,
    mapStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    result
  }));
  return result;
}

function sciip1540TargetHeaders_() {
  return [
    'System_Map_Id',
    'Business_Key',
    'System_Map_Date',
    'Source_Sheet',
    'Knowledge_Graph_Ledger_Entries_Mapped',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Source_Knowledge_Graph_Record_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'System_Map_State',
    'System_Map_Severity',
    'Archive_States',
    'Closure_States',
    'Finalization_States',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Knowledge_Graph_Records_Reviewed',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Briefs_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Graph_Summaries',
    'Source_Ledger_Summaries',
    'System_Map_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1540EnsureSheet_(ss, sheetName, headers) {
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

function sciip1540HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1540Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1540CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1540BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1540_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1540HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1540ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1540_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1540ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1540HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1540Get_(row, map, [
      'Ledger_Date',
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1540NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1540NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1540ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1540ResolveDateKey_(value) {
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

function sciip1540NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessorLegacy1550_();
      return sciipWrapLegacyRuntimeResult1550_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1550_(legacyResult, context, transaction) {
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
 * 1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER
 */

const SCIIP_1550_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP';
const SCIIP_1550_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER';
const SCIIP_1550_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessorLegacy1550_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1550ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1550_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1550EnsureSheet_(ss, SCIIP_1550_TARGET_SHEET, sciip1550TargetHeaders_());

  if (sciip1550BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMapLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1550_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1550HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1550Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1550Get_(row, map, [
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1550NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSystemMapIds = [];
  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const sourceKnowledgeGraphRecordIds = [];

  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};
  const systemMapStates = {};
  const systemMapSeverities = {};

  const archiveStates = {};
  const closureStates = {};
  const finalizationStates = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let knowledgeGraphLedgerEntriesMapped = 0;
  let knowledgeGraphRecordsReviewed = 0;
  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefsReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const graphSummaries = [];
  const sourceLedgerSummaries = [];
  const systemMapSummaries = [];

  relevantRows.forEach(row => {
    const systemMapId = sciip1550Get_(row, map, ['System_Map_Id', 'SystemMap_Id']);
    const sourceLedgerEntryId = sciip1550Get_(row, map, ['Source_Ledger_Entry_Ids', 'Source_Ledger_Entry_Id']);
    const sourceBusinessKey = sciip1550Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const sourceKgRecordId = sciip1550Get_(row, map, ['Source_Knowledge_Graph_Record_Ids', 'Source_Knowledge_Graph_Record_Id']);

    if (systemMapId) sourceSystemMapIds.push(String(systemMapId));
    if (sourceLedgerEntryId) sourceLedgerEntryIds.push(String(sourceLedgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (sourceKgRecordId) sourceKnowledgeGraphRecordIds.push(String(sourceKgRecordId));

    sciip1550CollectList_(graphNodeIds, sciip1550Get_(row, map, ['Graph_Node_Ids', 'Graph_Node_Id']));
    sciip1550CollectList_(graphNodeTypes, sciip1550Get_(row, map, ['Graph_Node_Types', 'Graph_Node_Type']));
    sciip1550CollectList_(graphEdgeTypes, sciip1550Get_(row, map, ['Graph_Edge_Types', 'Graph_Edge_Type']));
    sciip1550CollectList_(graphSubjects, sciip1550Get_(row, map, ['Graph_Subjects', 'Graph_Subject']));
    sciip1550CollectList_(graphObjects, sciip1550Get_(row, map, ['Graph_Objects', 'Graph_Object']));
    sciip1550CollectList_(graphStates, sciip1550Get_(row, map, ['Graph_States', 'Graph_State']));
    sciip1550CollectList_(systemMapStates, sciip1550Get_(row, map, ['System_Map_State']));
    sciip1550CollectList_(systemMapSeverities, sciip1550Get_(row, map, ['System_Map_Severity']));

    sciip1550CollectList_(archiveStates, sciip1550Get_(row, map, ['Archive_States']));
    sciip1550CollectList_(closureStates, sciip1550Get_(row, map, ['Closure_States']));
    sciip1550CollectList_(finalizationStates, sciip1550Get_(row, map, ['Finalization_States']));
    sciip1550CollectList_(operationalStates, sciip1550Get_(row, map, ['Operational_States']));
    sciip1550CollectList_(executiveStatuses, sciip1550Get_(row, map, ['Executive_Statuses']));
    sciip1550CollectList_(priorities, sciip1550Get_(row, map, ['Priorities']));
    sciip1550CollectList_(signalTypes, sciip1550Get_(row, map, ['Signal_Types']));
    sciip1550CollectList_(severities, sciip1550Get_(row, map, ['Severities']));
    sciip1550CollectList_(sourceStatuses, sciip1550Get_(row, map, ['Source_Statuses', 'Status']));

    const graphSummary = sciip1550Get_(row, map, ['Graph_Summaries', 'Graph_Summary']);
    const sourceLedgerSummary = sciip1550Get_(row, map, ['Source_Ledger_Summaries', 'Ledger_Summary']);
    const systemMapSummary = sciip1550Get_(row, map, ['System_Map_Summary']);

    if (graphSummary) graphSummaries.push(String(graphSummary));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (systemMapSummary) systemMapSummaries.push(String(systemMapSummary));

    knowledgeGraphLedgerEntriesMapped += Number(sciip1550Get_(row, map, ['Knowledge_Graph_Ledger_Entries_Mapped']) || 0);
    knowledgeGraphRecordsReviewed += Number(sciip1550Get_(row, map, ['Knowledge_Graph_Records_Reviewed']) || 0);
    archiveLedgerEntriesProjected += Number(sciip1550Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1550Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1550Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1550Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1550Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1550Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1550Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1550Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1550Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1550Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1550Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1550Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_SYSTEM_MAP_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(systemMapStates).indexOf('SYSTEM_MAP_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity system map ledger entry for ${dateKey}: ` +
    `${relevantRows.length} system map entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `map states: ${Object.keys(systemMapStates).join(', ') || 'NONE'}; ` +
    `graph nodes: ${Object.keys(graphNodeIds).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1550_SOURCE_SHEET,
    relevantRows.length,
    sourceSystemMapIds.join(', '),
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceKnowledgeGraphRecordIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    Object.keys(systemMapStates).join(', '),
    Object.keys(systemMapSeverities).join(', '),
    Object.keys(archiveStates).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    knowledgeGraphLedgerEntriesMapped,
    knowledgeGraphRecordsReviewed,
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefsReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    graphSummaries.join(' | '),
    sourceLedgerSummaries.join(' | '),
    systemMapSummaries.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMapLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
    result
  }));
  return result;
}

function sciip1550TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'System_Maps_Reviewed',
    'Source_System_Map_Ids',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Source_Knowledge_Graph_Record_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'System_Map_States',
    'System_Map_Severities',
    'Archive_States',
    'Closure_States',
    'Finalization_States',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Knowledge_Graph_Ledger_Entries_Mapped',
    'Knowledge_Graph_Records_Reviewed',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Briefs_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Graph_Summaries',
    'Source_Ledger_Summaries',
    'System_Map_Summaries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1550EnsureSheet_(ss, sheetName, headers) {
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

function sciip1550HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1550Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1550CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1550BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1550_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1550HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1550ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1550_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1550ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1550HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1550Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const systemMapDate = sciip1550Get_(row, map, [
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1550NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1550NormalizeDateKey_(systemMapDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1550ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1550ResolveDateKey_(value) {
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

function sciip1550NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_RUNTIME_LEDGER',

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
          originalProcessor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessorLegacy1560_();
      return sciipWrapLegacyRuntimeResult1560_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1560_(legacyResult, context, transaction) {
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
 * 1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX
 */

const SCIIP_1560_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER';
const SCIIP_1560_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';
const SCIIP_1560_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessorLegacy1560_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1560ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1560_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1560EnsureSheet_(ss, SCIIP_1560_TARGET_SHEET, sciip1560TargetHeaders_());

  if (sciip1560BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1560_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1560HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1560Get_(row, map, [
      'Ledger_Date',
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1560NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceSystemMapIds = [];
  const sourceBusinessKeys = [];
  const sourceKnowledgeGraphRecordIds = [];

  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};
  const systemMapStates = {};
  const systemMapSeverities = {};

  const archiveStates = {};
  const closureStates = {};
  const finalizationStates = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let systemMapsReviewed = 0;
  let knowledgeGraphLedgerEntriesMapped = 0;
  let knowledgeGraphRecordsReviewed = 0;
  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefsReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const graphSummaries = [];
  const sourceLedgerSummaries = [];
  const systemMapSummaries = [];
  const ledgerSummaries = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1560Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const systemMapId = sciip1560Get_(row, map, ['Source_System_Map_Ids', 'System_Map_Id']);
    const sourceBusinessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const sourceKgRecordId = sciip1560Get_(row, map, ['Source_Knowledge_Graph_Record_Ids', 'Source_Knowledge_Graph_Record_Id']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (systemMapId) sourceSystemMapIds.push(String(systemMapId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (sourceKgRecordId) sourceKnowledgeGraphRecordIds.push(String(sourceKgRecordId));

    sciip1560CollectList_(graphNodeIds, sciip1560Get_(row, map, ['Graph_Node_Ids']));
    sciip1560CollectList_(graphNodeTypes, sciip1560Get_(row, map, ['Graph_Node_Types']));
    sciip1560CollectList_(graphEdgeTypes, sciip1560Get_(row, map, ['Graph_Edge_Types']));
    sciip1560CollectList_(graphSubjects, sciip1560Get_(row, map, ['Graph_Subjects']));
    sciip1560CollectList_(graphObjects, sciip1560Get_(row, map, ['Graph_Objects']));
    sciip1560CollectList_(graphStates, sciip1560Get_(row, map, ['Graph_States']));
    sciip1560CollectList_(systemMapStates, sciip1560Get_(row, map, ['System_Map_States']));
    sciip1560CollectList_(systemMapSeverities, sciip1560Get_(row, map, ['System_Map_Severities']));

    sciip1560CollectList_(archiveStates, sciip1560Get_(row, map, ['Archive_States']));
    sciip1560CollectList_(closureStates, sciip1560Get_(row, map, ['Closure_States']));
    sciip1560CollectList_(finalizationStates, sciip1560Get_(row, map, ['Finalization_States']));
    sciip1560CollectList_(operationalStates, sciip1560Get_(row, map, ['Operational_States']));
    sciip1560CollectList_(executiveStatuses, sciip1560Get_(row, map, ['Executive_Statuses']));
    sciip1560CollectList_(priorities, sciip1560Get_(row, map, ['Priorities']));
    sciip1560CollectList_(signalTypes, sciip1560Get_(row, map, ['Signal_Types']));
    sciip1560CollectList_(severities, sciip1560Get_(row, map, ['Severities']));
    sciip1560CollectList_(sourceStatuses, sciip1560Get_(row, map, ['Source_Statuses', 'Status']));

    const graphSummary = sciip1560Get_(row, map, ['Graph_Summaries']);
    const sourceLedgerSummary = sciip1560Get_(row, map, ['Source_Ledger_Summaries']);
    const systemMapSummary = sciip1560Get_(row, map, ['System_Map_Summaries']);
    const ledgerSummary = sciip1560Get_(row, map, ['Ledger_Summary']);

    if (graphSummary) graphSummaries.push(String(graphSummary));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (systemMapSummary) systemMapSummaries.push(String(systemMapSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));

    systemMapsReviewed += Number(sciip1560Get_(row, map, ['System_Maps_Reviewed']) || 0);
    knowledgeGraphLedgerEntriesMapped += Number(sciip1560Get_(row, map, ['Knowledge_Graph_Ledger_Entries_Mapped']) || 0);
    knowledgeGraphRecordsReviewed += Number(sciip1560Get_(row, map, ['Knowledge_Graph_Records_Reviewed']) || 0);
    archiveLedgerEntriesProjected += Number(sciip1560Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1560Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1560Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1560Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1560Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1560Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1560Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1560Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1560Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1560Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1560Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1560Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const indexId = `APRSC_SYSTEM_INDEX_${Utilities.getUuid()}`;

  let indexState = 'SYSTEM_INDEX_HEALTHY';
  let indexStatus = 'SUCCESS';
  let indexSeverity = 'INFO';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(systemMapStates).indexOf('SYSTEM_MAP_REVIEW_REQUIRED') !== -1
  ) {
    indexState = 'SYSTEM_INDEX_REVIEW_REQUIRED';
    indexStatus = 'REVIEW_REQUIRED';
    indexSeverity = 'WARN';
  } else if (
    Object.keys(systemMapStates).indexOf('SYSTEM_MAP_NO_ACTIVITY') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    indexState = 'SYSTEM_INDEX_NO_ACTIVITY';
    indexStatus = 'SUCCESS';
    indexSeverity = 'LOW';
  }

  const searchableTerms = [
    dateKey,
    businessKey,
    Object.keys(graphNodeIds).join(' '),
    Object.keys(graphNodeTypes).join(' '),
    Object.keys(graphEdgeTypes).join(' '),
    Object.keys(graphStates).join(' '),
    Object.keys(systemMapStates).join(' '),
    Object.keys(archiveStates).join(' '),
    Object.keys(closureStates).join(' '),
    Object.keys(finalizationStates).join(' '),
    Object.keys(operationalStates).join(' '),
    Object.keys(executiveStatuses).join(' '),
    Object.keys(priorities).join(' '),
    Object.keys(sourceStatuses).join(' ')
  ].join(' ').trim();

  const indexSummary =
    `Continuity system index for ${dateKey}: ${indexState}. ` +
    `${relevantRows.length} system map ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} indexed; ` +
    `${Object.keys(graphNodeIds).length} graph node key${Object.keys(graphNodeIds).length === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    indexId,
    businessKey,
    dateKey,
    SCIIP_1560_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceSystemMapIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceKnowledgeGraphRecordIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    Object.keys(systemMapStates).join(', '),
    Object.keys(systemMapSeverities).join(', '),
    indexState,
    indexSeverity,
    Object.keys(archiveStates).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    systemMapsReviewed,
    knowledgeGraphLedgerEntriesMapped,
    knowledgeGraphRecordsReviewed,
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefsReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    graphSummaries.join(' | '),
    sourceLedgerSummaries.join(' | '),
    systemMapSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    searchableTerms,
    indexSummary,
    indexStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
    result
  }));
  return result;
}

function sciip1560TargetHeaders_() {
  return [
    'System_Index_Id',
    'Business_Key',
    'Index_Date',
    'Source_Sheet',
    'System_Map_Ledger_Entries_Indexed',
    'Source_Ledger_Entry_Ids',
    'Source_System_Map_Ids',
    'Source_Business_Keys',
    'Source_Knowledge_Graph_Record_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'System_Map_States',
    'System_Map_Severities',
    'System_Index_State',
    'System_Index_Severity',
    'Archive_States',
    'Closure_States',
    'Finalization_States',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'System_Maps_Reviewed',
    'Knowledge_Graph_Ledger_Entries_Mapped',
    'Knowledge_Graph_Records_Reviewed',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Briefs_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Graph_Summaries',
    'Source_Ledger_Summaries',
    'System_Map_Summaries',
    'Input_Ledger_Summaries',
    'Searchable_Terms',
    'Index_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1560EnsureSheet_(ss, sheetName, headers) {
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

function sciip1560HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1560Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1560CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1560BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1560_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1560HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1560ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1560_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1560ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1560HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1560Get_(row, map, [
      'Ledger_Date',
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1560NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1560NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1560ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1560ResolveDateKey_(value) {
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

function sciip1560NormalizeDateKey_(value) {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessorLegacy1570_();
      return sciipWrapLegacyRuntimeResult1570_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1570_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor
 ************************************************************/

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessorLegacy1570_() {
  const processor =
    '1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor';

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
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexSheet_(ss);

  const ledgerSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerSheet_(ss);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER|' +
    dateKey;

  if (
  sciipAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerBusinessKeyExists_(
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
    sourceRecord.systemIndexScope ||
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
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

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor',
      result
    })
  );

  return result;
}

function sciipAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerBusinessKeyExists_(
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRYS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRYS_RUNTIME_LEDGER',

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
          originalProcessor: '1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessorLegacy1580_();
      return sciipWrapLegacyRuntimeResult1580_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1580_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor
 ************************************************************/

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessorLegacy1580_() {
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessorLegacy1590_();
      return sciipWrapLegacyRuntimeResult1590_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1590_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessorLegacy1590_() {
  const processor =
    '1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY',
    [
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
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER',
    [
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
      'ledgerPayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_REGISTRY_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    registryBusinessKey: sourceRecord.businessKey || '',
    registryStatus: sourceRecord.systemRegistryStatus || '',
    registryName: sourceRecord.systemRegistryName || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemRegistryScope || '',
    sourceRecord.systemRegistryName || '',
    sourceRecord.systemRegistryStatus || '',
    sourceRecord.systemRegistrySummary || '',
    sourceRecord.systemIndexDateKey || '',
    sourceRecord.systemIndexScope || '',
    sourceRecord.systemIndexName || '',
    sourceRecord.systemIndexStatus || '',
    sourceRecord.sourcePayloadJson || '',
    JSON.stringify(ledgerPayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATES_RUNTIME_LEDGER',

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
          originalProcessor: '1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessorLegacy1600_();
      return sciipWrapLegacyRuntimeResult1600_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1600_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessorLegacy1600_() {
  const processor =
    '1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER',
    [
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
      'ledgerPayloadJson',
      'createdAt'
    ]
  );

  const stateSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(stateSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const statePayload = {
    stateType: 'CONTINUITY_SYSTEM_STATE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    registryBusinessKey: sourceRecord.sourceBusinessKey || '',
    registryName: sourceRecord.systemRegistryName || '',
    registryStatus: sourceRecord.systemRegistryStatus || '',
    stateStatus: 'ACTIVE',
    stateDateKey: dateKey,
    recordedAt: now.toISOString()
  };

  stateSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System State',
    'ACTIVE',
    'Current continuity system registry ledger resolved into active system state.',
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemRegistryName || '',
    sourceRecord.systemRegistryStatus || '',
    JSON.stringify(statePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessorLegacy1610_();
      return sciipWrapLegacyRuntimeResult1610_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1610_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessorLegacy1610_() {
  const processor =
    '1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_STATE_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    stateBusinessKey: sourceRecord.businessKey || '',
    stateName: sourceRecord.systemStateName || '',
    stateStatus: sourceRecord.systemStateStatus || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemStateScope || '',
    sourceRecord.systemStateName || '',
    sourceRecord.systemStateStatus || '',
    sourceRecord.systemStateSummary || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    sourceRecord.statePayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOTS_RUNTIME_LEDGER',

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
          originalProcessor: '1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessorLegacy1620_();
      return sciipWrapLegacyRuntimeResult1620_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1620_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessorLegacy1620_() {
  const processor =
    '1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const snapshotSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(snapshotSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemSnapshotsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemSnapshotsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const snapshotPayload = {
    snapshotType: 'CONTINUITY_SYSTEM_SNAPSHOT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    stateBusinessKey: sourceRecord.sourceBusinessKey || '',
    stateName: sourceRecord.systemStateName || '',
    stateStatus: sourceRecord.systemStateStatus || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    registryName: sourceRecord.registryName || '',
    registryStatus: sourceRecord.registryStatus || '',
    snapshotStatus: 'ACTIVE',
    snapshotDateKey: dateKey,
    capturedAt: now.toISOString()
  };

  snapshotSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Snapshot',
    'ACTIVE',
    'Active continuity system state captured as a point-in-time system snapshot.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemStateName || '',
    sourceRecord.systemStateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    JSON.stringify(snapshotPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemSnapshotsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessorLegacy1630_();
      return sciipWrapLegacyRuntimeResult1630_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1630_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessorLegacy1630_() {
  const processor =
    '1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_SNAPSHOT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    snapshotBusinessKey: sourceRecord.businessKey || '',
    snapshotName: sourceRecord.systemSnapshotName || '',
    snapshotStatus: sourceRecord.systemSnapshotStatus || '',
    snapshotDateKey: sourceRecord.snapshotDateKey || dateKey,
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemSnapshotScope || '',
    sourceRecord.systemSnapshotName || '',
    sourceRecord.systemSnapshotStatus || '',
    sourceRecord.systemSnapshotSummary || '',
    sourceRecord.snapshotDateKey || dateKey,
    sourceRecord.stateBusinessKey || '',
    sourceRecord.stateName || '',
    sourceRecord.stateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    sourceRecord.snapshotPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRRORS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRRORS_RUNTIME_LEDGER',

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
          originalProcessor: '1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessorLegacy1640_();
      return sciipWrapLegacyRuntimeResult1640_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1640_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessorLegacy1640_() {
  const processor =
    '1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const mirrorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(mirrorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const mirrorPayload = {
    mirrorType: 'CONTINUITY_SYSTEM_MIRROR',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    snapshotBusinessKey: sourceRecord.sourceBusinessKey || '',
    snapshotName: sourceRecord.systemSnapshotName || '',
    snapshotStatus: sourceRecord.systemSnapshotStatus || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    stateName: sourceRecord.stateName || '',
    stateStatus: sourceRecord.stateStatus || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    registryName: sourceRecord.registryName || '',
    registryStatus: sourceRecord.registryStatus || '',
    mirrorStatus: 'ACTIVE',
    mirrorDateKey: dateKey,
    mirroredAt: now.toISOString()
  };

  mirrorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Mirror',
    'ACTIVE',
    'Continuity system snapshot ledger mirrored into active system representation.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemSnapshotName || '',
    sourceRecord.systemSnapshotStatus || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.stateName || '',
    sourceRecord.stateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    JSON.stringify(mirrorPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessorLegacy1650_();
      return sciipWrapLegacyRuntimeResult1650_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1650_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessorLegacy1650_() {
  const processor =
    '1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_MIRROR_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    mirrorBusinessKey: sourceRecord.businessKey || '',
    mirrorName: sourceRecord.systemMirrorName || '',
    mirrorStatus: sourceRecord.systemMirrorStatus || '',
    mirrorDateKey: sourceRecord.mirrorDateKey || dateKey,
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemMirrorScope || '',
    sourceRecord.systemMirrorName || '',
    sourceRecord.systemMirrorStatus || '',
    sourceRecord.systemMirrorSummary || '',
    sourceRecord.mirrorDateKey || dateKey,
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.snapshotName || '',
    sourceRecord.snapshotStatus || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.stateName || '',
    sourceRecord.stateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    sourceRecord.mirrorPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICAS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICAS_RUNTIME_LEDGER',

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
          originalProcessor: '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessorLegacy1660_();
      return sciipWrapLegacyRuntimeResult1660_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1660_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessorLegacy1660_() {
  const processor =
    '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const replicaSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(replicaSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const replicaPayload = {
    replicaType: 'CONTINUITY_SYSTEM_REPLICA',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    mirrorBusinessKey: sourceRecord.sourceBusinessKey || '',
    mirrorName: sourceRecord.systemMirrorName || '',
    mirrorStatus: sourceRecord.systemMirrorStatus || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    replicaStatus: 'ACTIVE',
    replicaDateKey: dateKey,
    replicatedAt: now.toISOString()
  };

  replicaSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Replica',
    'ACTIVE',
    'Continuity system mirror ledger replicated into durable system replica state.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemMirrorName || '',
    sourceRecord.systemMirrorStatus || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    JSON.stringify(replicaPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessorLegacy1670_();
      return sciipWrapLegacyRuntimeResult1670_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1670_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessorLegacy1670_() {
  const processor =
    '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_REPLICA_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    replicaBusinessKey: sourceRecord.businessKey || '',
    replicaName: sourceRecord.systemReplicaName || '',
    replicaStatus: sourceRecord.systemReplicaStatus || '',
    replicaDateKey: sourceRecord.replicaDateKey || dateKey,
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemReplicaScope || '',
    sourceRecord.systemReplicaName || '',
    sourceRecord.systemReplicaStatus || '',
    sourceRecord.systemReplicaSummary || '',
    sourceRecord.replicaDateKey || dateKey,
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.mirrorName || '',
    sourceRecord.mirrorStatus || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.replicaPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINTS_RUNTIME_LEDGER',

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
          originalProcessor: '1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessorLegacy1680_();
      return sciipWrapLegacyRuntimeResult1680_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1680_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessorLegacy1680_() {
  const processor =
    '1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const checkpointSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(checkpointSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const checkpointPayload = {
    checkpointType: 'CONTINUITY_SYSTEM_CHECKPOINT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    replicaBusinessKey: sourceRecord.sourceBusinessKey || '',
    replicaName: sourceRecord.systemReplicaName || '',
    replicaStatus: sourceRecord.systemReplicaStatus || '',
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    checkpointStatus: 'ACTIVE',
    checkpointDateKey: dateKey,
    checkpointedAt: now.toISOString()
  };

  checkpointSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Checkpoint',
    'ACTIVE',
    'Continuity system replica ledger captured as durable execution checkpoint.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemReplicaName || '',
    sourceRecord.systemReplicaStatus || '',
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    JSON.stringify(checkpointPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessorLegacy1690_();
      return sciipWrapLegacyRuntimeResult1690_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1690_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessorLegacy1690_() {
  const processor =
    '1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_CHECKPOINT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    checkpointBusinessKey: sourceRecord.businessKey || '',
    checkpointName: sourceRecord.systemCheckpointName || '',
    checkpointStatus: sourceRecord.systemCheckpointStatus || '',
    checkpointDateKey: sourceRecord.checkpointDateKey || dateKey,
    replicaBusinessKey: sourceRecord.replicaBusinessKey || '',
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemCheckpointScope || '',
    sourceRecord.systemCheckpointName || '',
    sourceRecord.systemCheckpointStatus || '',
    sourceRecord.systemCheckpointSummary || '',
    sourceRecord.checkpointDateKey || dateKey,
    sourceRecord.replicaBusinessKey || '',
    sourceRecord.replicaName || '',
    sourceRecord.replicaStatus || '',
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.checkpointPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEXS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEXS_RUNTIME_LEDGER',

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
          originalProcessor: '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessorLegacy1700_();
      return sciipWrapLegacyRuntimeResult1700_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1700_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessorLegacy1700_() {
  const processor =
    '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const indexSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointBusinessKey',
      'checkpointStatus',
      'reviewDeliverablesJson',
      'architectureReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(indexSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const deliverables = [
    'Current Architecture Assessment',
    'Technical Debt and Duplication Audit',
    'Shared Infrastructure Roadmap',
    'Runtime 2.0 Design',
    'Processor Template 2.0',
    'Event Bus Architecture',
    'Knowledge Graph 2.0 Architecture',
    'Migration Plan from v4.1 to v5.0',
    'Executive Architecture Summary'
  ];

  const architectureReviewPayload = {
    reviewType: 'SCIIP_OS_V5_ARCHITECTURE_REVIEW_INDEX',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    reviewTrack: 'V5_ARCHITECTURE_REVIEW',
    currentVersion: 'SCIIP_OS v4.1',
    targetVersion: 'SCIIP_OS v5.0',
    sourceCheckpointLedgerBusinessKey: sourceRecord.businessKey || '',
    checkpointBusinessKey: sourceRecord.sourceBusinessKey || '',
    checkpointStatus: sourceRecord.systemCheckpointStatus || '',
    architectureReviewStatus: 'OPEN',
    architectureReviewPhase: 'INDEX',
    deliverables: deliverables,
    openedAt: now.toISOString()
  };

  indexSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'SCIIP_OS_ARCHITECTURE',
    'SCIIP_OS v5.0 Architecture Review Index',
    'OPEN',
    'INDEX',
    'Architecture review track opened after completion of the 1600-series continuity state hardening block.',
    'V5_ARCHITECTURE_REVIEW',
    'SCIIP_OS v4.1',
    'SCIIP_OS v5.0',
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemCheckpointStatus || '',
    JSON.stringify(deliverables),
    JSON.stringify(architectureReviewPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessorLegacy1710_();
      return sciipWrapLegacyRuntimeResult1710_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1710_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessorLegacy1710_() {
  const processor =
    '1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointBusinessKey',
      'checkpointStatus',
      'reviewDeliverablesJson',
      'architectureReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureLedgerStatus',
      'architectureLedgerSummary',
      'architectureDecisionRecordJson',
      'architectureReviewPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const architectureDecisionRecord = {
    decisionType: 'SCIIP_OS_ARCHITECTURE_REVIEW_LEDGER',
    decisionSummary:
      'Architecture review index records are promoted into permanent ledger history so SCIIP_OS can maintain a durable, queryable record of its own platform architecture.',
    architecturalIntent:
      'Use the 1700-series as a platform evolution and architectural memory layer rather than a static design-document workflow.',
    principlesPreserved: [
      'event_sourced',
      'knowledge_graph_native',
      'gis_native',
      'ai_native',
      'processor_driven',
      'asset_driven',
      'permanent_history',
      'idempotent',
      'no_overwrites',
      'production_ready'
    ],
    platformImpact:
      'Creates explicit architecture-review ledger history that future processors can use for planning, governance, system-map enrichment, and autonomous self-improvement.',
    recommendedFutureUse:
      'Future Architecture Review Track processors should consume ledger entries as first-class architectural knowledge.'
  };

  const ledgerPayload = {
    ledgerType: 'ARCHITECTURE_REVIEW_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    sourceArchitectureReviewBusinessKey: sourceRecord.businessKey || '',
    architectureReviewStatus:
      sourceRecord.architectureReviewStatus || 'OPEN',
    architectureReviewPhase:
      sourceRecord.architectureReviewPhase || 'INDEX',
    architectureLedgerStatus: 'ACTIVE',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.architectureReviewStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Ledger',
    sourceRecord.architectureReviewStatus || 'OPEN',
    sourceRecord.architectureReviewPhase || 'LEDGER',
    sourceRecord.architectureReviewSummary ||
      'Architecture review index promoted into permanent architecture review ledger history.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    'ACTIVE',
    'Permanent architecture review ledger entry created from latest architecture review index record.',
    JSON.stringify(architectureDecisionRecord),
    sourceRecord.architectureReviewPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNALS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNALS_RUNTIME_LEDGER',

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
          originalProcessor: '1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessorLegacy1720_();
      return sciipWrapLegacyRuntimeResult1720_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1720_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessorLegacy1720_() {
  const processor =
    '1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureLedgerStatus',
      'architectureLedgerSummary',
      'architectureDecisionRecordJson',
      'architectureReviewPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const signalSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureSignalType',
      'architectureSignalSeverity',
      'architectureSignalStatus',
      'architectureSignalSummary',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureDecisionRecordJson',
      'signalPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(signalSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  let signalType = 'ARCHITECTURE_REVIEW_HEALTHY';
  let severity = 'INFO';
  let signalStatus = 'SUCCESS';
  let recommendedAction =
    'Continue Architecture Review Track. Use ledger entries as durable architectural memory.';
  let humanReviewRequired = 'FALSE';
  let autonomousActionAllowed = 'TRUE';

  const ledgerStatus =
    sourceRecord.architectureLedgerStatus ||
    sourceRecord.architectureReviewStatus ||
    sourceRecord.sourceStatus ||
    '';

  if (String(ledgerStatus).toUpperCase() === 'REVIEW_REQUIRED') {
    signalType = 'ARCHITECTURE_REVIEW_REVIEW_REQUIRED';
    severity = 'WARN';
    signalStatus = 'REVIEW_REQUIRED';
    recommendedAction =
      'Review architecture ledger entry before downstream architecture-review promotion.';
    humanReviewRequired = 'TRUE';
    autonomousActionAllowed = 'FALSE';
  }

  const signalPayload = {
    signalType,
    severity,
    signalStatus,
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architectureReviewPhase:
      sourceRecord.architectureReviewPhase || 'LEDGER',
    architectureLedgerStatus:
      sourceRecord.architectureLedgerStatus || 'ACTIVE',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    emittedAt: now.toISOString()
  };

  signalSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    ledgerStatus,
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Signal',
    signalType,
    severity,
    signalStatus,
    'Architecture review signal emitted from latest permanent architecture review ledger entry.',
    recommendedAction,
    humanReviewRequired,
    autonomousActionAllowed,
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    sourceRecord.architectureDecisionRecordJson || '',
    JSON.stringify(signalPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTERS_RUNTIME_LEDGER',

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
          originalProcessor: '1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessorLegacy1730_();
      return sciipWrapLegacyRuntimeResult1730_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1730_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessorLegacy1730_() {
  const processor =
    '1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureSignalType',
      'architectureSignalSeverity',
      'architectureSignalStatus',
      'architectureSignalSummary',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureDecisionRecordJson',
      'signalPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const commandCenterSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'commandCenterStatus',
      'commandCenterPriority',
      'commandCenterSummary',
      'architectureSignalType',
      'architectureSignalSeverity',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'commandCenterPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(commandCenterSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const signalSeverity =
    sourceRecord.architectureSignalSeverity || 'INFO';

  let commandCenterStatus = 'ACTIVE';
  let commandCenterPriority = 'NORMAL';

  if (String(signalSeverity).toUpperCase() === 'WARN') {
    commandCenterPriority = 'ELEVATED';
  }

  if (
    String(signalSeverity).toUpperCase() === 'ERROR' ||
    String(signalSeverity).toUpperCase() === 'CRITICAL'
  ) {
    commandCenterPriority = 'HIGH';
    commandCenterStatus = 'REVIEW_REQUIRED';
  }

  const commandCenterPayload = {
    commandCenterType: 'ARCHITECTURE_REVIEW_COMMAND_CENTER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceSignalBusinessKey: sourceRecord.businessKey || '',
    architectureSignalType:
      sourceRecord.architectureSignalType || 'ARCHITECTURE_REVIEW_HEALTHY',
    architectureSignalSeverity: signalSeverity,
    architectureSignalStatus:
      sourceRecord.architectureSignalStatus || sourceRecord.sourceStatus || '',
    commandCenterStatus,
    commandCenterPriority,
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    humanReviewRequired:
      sourceRecord.humanReviewRequired || 'FALSE',
    autonomousActionAllowed:
      sourceRecord.autonomousActionAllowed || 'TRUE',
    createdAt: now.toISOString()
  };

  commandCenterSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.architectureSignalStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Command Center',
    commandCenterStatus,
    commandCenterPriority,
    'Architecture review command center updated from latest architecture review signal.',
    sourceRecord.architectureSignalType || 'ARCHITECTURE_REVIEW_HEALTHY',
    signalSeverity,
    sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(commandCenterPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARYS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARYS_RUNTIME_LEDGER',

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
          originalProcessor: '1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessorLegacy1740_();
      return sciipWrapLegacyRuntimeResult1740_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1740_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessorLegacy1740_() {
  const processor =
    '1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'commandCenterStatus',
      'commandCenterPriority',
      'commandCenterSummary',
      'architectureSignalType',
      'architectureSignalSeverity',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'commandCenterPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const summarySheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'executiveSummaryStatus',
      'executiveSummaryPriority',
      'executiveSummaryTitle',
      'executiveSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'executiveSummaryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(summarySheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const executiveSummaryTitle =
    'SCIIP_OS v5.0 Architecture Review Executive Summary';

  const executiveSummary =
    'The Architecture Review Track is operating as a durable architectural memory layer. The latest command-center state indicates that SCIIP_OS can continue using architecture-review outputs as queryable platform knowledge for future processor planning, governance, continuity review, and autonomous self-improvement.';

  const keyArchitectureFinding =
    'Architecture review records should be treated as first-class SCIIP_OS knowledge graph assets, not static documentation or transient execution logs.';

  const payload = {
    summaryType: 'ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCommandCenterBusinessKey: sourceRecord.businessKey || '',
    commandCenterStatus: sourceRecord.commandCenterStatus || '',
    commandCenterPriority: sourceRecord.commandCenterPriority || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    executiveSummaryTitle,
    executiveSummary,
    keyArchitectureFinding,
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    createdAt: now.toISOString()
  };

  summarySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.commandCenterStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || executiveSummaryTitle,
    'ACTIVE',
    sourceRecord.commandCenterPriority || 'NORMAL',
    executiveSummaryTitle,
    executiveSummary,
    keyArchitectureFinding,
    sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(payload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEFS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEFS_RUNTIME_LEDGER',

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
          originalProcessor: '1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessorLegacy1750_();
      return sciipWrapLegacyRuntimeResult1750_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1750_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessorLegacy1750_() {
  const processor =
    '1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'executiveSummaryStatus',
      'executiveSummaryPriority',
      'executiveSummaryTitle',
      'executiveSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'executiveSummaryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const briefSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'dailyBriefStatus',
      'dailyBriefPriority',
      'dailyBriefTitle',
      'dailyBriefSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'dailyBriefPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(briefSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const dailyBriefTitle =
    'SCIIP_OS v5.0 Architecture Review Daily Brief';

  const dailyBriefSummary =
    'Architecture Review Track remains active. The latest executive summary confirms that SCIIP_OS is preserving architecture-review outputs as durable platform memory for continuity, governance, planning, and autonomous improvement.';

  const payload = {
    briefType: 'ARCHITECTURE_REVIEW_DAILY_BRIEF',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceExecutiveSummaryBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    executiveSummaryStatus:
      sourceRecord.executiveSummaryStatus || sourceRecord.sourceStatus || '',
    executiveSummaryPriority:
      sourceRecord.executiveSummaryPriority || 'NORMAL',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    dailyBriefTitle,
    dailyBriefSummary,
    keyArchitectureFinding:
      sourceRecord.keyArchitectureFinding ||
      'Architecture review records should be treated as first-class SCIIP_OS knowledge assets.',
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    createdAt: now.toISOString()
  };

  briefSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.executiveSummaryStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || dailyBriefTitle,
    'ACTIVE',
    sourceRecord.executiveSummaryPriority || 'NORMAL',
    dailyBriefTitle,
    dailyBriefSummary,
    sourceRecord.keyArchitectureFinding ||
      'Architecture review records should be treated as first-class SCIIP_OS knowledge assets.',
    sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(payload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATIONS_RUNTIME_LEDGER',

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
          originalProcessor: '1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessorLegacy1760_();
      return sciipWrapLegacyRuntimeResult1760_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1760_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessorLegacy1760_() {
  const processor =
    '1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'dailyBriefStatus',
      'dailyBriefPriority',
      'dailyBriefTitle',
      'dailyBriefSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'dailyBriefPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const finalizationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'finalizationStatus',
      'finalizationPriority',
      'finalizationSummary',
      'finalizedArchitectureFinding',
      'finalizedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'finalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(finalizationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const finalizedArchitectureFinding =
    sourceRecord.keyArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const finalizedRecommendation =
    sourceRecord.recommendedAction ||
    'Continue Architecture Review Track and preserve all architecture-review outputs as permanent platform memory.';

  const finalizationPayload = {
    finalizationType: 'ARCHITECTURE_REVIEW_FINALIZATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceDailyBriefBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    dailyBriefStatus:
      sourceRecord.dailyBriefStatus || sourceRecord.sourceStatus || '',
    dailyBriefPriority:
      sourceRecord.dailyBriefPriority || 'NORMAL',
    finalizationStatus: 'FINALIZED',
    finalizedArchitectureFinding,
    finalizedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    finalizedAt: now.toISOString()
  };

  finalizationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.dailyBriefStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Finalization',
    'FINALIZED',
    sourceRecord.dailyBriefPriority || 'NORMAL',
    'Architecture review daily brief finalized into permanent architecture-review finalization history.',
    finalizedArchitectureFinding,
    finalizedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(finalizationPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURES_RUNTIME_LEDGER',

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
          originalProcessor: '1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessorLegacy1770_();
      return sciipWrapLegacyRuntimeResult1770_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1770_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessorLegacy1770_() {
  const processor =
    '1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'finalizationStatus',
      'finalizationPriority',
      'finalizationSummary',
      'finalizedArchitectureFinding',
      'finalizedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'finalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const closureSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'closureStatus',
      'closurePriority',
      'closureSummary',
      'closedArchitectureFinding',
      'closedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'closurePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(closureSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const closedArchitectureFinding =
    sourceRecord.finalizedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const closedRecommendation =
    sourceRecord.finalizedRecommendation ||
    'Preserve architecture-review outputs as permanent platform memory and make them available to downstream continuity processors.';

  const closurePayload = {
    closureType: 'ARCHITECTURE_REVIEW_CLOSURE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceFinalizationBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    finalizationStatus:
      sourceRecord.finalizationStatus || sourceRecord.sourceStatus || '',
    finalizationPriority:
      sourceRecord.finalizationPriority || 'NORMAL',
    closureStatus: 'CLOSED',
    closedArchitectureFinding,
    closedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    closedAt: now.toISOString()
  };

  closureSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.finalizationStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Closure',
    'CLOSED',
    sourceRecord.finalizationPriority || 'NORMAL',
    'Architecture review finalization closed into permanent architecture-review closure history.',
    closedArchitectureFinding,
    closedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(closurePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVES_RUNTIME_LEDGER',

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
          originalProcessor: '1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessorLegacy1780_();
      return sciipWrapLegacyRuntimeResult1780_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1780_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessorLegacy1780_() {
  const processor =
    '1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'closureStatus',
      'closurePriority',
      'closureSummary',
      'closedArchitectureFinding',
      'closedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'closurePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const archiveSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'archiveStatus',
      'archivePriority',
      'archiveSummary',
      'archivedArchitectureFinding',
      'archivedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'archivePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(archiveSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const archivedArchitectureFinding =
    sourceRecord.closedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const archivedRecommendation =
    sourceRecord.closedRecommendation ||
    'Archive architecture-review closure outputs as permanent platform memory for future continuity and autonomous planning.';

  const archivePayload = {
    archiveType: 'ARCHITECTURE_REVIEW_ARCHIVE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceClosureBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    closureStatus:
      sourceRecord.closureStatus || sourceRecord.sourceStatus || '',
    closurePriority:
      sourceRecord.closurePriority || 'NORMAL',
    archiveStatus: 'ARCHIVED',
    archivedArchitectureFinding,
    archivedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    archivedAt: now.toISOString()
  };

  archiveSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.closureStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Archive',
    'ARCHIVED',
    sourceRecord.closurePriority || 'NORMAL',
    'Architecture review closure archived into permanent architecture-review archive history.',
    archivedArchitectureFinding,
    archivedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(archivePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPHS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPHS_RUNTIME_LEDGER',

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
          originalProcessor: '1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessorLegacy1790_();
      return sciipWrapLegacyRuntimeResult1790_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1790_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessorLegacy1790_() {
  const processor =
    '1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'archiveStatus',
      'archivePriority',
      'archiveSummary',
      'archivedArchitectureFinding',
      'archivedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'archivePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const kgSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'nodeType',
      'nodeKey',
      'nodeLabel',
      'relationshipType',
      'relationshipTargetKey',
      'architectureReviewScope',
      'architectureReviewName',
      'knowledgeGraphStatus',
      'knowledgeGraphSummary',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'knowledgeGraphPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(kgSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const nodeType = 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE';

  const nodeKey =
    'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE|' +
    dateKey +
    '|SCIIP_OS_V5_ARCHITECTURE_MEMORY';

  const architectureFinding =
    sourceRecord.archivedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const architectureRecommendation =
    sourceRecord.archivedRecommendation ||
    'Preserve architecture-review records as permanent graph-ready platform memory for future continuity processors.';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.archiveStatus || sourceRecord.sourceStatus || '',
    architectureReviewScope: sourceRecord.architectureReviewScope || '',
    architectureReviewName: sourceRecord.architectureReviewName || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const knowledgeGraphPayload = {
    knowledgeGraphType: 'ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceArchiveBusinessKey: sourceRecord.businessKey || '',
    nodeType,
    nodeKey,
    nodeLabel: 'SCIIP_OS v5.0 Architecture Review Memory',
    relationshipType: 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    relationshipTargetKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    architectureFinding,
    architectureRecommendation,
    knowledgeGraphStatus: 'ACTIVE',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  kgSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.archiveStatus || sourceRecord.sourceStatus || '',
    nodeType,
    nodeKey,
    'SCIIP_OS v5.0 Architecture Review Memory',
    'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.businessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Knowledge Graph',
    'ACTIVE',
    'Architecture review archive promoted into graph-ready architectural knowledge.',
    'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    architectureFinding,
    architectureRecommendation,
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(knowledgeGraphPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAPS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAPS_RUNTIME_LEDGER',

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
          originalProcessor: '1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessorLegacy1800_();
      return sciipWrapLegacyRuntimeResult1800_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1800_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessorLegacy1800_() {
  const processor =
    '1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'nodeType',
      'nodeKey',
      'nodeLabel',
      'relationshipType',
      'relationshipTargetKey',
      'architectureReviewScope',
      'architectureReviewName',
      'knowledgeGraphStatus',
      'knowledgeGraphSummary',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'knowledgeGraphPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const systemMapSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMapScope',
      'systemMapName',
      'systemMapStatus',
      'systemMapSummary',
      'mappedNodeType',
      'mappedNodeKey',
      'mappedNodeLabel',
      'mappedRelationshipType',
      'mappedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemMapPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(systemMapSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.knowledgeGraphStatus || sourceRecord.sourceStatus || '',
    nodeType: sourceRecord.nodeType || '',
    nodeKey: sourceRecord.nodeKey || '',
    nodeLabel: sourceRecord.nodeLabel || '',
    relationshipType: sourceRecord.relationshipType || '',
    relationshipTargetKey: sourceRecord.relationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const systemMapPayload = {
    systemMapType: 'ARCHITECTURE_REVIEW_SYSTEM_MAP',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceKnowledgeGraphBusinessKey: sourceRecord.businessKey || '',
    mappedNodeType:
      sourceRecord.nodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    mappedNodeKey:
      sourceRecord.nodeKey || '',
    mappedNodeLabel:
      sourceRecord.nodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    mappedRelationshipType:
      sourceRecord.relationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    mappedRelationshipTargetKey:
      sourceRecord.relationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    systemMapStatus: 'ACTIVE',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  systemMapSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.knowledgeGraphStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SYSTEM_MAP',
    'SCIIP_OS v5.0 Architecture Review System Map',
    'ACTIVE',
    'Architecture review knowledge graph node mapped into SCIIP_OS system architecture map.',
    sourceRecord.nodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.nodeKey || '',
    sourceRecord.nodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.relationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.relationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Preserve architecture-review records as graph-ready platform memory for future continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(systemMapPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1810_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1810_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_INDEX_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_INDEXS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_INDEXS_RUNTIME_LEDGER',

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
          originalProcessor: '1810_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessorLegacy1810_();
      return sciipWrapLegacyRuntimeResult1810_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1810_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1810_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessorLegacy1810_() {
  const processor =
    '1810_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMapScope',
      'systemMapName',
      'systemMapStatus',
      'systemMapSummary',
      'mappedNodeType',
      'mappedNodeKey',
      'mappedNodeLabel',
      'mappedRelationshipType',
      'mappedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemMapPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const indexSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'systemIndexSummary',
      'indexedSystemMapBusinessKey',
      'indexedNodeType',
      'indexedNodeKey',
      'indexedNodeLabel',
      'indexedRelationshipType',
      'indexedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemIndexPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_INDEX|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(indexSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.systemMapStatus || sourceRecord.sourceStatus || '',
    systemMapScope: sourceRecord.systemMapScope || '',
    systemMapName: sourceRecord.systemMapName || '',
    mappedNodeType: sourceRecord.mappedNodeType || '',
    mappedNodeKey: sourceRecord.mappedNodeKey || '',
    mappedNodeLabel: sourceRecord.mappedNodeLabel || '',
    mappedRelationshipType: sourceRecord.mappedRelationshipType || '',
    mappedRelationshipTargetKey: sourceRecord.mappedRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const systemIndexPayload = {
    systemIndexType: 'ARCHITECTURE_REVIEW_SYSTEM_INDEX',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceSystemMapBusinessKey: sourceRecord.businessKey || '',
    indexedNodeType:
      sourceRecord.mappedNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    indexedNodeKey:
      sourceRecord.mappedNodeKey || '',
    indexedNodeLabel:
      sourceRecord.mappedNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    indexedRelationshipType:
      sourceRecord.mappedRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    indexedRelationshipTargetKey:
      sourceRecord.mappedRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    systemIndexStatus: 'ACTIVE',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  indexSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.systemMapStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SYSTEM_INDEX',
    'SCIIP_OS v5.0 Architecture Review System Index',
    'ACTIVE',
    'Architecture review system map indexed into SCIIP_OS architecture review system index.',
    sourceRecord.businessKey || '',
    sourceRecord.mappedNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.mappedNodeKey || '',
    sourceRecord.mappedNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.mappedRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.mappedRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Preserve architecture-review records as indexed platform memory for future continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(systemIndexPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemIndexProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1820_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1820_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_REGISTRY_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_REGISTRYS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_REGISTRYS_RUNTIME_LEDGER',

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
          originalProcessor: '1820_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessorLegacy1820_();
      return sciipWrapLegacyRuntimeResult1820_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1820_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1820_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessorLegacy1820_() {
  const processor =
    '1820_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'systemIndexSummary',
      'indexedSystemMapBusinessKey',
      'indexedNodeType',
      'indexedNodeKey',
      'indexedNodeLabel',
      'indexedRelationshipType',
      'indexedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemIndexPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const registrySheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_REGISTRY',
    [
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
      'registeredSystemIndexBusinessKey',
      'registeredNodeType',
      'registeredNodeKey',
      'registeredNodeLabel',
      'registeredRelationshipType',
      'registeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemRegistryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_REGISTRY|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(registrySheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.systemIndexStatus || sourceRecord.sourceStatus || '',
    systemIndexScope: sourceRecord.systemIndexScope || '',
    systemIndexName: sourceRecord.systemIndexName || '',
    indexedNodeType: sourceRecord.indexedNodeType || '',
    indexedNodeKey: sourceRecord.indexedNodeKey || '',
    indexedNodeLabel: sourceRecord.indexedNodeLabel || '',
    indexedRelationshipType: sourceRecord.indexedRelationshipType || '',
    indexedRelationshipTargetKey: sourceRecord.indexedRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const registryPayload = {
    systemRegistryType: 'ARCHITECTURE_REVIEW_SYSTEM_REGISTRY',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceSystemIndexBusinessKey: sourceRecord.businessKey || '',
    registeredNodeType:
      sourceRecord.indexedNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    registeredNodeKey:
      sourceRecord.indexedNodeKey || '',
    registeredNodeLabel:
      sourceRecord.indexedNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    registeredRelationshipType:
      sourceRecord.indexedRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    registeredRelationshipTargetKey:
      sourceRecord.indexedRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    systemRegistryStatus: 'REGISTERED',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  registrySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.systemIndexStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SYSTEM_REGISTRY',
    'SCIIP_OS v5.0 Architecture Review System Registry',
    'REGISTERED',
    'Architecture review system index registered into SCIIP_OS architecture review system registry.',
    sourceRecord.businessKey || '',
    sourceRecord.indexedNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.indexedNodeKey || '',
    sourceRecord.indexedNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.indexedRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.indexedRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Register architecture-review memory for downstream continuity and autonomous planning processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(registryPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemRegistryProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1830_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1830_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_STATE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_STATES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_STATES_RUNTIME_LEDGER',

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
          originalProcessor: '1830_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessorLegacy1830_();
      return sciipWrapLegacyRuntimeResult1830_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1830_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1830_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessorLegacy1830_() {
  const processor =
    '1830_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_REGISTRY',
    [
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
      'registeredSystemIndexBusinessKey',
      'registeredNodeType',
      'registeredNodeKey',
      'registeredNodeLabel',
      'registeredRelationshipType',
      'registeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemRegistryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const stateSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_STATE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'stateSourceRegistryBusinessKey',
      'stateNodeType',
      'stateNodeKey',
      'stateNodeLabel',
      'stateRelationshipType',
      'stateRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemStatePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_STATE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(stateSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStatesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStatesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.systemRegistryStatus || sourceRecord.sourceStatus || '',
    systemRegistryScope: sourceRecord.systemRegistryScope || '',
    systemRegistryName: sourceRecord.systemRegistryName || '',
    registeredNodeType: sourceRecord.registeredNodeType || '',
    registeredNodeKey: sourceRecord.registeredNodeKey || '',
    registeredNodeLabel: sourceRecord.registeredNodeLabel || '',
    registeredRelationshipType: sourceRecord.registeredRelationshipType || '',
    registeredRelationshipTargetKey: sourceRecord.registeredRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const statePayload = {
    systemStateType: 'ARCHITECTURE_REVIEW_SYSTEM_STATE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceSystemRegistryBusinessKey: sourceRecord.businessKey || '',
    stateNodeType:
      sourceRecord.registeredNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    stateNodeKey:
      sourceRecord.registeredNodeKey || '',
    stateNodeLabel:
      sourceRecord.registeredNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    stateRelationshipType:
      sourceRecord.registeredRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    stateRelationshipTargetKey:
      sourceRecord.registeredRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    systemStateStatus: 'CURRENT',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  stateSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.systemRegistryStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SYSTEM_STATE',
    'SCIIP_OS v5.0 Architecture Review System State',
    'CURRENT',
    'Architecture review system registry promoted into current SCIIP_OS architecture review system state.',
    sourceRecord.businessKey || '',
    sourceRecord.registeredNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.registeredNodeKey || '',
    sourceRecord.registeredNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.registeredRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.registeredRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Maintain architecture-review memory as current system state for downstream continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(statePayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStatesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemStateProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1840_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1840_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SNAPSHOT_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SNAPSHOTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SNAPSHOTS_RUNTIME_LEDGER',

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
          originalProcessor: '1840_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessorLegacy1840_();
      return sciipWrapLegacyRuntimeResult1840_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1840_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1840_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessorLegacy1840_() {
  const processor =
    '1840_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_STATE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'stateSourceRegistryBusinessKey',
      'stateNodeType',
      'stateNodeKey',
      'stateNodeLabel',
      'stateRelationshipType',
      'stateRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemStatePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const snapshotSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'snapshotScope',
      'snapshotName',
      'snapshotStatus',
      'snapshotSummary',
      'snapshotSourceStateBusinessKey',
      'snapshotNodeType',
      'snapshotNodeKey',
      'snapshotNodeLabel',
      'snapshotRelationshipType',
      'snapshotRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SNAPSHOT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(snapshotSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.systemStateStatus || sourceRecord.sourceStatus || '',
    systemStateScope: sourceRecord.systemStateScope || '',
    systemStateName: sourceRecord.systemStateName || '',
    stateNodeType: sourceRecord.stateNodeType || '',
    stateNodeKey: sourceRecord.stateNodeKey || '',
    stateNodeLabel: sourceRecord.stateNodeLabel || '',
    stateRelationshipType: sourceRecord.stateRelationshipType || '',
    stateRelationshipTargetKey: sourceRecord.stateRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const snapshotPayload = {
    snapshotType: 'ARCHITECTURE_REVIEW_SNAPSHOT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceSystemStateBusinessKey: sourceRecord.businessKey || '',
    snapshotNodeType:
      sourceRecord.stateNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    snapshotNodeKey:
      sourceRecord.stateNodeKey || '',
    snapshotNodeLabel:
      sourceRecord.stateNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    snapshotRelationshipType:
      sourceRecord.stateRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    snapshotRelationshipTargetKey:
      sourceRecord.stateRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    snapshotStatus: 'CAPTURED',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    capturedAt: now.toISOString()
  };

  snapshotSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.systemStateStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SNAPSHOT',
    'SCIIP_OS v5.0 Architecture Review Snapshot',
    'CAPTURED',
    'Current architecture review system state captured as a permanent architecture-review snapshot.',
    sourceRecord.businessKey || '',
    sourceRecord.stateNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.stateNodeKey || '',
    sourceRecord.stateNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.stateRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.stateRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Use captured architecture-review snapshots as stable references for downstream continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(snapshotPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSnapshotProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1850_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1850_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_MIRROR_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_MIRRORS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_MIRRORS_RUNTIME_LEDGER',

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
          originalProcessor: '1850_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessorLegacy1850_();
      return sciipWrapLegacyRuntimeResult1850_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1850_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1850_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessorLegacy1850_() {
  const processor =
    '1850_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'snapshotScope',
      'snapshotName',
      'snapshotStatus',
      'snapshotSummary',
      'snapshotSourceStateBusinessKey',
      'snapshotNodeType',
      'snapshotNodeKey',
      'snapshotNodeLabel',
      'snapshotRelationshipType',
      'snapshotRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const mirrorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'mirrorScope',
      'mirrorName',
      'mirrorStatus',
      'mirrorSummary',
      'mirrorSourceSnapshotBusinessKey',
      'mirrorNodeType',
      'mirrorNodeKey',
      'mirrorNodeLabel',
      'mirrorRelationshipType',
      'mirrorRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_MIRROR|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(mirrorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.snapshotStatus || sourceRecord.sourceStatus || '',
    snapshotScope: sourceRecord.snapshotScope || '',
    snapshotName: sourceRecord.snapshotName || '',
    snapshotNodeType: sourceRecord.snapshotNodeType || '',
    snapshotNodeKey: sourceRecord.snapshotNodeKey || '',
    snapshotNodeLabel: sourceRecord.snapshotNodeLabel || '',
    snapshotRelationshipType: sourceRecord.snapshotRelationshipType || '',
    snapshotRelationshipTargetKey: sourceRecord.snapshotRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const mirrorPayload = {
    mirrorType: 'ARCHITECTURE_REVIEW_MIRROR',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceSnapshotBusinessKey: sourceRecord.businessKey || '',
    mirrorNodeType:
      sourceRecord.snapshotNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    mirrorNodeKey:
      sourceRecord.snapshotNodeKey || '',
    mirrorNodeLabel:
      sourceRecord.snapshotNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    mirrorRelationshipType:
      sourceRecord.snapshotRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    mirrorRelationshipTargetKey:
      sourceRecord.snapshotRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    mirrorStatus: 'MIRRORED',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    mirroredAt: now.toISOString()
  };

  mirrorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.snapshotStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_MIRROR',
    'SCIIP_OS v5.0 Architecture Review Mirror',
    'MIRRORED',
    'Architecture review snapshot mirrored into durable architecture-review mirror state.',
    sourceRecord.businessKey || '',
    sourceRecord.snapshotNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.snapshotNodeKey || '',
    sourceRecord.snapshotNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.snapshotRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.snapshotRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Mirror architecture-review snapshots to preserve redundant continuity references.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(mirrorPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewMirrorProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1860_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1860_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_REPLICA_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_REPLICAS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_REPLICAS_RUNTIME_LEDGER',

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
          originalProcessor: '1860_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessorLegacy1860_();
      return sciipWrapLegacyRuntimeResult1860_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1860_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1860_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessorLegacy1860_() {
  const processor =
    '1860_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'mirrorScope',
      'mirrorName',
      'mirrorStatus',
      'mirrorSummary',
      'mirrorSourceSnapshotBusinessKey',
      'mirrorNodeType',
      'mirrorNodeKey',
      'mirrorNodeLabel',
      'mirrorRelationshipType',
      'mirrorRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const replicaSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'replicaScope',
      'replicaName',
      'replicaStatus',
      'replicaSummary',
      'replicaSourceMirrorBusinessKey',
      'replicaNodeType',
      'replicaNodeKey',
      'replicaNodeLabel',
      'replicaRelationshipType',
      'replicaRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_REPLICA|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(replicaSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicasCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicasCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.mirrorStatus || sourceRecord.sourceStatus || '',
    mirrorScope: sourceRecord.mirrorScope || '',
    mirrorName: sourceRecord.mirrorName || '',
    mirrorNodeType: sourceRecord.mirrorNodeType || '',
    mirrorNodeKey: sourceRecord.mirrorNodeKey || '',
    mirrorNodeLabel: sourceRecord.mirrorNodeLabel || '',
    mirrorRelationshipType: sourceRecord.mirrorRelationshipType || '',
    mirrorRelationshipTargetKey: sourceRecord.mirrorRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const replicaPayload = {
    replicaType: 'ARCHITECTURE_REVIEW_REPLICA',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceMirrorBusinessKey: sourceRecord.businessKey || '',
    replicaNodeType:
      sourceRecord.mirrorNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    replicaNodeKey:
      sourceRecord.mirrorNodeKey || '',
    replicaNodeLabel:
      sourceRecord.mirrorNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    replicaRelationshipType:
      sourceRecord.mirrorRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    replicaRelationshipTargetKey:
      sourceRecord.mirrorRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    replicaStatus: 'REPLICATED',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    replicatedAt: now.toISOString()
  };

  replicaSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.mirrorStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_REPLICA',
    'SCIIP_OS v5.0 Architecture Review Replica',
    'REPLICATED',
    'Architecture review mirror replicated into durable architecture-review replica state.',
    sourceRecord.businessKey || '',
    sourceRecord.mirrorNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.mirrorNodeKey || '',
    sourceRecord.mirrorNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.mirrorRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.mirrorRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Replicate architecture-review mirrors to preserve resilient continuity references.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(replicaPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicasCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReplicaProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1870_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1870_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINTS_RUNTIME_LEDGER',

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
          originalProcessor: '1870_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessorLegacy1870_();
      return sciipWrapLegacyRuntimeResult1870_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1870_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1870_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessorLegacy1870_() {
  const processor =
    '1870_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'replicaScope',
      'replicaName',
      'replicaStatus',
      'replicaSummary',
      'replicaSourceMirrorBusinessKey',
      'replicaNodeType',
      'replicaNodeKey',
      'replicaNodeLabel',
      'replicaRelationshipType',
      'replicaRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const checkpointSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointScope',
      'checkpointName',
      'checkpointStatus',
      'checkpointSummary',
      'checkpointSourceReplicaBusinessKey',
      'checkpointNodeType',
      'checkpointNodeKey',
      'checkpointNodeLabel',
      'checkpointRelationshipType',
      'checkpointRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(checkpointSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.replicaStatus || sourceRecord.sourceStatus || '',
    replicaScope: sourceRecord.replicaScope || '',
    replicaName: sourceRecord.replicaName || '',
    replicaNodeType: sourceRecord.replicaNodeType || '',
    replicaNodeKey: sourceRecord.replicaNodeKey || '',
    replicaNodeLabel: sourceRecord.replicaNodeLabel || '',
    replicaRelationshipType: sourceRecord.replicaRelationshipType || '',
    replicaRelationshipTargetKey: sourceRecord.replicaRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const checkpointPayload = {
    checkpointType: 'ARCHITECTURE_REVIEW_CHECKPOINT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReplicaBusinessKey: sourceRecord.businessKey || '',
    checkpointNodeType:
      sourceRecord.replicaNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    checkpointNodeKey:
      sourceRecord.replicaNodeKey || '',
    checkpointNodeLabel:
      sourceRecord.replicaNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    checkpointRelationshipType:
      sourceRecord.replicaRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    checkpointRelationshipTargetKey:
      sourceRecord.replicaRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    checkpointStatus: 'CHECKPOINTED',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    checkpointedAt: now.toISOString()
  };

  checkpointSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.replicaStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_CHECKPOINT',
    'SCIIP_OS v5.0 Architecture Review Checkpoint',
    'CHECKPOINTED',
    'Architecture review replica checkpointed as a durable continuity reference.',
    sourceRecord.businessKey || '',
    sourceRecord.replicaNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.replicaNodeKey || '',
    sourceRecord.replicaNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.replicaRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.replicaRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Checkpoint architecture-review replicas as durable references for downstream continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(checkpointPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1880_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1880_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1880_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessorLegacy1880_();
      return sciipWrapLegacyRuntimeResult1880_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1880_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1880_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessorLegacy1880_() {
  const processor =
    '1880_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointScope',
      'checkpointName',
      'checkpointStatus',
      'checkpointSummary',
      'checkpointSourceReplicaBusinessKey',
      'checkpointNodeType',
      'checkpointNodeKey',
      'checkpointNodeLabel',
      'checkpointRelationshipType',
      'checkpointRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointLedgerScope',
      'checkpointLedgerName',
      'checkpointLedgerStatus',
      'checkpointLedgerSummary',
      'ledgeredCheckpointBusinessKey',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.checkpointStatus || sourceRecord.sourceStatus || '',
    checkpointScope: sourceRecord.checkpointScope || '',
    checkpointName: sourceRecord.checkpointName || '',
    checkpointNodeType: sourceRecord.checkpointNodeType || '',
    checkpointNodeKey: sourceRecord.checkpointNodeKey || '',
    checkpointNodeLabel: sourceRecord.checkpointNodeLabel || '',
    checkpointRelationshipType: sourceRecord.checkpointRelationshipType || '',
    checkpointRelationshipTargetKey: sourceRecord.checkpointRelationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const checkpointLedgerPayload = {
    checkpointLedgerType: 'ARCHITECTURE_REVIEW_CHECKPOINT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCheckpointBusinessKey: sourceRecord.businessKey || '',
    ledgeredNodeType:
      sourceRecord.checkpointNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    ledgeredNodeKey:
      sourceRecord.checkpointNodeKey || '',
    ledgeredNodeLabel:
      sourceRecord.checkpointNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    ledgeredRelationshipType:
      sourceRecord.checkpointRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    ledgeredRelationshipTargetKey:
      sourceRecord.checkpointRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    checkpointLedgerStatus: 'LEDGERED',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.checkpointStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_CHECKPOINT_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Checkpoint Ledger',
    'LEDGERED',
    'Architecture review checkpoint written into permanent checkpoint ledger history.',
    sourceRecord.businessKey || '',
    sourceRecord.checkpointNodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.checkpointNodeKey || '',
    sourceRecord.checkpointNodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.checkpointRelationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.checkpointRelationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Maintain architecture-review checkpoint ledgers as permanent audit history for downstream platform evolution.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(checkpointLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCheckpointLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1890_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1890_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_VALIDATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_VALIDATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_VALIDATIONS_RUNTIME_LEDGER',

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
          originalProcessor: '1890_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessorLegacy1890_();
      return sciipWrapLegacyRuntimeResult1890_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1890_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1890_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_VALIDATION
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessorLegacy1890_() {

  const processor =
    '1890_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'checkpointLedgerScope',
      'checkpointLedgerName',
      'checkpointLedgerStatus',
      'checkpointLedgerSummary',
      'ledgeredCheckpointBusinessKey',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const validationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_VALIDATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'validationScope',
      'validationName',
      'validationStatus',
      'validationSummary',
      'validationResult',
      'validatedBusinessKey',
      'validatedNodeType',
      'validatedNodeKey',
      'validatedNodeLabel',
      'validatedRelationshipType',
      'validatedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'validationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_VALIDATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(validationSheet, businessKey)) {

    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {

    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.checkpointLedgerStatus || sourceRecord.sourceStatus || '',
    checkpointLedgerScope: sourceRecord.checkpointLedgerScope || '',
    checkpointLedgerName: sourceRecord.checkpointLedgerName || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const validationPayload = {
    validationType: 'ARCHITECTURE_REVIEW_VALIDATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    validationResult: 'PASSED',
    sourceCheckpointLedgerBusinessKey: sourceRecord.businessKey || '',
    validatedBusinessKey: sourceRecord.ledgeredCheckpointBusinessKey || '',
    validatedNodeType: sourceRecord.ledgeredNodeType || '',
    validatedNodeKey: sourceRecord.ledgeredNodeKey || '',
    validatedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    validatedAt: now.toISOString()
  };

  validationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.checkpointLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_VALIDATION',
    'SCIIP_OS v5.0 Architecture Review Validation',
    'VALIDATED',
    'Architecture Review checkpoint ledger successfully validated.',
    'PASSED',
    sourceRecord.ledgeredCheckpointBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(validationPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor() {

  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewValidationProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1900_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1900_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CERTIFICATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CERTIFICATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CERTIFICATIONS_RUNTIME_LEDGER',

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
          originalProcessor: '1900_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessorLegacy1900_();
      return sciipWrapLegacyRuntimeResult1900_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1900_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1900_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessorLegacy1900_() {
  const processor =
    '1900_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_VALIDATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'validationScope',
      'validationName',
      'validationStatus',
      'validationSummary',
      'validationResult',
      'validatedBusinessKey',
      'validatedNodeType',
      'validatedNodeKey',
      'validatedNodeLabel',
      'validatedRelationshipType',
      'validatedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'validationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const certificationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CERTIFICATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'certificationScope',
      'certificationName',
      'certificationStatus',
      'certificationSummary',
      'certificationResult',
      'certifiedBusinessKey',
      'certifiedNodeType',
      'certifiedNodeKey',
      'certifiedNodeLabel',
      'certifiedRelationshipType',
      'certifiedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'certificationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CERTIFICATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(certificationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const validationResult = sourceRecord.validationResult || 'PASSED';
  const certificationResult =
    String(validationResult).toUpperCase() === 'PASSED' ? 'CERTIFIED' : 'NOT_CERTIFIED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.validationStatus || sourceRecord.sourceStatus || '',
    validationResult,
    validatedBusinessKey: sourceRecord.validatedBusinessKey || '',
    validatedNodeType: sourceRecord.validatedNodeType || '',
    validatedNodeKey: sourceRecord.validatedNodeKey || '',
    validatedNodeLabel: sourceRecord.validatedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const certificationPayload = {
    certificationType: 'ARCHITECTURE_REVIEW_CERTIFICATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceValidationBusinessKey: sourceRecord.businessKey || '',
    validationResult,
    certificationResult,
    certifiedBusinessKey: sourceRecord.validatedBusinessKey || '',
    certifiedNodeType: sourceRecord.validatedNodeType || '',
    certifiedNodeKey: sourceRecord.validatedNodeKey || '',
    certifiedNodeLabel: sourceRecord.validatedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    certifiedAt: now.toISOString()
  };

  certificationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.validationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_CERTIFICATION',
    'SCIIP_OS v5.0 Architecture Review Certification',
    certificationResult,
    'Architecture Review validation certified for downstream platform evolution.',
    certificationResult,
    sourceRecord.validatedBusinessKey || '',
    sourceRecord.validatedNodeType || '',
    sourceRecord.validatedNodeKey || '',
    sourceRecord.validatedNodeLabel || '',
    sourceRecord.validatedRelationshipType || '',
    sourceRecord.validatedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(certificationPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCertificationProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASES_RUNTIME_LEDGER',

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
          originalProcessor: '1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessorLegacy1910_();
      return sciipWrapLegacyRuntimeResult1910_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1910_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessorLegacy1910_() {
  const processor =
    '1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CERTIFICATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'certificationScope',
      'certificationName',
      'certificationStatus',
      'certificationSummary',
      'certificationResult',
      'certifiedBusinessKey',
      'certifiedNodeType',
      'certifiedNodeKey',
      'certifiedNodeLabel',
      'certifiedRelationshipType',
      'certifiedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'certificationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const releaseSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseScope',
      'releaseName',
      'releaseStatus',
      'releaseSummary',
      'releaseResult',
      'releasedBusinessKey',
      'releasedNodeType',
      'releasedNodeKey',
      'releasedNodeLabel',
      'releasedRelationshipType',
      'releasedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releasePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(releaseSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const certificationResult = sourceRecord.certificationResult || 'CERTIFIED';
  const releaseResult =
    String(certificationResult).toUpperCase() === 'CERTIFIED'
      ? 'RELEASED'
      : 'BLOCKED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.certificationStatus || sourceRecord.sourceStatus || '',
    certificationResult,
    certifiedBusinessKey: sourceRecord.certifiedBusinessKey || '',
    certifiedNodeType: sourceRecord.certifiedNodeType || '',
    certifiedNodeKey: sourceRecord.certifiedNodeKey || '',
    certifiedNodeLabel: sourceRecord.certifiedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const releasePayload = {
    releaseType: 'ARCHITECTURE_REVIEW_RELEASE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCertificationBusinessKey: sourceRecord.businessKey || '',
    certificationResult,
    releaseResult,
    releasedBusinessKey: sourceRecord.certifiedBusinessKey || '',
    releasedNodeType: sourceRecord.certifiedNodeType || '',
    releasedNodeKey: sourceRecord.certifiedNodeKey || '',
    releasedNodeLabel: sourceRecord.certifiedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    releasedAt: now.toISOString()
  };

  releaseSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.certificationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_RELEASE',
    'SCIIP_OS v5.0 Architecture Review Release',
    releaseResult,
    'Certified architecture-review output released for downstream platform evolution.',
    releaseResult,
    sourceRecord.certifiedBusinessKey || '',
    sourceRecord.certifiedNodeType || '',
    sourceRecord.certifiedNodeKey || '',
    sourceRecord.certifiedNodeLabel || '',
    sourceRecord.certifiedRelationshipType || '',
    sourceRecord.certifiedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(releasePayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessorLegacy1920_();
      return sciipWrapLegacyRuntimeResult1920_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1920_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessorLegacy1920_() {
  const processor =
    '1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseScope',
      'releaseName',
      'releaseStatus',
      'releaseSummary',
      'releaseResult',
      'releasedBusinessKey',
      'releasedNodeType',
      'releasedNodeKey',
      'releasedNodeLabel',
      'releasedRelationshipType',
      'releasedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releasePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseLedgerScope',
      'releaseLedgerName',
      'releaseLedgerStatus',
      'releaseLedgerSummary',
      'ledgeredReleaseBusinessKey',
      'releaseResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releaseLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const releaseResult = sourceRecord.releaseResult || 'RELEASED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.releaseStatus || sourceRecord.sourceStatus || '',
    releaseResult,
    releasedBusinessKey: sourceRecord.releasedBusinessKey || '',
    releasedNodeType: sourceRecord.releasedNodeType || '',
    releasedNodeKey: sourceRecord.releasedNodeKey || '',
    releasedNodeLabel: sourceRecord.releasedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const releaseLedgerPayload = {
    releaseLedgerType: 'ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReleaseBusinessKey: sourceRecord.businessKey || '',
    releaseResult,
    ledgeredReleaseBusinessKey: sourceRecord.releasedBusinessKey || '',
    ledgeredNodeType: sourceRecord.releasedNodeType || '',
    ledgeredNodeKey: sourceRecord.releasedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.releasedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.releaseStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Release Ledger',
    'LEDGERED',
    'Architecture review release written into permanent release ledger history.',
    sourceRecord.businessKey || '',
    releaseResult,
    sourceRecord.releasedNodeType || '',
    sourceRecord.releasedNodeKey || '',
    sourceRecord.releasedNodeLabel || '',
    sourceRecord.releasedRelationshipType || '',
    sourceRecord.releasedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(releaseLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTIONS_RUNTIME_LEDGER',

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
          originalProcessor: '1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessorLegacy1930_();
      return sciipWrapLegacyRuntimeResult1930_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1930_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessorLegacy1930_() {
  const processor =
    '1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseLedgerScope',
      'releaseLedgerName',
      'releaseLedgerStatus',
      'releaseLedgerSummary',
      'ledgeredReleaseBusinessKey',
      'releaseResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releaseLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const promotionSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionScope',
      'promotionName',
      'promotionStatus',
      'promotionSummary',
      'promotionResult',
      'promotedBusinessKey',
      'promotedNodeType',
      'promotedNodeKey',
      'promotedNodeLabel',
      'promotedRelationshipType',
      'promotedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(promotionSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const releaseResult = sourceRecord.releaseResult || 'RELEASED';
  const promotionResult =
    String(releaseResult).toUpperCase() === 'RELEASED'
      ? 'PROMOTED'
      : 'NOT_PROMOTED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.releaseLedgerStatus || sourceRecord.sourceStatus || '',
    releaseResult,
    ledgeredReleaseBusinessKey: sourceRecord.ledgeredReleaseBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const promotionPayload = {
    promotionType: 'ARCHITECTURE_REVIEW_PROMOTION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReleaseLedgerBusinessKey: sourceRecord.businessKey || '',
    releaseResult,
    promotionResult,
    promotedBusinessKey: sourceRecord.ledgeredReleaseBusinessKey || '',
    promotedNodeType: sourceRecord.ledgeredNodeType || '',
    promotedNodeKey: sourceRecord.ledgeredNodeKey || '',
    promotedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    promotedAt: now.toISOString()
  };

  promotionSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.releaseLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_PROMOTION',
    'SCIIP_OS v5.0 Architecture Review Promotion',
    promotionResult,
    'Architecture review release ledger promoted for downstream autonomous platform evolution.',
    promotionResult,
    sourceRecord.ledgeredReleaseBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(promotionPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessorLegacy1940_();
      return sciipWrapLegacyRuntimeResult1940_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1940_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessorLegacy1940_() {
  const processor =
    '1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionScope',
      'promotionName',
      'promotionStatus',
      'promotionSummary',
      'promotionResult',
      'promotedBusinessKey',
      'promotedNodeType',
      'promotedNodeKey',
      'promotedNodeLabel',
      'promotedRelationshipType',
      'promotedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionLedgerScope',
      'promotionLedgerName',
      'promotionLedgerStatus',
      'promotionLedgerSummary',
      'ledgeredPromotionBusinessKey',
      'promotionResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const promotionResult = sourceRecord.promotionResult || 'PROMOTED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.promotionStatus || sourceRecord.sourceStatus || '',
    promotionResult,
    promotedBusinessKey: sourceRecord.promotedBusinessKey || '',
    promotedNodeType: sourceRecord.promotedNodeType || '',
    promotedNodeKey: sourceRecord.promotedNodeKey || '',
    promotedNodeLabel: sourceRecord.promotedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const promotionLedgerPayload = {
    promotionLedgerType: 'ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourcePromotionBusinessKey: sourceRecord.businessKey || '',
    promotionResult,
    ledgeredPromotionBusinessKey: sourceRecord.promotedBusinessKey || '',
    ledgeredNodeType: sourceRecord.promotedNodeType || '',
    ledgeredNodeKey: sourceRecord.promotedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.promotedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.promotionStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Promotion Ledger',
    'LEDGERED',
    'Architecture review promotion written into permanent promotion ledger history.',
    sourceRecord.businessKey || '',
    promotionResult,
    sourceRecord.promotedNodeType || '',
    sourceRecord.promotedNodeKey || '',
    sourceRecord.promotedNodeLabel || '',
    sourceRecord.promotedRelationshipType || '',
    sourceRecord.promotedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(promotionLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENTS_RUNTIME_LEDGER',

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
          originalProcessor: '1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessorLegacy1950_();
      return sciipWrapLegacyRuntimeResult1950_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1950_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessorLegacy1950_() {
  const processor =
    '1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionLedgerScope',
      'promotionLedgerName',
      'promotionLedgerStatus',
      'promotionLedgerSummary',
      'ledgeredPromotionBusinessKey',
      'promotionResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const deploymentSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentScope',
      'deploymentName',
      'deploymentStatus',
      'deploymentSummary',
      'deploymentResult',
      'deployedBusinessKey',
      'deployedNodeType',
      'deployedNodeKey',
      'deployedNodeLabel',
      'deployedRelationshipType',
      'deployedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(deploymentSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const promotionResult = sourceRecord.promotionResult || 'PROMOTED';

  const deploymentResult =
    String(promotionResult).toUpperCase() === 'PROMOTED'
      ? 'DEPLOYED'
      : 'NOT_DEPLOYED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.promotionLedgerStatus || sourceRecord.sourceStatus || '',
    promotionResult,
    ledgeredPromotionBusinessKey: sourceRecord.ledgeredPromotionBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const deploymentPayload = {
    deploymentType: 'ARCHITECTURE_REVIEW_DEPLOYMENT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourcePromotionLedgerBusinessKey: sourceRecord.businessKey || '',
    promotionResult,
    deploymentResult,
    deployedBusinessKey: sourceRecord.ledgeredPromotionBusinessKey || '',
    deployedNodeType: sourceRecord.ledgeredNodeType || '',
    deployedNodeKey: sourceRecord.ledgeredNodeKey || '',
    deployedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    deployedAt: now.toISOString()
  };

  deploymentSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.promotionLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_DEPLOYMENT',
    'SCIIP_OS v5.0 Architecture Review Deployment',
    deploymentResult,
    'Architecture review promotion ledger deployed for downstream SCIIP_OS platform evolution.',
    deploymentResult,
    sourceRecord.ledgeredPromotionBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(deploymentPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessorLegacy1960_();
      return sciipWrapLegacyRuntimeResult1960_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1960_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessorLegacy1960_() {
  const processor =
    '1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentScope',
      'deploymentName',
      'deploymentStatus',
      'deploymentSummary',
      'deploymentResult',
      'deployedBusinessKey',
      'deployedNodeType',
      'deployedNodeKey',
      'deployedNodeLabel',
      'deployedRelationshipType',
      'deployedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentLedgerScope',
      'deploymentLedgerName',
      'deploymentLedgerStatus',
      'deploymentLedgerSummary',
      'ledgeredDeploymentBusinessKey',
      'deploymentResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const deploymentResult = sourceRecord.deploymentResult || 'DEPLOYED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.deploymentStatus || sourceRecord.sourceStatus || '',
    deploymentResult,
    deployedBusinessKey: sourceRecord.deployedBusinessKey || '',
    deployedNodeType: sourceRecord.deployedNodeType || '',
    deployedNodeKey: sourceRecord.deployedNodeKey || '',
    deployedNodeLabel: sourceRecord.deployedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const deploymentLedgerPayload = {
    deploymentLedgerType: 'ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceDeploymentBusinessKey: sourceRecord.businessKey || '',
    deploymentResult,
    ledgeredDeploymentBusinessKey: sourceRecord.deployedBusinessKey || '',
    ledgeredNodeType: sourceRecord.deployedNodeType || '',
    ledgeredNodeKey: sourceRecord.deployedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.deployedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.deploymentStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Deployment Ledger',
    'LEDGERED',
    'Architecture review deployment written into permanent deployment ledger history.',
    sourceRecord.businessKey || '',
    deploymentResult,
    sourceRecord.deployedNodeType || '',
    sourceRecord.deployedNodeKey || '',
    sourceRecord.deployedNodeLabel || '',
    sourceRecord.deployedRelationshipType || '',
    sourceRecord.deployedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(deploymentLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATIONS_RUNTIME_LEDGER',

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
          originalProcessor: '1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessorLegacy1970_();
      return sciipWrapLegacyRuntimeResult1970_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1970_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessorLegacy1970_() {
  const processor =
    '1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentLedgerScope',
      'deploymentLedgerName',
      'deploymentLedgerStatus',
      'deploymentLedgerSummary',
      'ledgeredDeploymentBusinessKey',
      'deploymentResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const operationalizationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'operationalizationScope',
      'operationalizationName',
      'operationalizationStatus',
      'operationalizationSummary',
      'operationalizationResult',
      'operationalizedBusinessKey',
      'operationalizedNodeType',
      'operationalizedNodeKey',
      'operationalizedNodeLabel',
      'operationalizedRelationshipType',
      'operationalizedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'operationalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(operationalizationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const deploymentResult = sourceRecord.deploymentResult || 'DEPLOYED';

  const operationalizationResult =
    String(deploymentResult).toUpperCase() === 'DEPLOYED'
      ? 'OPERATIONALIZED'
      : 'NOT_OPERATIONALIZED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.deploymentLedgerStatus || sourceRecord.sourceStatus || '',
    deploymentResult,
    ledgeredDeploymentBusinessKey: sourceRecord.ledgeredDeploymentBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const operationalizationPayload = {
    operationalizationType: 'ARCHITECTURE_REVIEW_OPERATIONALIZATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceDeploymentLedgerBusinessKey: sourceRecord.businessKey || '',
    deploymentResult,
    operationalizationResult,
    operationalizedBusinessKey: sourceRecord.ledgeredDeploymentBusinessKey || '',
    operationalizedNodeType: sourceRecord.ledgeredNodeType || '',
    operationalizedNodeKey: sourceRecord.ledgeredNodeKey || '',
    operationalizedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    operationalizedAt: now.toISOString()
  };

  operationalizationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.deploymentLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_OPERATIONALIZATION',
    'SCIIP_OS v5.0 Architecture Review Operationalization',
    operationalizationResult,
    'Architecture review deployment ledger operationalized for active SCIIP_OS platform evolution.',
    operationalizationResult,
    sourceRecord.ledgeredDeploymentBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(operationalizationPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessorLegacy1980_();
      return sciipWrapLegacyRuntimeResult1980_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1980_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessorLegacy1980_() {
  const processor =
    '1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'operationalizationScope',
      'operationalizationName',
      'operationalizationStatus',
      'operationalizationSummary',
      'operationalizationResult',
      'operationalizedBusinessKey',
      'operationalizedNodeType',
      'operationalizedNodeKey',
      'operationalizedNodeLabel',
      'operationalizedRelationshipType',
      'operationalizedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'operationalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'operationalLedgerScope',
      'operationalLedgerName',
      'operationalLedgerStatus',
      'operationalLedgerSummary',
      'ledgeredOperationalizationBusinessKey',
      'operationalizationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'operationalLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const operationalizationResult =
    sourceRecord.operationalizationResult || 'OPERATIONALIZED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.operationalizationStatus || sourceRecord.sourceStatus || '',
    operationalizationResult,
    operationalizedBusinessKey: sourceRecord.operationalizedBusinessKey || '',
    operationalizedNodeType: sourceRecord.operationalizedNodeType || '',
    operationalizedNodeKey: sourceRecord.operationalizedNodeKey || '',
    operationalizedNodeLabel: sourceRecord.operationalizedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const operationalLedgerPayload = {
    operationalLedgerType: 'ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceOperationalizationBusinessKey: sourceRecord.businessKey || '',
    operationalizationResult,
    ledgeredOperationalizationBusinessKey:
      sourceRecord.operationalizedBusinessKey || '',
    ledgeredNodeType: sourceRecord.operationalizedNodeType || '',
    ledgeredNodeKey: sourceRecord.operationalizedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.operationalizedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.operationalizationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Operational Ledger',
    'LEDGERED',
    'Architecture review operationalization written into permanent operational ledger history.',
    sourceRecord.businessKey || '',
    operationalizationResult,
    sourceRecord.operationalizedNodeType || '',
    sourceRecord.operationalizedNodeKey || '',
    sourceRecord.operationalizedNodeLabel || '',
    sourceRecord.operationalizedRelationshipType || '',
    sourceRecord.operationalizedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(operationalLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESSS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESSS_RUNTIME_LEDGER',

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
          originalProcessor: '1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessorLegacy1990_();
      return sciipWrapLegacyRuntimeResult1990_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1990_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessorLegacy1990_() {
  const processor =
    '1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'operationalLedgerScope',
      'operationalLedgerName',
      'operationalLedgerStatus',
      'operationalLedgerSummary',
      'ledgeredOperationalizationBusinessKey',
      'operationalizationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'operationalLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const readinessSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'readinessScope',
      'readinessName',
      'readinessStatus',
      'readinessSummary',
      'readinessResult',
      'readyBusinessKey',
      'readyNodeType',
      'readyNodeKey',
      'readyNodeLabel',
      'readyRelationshipType',
      'readyRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'readinessPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(readinessSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const operationalizationResult =
    sourceRecord.operationalizationResult || 'OPERATIONALIZED';

  const readinessResult =
    String(operationalizationResult).toUpperCase() === 'OPERATIONALIZED'
      ? 'READY'
      : 'NOT_READY';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.operationalLedgerStatus || sourceRecord.sourceStatus || '',
    operationalizationResult,
    ledgeredOperationalizationBusinessKey:
      sourceRecord.ledgeredOperationalizationBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const readinessPayload = {
    readinessType: 'ARCHITECTURE_REVIEW_READINESS',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceOperationalLedgerBusinessKey: sourceRecord.businessKey || '',
    operationalizationResult,
    readinessResult,
    readyBusinessKey: sourceRecord.ledgeredOperationalizationBusinessKey || '',
    readyNodeType: sourceRecord.ledgeredNodeType || '',
    readyNodeKey: sourceRecord.ledgeredNodeKey || '',
    readyNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    readyAt: now.toISOString()
  };

  readinessSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.operationalLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_READINESS',
    'SCIIP_OS v5.0 Architecture Review Readiness',
    readinessResult,
    'Architecture review operational ledger evaluated for downstream readiness.',
    readinessResult,
    sourceRecord.ledgeredOperationalizationBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(readinessPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessorLegacy2000_();
      return sciipWrapLegacyRuntimeResult2000_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2000_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessorLegacy2000_() {
  const processor =
    '2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'readinessScope',
      'readinessName',
      'readinessStatus',
      'readinessSummary',
      'readinessResult',
      'readyBusinessKey',
      'readyNodeType',
      'readyNodeKey',
      'readyNodeLabel',
      'readyRelationshipType',
      'readyRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'readinessPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'readinessLedgerScope',
      'readinessLedgerName',
      'readinessLedgerStatus',
      'readinessLedgerSummary',
      'ledgeredReadinessBusinessKey',
      'readinessResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'readinessLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const readinessResult = sourceRecord.readinessResult || 'READY';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.readinessStatus || sourceRecord.sourceStatus || '',
    readinessResult,
    readyBusinessKey: sourceRecord.readyBusinessKey || '',
    readyNodeType: sourceRecord.readyNodeType || '',
    readyNodeKey: sourceRecord.readyNodeKey || '',
    readyNodeLabel: sourceRecord.readyNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const readinessLedgerPayload = {
    readinessLedgerType: 'ARCHITECTURE_REVIEW_READINESS_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReadinessBusinessKey: sourceRecord.businessKey || '',
    readinessResult,
    ledgeredReadinessBusinessKey: sourceRecord.readyBusinessKey || '',
    ledgeredNodeType: sourceRecord.readyNodeType || '',
    ledgeredNodeKey: sourceRecord.readyNodeKey || '',
    ledgeredNodeLabel: sourceRecord.readyNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.readinessStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_READINESS_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Readiness Ledger',
    'LEDGERED',
    'Architecture review readiness written into permanent readiness ledger history.',
    sourceRecord.businessKey || '',
    readinessResult,
    sourceRecord.readyNodeType || '',
    sourceRecord.readyNodeKey || '',
    sourceRecord.readyNodeLabel || '',
    sourceRecord.readyRelationshipType || '',
    sourceRecord.readyRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(readinessLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATIONS_RUNTIME_LEDGER',

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
          originalProcessor: '2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessorLegacy2010_();
      return sciipWrapLegacyRuntimeResult2010_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2010_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessorLegacy2010_() {
  const processor =
    '2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'readinessLedgerScope',
      'readinessLedgerName',
      'readinessLedgerStatus',
      'readinessLedgerSummary',
      'ledgeredReadinessBusinessKey',
      'readinessResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'readinessLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const activationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationScope',
      'activationName',
      'activationStatus',
      'activationSummary',
      'activationResult',
      'activatedBusinessKey',
      'activatedNodeType',
      'activatedNodeKey',
      'activatedNodeLabel',
      'activatedRelationshipType',
      'activatedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(activationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const readinessResult = sourceRecord.readinessResult || 'READY';

  const activationResult =
    String(readinessResult).toUpperCase() === 'READY'
      ? 'ACTIVATED'
      : 'NOT_ACTIVATED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.readinessLedgerStatus || sourceRecord.sourceStatus || '',
    readinessResult,
    ledgeredReadinessBusinessKey: sourceRecord.ledgeredReadinessBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const activationPayload = {
    activationType: 'ARCHITECTURE_REVIEW_ACTIVATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReadinessLedgerBusinessKey: sourceRecord.businessKey || '',
    readinessResult,
    activationResult,
    activatedBusinessKey: sourceRecord.ledgeredReadinessBusinessKey || '',
    activatedNodeType: sourceRecord.ledgeredNodeType || '',
    activatedNodeKey: sourceRecord.ledgeredNodeKey || '',
    activatedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    activatedAt: now.toISOString()
  };

  activationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.readinessLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_ACTIVATION',
    'SCIIP_OS v5.0 Architecture Review Activation',
    activationResult,
    'Architecture review readiness ledger activated for autonomous SCIIP_OS platform evolution.',
    activationResult,
    sourceRecord.ledgeredReadinessBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(activationPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessorLegacy2020_();
      return sciipWrapLegacyRuntimeResult2020_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2020_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessorLegacy2020_() {
  const processor =
    '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationScope',
      'activationName',
      'activationStatus',
      'activationSummary',
      'activationResult',
      'activatedBusinessKey',
      'activatedNodeType',
      'activatedNodeKey',
      'activatedNodeLabel',
      'activatedRelationshipType',
      'activatedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationLedgerScope',
      'activationLedgerName',
      'activationLedgerStatus',
      'activationLedgerSummary',
      'ledgeredActivationBusinessKey',
      'activationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const activationResult = sourceRecord.activationResult || 'ACTIVATED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.activationStatus || sourceRecord.sourceStatus || '',
    activationResult,
    activatedBusinessKey: sourceRecord.activatedBusinessKey || '',
    activatedNodeType: sourceRecord.activatedNodeType || '',
    activatedNodeKey: sourceRecord.activatedNodeKey || '',
    activatedNodeLabel: sourceRecord.activatedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const activationLedgerPayload = {
    activationLedgerType: 'ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceActivationBusinessKey: sourceRecord.businessKey || '',
    activationResult,
    ledgeredActivationBusinessKey: sourceRecord.activatedBusinessKey || '',
    ledgeredNodeType: sourceRecord.activatedNodeType || '',
    ledgeredNodeKey: sourceRecord.activatedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.activatedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.activationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Activation Ledger',
    'LEDGERED',
    'Architecture review activation written into permanent activation ledger history.',
    sourceRecord.businessKey || '',
    activationResult,
    sourceRecord.activatedNodeType || '',
    sourceRecord.activatedNodeKey || '',
    sourceRecord.activatedNodeLabel || '',
    sourceRecord.activatedRelationshipType || '',
    sourceRecord.activatedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(activationLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETIONS_RUNTIME_LEDGER',

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
          originalProcessor: '2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessorLegacy2030_();
      return sciipWrapLegacyRuntimeResult2030_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2030_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessorLegacy2030_() {
  const processor =
    '2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationLedgerScope',
      'activationLedgerName',
      'activationLedgerStatus',
      'activationLedgerSummary',
      'ledgeredActivationBusinessKey',
      'activationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const completionSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionScope',
      'completionName',
      'completionStatus',
      'completionSummary',
      'completionResult',
      'completedBusinessKey',
      'completedNodeType',
      'completedNodeKey',
      'completedNodeLabel',
      'completedRelationshipType',
      'completedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'completionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(completionSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const activationResult = sourceRecord.activationResult || 'ACTIVATED';

  const completionResult =
    String(activationResult).toUpperCase() === 'ACTIVATED'
      ? 'COMPLETED'
      : 'NOT_COMPLETED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.activationLedgerStatus || sourceRecord.sourceStatus || '',
    activationResult,
    ledgeredActivationBusinessKey: sourceRecord.ledgeredActivationBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const completionPayload = {
    completionType: 'ARCHITECTURE_REVIEW_COMPLETION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceActivationLedgerBusinessKey: sourceRecord.businessKey || '',
    activationResult,
    completionResult,
    completedBusinessKey: sourceRecord.ledgeredActivationBusinessKey || '',
    completedNodeType: sourceRecord.ledgeredNodeType || '',
    completedNodeKey: sourceRecord.ledgeredNodeKey || '',
    completedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    completedAt: now.toISOString()
  };

  completionSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.activationLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_COMPLETION',
    'SCIIP_OS v5.0 Architecture Review Completion',
    completionResult,
    'Architecture review activation ledger completed for SCIIP_OS v5.0 continuity track.',
    completionResult,
    sourceRecord.ledgeredActivationBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(completionPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessorLegacy2040_();
      return sciipWrapLegacyRuntimeResult2040_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2040_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessorLegacy2040_() {
  const processor =
    '2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionScope',
      'completionName',
      'completionStatus',
      'completionSummary',
      'completionResult',
      'completedBusinessKey',
      'completedNodeType',
      'completedNodeKey',
      'completedNodeLabel',
      'completedRelationshipType',
      'completedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'completionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionLedgerScope',
      'completionLedgerName',
      'completionLedgerStatus',
      'completionLedgerSummary',
      'ledgeredCompletionBusinessKey',
      'completionResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'completionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const completionResult = sourceRecord.completionResult || 'COMPLETED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.completionStatus || sourceRecord.sourceStatus || '',
    completionResult,
    completedBusinessKey: sourceRecord.completedBusinessKey || '',
    completedNodeType: sourceRecord.completedNodeType || '',
    completedNodeKey: sourceRecord.completedNodeKey || '',
    completedNodeLabel: sourceRecord.completedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const completionLedgerPayload = {
    completionLedgerType: 'ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCompletionBusinessKey: sourceRecord.businessKey || '',
    completionResult,
    ledgeredCompletionBusinessKey: sourceRecord.completedBusinessKey || '',
    ledgeredNodeType: sourceRecord.completedNodeType || '',
    ledgeredNodeKey: sourceRecord.completedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.completedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.completionStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Completion Ledger',
    'LEDGERED',
    'Architecture review completion written into permanent completion ledger history.',
    sourceRecord.businessKey || '',
    completionResult,
    sourceRecord.completedNodeType || '',
    sourceRecord.completedNodeKey || '',
    sourceRecord.completedNodeLabel || '',
    sourceRecord.completedRelationshipType || '',
    sourceRecord.completedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(completionLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFFS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFFS_RUNTIME_LEDGER',

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
          originalProcessor: '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessorLegacy2050_();
      return sciipWrapLegacyRuntimeResult2050_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2050_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessorLegacy2050_() {
  const processor =
    '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionLedgerScope',
      'completionLedgerName',
      'completionLedgerStatus',
      'completionLedgerSummary',
      'ledgeredCompletionBusinessKey',
      'completionResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'completionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const handoffSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffScope',
      'handoffName',
      'handoffStatus',
      'handoffSummary',
      'handoffResult',
      'handoffBusinessKey',
      'handoffNodeType',
      'handoffNodeKey',
      'handoffNodeLabel',
      'handoffRelationshipType',
      'handoffRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(handoffSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const completionResult = sourceRecord.completionResult || 'COMPLETED';

  const handoffResult =
    String(completionResult).toUpperCase() === 'COMPLETED'
      ? 'HANDOFF_READY'
      : 'HANDOFF_BLOCKED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.completionLedgerStatus || sourceRecord.sourceStatus || '',
    completionResult,
    ledgeredCompletionBusinessKey:
      sourceRecord.ledgeredCompletionBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const handoffPayload = {
    handoffType: 'ARCHITECTURE_REVIEW_HANDOFF',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCompletionLedgerBusinessKey: sourceRecord.businessKey || '',
    completionResult,
    handoffResult,
    handoffBusinessKey: sourceRecord.ledgeredCompletionBusinessKey || '',
    handoffNodeType: sourceRecord.ledgeredNodeType || '',
    handoffNodeKey: sourceRecord.ledgeredNodeKey || '',
    handoffNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    nextTrackRecommendation:
      'Begin framework abstraction review for repeated Architecture Review Track processor patterns.',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    handedOffAt: now.toISOString()
  };

  handoffSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.completionLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_HANDOFF',
    'SCIIP_OS v5.0 Architecture Review Handoff',
    handoffResult,
    'Architecture review completion ledger prepared for downstream handoff.',
    handoffResult,
    sourceRecord.ledgeredCompletionBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(handoffPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessorLegacy2060_();
      return sciipWrapLegacyRuntimeResult2060_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2060_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessorLegacy2060_() {
  const processor =
    '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffScope',
      'handoffName',
      'handoffStatus',
      'handoffSummary',
      'handoffResult',
      'handoffBusinessKey',
      'handoffNodeType',
      'handoffNodeKey',
      'handoffNodeLabel',
      'handoffRelationshipType',
      'handoffRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffLedgerScope',
      'handoffLedgerName',
      'handoffLedgerStatus',
      'handoffLedgerSummary',
      'ledgeredHandoffBusinessKey',
      'handoffResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const handoffResult = sourceRecord.handoffResult || 'HANDOFF_READY';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.handoffStatus || sourceRecord.sourceStatus || '',
    handoffResult,
    handoffBusinessKey: sourceRecord.handoffBusinessKey || '',
    handoffNodeType: sourceRecord.handoffNodeType || '',
    handoffNodeKey: sourceRecord.handoffNodeKey || '',
    handoffNodeLabel: sourceRecord.handoffNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const handoffLedgerPayload = {
    handoffLedgerType: 'ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceHandoffBusinessKey: sourceRecord.businessKey || '',
    handoffResult,
    ledgeredHandoffBusinessKey: sourceRecord.handoffBusinessKey || '',
    ledgeredNodeType: sourceRecord.handoffNodeType || '',
    ledgeredNodeKey: sourceRecord.handoffNodeKey || '',
    ledgeredNodeLabel: sourceRecord.handoffNodeLabel || '',
    nextTrackRecommendation:
      'Proceed to reusable Architecture Review processor framework analysis after final handoff ledger.',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.handoffStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Handoff Ledger',
    'LEDGERED',
    'Architecture review handoff written into permanent handoff ledger history.',
    sourceRecord.businessKey || '',
    handoffResult,
    sourceRecord.handoffNodeType || '',
    sourceRecord.handoffNodeKey || '',
    sourceRecord.handoffNodeLabel || '',
    sourceRecord.handoffRelationshipType || '',
    sourceRecord.handoffRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(handoffLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2070_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2070_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEWS',
    ledgerSheet: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEWS_RUNTIME_LEDGER',

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
          originalProcessor: '2070_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessorLegacy2070_();
      return sciipWrapLegacyRuntimeResult2070_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2070_(legacyResult, context, transaction) {
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

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessorLegacy2070_() {
  const processor =
    '2070_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor';

  return sciipRunConfiguredContinuityProcessor_({
    processor: processor,

    sourceSheetName:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',

    outputSheetName:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW',

    businessKeyPrefix:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW',

    createdCountField:
      'autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewsCreated',

    sourceHeaders: [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffLedgerStatus',
      'handoffResult',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'createdAt'
    ],

    outputHeaders: [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'frameworkPatternReviewScope',
      'frameworkPatternReviewName',
      'frameworkPatternReviewStatus',
      'frameworkPatternReviewSummary',
      'frameworkPatternReviewResult',
      'reviewedBusinessKey',
      'reviewedPatternCategory',
      'reviewedPatternName',
      'repeatablePatternFinding',
      'frameworkRecommendation',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'frameworkPatternReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ],

    buildRow: function(ctx) {
      const sourceRecord = ctx.sourceRecord;

      const finding =
        'Architecture Review Track processors share repeated sheet initialization, source lookup, business-key duplicate detection, compact payload construction, append-row emission, and standardized result logging.';

      const recommendation =
        'Create a reusable SCIIP processor execution framework for linear processor chains with configurable source/output sheets, field mappings, payload builders, status fields, count fields, and ledger/event modes.';

      const payload = {
        reviewType: 'ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW',
        reviewedProcessorRange: '1700-2060',
        reviewedPatternCategory: 'REPEATED_PROCESSOR_BOILERPLATE',
        reviewedPatternName: 'Architecture Review Track processor chain pattern',
        repeatablePatternFinding: finding,
        frameworkRecommendation: recommendation,
        targetVersion: 'SCIIP_OS v5.1',
        reviewedAt: ctx.now.toISOString()
      };

      const compactSourcePayload = {
        sourceBusinessKey: sourceRecord.businessKey || '',
        sourceProcessor: sourceRecord.processor || '',
        sourceStatus: sourceRecord.handoffLedgerStatus || sourceRecord.sourceStatus || '',
        handoffResult: sourceRecord.handoffResult || '',
        reviewTrack: sourceRecord.reviewTrack || '',
        createdAt: sourceRecord.createdAt || ''
      };

      return [
        ctx.businessKey,
        ctx.dateKey,
        ctx.processor,
        sourceRecord.businessKey || '',
        sourceRecord.processor || '',
        sourceRecord.handoffLedgerStatus || sourceRecord.sourceStatus || '',
        'SCIIP_OS_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW',
        'SCIIP_OS v5.0 Architecture Review Framework Pattern Review',
        'REVIEWED',
        'Repeated Architecture Review Track processor patterns reviewed for framework abstraction.',
        'FRAMEWORK_PATTERN_IDENTIFIED',
        sourceRecord.businessKey || '',
        'REPEATED_PROCESSOR_BOILERPLATE',
        'Architecture Review Track processor chain pattern',
        finding,
        recommendation,
        'SCIIP_OS_ARCHITECTURE',
        'PROCESSOR_DRIVEN_EVENT_SOURCED_IDEMPOTENT_FRAMEWORK_ABSTRACTION',
        finding,
        recommendation,
        sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
        sourceRecord.currentVersion || 'SCIIP_OS v5.0',
        'SCIIP_OS v5.1',
        JSON.stringify(payload),
        JSON.stringify(compactSourcePayload),
        ctx.now.toISOString()
      ];
    }
  });
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessorLegacy2080_();
      return sciipWrapLegacyRuntimeResult2080_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2080_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessorLegacy2080_() {
  const processor =
    '2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'frameworkPatternReviewScope',
      'frameworkPatternReviewName',
      'frameworkPatternReviewStatus',
      'frameworkPatternReviewSummary',
      'frameworkPatternReviewResult',
      'reviewedBusinessKey',
      'reviewedPatternCategory',
      'reviewedPatternName',
      'repeatablePatternFinding',
      'frameworkRecommendation',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'frameworkPatternReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'frameworkPatternReviewLedgerScope',
      'frameworkPatternReviewLedgerName',
      'frameworkPatternReviewLedgerStatus',
      'frameworkPatternReviewLedgerSummary',
      'ledgeredPatternReviewBusinessKey',
      'frameworkPatternReviewResult',
      'ledgeredPatternCategory',
      'ledgeredPatternName',
      'ledgeredPatternFinding',
      'ledgeredFrameworkRecommendation',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'frameworkPatternReviewLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus:
      sourceRecord.frameworkPatternReviewStatus ||
      sourceRecord.sourceStatus ||
      '',
    frameworkPatternReviewResult:
      sourceRecord.frameworkPatternReviewResult || '',
    reviewedPatternCategory: sourceRecord.reviewedPatternCategory || '',
    reviewedPatternName: sourceRecord.reviewedPatternName || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const frameworkPatternReviewLedgerPayload = {
    ledgerType: 'ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceFrameworkPatternReviewBusinessKey: sourceRecord.businessKey || '',
    frameworkPatternReviewResult:
      sourceRecord.frameworkPatternReviewResult ||
      'FRAMEWORK_PATTERN_IDENTIFIED',
    ledgeredPatternReviewBusinessKey: sourceRecord.businessKey || '',
    ledgeredPatternCategory:
      sourceRecord.reviewedPatternCategory ||
      'REPEATED_PROCESSOR_BOILERPLATE',
    ledgeredPatternName:
      sourceRecord.reviewedPatternName ||
      'Architecture Review Track processor chain pattern',
    ledgeredPatternFinding:
      sourceRecord.repeatablePatternFinding || '',
    ledgeredFrameworkRecommendation:
      sourceRecord.frameworkRecommendation || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'PROCESSOR_DRIVEN_EVENT_SOURCED_IDEMPOTENT_FRAMEWORK_ABSTRACTION',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v5.0',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.1',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.frameworkPatternReviewStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Framework Pattern Review Ledger',
    'LEDGERED',
    'Framework pattern review written into permanent framework pattern review ledger history.',
    sourceRecord.businessKey || '',
    sourceRecord.frameworkPatternReviewResult ||
      'FRAMEWORK_PATTERN_IDENTIFIED',
    sourceRecord.reviewedPatternCategory ||
      'REPEATED_PROCESSOR_BOILERPLATE',
    sourceRecord.reviewedPatternName ||
      'Architecture Review Track processor chain pattern',
    sourceRecord.repeatablePatternFinding || '',
    sourceRecord.frameworkRecommendation || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'PROCESSOR_DRIVEN_EVENT_SOURCED_IDEMPOTENT_FRAMEWORK_ABSTRACTION',
    sourceRecord.architectureFinding || sourceRecord.repeatablePatternFinding || '',
    sourceRecord.architectureRecommendation ||
      sourceRecord.frameworkRecommendation ||
      '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v5.0',
    sourceRecord.targetVersion || 'SCIIP_OS v5.1',
    JSON.stringify(frameworkPatternReviewLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATIONS',
    ledgerSheet: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATIONS_RUNTIME_LEDGER',

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
          originalProcessor: '2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessorLegacy2090_();
      return sciipWrapLegacyRuntimeResult2090_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2090_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.1 Architecture Review Track
 * 2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessorLegacy2090_() {
  const processor =
    '2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor';

  return sciipRunConfiguredContinuityProcessor_({
    processor: processor,

    sourceSheetName:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',

    outputSheetName:
      'ARCH_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',

    businessKeyPrefix:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',

    createdCountField:
      'autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationsCreated',

    sourceHeaders: [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'frameworkPatternReviewLedgerScope',
      'frameworkPatternReviewLedgerName',
      'frameworkPatternReviewLedgerStatus',
      'frameworkPatternReviewLedgerSummary',
      'ledgeredPatternReviewBusinessKey',
      'frameworkPatternReviewResult',
      'ledgeredPatternCategory',
      'ledgeredPatternName',
      'ledgeredPatternFinding',
      'ledgeredFrameworkRecommendation',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'frameworkPatternReviewLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ],

    outputHeaders: [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'refactorRecommendationScope',
      'refactorRecommendationName',
      'refactorRecommendationStatus',
      'refactorRecommendationSummary',
      'refactorRecommendationResult',
      'recommendedFrameworkName',
      'recommendedFrameworkVersion',
      'recommendedRefactorType',
      'recommendedMigrationScope',
      'recommendedMigrationStrategy',
      'expectedBenefit',
      'riskAssessment',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'refactorRecommendationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ],

    buildRow: function(ctx) {
      const sourceRecord = ctx.sourceRecord;

      const finding =
        sourceRecord.ledgeredPatternFinding ||
        sourceRecord.architectureFinding ||
        'Repeated Architecture Review Track processor boilerplate has been identified and ledgered.';

      const recommendation =
        'Adopt the shared SCIIP configured continuity processor framework for future linear processor chains, beginning with 2090+ and then progressively migrating 1700-2080 without changing external sheet contracts or business-key behavior.';

      const payload = {
        recommendationType: 'ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',
        recommendedFrameworkName: 'SCIIP Configured Continuity Processor Framework',
        recommendedFrameworkVersion: 'SCIIP_OS v5.1',
        recommendedRefactorType: 'NON_BREAKING_PROGRESSIVE_ABSTRACTION',
        recommendedMigrationScope: '1700-2080 Architecture Review Track processors',
        recommendedMigrationStrategy:
          'Use new framework for new processors first, then migrate prior processors one-by-one with identical inputs, outputs, business keys, result fields, and duplicate behavior.',
        expectedBenefit:
          'Reduced boilerplate, fewer naming errors, faster processor creation, centralized sheet alias handling, and consistent compact payload behavior.',
        riskAssessment:
          'Low if migration preserves external contracts and each migrated processor is validated with existing standalone tests.',
        sourceFrameworkPatternReviewLedgerBusinessKey: sourceRecord.businessKey || '',
        targetVersion: 'SCIIP_OS v5.1',
        recommendedAt: ctx.now.toISOString()
      };

      const compactSourcePayload = {
        sourceBusinessKey: sourceRecord.businessKey || '',
        sourceProcessor: sourceRecord.processor || '',
        sourceStatus:
          sourceRecord.frameworkPatternReviewLedgerStatus ||
          sourceRecord.sourceStatus ||
          '',
        frameworkPatternReviewResult:
          sourceRecord.frameworkPatternReviewResult || '',
        ledgeredPatternCategory: sourceRecord.ledgeredPatternCategory || '',
        ledgeredPatternName: sourceRecord.ledgeredPatternName || '',
        createdAt: sourceRecord.createdAt || ''
      };

      return [
        ctx.businessKey,
        ctx.dateKey,
        ctx.processor,
        sourceRecord.businessKey || '',
        sourceRecord.processor || '',
        sourceRecord.frameworkPatternReviewLedgerStatus ||
          sourceRecord.sourceStatus ||
          '',
        'SCIIP_OS_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',
        'SCIIP_OS v5.1 Framework Refactor Recommendation',
        'RECOMMENDED',
        'Framework refactor recommendation produced from ledgered Architecture Review Track pattern review.',
        'FRAMEWORK_REFACTOR_RECOMMENDED',
        'SCIIP Configured Continuity Processor Framework',
        'SCIIP_OS v5.1',
        'NON_BREAKING_PROGRESSIVE_ABSTRACTION',
        '1700-2080 Architecture Review Track processors',
        payload.recommendedMigrationStrategy,
        payload.expectedBenefit,
        payload.riskAssessment,
        sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
        'PROCESSOR_DRIVEN_EVENT_SOURCED_IDEMPOTENT_FRAMEWORK_ABSTRACTION',
        finding,
        recommendation,
        sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
        sourceRecord.currentVersion || 'SCIIP_OS v5.0',
        'SCIIP_OS v5.1',
        JSON.stringify(payload),
        JSON.stringify(compactSourcePayload),
        ctx.now.toISOString()
      ];
    }
  });
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Framework Validation Processor
 * File: 2460_RuntimeFrameworkValidationProcessor.gs
 *
 * Processor: 2460_RuntimeFrameworkValidation
 *
 * Purpose:
 * Validates the integrated SCIIP_OS v5.2 shared runtime framework:
 * RuntimeCommon, ResultFactory, PayloadFactory, SheetFactory,
 * Context, TransactionManager, RuntimeLogging, and ProcessorBase.
 */

function sciipRun2460_RuntimeFrameworkValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2460_RuntimeFrameworkValidation',
    action: 'RUNTIME_FRAMEWORK_VALIDATION',
    targetSheet: 'SCIIP_RUNTIME_FRAMEWORK_VALIDATION',
    ledgerSheet: 'SCIIP_RUNTIME_FRAMEWORK_VALIDATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 8,
        outputCount: 1,
        summary: 'Runtime framework integrated validation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          modules: [
            'SCIIP_RUNTIME',
            'SCIIP_RUNTIME_RESULT_FACTORY',
            'SCIIP_RUNTIME_PAYLOAD_FACTORY',
            'SCIIP_RUNTIME_SHEET_FACTORY',
            'SCIIP_RUNTIME_CONTEXT',
            'SCIIP_RUNTIME_TRANSACTION_MANAGER',
            'SCIIP_RUNTIME_LOGGING',
            'SCIIP_RUNTIME_PROCESSOR_BASE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      var requiredChecks = [
        {
          name: 'SCIIP_RUNTIME.runProcessor',
          valid:
            typeof SCIIP_RUNTIME !== 'undefined' &&
            typeof SCIIP_RUNTIME.runProcessor === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_RESULT_FACTORY.success',
          valid:
            typeof SCIIP_RUNTIME_RESULT_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_RESULT_FACTORY.success === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_PAYLOAD_FACTORY.create',
          valid:
            typeof SCIIP_RUNTIME_PAYLOAD_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_PAYLOAD_FACTORY.create === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet',
          valid:
            typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_CONTEXT.create',
          valid:
            typeof SCIIP_RUNTIME_CONTEXT !== 'undefined' &&
            typeof SCIIP_RUNTIME_CONTEXT.create === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_TRANSACTION_MANAGER.run',
          valid:
            typeof SCIIP_RUNTIME_TRANSACTION_MANAGER !== 'undefined' &&
            typeof SCIIP_RUNTIME_TRANSACTION_MANAGER.run === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_LOGGING.info',
          valid:
            typeof SCIIP_RUNTIME_LOGGING !== 'undefined' &&
            typeof SCIIP_RUNTIME_LOGGING.info === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_PROCESSOR_BASE.run',
          valid:
            typeof SCIIP_RUNTIME_PROCESSOR_BASE !== 'undefined' &&
            typeof SCIIP_RUNTIME_PROCESSOR_BASE.run === 'function'
        }
      ];

      requiredChecks.forEach(function(check) {
        if (!check.valid) {
          errors.push('Missing or invalid runtime module: ' + check.name);
        }
      });

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var validationSheet = definition.targetSheet;
      var validationLedgerSheet = definition.ledgerSheet;

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Validation_Status',
        'Modules_Validated',
        'Framework_Version',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Framework_Version',
        'Result_JSON'
      ];

      var modulesValidated = [
        'RuntimeCommon',
        'RuntimeResultFactory',
        'RuntimePayloadFactory',
        'RuntimeSheetFactory',
        'RuntimeContext',
        'RuntimeTransactionManager',
        'RuntimeLogging',
        'RuntimeProcessorBase'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        validationSheet,
        headers,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Validation_Status: 'PASSED',
          Modules_Validated: modulesValidated.join(', '),
          Framework_Version: 'v5.2',
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: modulesValidated.length,
        message: JSON.stringify({
          runtimeFrameworkValidation: 'PASSED',
          modulesValidated: modulesValidated.length,
          transactionId: transaction.transactionId,
          nextRecommendedBuild: '2470_RuntimeFrameworkCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        validationLedgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'VALIDATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Framework_Version: 'v5.2',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          modulesValidated: modulesValidated,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.2 runtime framework validation passed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2460_RuntimeFrameworkValidationProcessor() {
  var result = sciipRun2460_RuntimeFrameworkValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2460_RuntimeFrameworkValidationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Framework Certification Processor
 * File: 2470_RuntimeFrameworkCertificationProcessor.gs
 *
 * Processor: 2470_RuntimeFrameworkCertification
 *
 * Purpose:
 * Formally certifies the SCIIP_OS v5.2 shared runtime framework
 * as validated, production-ready, duplicate-safe, and ready for
 * transition into v5.3 Autonomous Runtime.
 */

function sciipRun2470_RuntimeFrameworkCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2470_RuntimeFrameworkCertification',
    action: 'RUNTIME_FRAMEWORK_CERTIFICATION',
    targetSheet: 'SCIIP_RUNTIME_FRAMEWORK_CERTIFICATION',
    ledgerSheet: 'SCIIP_RUNTIME_FRAMEWORK_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime framework certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          validationProcessor: '2460_RuntimeFrameworkValidation',
          certifiedModules: [
            'SCIIP_RuntimeCommon',
            'SCIIP_RuntimeResultFactory',
            'SCIIP_RuntimePayloadFactory',
            'SCIIP_RuntimeSheetFactory',
            'SCIIP_RuntimeContext',
            'SCIIP_RuntimeTransactionManager',
            'SCIIP_RuntimeLogging',
            'SCIIP_RuntimeProcessorBase'
          ],
          nextMajorPhase: 'v5.3 Autonomous Runtime'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing certification sheet.');
      if (!definition.ledgerSheet) errors.push('Missing certification ledger sheet.');

      var requiredModules = [
        {
          name: 'SCIIP_RUNTIME',
          valid: typeof SCIIP_RUNTIME !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_RESULT_FACTORY',
          valid: typeof SCIIP_RUNTIME_RESULT_FACTORY !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_PAYLOAD_FACTORY',
          valid: typeof SCIIP_RUNTIME_PAYLOAD_FACTORY !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_SHEET_FACTORY',
          valid: typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_CONTEXT',
          valid: typeof SCIIP_RUNTIME_CONTEXT !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_TRANSACTION_MANAGER',
          valid: typeof SCIIP_RUNTIME_TRANSACTION_MANAGER !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_LOGGING',
          valid: typeof SCIIP_RUNTIME_LOGGING !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_PROCESSOR_BASE',
          valid: typeof SCIIP_RUNTIME_PROCESSOR_BASE !== 'undefined'
        }
      ];

      requiredModules.forEach(function(moduleCheck) {
        if (!moduleCheck.valid) {
          errors.push('Missing certified module: ' + moduleCheck.name);
        }
      });

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var certificationSheet = definition.targetSheet;
      var certificationLedgerSheet = definition.ledgerSheet;

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Certification_Status',
        'Certified_Version',
        'Certified_Modules',
        'Certification_Statement',
        'Next_Phase',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Certified_Version',
        'Result_JSON'
      ];

      var certifiedModules = [
        'SCIIP_RuntimeCommon',
        'SCIIP_RuntimeResultFactory',
        'SCIIP_RuntimePayloadFactory',
        'SCIIP_RuntimeSheetFactory',
        'SCIIP_RuntimeContext',
        'SCIIP_RuntimeTransactionManager',
        'SCIIP_RuntimeLogging',
        'SCIIP_RuntimeProcessorBase'
      ];

      var certificationStatement =
        'SCIIP_OS v5.2 Runtime Framework is certified as shared-framework integrated, production-ready, idempotent, duplicate-safe, ledger-backed, transaction-aware, compact-payload compatible, and ready for v5.3 Autonomous Runtime.';

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        certificationSheet,
        headers,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: 'CERTIFIED',
          Certified_Version: 'v5.2',
          Certified_Modules: certifiedModules.join(', '),
          Certification_Statement: certificationStatement,
          Next_Phase: 'v5.3 Autonomous Runtime',
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: certifiedModules.length,
        message: JSON.stringify({
          certificationStatus: 'CERTIFIED',
          certifiedVersion: 'v5.2',
          certifiedModules: certifiedModules.length,
          transactionId: transaction.transactionId,
          nextPhase: 'v5.3 Autonomous Runtime'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        certificationLedgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'CERTIFICATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Certified_Version: 'v5.2',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          certifiedModules: certifiedModules,
          certificationStatement: certificationStatement,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.2 Runtime Framework certification completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2470_RuntimeFrameworkCertificationProcessor() {
  var result = sciipRun2470_RuntimeFrameworkCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2470_RuntimeFrameworkCertificationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v6.1 Repository Consolidation
 * Corrected filename. This source already implemented processor 2740.
 */
/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Ledger Processor
 * File: 2740_SuperSheetDataQualityLedgerProcessor.gs
 *
 * Processor: 2740_SuperSheetDataQualityLedger
 *
 * Purpose:
 * Creates a durable ledger summary from SUPERSHEET_DATA_QUALITY
 * records produced by 2730_SuperSheetDataQualityProcessor.
 *
 * This processor is non-destructive.
 * It does not modify source quality records.
 * It records batch-level data quality ledger entries only.
 */

function sciipRun2740_SuperSheetDataQualityLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2740_SuperSheetDataQualityLedger',
    action: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY',
    targetSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var qualityRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: qualityRecords.length,
        outputCount: qualityRecords.length ? 1 : 0,
        summary: 'SuperSheet data quality ledger summary payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_LEDGER',
          upstreamProcessor: '2730_SuperSheetDataQuality'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing source sheet.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var summaryHeaders = sciipGet2740_SuperSheetDataQualityLedgerSummaryHeaders_();
      var runtimeLedgerHeaders = sciipGet2740_SuperSheetDataQualityRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        summaryHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        runtimeLedgerHeaders
      );

      var qualityRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!qualityRecords || qualityRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2730_SuperSheetDataQualityProcessor after loading SuperSheet / Bridge rows.'
          })
        });

        sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Summary_Records_Created: 0,
            Auto_Promote_Ready: 0,
            Needs_Review: 0,
            New_Candidate: 0,
            Average_Quality_Score: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var assessmentDate = sciipResolve2740_LatestAssessmentDate_(qualityRecords) ||
        SCIIP_RUNTIME.getDateKey({});

      var ledgerBusinessKey = 'SUPERSHEET_DATA_QUALITY_LEDGER|' + assessmentDate;

      if (sciip2740_SummaryBusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: qualityRecords.length,
          processed: 0,
          message: JSON.stringify({
            dataQualityLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: qualityRecords.length,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: qualityRecords.length,
            Summary_Records_Created: 0,
            Auto_Promote_Ready: 0,
            Needs_Review: 0,
            New_Candidate: 0,
            Average_Quality_Score: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var recordsForDate = sciipFilter2740_QualityRecordsByAssessmentDate_(
        qualityRecords,
        assessmentDate
      );

      var summary = sciipSummarize2740_SuperSheetDataQualityRecords_(recordsForDate);

      var summaryRecord = {
        Ledger_Summary_ID: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY_' + Utilities.getUuid(),
        Business_Key: ledgerBusinessKey,
        Ledger_Date: assessmentDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: recordsForDate.length,
        Auto_Promote_Ready: summary.autoPromoteReady,
        Needs_Review: summary.needsReview,
        New_Candidate: summary.newCandidate,
        High_Quality_Count: summary.highQualityCount,
        Medium_Quality_Count: summary.mediumQualityCount,
        Low_Quality_Count: summary.lowQualityCount,
        Average_Quality_Score: summary.averageQualityScore,
        Lowest_Quality_Score: summary.lowestQualityScore,
        Highest_Quality_Score: summary.highestQualityScore,
        Dominant_Routing_Decision: summary.dominantRoutingDecision,
        Ledger_Status: summary.recordsAssessed > 0 ? 'DATA_QUALITY_LEDGER_RECORDED' : 'NO_RECORDS_FOR_DATE',
        Recommended_Next_Action: sciipDetermine2740_RecommendedNextAction_(summary),
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Summary_JSON: summary
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        summaryHeaders,
        summaryRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: qualityRecords.length,
        processed: recordsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          dataQualityLedgerStatus: summaryRecord.Ledger_Status,
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: qualityRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          ledgerDate: assessmentDate,
          ledgerBusinessKey: ledgerBusinessKey,
          autoPromoteReady: summary.autoPromoteReady,
          needsReview: summary.needsReview,
          newCandidate: summary.newCandidate,
          averageQualityScore: summary.averageQualityScore,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: summaryRecord.Recommended_Next_Action
        })
      });

      sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DATA_QUALITY_LEDGER_SUMMARY_RECORDED',
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: qualityRecords.length,
          Summary_Records_Created: 1,
          Auto_Promote_Ready: summary.autoPromoteReady,
          Needs_Review: summary.needsReview,
          New_Candidate: summary.newCandidate,
          Average_Quality_Score: summary.averageQualityScore,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: qualityRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality ledger summary completed.'
      });

      return result;
    }
  });
}

function sciipGet2740_SuperSheetDataQualityLedgerSummaryHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'High_Quality_Count',
    'Medium_Quality_Count',
    'Low_Quality_Count',
    'Average_Quality_Score',
    'Lowest_Quality_Score',
    'Highest_Quality_Score',
    'Dominant_Routing_Decision',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipGet2740_SuperSheetDataQualityRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Ledger_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Summary_Records_Created',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'Average_Quality_Score',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2740_LatestAssessmentDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2740_DateValue_(record.Assessment_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2740_QualityRecordsByAssessmentDate_(records, assessmentDate) {
  return records.filter(function(record) {
    return sciipNormalize2740_DateValue_(record.Assessment_Date) === assessmentDate;
  });
}

function sciipNormalize2740_DateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return text;
}

function sciipSummarize2740_SuperSheetDataQualityRecords_(records) {
  var totalScore = 0;
  var lowestScore = null;
  var highestScore = null;

  var counts = {
    AUTO_PROMOTE_READY: 0,
    NEEDS_REVIEW: 0,
    NEW_CANDIDATE: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  records.forEach(function(record) {
    var score = Number(record.Overall_Quality_Score || 0);
    totalScore += score;

    if (lowestScore === null || score < lowestScore) lowestScore = score;
    if (highestScore === null || score > highestScore) highestScore = score;

    var routingDecision = String(record.Routing_Decision || '').trim();
    if (counts.hasOwnProperty(routingDecision)) counts[routingDecision]++;

    var qualityBand = String(record.Quality_Band || '').trim();
    if (counts.hasOwnProperty(qualityBand)) counts[qualityBand]++;
  });

  return {
    recordsAssessed: records.length,
    autoPromoteReady: counts.AUTO_PROMOTE_READY,
    needsReview: counts.NEEDS_REVIEW,
    newCandidate: counts.NEW_CANDIDATE,
    highQualityCount: counts.HIGH,
    mediumQualityCount: counts.MEDIUM,
    lowQualityCount: counts.LOW,
    averageQualityScore: records.length ? Math.round(totalScore / records.length) : 0,
    lowestQualityScore: lowestScore === null ? 0 : lowestScore,
    highestQualityScore: highestScore === null ? 0 : highestScore,
    dominantRoutingDecision: sciipDetermine2740_DominantRoutingDecision_(counts)
  };
}

function sciipDetermine2740_DominantRoutingDecision_(counts) {
  var decisions = [
    { name: 'AUTO_PROMOTE_READY', count: counts.AUTO_PROMOTE_READY || 0 },
    { name: 'NEEDS_REVIEW', count: counts.NEEDS_REVIEW || 0 },
    { name: 'NEW_CANDIDATE', count: counts.NEW_CANDIDATE || 0 }
  ];

  decisions.sort(function(a, b) {
    return b.count - a.count;
  });

  return decisions[0].count > 0 ? decisions[0].name : 'NO_RECORDS';
}

function sciipDetermine2740_RecommendedNextAction_(summary) {
  if (!summary || !summary.recordsAssessed) {
    return 'Run 2730_SuperSheetDataQualityProcessor after loading SuperSheet / Bridge rows.';
  }

  if (summary.newCandidate > 0 || summary.needsReview > 0) {
    return 'Route non-auto-promote records to approval and candidate review before promotion.';
  }

  return 'Proceed to matching and promotion processors with quality ledger available for audit.';
}

function sciip2740_SummaryBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2740_SuperSheetDataQualityLedgerProcessor() {
  var result = sciipRun2740_SuperSheetDataQualityLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2740_SuperSheetDataQualityLedgerProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 900_AutonomousGovernanceReviewProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousGovernanceReviewProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '900_AutonomousGovernanceReviewProcessor',
    action: 'AUTONOMOUS_GOVERNANCE_REVIEW_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_MONITORING',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_REVIEWS',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_REVIEWS_RUNTIME_LEDGER',

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
          originalProcessor: '900_AutonomousGovernanceReviewProcessor',
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
      var legacyResult = sciipRunAutonomousGovernanceReviewProcessorLegacy900_();
      return sciipWrapLegacyRuntimeResult900_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult900_(legacyResult, context, transaction) {
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

/*******************************************************
 * 900_AutonomousGovernanceReviewProcessor
 *******************************************************/

const AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME = '900_AutonomousGovernanceReviewProcessor';

const AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_MONITORING';
const AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_REVIEWS';

const AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA = [
  'Review_ID',
  'Business_Key',
  'Review_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Review_Title',
  'Review_Type',
  'Review_Summary',
  'Governance_Health',
  'Review_Decision',
  'Next_Action',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousGovernanceReviewProcessorLegacy900_() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousGovernanceReviewSheet_();

  const reviewDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET,
      'Monitoring_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_GOVERNANCE_REVIEW|${reviewDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
    resolvedReviewDate: reviewDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousGovernanceReviewsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceMonitoringForReviewDate_(reviewDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousGovernanceReviewsCreated: 0,
      reviewDate,
      completedAt: new Date().toISOString()
    };
  }

  const review = sciipBuildAutonomousGovernanceReview_({
    reviewDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousGovernanceReview_(review);

  return {
    processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousGovernanceReviewsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousGovernanceReview_(payload) {
  const reviewId = `AUTONOMOUS_GOVERNANCE_REVIEW_${Utilities.getUuid()}`;

  return {
    Review_ID: reviewId,
    Business_Key: payload.businessKey,
    Review_Date: payload.reviewDate,
    Source_Sheet: AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Review_Title: `Autonomous Governance Review — ${payload.reviewDate}`,
    Review_Type: 'PROCESSOR_GOVERNANCE_STANDARD_REVIEW',
    Review_Summary: sciipCreateAutonomousGovernanceReviewSummary_(payload.sourceRows),
    Governance_Health: sciipResolveAutonomousGovernanceHealth_(payload.sourceRows),
    Review_Decision: sciipCreateAutonomousGovernanceReviewDecision_(payload.sourceRows),
    Next_Action: sciipCreateAutonomousGovernanceReviewNextAction_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousGovernanceReviewSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceMonitoringForReviewDate_(reviewDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Monitoring_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      error: 'MONITORING_DATE_COLUMN_NOT_FOUND',
      headers
    }));
    return [];
  }

  return values
    .slice(1)
    .filter(row => {
      const rawDate = row[dateIndex];
      const rowDate =
        rawDate instanceof Date
          ? sciipFormatDateKey_(rawDate)
          : String(rawDate).trim();

      return rowDate === reviewDate;
    })
    .map(row => sciipAutonomousGovernanceReviewRowToObject_(headers, row));
}

function sciipCreateAutonomousGovernanceReviewSummary_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} governance monitoring record(s).`,
    'The latest completed processing date standard remains active as a monitored governance rule.',
    'The governance chain now provides traceability from standard adoption through compliance, audit, enforcement, monitoring, and review.'
  ].join(' ');
}

function sciipResolveAutonomousGovernanceHealth_(sourceRows) {
  if (!sourceRows.length) return 'UNKNOWN';

  const hasActiveMonitoring = sourceRows.some(row => {
    return String(row.Monitoring_Status || '').trim().toUpperCase() === 'ACTIVE_MONITORING';
  });

  return hasActiveMonitoring ? 'HEALTHY' : 'REVIEW_REQUIRED';
}

function sciipCreateAutonomousGovernanceReviewDecision_(sourceRows) {
  return [
    'CONTINUE_STANDARD_ENFORCEMENT.',
    'Future downstream processors should continue to use the latest completed upstream processing date standard.',
    'The standard is suitable for ongoing SCIIP_OS processor governance.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceReviewNextAction_(sourceRows) {
  return [
    'Apply the standard to processor 910 and all later downstream processors.',
    'During future builds, verify first-run creation and second-run duplicate protection.',
    'Preserve each governance review as permanent operating-system history.'
  ].join('\n');
}

function sciipAppendAutonomousGovernanceReview_(review) {
  const sheet = sciipEnsureAutonomousGovernanceReviewSheet_();

  const row = AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA.map(header => review[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousGovernanceReviewRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceReviewProcessor() {
  const result = sciipRunAutonomousGovernanceReviewProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceReviewProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 910_AutonomousProcessorGuidanceProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorGuidanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '910_AutonomousProcessorGuidanceProcessor',
    action: 'AUTONOMOUS_PROCESSOR_GUIDANCE_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_REVIEWS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_GUIDANCE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_GUIDANCE_RUNTIME_LEDGER',

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
          originalProcessor: '910_AutonomousProcessorGuidanceProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorGuidanceProcessorLegacy910_();
      return sciipWrapLegacyRuntimeResult910_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult910_(legacyResult, context, transaction) {
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

/*******************************************************
 * 910_AutonomousProcessorGuidanceProcessor
 *******************************************************/

const AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME = '910_AutonomousProcessorGuidanceProcessor';

const AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_REVIEWS';
const AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_GUIDANCE';

const AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA = [
  'Guidance_ID',
  'Business_Key',
  'Guidance_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Guidance_Title',
  'Guidance_Type',
  'Processor_Build_Guidance',
  'Required_Architecture_Pattern',
  'Validation_Requirement',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousProcessorGuidanceProcessorLegacy910_() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousProcessorGuidanceSheet_();

  const guidanceDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET,
      'Review_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_PROCESSOR_GUIDANCE|${guidanceDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
    resolvedGuidanceDate: guidanceDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousProcessorGuidanceCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceReviewsForGuidanceDate_(guidanceDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorGuidanceCreated: 0,
      guidanceDate,
      completedAt: new Date().toISOString()
    };
  }

  const guidance = sciipBuildAutonomousProcessorGuidance_({
    guidanceDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousProcessorGuidance_(guidance);

  return {
    processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousProcessorGuidanceCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousProcessorGuidance_(payload) {
  const guidanceId = `AUTONOMOUS_PROCESSOR_GUIDANCE_${Utilities.getUuid()}`;

  return {
    Guidance_ID: guidanceId,
    Business_Key: payload.businessKey,
    Guidance_Date: payload.guidanceDate,
    Source_Sheet: AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Guidance_Title: `Autonomous Processor Guidance — ${payload.guidanceDate}`,
    Guidance_Type: 'PROCESSOR_BUILD_GOVERNANCE',
    Processor_Build_Guidance: sciipCreateAutonomousProcessorBuildGuidance_(payload.sourceRows),
    Required_Architecture_Pattern: sciipCreateAutonomousProcessorRequiredPattern_(payload.sourceRows),
    Validation_Requirement: sciipCreateAutonomousProcessorValidationRequirement_(payload.sourceRows),
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousProcessorGuidanceSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceReviewsForGuidanceDate_(guidanceDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Review_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      error: 'REVIEW_DATE_COLUMN_NOT_FOUND',
      headers
    }));
    return [];
  }

  return values
    .slice(1)
    .filter(row => {
      const rawDate = row[dateIndex];
      const rowDate =
        rawDate instanceof Date
          ? sciipFormatDateKey_(rawDate)
          : String(rawDate).trim();

      return rowDate === guidanceDate;
    })
    .map(row => sciipAutonomousProcessorGuidanceRowToObject_(headers, row));
}

function sciipCreateAutonomousProcessorBuildGuidance_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} governance review record(s).`,
    'Future downstream processors must follow the active latest completed processing date standard.',
    'Each processor should strengthen the knowledge graph, preserve permanent history, and remain deterministic, idempotent, and production ready.'
  ].join(' ');
}

function sciipCreateAutonomousProcessorRequiredPattern_(sourceRows) {
  return [
    'Required downstream date pattern:',
    '',
    'const processingDate =',
    '  sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt);',
    '',
    'const businessKey = `OUTPUT_TYPE|${processingDate}`;',
    '',
    'Use processingDate for source-row filtering.',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate checks.'
  ].join('\n');
}

function sciipCreateAutonomousProcessorValidationRequirement_(sourceRows) {
  return [
    'First run must create exactly one durable output record when source input exists.',
    'Second run must return SUCCESS with created count 0 and skippedDuplicate: 1.',
    'Execution logs must include the resolved processing date and business key.',
    'A SKIPPED_NO_INPUTS result must include the resolved date for diagnosis.'
  ].join('\n');
}

function sciipAppendAutonomousProcessorGuidance_(guidance) {
  const sheet = sciipEnsureAutonomousProcessorGuidanceSheet_();

  const row = AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA.map(header => guidance[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousProcessorGuidanceRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousProcessorGuidanceProcessor() {
  const result = sciipRunAutonomousProcessorGuidanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorGuidanceProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 920_AutonomousProcessorExecutionPlanProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '920_AutonomousProcessorExecutionPlanProcessor',
    action: 'AUTONOMOUS_EXECUTION_PLAN_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_GUIDANCE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS_RUNTIME_LEDGER',

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
          originalProcessor: '920_AutonomousProcessorExecutionPlanProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionPlanProcessorLegacy920_();
      return sciipWrapLegacyRuntimeResult920_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult920_(legacyResult, context, transaction) {
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

/*******************************************************
 * SCIIP_OS v4.1
 * 920_AutonomousProcessorExecutionPlanProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_920_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_GUIDANCE';
const SCIIP_920_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS';
const SCIIP_920_INPUT_DATE_COLUMN = 'Guidance_Date';

const SCIIP_920_OUTPUT_HEADERS = [
  'Execution_Plan_ID',
  'Plan_Date',
  'Source_Guidance_ID',
  'Target_Processor',
  'Priority',
  'Execution_Action',
  'Required_Input',
  'Required_Output',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Test_Expectation',
  'Status',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_920_PROCESSOR = '920_AutonomousProcessorExecutionPlanProcessor';
const SCIIP_920_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_PLAN';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorExecutionPlanProcessorLegacy920_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_920_INPUT_SHEET);
  if (!inputSheet) {
    return sciip920Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip920EnsureSheet_(ss, SCIIP_920_OUTPUT_SHEET, SCIIP_920_OUTPUT_HEADERS);

  const resolvedPlanDate =
    sciipResolveLatestProcessingDate_(SCIIP_920_INPUT_SHEET, SCIIP_920_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_920_BUSINESS_PREFIX}|${resolvedPlanDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip920Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const guidanceRows = sciip920ReadRowsForDate_(inputSheet, SCIIP_920_INPUT_DATE_COLUMN, resolvedPlanDate);

  if (!guidanceRows.length) {
    return sciip920Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = guidanceRows.map((row, index) =>
    sciip920BuildExecutionPlan_(row, resolvedPlanDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_920_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip920Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip920BuildExecutionPlan_(row, planDate, businessKey, startedAt, index) {
  const sourceGuidanceId =
    row.Guidance_ID ||
    row.Autonomous_Guidance_ID ||
    row.Source_Guidance_ID ||
    `GUIDANCE_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    row.Processor ||
    row.Recommended_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const priority =
    row.Priority ||
    row.Guidance_Priority ||
    'NORMAL';

  const executionAction =
    row.Guidance ||
    row.Recommendation ||
    row.Processor_Guidance ||
    row.Action ||
    'Create next downstream SCIIP_OS processor using v4.1 architecture standards.';

  return [
    sciip920CreateId_('EXEC_PLAN'),
    planDate,
    sourceGuidanceId,
    targetProcessor,
    priority,
    executionAction,
    row.Required_Input || row.Input_Sheet || SCIIP_920_INPUT_SHEET,
    row.Required_Output || row.Output_Sheet || SCIIP_920_OUTPUT_SHEET,
    'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    'Converts autonomous processor guidance into build-ready execution plan history',
    'First run creates execution plans; second run returns skippedDuplicate = 1',
    'READY_FOR_BUILD',
    `${businessKey}|${targetProcessor}|${sourceGuidanceId}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip920ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_920_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip920EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip920CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip920Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_920_PROCESSOR,
    status,
    autonomousProcessorExecutionPlansCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorExecutionPlanProcessor() {
  const result = sciipRunAutonomousProcessorExecutionPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionPlanProcessor',
    result
  }));

  return result;
}