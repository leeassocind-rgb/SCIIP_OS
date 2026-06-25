/*******************************************************
 * SCIIP_OS v4.1
 * 1130_AutonomousProcessorExecutionDailyBriefLedgerProcessor
 *******************************************************/

const SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER = {
  PROCESSOR: '1130_AutonomousProcessorExecutionDailyBriefLedgerProcessor',
  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF',
  INPUT_DATE_COLUMN: 'Brief_Date',
  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER',

  OUTPUT_HEADERS: [
    'Execution_Daily_Brief_Ledger_ID',
    'Business_Key',
    'Daily_Brief_Ledger_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Daily_Brief_Records_Reviewed',
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
    'Signal_Ledger_Status',
    'Signal_Ledger_Event_Type',
    'Signal_Digest_Status',
    'Signal_Digest_Severity',
    'Daily_Brief_Status',
    'Daily_Brief_Ledger_Status',
    'Daily_Brief_Ledger_Event_Type',
    'Daily_Brief_Ledger_Conclusion',
    'Daily_Brief_Ledger_Reason',
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

function sciipRunAutonomousProcessorExecutionDailyBriefLedgerProcessor() {
  const cfg = SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();
  const outputSheet = sciipEnsureAutonomousProcessorExecutionDailyBriefLedgerSheet_();

  const resolvedLedgerDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER|' + resolvedLedgerDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionDailyBriefLedgerNoInput1130_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1130_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1130_(row[cfg.INPUT_DATE_COLUMN]) === resolvedLedgerDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionDailyBriefLedgerNoInput1130_(
      outputSheet,
      businessKey,
      resolvedLedgerDate,
      startedAt
    );
  }

  const record = sciipBuildAutonomousProcessorExecutionDailyBriefLedger1130_(
    sourceRows,
    businessKey,
    resolvedLedgerDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow1130_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionDailyBriefLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    dailyBriefLedgerDate: resolvedLedgerDate,
    dailyBriefLedgerStatus: record.Daily_Brief_Ledger_Status,
    dailyBriefLedgerEventType: record.Daily_Brief_Ledger_Event_Type,
    completedAt: startedAt.toISOString()
  };
}

