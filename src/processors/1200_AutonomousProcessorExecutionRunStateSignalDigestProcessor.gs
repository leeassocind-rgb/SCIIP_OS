/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_RUNTIME_LEDGER',

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
          originalProcessor: '1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalDigestProcessorLegacy1200_();
      return sciipWrapLegacyRuntimeResult1200_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1200_(legacyResult, context, transaction) {
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
 * 1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR =
  '1200_AutonomousProcessorExecutionRunStateSignalDigestProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_HEADERS = [
  'Digest_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_Type',
  'Signal_Posture',
  'Digest_Severity',
  'Digest_Status',
  'Digest_Message',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Latest_Signal_ID',
  'Latest_Signal_Category',
  'Latest_Signal_Severity',
  'Latest_Signal_Status',
  'Latest_Operational_State',
  'Latest_Source_Business_Key',
  'Digest_Summary_JSON',
  'Source_Sheet',
  'Source_Date_Column',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalDigestProcessorLegacy1200_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const signalLedgerRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalDigestInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalDigestRowsByDate_(
      signalLedgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalDigestsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digestRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignalDigest_(
      sourceRows,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(digestRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    signalsReviewed: sourceRows.length,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: digest row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignalDigest_(
  rows,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const aggregate =
    sciipAggregateAutonomousProcessorExecutionRunStateSignalLedger_(rows);

  const latestSignal =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestInputRow_(
      rows
    );

  const signalPosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestPosture_(
      aggregate
    );

  const digestSeverity =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestSeverity_(
      aggregate
    );

  const digestStatus =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestStatus_(
      digestSeverity,
      signalPosture
    );

  const governancePosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestGovernancePosture_(
      aggregate,
      latestSignal
    );

  const orchestrationPosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestOrchestrationPosture_(
      aggregate,
      latestSignal
    );

  const dashboardPosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestDashboardPosture_(
      digestSeverity
    );

  const decisioningPosture =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestDecisioningPosture_(
      aggregate,
      latestSignal
    );

  const recommendedAction =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestRecommendedAction_(
      digestSeverity,
      signalPosture
    );

  const autonomousAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestAutonomousAllowed_(
      aggregate
    );

  const humanReviewRequired =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestHumanReviewRequired_(
      aggregate
    );

  const digestMessage =
    sciipResolveAutonomousProcessorExecutionRunStateSignalDigestMessage_(
      signalPosture,
      digestSeverity,
      recommendedAction,
      aggregate
    );

  const digestId = 'APRSSD_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    digestType: 'AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST',
    signalPosture: signalPosture,
    digestSeverity: digestSeverity,
    digestStatus: digestStatus,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    dashboardPosture: dashboardPosture,
    decisioningPosture: decisioningPosture,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    aggregate: aggregate,
    latestSignal: {
      signalId: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_ID']),
      signalCategory: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Category']),
      signalSeverity: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Severity']),
      signalStatus: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Status']),
      operationalState: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Operational_State']),
      sourceBusinessKey: sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Source_Business_Key'])
    }
  };

  return [
    digestId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST',
    signalPosture,
    digestSeverity,
    digestStatus,
    digestMessage,
    governancePosture,
    orchestrationPosture,
    dashboardPosture,
    decisioningPosture,
    recommendedAction,
    autonomousAllowed,
    humanReviewRequired,
    aggregate.signalsReviewed,
    aggregate.criticalSignalCount,
    aggregate.highSignalCount,
    aggregate.mediumSignalCount,
    aggregate.lowSignalCount,
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_ID']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Category']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Severity']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Signal_Status']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Operational_State']),
    sciipGetRunStateSignalDigestInputValue_(latestSignal, ['Source_Business_Key']),
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_DATE_COLUMN,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Aggregation logic.
 */
function sciipAggregateAutonomousProcessorExecutionRunStateSignalLedger_(rows) {
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;
  let humanReview = 0;
  let autonomousBlocked = 0;

  rows.forEach(function(row) {
    const severity = String(
      sciipGetRunStateSignalDigestInputValue_(row, ['Signal_Severity'])
    ).toUpperCase();

    if (severity === 'CRITICAL') critical++;
    else if (severity === 'HIGH') high++;
    else if (severity === 'MEDIUM') medium++;
    else low++;

    const requiresReview = String(
      sciipGetRunStateSignalDigestInputValue_(row, ['Human_Review_Required'])
    ).toUpperCase();

    const autonomousAllowed = String(
      sciipGetRunStateSignalDigestInputValue_(row, ['Autonomous_Action_Allowed'])
    ).toUpperCase();

    if (requiresReview === 'TRUE') humanReview++;
    if (autonomousAllowed === 'FALSE') autonomousBlocked++;
  });

  return {
    signalsReviewed: rows.length,
    criticalSignalCount: critical,
    highSignalCount: high,
    mediumSignalCount: medium,
    lowSignalCount: low,
    humanReviewRequiredCount: humanReview,
    autonomousBlockedCount: autonomousBlocked
  };
}

/**
 * Resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestPosture_(
  aggregate
) {
  if (aggregate.criticalSignalCount > 0) return 'CRITICAL_SIGNAL_ACTIVE';
  if (aggregate.highSignalCount > 0) return 'HIGH_SIGNAL_ACTIVE';
  if (aggregate.mediumSignalCount > 0) return 'MONITORING_SIGNAL_ACTIVE';
  return 'HEALTHY_SIGNAL_ACTIVE';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestSeverity_(
  aggregate
) {
  if (aggregate.criticalSignalCount > 0) return 'CRITICAL';
  if (aggregate.highSignalCount > 0) return 'HIGH';
  if (aggregate.mediumSignalCount > 0) return 'MEDIUM';
  return 'LOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestStatus_(
  severity,
  posture
) {
  if (severity === 'CRITICAL') return 'ACTIVE_CRITICAL_DIGEST';
  if (severity === 'HIGH') return 'ACTIVE_HIGH_DIGEST';
  if (severity === 'MEDIUM') return 'ACTIVE_MONITOR_DIGEST';
  return 'ACTIVE_HEALTHY_DIGEST';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestGovernancePosture_(
  aggregate,
  latestSignal
) {
  if (aggregate.criticalSignalCount > 0) return 'REVIEW_REQUIRED';
  if (aggregate.highSignalCount > 0) return 'ESCALATE';
  if (aggregate.mediumSignalCount > 0) return 'MONITOR';

  return sciipGetRunStateSignalDigestInputValue_(latestSignal, [
    'Governance_Posture'
  ]) || 'NORMAL';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestOrchestrationPosture_(
  aggregate,
  latestSignal
) {
  if (aggregate.criticalSignalCount > 0) return 'PAUSE_PROMOTION';
  if (aggregate.highSignalCount > 0) return 'HOLD_DISPATCH';
  if (aggregate.mediumSignalCount > 0) return 'ALLOW_WITH_MONITORING';

  return sciipGetRunStateSignalDigestInputValue_(latestSignal, [
    'Orchestration_Posture'
  ]) || 'ALLOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestDashboardPosture_(
  severity
) {
  if (severity === 'CRITICAL') return 'SHOW_CRITICAL';
  if (severity === 'HIGH') return 'SHOW_BLOCKED';
  if (severity === 'MEDIUM') return 'SHOW_WARNING';
  return 'SHOW_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestDecisioningPosture_(
  aggregate,
  latestSignal
) {
  if (aggregate.criticalSignalCount > 0) return 'DO_NOT_AUTONOMOUSLY_ADVANCE';
  if (aggregate.highSignalCount > 0) return 'REQUIRE_HUMAN_REVIEW';
  if (aggregate.mediumSignalCount > 0) return 'ADVANCE_WITH_CAUTION';

  return sciipGetRunStateSignalDigestInputValue_(latestSignal, [
    'Decisioning_Posture'
  ]) || 'ADVANCE';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestRecommendedAction_(
  severity,
  posture
) {
  if (severity === 'CRITICAL') {
    return 'PAUSE_AUTONOMOUS_ADVANCEMENT_AND_REVIEW_CRITICAL_SIGNALS';
  }

  if (severity === 'HIGH') {
    return 'HOLD_DISPATCH_AND_REVIEW_HIGH_SEVERITY_SIGNALS';
  }

  if (severity === 'MEDIUM') {
    return 'ALLOW_DOWNSTREAM_PROCESSING_WITH_SIGNAL_MONITORING';
  }

  return 'ALLOW_DOWNSTREAM_PROCESSING';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestAutonomousAllowed_(
  aggregate
) {
  return aggregate.autonomousBlockedCount === 0;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestHumanReviewRequired_(
  aggregate
) {
  return aggregate.humanReviewRequiredCount > 0;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalDigestMessage_(
  signalPosture,
  digestSeverity,
  recommendedAction,
  aggregate
) {
  return (
    'Run state signal digest resolved as ' +
    digestSeverity +
    ' with posture ' +
    signalPosture +
    '. Signals reviewed: ' +
    aggregate.signalsReviewed +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalDigestInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipFilterAutonomousProcessorExecutionRunStateSignalDigestRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalDigestInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Signal_Date',
      'Ledger_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalDigestDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalDigestInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalDigestInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalDigestInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalDigestDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateSignalDigestProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalDigestProcessor',
    result: result
  }));

  return result;
}