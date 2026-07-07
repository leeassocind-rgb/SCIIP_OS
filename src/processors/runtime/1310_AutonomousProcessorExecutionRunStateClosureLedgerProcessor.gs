/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessorLegacy1310_();
      return sciipWrapLegacyRuntimeResult1310_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1310_(legacyResult, context, transaction) {
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
 * 1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR =
  '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Closure_ID',
  'Closure_Type',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Closure_Message',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Decision',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Finalization_ID',
  'Source_Ledger_Entry_ID',
  'Source_Closure_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessorLegacy1310_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateClosureLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const closureRows =
    sciipReadAutonomousProcessorExecutionRunStateClosureLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateClosureLedgerRowsByDate_(
      closureRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestClosure =
    sciipResolveLatestAutonomousProcessorExecutionRunStateClosureLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateClosureLedgerEntry_(
      latestClosure,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateClosureLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

function sciipBuildAutonomousProcessorExecutionRunStateClosureLedgerEntry_(
  closure,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSCL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    closureId: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_ID']),
    closureType: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Type']),
    closureStatus: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Status']),
    closureSeverity: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Severity']),
    closureDecision: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Decision']),
    runStateClosed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Run_State_Closed']),
    closureConfirmed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Confirmed']),
    readyForDownstreamUse: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Downstream_Use']),
    readyForGovernance: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Governance']),
    readyForDashboard: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Dashboard']),
    readyForAutonomousDecisioning: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Autonomous_Decisioning']),
    autonomousActionAllowed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateClosureLedgerInputValue_(closure, ['Human_Review_Required']),
    sourceClosureBusinessKey: sciipGetRunStateClosureLedgerInputValue_(closure, ['Business_Key']),
    sourceBusinessKey: sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Type']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Status']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Severity']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Decision']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Message']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Run_State_Closed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Confirmed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Downstream_Use']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Governance']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Dashboard']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Autonomous_Decisioning']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Autonomous_Action_Allowed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Human_Review_Required']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Status']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Severity']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Decision']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Operational_Risk']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Recommended_Action']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Governance_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Orchestration_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Decisioning_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Signals_Reviewed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Critical_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['High_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Medium_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Low_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Finalization_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Ledger_Entry_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Business_Key']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

function sciipReadAutonomousProcessorExecutionRunStateClosureLedgerInputRows_(
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

function sciipFilterAutonomousProcessorExecutionRunStateClosureLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateClosureLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Closure_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateClosureLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateClosureLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateClosureLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateClosureLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateClosureLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateClosureLedgerDateKey_(value) {
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

function sciipTestAutonomousProcessorExecutionRunStateClosureLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateClosureLedgerProcessor',
    result: result
  }));

  return result;
}