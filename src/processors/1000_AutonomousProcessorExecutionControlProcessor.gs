/*******************************************************
 * SCIIP_OS v4.1
 * 1000_AutonomousProcessorExecutionControlProcessor
 *******************************************************/

const SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL = {
  PROCESSOR: '1000_AutonomousProcessorExecutionControlProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_READINESS',
  INPUT_DATE_COLUMN: 'Readiness_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL',

  OUTPUT_HEADERS: [
    'Execution_Control_ID',
    'Business_Key',
    'Control_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Readiness_Records_Reviewed',
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
    'Control_Reason',
    'Execution_Gate',
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
function sciipRunAutonomousProcessorExecutionControlProcessor() {
  const cfg = SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionControlSheet_();

  const resolvedControlDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL|' + resolvedControlDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionControlsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionControlNoInput1000_(
      outputSheet,
      businessKey,
      resolvedControlDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1000_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1000_(row[cfg.INPUT_DATE_COLUMN]) === resolvedControlDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionControlNoInput1000_(
      outputSheet,
      businessKey,
      resolvedControlDate,
      startedAt
    );
  }

  const controlRecord =
    sciipBuildAutonomousProcessorExecutionControl1000_(
      sourceRows,
      businessKey,
      resolvedControlDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1000_(controlRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionControlsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    controlDate: resolvedControlDate,
    controlStatus: controlRecord.Control_Status,
    controlDirective: controlRecord.Control_Directive,
    executionGate: controlRecord.Execution_Gate,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionControl1000_(sourceRows, businessKey, controlDate, startedAt) {
  const cfg = SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL;

  const aggregate = sciipAggregateExecutionReadinessRows1000_(sourceRows);
  const control = sciipResolveExecutionControlDirective1000_(aggregate);

  return {
    Execution_Control_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Control_Date: controlDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Readiness_Records_Reviewed: sourceRows.length,
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
    Control_Status: control.status,
    Control_Directive: control.directive,
    Control_Reason: control.reason,
    Execution_Gate: control.gate,
    Recommended_Action: control.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1000_(aggregate, control),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionControlNoInput1000_(outputSheet, businessKey, controlDate, startedAt) {
  const cfg = SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL;

  const record = {
    Execution_Control_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Control_Date: controlDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Readiness_Records_Reviewed: 0,
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
    Control_Reason: 'No execution readiness records were available for the resolved control date.',
    Execution_Gate: 'CLOSED',
    Recommended_Action: 'Do not advance autonomous execution until readiness records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-control history showing no available readiness inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1000_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionControlsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionControlSheet_() {
  const cfg = SCIIP_1000_AUTONOMOUS_PROCESSOR_EXECUTION_CONTROL;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1000_(sheet) {
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

function sciipObjectToRow1000_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1000_(value) {
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

function sciipAggregateExecutionReadinessRows1000_(rows) {
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
    Readiness_Decision: 'DEFER_EXECUTION'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1000_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1000_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1000_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1000_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1000_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1000_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1000_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1000_(
      aggregate.Highest_Priority,
      row.Highest_Priority
    );

    aggregate.Execution_Risk_Level = sciipHigherRisk1000_(
      aggregate.Execution_Risk_Level,
      row.Execution_Risk_Level
    );

    aggregate.Readiness_Status = sciipHigherReadinessConstraint1000_(
      aggregate.Readiness_Status,
      row.Readiness_Status
    );

    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1000_(
      aggregate.Readiness_Decision,
      row.Readiness_Decision
    );
  });

  return aggregate;
}

function sciipResolveExecutionControlDirective1000_(aggregate) {
  if (aggregate.Failed_Count > 0) {
    return {
      status: 'STOPPED',
      directive: 'DO_NOT_ADVANCE',
      reason: 'Execution control stopped because readiness inputs contain failed queue items.',
      gate: 'CLOSED',
      action: 'Investigate failed queue items and regenerate readiness before any downstream execution.'
    };
  }

  if (aggregate.Blocked_Count > 0) {
    return {
      status: 'STOPPED',
      directive: 'DO_NOT_ADVANCE',
      reason: 'Execution control stopped because readiness inputs contain blocked queue items.',
      gate: 'CLOSED',
      action: 'Resolve blocked dependencies and rerun execution monitor and readiness processors.'
    };
  }

  if (aggregate.Readiness_Decision === 'DEFER_EXECUTION') {
    return {
      status: 'STOPPED',
      directive: 'DO_NOT_ADVANCE',
      reason: 'Readiness decision requires execution deferral.',
      gate: 'CLOSED',
      action: 'Do not execute downstream autonomous processors until readiness improves.'
    };
  }

  if (aggregate.Hold_Count > 0 || aggregate.Readiness_Decision === 'HOLD_FOR_REVIEW') {
    return {
      status: 'HELD',
      directive: 'MANUAL_REVIEW_REQUIRED',
      reason: 'Execution control is held because readiness inputs require review.',
      gate: 'REVIEW',
      action: 'Review held items and release only approved autonomous processor work.'
    };
  }

  if (aggregate.Readiness_Decision === 'CONTINUE_MONITORING') {
    return {
      status: 'MONITORING',
      directive: 'WAIT',
      reason: 'Execution control is waiting because readiness inputs do not yet indicate executable work.',
      gate: 'PENDING',
      action: 'Continue monitoring until ready autonomous processor work exists.'
    };
  }

  if (aggregate.Readiness_Status === 'READY' && aggregate.Readiness_Decision === 'ADVANCE_EXECUTION') {
    return {
      status: 'CLEARED',
      directive: 'ADVANCE_AUTONOMOUS_EXECUTION',
      reason: 'Readiness inputs confirm autonomous processor execution may advance.',
      gate: 'OPEN',
      action: 'Proceed to downstream autonomous execution dispatch.'
    };
  }

  return {
    status: 'MONITORING',
    directive: 'WAIT',
    reason: 'Execution control could not confirm full readiness to advance.',
    gate: 'PENDING',
    action: 'Continue monitoring execution readiness state.'
  };
}

function sciipResolveKnowledgeGraphImpact1000_(aggregate, control) {
  return [
    'Created permanent autonomous execution-control directive history.',
    'Directive=' + control.directive + '.',
    'Gate=' + control.gate + '.',
    'Control status=' + control.status + '.',
    'Readiness decision=' + aggregate.Readiness_Decision + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.',
    'Ready=' + aggregate.Ready_Count + '.',
    'Blocked=' + aggregate.Blocked_Count + '.',
    'Failed=' + aggregate.Failed_Count + '.',
    'Hold=' + aggregate.Hold_Count + '.'
  ].join(' ');
}

function sciipNumber1000_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1000_(a, b) {
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

function sciipHigherRisk1000_(a, b) {
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

function sciipHigherReadinessConstraint1000_(a, b) {
  const rank = {
    READY: 1,
    CONDITIONALLY_READY: 2,
    NOT_READY: 3
  };

  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1000_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionControlProcessor() {
  const result = sciipRunAutonomousProcessorExecutionControlProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionControlProcessor',
    result: result
  }));

  return result;
}