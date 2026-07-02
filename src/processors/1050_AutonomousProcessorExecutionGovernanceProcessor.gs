/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1050_AutonomousProcessorExecutionGovernanceProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionGovernanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1050_AutonomousProcessorExecutionGovernanceProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCES_RUNTIME_LEDGER',

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
          originalProcessor: '1050_AutonomousProcessorExecutionGovernanceProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionGovernanceProcessorLegacy1050_();
      return sciipWrapLegacyRuntimeResult1050_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1050_(legacyResult, context, transaction) {
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
 * 1050_AutonomousProcessorExecutionGovernanceProcessor
 *******************************************************/

const SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE = {
  PROCESSOR: '1050_AutonomousProcessorExecutionGovernanceProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SUMMARY',
  INPUT_DATE_COLUMN: 'Summary_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE',

  OUTPUT_HEADERS: [
    'Execution_Governance_ID',
    'Business_Key',
    'Governance_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Summary_Records_Reviewed',
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
    'Summary_Status',
    'Operational_Posture',
    'Governance_Status',
    'Governance_Decision',
    'Governance_Reason',
    'Governance_Risk_Level',
    'Governance_Action',
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
function sciipRunAutonomousProcessorExecutionGovernanceProcessorLegacy1050_() {
  const cfg = SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionGovernanceSheet_();

  const resolvedGovernanceDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE|' + resolvedGovernanceDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionGovernanceCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionGovernanceNoInput1050_(
      outputSheet,
      businessKey,
      resolvedGovernanceDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1050_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1050_(row[cfg.INPUT_DATE_COLUMN]) === resolvedGovernanceDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionGovernanceNoInput1050_(
      outputSheet,
      businessKey,
      resolvedGovernanceDate,
      startedAt
    );
  }

  const governanceRecord =
    sciipBuildAutonomousProcessorExecutionGovernance1050_(
      sourceRows,
      businessKey,
      resolvedGovernanceDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1050_(governanceRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionGovernanceCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    governanceDate: resolvedGovernanceDate,
    governanceStatus: governanceRecord.Governance_Status,
    governanceDecision: governanceRecord.Governance_Decision,
    governanceRiskLevel: governanceRecord.Governance_Risk_Level,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionGovernance1050_(sourceRows, businessKey, governanceDate, startedAt) {
  const cfg = SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE;

  const aggregate = sciipAggregateExecutionSummaryRows1050_(sourceRows);
  const governance = sciipResolveExecutionGovernance1050_(aggregate);

  return {
    Execution_Governance_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Governance_Date: governanceDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Summary_Records_Reviewed: sourceRows.length,
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
    Outcome_Status: aggregate.Outcome_Status,
    Outcome_Type: aggregate.Outcome_Type,
    Summary_Status: aggregate.Summary_Status,
    Operational_Posture: aggregate.Operational_Posture,
    Governance_Status: governance.status,
    Governance_Decision: governance.decision,
    Governance_Reason: governance.reason,
    Governance_Risk_Level: governance.riskLevel,
    Governance_Action: governance.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1050_(aggregate, governance),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionGovernanceNoInput1050_(outputSheet, businessKey, governanceDate, startedAt) {
  const cfg = SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE;

  const record = {
    Execution_Governance_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Governance_Date: governanceDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Summary_Records_Reviewed: 0,
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
    Summary_Status: 'NO_SUMMARY_INPUT',
    Operational_Posture: 'NO_INPUTS',
    Governance_Status: 'NO_GOVERNANCE_INPUT',
    Governance_Decision: 'DO_NOT_CERTIFY',
    Governance_Reason: 'No execution summary records were available for the resolved governance date.',
    Governance_Risk_Level: 'UNKNOWN',
    Governance_Action: 'Generate execution summary records before governance certification.',
    Knowledge_Graph_Impact: 'Created permanent execution-governance history showing no available summary inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1050_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionGovernanceCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionGovernanceSheet_() {
  const cfg = SCIIP_1050_AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1050_(sheet) {
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

function sciipObjectToRow1050_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1050_(value) {
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

function sciipAggregateExecutionSummaryRows1050_(rows) {
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
    Ledger_Event_Type: 'AUTONOMOUS_EXECUTION_DISPATCH_UNKNOWN',
    Outcome_Status: 'OUTCOME_UNKNOWN',
    Outcome_Type: 'EXECUTION_UNCLASSIFIED',
    Summary_Status: 'SUMMARY_UNKNOWN',
    Operational_Posture: 'REVIEW_REQUIRED'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1050_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1050_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1050_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1050_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1050_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1050_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1050_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1050_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1050_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Readiness_Status = sciipHigherReadinessConstraint1050_(aggregate.Readiness_Status, row.Readiness_Status);
    aggregate.Readiness_Decision = sciipHigherReadinessDecisionConstraint1050_(aggregate.Readiness_Decision, row.Readiness_Decision);
    aggregate.Control_Status = sciipHigherControlStatusConstraint1050_(aggregate.Control_Status, row.Control_Status);
    aggregate.Control_Directive = sciipHigherControlDirectiveConstraint1050_(aggregate.Control_Directive, row.Control_Directive);
    aggregate.Execution_Gate = sciipHigherExecutionGateConstraint1050_(aggregate.Execution_Gate, row.Execution_Gate);
    aggregate.Dispatch_Status = sciipHigherDispatchStatusConstraint1050_(aggregate.Dispatch_Status, row.Dispatch_Status);
    aggregate.Dispatch_Decision = sciipHigherDispatchDecisionConstraint1050_(aggregate.Dispatch_Decision, row.Dispatch_Decision);
    aggregate.Dispatch_Mode = sciipHigherDispatchModeConstraint1050_(aggregate.Dispatch_Mode, row.Dispatch_Mode);
    aggregate.Ledger_Status = sciipHigherLedgerStatusConstraint1050_(aggregate.Ledger_Status, row.Ledger_Status);
    aggregate.Ledger_Event_Type = sciipHigherLedgerEventTypeConstraint1050_(aggregate.Ledger_Event_Type, row.Ledger_Event_Type);
    aggregate.Outcome_Status = sciipHigherOutcomeStatusConstraint1050_(aggregate.Outcome_Status, row.Outcome_Status);
    aggregate.Outcome_Type = sciipHigherOutcomeTypeConstraint1050_(aggregate.Outcome_Type, row.Outcome_Type);
    aggregate.Summary_Status = sciipHigherSummaryStatusConstraint1050_(aggregate.Summary_Status, row.Summary_Status);
    aggregate.Operational_Posture = sciipHigherOperationalPostureConstraint1050_(aggregate.Operational_Posture, row.Operational_Posture);
  });

  return aggregate;
}

function sciipResolveExecutionGovernance1050_(aggregate) {
  if (aggregate.Failed_Count > 0 || aggregate.Blocked_Count > 0 || aggregate.Summary_Status === 'SUMMARY_BLOCKED') {
    return {
      status: 'GOVERNANCE_BLOCKED',
      decision: 'DO_NOT_CERTIFY',
      reason: 'Execution governance identified blocked or failed autonomous processor conditions.',
      riskLevel: 'HIGH',
      action: 'Resolve upstream blockers before certifying autonomous execution chain.'
    };
  }

  if (
    aggregate.Summary_Status === 'SUMMARY_REVIEW_REQUIRED' ||
    aggregate.Operational_Posture === 'CONTROLLED_REVIEW' ||
    aggregate.Hold_Count > 0
  ) {
    return {
      status: 'GOVERNANCE_REVIEW_REQUIRED',
      decision: 'REQUIRE_REVIEW',
      reason: 'Execution governance identified a controlled-review state.',
      riskLevel: 'MEDIUM',
      action: 'Complete governance review before downstream command-center reporting.'
    };
  }

  if (
    aggregate.Summary_Status === 'SUMMARY_PENDING' ||
    aggregate.Operational_Posture === 'MONITORING'
  ) {
    return {
      status: 'GOVERNANCE_MONITORING',
      decision: 'CERTIFY_MONITORING_STATE',
      reason: 'Execution governance identified a valid pending monitoring state.',
      riskLevel: 'LOW',
      action: 'Continue monitoring until execution conditions resolve.'
    };
  }

  if (
    aggregate.Summary_Status === 'SUMMARY_CLEAR' &&
    aggregate.Operational_Posture === 'OPERATIONAL'
  ) {
    return {
      status: 'GOVERNANCE_CERTIFIED',
      decision: 'CERTIFY_EXECUTION_STATE',
      reason: 'Execution governance certified the autonomous processor execution chain as operational.',
      riskLevel: 'LOW',
      action: 'Advance to downstream command-center and governance reporting.'
    };
  }

  if (
    aggregate.Summary_Status === 'NO_SUMMARY_INPUT' ||
    aggregate.Operational_Posture === 'NO_INPUTS'
  ) {
    return {
      status: 'GOVERNANCE_NO_INPUTS',
      decision: 'DO_NOT_CERTIFY',
      reason: 'Execution governance could not certify because no summary inputs were available.',
      riskLevel: 'UNKNOWN',
      action: 'Generate execution summaries before governance certification.'
    };
  }

  return {
    status: 'GOVERNANCE_UNCLASSIFIED',
    decision: 'REQUIRE_REVIEW',
    reason: 'Execution governance could not classify the execution summary state.',
    riskLevel: 'MEDIUM',
    action: 'Review summary records and normalize governance inputs.'
  };
}

function sciipResolveKnowledgeGraphImpact1050_(aggregate, governance) {
  return [
    'Created permanent autonomous execution governance history.',
    'Governance status=' + governance.status + '.',
    'Governance decision=' + governance.decision + '.',
    'Governance risk=' + governance.riskLevel + '.',
    'Summary status=' + aggregate.Summary_Status + '.',
    'Operational posture=' + aggregate.Operational_Posture + '.',
    'Outcome status=' + aggregate.Outcome_Status + '.',
    'Dispatch decision=' + aggregate.Dispatch_Decision + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1050_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1050_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1050_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessConstraint1050_(a, b) {
  const rank = { READY: 1, CONDITIONALLY_READY: 2, NOT_READY: 3 };
  const aa = String(a || 'NOT_READY').trim().toUpperCase();
  const bb = String(b || 'NOT_READY').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherReadinessDecisionConstraint1050_(a, b) {
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

function sciipHigherControlStatusConstraint1050_(a, b) {
  const rank = { CLEARED: 1, MONITORING: 2, HELD: 3, STOPPED: 4 };
  const aa = String(a || 'STOPPED').trim().toUpperCase();
  const bb = String(b || 'STOPPED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherControlDirectiveConstraint1050_(a, b) {
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

function sciipHigherExecutionGateConstraint1050_(a, b) {
  const rank = { OPEN: 1, PENDING: 2, REVIEW: 3, CLOSED: 4 };
  const aa = String(a || 'CLOSED').trim().toUpperCase();
  const bb = String(b || 'CLOSED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherDispatchStatusConstraint1050_(a, b) {
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

function sciipHigherDispatchDecisionConstraint1050_(a, b) {
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

function sciipHigherDispatchModeConstraint1050_(a, b) {
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

function sciipHigherLedgerStatusConstraint1050_(a, b) {
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

function sciipHigherLedgerEventTypeConstraint1050_(a, b) {
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

function sciipHigherOutcomeStatusConstraint1050_(a, b) {
  const rank = {
    OUTCOME_SUCCESS: 1,
    OUTCOME_PENDING: 2,
    OUTCOME_REVIEW_REQUIRED: 3,
    OUTCOME_BLOCKED: 4,
    NO_OUTCOME: 5,
    OUTCOME_UNKNOWN: 6
  };
  const aa = String(a || 'OUTCOME_UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'OUTCOME_UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherOutcomeTypeConstraint1050_(a, b) {
  const rank = {
    EXECUTION_ADVANCED: 1,
    EXECUTION_WAITING: 2,
    EXECUTION_HELD: 3,
    EXECUTION_BLOCKED: 4,
    NO_LEDGER_INPUT: 5,
    EXECUTION_UNCLASSIFIED: 6
  };
  const aa = String(a || 'EXECUTION_UNCLASSIFIED').trim().toUpperCase();
  const bb = String(b || 'EXECUTION_UNCLASSIFIED').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSummaryStatusConstraint1050_(a, b) {
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

function sciipHigherOperationalPostureConstraint1050_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionGovernanceProcessor() {
  const result = sciipRunAutonomousProcessorExecutionGovernanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionGovernanceProcessor',
    result: result
  }));

  return result;
}