/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessorLegacy1370_();
      return sciipWrapLegacyRuntimeResult1370_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1370_(legacyResult, context, transaction) {
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
 * 1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER
 */

const SCIIP_1370_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL';
const SCIIP_1370_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER';
const SCIIP_1370_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessorLegacy1370_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1370ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1370_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1370EnsureSheet_(ss, SCIIP_1370_TARGET_SHEET, sciip1370TargetHeaders_());

  if (sciip1370BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1370_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1370HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1370Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1370Get_(row, sourceMap, [
      'Signal_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1370NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSignalIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const statuses = {};

  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const signalId = sciip1370Get_(row, sourceMap, ['Signal_Id', 'Signal_ID', 'signalId']);
    const sourceBusinessKey = sciip1370Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const signalType = sciip1370Get_(row, sourceMap, ['Signal_Type', 'signalType']);
    const severity = sciip1370Get_(row, sourceMap, ['Severity', 'severity']);
    const status = sciip1370Get_(row, sourceMap, ['Status', 'status']);

    if (signalId) sourceSignalIds.push(String(signalId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (signalType) signalTypes[String(signalType)] = true;
    if (severity) severities[String(severity)] = true;
    if (status) statuses[String(status)] = true;

    sourceLedgerEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_SIGNAL_LEDGER_${Utilities.getUuid()}`;

  const ledgerSummary =
    `Continuity signal ledger entry for ${dateKey}: ` +
    `${relevantRows.length} signal entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `signal types: ${Object.keys(signalTypes).join(', ') || 'NONE'}; ` +
    `severity: ${Object.keys(severities).join(', ') || 'NONE'}; ` +
    `${failedEntries} failed underlying continuity entries.`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(statuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1370_SOURCE_SHEET,
    relevantRows.length,
    sourceSignalIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(statuses).join(', '),
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
    processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    result
  }));
  return result;
}

function sciip1370TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Signal_Entries_Reviewed',
    'Source_Signal_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
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

function sciip1370EnsureSheet_(ss, sheetName, headers) {
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

function sciip1370HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1370Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1370BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1370_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1370HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1370ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1370_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1370ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1370HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1370Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const signalDate = sciip1370Get_(row, map, ['Signal_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1370NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1370NormalizeDateKey_(signalDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1370ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1370ResolveDateKey_(value) {
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

function sciip1370NormalizeDateKey_(value) {
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