/*******************************************************
 * SCIIP_OS v4.1
 * 1300_AutonomousProcessorExecutionRunStateClosureProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR =
  '1300_AutonomousProcessorExecutionRunStateClosureProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS = [
  'Closure_ID',
  'Business_Key',
  'Run_State_Date',
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
  'Finalization_Message',
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
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Closure_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateClosureProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' + SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateClosureSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateClosuresCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateClosureInputRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateClosureRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateClosuresCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateClosureInputRow_(
      sourceRows
    );

  const closureRow =
    sciipBuildAutonomousProcessorExecutionRunStateClosure_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(closureRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateClosuresCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateClosureSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: closure record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateClosure_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const finalizationStatus =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Status']);

  const finalizationSeverity =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Severity']);

  const finalizationDecision =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Decision']);

  const runStateClosed =
    sciipGetRunStateClosureInputValue_(row, ['Run_State_Closed']);

  const readyForDownstreamUse =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Downstream_Use']);

  const readyForGovernance =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Governance']);

  const readyForDashboard =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Dashboard']);

  const readyForAutonomousDecisioning =
    sciipGetRunStateClosureInputValue_(row, [
      'Ready_For_Autonomous_Decisioning'
    ]);

  const autonomousAllowed =
    sciipGetRunStateClosureInputValue_(row, ['Autonomous_Action_Allowed']);

  const humanReviewRequired =
    sciipGetRunStateClosureInputValue_(row, ['Human_Review_Required']);

  const recommendedAction =
    sciipGetRunStateClosureInputValue_(row, ['Recommended_Action']);

  const closureStatus =
    sciipResolveAutonomousProcessorExecutionRunStateClosureStatus_(
      finalizationStatus,
      runStateClosed,
      readyForDownstreamUse,
      readyForAutonomousDecisioning
    );

  const closureDecision =
    sciipResolveAutonomousProcessorExecutionRunStateClosureDecision_(
      finalizationDecision,
      readyForAutonomousDecisioning,
      humanReviewRequired,
      autonomousAllowed
    );

  const closureConfirmed =
    sciipResolveAutonomousProcessorExecutionRunStateClosureConfirmed_(
      closureStatus,
      runStateClosed
    );

  const closureMessage =
    sciipResolveAutonomousProcessorExecutionRunStateClosureMessage_(
      resolvedRunStateDate,
      closureStatus,
      closureDecision,
      recommendedAction
    );

  const closureId = 'APRSC_' + Utilities.getUuid();

  const closureJson = {
    runStateDate: resolvedRunStateDate,
    closureType: 'AUTONOMOUS_RUN_STATE_CLOSURE',
    closureStatus: closureStatus,
    closureSeverity: finalizationSeverity,
    closureDecision: closureDecision,
    runStateClosed: runStateClosed,
    closureConfirmed: closureConfirmed,
    readyForDownstreamUse: readyForDownstreamUse,
    readyForGovernance: readyForGovernance,
    readyForDashboard: readyForDashboard,
    readyForAutonomousDecisioning: readyForAutonomousDecisioning,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceFinalizationId: sciipGetRunStateClosureInputValue_(row, [
      'Finalization_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateClosureInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateClosureInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    closureId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_CLOSURE',
    closureStatus,
    finalizationSeverity,
    closureDecision,
    closureMessage,
    runStateClosed,
    closureConfirmed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    humanReviewRequired,
    finalizationStatus,
    finalizationSeverity,
    finalizationDecision,
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Message']),
    sciipGetRunStateClosureInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateClosureInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateClosureInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Finalization_ID']),
    sciipGetRunStateClosureInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateClosureInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN,
    JSON.stringify(closureJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Closure resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateClosureStatus_(
  finalizationStatus,
  runStateClosed,
  readyForDownstreamUse,
  readyForAutonomousDecisioning
) {
  const finalStatus = String(finalizationStatus || '').toUpperCase();
  const closed = String(runStateClosed || '').toUpperCase();
  const downstream = String(readyForDownstreamUse || '').toUpperCase();
  const autonomous = String(readyForAutonomousDecisioning || '').toUpperCase();

  if (closed !== 'TRUE') {
    return 'CLOSURE_INCOMPLETE';
  }

  if (finalStatus.indexOf('CONTROL_CONSTRAINT') !== -1) {
    return 'CLOSED_WITH_CONTROL_CONSTRAINT';
  }

  if (finalStatus.indexOf('GOVERNANCE_REVIEW') !== -1) {
    return 'CLOSED_WITH_GOVERNANCE_REVIEW';
  }

  if (finalStatus.indexOf('MONITORING') !== -1) {
    return 'CLOSED_WITH_MONITORING';
  }

  if (downstream === 'TRUE' && autonomous === 'TRUE') {
    return 'CLOSED_READY_FOR_AUTONOMOUS_CONTINUATION';
  }

  return 'CLOSED_READY_FOR_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureDecision_(
  finalizationDecision,
  readyForAutonomousDecisioning,
  humanReviewRequired,
  autonomousAllowed
) {
  const decision = String(finalizationDecision || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (decision === 'DO_NOT_ADVANCE_AUTONOMOUSLY' || allowed === 'FALSE') {
    return 'CLOSE_AND_PREVENT_AUTONOMOUS_ADVANCEMENT';
  }

  if (review === 'TRUE') {
    return 'CLOSE_AND_ROUTE_TO_GOVERNANCE_REVIEW';
  }

  if (autonomousReady === 'TRUE') {
    return 'CLOSE_AND_ALLOW_AUTONOMOUS_CONTINUATION';
  }

  return 'CLOSE_AND_ALLOW_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureConfirmed_(
  closureStatus,
  runStateClosed
) {
  return (
    String(runStateClosed || '').toUpperCase() === 'TRUE' &&
    String(closureStatus || '').indexOf('CLOSED') === 0
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureMessage_(
  resolvedRunStateDate,
  closureStatus,
  closureDecision,
  recommendedAction
) {
  return (
    'Run state closure completed for ' +
    resolvedRunStateDate +
    ' with status ' +
    closureStatus +
    '. Closure decision: ' +
    closureDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateClosureInputRows_(sheet) {
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
function sciipFilterAutonomousProcessorExecutionRunStateClosureRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateClosureInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Finalization_Date',
      'Closure_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateClosureDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateClosureInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateClosureInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateClosureInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateClosureInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateClosureDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateClosureProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateClosureProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateClosureProcessor',
    result: result
  }));

  return result;
}