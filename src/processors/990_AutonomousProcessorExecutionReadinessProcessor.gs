/*******************************************************
 * SCIIP_OS v4.1
 * 990_AutonomousProcessorExecutionReadinessProcessor
 *******************************************************/

const SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS = {
  PROCESSOR: '990_AutonomousProcessorExecutionReadinessProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR',
  INPUT_DATE_COLUMN: 'Monitor_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_READINESS',

  OUTPUT_HEADERS: [
    'Execution_Readiness_ID',
    'Business_Key',
    'Readiness_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Monitor_Records_Reviewed',
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
    'Readiness_Reason',
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
function sciipRunAutonomousProcessorExecutionReadinessProcessor() {
  const cfg = SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionReadinessSheet_();

  const resolvedReadinessDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_READINESS|' + resolvedReadinessDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionReadinessCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionReadinessNoInput990_(
      outputSheet,
      businessKey,
      resolvedReadinessDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects990_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey990_(row[cfg.INPUT_DATE_COLUMN]) === resolvedReadinessDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionReadinessNoInput990_(
      outputSheet,
      businessKey,
      resolvedReadinessDate,
      startedAt
    );
  }

  const readinessRecord =
    sciipBuildAutonomousProcessorExecutionReadiness990_(
      sourceRows,
      businessKey,
      resolvedReadinessDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow990_(readinessRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionReadinessCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    readinessDate: resolvedReadinessDate,
    readinessStatus: readinessRecord.Readiness_Status,
    readinessDecision: readinessRecord.Readiness_Decision,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionReadiness990_(sourceRows, businessKey, readinessDate, startedAt) {
  const cfg = SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS;

  const aggregate = sciipAggregateExecutionMonitorRows990_(sourceRows);
  const decision = sciipResolveExecutionReadinessDecision990_(aggregate);

  return {
    Execution_Readiness_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Readiness_Date: readinessDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Monitor_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: decision.status,
    Readiness_Decision: decision.decision,
    Readiness_Reason: decision.reason,
    Recommended_Action: decision.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact990_(aggregate, decision),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionReadinessNoInput990_(outputSheet, businessKey, readinessDate, startedAt) {
  const cfg = SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS;

  const record = {
    Execution_Readiness_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Readiness_Date: readinessDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Monitor_Records_Reviewed: 0,
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
    Readiness_Reason: 'No execution monitor records were available for the resolved readiness date.',
    Recommended_Action: 'Do not advance autonomous processor execution until monitor records exist.',
    Knowledge_Graph_Impact: 'Created permanent readiness history showing no available execution monitor inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow990_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionReadinessCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionReadinessSheet_() {
  const cfg = SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects990_(sheet) {
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

function sciipObjectToRow990_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey990_(value) {
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

function sciipAggregateExecutionMonitorRows990_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber990_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber990_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber990_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber990_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber990_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber990_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber990_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority990_(
      aggregate.Highest_Priority,
      row.Highest_Priority
    );

    aggregate.Execution_Risk_Level = sciipHigherRisk990_(
      aggregate.Execution_Risk_Level,
      row.Execution_Risk_Level
    );
  });

  return aggregate;
}

function sciipResolveExecutionReadinessDecision990_(aggregate) {
  if (aggregate.Failed_Count > 0) {
    return {
      status: 'NOT_READY',
      decision: 'DEFER_EXECUTION',
      reason: 'Execution readiness failed because one or more monitored processor queue items failed.',
      action: 'Investigate failed queue items before advancing autonomous processor execution.'
    };
  }

  if (aggregate.Blocked_Count > 0) {
    return {
      status: 'NOT_READY',
      decision: 'DEFER_EXECUTION',
      reason: 'Execution readiness failed because one or more monitored processor queue items are blocked.',
      action: 'Resolve blocked dependencies before downstream autonomous execution.'
    };
  }

  if (aggregate.Hold_Count > 0) {
    return {
      status: 'CONDITIONALLY_READY',
      decision: 'HOLD_FOR_REVIEW',
      reason: 'Execution readiness is conditional because one or more queue items are on hold.',
      action: 'Review held items and either release, defer, or remove them from the execution queue.'
    };
  }

  if (aggregate.Queue_Items_Reviewed === 0) {
    return {
      status: 'NOT_READY',
      decision: 'DEFER_EXECUTION',
      reason: 'No queue items were reviewed by the execution monitor.',
      action: 'Wait for execution monitor records before advancing.'
    };
  }

  if (aggregate.Ready_Count > 0 || aggregate.Executed_Count > 0) {
    return {
      status: 'READY',
      decision: 'ADVANCE_EXECUTION',
      reason: 'Execution monitor shows available ready or executed work with no failed or blocked items.',
      action: 'Advance to downstream autonomous execution control.'
    };
  }

  return {
    status: 'CONDITIONALLY_READY',
    decision: 'CONTINUE_MONITORING',
    reason: 'Queue items exist but no ready or executed work was detected.',
    action: 'Continue monitoring until ready work is available.'
  };
}

function sciipResolveKnowledgeGraphImpact990_(aggregate, decision) {
  return [
    'Created permanent autonomous execution readiness decision history.',
    'Decision=' + decision.decision + '.',
    'Readiness=' + decision.status + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.',
    'Ready=' + aggregate.Ready_Count + '.',
    'Blocked=' + aggregate.Blocked_Count + '.',
    'Failed=' + aggregate.Failed_Count + '.',
    'Hold=' + aggregate.Hold_Count + '.'
  ].join(' ');
}

function sciipNumber990_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority990_(a, b) {
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

function sciipHigherRisk990_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionReadinessProcessor() {
  const result = sciipRunAutonomousProcessorExecutionReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionReadinessProcessor',
    result: result
  }));

  return result;
}