/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1090_AutonomousProcessorExecutionSystemSignalProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionSystemSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1090_AutonomousProcessorExecutionSystemSignalProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNALS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNALS_RUNTIME_LEDGER',

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
          originalProcessor: '1090_AutonomousProcessorExecutionSystemSignalProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionSystemSignalProcessorLegacy1090_();
      return sciipWrapLegacyRuntimeResult1090_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1090_(legacyResult, context, transaction) {
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
 * 1090_AutonomousProcessorExecutionSystemSignalProcessor
 *******************************************************/

const SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL = {
  PROCESSOR: '1090_AutonomousProcessorExecutionSystemSignalProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_HEALTH_DIGEST',
  INPUT_DATE_COLUMN: 'Digest_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL',

  OUTPUT_HEADERS: [
    'Execution_System_Signal_ID',
    'Business_Key',
    'Signal_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Digest_Records_Reviewed',
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
    'Signal_Message',
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
function sciipRunAutonomousProcessorExecutionSystemSignalProcessorLegacy1090_() {
  const cfg = SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionSystemSignalSheet_();

  const resolvedSignalDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL|' + resolvedSignalDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionSystemSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionSystemSignalNoInput1090_(
      outputSheet,
      businessKey,
      resolvedSignalDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects1090_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey1090_(row[cfg.INPUT_DATE_COLUMN]) === resolvedSignalDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionSystemSignalNoInput1090_(
      outputSheet,
      businessKey,
      resolvedSignalDate,
      startedAt
    );
  }

  const signalRecord =
    sciipBuildAutonomousProcessorExecutionSystemSignal1090_(
      sourceRows,
      businessKey,
      resolvedSignalDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow1090_(signalRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionSystemSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    signalDate: resolvedSignalDate,
    systemSignal: signalRecord.System_Signal,
    signalStrength: signalRecord.Signal_Strength,
    signalRouting: signalRecord.Signal_Routing,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionSystemSignal1090_(sourceRows, businessKey, signalDate, startedAt) {
  const cfg = SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL;

  const aggregate = sciipAggregateExecutionHealthDigestRows1090_(sourceRows);
  const signal = sciipResolveExecutionSystemSignal1090_(aggregate);

  return {
    Execution_System_Signal_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Date: signalDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Digest_Records_Reviewed: sourceRows.length,
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
    System_Signal: signal.signal,
    Signal_Strength: signal.strength,
    Signal_Routing: signal.routing,
    Signal_Message: signal.message,
    Recommended_Action: signal.action,
    Dashboard_Flag: aggregate.Dashboard_Flag,
    Leadership_Flag: aggregate.Leadership_Flag,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact1090_(aggregate, signal),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionSystemSignalNoInput1090_(outputSheet, businessKey, signalDate, startedAt) {
  const cfg = SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL;

  const record = {
    Execution_System_Signal_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Signal_Date: signalDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Digest_Records_Reviewed: 0,
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
    Signal_Message: 'No execution health digest records were available for system-signal generation.',
    Recommended_Action: 'Generate execution health digest records before relying on system-signal routing.',
    Dashboard_Flag: 'YES',
    Leadership_Flag: 'NO',
    Knowledge_Graph_Impact: 'Created permanent execution-system-signal history showing no available digest inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow1090_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionSystemSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionSystemSignalSheet_() {
  const cfg = SCIIP_1090_AUTONOMOUS_PROCESSOR_EXECUTION_SYSTEM_SIGNAL;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects1090_(sheet) {
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

function sciipObjectToRow1090_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey1090_(value) {
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

function sciipAggregateExecutionHealthDigestRows1090_(rows) {
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
    Dashboard_Flag: 'NO',
    Leadership_Flag: 'NO'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber1090_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber1090_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber1090_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber1090_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber1090_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber1090_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber1090_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority1090_(aggregate.Highest_Priority, row.Highest_Priority);
    aggregate.Execution_Risk_Level = sciipHigherRisk1090_(aggregate.Execution_Risk_Level, row.Execution_Risk_Level);
    aggregate.Command_Center_Status = sciipHigherCommandCenterStatusConstraint1090_(aggregate.Command_Center_Status, row.Command_Center_Status);
    aggregate.Command_Center_Severity = sciipHigherSeverity1090_(aggregate.Command_Center_Severity, row.Command_Center_Severity);
    aggregate.Health_Status = sciipHigherHealthStatusConstraint1090_(aggregate.Health_Status, row.Health_Status);
    aggregate.Health_Rating = sciipHigherHealthRatingConstraint1090_(aggregate.Health_Rating, row.Health_Rating);
    aggregate.Health_Score = Math.max(aggregate.Health_Score, sciipNumber1090_(row.Health_Score));
    aggregate.Digest_Status = sciipHigherDigestStatusConstraint1090_(aggregate.Digest_Status, row.Digest_Status);
    aggregate.Digest_Severity = sciipHigherSeverity1090_(aggregate.Digest_Severity, row.Digest_Severity);
    aggregate.Dashboard_Flag = sciipYesNo1090_(aggregate.Dashboard_Flag, row.Dashboard_Flag);
    aggregate.Leadership_Flag = sciipYesNo1090_(aggregate.Leadership_Flag, row.Leadership_Flag);
  });

  return aggregate;
}

function sciipResolveExecutionSystemSignal1090_(aggregate) {
  if (aggregate.Digest_Status === 'DIGEST_ACTION_REQUIRED' || aggregate.Digest_Severity === 'HIGH') {
    return {
      signal: 'STOP',
      strength: 'STRONG',
      routing: 'LEADERSHIP_AND_DASHBOARD',
      message: 'Execution system signal is STOP because autonomous execution health digest requires action.',
      action: 'Escalate execution health state and resolve blockers before downstream automation.'
    };
  }

  if (aggregate.Digest_Status === 'DIGEST_REVIEW_REQUIRED' || aggregate.Digest_Severity === 'MEDIUM') {
    return {
      signal: 'REVIEW',
      strength: 'MODERATE',
      routing: 'GOVERNANCE_AND_DASHBOARD',
      message: 'Execution system signal is REVIEW because autonomous execution health is degraded or unclassified.',
      action: 'Complete governance review before treating autonomous execution state as cleared.'
    };
  }

  if (aggregate.Digest_Status === 'DIGEST_MONITORING') {
    return {
      signal: 'MONITOR',
      strength: 'NORMAL',
      routing: 'DASHBOARD',
      message: 'Execution system signal is MONITOR because autonomous execution health is stable but not fully cleared.',
      action: 'Continue monitoring the autonomous execution chain.'
    };
  }

  if (aggregate.Digest_Status === 'DIGEST_HEALTHY') {
    return {
      signal: 'GO',
      strength: 'NORMAL',
      routing: 'DASHBOARD',
      message: 'Execution system signal is GO because autonomous execution health is green.',
      action: 'Continue downstream autonomous execution reporting.'
    };
  }

  if (aggregate.Digest_Status === 'DIGEST_NO_INPUTS') {
    return {
      signal: 'NO_SIGNAL',
      strength: 'NONE',
      routing: 'DASHBOARD',
      message: 'Execution system signal could not be generated because health digest inputs were unavailable.',
      action: 'Generate execution health digest records before routing execution signals.'
    };
  }

  return {
    signal: 'UNKNOWN',
    strength: 'WEAK',
    routing: 'GOVERNANCE_AND_DASHBOARD',
    message: 'Execution system signal could not classify the health digest state.',
    action: 'Review health digest records and normalize digest status values.'
  };
}

function sciipResolveKnowledgeGraphImpact1090_(aggregate, signal) {
  return [
    'Created permanent autonomous execution system signal history.',
    'System signal=' + signal.signal + '.',
    'Signal strength=' + signal.strength + '.',
    'Routing=' + signal.routing + '.',
    'Digest status=' + aggregate.Digest_Status + '.',
    'Health status=' + aggregate.Health_Status + '.',
    'Health score=' + aggregate.Health_Score + '.',
    'Command-center status=' + aggregate.Command_Center_Status + '.'
  ].join(' ');
}

function sciipNumber1090_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipYesNo1090_(a, b) {
  const aa = String(a || '').trim().toUpperCase();
  const bb = String(b || '').trim().toUpperCase();
  return aa === 'YES' || bb === 'YES' ? 'YES' : 'NO';
}

function sciipHigherPriority1090_(a, b) {
  const rank = { NONE: 0, LOW: 1, NORMAL: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk1090_(a, b) {
  const rank = { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherSeverity1090_(a, b) {
  const rank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 };
  const aa = String(a || 'UNKNOWN').trim().toUpperCase();
  const bb = String(b || 'UNKNOWN').trim().toUpperCase();
  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherCommandCenterStatusConstraint1090_(a, b) {
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

function sciipHigherHealthStatusConstraint1090_(a, b) {
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

function sciipHigherHealthRatingConstraint1090_(a, b) {
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

function sciipHigherDigestStatusConstraint1090_(a, b) {
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

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionSystemSignalProcessor() {
  const result = sciipRunAutonomousProcessorExecutionSystemSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionSystemSignalProcessor',
    result: result
  }));

  return result;
}