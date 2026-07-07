/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1060_AutonomousProcessorExecutionCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1060_AutonomousProcessorExecutionCommandCenterProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTERS_RUNTIME_LEDGER',

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
          originalProcessor: '1060_AutonomousProcessorExecutionCommandCenterProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionCommandCenterProcessorLegacy1060_();
      return sciipWrapLegacyRuntimeResult1060_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1060_(legacyResult, context, transaction) {
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
 * 1060_AutonomousProcessorExecutionCommandCenterProcessor
 *******************************************************/

const SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER = {
  PROCESSOR: '1060_AutonomousProcessorExecutionCommandCenterProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_GOVERNANCE',
  INPUT_DATE_COLUMN: 'Governance_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER',

  OUTPUT_HEADERS: [
    'Command_Center_ID',
    'Business_Key',
    'Command_Center_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Governance_Records_Reviewed',
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
    'Command_Center_Message',
    'Command_Center_Severity',
    'Command_Center_Action',
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
function sciipRunAutonomousProcessorExecutionCommandCenterProcessorLegacy1060_() {
  const cfg = SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionCommandCenterSheet_();

  const resolvedCommandCenterDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER|' + resolvedCommandCenterDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionCommandCentersCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionCommandCenterNoInput1060_(
      outputSheet,
      businessKey,
      resolvedCommandCenterDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1060_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1060_(row[cfg.INPUT_DATE_COLUMN]) === resolvedCommandCenterDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionCommandCenterNoInput1060_(
      outputSheet,
      businessKey,
      resolvedCommandCenterDate,
      startedAt
    );
  }

  const commandRecord =
    sciipBuildAutonomousProcessorExecutionCommandCenter1060_(
      sourceRows,
      businessKey,
      resolvedCommandCenterDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1060_(commandRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionCommandCentersCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    commandCenterDate: resolvedCommandCenterDate,
    commandCenterStatus: commandRecord.Command_Center_Status,
    commandCenterSeverity: commandRecord.Command_Center_Severity,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionCommandCenter1060_(sourceRows, businessKey, commandCenterDate, startedAt) {
  const cfg = SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER;

  const aggregate = sciipAggregateExecutionGovernanceRows1060_(sourceRows);
  const command = sciipResolveExecutionCommandCenter1060_(aggregate);

  return {
    Command_Center_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Command_Center_Date: commandCenterDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Governance_Records_Reviewed: sourceRows.length,
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
    Command_Center_Status: command.status,
    Command_Center_Message: command.message,
    Command_Center_Severity: command.severity,
    Command_Center_Action: command.action,
    Dashboard_Flag: command.dashboardFlag,
    Leadership_Flag: command.leadershipFlag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1060_(aggregate, command),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionCommandCenterNoInput1060_(outputSheet, businessKey, commandCenterDate, startedAt) {
  const cfg = SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER;

  const record = {
    Command_Center_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Command_Center_Date: commandCenterDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Governance_Records_Reviewed: 0,
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
    Command_Center_Message: 'No autonomous execution governance records are available for command-center reporting.',
    Command_Center_Severity: 'UNKNOWN',
    Command_Center_Action: 'Generate governance records before relying on command-center execution reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent command-center history showing no available governance inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1060_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionCommandCentersCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionCommandCenterSheet_() {
  const cfg = SCIIP_1060_AUTONOMOUS_PROCESSOR_EXECUTION_COMMAND_CENTER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1060_(sheet) {
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

function sciipObjectToRow1060_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1060_(value) {
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

function sciipAggregateExecutionGovernanceRows1060_(rows) {
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
    Governance_Risk_Level: 'MEDIUM'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1060_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1060_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1060_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1060_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1060_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1060_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1060_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1060_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1060_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Summary_Status = sciipHigherSummaryStatusConstraint1060_(aggregate.Summary_Status, row.Summary_Status);
    aggregate.Operational_Posture = sciipHigherOperationalPostureConstraint1060_(aggregate.Operational_Posture, row.Operational_Posture);
    aggregate.Governance_Status = sciipHigherGovernanceStatusConstraint1060_(aggregate.Governance_Status, row.Governance_Status);
    aggregate.Governance_Decision = sciipHigherGovernanceDecisionConstraint1060_(aggregate.Governance_Decision, row.Governance_Decision);
    aggregate.Governance_Risk_Level = sciipHigherGovernanceRiskConstraint1060_(aggregate.Governance_Risk_Level, row.Governance_Risk_Level);
  });

  return aggregate;
}

function sciipResolveExecutionCommandCenter1060_(aggregate) {
  if (
    aggregate.Governance_Status === 'GOVERNANCE_BLOCKED' ||
    aggregate.Governance_Decision === 'DO_NOT_CERTIFY' ||
    aggregate.Governance_Risk_Level === 'HIGH'
  ) {
    return {
      status: 'ACTION_REQUIRED',
      message: 'Autonomous execution chain is blocked or uncertified.',
      severity: 'HIGH',
      action: 'Review governance blockers and rerun the autonomous execution processor chain after remediation.',
      dashboardFlag: 'YES',
      leadershipFlag: 'YES'
    };
  }

  if (
    aggregate.Governance_Status === 'GOVERNANCE_REVIEW_REQUIRED' ||
    aggregate.Governance_Decision === 'REQUIRE_REVIEW'
  ) {
    return {
      status: 'REVIEW_REQUIRED',
      message: 'Autonomous execution chain requires governance review before certification.',
      severity: 'MEDIUM',
      action: 'Complete governance review before downstream command-center clearance.',
      dashboardFlag: 'YES',
      leadershipFlag: 'YES'
    };
  }

  if (
    aggregate.Governance_Status === 'GOVERNANCE_MONITORING' ||
    aggregate.Governance_Decision === 'CERTIFY_MONITORING_STATE'
  ) {
    return {
      status: 'MONITORING',
      message: 'Autonomous execution chain is in a valid monitoring state.',
      severity: 'LOW',
      action: 'Continue monitoring until execution state clears, blocks, or requires review.',
      dashboardFlag: 'YES',
      leadershipFlag: 'NO'
    };
  }

  if (
    aggregate.Governance_Status === 'GOVERNANCE_CERTIFIED' &&
    aggregate.Governance_Decision === 'CERTIFY_EXECUTION_STATE'
  ) {
    return {
      status: 'CLEARED',
      message: 'Autonomous execution chain is certified and operational.',
      severity: 'LOW',
      action: 'Advance certified state to dashboard and downstream reporting.',
      dashboardFlag: 'YES',
      leadershipFlag: 'NO'
    };
  }

  if (aggregate.Governance_Status === 'GOVERNANCE_NO_INPUTS') {
    return {
      status: 'NO_INPUTS',
      message: 'No governance inputs are available for autonomous execution command-center reporting.',
      severity: 'UNKNOWN',
      action: 'Generate governance records before reporting system execution posture.',
      dashboardFlag: 'YES',
      leadershipFlag: 'NO'
    };
  }

  return {
    status: 'UNCLASSIFIED',
    message: 'Autonomous execution command-center state could not be classified.',
    severity: 'MEDIUM',
    action: 'Review governance records and normalize command-center inputs.',
    dashboardFlag: 'YES',
    leadershipFlag: 'YES'
  };
}

function sciipResolveKnowledgeGraphImpact1060_(aggregate, command) {
  return [
    'Created permanent autonomous execution command-center history.',
    'Command status=' + command.status + '.',
    'Severity=' + command.severity + '.',
    'Governance status=' + aggregate.Governance_Status + '.',
    'Governance decision=' + aggregate.Governance_Decision + '.',
    'Governance risk=' + aggregate.Governance_Risk_Level + '.',
    'Operational posture=' + aggregate.Operational_Posture + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.'
  ].join(' ');
}

function sciipNumber1060_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority1060_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1060_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSummaryStatusConstraint1060_(a, b) {
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

function sciipHigherOperationalPostureConstraint1060_(a, b) {
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

function sciipHigherGovernanceStatusConstraint1060_(a, b) {
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

function sciipHigherGovernanceDecisionConstraint1060_(a, b) {
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

function sciipHigherGovernanceRiskConstraint1060_(a, b) {
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
function sciipTestAutonomousProcessorExecutionCommandCenterProcessor() {
  const result = sciipRunAutonomousProcessorExecutionCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionCommandCenterProcessor',
    result: result
  }));

  return result;
}