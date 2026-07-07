/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessorLegacy1190_();
      return sciipWrapLegacyRuntimeResult1190_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1190_(legacyResult, context, transaction) {
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
 * 1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR =
  '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Signal_ID',
  'Signal_Type',
  'Signal_Category',
  'Signal_Severity',
  'Signal_Status',
  'Signal_Message',
  'Operational_State',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Signal_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessorLegacy1190_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const signalRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalLedgerRowsByDate_(
      signalRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestSignal =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignalLedgerEntry_(
      latestSignal,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateSignalLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignalLedgerEntry_(
  signal,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSSL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    signalId: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_ID']),
    signalType: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Type']),
    signalCategory: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Category']),
    signalSeverity: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Severity']),
    signalStatus: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Status']),
    operationalState: sciipGetRunStateSignalLedgerInputValue_(signal, ['Operational_State']),
    governancePosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Decisioning_Posture']),
    recommendedAction: sciipGetRunStateSignalLedgerInputValue_(signal, ['Recommended_Action']),
    autonomousActionAllowed: sciipGetRunStateSignalLedgerInputValue_(signal, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateSignalLedgerInputValue_(signal, ['Human_Review_Required']),
    sourceLedgerEntryId: sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Ledger_Entry_ID']),
    sourceBusinessKey: sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Business_Key']),
    sourceSignalBusinessKey: sciipGetRunStateSignalLedgerInputValue_(signal, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_ID']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Type']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Category']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Severity']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Status']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Message']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Operational_State']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Governance_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Orchestration_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Dashboard_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Decisioning_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Recommended_Action']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Autonomous_Action_Allowed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Human_Review_Required']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Unique_Processors_Observed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Healthy_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Warning_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Blocked_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Failed_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Skipped_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Duplicate_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Ledger_Entry_ID']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Business_Key']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalLedgerInputRows_(
  sheet
) {
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
function sciipFilterAutonomousProcessorExecutionRunStateSignalLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalLedgerInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalLedgerInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateSignalLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalLedgerProcessor',
    result: result
  }));

  return result;
}