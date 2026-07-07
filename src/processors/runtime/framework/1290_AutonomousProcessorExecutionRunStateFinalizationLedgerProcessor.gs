/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessorLegacy1290_();
      return sciipWrapLegacyRuntimeResult1290_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1290_(legacyResult, context, transaction) {
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
 * 1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR =
  '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Finalization_ID',
  'Finalization_Type',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Message',
  'Finalization_Decision',
  'Run_State_Closed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Status',
  'Executive_Severity',
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
  'Source_Daily_Brief_ID',
  'Source_Ledger_Entry_ID',
  'Source_Finalization_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessorLegacy1290_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateFinalizationLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const finalizationRows =
    sciipReadAutonomousProcessorExecutionRunStateFinalizationLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateFinalizationLedgerRowsByDate_(
      finalizationRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestFinalization =
    sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateFinalizationLedgerEntry_(
      latestFinalization,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateFinalizationLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

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
function sciipBuildAutonomousProcessorExecutionRunStateFinalizationLedgerEntry_(
  finalization,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSFL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    finalizationId: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_ID']
    ),
    finalizationType: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Type']
    ),
    finalizationStatus: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Status']
    ),
    finalizationSeverity: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Severity']
    ),
    finalizationDecision: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Decision']
    ),
    runStateClosed: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Run_State_Closed']
    ),
    readyForDownstreamUse: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Downstream_Use']
    ),
    readyForGovernance: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Governance']
    ),
    readyForDashboard: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Dashboard']
    ),
    readyForAutonomousDecisioning:
      sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
        'Ready_For_Autonomous_Decisioning'
      ]),
    autonomousActionAllowed: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Autonomous_Action_Allowed']
    ),
    humanReviewRequired: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Human_Review_Required']
    ),
    sourceFinalizationBusinessKey:
      sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
        'Business_Key'
      ]),
    sourceBusinessKey: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Source_Business_Key']
    )
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Type'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Message'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Decision'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Run_State_Closed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Downstream_Use'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Governance'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Dashboard'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Autonomous_Decisioning'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Title'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Text'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Executive_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Executive_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Operational_Risk'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Recommended_Action'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Governance_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Daily_Brief_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Business_Key'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateFinalizationLedgerInputRows_(
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
function sciipFilterAutonomousProcessorExecutionRunStateFinalizationLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateFinalizationLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Finalization_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateFinalizationLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateFinalizationLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateFinalizationLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateFinalizationLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateFinalizationLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
    result: result
  }));

  return result;
}