/*******************************************************
 * SCIIP_OS v4.1
 * 1110_AutonomousProcessorExecutionSignalDigestProcessor
 *******************************************************/

const SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST = {
  PROCESSOR: '1110_AutonomousProcessorExecutionSignalDigestProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER',
  INPUT_DATE_COLUMN: 'Signal_Ledger_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST',

  OUTPUT_HEADERS: [
    'Execution_Signal_Digest_ID',
    'Business_Key',
    'Signal_Digest_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Signal_Ledger_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Command_Center_Status',
    'Command_Center_Severity',
    'Health_Status',
    'Health_Score',
    'Health_Rating',
    'Digest_Status',
    'Digest_Severity',
    'System_Signal',
    'Signal_Strength',
    'Signal_Routing',
    'Signal_Ledger_Status',
    'Signal_Ledger_Event_Type',
    'Signal_Digest_Status',
    'Signal_Digest_Title',
    'Signal_Digest_Body',
    'Signal_Digest_Severity',
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

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionSignalDigestProcessor() {
  const cfg = SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionSignalDigestSheet_();

  const resolvedSignalDigestDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST|' + resolvedSignalDigestDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionSignalDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionSignalDigestNoInput1110_(
      outputSheet,
      businessKey,
      resolvedSignalDigestDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1110_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1110_(row[cfg.INPUT_DATE_COLUMN]) === resolvedSignalDigestDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionSignalDigestNoInput1110_(
      outputSheet,
      businessKey,
      resolvedSignalDigestDate,
      startedAt
    );
  }

  const digestRecord =
    sciipBuildAutonomousProcessorExecutionSignalDigest1110_(
      sourceRows,
      businessKey,
      resolvedSignalDigestDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1110_(digestRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionSignalDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    signalDigestDate: resolvedSignalDigestDate,
    signalDigestStatus: digestRecord.Signal_Digest_Status,
    signalDigestSeverity: digestRecord.Signal_Digest_Severity,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionSignalDigest1110_(sourceRows, businessKey, signalDigestDate, startedAt) {
  const cfg = SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST;

  const aggregate = sciipAggregateExecutionSignalLedgerRows1110_(sourceRows);
  const digest = sciipResolveExecutionSignalDigest1110_(aggregate);

  return {
    Execution_Signal_Digest_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Digest_Date: signalDigestDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Signal_Ledger_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Command_Center_Status: aggregate.Command_Center_Status,
    Command_Center_Severity: aggregate.Command_Center_Severity,
    Health_Status: aggregate.Health_Status,
    Health_Score: aggregate.Health_Score,
    Health_Rating: aggregate.Health_Rating,
    Digest_Status: aggregate.Digest_Status,
    Digest_Severity: aggregate.Digest_Severity,
    System_Signal: aggregate.System_Signal,
    Signal_Strength: aggregate.Signal_Strength,
    Signal_Routing: aggregate.Signal_Routing,
    Signal_Ledger_Status: aggregate.Signal_Ledger_Status,
    Signal_Ledger_Event_Type: aggregate.Signal_Ledger_Event_Type,
    Signal_Digest_Status: digest.status,
    Signal_Digest_Title: digest.title,
    Signal_Digest_Body: digest.body,
    Signal_Digest_Severity: digest.severity,
    Recommended_Action: digest.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1110_(aggregate, digest),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionSignalDigestNoInput1110_(outputSheet, businessKey, signalDigestDate, startedAt) {
  const cfg = SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST;

  const record = {
    Execution_Signal_Digest_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Digest_Date: signalDigestDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Signal_Ledger_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Command_Center_Status: 'NO_INPUTS',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'NO_INPUTS',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'NO_INPUTS',
    Digest_Severity: 'UNKNOWN',
    System_Signal: 'NO_SIGNAL',
    Signal_Strength: 'NONE',
    Signal_Routing: 'NO_ROUTE',
    Signal_Ledger_Status: 'RECORDED_NO_INPUTS',
    Signal_Ledger_Event_Type: 'NO_SYSTEM_SIGNAL_INPUT',
    Signal_Digest_Status: 'NO_INPUTS',
    Signal_Digest_Title: 'No autonomous execution signal-ledger records available.',
    Signal_Digest_Body: 'SCIIP_OS could not create an execution signal digest because no signal-ledger records were available for the resolved signal-digest date.',
    Signal_Digest_Severity: 'UNKNOWN',
    Recommended_Action: 'Generate execution signal-ledger records before relying on signal-digest reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-signal-digest history showing no available signal-ledger inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1110_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionSignalDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionSignalDigestSheet_() {
  const cfg = SCIIP_1110_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_DIGEST;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1110_(sheet) {
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

function sciipObjectToRow1110_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1110_(value) {
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

function sciipAggregateExecutionSignalLedgerRows1110_(rows) {
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
    Command_Center_Status: 'UNCLASSIFIED',
    Command_Center_Severity: 'UNKNOWN',
    Health_Status: 'UNCLASSIFIED',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Digest_Status: 'DIGEST_UNCLASSIFIED',
    Digest_Severity: 'UNKNOWN',
    System_Signal: 'UNKNOWN',
    Signal_Strength: 'WEAK',
    Signal_Routing: 'GOVERNANCE_AND_DASHBOARD',
    Signal_Ledger_Status: 'RECORDED_UNKNOWN_SIGNAL',
    Signal_Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL',
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1110_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1110_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1110_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1110_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1110_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1110_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1110_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1110_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1110_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1110_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherSeverity1110_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Health_Status = sciipHigherHealthStatusConstraint1110_(aggregate.Health_Status, row.Health_Status);
    aggregate.Health_Rating = sciipHigherHealthRatingConstraint1110_(aggregate.Health_Rating, row.Health_Rating);
    aggregate.Health_Score = Math.max(aggregate.Health_Score, sciipNumber1110_(row.Health_Score));
    aggregate.Digest_Status = sciipHigherDigestStatusConstraint1110_(aggregate.Digest_Status, row.Digest_Status);
    aggregate.Digest_Severity = sciipHigherSeverity1110_(aggregate.Digest_Severity, row.Digest_Severity);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1110_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1110_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1110_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Signal_Ledger_Status = sciipHigherSignalLedgerStatusConstraint1110_(aggregate.Signal_Ledger_Status, row.Signal_Ledger_Status);
    aggregate.Signal_Ledger_Event_Type = sciipHigherSignalLedgerEventTypeConstraint1110_(aggregate.Signal_Ledger_Event_Type, row.Signal_Ledger_Event_Type);
    aggregate.Dashboard_Flag = sciipYesNo1110_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1110_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionSignalDigest1110_(aggregate) {
  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_STOP_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_STOP',
      title: 'Autonomous execution signal: STOP.',
      body: 'SCIIP_OS recorded a STOP signal in the execution signal ledger. The autonomous execution chain requires escalation or remediation before downstream automation should continue.',
      severity: 'HIGH',
      action: 'Escalate execution signal state, resolve blockers, and rerun the autonomous execution chain.'
    };
  }

  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_REVIEW_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_REVIEW',
      title: 'Autonomous execution signal: REVIEW.',
      body: 'SCIIP_OS recorded a REVIEW signal in the execution signal ledger. The autonomous execution chain requires governance review before it should be treated as clear.',
      severity: 'MEDIUM',
      action: 'Complete governance review and rerun signal processors if the state changes.'
    };
  }

  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_MONITOR_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_MONITOR',
      title: 'Autonomous execution signal: MONITOR.',
      body: 'SCIIP_OS recorded a MONITOR signal in the execution signal ledger. The autonomous execution chain is stable but should continue to be observed.',
      severity: 'LOW',
      action: 'Continue monitoring autonomous execution signal state.'
    };
  }

  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_GO_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_GO',
      title: 'Autonomous execution signal: GO.',
      body: 'SCIIP_OS recorded a GO signal in the execution signal ledger. The autonomous execution chain is healthy and may continue downstream reporting.',
      severity: 'LOW',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Signal_Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_NO_SIGNAL') {
    return {
      status: 'SIGNAL_DIGEST_NO_SIGNAL',
      title: 'Autonomous execution signal: NO SIGNAL.',
      body: 'SCIIP_OS recorded that no usable autonomous execution system signal was available.',
      severity: 'UNKNOWN',
      action: 'Generate upstream system-signal records before relying on signal digest reporting.'
    };
  }

  return {
    status: 'SIGNAL_DIGEST_UNKNOWN',
    title: 'Autonomous execution signal digest is unclassified.',
    body: 'SCIIP_OS created a signal digest, but the signal-ledger event type did not match a known digest class.',
    severity: 'MEDIUM',
    action: 'Review signal-ledger records and normalize signal-ledger event values.'
  };
}

function sciipResolveKnowledgeGraphImpact1110_(aggregate, digest) {
  return [
    'Created permanent autonomous execution signal digest history.',
    'Signal digest status=' + digest.status + '.',
    'Signal digest severity=' + digest.severity + '.',
    'Signal-ledger event=' + aggregate.Signal_Ledger_Event_Type + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Signal strength=' + aggregate.Signal_Strength + '.',
    'Signal routing=' + aggregate.Signal_Routing + '.',
    'Health status=' + aggregate.Health_Status + '.'
  ].join(' ');
}

function sciipNumber1110_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1110_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1110_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1110_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1110_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1110_(a, b) {
  const rank = {
    CLEARED: 1,
    MONITORING: 2,
    REVIEW_REQUIRED: 3,
    ACTION_REQUIRED: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };
  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthStatusConstraint1110_(a, b) {
  const rank = {
    HEALTHY: 1,
    STABLE_MONITORING: 2,
    DEGRADED: 3,
    UNHEALTHY: 4,
    NO_INPUTS: 5,
    UNCLASSIFIED: 6
  };
  const aa = String(a || 'UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherHealthRatingConstraint1110_(a, b) {
  const rank = {
    GREEN: 1,
    BLUE: 2,
    YELLOW: 3,
    RED: 4,
    UNKNOWN: 5
  };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDigestStatusConstraint1110_(a, b) {
  const rank = {
    DIGEST_HEALTHY: 1,
    DIGEST_MONITORING: 2,
    DIGEST_REVIEW_REQUIRED: 3,
    DIGEST_ACTION_REQUIRED: 4,
    DIGEST_NO_INPUTS: 5,
    DIGEST_UNCLASSIFIED: 6
  };
  const aa = String(a || 'DIGEST_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'DIGEST_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSystemSignalConstraint1110_(a, b) {
  const rank = {
    GO: 1,
    MONITOR: 2,
    REVIEW: 3,
    STOP: 4,
    NO_SIGNAL: 5,
    UNKNOWN: 6
  };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalStrengthConstraint1110_(a, b) {
  const rank = {
    NONE: 0,
    WEAK: 1,
    NORMAL: 2,
    MODERATE: 3,
    STRONG: 4
  };
  const aa = String(a || 'WEAK').trim().toUpperCase();
  const bb = String(b || 'WEAK').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSignalRoutingConstraint1110_(a, b) {
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

function sciipHigherSignalLedgerStatusConstraint1110_(a, b) {
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

function sciipHigherSignalLedgerEventTypeConstraint1110_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionSignalDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionSignalDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionSignalDigestProcessor',
    result: result
  }));

  return result;
}