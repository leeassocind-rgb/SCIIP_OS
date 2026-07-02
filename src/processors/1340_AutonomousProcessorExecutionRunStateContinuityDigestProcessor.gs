/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_RUNTIME_LEDGER',

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
          originalProcessor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessorLegacy1340_();
      return sciipWrapLegacyRuntimeResult1340_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1340_(legacyResult, context, transaction) {
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
 * 1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST
 */

const SCIIP_1340_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER';
const SCIIP_1340_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';
const SCIIP_1340_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessorLegacy1340_() {
  const ss = sciipGetSpreadsheet_();
  const processingDate = sciipResolveLatestProcessingDate_();
  const dateKey = sciip1340ResolveDateKey_(processingDate);
  const businessKey = `${SCIIP_1340_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1340EnsureSheet_(ss, SCIIP_1340_TARGET_SHEET, sciip1340TargetHeaders_());

  if (sciip1340BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1340_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1340HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1340Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1340Get_(row, sourceMap, [
      'Date_Key',
      'Ledger_Date',
      'Continuity_Date',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1340NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  let successCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;
  const processors = {};
  const sourceBusinessKeys = [];

  relevantRows.forEach(row => {
    const status = String(sciip1340Get_(row, sourceMap, ['Status', 'status']) || '').toUpperCase();
    const skippedDuplicate = Number(sciip1340Get_(row, sourceMap, ['Skipped_Duplicate', 'skippedDuplicate']) || 0);
    const processor = sciip1340Get_(row, sourceMap, ['Processor', 'processor']);
    const sourceBusinessKey = sciip1340Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (processor) processors[String(processor)] = true;
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    if (status === 'SUCCESS') successCount++;
    if (skippedDuplicate > 0) duplicateCount++;
    if (status === 'FAILED' || status === 'ERROR') failedCount++;
  });

  const digestSummary =
    `Continuity ledger digest for ${dateKey}: ` +
    `${relevantRows.length} ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${successCount} successful; ${duplicateCount} duplicate/idempotent; ${failedCount} failed.`;

  const digestId = `APRSC_DIGEST_${Utilities.getUuid()}`;

  targetSheet.appendRow([
    digestId,
    businessKey,
    dateKey,
    SCIIP_1340_SOURCE_SHEET,
    relevantRows.length,
    successCount,
    duplicateCount,
    failedCount,
    Object.keys(processors).join(', '),
    sourceBusinessKeys.join(', '),
    digestSummary,
    failedCount > 0 ? 'REVIEW_REQUIRED' : 'SUCCESS',
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    result
  }));
  return result;
}

function sciip1340TargetHeaders_() {
  return [
    'Digest_Id',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Ledger_Entries_Reviewed',
    'Successful_Continuity_Ledger_Entries',
    'Duplicate_Continuity_Ledger_Entries',
    'Failed_Continuity_Ledger_Entries',
    'Source_Processors',
    'Source_Business_Keys',
    'Digest_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1340EnsureSheet_(ss, sheetName, headers) {
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

function sciip1340HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1340Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1340BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1340_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1340HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1340ResolveDateKey_(value) {
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

function sciip1340NormalizeDateKey_(value) {
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