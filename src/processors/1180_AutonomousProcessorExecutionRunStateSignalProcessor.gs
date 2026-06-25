/*******************************************************
 * SCIIP_OS v4.1
 * 1180_AutonomousProcessorExecutionRunStateSignalProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR =
  '1180_AutonomousProcessorExecutionRunStateSignalProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS = [
  'Signal_ID',
  'Business_Key',
  'Run_State_Date',
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
  'Source_Sheet',
  'Source_Date_Column',
  'Signal_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalInputRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerEntry =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalInputRow_(
      sourceRows
    );

  const signalRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignal_(
      latestLedgerEntry,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(signalRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalsCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateSignalSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: signal row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignal_(
  ledgerEntry,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const operationalState =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Operational_State']);

  const governancePosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Governance_Posture']);

  const orchestrationPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Orchestration_Posture']);

  const dashboardPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Dashboard_Posture']);

  const decisioningPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Decisioning_Posture']);

  const severity =
    sciipResolveAutonomousProcessorExecutionRunStateSignalSeverity_(
      operationalState,
      governancePosture,
      orchestrationPosture,
      decisioningPosture
    );

  const category =
    sciipResolveAutonomousProcessorExecutionRunStateSignalCategory_(
      operationalState,
      severity
    );

  const status =
    sciipResolveAutonomousProcessorExecutionRunStateSignalStatus_(severity);

  const recommendedAction =
    sciipResolveAutonomousProcessorExecutionRunStateSignalRecommendedAction_(
      operationalState,
      governancePosture,
      orchestrationPosture,
      decisioningPosture
    );

  const autonomousActionAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateSignalAutonomousAllowed_(
      decisioningPosture
    );

  const humanReviewRequired =
    sciipResolveAutonomousProcessorExecutionRunStateSignalHumanReviewRequired_(
      governancePosture,
      decisioningPosture
    );

  const message =
    sciipResolveAutonomousProcessorExecutionRunStateSignalMessage_(
      operationalState,
      severity,
      recommendedAction
    );

  const signalId = 'APRSS_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    signalType: 'AUTONOMOUS_RUN_STATE_SIGNAL',
    signalCategory: category,
    signalSeverity: severity,
    signalStatus: status,
    operationalState: operationalState,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    dashboardPosture: dashboardPosture,
    decisioningPosture: decisioningPosture,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousActionAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceLedgerEntryId: sciipGetRunStateSignalInputValue_(ledgerEntry, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateSignalInputValue_(ledgerEntry, [
      'Business_Key'
    ])
  };

  return [
    signalId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_SIGNAL',
    category,
    severity,
    status,
    message,
    operationalState,
    governancePosture,
    orchestrationPosture,
    dashboardPosture,
    decisioningPosture,
    recommendedAction,
    autonomousActionAllowed,
    humanReviewRequired,
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Unique_Processors_Observed']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Healthy_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Warning_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Blocked_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Failed_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Skipped_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Duplicate_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Ledger_Entry_ID']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Signal resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateSignalSeverity_(
  operationalState,
  governancePosture,
  orchestrationPosture,
  decisioningPosture
) {
  const state = String(operationalState || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const orchestration = String(orchestrationPosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    state.indexOf('FAILED') !== -1 ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'CRITICAL';
  }

  if (
    state === 'BLOCKED' ||
    governance === 'ESCALATE' ||
    orchestration === 'HOLD_DISPATCH' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'HIGH';
  }

  if (
    state.indexOf('WARNING') !== -1 ||
    governance === 'MONITOR' ||
    orchestration === 'ALLOW_WITH_MONITORING' ||
    decisioning === 'ADVANCE_WITH_CAUTION'
  ) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalCategory_(
  operationalState,
  severity
) {
  const state = String(operationalState || '').toUpperCase();

  if (severity === 'CRITICAL') return 'RUN_STATE_FAILURE';
  if (severity === 'HIGH') return 'RUN_STATE_BLOCKER';
  if (state === 'IDEMPOTENT_STABLE') return 'RUN_STATE_STABILITY';
  if (severity === 'MEDIUM') return 'RUN_STATE_WARNING';
  return 'RUN_STATE_HEALTH';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalStatus_(severity) {
  if (severity === 'CRITICAL') return 'ACTIVE_CRITICAL';
  if (severity === 'HIGH') return 'ACTIVE_HIGH';
  if (severity === 'MEDIUM') return 'ACTIVE_MONITOR';
  return 'ACTIVE_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalRecommendedAction_(
  operationalState,
  governancePosture,
  orchestrationPosture,
  decisioningPosture
) {
  const state = String(operationalState || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const orchestration = String(orchestrationPosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    state.indexOf('FAILED') !== -1 ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'PAUSE_AUTONOMOUS_ADVANCEMENT_AND_REVIEW_FAILURES';
  }

  if (
    state === 'BLOCKED' ||
    governance === 'ESCALATE' ||
    orchestration === 'HOLD_DISPATCH' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'HOLD_DISPATCH_AND_REQUIRE_HUMAN_REVIEW';
  }

  if (
    state.indexOf('WARNING') !== -1 ||
    governance === 'MONITOR' ||
    orchestration === 'ALLOW_WITH_MONITORING' ||
    decisioning === 'ADVANCE_WITH_CAUTION'
  ) {
    return 'ALLOW_DOWNSTREAM_PROCESSING_WITH_MONITORING';
  }

  return 'ALLOW_DOWNSTREAM_PROCESSING';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalAutonomousAllowed_(
  decisioningPosture
) {
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return false;
  }

  return true;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalHumanReviewRequired_(
  governancePosture,
  decisioningPosture
) {
  const governance = String(governancePosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    governance === 'REVIEW_REQUIRED' ||
    governance === 'ESCALATE' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return true;
  }

  return false;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalMessage_(
  operationalState,
  severity,
  recommendedAction
) {
  return (
    'Autonomous run state signal resolved as ' +
    severity +
    ' from operational state ' +
    operationalState +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalInputRows_(sheet) {
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
function sciipFilterAutonomousProcessorExecutionRunStateSignalRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Ledger_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateSignalProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalProcessor',
    result: result
  }));

  return result;
}