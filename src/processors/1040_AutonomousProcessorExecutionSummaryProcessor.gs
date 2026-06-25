/*******************************************************
 * SCIIP_OS v4.1
 * 1040_AutonomousProcessorExecutionSummaryProcessor
 *******************************************************/

const SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY = {
  PROCESSOR: '1040_AutonomousProcessorExecutionSummaryProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME',
  INPUT_DATE_COLUMN: 'Outcome_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY',

  OUTPUT_HEADERS: [
    'Execution_Summary_ID',
    'Business_Key',
    'Summary_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Outcome_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Readiness_Status',
    'Readiness_Decision',
    'Control_Status',
    'Control_Directive',
    'Execution_Gate',
    'Dispatch_Status',
    'Dispatch_Decision',
    'Dispatch_Mode',
    'Ledger_Status',
    'Ledger_Event_Type',
    'Outcome_Status',
    'Outcome_Type',
    'Summary_Status',
    'Summary_Headline',
    'Summary_Narrative',
    'Operational_Posture',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionSummaryProcessor() {
  const cfg = SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionSummarySheet_();

  const resolvedSummaryDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY|' + resolvedSummaryDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionSummariesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionSummaryNoInput1040_(
      outputSheet,
      businessKey,
      resolvedSummaryDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1040_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1040_(row[cfg.INPUT_DATE_COLUMN]) === resolvedSummaryDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionSummaryNoInput1040_(
      outputSheet,
      businessKey,
      resolvedSummaryDate,
      startedAt
    );
  }

  const summaryRecord =
    sciipBuildAutonomousProcessorExecutionSummary1040_(
      sourceRows,
      businessKey,
      resolvedSummaryDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1040_(summaryRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    summaryDate: resolvedSummaryDate,
    summaryStatus: summaryRecord.Summary_Status,
    operationalPosture: summaryRecord.Operational_Posture,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionSummary1040_(sourceRows, businessKey, summaryDate, startedAt) {
  const cfg = SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY;

  const aggregate = sciipAggregateExecutionOutcomeRows1040_(sourceRows);
  const summary = sciipResolveExecutionSummary1040_(aggregate);

  return {
    Execution_Summary_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Summary_Date: summaryDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Outcome_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: aggregate.Readiness_Status,
    Readiness_Decision: aggregate.Readiness_Decision,
    Control_Status: aggregate.Control_Status,
    Control_Directive: aggregate.Control_Directive,
    Execution_Gate: aggregate.Execution_Gate,
    Dispatch_Status: aggregate.Dispatch_Status,
    Dispatch_Decision: aggregate.Dispatch_Decision,
    Dispatch_Mode: aggregate.Dispatch_Mode,
    Ledger_Status: aggregate.Ledger_Status,
    Ledger_Event_Type: aggregate.Ledger_Event_Type,
    Outcome_Status: aggregate.Outcome_Status,
    Outcome_Type: aggregate.Outcome_Type,
    Summary_Status: summary.status,
    Summary_Headline: summary.headline,
    Summary_Narrative: summary.narrative,
    Operational_Posture: summary.posture,
    Recommended_Action: summary.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1040_(aggregate, summary),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionSummaryNoInput1040_(outputSheet, businessKey, summaryDate, startedAt) {
  const cfg = SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY;

  const record = {
    Execution_Summary_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Summary_Date: summaryDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Outcome_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_NO_INPUTS',
    Ledger_Event_Type: 'NO_LEDGER_INPUT',
    Outcome_Status: 'NO_OUTCOME',
    Outcome_Type: 'NO_LEDGER_INPUT',
    Summary_Status: 'NO_SUMMARY_INPUT',
    Summary_Headline: 'No autonomous execution outcome records available.',
    Summary_Narrative: 'SCIIP_OS could not produce an execution summary because no execution outcome records were available for the resolved summary date.',
    Operational_Posture: 'NO_INPUTS',
    Recommended_Action: 'Do not advance to downstream governance reporting until execution outcome records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-summary history showing no available outcome inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1040_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionSummarySheet_() {
  const cfg = SCIIP_1040_AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1040_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow1040_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1040_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionOutcomeRows1040_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_UNKNOWN',
    Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN',
    Outcome_Status: 'OUTCOME_UNKNOWN',
    Outcome_Type: 'EXECUTION_UNCLASSIFIED'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1040_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1040_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1040_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1040_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1040_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1040_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1040_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1040_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1040_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Readiness_Status = sciipHigherReadinessConstraint1040_(aggregate.Readiness_Status, row.Readiness_Status);
    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1040_(aggregate.Readiness_Decision, row.Readiness_Decision);
    aggregate.Control_Status = sciipHigherControlStatusConstraint1040_(aggregate.Control_Status, row.Control_Status);
    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1040_(aggregate.Control_Directive, row.Control_Directive);
    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1040_(aggregate.Execution_Gate, row.Execution_Gate);
    aggregate.Dispatch_Status = sciipHigherDispatchStatusConstraint1040_(aggregate.Dispatch_Status, row.Dispatch_Status);
    aggregate.Dispatch_Decision = sciipHigherDispatchDecisionConstraint1040_(aggregate.Dispatch_Decision, row.Dispatch_Decision);
    aggregate.Dispatch_Mode = sciipHigherDispatchModeConstraint1040_(aggregate.Dispatch_Mode, row.Dispatch_Mode);
    aggregate.Ledger_Status = sciipHigherLedgerStatusConstraint1040_(aggregate.Ledger_Status, row.Ledger_Status);
    aggregate.Ledger_Event_Type = sciipHigherLedgerEventTypeConstraint1040_(aggregate.Ledger_Event_Type, row.Ledger_Event_Type);
    aggregate.Outcome_Status = sciipHigherOutcomeStatusConstraint1040_(aggregate.Outcome_Status, row.Outcome_Status);
    aggregate.Outcome_Type = sciipHigherOutcomeTypeConstraint1040_(aggregate.Outcome_Type, row.Outcome_Type);
  });

  return aggregate;
}

function sciipResolveExecutionSummary1040_(aggregate) {
  if (aggregate.Outcome_Status === 'OUTCOME_SUCCESS') {
    return {
      status: 'SUMMARY_CLEAR',
      headline: 'Autonomous execution chain cleared for downstream execution.',
      narrative: 'SCIIP_OS recorded a successful autonomous execution outcome. Dispatch was approved, the execution gate was open, and the processor chain is ready for downstream execution-result tracking.',
      posture: 'OPERATIONAL',
      action: 'Advance to downstream execution-result and performance summary processors.'
    };
  }

  if (aggregate.Outcome_Status === 'OUTCOME_REVIEW_REQUIRED') {
    return {
      status: 'SUMMARY_REVIEW_REQUIRED',
      headline: 'Autonomous execution chain requires manual review.',
      narrative: 'SCIIP_OS held autonomous execution because the outcome processor detected a review-required state. The system preserved governance control and prevented unreviewed downstream execution.',
      posture: 'CONTROLLED_REVIEW',
      action: 'Complete review, resolve held items, and rerun the autonomous execution chain.'
    };
  }

  if (aggregate.Outcome_Status === 'OUTCOME_PENDING') {
    return {
      status: 'SUMMARY_PENDING',
      headline: 'Autonomous execution chain is waiting.',
      narrative: 'SCIIP_OS recorded a pending execution outcome. Execution has not been blocked, but downstream dispatch has not yet been approved.',
      posture: 'MONITORING',
      action: 'Continue monitoring until readiness, control, and dispatch conditions resolve.'
    };
  }

  if (aggregate.Outcome_Status === 'OUTCOME_BLOCKED') {
    return {
      status: 'SUMMARY_BLOCKED',
      headline: 'Autonomous execution chain is blocked.',
      narrative: 'SCIIP_OS blocked downstream autonomous execution because upstream readiness, control, dispatch, or ledger conditions indicated execution should not advance.',
      posture: 'BLOCKED',
      action: 'Resolve upstream blockers and rerun monitor through summary processors.'
    };
  }

  if (aggregate.Outcome_Status === 'NO_OUTCOME') {
    return {
      status: 'SUMMARY_NO_OUTCOME',
      headline: 'No autonomous execution outcome available.',
      narrative: 'SCIIP_OS did not identify an execution outcome record for the resolved summary date.',
      posture: 'NO_INPUTS',
      action: 'Generate execution outcome records before relying on execution summary reporting.'
    };
  }

  return {
    status: 'SUMMARY_UNKNOWN',
    headline: 'Autonomous execution summary could not classify the current state.',
    narrative: 'SCIIP_OS created a summary, but the outcome status did not match a known summary class.',
    posture: 'REVIEW_REQUIRED',
    action: 'Review execution outcome records and normalize outcome values.'
  };
}

function sciipResolveKnowledgeGraphImpact1040_(aggregate, summary) {
  return [
    'Created permanent autonomous execution summary history.',
    'Summary status=' + summary.status + '.',
    'Operational posture=' + summary.posture + '.',
    'Outcome status=' + aggregate.Outcome_Status + '.',
    'Outcome type=' + aggregate.Outcome_Type + '.',
    'Ledger event=' + aggregate.Ledger_Event_Type + '.',
    'Dispatch decision=' + aggregate.Dispatch_Decision + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1040_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1040_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1040_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1040_(a, b) {
  const rank = { READY: 1, CONDITIONALLY_READY: 2, NOT_READY: 3 };
  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1040_(a, b) {
  const rank = {
    ADVANCE_EXECUTION: 1,
    CONTINUE_MONITORING: 2,
    HOLD_FOR_REVIEW: 3,
    DEFER_EXECUTION: 4
  };
  const aa = String(a || 'DEFER_EXECUTION').trim().toUpperCase();
  const bb = String(b || 'DEFER_EXECUTION').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlStatusConstraint1040_(a, b) {
  const rank = { CLEARED: 1, MONITORING: 2, HELD: 3, STOPPED: 4 };
  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1040_(a, b) {
  const rank = {
    ADVANCE_AUTONOMOUS_EXECUTION: 1,
    WAIT: 2,
    MANUAL_REVIEW_REQUIRED: 3,
    DO_NOT_ADVANCE: 4
  };
  const aa = String(a || 'DO_NOT_ADVANCE').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_ADVANCE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherExecutionGateConstraint1040_(a, b) {
  const rank = { OPEN: 1, PENDING: 2, REVIEW: 3, CLOSED: 4 };
  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchStatusConstraint1040_(a, b) {
  const rank = {
    DISPATCH_READY: 1,
    WAITING: 2,
    HELD_FOR_REVIEW: 3,
    NOT_DISPATCHED: 4
  };
  const aa = String(a || 'NOT_DISPATCHED').trim().toUpperCase();
  const bb = String(b || 'NOT_DISPATCHED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchDecisionConstraint1040_(a, b) {
  const rank = {
    DISPATCH_APPROVED: 1,
    WAIT_TO_DISPATCH: 2,
    REQUIRE_MANUAL_DISPATCH_REVIEW: 3,
    DO_NOT_DISPATCH: 4
  };
  const aa = String(a || 'DO_NOT_DISPATCH').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_DISPATCH').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchModeConstraint1040_(a, b) {
  const rank = {
    AUTONOMOUS: 1,
    MONITOR_ONLY: 2,
    MANUAL_REVIEW: 3,
    NONE: 4
  };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerStatusConstraint1040_(a, b) {
  const rank = {
    RECORDED_DISPATCH_APPROVED: 1,
    RECORDED_WAITING: 2,
    RECORDED_REVIEW_REQUIRED: 3,
    RECORDED_BLOCKED: 4,
    RECORDED_NO_INPUTS: 5,
    RECORDED_UNKNOWN: 6
  };
  const aa = String(a || 'RECORDED_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerEventTypeConstraint1040_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_DISPATCH_APPROVED: 1,
    AUTONOMOUS_EXECUTION_WAITING: 2,
    AUTONOMOUS_EXECUTION_REVIEW_REQUIRED: 3,
    AUTONOMOUS_EXECUTION_DISPATCH_BLOCKED: 4,
    NO_DISPATCH_INPUT: 5,
    NO_LEDGER_INPUT: 6,
    AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOutcomeStatusConstraint1040_(a, b) {
  const rank = {
    OUTCOME_SUCCESS: 1,
    OUTCOME_PENDING: 2,
    OUTCOME_REVIEW_REQUIRED: 3,
    OUTCOME_BLOCKED: 4,
    NO_OUTCOME: 5,
    OUTCOME_UNKNOWN: 6
  };
  const aa = String(a || 'OUTCOME_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'OUTCOME_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOutcomeTypeConstraint1040_(a, b) {
  const rank = {
    EXECUTION_ADVANCED: 1,
    EXECUTION_WAITING: 2,
    EXECUTION_HELD: 3,
    EXECUTION_BLOCKED: 4,
    NO_LEDGER_INPUT: 5,
    EXECUTION_UNCLASSIFIED: 6
  };
  const aa = String(a || 'EXECUTION_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'EXECUTION_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionSummaryProcessor() {
  const result = sciipRunAutonomousProcessorExecutionSummaryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionSummaryProcessor',
    result: result
  }));

  return result;
}