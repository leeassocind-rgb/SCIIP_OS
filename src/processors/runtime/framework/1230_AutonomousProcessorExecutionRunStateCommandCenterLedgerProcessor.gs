/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessorLegacy1230_();
      return sciipWrapLegacyRuntimeResult1230_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1230_(legacyResult, context, transaction) {
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
 * 1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR =
  '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Command_Center_Record_ID',
  'Command_Center_Type',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Display_Message',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Latest_Signal_ID',
  'Latest_Signal_Category',
  'Latest_Signal_Severity',
  'Latest_Signal_Status',
  'Latest_Operational_State',
  'Source_Ledger_Entry_ID',
  'Source_Digest_ID',
  'Source_Command_Center_Business_Key',
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
function sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessorLegacy1230_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const commandCenterRows =
    sciipReadAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateCommandCenterLedgerRowsByDate_(
      commandCenterRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestCommandCenterRecord =
    sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateCommandCenterLedgerEntry_(
      latestCommandCenterRecord,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS.filter(
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
function sciipBuildAutonomousProcessorExecutionRunStateCommandCenterLedgerEntry_(
  record,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSCCL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    commandCenterRecordId: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Record_ID'
    ]),
    commandCenterType: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Type'
    ]),
    commandCenterStatus: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Status'
    ]),
    displaySeverity: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Severity'
    ]),
    displayPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Posture'
    ]),
    dashboardPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Dashboard_Posture'
    ]),
    governancePosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Governance_Posture'
    ]),
    orchestrationPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Orchestration_Posture'
    ]),
    decisioningPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Decisioning_Posture'
    ]),
    recommendedAction: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Recommended_Action'
    ]),
    autonomousActionAllowed: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Human_Review_Required'
    ]),
    sourceCommandCenterBusinessKey: sciipGetRunStateCommandCenterLedgerInputValue_(
      record,
      ['Business_Key']
    ),
    sourceBusinessKey: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Business_Key'
    ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Record_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Type'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Severity'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Message'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Dashboard_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Governance_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Recommended_Action'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Category'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Severity'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Status'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Operational_State'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Digest_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Business_Key'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRows_(
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
function sciipFilterAutonomousProcessorExecutionRunStateCommandCenterLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateCommandCenterLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Command_Center_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateCommandCenterLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateCommandCenterLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateCommandCenterLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateCommandCenterLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateCommandCenterLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
    result: result
  }));

  return result;
}