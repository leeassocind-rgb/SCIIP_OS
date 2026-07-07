/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_RUNTIME_LEDGER',

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
          originalProcessor: '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessorLegacy1220_();
      return sciipWrapLegacyRuntimeResult1220_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1220_(legacyResult, context, transaction) {
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
 * 1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR =
  '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS = [
  'Command_Center_Record_ID',
  'Business_Key',
  'Run_State_Date',
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
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Command_Center_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessorLegacy1220_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateCommandCenterInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateCommandCenterRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterInputRow_(
      sourceRows
    );

  const commandCenterRow =
    sciipBuildAutonomousProcessorExecutionRunStateCommandCenterRecord_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(commandCenterRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: command-center record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateCommandCenterRecord_(
  ledgerRow,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const displaySeverity =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Digest_Severity']);

  const signalPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Signal_Posture']);

  const dashboardPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Dashboard_Posture']);

  const governancePosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Governance_Posture']);

  const orchestrationPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Orchestration_Posture']);

  const decisioningPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Decisioning_Posture']);

  const recommendedAction =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Recommended_Action']);

  const commandCenterStatus =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterStatus_(
      displaySeverity,
      governancePosture,
      decisioningPosture
    );

  const displayPosture =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayPosture_(
      displaySeverity,
      signalPosture
    );

  const displayMessage =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayMessage_(
      commandCenterStatus,
      displaySeverity,
      signalPosture,
      recommendedAction
    );

  const recordId = 'APRSCC_' + Utilities.getUuid();

  const commandCenterJson = {
    runStateDate: resolvedRunStateDate,
    commandCenterType: 'AUTONOMOUS_RUN_STATE_COMMAND_CENTER',
    commandCenterStatus: commandCenterStatus,
    displaySeverity: displaySeverity,
    displayPosture: displayPosture,
    dashboardPosture: dashboardPosture,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    decisioningPosture: decisioningPosture,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Human_Review_Required'
    ]),
    sourceLedgerEntryId: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Ledger_Entry_ID'
    ]),
    sourceDigestId: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Digest_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Business_Key'
    ])
  };

  return [
    recordId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_COMMAND_CENTER',
    commandCenterStatus,
    displaySeverity,
    displayPosture,
    displayMessage,
    dashboardPosture,
    governancePosture,
    orchestrationPosture,
    decisioningPosture,
    recommendedAction,
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Signals_Reviewed']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Critical_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['High_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Medium_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Low_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Category']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Severity']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Status']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Operational_State']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Ledger_Entry_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Digest_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN,
    JSON.stringify(commandCenterJson),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Command-center resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterStatus_(
  displaySeverity,
  governancePosture,
  decisioningPosture
) {
  const severity = String(displaySeverity || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    severity === 'CRITICAL' ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'COMMAND_CENTER_CRITICAL';
  }

  if (
    severity === 'HIGH' ||
    governance === 'ESCALATE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'COMMAND_CENTER_ATTENTION_REQUIRED';
  }

  if (severity === 'MEDIUM') {
    return 'COMMAND_CENTER_MONITOR';
  }

  return 'COMMAND_CENTER_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayPosture_(
  displaySeverity,
  signalPosture
) {
  const severity = String(displaySeverity || '').toUpperCase();

  if (severity === 'CRITICAL') return 'Critical autonomous run state signal active';
  if (severity === 'HIGH') return 'High-priority autonomous run state signal active';
  if (severity === 'MEDIUM') return 'Autonomous run state requires monitoring';

  return 'Autonomous run state healthy';
}

function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayMessage_(
  commandCenterStatus,
  displaySeverity,
  signalPosture,
  recommendedAction
) {
  return (
    commandCenterStatus +
    ': Run state signal digest is ' +
    displaySeverity +
    ' with posture ' +
    signalPosture +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateCommandCenterInputRows_(
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
function sciipFilterAutonomousProcessorExecutionRunStateCommandCenterRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateCommandCenterInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateCommandCenterDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateCommandCenterInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateCommandCenterInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateCommandCenterInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateCommandCenterDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateCommandCenterProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateCommandCenterProcessor',
    result: result
  }));

  return result;
}