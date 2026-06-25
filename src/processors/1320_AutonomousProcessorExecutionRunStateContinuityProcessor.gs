/*******************************************************
 * SCIIP_OS v4.1
 * 1320_AutonomousProcessorExecutionRunStateContinuityProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR =
  '1320_AutonomousProcessorExecutionRunStateContinuityProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS = [
  'Continuity_ID',
  'Business_Key',
  'Run_State_Date',
  'Continuity_Type',
  'Continuity_Status',
  'Continuity_Severity',
  'Continuity_Decision',
  'Continuity_Message',
  'Next_Cycle_Eligible',
  'Downstream_Use_Allowed',
  'Governance_Routing_Required',
  'Dashboard_Update_Required',
  'Autonomous_Continuation_Allowed',
  'Human_Review_Required',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
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
  'Source_Closure_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Continuity_JSON',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateContinuityProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' + SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitiesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateContinuityInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateContinuityRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitiesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestClosureLedger =
    sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityInputRow_(
      sourceRows
    );

  const continuityRow =
    sciipBuildAutonomousProcessorExecutionRunStateContinuity_(
      latestClosureLedger,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(continuityRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitiesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS);
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

function sciipBuildAutonomousProcessorExecutionRunStateContinuity_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const closureStatus =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Status']);

  const closureSeverity =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Severity']);

  const closureDecision =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Decision']);

  const closureConfirmed =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Confirmed']);

  const readyForDownstreamUse =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Downstream_Use']);

  const readyForGovernance =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Governance']);

  const readyForDashboard =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Dashboard']);

  const readyForAutonomousDecisioning =
    sciipGetRunStateContinuityInputValue_(row, [
      'Ready_For_Autonomous_Decisioning'
    ]);

  const autonomousAllowed =
    sciipGetRunStateContinuityInputValue_(row, ['Autonomous_Action_Allowed']);

  const humanReviewRequired =
    sciipGetRunStateContinuityInputValue_(row, ['Human_Review_Required']);

  const recommendedAction =
    sciipGetRunStateContinuityInputValue_(row, ['Recommended_Action']);

  const continuityStatus =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityStatus_(
      closureStatus,
      closureConfirmed,
      readyForAutonomousDecisioning,
      humanReviewRequired
    );

  const continuityDecision =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityDecision_(
      closureDecision,
      readyForDownstreamUse,
      readyForAutonomousDecisioning,
      humanReviewRequired,
      autonomousAllowed
    );

  const nextCycleEligible =
    sciipResolveAutonomousProcessorExecutionRunStateNextCycleEligible_(
      closureConfirmed,
      readyForDownstreamUse
    );

  const downstreamUseAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateDownstreamUseAllowed_(
      readyForDownstreamUse
    );

  const governanceRoutingRequired =
    sciipResolveAutonomousProcessorExecutionRunStateGovernanceRoutingRequired_(
      humanReviewRequired,
      closureSeverity
    );

  const dashboardUpdateRequired =
    sciipResolveAutonomousProcessorExecutionRunStateDashboardUpdateRequired_(
      readyForDashboard
    );

  const autonomousContinuationAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateAutonomousContinuationAllowed_(
      readyForAutonomousDecisioning,
      autonomousAllowed,
      humanReviewRequired
    );

  const continuityMessage =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityMessage_(
      resolvedRunStateDate,
      continuityStatus,
      continuityDecision,
      recommendedAction
    );

  const continuityId = 'APRSCONT_' + Utilities.getUuid();

  const continuityJson = {
    runStateDate: resolvedRunStateDate,
    continuityType: 'AUTONOMOUS_RUN_STATE_CONTINUITY',
    continuityStatus: continuityStatus,
    continuitySeverity: closureSeverity,
    continuityDecision: continuityDecision,
    nextCycleEligible: nextCycleEligible,
    downstreamUseAllowed: downstreamUseAllowed,
    governanceRoutingRequired: governanceRoutingRequired,
    dashboardUpdateRequired: dashboardUpdateRequired,
    autonomousContinuationAllowed: autonomousContinuationAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceClosureId: sciipGetRunStateContinuityInputValue_(row, ['Closure_ID']),
    sourceLedgerEntryId: sciipGetRunStateContinuityInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateContinuityInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    continuityId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_CONTINUITY',
    continuityStatus,
    closureSeverity,
    continuityDecision,
    continuityMessage,
    nextCycleEligible,
    downstreamUseAllowed,
    governanceRoutingRequired,
    dashboardUpdateRequired,
    autonomousContinuationAllowed,
    humanReviewRequired,
    closureStatus,
    closureSeverity,
    closureDecision,
    sciipGetRunStateContinuityInputValue_(row, ['Run_State_Closed']),
    closureConfirmed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    sciipGetRunStateContinuityInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateContinuityInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateContinuityInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Closure_ID']),
    sciipGetRunStateContinuityInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateContinuityInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN,
    JSON.stringify(continuityJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
    startedAt.toISOString()
  ];
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityStatus_(
  closureStatus,
  closureConfirmed,
  readyForAutonomousDecisioning,
  humanReviewRequired
) {
  const status = String(closureStatus || '').toUpperCase();
  const confirmed = String(closureConfirmed || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();

  if (confirmed !== 'TRUE') return 'CONTINUITY_BLOCKED_CLOSURE_NOT_CONFIRMED';
  if (status.indexOf('CONTROL_CONSTRAINT') !== -1) return 'CONTINUITY_CONTROLLED';
  if (review === 'TRUE') return 'CONTINUITY_REQUIRES_GOVERNANCE_REVIEW';
  if (autonomousReady === 'TRUE') return 'CONTINUITY_READY_FOR_AUTONOMOUS_CYCLE';

  return 'CONTINUITY_READY_FOR_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityDecision_(
  closureDecision,
  readyForDownstreamUse,
  readyForAutonomousDecisioning,
  humanReviewRequired,
  autonomousAllowed
) {
  const decision = String(closureDecision || '').toUpperCase();
  const downstream = String(readyForDownstreamUse || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (
    decision.indexOf('PREVENT_AUTONOMOUS') !== -1 ||
    allowed === 'FALSE'
  ) {
    return 'CARRY_FORWARD_WITH_AUTONOMOUS_HOLD';
  }

  if (review === 'TRUE') return 'CARRY_FORWARD_TO_GOVERNANCE_REVIEW';
  if (autonomousReady === 'TRUE') return 'CARRY_FORWARD_TO_NEXT_AUTONOMOUS_CYCLE';
  if (downstream === 'TRUE') return 'CARRY_FORWARD_TO_DOWNSTREAM_PROCESSORS';

  return 'CARRY_FORWARD_WITH_REVIEW_REQUIRED';
}

function sciipResolveAutonomousProcessorExecutionRunStateNextCycleEligible_(
  closureConfirmed,
  readyForDownstreamUse
) {
  return (
    String(closureConfirmed || '').toUpperCase() === 'TRUE' &&
    String(readyForDownstreamUse || '').toUpperCase() === 'TRUE'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateDownstreamUseAllowed_(
  readyForDownstreamUse
) {
  return String(readyForDownstreamUse || '').toUpperCase() === 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateGovernanceRoutingRequired_(
  humanReviewRequired,
  closureSeverity
) {
  const review = String(humanReviewRequired || '').toUpperCase();
  const severity = String(closureSeverity || '').toUpperCase();

  return review === 'TRUE' || severity === 'CRITICAL' || severity === 'HIGH';
}

function sciipResolveAutonomousProcessorExecutionRunStateDashboardUpdateRequired_(
  readyForDashboard
) {
  return String(readyForDashboard || '').toUpperCase() === 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateAutonomousContinuationAllowed_(
  readyForAutonomousDecisioning,
  autonomousAllowed,
  humanReviewRequired
) {
  return (
    String(readyForAutonomousDecisioning || '').toUpperCase() === 'TRUE' &&
    String(autonomousAllowed || '').toUpperCase() !== 'FALSE' &&
    String(humanReviewRequired || '').toUpperCase() !== 'TRUE'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityMessage_(
  resolvedRunStateDate,
  continuityStatus,
  continuityDecision,
  recommendedAction
) {
  return (
    'Run state continuity established for ' +
    resolvedRunStateDate +
    ' with status ' +
    continuityStatus +
    '. Continuity decision: ' +
    continuityDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

function sciipReadAutonomousProcessorExecutionRunStateContinuityInputRows_(
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

function sciipFilterAutonomousProcessorExecutionRunStateContinuityRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateContinuityInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Closure_Date',
      'Continuity_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateContinuityDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateContinuityInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateContinuityInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateContinuityInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateContinuityDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityProcessor',
    result: result
  }));

  return result;
}