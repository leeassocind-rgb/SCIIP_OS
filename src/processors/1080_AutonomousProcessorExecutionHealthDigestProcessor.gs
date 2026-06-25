/*******************************************************
 * SCIIP_OS v4.1
 * 1080_AutonomousProcessorExecutionHealthDigestProcessor
 *******************************************************/

const SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST = {
  PROCESSOR: '1080_AutonomousProcessorExecutionHealthDigestProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH',
  INPUT_DATE_COLUMN: 'Health_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST',

  OUTPUT_HEADERS: [
    'Execution_Health_Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Health_Records_Reviewed',
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
    'Digest_Title',
    'Digest_Body',
    'Digest_Severity',
    'Digest_Action',
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
function sciipRunAutonomousProcessorExecutionHealthDigestProcessor() {
  const cfg = SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionHealthDigestSheet_();

  const resolvedDigestDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST|' + resolvedDigestDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionHealthDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionHealthDigestNoInput1080_(
      outputSheet,
      businessKey,
      resolvedDigestDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1080_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1080_(row[cfg.INPUT_DATE_COLUMN]) === resolvedDigestDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionHealthDigestNoInput1080_(
      outputSheet,
      businessKey,
      resolvedDigestDate,
      startedAt
    );
  }

  const digestRecord =
    sciipBuildAutonomousProcessorExecutionHealthDigest1080_(
      sourceRows,
      businessKey,
      resolvedDigestDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1080_(digestRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionHealthDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    digestDate: resolvedDigestDate,
    digestStatus: digestRecord.Digest_Status,
    digestSeverity: digestRecord.Digest_Severity,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionHealthDigest1080_(sourceRows, businessKey, digestDate, startedAt) {
  const cfg = SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST;

  const aggregate = sciipAggregateExecutionHealthRows1080_(sourceRows);
  const digest = sciipResolveExecutionHealthDigest1080_(aggregate);

  return {
    Execution_Health_Digest_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Digest_Date: digestDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Health_Records_Reviewed: sourceRows.length,
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
    Digest_Status: digest.status,
    Digest_Title: digest.title,
    Digest_Body: digest.body,
    Digest_Severity: digest.severity,
    Digest_Action: digest.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1080_(aggregate, digest),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionHealthDigestNoInput1080_(outputSheet, businessKey, digestDate, startedAt) {
  const cfg = SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST;

  const record = {
    Execution_Health_Digest_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Digest_Date: digestDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Health_Records_Reviewed: 0,
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
    Digest_Title: 'No autonomous execution health records available.',
    Digest_Body: 'SCIIP_OS could not create an execution health digest because no execution-health records were available for the resolved digest date.',
    Digest_Severity: 'UNKNOWN',
    Digest_Action: 'Generate execution-health records before relying on health-digest reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-health-digest history showing no available health inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1080_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionHealthDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionHealthDigestSheet_() {
  const cfg = SCIIP_1080_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1080_(sheet) {
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

function sciipObjectToRow1080_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1080_(value) {
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

function sciipAggregateExecutionHealthRows1080_(rows) {
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
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1080_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1080_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1080_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1080_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1080_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1080_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1080_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1080_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1080_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1080_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherSeverity1080_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Health_Status = sciipHigherHealthStatusConstraint1080_(aggregate.Health_Status, row.Health_Status);
    aggregate.Health_Rating = sciipHigherHealthRatingConstraint1080_(aggregate.Health_Rating, row.Health_Rating);
    aggregate.Health_Score = Math.max(aggregate.Health_Score, sciipNumber1080_(row.Health_Score));
    aggregate.Dashboard_Flag = sciipYesNo1080_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1080_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionHealthDigest1080_(aggregate) {
  if (aggregate.Health_Status === 'UNHEALTHY') {
    return {
      status: 'DIGEST_ACTION_REQUIRED',
      title: 'Autonomous execution health is red.',
      body: 'SCIIP_OS detected an unhealthy autonomous execution state. Command-center status, severity, blocked work, or failed work indicates that the execution chain should not be treated as clear.',
      severity: 'HIGH',
      action: 'Resolve execution blockers and rerun the autonomous execution chain.'
    };
  }

  if (aggregate.Health_Status === 'DEGRADED') {
    return {
      status: 'DIGEST_REVIEW_REQUIRED',
      title: 'Autonomous execution health is degraded.',
      body: 'SCIIP_OS detected a degraded autonomous execution state. The chain is not fully blocked, but review or remediation is required before relying on downstream autonomous execution posture.',
      severity: 'MEDIUM',
      action: 'Complete review and rerun affected execution processors.'
    };
  }

  if (aggregate.Health_Status === 'STABLE_MONITORING') {
    return {
      status: 'DIGEST_MONITORING',
      title: 'Autonomous execution health is stable and monitoring.',
      body: 'SCIIP_OS detected a stable monitoring state. The system is not blocked, but execution has not fully cleared into a green operating posture.',
      severity: 'LOW',
      action: 'Continue monitoring until execution health clears or changes.'
    };
  }

  if (aggregate.Health_Status === 'HEALTHY') {
    return {
      status: 'DIGEST_HEALTHY',
      title: 'Autonomous execution health is green.',
      body: 'SCIIP_OS detected a healthy autonomous execution state. Command-center and health records indicate the execution chain is cleared for downstream reporting.',
      severity: 'LOW',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Health_Status === 'NO_INPUTS') {
    return {
      status: 'DIGEST_NO_INPUTS',
      title: 'No autonomous execution health inputs available.',
      body: 'SCIIP_OS could not assess autonomous execution health because no usable health inputs were available.',
      severity: 'UNKNOWN',
      action: 'Generate execution-health records before relying on the digest.'
    };
  }

  return {
    status: 'DIGEST_UNCLASSIFIED',
    title: 'Autonomous execution health digest is unclassified.',
    body: 'SCIIP_OS created a health digest, but the health status did not match a known digest class.',
    severity: 'MEDIUM',
    action: 'Review execution-health records and normalize health status values.'
  };
}

function sciipResolveKnowledgeGraphImpact1080_(aggregate, digest) {
  return [
    'Created permanent autonomous execution health digest history.',
    'Digest status=' + digest.status + '.',
    'Digest severity=' + digest.severity + '.',
    'Health status=' + aggregate.Health_Status + '.',
    'Health score=' + aggregate.Health_Score + '.',
    'Health rating=' + aggregate.Health_Rating + '.',
    'Command-center status=' + aggregate.Command_Center_Status + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1080_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1080_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1080_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1080_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1080_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1080_(a, b) {
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

function sciipHigherHealthStatusConstraint1080_(a, b) {
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

function sciipHigherHealthRatingConstraint1080_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionHealthDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionHealthDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionHealthDigestProcessor',
    result: result
  }));

  return result;
}