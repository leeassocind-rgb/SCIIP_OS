/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessorLegacy1170_();
      return sciipWrapLegacyRuntimeResult1170_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1170_(legacyResult, context, transaction) {
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
 * 1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR =
  '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_ID',
  'Digest_Type',
  'Operational_State',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Operational_Interpretation',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Latest_Processor',
  'Latest_Status',
  'Latest_Business_Key',
  'Latest_Completed_At',
  'Ledger_Summary_JSON',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessorLegacy1170_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDigestLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digestRows =
    sciipReadAutonomousProcessorExecutionRunStateDigestRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDigestRowsByDate_(
      digestRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestDigest =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDigestRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateDigestLedgerEntry_(
      latestDigest,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDigestLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDigestLedgerEntry_(
  digest,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSDL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    digestId: sciipGetRunStateDigestValue_(digest, ['Digest_ID']),
    operationalState: sciipGetRunStateDigestValue_(digest, ['Operational_State']),
    governancePosture: sciipGetRunStateDigestValue_(digest, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateDigestValue_(digest, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateDigestValue_(digest, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateDigestValue_(digest, ['Decisioning_Posture']),
    sourceBusinessKey: sciipGetRunStateDigestValue_(digest, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateDigestValue_(digest, ['Digest_ID']),
    sciipGetRunStateDigestValue_(digest, ['Digest_Type']),
    sciipGetRunStateDigestValue_(digest, ['Operational_State']),
    sciipGetRunStateDigestValue_(digest, ['Governance_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Orchestration_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Dashboard_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Decisioning_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Operational_Interpretation']),
    sciipGetRunStateDigestValue_(digest, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateDigestValue_(digest, ['Unique_Processors_Observed']),
    sciipGetRunStateDigestValue_(digest, ['Healthy_Count']),
    sciipGetRunStateDigestValue_(digest, ['Warning_Count']),
    sciipGetRunStateDigestValue_(digest, ['Blocked_Count']),
    sciipGetRunStateDigestValue_(digest, ['Failed_Count']),
    sciipGetRunStateDigestValue_(digest, ['Skipped_Count']),
    sciipGetRunStateDigestValue_(digest, ['Duplicate_Count']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Processor']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Status']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Business_Key']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Completed_At']),
    JSON.stringify(summary),
    sciipGetRunStateDigestValue_(digest, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDigestRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateDigestRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDigestValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDigestLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDigestRow_(rows) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDigestValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDigestValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDigestValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDigestLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateDigestLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDigestLedgerProcessor',
    result: result
  }));

  return result;
}