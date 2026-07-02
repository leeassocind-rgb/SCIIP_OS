/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1030_AutonomousProcessorExecutionOutcomeProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionOutcomeProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1030_AutonomousProcessorExecutionOutcomeProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOMES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOMES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1030_AutonomousProcessorExecutionOutcomeProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionOutcomeProcessorLegacy1030_();
      return sciipWrapLegacyRuntimeResult1030_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1030_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 1030_AutonomousProcessorExecutionOutcomeProcessor
 *******************************************************/

const SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME = {
  PROCESSOR: '1030_AutonomousProcessorExecutionOutcomeProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_LEDGER',
  INPUT_DATE_COLUMN: 'Ledger_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME',

  OUTPUT_HEADERS: [
    'Execution_Outcome_ID',
    'Business_Key',
    'Outcome_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Ledger_Records_Reviewed',
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
    'Execution_Gate',
    'Dispatch_Status',
    'Dispatch_Decision',
    'Dispatch_Mode',
    'Ledger_Status',
    'Ledger_Event_Type',
    'Outcome_Status',
    'Outcome_Type',
    'Outcome_Conclusion',
    'Outcome_Reason',
    'Operational_Impact',
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
function sciipRunAutonomousProcessorExecutionOutcomeProcessorLegacy1030_() {
  const cfg = SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionOutcomeSheet_();

  const resolvedOutcomeDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME|' + resolvedOutcomeDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionOutcomesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionOutcomeNoInput1030_(
      outputSheet,
      businessKey,
      resolvedOutcomeDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1030_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1030_(row[cfg.INPUT_DATE_COLUMN]) === resolvedOutcomeDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionOutcomeNoInput1030_(
      outputSheet,
      businessKey,
      resolvedOutcomeDate,
      startedAt
    );
  }

  const outcomeRecord =
    sciipBuildAutonomousProcessorExecutionOutcome1030_(
      sourceRows,
      businessKey,
      resolvedOutcomeDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1030_(outcomeRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionOutcomesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    outcomeDate: resolvedOutcomeDate,
    outcomeStatus: outcomeRecord.Outcome_Status,
    outcomeType: outcomeRecord.Outcome_Type,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionOutcome1030_(sourceRows, businessKey, outcomeDate, startedAt) {
  const cfg = SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME;

  const aggregate = sciipAggregateExecutionLedgerRows1030_(sourceRows);
  const outcome = sciipResolveExecutionOutcome1030_(aggregate);

  return {
    Execution_Outcome_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Outcome_Date: outcomeDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Ledger_Records_Reviewed: sourceRows.length,
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
    Control_Status: aggregate.Control_Status,
    Control_Directive: aggregate.Control_Directive,
    Execution_Gate: aggregate.Execution_Gate,
    Dispatch_Status: aggregate.Dispatch_Status,
    Dispatch_Decision: aggregate.Dispatch_Decision,
    Dispatch_Mode: aggregate.Dispatch_Mode,
    Ledger_Status: aggregate.Ledger_Status,
    Ledger_Event_Type: aggregate.Ledger_Event_Type,
    Outcome_Status: outcome.status,
    Outcome_Type: outcome.type,
    Outcome_Conclusion: outcome.conclusion,
    Outcome_Reason: outcome.reason,
    Operational_Impact: outcome.impact,
    Recommended_Action: outcome.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1030_(aggregate, outcome),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionOutcomeNoInput1030_(outputSheet, businessKey, outcomeDate, startedAt) {
  const cfg = SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME;

  const record = {
    Execution_Outcome_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Outcome_Date: outcomeDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Ledger_Records_Reviewed: 0,
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
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_NO_INPUTS',
    Ledger_Event_Type: 'NO_LEDGER_INPUT',
    Outcome_Status: 'NO_OUTCOME',
    Outcome_Type: 'NO_LEDGER_INPUT',
    Outcome_Conclusion: 'No autonomous execution outcome could be classified.',
    Outcome_Reason: 'No execution ledger records were available for the resolved outcome date.',
    Operational_Impact: 'No operational execution impact was detected.',
    Recommended_Action: 'Do not create downstream execution summaries until ledger records exist.',
    Knowledge_Graph_Impact: 'Created permanent execution-outcome history showing no available ledger inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1030_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionOutcomesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionOutcomeSheet_() {
  const cfg = SCIIP_1030_AUTONOMOUS_PROCESSOR_EXECUTION_OUTCOME;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1030_(sheet) {
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

function sciipObjectToRow1030_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1030_(value) {
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

function sciipAggregateExecutionLedgerRows1030_(rows) {
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
    Readiness_Decision: 'DEFER_EXECUTION',
    Control_Status: 'STOPPED',
    Control_Directive: 'DO_NOT_ADVANCE',
    Execution_Gate: 'CLOSED',
    Dispatch_Status: 'NOT_DISPATCHED',
    Dispatch_Decision: 'DO_NOT_DISPATCH',
    Dispatch_Mode: 'NONE',
    Ledger_Status: 'RECORDED_UNKNOWN',
    Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1030_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1030_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1030_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1030_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1030_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1030_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1030_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1030_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1030_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Readiness_Status = sciipHigherReadinessConstraint1030_(aggregate.Readiness_Status, row.Readiness_Status);
    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1030_(aggregate.Readiness_Decision, row.Readiness_Decision);
    aggregate.Control_Status = sciipHigherControlStatusConstraint1030_(aggregate.Control_Status, row.Control_Status);
    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1030_(aggregate.Control_Directive, row.Control_Directive);
    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1030_(aggregate.Execution_Gate, row.Execution_Gate);
    aggregate.Dispatch_Status = sciipHigherDispatchStatusConstraint1030_(aggregate.Dispatch_Status, row.Dispatch_Status);
    aggregate.Dispatch_Decision = sciipHigherDispatchDecisionConstraint1030_(aggregate.Dispatch_Decision, row.Dispatch_Decision);
    aggregate.Dispatch_Mode = sciipHigherDispatchModeConstraint1030_(aggregate.Dispatch_Mode, row.Dispatch_Mode);
    aggregate.Ledger_Status = sciipHigherLedgerStatusConstraint1030_(aggregate.Ledger_Status, row.Ledger_Status);
    aggregate.Ledger_Event_Type = sciipHigherLedgerEventTypeConstraint1030_(aggregate.Ledger_Event_Type, row.Ledger_Event_Type);
  });

  return aggregate;
}

function sciipResolveExecutionOutcome1030_(aggregate) {
  if (aggregate.Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DISPATCH_APPROVED') {
    return {
      status: 'OUTCOME_SUCCESS',
      type: 'EXECUTION_ADVANCED',
      conclusion: 'Autonomous processor execution was approved for downstream advancement.',
      reason: 'Execution ledger records show dispatch approved with an open execution pathway.',
      impact: 'SCIIP_OS autonomous processor chain is operating and cleared for downstream execution tracking.',
      action: 'Continue to downstream execution-result and performance processors.'
    };
  }

  if (aggregate.Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_REVIEW_REQUIRED') {
    return {
      status: 'OUTCOME_REVIEW_REQUIRED',
      type: 'EXECUTION_HELD',
      conclusion: 'Autonomous processor execution was held for review.',
      reason: 'Execution ledger records show manual review is required before dispatch can advance.',
      impact: 'SCIIP_OS preserved control discipline and prevented unreviewed autonomous execution.',
      action: 'Complete review and rerun monitor, readiness, control, dispatch, ledger, and outcome processors.'
    };
  }

  if (aggregate.Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_WAITING') {
    return {
      status: 'OUTCOME_PENDING',
      type: 'EXECUTION_WAITING',
      conclusion: 'Autonomous processor execution is waiting.',
      reason: 'Execution ledger records show dispatch is not yet approved or blocked.',
      impact: 'SCIIP_OS maintained pending execution state without forcing downstream action.',
      action: 'Continue monitoring until autonomous execution is approved, blocked, or reviewed.'
    };
  }

  if (aggregate.Ledger_Event_Type === 'AUTONOMOUS_EXECUTION_DISPATCH_BLOCKED') {
    return {
      status: 'OUTCOME_BLOCKED',
      type: 'EXECUTION_BLOCKED',
      conclusion: 'Autonomous processor execution was blocked.',
      reason: 'Execution ledger records show dispatch was blocked by upstream readiness or control conditions.',
      impact: 'SCIIP_OS prevented unsafe downstream autonomous execution.',
      action: 'Resolve upstream blockers and rerun the autonomous execution chain.'
    };
  }

  return {
    status: 'OUTCOME_UNKNOWN',
    type: 'EXECUTION_UNCLASSIFIED',
    conclusion: 'Autonomous processor execution outcome could not be classified.',
    reason: 'Execution ledger event type did not match a known outcome class.',
    impact: 'SCIIP_OS recorded an unclassified outcome requiring normalization review.',
    action: 'Review execution ledger records and normalize event type values.'
  };
}

function sciipResolveKnowledgeGraphImpact1030_(aggregate, outcome) {
  return [
    'Created permanent autonomous execution outcome history.',
    'Outcome status=' + outcome.status + '.',
    'Outcome type=' + outcome.type + '.',
    'Ledger event=' + aggregate.Ledger_Event_Type + '.',
    'Ledger status=' + aggregate.Ledger_Status + '.',
    'Dispatch decision=' + aggregate.Dispatch_Decision + '.',
    'Execution gate=' + aggregate.Execution_Gate + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1030_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1030_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1030_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1030_(a, b) {
  const rank = { READY: 1, CONDITIONALLY_READY: 2, NOT_READY: 3 };
  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1030_(a, b) {
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

function sciipHigherControlStatusConstraint1030_(a, b) {
  const rank = { CLEARED: 1, MONITORING: 2, HELD: 3, STOPPED: 4 };
  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1030_(a, b) {
  const rank = {
    ADVANCE_AUTONOMOUS_EXECUTION: 1,
    WAIT: 2,
    MANUAL_REVIEW_REQUIRED: 3,
    DO_NOT_ADVANCE: 4
  };
  const aa = String(a || 'DO_NOT_ADVANCE').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_ADVANCE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherExecutionGateConstraint1030_(a, b) {
  const rank = { OPEN: 1, PENDING: 2, REVIEW: 3, CLOSED: 4 };
  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchStatusConstraint1030_(a, b) {
  const rank = {
    DISPATCH_READY: 1,
    WAITING: 2,
    HELD_FOR_REVIEW: 3,
    NOT_DISPATCHED: 4
  };
  const aa = String(a || 'NOT_DISPATCHED').trim().toUpperCase();
  const bb = String(b || 'NOT_DISPATCHED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchDecisionConstraint1030_(a, b) {
  const rank = {
    DISPATCH_APPROVED: 1,
    WAIT_TO_DISPATCH: 2,
    REQUIRE_MANUAL_DISPATCH_REVIEW: 3,
    DO_NOT_DISPATCH: 4
  };
  const aa = String(a || 'DO_NOT_DISPATCH').trim().toUpperCase();
  const bb = String(b || 'DO_NOT_DISPATCH').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchModeConstraint1030_(a, b) {
  const rank = {
    AUTONOMOUS: 1,
    MONITOR_ONLY: 2,
    MANUAL_REVIEW: 3,
    NONE: 4
  };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerStatusConstraint1030_(a, b) {
  const rank = {
    RECORDED_DISPATCH_APPROVED: 1,
    RECORDED_WAITING: 2,
    RECORDED_REVIEW_REQUIRED: 3,
    RECORDED_BLOCKED: 4,
    RECORDED_NO_INPUTS: 5,
    RECORDED_UNKNOWN: 6
  };
  const aa = String(a || 'RECORDED_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'RECORDED_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherLedgerEventTypeConstraint1030_(a, b) {
  const rank = {
    AUTONOMOUS_EXECUTION_DISPATCH_APPROVED: 1,
    AUTONOMOUS_EXECUTION_WAITING: 2,
    AUTONOMOUS_EXECUTION_REVIEW_REQUIRED: 3,
    AUTONOMOUS_EXECUTION_DISPATCH_BLOCKED: 4,
    NO_DISPATCH_INPUT: 5,
    NO_LEDGER_INPUT: 6,
    AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN: 7
  };
  const aa = String(a || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionOutcomeProcessor() {
  const result = sciipRunAutonomousProcessorExecutionOutcomeProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionOutcomeProcessor',
    result: result
  }));

  return result;
}