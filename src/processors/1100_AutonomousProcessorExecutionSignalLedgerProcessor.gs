/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1100_AutonomousProcessorExecutionSignalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionSignalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1100_AutonomousProcessorExecutionSignalLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1100_AutonomousProcessorExecutionSignalLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionSignalLedgerProcessorLegacy1100_();
      return sciipWrapLegacyRuntimeResult1100_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1100_(legacyResult, context, transaction) {
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
 * 1100_AutonomousProcessorExecutionSignalLedgerProcessor
 *******************************************************/

const SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER = {
  PROCESSOR: '1100_AutonomousProcessorExecutionSignalLedgerProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL',
  INPUT_DATE_COLUMN: 'Signal_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER',

  OUTPUT_HEADERS: [
    'Execution_Signal_Ledger_ID',
    'Business_Key',
    'Signal_Ledger_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'System_Signal_Records_Reviewed',
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
    'Signal_Ledger_Conclusion',
    'Signal_Ledger_Reason',
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
function sciipRunAutonomousProcessorExecutionSignalLedgerProcessorLegacy1100_() {
  const cfg = SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionSignalLedgerSheet_();

  const resolvedSignalLedgerDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER|' + resolvedSignalLedgerDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionSignalLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionSignalLedgerNoInput1100_(
      outputSheet,
      businessKey,
      resolvedSignalLedgerDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1100_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1100_(row[cfg.INPUT_DATE_COLUMN]) === resolvedSignalLedgerDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionSignalLedgerNoInput1100_(
      outputSheet,
      businessKey,
      resolvedSignalLedgerDate,
      startedAt
    );
  }

  const ledgerRecord =
    sciipBuildAutonomousProcessorExecutionSignalLedger1100_(
      sourceRows,
      businessKey,
      resolvedSignalLedgerDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1100_(ledgerRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionSignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    signalLedgerDate: resolvedSignalLedgerDate,
    signalLedgerStatus: ledgerRecord.Signal_Ledger_Status,
    signalLedgerEventType: ledgerRecord.Signal_Ledger_Event_Type,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionSignalLedger1100_(sourceRows, businessKey, signalLedgerDate, startedAt) {
  const cfg = SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER;

  const aggregate = sciipAggregateExecutionSystemSignalRows1100_(sourceRows);
  const ledger = sciipResolveExecutionSignalLedger1100_(aggregate);

  return {
    Execution_Signal_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Ledger_Date: signalLedgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    System_Signal_Records_Reviewed: sourceRows.length,
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
    Signal_Ledger_Status: ledger.status,
    Signal_Ledger_Event_Type: ledger.eventType,
    Signal_Ledger_Conclusion: ledger.conclusion,
    Signal_Ledger_Reason: ledger.reason,
    Recommended_Action: ledger.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1100_(aggregate, ledger),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionSignalLedgerNoInput1100_(outputSheet, businessKey, signalLedgerDate, startedAt) {
  const cfg = SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER;

  const record = {
    Execution_Signal_Ledger_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Ledger_Date: signalLedgerDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    System_Signal_Records_Reviewed: 0,
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
    Signal_Ledger_Conclusion: 'No autonomous execution system signal was available to ledger.',
    Signal_Ledger_Reason: 'No execution system-signal records were available for the resolved signal-ledger date.',
    Recommended_Action: 'Generate system-signal records before relying on signal-ledger reporting.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-signal-ledger history showing no available system-signal inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1100_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionSignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionSignalLedgerSheet_() {
  const cfg = SCIIP_1100_AUTONOMOUS_PROCESSOR_EXECUTION_SIGNAL_LEDGER;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1100_(sheet) {
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

function sciipObjectToRow1100_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1100_(value) {
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

function sciipAggregateExecutionSystemSignalRows1100_(rows) {
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
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1100_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1100_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1100_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1100_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1100_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1100_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1100_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1100_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1100_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1100_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherSeverity1100_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Health_Status = sciipHigherHealthStatusConstraint1100_(aggregate.Health_Status, row.Health_Status);
    aggregate.Health_Rating = sciipHigherHealthRatingConstraint1100_(aggregate.Health_Rating, row.Health_Rating);
    aggregate.Health_Score = Math.max(aggregate.Health_Score, sciipNumber1100_(row.Health_Score));
    aggregate.Digest_Status = sciipHigherDigestStatusConstraint1100_(aggregate.Digest_Status, row.Digest_Status);
    aggregate.Digest_Severity = sciipHigherSeverity1100_(aggregate.Digest_Severity, row.Digest_Severity);
    aggregate.System_Signal = sciipHigherSystemSignalConstraint1100_(aggregate.System_Signal, row.System_Signal);
    aggregate.Signal_Strength = sciipHigherSignalStrengthConstraint1100_(aggregate.Signal_Strength, row.Signal_Strength);
    aggregate.Signal_Routing = sciipHigherSignalRoutingConstraint1100_(aggregate.Signal_Routing, row.Signal_Routing);
    aggregate.Dashboard_Flag = sciipYesNo1100_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1100_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionSignalLedger1100_(aggregate) {
  if (aggregate.System_Signal === 'STOP') {
    return {
      status: 'RECORDED_STOP_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_STOP_SIGNAL',
      conclusion: 'Autonomous execution system signal requires stop/escalation.',
      reason: 'System signal records show STOP or strong action-required routing.',
      action: 'Escalate and resolve blockers before downstream automation proceeds.'
    };
  }

  if (aggregate.System_Signal === 'REVIEW') {
    return {
      status: 'RECORDED_REVIEW_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_REVIEW_SIGNAL',
      conclusion: 'Autonomous execution system signal requires governance review.',
      reason: 'System signal records show REVIEW or moderate routing conditions.',
      action: 'Complete governance review before treating execution state as clear.'
    };
  }

  if (aggregate.System_Signal === 'MONITOR') {
    return {
      status: 'RECORDED_MONITOR_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_MONITOR_SIGNAL',
      conclusion: 'Autonomous execution system signal is monitor.',
      reason: 'System signal records show stable monitoring state.',
      action: 'Continue monitoring autonomous execution chain.'
    };
  }

  if (aggregate.System_Signal === 'GO') {
    return {
      status: 'RECORDED_GO_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_GO_SIGNAL',
      conclusion: 'Autonomous execution system signal is go.',
      reason: 'System signal records show healthy execution state.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.System_Signal === 'NO_SIGNAL') {
    return {
      status: 'RECORDED_NO_SIGNAL',
      eventType: 'AUTONOMOUS_EXECUTION_NO_SIGNAL',
      conclusion: 'No autonomous execution system signal was generated.',
      reason: 'System signal records indicate no usable signal input.',
      action: 'Generate upstream execution signal records before relying on routing.'
    };
  }

  return {
    status: 'RECORDED_UNKNOWN_SIGNAL',
    eventType: 'AUTONOMOUS_EXECUTION_UNKNOWN_SIGNAL',
    conclusion: 'Autonomous execution system signal could not be classified.',
    reason: 'System signal did not match a known signal-ledger class.',
    action: 'Review system-signal records and normalize signal values.'
  };
}

function sciipResolveKnowledgeGraphImpact1100_(aggregate, ledger) {
  return [
    'Created immutable autonomous execution signal-ledger entry.',
    'Signal-ledger status=' + ledger.status + '.',
    'Signal-ledger event=' + ledger.eventType + '.',
    'System signal=' + aggregate.System_Signal + '.',
    'Signal strength=' + aggregate.Signal_Strength + '.',
    'Signal routing=' + aggregate.Signal_Routing + '.',
    'Health status=' + aggregate.Health_Status + '.',
    'Digest status=' + aggregate.Digest_Status + '.'
  ].join(' ');
}

function sciipNumber1100_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1100_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1100_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1100_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1100_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1100_(a, b) {
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

function sciipHigherHealthStatusConstraint1100_(a, b) {
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

function sciipHigherHealthRatingConstraint1100_(a, b) {
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

function sciipHigherDigestStatusConstraint1100_(a, b) {
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

function sciipHigherSystemSignalConstraint1100_(a, b) {
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

function sciipHigherSignalStrengthConstraint1100_(a, b) {
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

function sciipHigherSignalRoutingConstraint1100_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionSignalLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionSignalLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionSignalLedgerProcessor',
    result: result
  }));

  return result;
}