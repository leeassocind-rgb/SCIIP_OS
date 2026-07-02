/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1160_AutonomousProcessorExecutionRunStateDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1160_AutonomousProcessorExecutionRunStateDigestProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_RUNTIME_LEDGER',

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
          originalProcessor: '1160_AutonomousProcessorExecutionRunStateDigestProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDigestProcessorLegacy1160_();
      return sciipWrapLegacyRuntimeResult1160_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1160_(legacyResult, context, transaction) {
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
 * 1160_AutonomousProcessorExecutionRunStateDigestProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR = '1160_AutonomousProcessorExecutionRunStateDigestProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_DATE_COLUMN = 'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_HEADERS = [
  'Digest_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_Type',
  'Operational_State',
  'Operational_Interpretation',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Latest_Processor',
  'Latest_Status',
  'Latest_Business_Key',
  'Latest_Completed_At',
  'Digest_Summary_JSON',
  'Source_Sheet',
  'Source_Date_Column',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDigestProcessorLegacy1160_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET);
  if (!inputSheet) {
    throw new Error('Missing input sheet: ' + SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET);
  }

  const outputSheet = sciipEnsureAutonomousProcessorExecutionRunStateDigestSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST|' + resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateLedgerRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateLedgerRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDigestsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const digest =
    sciipBuildAutonomousProcessorExecutionRunStateDigest_(
      sourceRows,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(digest);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    ledgerEntriesReviewed: sourceRows.length,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDigestSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_SHEET);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_HEADERS);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const missing = SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_OUTPUT_HEADERS.filter(function(h) {
    return headers.indexOf(h) === -1;
  });

  if (missing.length) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: digest row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDigest_(
  rows,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const aggregate =
    sciipAggregateAutonomousProcessorExecutionRunStateLedger_(rows);

  const latest =
    sciipResolveLatestAutonomousProcessorExecutionRunStateLedgerRow_(rows);

  const operationalState =
    sciipResolveAutonomousProcessorExecutionRunStateOperationalState_(aggregate);

  const interpretation =
    sciipResolveAutonomousProcessorExecutionRunStateInterpretation_(
      operationalState,
      aggregate
    );

  const governancePosture =
    sciipResolveAutonomousProcessorExecutionRunStateGovernancePosture_(
      operationalState,
      aggregate
    );

  const orchestrationPosture =
    sciipResolveAutonomousProcessorExecutionRunStateOrchestrationPosture_(
      operationalState,
      aggregate
    );

  const dashboardPosture =
    sciipResolveAutonomousProcessorExecutionRunStateDashboardPosture_(
      operationalState,
      aggregate
    );

  const decisioningPosture =
    sciipResolveAutonomousProcessorExecutionRunStateDecisioningPosture_(
      operationalState,
      aggregate
    );

  const digestId =
    'APRSD_' + Utilities.getUuid();

  const summaryJson = JSON.stringify({
    runStateDate: resolvedRunStateDate,
    operationalState: operationalState,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    dashboardPosture: dashboardPosture,
    decisioningPosture: decisioningPosture,
    aggregate: aggregate,
    latest: latest
  });

  return [
    digestId,
    businessKey,
    resolvedRunStateDate,
    'DAILY_AUTONOMOUS_RUN_STATE_DIGEST',
    operationalState,
    interpretation,
    governancePosture,
    orchestrationPosture,
    dashboardPosture,
    decisioningPosture,
    aggregate.ledgerEntriesReviewed,
    aggregate.uniqueProcessorsObserved,
    aggregate.healthyCount,
    aggregate.warningCount,
    aggregate.blockedCount,
    aggregate.failedCount,
    aggregate.skippedCount,
    aggregate.duplicateCount,
    latest.processor || '',
    latest.status || '',
    latest.businessKey || '',
    latest.completedAt || '',
    summaryJson,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_DATE_COLUMN,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Aggregation logic.
 */
function sciipAggregateAutonomousProcessorExecutionRunStateLedger_(rows) {
  const processors = {};
  let healthy = 0;
  let warning = 0;
  let blocked = 0;
  let failed = 0;
  let skipped = 0;
  let duplicate = 0;

  rows.forEach(function(row) {
    const processor = sciipGetRunStateLedgerValue_(row, [
      'Processor',
      'processor',
      'Processor_Name'
    ]);

    if (processor) processors[processor] = true;

    const status = String(sciipGetRunStateLedgerValue_(row, [
      'Status',
      'status',
      'Run_State',
      'Operational_State'
    ]) || '').toUpperCase();

    const skippedDuplicate = String(sciipGetRunStateLedgerValue_(row, [
      'Skipped_Duplicate',
      'skippedDuplicate'
    ]) || '');

    if (status.indexOf('FAIL') !== -1 || status.indexOf('ERROR') !== -1) {
      failed++;
    } else if (status.indexOf('BLOCK') !== -1) {
      blocked++;
    } else if (status.indexOf('WARN') !== -1) {
      warning++;
    } else if (status.indexOf('SKIPPED') !== -1) {
      skipped++;
    } else {
      healthy++;
    }

    if (skippedDuplicate === '1' || skippedDuplicate.toUpperCase() === 'TRUE') {
      duplicate++;
    }
  });

  return {
    ledgerEntriesReviewed: rows.length,
    uniqueProcessorsObserved: Object.keys(processors).length,
    healthyCount: healthy,
    warningCount: warning,
    blockedCount: blocked,
    failedCount: failed,
    skippedCount: skipped,
    duplicateCount: duplicate
  };
}

/**
 * Resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateOperationalState_(aggregate) {
  if (aggregate.failedCount > 0) return 'FAILED_ATTENTION_REQUIRED';
  if (aggregate.blockedCount > 0) return 'BLOCKED';
  if (aggregate.warningCount > 0) return 'OPERATIONAL_WITH_WARNINGS';
  if (aggregate.ledgerEntriesReviewed === aggregate.duplicateCount) return 'IDEMPOTENT_STABLE';
  return 'OPERATIONAL';
}

function sciipResolveAutonomousProcessorExecutionRunStateInterpretation_(state, aggregate) {
  if (state === 'FAILED_ATTENTION_REQUIRED') {
    return 'One or more autonomous run state ledger entries indicate failure; governance review should prioritize failed processors before further promotion.';
  }

  if (state === 'BLOCKED') {
    return 'Autonomous execution is blocked by one or more run state conditions and should not be advanced without review.';
  }

  if (state === 'OPERATIONAL_WITH_WARNINGS') {
    return 'Autonomous execution is functioning but contains warning signals that should be visible to dashboards and governance.';
  }

  if (state === 'IDEMPOTENT_STABLE') {
    return 'Run state ledger is stable and duplicate-protected; no new material state changes were detected for this processing date.';
  }

  return 'Autonomous run state is operational and suitable for downstream orchestration, dashboards, governance, and future decisioning.';
}

function sciipResolveAutonomousProcessorExecutionRunStateGovernancePosture_(state) {
  if (state === 'FAILED_ATTENTION_REQUIRED') return 'REVIEW_REQUIRED';
  if (state === 'BLOCKED') return 'ESCALATE';
  if (state === 'OPERATIONAL_WITH_WARNINGS') return 'MONITOR';
  return 'NORMAL';
}

function sciipResolveAutonomousProcessorExecutionRunStateOrchestrationPosture_(state) {
  if (state === 'FAILED_ATTENTION_REQUIRED') return 'PAUSE_PROMOTION';
  if (state === 'BLOCKED') return 'HOLD_DISPATCH';
  if (state === 'OPERATIONAL_WITH_WARNINGS') return 'ALLOW_WITH_MONITORING';
  return 'ALLOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateDashboardPosture_(state) {
  if (state === 'FAILED_ATTENTION_REQUIRED') return 'SHOW_CRITICAL';
  if (state === 'BLOCKED') return 'SHOW_BLOCKED';
  if (state === 'OPERATIONAL_WITH_WARNINGS') return 'SHOW_WARNING';
  return 'SHOW_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateDecisioningPosture_(state) {
  if (state === 'FAILED_ATTENTION_REQUIRED') return 'DO_NOT_AUTONOMOUSLY_ADVANCE';
  if (state === 'BLOCKED') return 'REQUIRE_HUMAN_REVIEW';
  if (state === 'OPERATIONAL_WITH_WARNINGS') return 'ADVANCE_WITH_CAUTION';
  return 'ADVANCE';
}

/**
 * Row helpers.
 */
function sciipReadAutonomousProcessorExecutionRunStateLedgerRows_(sheet) {
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

function sciipFilterAutonomousProcessorExecutionRunStateLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateLedgerValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Ledger_Date',
      'Date',
      'Created_At',
      'completedAt',
      'Completed_At'
    ]);

    return sciipNormalizeRunStateDigestDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateLedgerRow_(rows) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(sciipGetRunStateLedgerValue_(a, [
      'Completed_At',
      'completedAt',
      'Created_At',
      'createdAt'
    ]) || 0).getTime();

    const bDate = new Date(sciipGetRunStateLedgerValue_(b, [
      'Completed_At',
      'completedAt',
      'Created_At',
      'createdAt'
    ]) || 0).getTime();

    return bDate - aDate;
  });

  const latest = sorted[0];

  return {
    processor: sciipGetRunStateLedgerValue_(latest, [
      'Processor',
      'processor',
      'Processor_Name'
    ]),
    status: sciipGetRunStateLedgerValue_(latest, [
      'Status',
      'status',
      'Run_State',
      'Operational_State'
    ]),
    businessKey: sciipGetRunStateLedgerValue_(latest, [
      'Business_Key',
      'businessKey'
    ]),
    completedAt: sciipGetRunStateLedgerValue_(latest, [
      'Completed_At',
      'completedAt',
      'Created_At',
      'createdAt'
    ])
  };
}

function sciipGetRunStateLedgerValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }
  return '';
}

function sciipNormalizeRunStateDigestDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateDigestProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDigestProcessor',
    result: result
  }));

  return result;
}