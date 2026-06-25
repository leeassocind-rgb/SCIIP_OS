/*******************************************************
 * SCIIP_OS v4.1
 * 1120_AutonomousProcessorExecutionDailyBriefProcessor
 *******************************************************/

const SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF = {
  PROCESSOR: '1120_AutonomousProcessorExecutionDailyBriefProcessor',
  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST',
  INPUT_DATE_COLUMN: 'Signal_Digest_Date',
  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF',

  OUTPUT_HEADERS: [
    'Execution_Daily_Brief_ID',
    'Business_Key',
    'Brief_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Signal_Digest_Records_Reviewed',
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
    'Daily_Brief_Title',
    'Daily_Brief_Narrative',
    'Daily_Brief_Action',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

function sciipRunAutonomousProcessorExecutionDailyBriefProcessor() {
  const cfg = SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();
  const outputSheet = sciipEnsureAutonomousProcessorExecutionDailyBriefSheet_();

  const resolvedBriefDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey = 'AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF|' + resolvedBriefDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionDailyBriefNoInput1120_(
      outputSheet,
      businessKey,
      resolvedBriefDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1120_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1120_(row[cfg.INPUT_DATE_COLUMN]) === resolvedBriefDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionDailyBriefNoInput1120_(
      outputSheet,
      businessKey,
      resolvedBriefDate,
      startedAt
    );
  }

  const briefRecord = sciipBuildAutonomousProcessorExecutionDailyBrief1120_(
    sourceRows,
    businessKey,
    resolvedBriefDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow1120_(briefRecord, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    briefDate: resolvedBriefDate,
    dailyBriefStatus: briefRecord.Daily_Brief_Status,
    completedAt: startedAt.toISOString()
  };
}

function sciipBuildAutonomousProcessorExecutionDailyBrief1120_(sourceRows, businessKey, briefDate, startedAt) {
  const cfg = SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF;
  const aggregate = sciipAggregateExecutionSignalDigestRows1120_(sourceRows);
  const brief = sciipResolveExecutionDailyBrief1120_(aggregate);

  return {
    Execution_Daily_Brief_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Brief_Date: briefDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Signal_Digest_Records_Reviewed: sourceRows.length,
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
    Daily_Brief_Status: brief.status,
    Daily_Brief_Title: brief.title,
    Daily_Brief_Narrative: brief.narrative,
    Daily_Brief_Action: brief.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1120_(aggregate, brief),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

function sciipCreateAutonomousProcessorExecutionDailyBriefNoInput1120_(outputSheet, businessKey, briefDate, startedAt) {
  const cfg = SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF;

  const record = {
    Execution_Daily_Brief_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Brief_Date: briefDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Signal_Digest_Records_Reviewed: 0,
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
    Daily_Brief_Title: 'No autonomous execution signal digest available.',
    Daily_Brief_Narrative: 'SCIIP_OS could not create an autonomous execution daily brief because no signal-digest records were available for the resolved brief date.',
    Daily_Brief_Action: 'Generate signal-digest records before relying on daily execution brief reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-daily-brief history showing no available signal-digest inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1120_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

function sciipEnsureAutonomousProcessorExecutionDailyBriefSheet_() {
  const cfg = SCIIP_1120_AUTONOMOUS_PROCESSOR_EXECUTION_DAILY_BRIEF;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1120_(sheet) {
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

function sciipObjectToRow1120_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1120_(value) {
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

function sciipAggregateExecutionSignalDigestRows1120_(rows) {
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
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1120_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1120_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1120_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1120_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1120_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1120_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1120_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1120_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1120_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1120_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1120_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1120_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Signal_Ledger_Status = sciipHigherSignalLedgerStatusConstraint1120_(aggregate.Signal_Ledger_Status, row.Signal_Ledger_Status);
    aggregate.Signal_Ledger_Event_Type = sciipHigherSignalLedgerEventTypeConstraint1120_(aggregate.Signal_Ledger_Event_Type, row.Signal_Ledger_Event_Type);
    aggregate.Signal_Digest_Status = sciipHigherSignalDigestStatusConstraint1120_(aggregate.Signal_Digest_Status, row.Signal_Digest_Status);
    aggregate.Signal_Digest_Severity = sciipHigherSeverity1120_(aggregate.Signal_Digest_Severity, row.Signal_Digest_Severity);
    aggregate.Dashboard_Flag = sciipYesNo1120_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1120_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionDailyBrief1120_(aggregate) {
  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_STOP') {
    return {
      status: 'BRIEF_ACTION_REQUIRED',
      title: 'Daily Brief: Autonomous execution requires action.',
      narrative: 'SCIIP_OS recorded a STOP signal for the autonomous execution chain. The system should be treated as blocked or escalated until upstream conditions are remediated.',
      action: 'Escalate, resolve blockers, and rerun the execution processors from monitor through daily brief.'
    };
  }

  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_REVIEW') {
    return {
      status: 'BRIEF_REVIEW_REQUIRED',
      title: 'Daily Brief: Autonomous execution requires review.',
      narrative: 'SCIIP_OS recorded a REVIEW signal. The execution chain is not fully blocked, but governance review is required before it should be treated as clear.',
      action: 'Complete governance review and rerun signal and daily brief processors if state changes.'
    };
  }

  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_MONITOR') {
    return {
      status: 'BRIEF_MONITORING',
      title: 'Daily Brief: Autonomous execution is monitoring.',
      narrative: 'SCIIP_OS recorded a MONITOR signal. The autonomous execution chain is stable but should remain under observation.',
      action: 'Continue monitoring autonomous execution state.'
    };
  }

  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_GO') {
    return {
      status: 'BRIEF_CLEAR',
      title: 'Daily Brief: Autonomous execution is clear.',
      narrative: 'SCIIP_OS recorded a GO signal. The autonomous execution chain is healthy and cleared for downstream reporting.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Signal_Digest_Status === 'SIGNAL_DIGEST_NO_SIGNAL') {
    return {
      status: 'BRIEF_NO_SIGNAL',
      title: 'Daily Brief: No autonomous execution signal.',
      narrative: 'SCIIP_OS did not identify a usable autonomous execution system signal for the resolved brief date.',
      action: 'Generate upstream system-signal and signal-ledger records before relying on daily brief reporting.'
    };
  }

  return {
    status: 'BRIEF_UNCLASSIFIED',
    title: 'Daily Brief: Autonomous execution state is unclassified.',
    narrative: 'SCIIP_OS created a daily brief, but the signal digest status did not match a known daily brief class.',
    action: 'Review signal digest records and normalize signal digest values.'
  };
}

function sciipResolveKnowledgeGraphImpact1120_(aggregate, brief) {
  return [
    'Created permanent autonomous execution daily brief history.',
    'Daily brief status=' + brief.status + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Signal digest status=' + aggregate.Signal_Digest_Status + '.',
    'Signal ledger event=' + aggregate.Signal_Ledger_Event_Type + '.',
    'Signal routing=' + aggregate.Signal_Routing + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1120_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1120_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1120_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1120_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1120_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1120_(a, b) {
  const rank = { GO: 1, MONITOR: 2, REVIEW: 3, STOP: 4, NO_SIGNAL: 5, UNKNOWN: 6 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1120_(a, b) {
  const rank = { NONE: 0, WEAK: 1, NORMAL: 2, MODERATE: 3, STRONG: 4 };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1120_(a, b) {
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

function sciipHigherSignalLedgerStatusConstraint1120_(a, b) {
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

function sciipHigherSignalLedgerEventTypeConstraint1120_(a, b) {
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

function sciipHigherSignalDigestStatusConstraint1120_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionDailyBriefProcessor() {
  const result = sciipRunAutonomousProcessorExecutionDailyBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionDailyBriefProcessor',
    result: result
  }));

  return result;
}