/*******************************************************
 * SCIIP_OS v4.1
 * 1070_AutonomousProcessorExecutionHealthProcessor
 *******************************************************/

const SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH = {
  PROCESSOR: '1070_AutonomousProcessorExecutionHealthProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER',
  INPUT_DATE_COLUMN: 'Command_Center_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH',

  OUTPUT_HEADERS: [
    'Execution_Health_ID',
    'Business_Key',
    'Health_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Command_Center_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Summary_Status',
    'Operational_Posture',
    'Governance_Status',
    'Governance_Decision',
    'Governance_Risk_Level',
    'Command_Center_Status',
    'Command_Center_Severity',
    'Dashboard_Flag',
    'Leadership_Flag',
    'Health_Status',
    'Health_Score',
    'Health_Rating',
    'Health_Reason',
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
function sciipRunAutonomousProcessorExecutionHealthProcessor() {
  const cfg = SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionHealthSheet_();

  const resolvedHealthDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH|' + resolvedHealthDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionHealthRecordsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionHealthNoInput1070_(
      outputSheet,
      businessKey,
      resolvedHealthDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1070_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1070_(row[cfg.INPUT_DATE_COLUMN]) === resolvedHealthDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionHealthNoInput1070_(
      outputSheet,
      businessKey,
      resolvedHealthDate,
      startedAt
    );
  }

  const healthRecord =
    sciipBuildAutonomousProcessorExecutionHealth1070_(
      sourceRows,
      businessKey,
      resolvedHealthDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1070_(healthRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionHealthRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    healthDate: resolvedHealthDate,
    healthStatus: healthRecord.Health_Status,
    healthScore: healthRecord.Health_Score,
    healthRating: healthRecord.Health_Rating,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionHealth1070_(sourceRows, businessKey, healthDate, startedAt) {
  const cfg = SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH;

  const aggregate = sciipAggregateExecutionCommandCenterRows1070_(sourceRows);
  const health = sciipResolveExecutionHealth1070_(aggregate);

  return {
    Execution_Health_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Health_Date: healthDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Command_Center_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Summary_Status: aggregate.Summary_Status,
    Operational_Posture: aggregate.Operational_Posture,
    Governance_Status: aggregate.Governance_Status,
    Governance_Decision: aggregate.Governance_Decision,
    Governance_Risk_Level: aggregate.Governance_Risk_Level,
    Command_Center_Status: aggregate.Command_Center_Status,
    Command_Center_Severity: aggregate.Command_Center_Severity,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Health_Status: health.status,
    Health_Score: health.score,
    Health_Rating: health.rating,
    Health_Reason: health.reason,
    Recommended_Action: health.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1070_(aggregate, health),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionHealthNoInput1070_(outputSheet, businessKey, healthDate, startedAt) {
  const cfg = SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH;

  const record = {
    Execution_Health_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Health_Date: healthDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Command_Center_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Summary_Status: 'NO_SUMMARY_INPUT',
    Operational_Posture: 'NO_INPUTS',
    Governance_Status: 'NO_GOVERNANCE_INPUT',
    Governance_Decision: 'DO_NOT_CERTIFY',
    Governance_Risk_Level: 'UNKNOWN',
    Command_Center_Status: 'NO_INPUTS',
    Command_Center_Severity: 'UNKNOWN',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Health_Status: 'NO_INPUTS',
    Health_Score: 0,
    Health_Rating: 'UNKNOWN',
    Health_Reason: 'No execution command-center records were available for the resolved health date.',
    Recommended_Action: 'Generate command-center execution records before relying on execution-health reporting.',
    Knowledge_Graph_Impact: 'Created permanent execution-health history showing no available command-center inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1070_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionHealthRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionHealthSheet_() {
  const cfg = SCIIP_1070_AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1070_(sheet) {
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

function sciipObjectToRow1070_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1070_(value) {
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

function sciipAggregateExecutionCommandCenterRows1070_(rows) {
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
    Summary_Status: 'SUMMARY_UNKNOWN',
    Operational_Posture: 'REVIEW_REQUIRED',
    Governance_Status: 'GOVERNANCE_UNCLASSIFIED',
    Governance_Decision: 'REQUIRE_REVIEW',
    Governance_Risk_Level: 'MEDIUM',
    Command_Center_Status: 'UNCLASSIFIED',
    Command_Center_Severity: 'MEDIUM',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'YES'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1070_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1070_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1070_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1070_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1070_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1070_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1070_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1070_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1070_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Summary_Status = sciipHigherSummaryStatusConstraint1070_(aggregate.Summary_Status, row.Summary_Status);
    aggregate.Operational_Posture = sciipHigherOperationalPostureConstraint1070_(aggregate.Operational_Posture, row.Operational_Posture);
    aggregate.Governance_Status = sciipHigherGovernanceStatusConstraint1070_(aggregate.Governance_Status, row.Governance_Status);
    aggregate.Governance_Decision = sciipHigherGovernanceDecisionConstraint1070_(aggregate.Governance_Decision, row.Governance_Decision);
    aggregate.Governance_Risk_Level = sciipHigherGovernanceRiskConstraint1070_(aggregate.Governance_Risk_Level, row.Governance_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1070_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherCommandCenterSeverityConstraint1070_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Dashboard_Flag = sciipYesNo1070_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1070_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionHealth1070_(aggregate) {
  if (
    aggregate.Command_Center_Status === 'ACTION_REQUIRED' ||
    aggregate.Command_Center_Severity === 'HIGH' ||
    aggregate.Failed_Count > 0 ||
    aggregate.Blocked_Count > 0
  ) {
    return {
      status: 'UNHEALTHY',
      score: 25,
      rating: 'RED',
      reason: 'Execution health is unhealthy because command-center reporting indicates action required, high severity, blocked items, or failed items.',
      action: 'Resolve execution blockers and rerun the autonomous processor execution chain.'
    };
  }

  if (
    aggregate.Command_Center_Status === 'REVIEW_REQUIRED' ||
    aggregate.Command_Center_Severity === 'MEDIUM' ||
    aggregate.Hold_Count > 0
  ) {
    return {
      status: 'DEGRADED',
      score: 60,
      rating: 'YELLOW',
      reason: 'Execution health is degraded because governance or command-center state requires review.',
      action: 'Complete review and rerun affected execution processors.'
    };
  }

  if (aggregate.Command_Center_Status === 'MONITORING') {
    return {
      status: 'STABLE_MONITORING',
      score: 80,
      rating: 'BLUE',
      reason: 'Execution health is stable but monitoring because execution state has not fully cleared.',
      action: 'Continue monitoring until execution state clears or changes.'
    };
  }

  if (aggregate.Command_Center_Status === 'CLEARED') {
    return {
      status: 'HEALTHY',
      score: 100,
      rating: 'GREEN',
      reason: 'Execution health is healthy because command-center status is cleared and no blocking execution conditions were detected.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Command_Center_Status === 'NO_INPUTS') {
    return {
      status: 'NO_INPUTS',
      score: 0,
      rating: 'UNKNOWN',
      reason: 'Execution health cannot be assessed because no command-center input records are available.',
      action: 'Generate command-center records before relying on health assessment.'
    };
  }

  return {
    status: 'UNCLASSIFIED',
    score: 50,
    rating: 'YELLOW',
    reason: 'Execution health could not classify the command-center state.',
    action: 'Review command-center records and normalize health inputs.'
  };
}

function sciipResolveKnowledgeGraphImpact1070_(aggregate, health) {
  return [
    'Created permanent autonomous execution health history.',
    'Health status=' + health.status + '.',
    'Health score=' + health.score + '.',
    'Health rating=' + health.rating + '.',
    'Command-center status=' + aggregate.Command_Center_Status + '.',
    'Command-center severity=' + aggregate.Command_Center_Severity + '.',
    'Governance status=' + aggregate.Governance_Status + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1070_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1070_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();

  if (aa === 'YES' || bb === 'YES') return 'YES';
  return 'NO';
}

function sciipHigherPriority1070_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1070_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSummaryStatusConstraint1070_(a, b) {
  const rank = {
    SUMMARY_CLEAR: 1,
    SUMMARY_PENDING: 2,
    SUMMARY_REVIEW_REQUIRED: 3,
    SUMMARY_BLOCKED: 4,
    SUMMARY_NO_OUTCOME: 5,
    NO_SUMMARY_INPUT: 6,
    SUMMARY_UNKNOWN: 7
  };

  const aa = String(a || 'SUMMARY_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'SUMMARY_UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOperationalPostureConstraint1070_(a, b) {
  const rank = {
    OPERATIONAL: 1,
    MONITORING: 2,
    CONTROLLED_REVIEW: 3,
    BLOCKED: 4,
    NO_INPUTS: 5,
    REVIEW_REQUIRED: 6
  };

  const aa = String(a || 'REVIEW_REQUIRED').trim().toUpperCase();
  const bb = String(b || 'REVIEW_REQUIRED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceStatusConstraint1070_(a, b) {
  const rank = {
    GOVERNANCE_CERTIFIED: 1,
    GOVERNANCE_MONITORING: 2,
    GOVERNANCE_REVIEW_REQUIRED: 3,
    GOVERNANCE_BLOCKED: 4,
    GOVERNANCE_NO_INPUTS: 5,
    GOVERNANCE_UNCLASSIFIED: 6
  };

  const aa = String(a || 'GOVERNANCE_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'GOVERNANCE_UNCLASSIFIED').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceDecisionConstraint1070_(a, b) {
  const rank = {
    CERTIFY_EXECUTION_STATE: 1,
    CERTIFY_MONITORING_STATE: 2,
    REQUIRE_REVIEW: 3,
    DO_NOT_CERTIFY: 4
  };

  const aa = String(a || 'REQUIRE_REVIEW').trim().toUpperCase();
  const bb = String(b || 'REQUIRE_REVIEW').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherGovernanceRiskConstraint1070_(a, b) {
  const rank = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    UNKNOWN: 4
  };

  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1070_(a, b) {
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

function sciipHigherCommandCenterSeverityConstraint1070_(a, b) {
  const rank = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    UNKNOWN: 4
  };

  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionHealthProcessor() {
  const result = sciipRunAutonomousProcessorExecutionHealthProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionHealthProcessor',
    result: result
  }));

  return result;
}