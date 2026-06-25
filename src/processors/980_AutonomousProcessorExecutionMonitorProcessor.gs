/*******************************************************
 * SCIIP_OS v4.1
 * 980_AutonomousProcessorExecutionMonitorProcessor
 *******************************************************/

const SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR = {
  PROCESSOR: '980_AutonomousProcessorExecutionMonitorProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE',
  INPUT_DATE_COLUMN: 'Orchestration_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR',

  OUTPUT_HEADERS: [
    'Execution_Monitor_ID',
    'Business_Key',
    'Monitor_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Execution_Risk_Reason',
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
function sciipRunAutonomousProcessorExecutionMonitorProcessor() {
  const cfg = SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionMonitorSheet_();

  const resolvedMonitorDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR|' + resolvedMonitorDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionMonitorsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);
  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionMonitorNoInput_(
      outputSheet,
      businessKey,
      resolvedMonitorDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects980_(inputSheet);
  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey980_(row[cfg.INPUT_DATE_COLUMN]) === resolvedMonitorDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionMonitorNoInput_(
      outputSheet,
      businessKey,
      resolvedMonitorDate,
      startedAt
    );
  }

  const monitor = sciipBuildAutonomousProcessorExecutionMonitor980_(
    sourceRows,
    businessKey,
    resolvedMonitorDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow980_(monitor, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionMonitorsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    monitorDate: resolvedMonitorDate,
    queueItemsReviewed: monitor.Queue_Items_Reviewed,
    executionRiskLevel: monitor.Execution_Risk_Level,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionMonitor980_(sourceRows, businessKey, monitorDate, startedAt) {
  const cfg = SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR;

  const statusCounts = sciipCountExecutionStatuses980_(sourceRows);
  const highestPriority = sciipResolveHighestPriority980_(sourceRows);
  const risk = sciipResolveExecutionRisk980_(statusCounts, sourceRows);
  const recommendedAction = sciipResolveRecommendedExecutionAction980_(risk, statusCounts);

  return {
    Execution_Monitor_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Monitor_Date: monitorDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Queue_Items_Reviewed: sourceRows.length,
    Ready_Count: statusCounts.READY,
    Blocked_Count: statusCounts.BLOCKED,
    Hold_Count: statusCounts.HOLD,
    Executed_Count: statusCounts.EXECUTED,
    Failed_Count: statusCounts.FAILED,
    Pending_Count: statusCounts.PENDING,
    Highest_Priority: highestPriority,
    Execution_Risk_Level: risk.level,
    Execution_Risk_Reason: risk.reason,
    Recommended_Action: recommendedAction,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact980_(statusCounts, sourceRows),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionMonitorNoInput_(outputSheet, businessKey, monitorDate, startedAt) {
  const cfg = SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR;

  const record = {
    Execution_Monitor_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Monitor_Date: monitorDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Execution_Risk_Reason: 'No orchestration queue records were available for the resolved monitor date.',
    Recommended_Action: 'No autonomous processor execution action required.',
    Knowledge_Graph_Impact: 'No new execution-monitor evidence created from source queue inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow980_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionMonitorsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionMonitorSheet_() {
  const cfg = SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects980_(sheet) {
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

function sciipObjectToRow980_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey980_(value) {
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

function sciipCountExecutionStatuses980_(rows) {
  const counts = {
    READY: 0,
    BLOCKED: 0,
    HOLD: 0,
    EXECUTED: 0,
    FAILED: 0,
    PENDING: 0
  };

  rows.forEach(function(row) {
    const status = sciipResolveQueueStatus980_(row);
    if (counts[status] === undefined) counts.PENDING++;
    else counts[status]++;
  });

  return counts;
}

function sciipResolveQueueStatus980_(row) {
  const raw =
    row.Execution_Status ||
    row.Queue_Status ||
    row.Orchestration_Status ||
    row.Status ||
    '';

  const status = String(raw).trim().toUpperCase();

  if (status.indexOf('READY') >= 0) return 'READY';
  if (status.indexOf('BLOCK') >= 0) return 'BLOCKED';
  if (status.indexOf('HOLD') >= 0) return 'HOLD';
  if (status.indexOf('EXECUT') >= 0 || status.indexOf('COMPLETE') >= 0) return 'EXECUTED';
  if (status.indexOf('FAIL') >= 0 || status.indexOf('ERROR') >= 0) return 'FAILED';

  return 'PENDING';
}

function sciipResolveHighestPriority980_(rows) {
  const rank = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    NORMAL: 2,
    LOW: 1,
    NONE: 0
  };

  let highest = 'NONE';

  rows.forEach(function(row) {
    const raw =
      row.Priority ||
      row.Execution_Priority ||
      row.Orchestration_Priority ||
      'NORMAL';

    const priority = String(raw).trim().toUpperCase();

    if ((rank[priority] || 0) > rank[highest]) highest = priority;
  });

  return highest;
}

function sciipResolveExecutionRisk980_(counts, rows) {
  if (counts.FAILED > 0) {
    return {
      level: 'HIGH',
      reason: 'One or more autonomous processor queue items have failed execution status.'
    };
  }

  if (counts.BLOCKED > 0) {
    return {
      level: 'HIGH',
      reason: 'One or more autonomous processor queue items are blocked.'
    };
  }

  if (counts.HOLD > 0) {
    return {
      level: 'MEDIUM',
      reason: 'One or more autonomous processor queue items are on hold.'
    };
  }

  if (counts.READY > 0 && counts.EXECUTED === 0) {
    return {
      level: 'MEDIUM',
      reason: 'Queue contains ready work but no executed items for the monitor date.'
    };
  }

  if (rows.length > 0 && counts.PENDING === rows.length) {
    return {
      level: 'MEDIUM',
      reason: 'All queue items remain pending.'
    };
  }

  return {
    level: 'LOW',
    reason: 'No blocked or failed autonomous processor queue items detected.'
  };
}

function sciipResolveRecommendedExecutionAction980_(risk, counts) {
  if (risk.level === 'HIGH' && counts.FAILED > 0) {
    return 'Review failed autonomous processor queue items before continuing downstream execution.';
  }

  if (risk.level === 'HIGH' && counts.BLOCKED > 0) {
    return 'Resolve blocked autonomous processor dependencies before promotion to execution.';
  }

  if (risk.level === 'MEDIUM' && counts.HOLD > 0) {
    return 'Review held autonomous processor queue items and determine whether to release or defer.';
  }

  if (risk.level === 'MEDIUM') {
    return 'Continue monitoring queue readiness before launching additional autonomous execution.';
  }

  return 'Proceed with downstream autonomous execution monitoring.';
}

function sciipResolveKnowledgeGraphImpact980_(counts, rows) {
  if (rows.length === 0) {
    return 'No autonomous execution state was available to strengthen the knowledge graph.';
  }

  return [
    'Created permanent execution-monitor history for autonomous processor orchestration.',
    'Reviewed ' + rows.length + ' queue item(s).',
    'Ready=' + counts.READY,
    'Blocked=' + counts.BLOCKED,
    'Hold=' + counts.HOLD,
    'Executed=' + counts.EXECUTED,
    'Failed=' + counts.FAILED,
    'Pending=' + counts.PENDING
  ].join(' ');
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionMonitorProcessor() {
  const result = sciipRunAutonomousProcessorExecutionMonitorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionMonitorProcessor',
    result: result
  }));

  return result;
}