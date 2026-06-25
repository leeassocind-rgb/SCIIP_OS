/*******************************************************
 * SCIIP_OS v4.1
 * 1140_AutonomousProcessorExecutionRunStateProcessor
 *******************************************************/

const SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE = {
  PROCESSOR: '1140_AutonomousProcessorExecutionRunStateProcessor',
  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER',
  INPUT_DATE_COLUMN: 'Daily_Brief_Ledger_Date',
  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE',

  OUTPUT_HEADERS: [
    'Execution_Run_State_ID',
    'Business_Key',
    'Run_State_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Daily_Brief_Ledger_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Signal_Digest_Status',
    'Daily_Brief_Status',
    'Daily_Brief_Ledger_Status',
    'Daily_Brief_Ledger_Event_Type',
    'Run_State',
    'Run_State_Category',
    'Run_State_Reason',
    'Run_State_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

function sciipRunAutonomousProcessorExecutionRunStateProcessor() {
  const cfg = SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();
  const outputSheet = sciipEnsureAutonomousProcessorExecutionRunStateSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE|' + resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStatesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionRunStateNoInput1140_(
      outputSheet,
      businessKey,
      resolvedRunStateDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1140_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1140_(row[cfg.INPUT_DATE_COLUMN]) === resolvedRunStateDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionRunStateNoInput1140_(
      outputSheet,
      businessKey,
      resolvedRunStateDate,
      startedAt
    );
  }

  const record = sciipBuildAutonomousProcessorExecutionRunState1140_(
    sourceRows,
    businessKey,
    resolvedRunStateDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow1140_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStatesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    runStateDate: resolvedRunStateDate,
    runState: record.Run_State,
    runStateCategory: record.Run_State_Category,
    completedAt: startedAt.toISOString()
  };
}

function sciipBuildAutonomousProcessorExecutionRunState1140_(sourceRows, businessKey, runStateDate, startedAt) {
  const cfg = SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE;
  const aggregate = sciipAggregateExecutionDailyBriefLedgerRows1140_(sourceRows);
  const runState = sciipResolveExecutionRunState1140_(aggregate);

  return {
    Execution_Run_State_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Run_State_Date: runStateDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Daily_Brief_Ledger_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    System_Signal: aggregate.System_Signal,
    Signal_Strength: aggregate.Signal_Strength,
    Signal_Routing: aggregate.Signal_Routing,
    Signal_Digest_Status: aggregate.Signal_Digest_Status,
    Daily_Brief_Status: aggregate.Daily_Brief_Status,
    Daily_Brief_Ledger_Status: aggregate.Daily_Brief_Ledger_Status,
    Daily_Brief_Ledger_Event_Type: aggregate.Daily_Brief_Ledger_Event_Type,
    Run_State: runState.state,
    Run_State_Category: runState.category,
    Run_State_Reason: runState.reason,
    Run_State_Action: runState.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1140_(aggregate, runState),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

function sciipCreateAutonomousProcessorExecutionRunStateNoInput1140_(outputSheet, businessKey, runStateDate, startedAt) {
  const cfg = SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE;

  const record = {
    Execution_Run_State_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Run_State_Date: runStateDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Daily_Brief_Ledger_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Signal_Digest_Status: 'NO_INPUTS',
    Daily_Brief_Status: 'NO_INPUTS',
    Daily_Brief_Ledger_Status: 'RECORDED_NO_INPUTS',
    Daily_Brief_Ledger_Event_Type: 'NO_DAILY_BRIEF_INPUT',
    Run_State: 'NO_RUN_STATE',
    Run_State_Category: 'NO_INPUTS',
    Run_State_Reason: 'No execution daily-brief-ledger records were available for the resolved run-state date.',
    Run_State_Action: 'Generate execution daily-brief-ledger records before relying on run-state reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-run-state history showing no available daily-brief-ledger inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1140_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionRunStatesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

function sciipEnsureAutonomousProcessorExecutionRunStateSheet_() {
  const cfg = SCIIP_1140_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1140_(sheet) {
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

function sciipObjectToRow1140_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1140_(value) {
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

function sciipAggregateExecutionDailyBriefLedgerRows1140_(rows) {
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
    System_Signal: 'UNKNOWN',
    Signal_Strength: 'WEAK',
    Signal_Routing: 'GOVERNANCE_AND_DASHBOARD',
    Signal_Digest_Status: 'SIGNAL_DIGEST_UNKNOWN',
    Daily_Brief_Status: 'BRIEF_UNCLASSIFIED',
    Daily_Brief_Ledger_Status: 'RECORDED_UNKNOWN_BRIEF',
    Daily_Brief_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1140_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1140_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1140_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1140_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1140_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1140_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1140_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1140_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1140_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1140_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1140_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1140_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Signal_Digest_Status = sciipHigherSignalDigestStatusConstraint1140_(aggregate.Signal_Digest_Status, row.Signal_Digest_Status);
    aggregate.Daily_Brief_Status = sciipHigherDailyBriefStatusConstraint1140_(aggregate.Daily_Brief_Status, row.Daily_Brief_Status);
    aggregate.Daily_Brief_Ledger_Status = sciipHigherDailyBriefLedgerStatusConstraint1140_(aggregate.Daily_Brief_Ledger_Status, row.Daily_Brief_Ledger_Status);
    aggregate.Daily_Brief_Ledger_Event_Type = sciipHigherDailyBriefLedgerEventTypeConstraint1140_(aggregate.Daily_Brief_Ledger_Event_Type, row.Daily_Brief_Ledger_Event_Type);
    aggregate.Dashboard_Flag = sciipYesNo1140_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1140_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionRunState1140_(aggregate) {
  if (aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_ACTION_REQUIRED') {
    return {
      state: 'STOPPED',
      category: 'ACTION_REQUIRED',
      reason: 'Execution run state is stopped because the daily brief ledger recorded an action-required event.',
      action: 'Resolve blockers and rerun the autonomous execution chain.'
    };
  }

  if (aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_REVIEW_REQUIRED') {
    return {
      state: 'HELD',
      category: 'REVIEW_REQUIRED',
      reason: 'Execution run state is held because the daily brief ledger recorded a review-required event.',
      action: 'Complete governance review before advancing execution state.'
    };
  }

  if (aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_MONITORING') {
    return {
      state: 'MONITORING',
      category: 'STABLE',
      reason: 'Execution run state is monitoring because the daily brief ledger recorded a stable monitoring event.',
      action: 'Continue monitoring execution run state.'
    };
  }

  if (aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_CLEAR') {
    return {
      state: 'RUNNABLE',
      category: 'CLEAR',
      reason: 'Execution run state is runnable because the daily brief ledger recorded a clear event.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (
    aggregate.Daily_Brief_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_NO_SIGNAL' ||
    aggregate.Daily_Brief_Ledger_Event_Type === 'NO_DAILY_BRIEF_INPUT'
  ) {
    return {
      state: 'NO_RUN_STATE',
      category: 'NO_INPUTS',
      reason: 'Execution run state cannot be established because no usable daily brief signal was ledgered.',
      action: 'Generate upstream signal and daily brief records before relying on run-state reporting.'
    };
  }

  return {
    state: 'UNKNOWN',
    category: 'UNCLASSIFIED',
    reason: 'Execution run state could not classify the daily brief ledger event.',
    action: 'Review daily brief ledger records and normalize event type values.'
  };
}

function sciipResolveKnowledgeGraphImpact1140_(aggregate, runState) {
  return [
    'Created permanent autonomous execution run-state history.',
    'Run state=' + runState.state + '.',
    'Run state category=' + runState.category + '.',
    'Daily brief ledger event=' + aggregate.Daily_Brief_Ledger_Event_Type + '.',
    'Daily brief status=' + aggregate.Daily_Brief_Status + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1140_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1140_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1140_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1140_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1140_(a, b) {
  const rank = { GO: 1, MONITOR: 2, REVIEW: 3, STOP: 4, NO_SIGNAL: 5, UNKNOWN: 6 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1140_(a, b) {
  const rank = { NONE: 0, WEAK: 1, NORMAL: 2, MODERATE: 3, STRONG: 4 };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1140_(a, b) {
  const rank = {
    NO_ROUTE: 0,
    DASHBOARD: 1,
    GOVERNANCE_AND_DASHBOARD: 2,
    LEADERSHIP_AND_DASHBOARD: 3
  };
  const aa = String(a || 'NO_ROUTE').trim().toUpperCase();
  const bb = String(b || 'NO_ROUTE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalDigestStatusConstraint1140_(a, b) {
  const rank = {
    SIGNAL_DIGEST_GO: 1,
    SIGNAL_DIGEST_MONITOR: 2,
    SIGNAL_DIGEST_REVIEW: 3,
    SIGNAL_DIGEST_STOP: 4,
    SIGNAL_DIGEST_NO_SIGNAL: 5,
    NO_INPUTS: 6,
    SIGNAL_DIGEST_UNKNOWN: 7
  };
  const aa = String(a || 'SIGNAL_DIGEST_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'SIGNAL_DIGEST_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDailyBriefStatusConstraint1140_(a, b) {
  const rank = {
    BRIEF_CLEAR: 1,
    BRIEF_MONITORING: 2,
    BRIEF_REVIEW_REQUIRED: 3,
    BRIEF_ACTION_REQUIRED: 4,
    BRIEF_NO_SIGNAL: 5,
    NO_INPUTS: 6,
    BRIEF_UNCLASSIFIED: 7
  };
  const aa = String(a || 'BRIEF_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'BRIEF_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDailyBriefLedgerStatusConstraint1140_(a, b) {
  const rank = {
    RECORDED_CLEAR_BRIEF: 1,
    RECORDED_MONITORING_BRIEF: 2,
    RECORDED_REVIEW_REQUIRED_BRIEF: 3,
    RECORDED_ACTION_REQUIRED_BRIEF: 4,
    RECORDED_NO_SIGNAL_BRIEF: 5,
    RECORDED_NO_INPUTS: 6,
    RECORDED_UNKNOWN_BRIEF: 7
  };
  const aa = String(a || 'RECORDED_UNKNOWN_BRIEF').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN_BRIEF').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDailyBriefLedgerEventTypeConstraint1140_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_CLEAR: 1,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_MONITORING: 2,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_REVIEW_REQUIRED: 3,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_ACTION_REQUIRED: 4,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_NO_SIGNAL: 5,
    NO_DAILY_BRIEF_INPUT: 6,
    AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionRunStateProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateProcessor',
    result: result
  }));

  return result;
}