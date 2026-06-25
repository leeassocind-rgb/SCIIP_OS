/*******************************************************
 * SCIIP_OS v4.1
 * 1150_AutonomousProcessorExecutionRunStateLedgerProcessor
 *******************************************************/

const SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER = {
  PROCESSOR: '1150_AutonomousProcessorExecutionRunStateLedgerProcessor',
  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE',
  INPUT_DATE_COLUMN: 'Run_State_Date',
  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER',

  OUTPUT_HEADERS: [
    'Execution_Run_State_Ledger_ID',
    'Business_Key',
    'Run_State_Ledger_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Run_State_Records_Reviewed',
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
    'Daily_Brief_Ledger_Event_Type',
    'Run_State',
    'Run_State_Category',
    'Run_State_Ledger_Status',
    'Run_State_Ledger_Event_Type',
    'Run_State_Ledger_Conclusion',
    'Run_State_Ledger_Reason',
    'Recommended_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

function sciipRunAutonomousProcessorExecutionRunStateLedgerProcessor() {
  const cfg = SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();
  const outputSheet = sciipEnsureAutonomousProcessorExecutionRunStateLedgerSheet_();

  const resolvedLedgerDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER|' + resolvedLedgerDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionRunStateLedgerNoInput1150_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1150_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1150_(row[cfg.INPUT_DATE_COLUMN]) === resolvedLedgerDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionRunStateLedgerNoInput1150_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const record = sciipBuildAutonomousProcessorExecutionRunStateLedger1150_(
    sourceRows,
    businessKey,
    resolvedLedgerDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow1150_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    runStateLedgerDate: resolvedLedgerDate,
    runStateLedgerStatus: record.Run_State_Ledger_Status,
    runStateLedgerEventType: record.Run_State_Ledger_Event_Type,
    completedAt: startedAt.toISOString()
  };
}

function sciipBuildAutonomousProcessorExecutionRunStateLedger1150_(sourceRows, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER;
  const aggregate = sciipAggregateExecutionRunStateRows1150_(sourceRows);
  const ledger = sciipResolveExecutionRunStateLedger1150_(aggregate);

  return {
    Execution_Run_State_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Run_State_Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Run_State_Records_Reviewed: sourceRows.length,
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
    Daily_Brief_Ledger_Event_Type: aggregate.Daily_Brief_Ledger_Event_Type,
    Run_State: aggregate.Run_State,
    Run_State_Category: aggregate.Run_State_Category,
    Run_State_Ledger_Status: ledger.status,
    Run_State_Ledger_Event_Type: ledger.eventType,
    Run_State_Ledger_Conclusion: ledger.conclusion,
    Run_State_Ledger_Reason: ledger.reason,
    Recommended_Action: ledger.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1150_(aggregate, ledger),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

function sciipCreateAutonomousProcessorExecutionRunStateLedgerNoInput1150_(outputSheet, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER;

  const record = {
    Execution_Run_State_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Run_State_Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Run_State_Records_Reviewed: 0,
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
    Daily_Brief_Ledger_Event_Type: 'NO_DAILY_BRIEF_INPUT',
    Run_State: 'NO_RUN_STATE',
    Run_State_Category: 'NO_INPUTS',
    Run_State_Ledger_Status: 'RECORDED_NO_INPUTS',
    Run_State_Ledger_Event_Type: 'NO_RUN_STATE_INPUT',
    Run_State_Ledger_Conclusion: 'No autonomous execution run state was available to ledger.',
    Run_State_Ledger_Reason: 'No execution run-state records were available for the resolved ledger date.',
    Recommended_Action: 'Generate execution run-state records before relying on run-state-ledger reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-run-state-ledger history showing no available run-state inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1150_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionRunStateLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

function sciipEnsureAutonomousProcessorExecutionRunStateLedgerSheet_() {
  const cfg = SCIIP_1150_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1150_(sheet) {
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

function sciipObjectToRow1150_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1150_(value) {
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

function sciipAggregateExecutionRunStateRows1150_(rows) {
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
    Daily_Brief_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN',
    Run_State: 'UNKNOWN',
    Run_State_Category: 'UNCLASSIFIED',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1150_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1150_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1150_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1150_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1150_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1150_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1150_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1150_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1150_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1150_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1150_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1150_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Daily_Brief_Ledger_Event_Type = sciipHigherDailyBriefLedgerEventTypeConstraint1150_(aggregate.Daily_Brief_Ledger_Event_Type, row.Daily_Brief_Ledger_Event_Type);
    aggregate.Run_State = sciipHigherRunStateConstraint1150_(aggregate.Run_State, row.Run_State);
    aggregate.Run_State_Category = sciipHigherRunStateCategoryConstraint1150_(aggregate.Run_State_Category, row.Run_State_Category);
    aggregate.Dashboard_Flag = sciipYesNo1150_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1150_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionRunStateLedger1150_(aggregate) {
  if (aggregate.Run_State === 'STOPPED') {
    return {
      status: 'RECORDED_STOPPED_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_STOPPED',
      conclusion: 'Autonomous execution run state is stopped.',
      reason: 'Run-state records indicate action-required or blocked execution conditions.',
      action: 'Resolve blockers before downstream automation proceeds.'
    };
  }

  if (aggregate.Run_State === 'HELD') {
    return {
      status: 'RECORDED_HELD_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_HELD',
      conclusion: 'Autonomous execution run state is held.',
      reason: 'Run-state records indicate review-required execution conditions.',
      action: 'Complete governance review before advancing execution state.'
    };
  }

  if (aggregate.Run_State === 'MONITORING') {
    return {
      status: 'RECORDED_MONITORING_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_MONITORING',
      conclusion: 'Autonomous execution run state is monitoring.',
      reason: 'Run-state records indicate stable monitoring conditions.',
      action: 'Continue monitoring autonomous execution run state.'
    };
  }

  if (aggregate.Run_State === 'RUNNABLE') {
    return {
      status: 'RECORDED_RUNNABLE_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_RUNNABLE',
      conclusion: 'Autonomous execution run state is runnable.',
      reason: 'Run-state records indicate clear execution conditions.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Run_State === 'NO_RUN_STATE') {
    return {
      status: 'RECORDED_NO_RUN_STATE',
      eventType: 'AUTONOMOUS_EXECUTION_NO_RUN_STATE',
      conclusion: 'No autonomous execution run state was available.',
      reason: 'Run-state records indicate no usable upstream execution state.',
      action: 'Generate upstream run-state records before relying on run-state ledger.'
    };
  }

  return {
    status: 'RECORDED_UNKNOWN_RUN_STATE',
    eventType: 'AUTONOMOUS_EXECUTION_RUN_STATE_UNKNOWN',
    conclusion: 'Autonomous execution run state could not be classified.',
    reason: 'Run state did not match a known ledger class.',
    action: 'Review run-state records and normalize run-state values.'
  };
}

function sciipResolveKnowledgeGraphImpact1150_(aggregate, ledger) {
  return [
    'Created immutable autonomous execution run-state ledger entry.',
    'Run-state ledger status=' + ledger.status + '.',
    'Run-state ledger event=' + ledger.eventType + '.',
    'Run state=' + aggregate.Run_State + '.',
    'Run-state category=' + aggregate.Run_State_Category + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1150_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1150_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1150_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1150_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1150_(a, b) {
  const rank = { GO: 1, MONITOR: 2, REVIEW: 3, STOP: 4, NO_SIGNAL: 5, UNKNOWN: 6 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1150_(a, b) {
  const rank = { NONE: 0, WEAK: 1, NORMAL: 2, MODERATE: 3, STRONG: 4 };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1150_(a, b) {
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

function sciipHigherDailyBriefLedgerEventTypeConstraint1150_(a, b) {
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

function sciipHigherRunStateConstraint1150_(a, b) {
  const rank = {
    RUNNABLE: 1,
    MONITORING: 2,
    HELD: 3,
    STOPPED: 4,
    NO_RUN_STATE: 5,
    UNKNOWN: 6
  };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRunStateCategoryConstraint1150_(a, b) {
  const rank = {
    CLEAR: 1,
    STABLE: 2,
    REVIEW_REQUIRED: 3,
    ACTION_REQUIRED: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };
  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionRunStateLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateLedgerProcessor',
    result: result
  }));

  return result;
}