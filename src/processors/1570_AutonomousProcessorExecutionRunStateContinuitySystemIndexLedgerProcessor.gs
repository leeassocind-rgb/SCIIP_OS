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