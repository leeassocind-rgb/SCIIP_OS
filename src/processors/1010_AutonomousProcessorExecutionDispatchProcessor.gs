/*******************************************************
 * SCIIP_OS v4.1
 * 1010_AutonomousProcessorExecutionDispatchProcessor
 *******************************************************/

const SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH = {
  PROCESSOR: '1010_AutonomousProcessorExecutionDispatchProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL',
  INPUT_DATE_COLUMN: 'Control_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH',

  OUTPUT_HEADERS: [
    'Execution_Dispatch_ID',
    'Business_Key',
    'Dispatch_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Control_Records_Reviewed',
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
    'Dispatch_Reason',
    'Dispatch_Mode',
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
function sciipRunAutonomousProcessorExecutionDispatchProcessor() {
  const cfg = SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionDispatchSheet_();

  const resolvedDispatchDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH|' + resolvedDispatchDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionDispatchesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionDispatchNoInput1010_(
      outputSheet,
      businessKey,
      resolvedDispatchDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1010_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1010_(row[cfg.INPUT_DATE_COLUMN]) === resolvedDispatchDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionDispatchNoInput1010_(
      outputSheet,
      businessKey,
      resolvedDispatchDate,
      startedAt
    );
  }

  const dispatchRecord =
    sciipBuildAutonomousProcessorExecutionDispatch1010_(
      sourceRows,
      businessKey,
      resolvedDispatchDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1010_(dispatchRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionDispatchesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    dispatchDate: resolvedDispatchDate,
    dispatchStatus: dispatchRecord.Dispatch_Status,
    dispatchDecision: dispatchRecord.Dispatch_Decision,
    dispatchMode: dispatchRecord.Dispatch_Mode,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionDispatch1010_(sourceRows, businessKey, dispatchDate, startedAt) {
  const cfg = SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH;

  const aggregate = sciipAggregateExecutionControlRows1010_(sourceRows);
  const dispatch = sciipResolveExecutionDispatchDecision1010_(aggregate);

  return {
    Execution_Dispatch_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Dispatch_Date: dispatchDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Control_Records_Reviewed: sourceRows.length,
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
    Dispatch_Status: dispatch.status,
    Dispatch_Decision: dispatch.decision,
    Dispatch_Reason: dispatch.reason,
    Dispatch_Mode: dispatch.mode,
    Recommended_Action: dispatch.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1010_(aggregate, dispatch),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionDispatchNoInput1010_(outputSheet, businessKey, dispatchDate, startedAt) {
  const cfg = SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH;

  const record = {
    Execution_Dispatch_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Dispatch_Date: dispatchDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Control_Records_Reviewed: 0,
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
    Dispatch_Reason: 'No execution control records were available for the resolved dispatch date.',
    Dispatch_Mode: 'NONE',
    Recommended_Action: 'Do not dispatch autonomous processor work until execution control records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-dispatch history showing no available control inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1010_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionDispatchesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionDispatchSheet_() {
  const cfg = SCIIP_1010_AUTONOMOUS_PROCESSOR_EXECUTION_DISPATCH;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1010_(sheet) {
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

function sciipObjectToRow1010_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1010_(value) {
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

function sciipAggregateExecutionControlRows1010_(rows) {
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
    Execution_Gate: 'CLOSED'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1010_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1010_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1010_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1010_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1010_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1010_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1010_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1010_(
      aggregate.Highest_Priority,
      row.Highest_Priority
    );

    aggregate.Execution_Risk_Level = sciipHigherRisk1010_(
      aggregate.Execution_Risk_Level,
      row.Execution_Risk_Level
    );

    aggregate.Readiness_Status = sciipHigherReadinessConstraint1010_(
      aggregate.Readiness_Status,
      row.Readiness_Status
    );

    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1010_(
      aggregate.Readiness_Decision,
      row.Readiness_Decision
    );

    aggregate.Control_Status = sciipHigherControlStatusConstraint1010_(
      aggregate.Control_Status,
      row.Control_Status
    );

    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1010_(
      aggregate.Control_Directive,
      row.Control_Directive
    );

    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1010_(
      aggregate.Execution_Gate,
      row.Execution_Gate
    );
  });

  return aggregate;
}

function sciipResolveExecutionDispatchDecision1010_(aggregate) {
  if (aggregate.Execution_Gate === 'CLOSED') {
    return {
      status: 'NOT_DISPATCHED',
      decision: 'DO_NOT_DISPATCH',
      reason: 'Dispatch blocked because execution gate is closed.',
      mode: 'NONE',
      action: 'Do not dispatch downstream autonomous processor work.'
    };
  }

  if (aggregate.Control_Directive === 'DO_NOT_ADVANCE') {
    return {
      status: 'NOT_DISPATCHED',
      decision: 'DO_NOT_DISPATCH',
      reason: 'Dispatch blocked because execution control directive is DO_NOT_ADVANCE.',
      mode: 'NONE',
      action: 'Resolve execution control blockers before dispatching autonomous work.'
    };
  }

  if (aggregate.Execution_Gate === 'REVIEW' || aggregate.Control_Directive === 'MANUAL_REVIEW_REQUIRED') {
    return {
      status: 'HELD_FOR_REVIEW',
      decision: 'REQUIRE_MANUAL_DISPATCH_REVIEW',
      reason: 'Dispatch requires manual review based on execution control state.',
      mode: 'MANUAL_REVIEW',
      action: 'Review held control records before authorizing dispatch.'
    };
  }

  if (aggregate.Execution_Gate === 'PENDING' || aggregate.Control_Directive === 'WAIT') {
    return {
      status: 'WAITING',
      decision: 'WAIT_TO_DISPATCH',
      reason: 'Dispatch is waiting because execution control has not opened the gate.',
      mode: 'MONITOR_ONLY',
      action: 'Continue monitoring until the execution gate opens.'
    };
  }

  if (
    aggregate.Execution_Gate === 'OPEN' &&
    aggregate.Control_Directive === 'ADVANCE_AUTONOMOUS_EXECUTION'
  ) {
    return {
      status: 'DISPATCH_READY',
      decision: 'DISPATCH_APPROVED',
      reason: 'Execution control gate is open and autonomous execution has been approved.',
      mode: 'AUTONOMOUS',
      action: 'Dispatch approved autonomous processor work to downstream execution.'
    };
  }

  return {
    status: 'WAITING',
    decision: 'WAIT_TO_DISPATCH',
    reason: 'Dispatch could not confirm a fully open autonomous execution state.',
    mode: 'MONITOR_ONLY',
    action: 'Continue monitoring execution control state.'
  };
}

function sciipResolveKnowledgeGraphImpact1010_(aggregate, dispatch) {
  return [
    'Created permanent autonomous execution-dispatch decision history.',
    'Dispatch decision=' + dispatch.decision + '.',
    'Dispatch status=' + dispatch.status + '.',
    'Dispatch mode=' + dispatch.mode + '.',
    'Execution gate=' + aggregate.Execution_Gate + '.',
    'Control directive=' + aggregate.Control_Directive + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1010_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1010_(a, b) {
  const rank = {
    NONE: 0,
    LOW: 1,
    NORMAL: 2,
    MEDIUM: 3,
    HIGH: 4,
    CRITICAL: 5
  };

  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1010_(a, b) {
  const rank = {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1010_(a, b) {
  const rank = {
    READY: 1,
    CONDITIONALLY_READY: 2,
    NOT_READY: 3
  };

  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1010_(a, b) {
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

function sciipHigherControlStatusConstraint1010_(a, b) {
  const rank = {
    CLEARED: 1,
    MONITORING: 2,
    HELD: 3,
    STOPPED: 4
  };

  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1010_(a, b) {
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

function sciipHigherExecutionGateConstraint1010_(a, b) {
  const rank = {
    OPEN: 1,
    PENDING: 2,
    REVIEW: 3,
    CLOSED: 4
  };

  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionDispatchProcessor() {
  const result = sciipRunAutonomousProcessorExecutionDispatchProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionDispatchProcessor',
    result: result
  }));

  return result;
}