function sciipBuildAutonomousProcessorExecutionDailyBriefLedger1130_(sourceRows, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER;
  const aggregate = sciipAggregateExecutionDailyBriefRows1130_(sourceRows);
  const ledger = sciipResolveExecutionDailyBriefLedger1130_(aggregate);

  return {
    Execution_Daily_Brief_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Daily_Brief_Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Daily_Brief_Records_Reviewed: sourceRows.length,
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
    Signal_Ledger_Status: aggregate.Signal_Ledger_Status,
    Signal_Ledger_Event_Type: aggregate.Signal_Ledger_Event_Type,
    Signal_Digest_Status: aggregate.Signal_Digest_Status,
    Signal_Digest_Severity: aggregate.Signal_Digest_Severity,
    Daily_Brief_Status: aggregate.Daily_Brief_Status,
    Daily_Brief_Ledger_Status: ledger.status,
    Daily_Brief_Ledger_Event_Type: ledger.eventType,
    Daily_Brief_Ledger_Conclusion: ledger.conclusion,
    Daily_Brief_Ledger_Reason: ledger.reason,
    Recommended_Action: ledger.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1130_(aggregate, ledger),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

function sciipCreateAutonomousProcessorExecutionDailyBriefLedgerNoInput1130_(outputSheet, businessKey, ledgerDate, startedAt) {
  const cfg = SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER;

  const record = {
    Execution_Daily_Brief_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Daily_Brief_Ledger_Date: ledgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Daily_Brief_Records_Reviewed: 0,
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
    Signal_Ledger_Status: 'RECORDED_NO_INPUTS',
    Signal_Ledger_Event_Type: 'NO_SYSTEM_SIGNAL_INPUT',
    Signal_Digest_Status: 'NO_INPUTS',
    Signal_Digest_Severity: 'UNKNOWN',
    Daily_Brief_Status: 'NO_INPUTS',
    Daily_Brief_Ledger_Status: 'RECORDED_NO_INPUTS',
    Daily_Brief_Ledger_Event_Type: 'NO_DAILY_BRIEF_INPUT',
    Daily_Brief_Ledger_Conclusion: 'No autonomous execution daily brief was available to ledger.',
    Daily_Brief_Ledger_Reason: 'No execution daily-brief records were available for the resolved ledger date.',
    Recommended_Action: 'Generate execution daily-brief records before relying on daily-brief-ledger reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-daily-brief-ledger history showing no available daily-brief inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1130_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionDailyBriefLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

function sciipEnsureAutonomousProcessorExecutionDailyBriefLedgerSheet_() {
  const cfg = SCIIP_1130_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF_LEDGER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1130_(sheet) {
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

function sciipObjectToRow1130_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1130_(value) {
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

function sciipAggregateExecutionDailyBriefRows1130_(rows) {
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
    Signal_Ledger_Status: 'RECORDED_UNKNOWN_SIGNAL',
    Signal_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL',
    Signal_Digest_Status: 'SIGNAL_DIGEST_UNKNOWN',
    Signal_Digest_Severity: 'UNKNOWN',
    Daily_Brief_Status: 'BRIEF_UNCLASSIFIED',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1130_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1130_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1130_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1130_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1130_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1130_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1130_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1130_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1130_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1130_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1130_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1130_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Signal_Ledger_Status = sciipHigherSignalLedgerStatusConstraint1130_(aggregate.Signal_Ledger_Status, row.Signal_Ledger_Status);
    aggregate.Signal_Ledger_Event_Type = sciipHigherSignalLedgerEventTypeConstraint1130_(aggregate.Signal_Ledger_Event_Type, row.Signal_Ledger_Event_Type);
    aggregate.Signal_Digest_Status = sciipHigherSignalDigestStatusConstraint1130_(aggregate.Signal_Digest_Status, row.Signal_Digest_Status);
    aggregate.Signal_Digest_Severity = sciipHigherSeverity1130_(aggregate.Signal_Digest_Severity, row.Signal_Digest_Severity);
    aggregate.Daily_Brief_Status = sciipHigherDailyBriefStatusConstraint1130_(aggregate.Daily_Brief_Status, row.Daily_Brief_Status);
    aggregate.Dashboard_Flag = sciipYesNo1130_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1130_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionDailyBriefLedger1130_(aggregate) {
  if (aggregate.Daily_Brief_Status === 'BRIEF_ACTION_REQUIRED') {
    return {
      status: 'RECORDED_ACTION_REQUIRED_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_ACTION_REQUIRED',
      conclusion: 'Autonomous execution daily brief requires action.',
      reason: 'Daily brief records show an action-required autonomous execution state.',
      action: 'Escalate and resolve blockers before downstream automation proceeds.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'BRIEF_REVIEW_REQUIRED') {
    return {
      status: 'RECORDED_REVIEW_REQUIRED_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_REVIEW_REQUIRED',
      conclusion: 'Autonomous execution daily brief requires review.',
      reason: 'Daily brief records show a review-required autonomous execution state.',
      action: 'Complete governance review and rerun daily brief processors if state changes.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'BRIEF_MONITORING') {
    return {
      status: 'RECORDED_MONITORING_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_MONITORING',
      conclusion: 'Autonomous execution daily brief is monitoring.',
      reason: 'Daily brief records show a stable monitoring state.',
      action: 'Continue monitoring autonomous execution daily brief state.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'BRIEF_CLEAR') {
    return {
      status: 'RECORDED_CLEAR_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_CLEAR',
      conclusion: 'Autonomous execution daily brief is clear.',
      reason: 'Daily brief records show a clear autonomous execution state.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'BRIEF_NO_SIGNAL') {
    return {
      status: 'RECORDED_NO_SIGNAL_BRIEF',
      eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_NO_SIGNAL',
      conclusion: 'Autonomous execution daily brief recorded no signal.',
      reason: 'Daily brief records indicate no usable execution signal.',
      action: 'Generate upstream signal records before relying on daily brief ledger.'
    };
  }

  if (aggregate.Daily_Brief_Status === 'NO_INPUTS') {
    return {
      status: 'RECORDED_NO_INPUTS',
      eventType: 'NO_DAILY_BRIEF_INPUT',
      conclusion: 'No autonomous execution daily brief input was available.',
      reason: 'Daily brief input records were unavailable.',
      action: 'Generate daily brief records before ledger reporting.'
    };
  }

  return {
    status: 'RECORDED_UNKNOWN_BRIEF',
    eventType: 'AUTONOMOUS_EXECUTION_DAILY_BRIEF_UNKNOWN',
    conclusion: 'Autonomous execution daily brief could not be classified.',
    reason: 'Daily brief status did not match a known ledger class.',
    action: 'Review daily brief records and normalize daily brief status values.'
  };
}

function sciipResolveKnowledgeGraphImpact1130_(aggregate, ledger) {
  return [
    'Created immutable autonomous execution daily brief ledger entry.',
    'Daily brief ledger status=' + ledger.status + '.',
    'Daily brief ledger event=' + ledger.eventType + '.',
    'Daily brief status=' + aggregate.Daily_Brief_Status + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Signal digest status=' + aggregate.Signal_Digest_Status + '.',
    'Signal ledger event=' + aggregate.Signal_Ledger_Event_Type + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1130_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1130_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1130_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1130_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1130_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1130_(a, b) {
  const rank = { GO: 1, MONITOR: 2, REVIEW: 3, STOP: 4, NO_SIGNAL: 5, UNKNOWN: 6 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1130_(a, b) {
  const rank = { NONE: 0, WEAK: 1, NORMAL: 2, MODERATE: 3, STRONG: 4 };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1130_(a, b) {
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

function sciipHigherSignalLedgerStatusConstraint1130_(a, b) {
  const rank = {
    RECORDED_GO_SIGNAL: 1,
    RECORDED_MONITOR_SIGNAL: 2,
    RECORDED_REVIEW_SIGNAL: 3,
    RECORDED_STOP_SIGNAL: 4,
    RECORDED_NO_SIGNAL: 5,
    RECORDED_NO_INPUTS: 6,
    RECORDED_UNKNOWN_SIGNAL: 7
  };
  const aa = String(a || 'RECORDED_UNKNOWN_SIGNAL').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN_SIGNAL').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalLedgerEventTypeConstraint1130_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_GO_SIGNAL: 1,
    AUTONOMOUS_EXECUTION_MONITOR_SIGNAL: 2,
    AUTONOMOUS_EXECUTION_REVIEW_SIGNAL: 3,
    AUTONOMOUS_EXECUTION_STOP_SIGNAL: 4,
    AUTONOMOUS_EXECUTION_NO_SIGNAL: 5,
    NO_SYSTEM_SIGNAL_INPUT: 6,
    AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalDigestStatusConstraint1130_(a, b) {
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

function sciipHigherDailyBriefStatusConstraint1130_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionDailyBriefLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionDailyBriefLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionDailyBriefLedgerProcessor',
    result: result
  }));

  return result;
}