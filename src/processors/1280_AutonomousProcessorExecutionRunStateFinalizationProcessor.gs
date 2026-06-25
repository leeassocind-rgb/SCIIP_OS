/*******************************************************
 * SCIIP_OS v4.1
 * 1280_AutonomousProcessorExecutionRunStateFinalizationProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR =
  '1280_AutonomousProcessorExecutionRunStateFinalizationProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS = [
  'Finalization_ID',
  'Business_Key',
  'Run_State_Date',
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
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Finalization_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateFinalizationSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateFinalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateFinalizationInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateFinalizationRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateFinalizationsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationInputRow_(
      sourceRows
    );

  const finalizationRow =
    sciipBuildAutonomousProcessorExecutionRunStateFinalization_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(finalizationRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateFinalizationsCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateFinalizationSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: finalization record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateFinalization_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const briefStatus =
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Status']);

  const briefSeverity =
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Severity']);

  const autonomousAllowed =
    sciipGetRunStateFinalizationInputValue_(row, [
      'Autonomous_Action_Allowed'
    ]);

  const humanReviewRequired =
    sciipGetRunStateFinalizationInputValue_(row, [
      'Human_Review_Required'
    ]);

  const recommendedAction =
    sciipGetRunStateFinalizationInputValue_(row, ['Recommended_Action']);

  const finalizationStatus =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationStatus_(
      briefStatus,
      briefSeverity,
      humanReviewRequired,
      autonomousAllowed
    );

  const finalizationDecision =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationDecision_(
      briefSeverity,
      humanReviewRequired,
      autonomousAllowed
    );

  const runStateClosed =
    sciipResolveAutonomousProcessorExecutionRunStateClosed_(
      finalizationStatus
    );

  const readyForDownstreamUse =
    sciipResolveAutonomousProcessorExecutionRunStateReadyForDownstreamUse_(
      finalizationDecision
    );

  const readyForGovernance = true;
  const readyForDashboard = true;

  const readyForAutonomousDecisioning =
    sciipResolveAutonomousProcessorExecutionRunStateReadyForAutonomousDecisioning_(
      autonomousAllowed,
      humanReviewRequired
    );

  const finalizationMessage =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationMessage_(
      resolvedRunStateDate,
      finalizationStatus,
      finalizationDecision,
      recommendedAction
    );

  const finalizationId = 'APRSF_' + Utilities.getUuid();

  const finalizationJson = {
    runStateDate: resolvedRunStateDate,
    finalizationType: 'AUTONOMOUS_RUN_STATE_FINALIZATION',
    finalizationStatus: finalizationStatus,
    finalizationSeverity: briefSeverity,
    finalizationDecision: finalizationDecision,
    runStateClosed: runStateClosed,
    readyForDownstreamUse: readyForDownstreamUse,
    readyForGovernance: readyForGovernance,
    readyForDashboard: readyForDashboard,
    readyForAutonomousDecisioning: readyForAutonomousDecisioning,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    recommendedAction: recommendedAction,
    sourceDailyBriefId: sciipGetRunStateFinalizationInputValue_(row, [
      'Daily_Brief_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateFinalizationInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateFinalizationInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    finalizationId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_FINALIZATION',
    finalizationStatus,
    briefSeverity,
    finalizationMessage,
    finalizationDecision,
    runStateClosed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    humanReviewRequired,
    briefStatus,
    briefSeverity,
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Title']),
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Text']),
    sciipGetRunStateFinalizationInputValue_(row, ['Executive_Status']),
    sciipGetRunStateFinalizationInputValue_(row, ['Executive_Severity']),
    sciipGetRunStateFinalizationInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateFinalizationInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateFinalizationInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Daily_Brief_ID']),
    sciipGetRunStateFinalizationInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateFinalizationInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN,
    JSON.stringify(finalizationJson),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Finalization resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateFinalizationStatus_(
  briefStatus,
  briefSeverity,
  humanReviewRequired,
  autonomousAllowed
) {
  const status = String(briefStatus || '').toUpperCase();
  const severity = String(briefSeverity || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (
    severity === 'CRITICAL' ||
    status.indexOf('CRITICAL') !== -1 ||
    allowed === 'FALSE'
  ) {
    return 'FINALIZED_WITH_CONTROL_CONSTRAINT';
  }

  if (
    severity === 'HIGH' ||
    status.indexOf('REVIEW') !== -1 ||
    review === 'TRUE'
  ) {
    return 'FINALIZED_WITH_GOVERNANCE_REVIEW';
  }

  if (severity === 'MEDIUM' || status.indexOf('MONITOR') !== -1) {
    return 'FINALIZED_WITH_MONITORING';
  }

  return 'FINALIZED_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateFinalizationDecision_(
  briefSeverity,
  humanReviewRequired,
  autonomousAllowed
) {
  const severity = String(briefSeverity || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (severity === 'CRITICAL' || allowed === 'FALSE') {
    return 'DO_NOT_ADVANCE_AUTONOMOUSLY';
  }

  if (severity === 'HIGH' || review === 'TRUE') {
    return 'REQUIRE_GOVERNANCE_REVIEW_BEFORE_ADVANCEMENT';
  }

  if (severity === 'MEDIUM') {
    return 'ADVANCE_WITH_MONITORING';
  }

  return 'ADVANCE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosed_(
  finalizationStatus
) {
  return String(finalizationStatus || '').indexOf('FINALIZED') === 0;
}

function sciipResolveAutonomousProcessorExecutionRunStateReadyForDownstreamUse_(
  finalizationDecision
) {
  const decision = String(finalizationDecision || '').toUpperCase();

  return decision !== 'DO_NOT_ADVANCE_AUTONOMOUSLY';
}

function sciipResolveAutonomousProcessorExecutionRunStateReadyForAutonomousDecisioning_(
  autonomousAllowed,
  humanReviewRequired
) {
  const allowed = String(autonomousAllowed || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();

  return allowed !== 'FALSE' && review !== 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateFinalizationMessage_(
  resolvedRunStateDate,
  finalizationStatus,
  finalizationDecision,
  recommendedAction
) {
  return (
    'Run state finalization completed for ' +
    resolvedRunStateDate +
    ' with status ' +
    finalizationStatus +
    '. Finalization decision: ' +
    finalizationDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateFinalizationInputRows_(
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
function sciipFilterAutonomousProcessorExecutionRunStateFinalizationRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateFinalizationInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateFinalizationDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateFinalizationInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateFinalizationInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateFinalizationInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateFinalizationDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateFinalizationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateFinalizationProcessor',
    result: result
  }));

  return result;
}