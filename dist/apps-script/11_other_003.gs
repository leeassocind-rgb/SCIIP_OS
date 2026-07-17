/** SCIIP_OS compiled bundle: 11_other_003.gs
 * sources: 65
 * generated: 2026-07-17T18:05:07.276Z
 */
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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessorLegacy1170_();
      return sciipWrapLegacyRuntimeResult1170_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1170_(legacyResult, context, transaction) {
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
 * 1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR =
  '1170_AutonomousProcessorExecutionRunStateDigestLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_ID',
  'Digest_Type',
  'Operational_State',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Operational_Interpretation',
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
  'Ledger_Summary_JSON',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessorLegacy1170_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDigestLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digestRows =
    sciipReadAutonomousProcessorExecutionRunStateDigestRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDigestRowsByDate_(
      digestRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestDigest =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDigestRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateDigestLedgerEntry_(
      latestDigest,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDigestLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: ledger entry row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDigestLedgerEntry_(
  digest,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSDL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    digestId: sciipGetRunStateDigestValue_(digest, ['Digest_ID']),
    operationalState: sciipGetRunStateDigestValue_(digest, ['Operational_State']),
    governancePosture: sciipGetRunStateDigestValue_(digest, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateDigestValue_(digest, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateDigestValue_(digest, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateDigestValue_(digest, ['Decisioning_Posture']),
    sourceBusinessKey: sciipGetRunStateDigestValue_(digest, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateDigestValue_(digest, ['Digest_ID']),
    sciipGetRunStateDigestValue_(digest, ['Digest_Type']),
    sciipGetRunStateDigestValue_(digest, ['Operational_State']),
    sciipGetRunStateDigestValue_(digest, ['Governance_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Orchestration_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Dashboard_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Decisioning_Posture']),
    sciipGetRunStateDigestValue_(digest, ['Operational_Interpretation']),
    sciipGetRunStateDigestValue_(digest, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateDigestValue_(digest, ['Unique_Processors_Observed']),
    sciipGetRunStateDigestValue_(digest, ['Healthy_Count']),
    sciipGetRunStateDigestValue_(digest, ['Warning_Count']),
    sciipGetRunStateDigestValue_(digest, ['Blocked_Count']),
    sciipGetRunStateDigestValue_(digest, ['Failed_Count']),
    sciipGetRunStateDigestValue_(digest, ['Skipped_Count']),
    sciipGetRunStateDigestValue_(digest, ['Duplicate_Count']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Processor']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Status']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Business_Key']),
    sciipGetRunStateDigestValue_(digest, ['Latest_Completed_At']),
    JSON.stringify(summary),
    sciipGetRunStateDigestValue_(digest, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN,
    SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDigestRows_(sheet) {
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateDigestRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDigestValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DIGEST_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDigestLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDigestRow_(rows) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDigestValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDigestValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDigestValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDigestLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateDigestLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDigestLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDigestLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1180_AutonomousProcessorExecutionRunStateSignalProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1180_AutonomousProcessorExecutionRunStateSignalProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_RUNTIME_LEDGER',

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
          originalProcessor: '1180_AutonomousProcessorExecutionRunStateSignalProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalProcessorLegacy1180_();
      return sciipWrapLegacyRuntimeResult1180_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1180_(legacyResult, context, transaction) {
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
 * 1180_AutonomousProcessorExecutionRunStateSignalProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR =
  '1180_AutonomousProcessorExecutionRunStateSignalProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS = [
  'Signal_ID',
  'Business_Key',
  'Run_State_Date',
  'Signal_Type',
  'Signal_Category',
  'Signal_Severity',
  'Signal_Status',
  'Signal_Message',
  'Operational_State',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Signal_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalProcessorLegacy1180_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalInputRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerEntry =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalInputRow_(
      sourceRows
    );

  const signalRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignal_(
      latestLedgerEntry,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(signalRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: signal row.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignal_(
  ledgerEntry,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const operationalState =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Operational_State']);

  const governancePosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Governance_Posture']);

  const orchestrationPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Orchestration_Posture']);

  const dashboardPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Dashboard_Posture']);

  const decisioningPosture =
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Decisioning_Posture']);

  const severity =
    sciipResolveAutonomousProcessorExecutionRunStateSignalSeverity_(
      operationalState,
      governancePosture,
      orchestrationPosture,
      decisioningPosture
    );

  const category =
    sciipResolveAutonomousProcessorExecutionRunStateSignalCategory_(
      operationalState,
      severity
    );

  const status =
    sciipResolveAutonomousProcessorExecutionRunStateSignalStatus_(severity);

  const recommendedAction =
    sciipResolveAutonomousProcessorExecutionRunStateSignalRecommendedAction_(
      operationalState,
      governancePosture,
      orchestrationPosture,
      decisioningPosture
    );

  const autonomousActionAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateSignalAutonomousAllowed_(
      decisioningPosture
    );

  const humanReviewRequired =
    sciipResolveAutonomousProcessorExecutionRunStateSignalHumanReviewRequired_(
      governancePosture,
      decisioningPosture
    );

  const message =
    sciipResolveAutonomousProcessorExecutionRunStateSignalMessage_(
      operationalState,
      severity,
      recommendedAction
    );

  const signalId = 'APRSS_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    signalType: 'AUTONOMOUS_RUN_STATE_SIGNAL',
    signalCategory: category,
    signalSeverity: severity,
    signalStatus: status,
    operationalState: operationalState,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    dashboardPosture: dashboardPosture,
    decisioningPosture: decisioningPosture,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousActionAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceLedgerEntryId: sciipGetRunStateSignalInputValue_(ledgerEntry, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateSignalInputValue_(ledgerEntry, [
      'Business_Key'
    ])
  };

  return [
    signalId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_SIGNAL',
    category,
    severity,
    status,
    message,
    operationalState,
    governancePosture,
    orchestrationPosture,
    dashboardPosture,
    decisioningPosture,
    recommendedAction,
    autonomousActionAllowed,
    humanReviewRequired,
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Unique_Processors_Observed']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Healthy_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Warning_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Blocked_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Failed_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Skipped_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Duplicate_Count']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Ledger_Entry_ID']),
    sciipGetRunStateSignalInputValue_(ledgerEntry, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Signal resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateSignalSeverity_(
  operationalState,
  governancePosture,
  orchestrationPosture,
  decisioningPosture
) {
  const state = String(operationalState || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const orchestration = String(orchestrationPosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    state.indexOf('FAILED') !== -1 ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'CRITICAL';
  }

  if (
    state === 'BLOCKED' ||
    governance === 'ESCALATE' ||
    orchestration === 'HOLD_DISPATCH' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'HIGH';
  }

  if (
    state.indexOf('WARNING') !== -1 ||
    governance === 'MONITOR' ||
    orchestration === 'ALLOW_WITH_MONITORING' ||
    decisioning === 'ADVANCE_WITH_CAUTION'
  ) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalCategory_(
  operationalState,
  severity
) {
  const state = String(operationalState || '').toUpperCase();

  if (severity === 'CRITICAL') return 'RUN_STATE_FAILURE';
  if (severity === 'HIGH') return 'RUN_STATE_BLOCKER';
  if (state === 'IDEMPOTENT_STABLE') return 'RUN_STATE_STABILITY';
  if (severity === 'MEDIUM') return 'RUN_STATE_WARNING';
  return 'RUN_STATE_HEALTH';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalStatus_(severity) {
  if (severity === 'CRITICAL') return 'ACTIVE_CRITICAL';
  if (severity === 'HIGH') return 'ACTIVE_HIGH';
  if (severity === 'MEDIUM') return 'ACTIVE_MONITOR';
  return 'ACTIVE_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalRecommendedAction_(
  operationalState,
  governancePosture,
  orchestrationPosture,
  decisioningPosture
) {
  const state = String(operationalState || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const orchestration = String(orchestrationPosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    state.indexOf('FAILED') !== -1 ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'PAUSE_AUTONOMOUS_ADVANCEMENT_AND_REVIEW_FAILURES';
  }

  if (
    state === 'BLOCKED' ||
    governance === 'ESCALATE' ||
    orchestration === 'HOLD_DISPATCH' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'HOLD_DISPATCH_AND_REQUIRE_HUMAN_REVIEW';
  }

  if (
    state.indexOf('WARNING') !== -1 ||
    governance === 'MONITOR' ||
    orchestration === 'ALLOW_WITH_MONITORING' ||
    decisioning === 'ADVANCE_WITH_CAUTION'
  ) {
    return 'ALLOW_DOWNSTREAM_PROCESSING_WITH_MONITORING';
  }

  return 'ALLOW_DOWNSTREAM_PROCESSING';
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalAutonomousAllowed_(
  decisioningPosture
) {
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return false;
  }

  return true;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalHumanReviewRequired_(
  governancePosture,
  decisioningPosture
) {
  const governance = String(governancePosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    governance === 'REVIEW_REQUIRED' ||
    governance === 'ESCALATE' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return true;
  }

  return false;
}

function sciipResolveAutonomousProcessorExecutionRunStateSignalMessage_(
  operationalState,
  severity,
  recommendedAction
) {
  return (
    'Autonomous run state signal resolved as ' +
    severity +
    ' from operational state ' +
    operationalState +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalInputRows_(sheet) {
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateSignalRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Ledger_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateSignalProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessorLegacy1190_();
      return sciipWrapLegacyRuntimeResult1190_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1190_(legacyResult, context, transaction) {
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
 * 1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR =
  '1190_AutonomousProcessorExecutionRunStateSignalLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Signal_ID',
  'Signal_Type',
  'Signal_Category',
  'Signal_Severity',
  'Signal_Status',
  'Signal_Message',
  'Operational_State',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Ledger_Entries_Reviewed',
  'Unique_Processors_Observed',
  'Healthy_Count',
  'Warning_Count',
  'Blocked_Count',
  'Failed_Count',
  'Skipped_Count',
  'Duplicate_Count',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Signal_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessorLegacy1190_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const signalRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalLedgerRowsByDate_(
      signalRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestSignal =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignalLedgerEntry_(
      latestSignal,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignalLedgerEntry_(
  signal,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSSL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    signalId: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_ID']),
    signalType: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Type']),
    signalCategory: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Category']),
    signalSeverity: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Severity']),
    signalStatus: sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Status']),
    operationalState: sciipGetRunStateSignalLedgerInputValue_(signal, ['Operational_State']),
    governancePosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateSignalLedgerInputValue_(signal, ['Decisioning_Posture']),
    recommendedAction: sciipGetRunStateSignalLedgerInputValue_(signal, ['Recommended_Action']),
    autonomousActionAllowed: sciipGetRunStateSignalLedgerInputValue_(signal, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateSignalLedgerInputValue_(signal, ['Human_Review_Required']),
    sourceLedgerEntryId: sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Ledger_Entry_ID']),
    sourceBusinessKey: sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Business_Key']),
    sourceSignalBusinessKey: sciipGetRunStateSignalLedgerInputValue_(signal, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_ID']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Type']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Category']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Severity']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Status']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Signal_Message']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Operational_State']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Governance_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Orchestration_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Dashboard_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Decisioning_Posture']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Recommended_Action']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Autonomous_Action_Allowed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Human_Review_Required']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Ledger_Entries_Reviewed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Unique_Processors_Observed']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Healthy_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Warning_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Blocked_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Failed_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Skipped_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Duplicate_Count']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Ledger_Entry_ID']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Source_Business_Key']),
    sciipGetRunStateSignalLedgerInputValue_(signal, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalLedgerInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateSignalLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalLedgerInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalLedgerInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateSignalLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalLedgerProcessor',
    result: result
  }));

  return result;
}

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

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessorLegacy1210_();
      return sciipWrapLegacyRuntimeResult1210_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1210_(legacyResult, context, transaction) {
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
 * 1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR =
  '1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_ID',
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
  'Source_Digest_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessorLegacy1210_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digestRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalDigestLedgerRowsByDate_(
      digestRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestDigest =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignalDigestLedgerEntry_(
      latestDigest,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignalDigestLedgerEntry_(
  digest,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSSDL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    digestId: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_ID']),
    digestType: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Type']),
    signalPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signal_Posture']),
    digestSeverity: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Severity']),
    digestStatus: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Status']),
    governancePosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Decisioning_Posture']),
    recommendedAction: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Recommended_Action']),
    autonomousActionAllowed: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Human_Review_Required']),
    signalsReviewed: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signals_Reviewed']),
    sourceDigestBusinessKey: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_ID']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Type']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signal_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Severity']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Status']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Message']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Governance_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Orchestration_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Dashboard_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Decisioning_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Recommended_Action']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Autonomous_Action_Allowed']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Human_Review_Required']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signals_Reviewed']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Critical_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['High_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Medium_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Low_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_ID']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Category']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Severity']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Status']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Operational_State']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Source_Business_Key']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateSignalDigestLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalDigestLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalDigestLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalDigestLedgerInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalDigestLedgerInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalDigestLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalDigestLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_RUNTIME_LEDGER',

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
          originalProcessor: '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessorLegacy1220_();
      return sciipWrapLegacyRuntimeResult1220_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1220_(legacyResult, context, transaction) {
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
 * 1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR =
  '1220_AutonomousProcessorExecutionRunStateCommandCenterProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS = [
  'Command_Center_Record_ID',
  'Business_Key',
  'Run_State_Date',
  'Command_Center_Type',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Display_Message',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
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
  'Source_Ledger_Entry_ID',
  'Source_Digest_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Command_Center_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessorLegacy1220_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateCommandCenterInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateCommandCenterRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterInputRow_(
      sourceRows
    );

  const commandCenterRow =
    sciipBuildAutonomousProcessorExecutionRunStateCommandCenterRecord_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(commandCenterRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateCommandCenterRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: command-center record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateCommandCenterRecord_(
  ledgerRow,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const displaySeverity =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Digest_Severity']);

  const signalPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Signal_Posture']);

  const dashboardPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Dashboard_Posture']);

  const governancePosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Governance_Posture']);

  const orchestrationPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Orchestration_Posture']);

  const decisioningPosture =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Decisioning_Posture']);

  const recommendedAction =
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Recommended_Action']);

  const commandCenterStatus =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterStatus_(
      displaySeverity,
      governancePosture,
      decisioningPosture
    );

  const displayPosture =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayPosture_(
      displaySeverity,
      signalPosture
    );

  const displayMessage =
    sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayMessage_(
      commandCenterStatus,
      displaySeverity,
      signalPosture,
      recommendedAction
    );

  const recordId = 'APRSCC_' + Utilities.getUuid();

  const commandCenterJson = {
    runStateDate: resolvedRunStateDate,
    commandCenterType: 'AUTONOMOUS_RUN_STATE_COMMAND_CENTER',
    commandCenterStatus: commandCenterStatus,
    displaySeverity: displaySeverity,
    displayPosture: displayPosture,
    dashboardPosture: dashboardPosture,
    governancePosture: governancePosture,
    orchestrationPosture: orchestrationPosture,
    decisioningPosture: decisioningPosture,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Human_Review_Required'
    ]),
    sourceLedgerEntryId: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Ledger_Entry_ID'
    ]),
    sourceDigestId: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Digest_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Business_Key'
    ])
  };

  return [
    recordId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_COMMAND_CENTER',
    commandCenterStatus,
    displaySeverity,
    displayPosture,
    displayMessage,
    dashboardPosture,
    governancePosture,
    orchestrationPosture,
    decisioningPosture,
    recommendedAction,
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Signals_Reviewed']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Critical_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['High_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Medium_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Low_Signal_Count']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Category']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Severity']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Signal_Status']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Latest_Operational_State']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Ledger_Entry_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Digest_ID']),
    sciipGetRunStateCommandCenterInputValue_(ledgerRow, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN,
    JSON.stringify(commandCenterJson),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Command-center resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterStatus_(
  displaySeverity,
  governancePosture,
  decisioningPosture
) {
  const severity = String(displaySeverity || '').toUpperCase();
  const governance = String(governancePosture || '').toUpperCase();
  const decisioning = String(decisioningPosture || '').toUpperCase();

  if (
    severity === 'CRITICAL' ||
    governance === 'REVIEW_REQUIRED' ||
    decisioning === 'DO_NOT_AUTONOMOUSLY_ADVANCE'
  ) {
    return 'COMMAND_CENTER_CRITICAL';
  }

  if (
    severity === 'HIGH' ||
    governance === 'ESCALATE' ||
    decisioning === 'REQUIRE_HUMAN_REVIEW'
  ) {
    return 'COMMAND_CENTER_ATTENTION_REQUIRED';
  }

  if (severity === 'MEDIUM') {
    return 'COMMAND_CENTER_MONITOR';
  }

  return 'COMMAND_CENTER_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayPosture_(
  displaySeverity,
  signalPosture
) {
  const severity = String(displaySeverity || '').toUpperCase();

  if (severity === 'CRITICAL') return 'Critical autonomous run state signal active';
  if (severity === 'HIGH') return 'High-priority autonomous run state signal active';
  if (severity === 'MEDIUM') return 'Autonomous run state requires monitoring';

  return 'Autonomous run state healthy';
}

function sciipResolveAutonomousProcessorExecutionRunStateCommandCenterDisplayMessage_(
  commandCenterStatus,
  displaySeverity,
  signalPosture,
  recommendedAction
) {
  return (
    commandCenterStatus +
    ': Run state signal digest is ' +
    displaySeverity +
    ' with posture ' +
    signalPosture +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateCommandCenterInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateCommandCenterRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateCommandCenterInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateCommandCenterDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateCommandCenterInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateCommandCenterInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateCommandCenterInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateCommandCenterDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateCommandCenterProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateCommandCenterProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessorLegacy1230_();
      return sciipWrapLegacyRuntimeResult1230_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1230_(legacyResult, context, transaction) {
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
 * 1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR =
  '1230_AutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Command_Center_Record_ID',
  'Command_Center_Type',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Display_Message',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
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
  'Source_Ledger_Entry_ID',
  'Source_Digest_ID',
  'Source_Command_Center_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessorLegacy1230_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const commandCenterRows =
    sciipReadAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateCommandCenterLedgerRowsByDate_(
      commandCenterRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestCommandCenterRecord =
    sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateCommandCenterLedgerEntry_(
      latestCommandCenterRecord,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateCommandCenterLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateCommandCenterLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateCommandCenterLedgerEntry_(
  record,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSCCL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    commandCenterRecordId: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Record_ID'
    ]),
    commandCenterType: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Type'
    ]),
    commandCenterStatus: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Status'
    ]),
    displaySeverity: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Severity'
    ]),
    displayPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Posture'
    ]),
    dashboardPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Dashboard_Posture'
    ]),
    governancePosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Governance_Posture'
    ]),
    orchestrationPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Orchestration_Posture'
    ]),
    decisioningPosture: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Decisioning_Posture'
    ]),
    recommendedAction: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Recommended_Action'
    ]),
    autonomousActionAllowed: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Human_Review_Required'
    ]),
    sourceCommandCenterBusinessKey: sciipGetRunStateCommandCenterLedgerInputValue_(
      record,
      ['Business_Key']
    ),
    sourceBusinessKey: sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Business_Key'
    ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Record_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Type'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Severity'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Display_Message'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Dashboard_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Governance_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Recommended_Action'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Category'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Severity'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Signal_Status'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Latest_Operational_State'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Digest_ID'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Business_Key'
    ]),
    sciipGetRunStateCommandCenterLedgerInputValue_(record, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateCommandCenterLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateCommandCenterLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_COMMAND_CENTER_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Command_Center_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateCommandCenterLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateCommandCenterLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateCommandCenterLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateCommandCenterLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateCommandCenterLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateCommandCenterLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateCommandCenterLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_RUNTIME_LEDGER',

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
          originalProcessor: '1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryProcessorLegacy1240_();
      return sciipWrapLegacyRuntimeResult1240_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1240_(legacyResult, context, transaction) {
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
 * 1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR =
  '1240_AutonomousProcessorExecutionRunStateExecutiveSummaryProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_COMMAND_CENTER_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_HEADERS = [
  'Executive_Summary_ID',
  'Business_Key',
  'Run_State_Date',
  'Summary_Type',
  'Executive_Status',
  'Executive_Severity',
  'Executive_Headline',
  'Executive_Summary',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Operational_Risk',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Command_Center_Record_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Executive_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryProcessorLegacy1240_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummarySheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateExecutiveSummariesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateExecutiveSummariesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryInputRow_(
      sourceRows
    );

  const summaryRow =
    sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummary_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(summaryRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateExecutiveSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummarySheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: executive summary.
 */
function sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummary_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const executiveSeverity =
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Display_Severity']);

  const commandCenterStatus =
    sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Command_Center_Status'
    ]);

  const recommendedAction =
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Recommended_Action']);

  const humanReviewRequired =
    sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Human_Review_Required'
    ]);

  const autonomousAllowed =
    sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Autonomous_Action_Allowed'
    ]);

  const executiveStatus =
    sciipResolveAutonomousProcessorExecutionRunStateExecutiveStatus_(
      executiveSeverity,
      commandCenterStatus
    );

  const headline =
    sciipResolveAutonomousProcessorExecutionRunStateExecutiveHeadline_(
      executiveSeverity,
      executiveStatus
    );

  const executiveSummary =
    sciipResolveAutonomousProcessorExecutionRunStateExecutiveSummaryText_(
      executiveSeverity,
      commandCenterStatus,
      recommendedAction,
      humanReviewRequired,
      autonomousAllowed
    );

  const leadershipInterpretation =
    sciipResolveAutonomousProcessorExecutionRunStateLeadershipInterpretation_(
      executiveSeverity,
      humanReviewRequired,
      autonomousAllowed
    );

  const governanceInterpretation =
    sciipResolveAutonomousProcessorExecutionRunStateGovernanceInterpretation_(
      row
    );

  const operationalRisk =
    sciipResolveAutonomousProcessorExecutionRunStateOperationalRisk_(
      executiveSeverity
    );

  const summaryId = 'APRSES_' + Utilities.getUuid();

  const summaryJson = {
    runStateDate: resolvedRunStateDate,
    summaryType: 'AUTONOMOUS_RUN_STATE_EXECUTIVE_SUMMARY',
    executiveStatus: executiveStatus,
    executiveSeverity: executiveSeverity,
    executiveHeadline: headline,
    executiveSummary: executiveSummary,
    leadershipInterpretation: leadershipInterpretation,
    governanceInterpretation: governanceInterpretation,
    operationalRisk: operationalRisk,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceLedgerEntryId: sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    summaryId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_EXECUTIVE_SUMMARY',
    executiveStatus,
    executiveSeverity,
    headline,
    executiveSummary,
    leadershipInterpretation,
    governanceInterpretation,
    operationalRisk,
    recommendedAction,
    autonomousAllowed,
    humanReviewRequired,
    commandCenterStatus,
    executiveSeverity,
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Display_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Dashboard_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, [
      'Command_Center_Record_ID'
    ]),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_DATE_COLUMN,
    JSON.stringify(summaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Executive resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateExecutiveStatus_(
  severity,
  commandCenterStatus
) {
  const sev = String(severity || '').toUpperCase();
  const status = String(commandCenterStatus || '').toUpperCase();

  if (sev === 'CRITICAL' || status.indexOf('CRITICAL') !== -1) {
    return 'EXECUTIVE_ATTENTION_REQUIRED';
  }

  if (sev === 'HIGH' || status.indexOf('ATTENTION') !== -1) {
    return 'EXECUTIVE_REVIEW_RECOMMENDED';
  }

  if (sev === 'MEDIUM' || status.indexOf('MONITOR') !== -1) {
    return 'EXECUTIVE_MONITOR';
  }

  return 'EXECUTIVE_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateExecutiveHeadline_(
  severity,
  executiveStatus
) {
  const sev = String(severity || '').toUpperCase();

  if (sev === 'CRITICAL') {
    return 'Autonomous run state requires immediate executive attention.';
  }

  if (sev === 'HIGH') {
    return 'Autonomous run state requires governance review before advancement.';
  }

  if (sev === 'MEDIUM') {
    return 'Autonomous run state is operational with monitoring conditions.';
  }

  return 'Autonomous run state is healthy and available for downstream processing.';
}

function sciipResolveAutonomousProcessorExecutionRunStateExecutiveSummaryText_(
  severity,
  commandCenterStatus,
  recommendedAction,
  humanReviewRequired,
  autonomousAllowed
) {
  return (
    'The autonomous run state command center resolved a ' +
    severity +
    ' status under ' +
    commandCenterStatus +
    '. Recommended action: ' +
    recommendedAction +
    '. Autonomous action allowed: ' +
    autonomousAllowed +
    '. Human review required: ' +
    humanReviewRequired +
    '.'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateLeadershipInterpretation_(
  severity,
  humanReviewRequired,
  autonomousAllowed
) {
  const sev = String(severity || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (sev === 'CRITICAL' || allowed === 'FALSE') {
    return 'Leadership should treat the autonomous execution run state as constrained until the underlying signal is reviewed.';
  }

  if (review === 'TRUE' || sev === 'HIGH') {
    return 'Leadership should review the run state before allowing additional autonomous promotion.';
  }

  if (sev === 'MEDIUM') {
    return 'Leadership can allow continued operation while monitoring the signal trail.';
  }

  return 'Leadership can treat the autonomous run state as stable for this processing date.';
}

function sciipResolveAutonomousProcessorExecutionRunStateGovernanceInterpretation_(
  row
) {
  const governance =
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Governance_Posture']);

  const decisioning =
    sciipGetRunStateExecutiveSummaryInputValue_(row, ['Decisioning_Posture']);

  return (
    'Governance posture is ' +
    governance +
    '; decisioning posture is ' +
    decisioning +
    '.'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateOperationalRisk_(
  severity
) {
  const sev = String(severity || '').toUpperCase();

  if (sev === 'CRITICAL') return 'HIGH_OPERATIONAL_RISK';
  if (sev === 'HIGH') return 'ELEVATED_OPERATIONAL_RISK';
  if (sev === 'MEDIUM') return 'MONITORED_OPERATIONAL_RISK';

  return 'LOW_OPERATIONAL_RISK';
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateExecutiveSummaryInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Command_Center_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateExecutiveSummaryDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateExecutiveSummaryInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateExecutiveSummaryInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateExecutiveSummaryInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateExecutiveSummaryDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessorLegacy1250_();
      return sciipWrapLegacyRuntimeResult1250_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1250_(legacyResult, context, transaction) {
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
 * 1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR =
  '1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Executive_Summary_ID',
  'Summary_Type',
  'Executive_Status',
  'Executive_Severity',
  'Executive_Headline',
  'Executive_Summary',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Operational_Risk',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Command_Center_Record_ID',
  'Source_Ledger_Entry_ID',
  'Source_Executive_Summary_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessorLegacy1250_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const summaryRows =
    sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerRowsByDate_(
      summaryRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestSummary =
    sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntry_(
      latestSummary,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntry_(
  summary,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSESL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    executiveSummaryId: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Summary_ID']
    ),
    summaryType: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Summary_Type']
    ),
    executiveStatus: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Status']
    ),
    executiveSeverity: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Severity']
    ),
    executiveHeadline: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Headline']
    ),
    operationalRisk: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Operational_Risk']
    ),
    recommendedAction: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Recommended_Action']
    ),
    autonomousActionAllowed: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Autonomous_Action_Allowed']
    ),
    humanReviewRequired: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Human_Review_Required']
    ),
    sourceExecutiveSummaryBusinessKey:
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
        'Business_Key'
      ]),
    sourceBusinessKey:
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
        'Source_Business_Key'
      ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Summary_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Summary_Type'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Status'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Severity'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Headline'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Summary'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Governance_Interpretation'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Operational_Risk'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Recommended_Action'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Display_Severity'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Display_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Dashboard_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Governance_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Command_Center_Record_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Business_Key'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateExecutiveSummaryLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Summary_Date',
      'Executive_Summary_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateExecutiveSummaryLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateExecutiveSummaryLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateExecutiveSummaryLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_RUNTIME_LEDGER',

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
          originalProcessor: '1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessorLegacy1260_();
      return sciipWrapLegacyRuntimeResult1260_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1260_(legacyResult, context, transaction) {
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
 * 1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR =
  '1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS = [
  'Daily_Brief_ID',
  'Business_Key',
  'Run_State_Date',
  'Brief_Type',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Headline',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Executive_Summary_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Daily_Brief_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessorLegacy1260_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateDailyBriefInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDailyBriefRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDailyBriefsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefInputRow_(
      sourceRows
    );

  const dailyBriefRow =
    sciipBuildAutonomousProcessorExecutionRunStateDailyBrief_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(dailyBriefRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: daily brief.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDailyBrief_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const executiveStatus =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Status']);

  const executiveSeverity =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Severity']);

  const operationalRisk =
    sciipGetRunStateDailyBriefInputValue_(row, ['Operational_Risk']);

  const recommendedAction =
    sciipGetRunStateDailyBriefInputValue_(row, ['Recommended_Action']);

  const humanReviewRequired =
    sciipGetRunStateDailyBriefInputValue_(row, ['Human_Review_Required']);

  const autonomousAllowed =
    sciipGetRunStateDailyBriefInputValue_(row, ['Autonomous_Action_Allowed']);

  const briefStatus =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefStatus_(
      executiveStatus,
      executiveSeverity
    );

  const briefTitle =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefTitle_(
      executiveSeverity
    );

  const briefText =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefText_(
      row,
      resolvedRunStateDate,
      recommendedAction,
      humanReviewRequired,
      autonomousAllowed
    );

  const dailyBriefId = 'APRSDB_' + Utilities.getUuid();

  const briefJson = {
    runStateDate: resolvedRunStateDate,
    briefType: 'AUTONOMOUS_RUN_STATE_DAILY_BRIEF',
    briefStatus: briefStatus,
    briefSeverity: executiveSeverity,
    briefTitle: briefTitle,
    briefText: briefText,
    executiveStatus: executiveStatus,
    executiveSeverity: executiveSeverity,
    operationalRisk: operationalRisk,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceExecutiveSummaryId: sciipGetRunStateDailyBriefInputValue_(row, [
      'Executive_Summary_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateDailyBriefInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateDailyBriefInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    dailyBriefId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_DAILY_BRIEF',
    briefStatus,
    executiveSeverity,
    briefTitle,
    briefText,
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Headline']),
    executiveStatus,
    executiveSeverity,
    operationalRisk,
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Governance_Interpretation'
    ]),
    recommendedAction,
    autonomousAllowed,
    humanReviewRequired,
    sciipGetRunStateDailyBriefInputValue_(row, ['Command_Center_Status']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Summary_ID']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN,
    JSON.stringify(briefJson),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Brief resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefStatus_(
  executiveStatus,
  executiveSeverity
) {
  const status = String(executiveStatus || '').toUpperCase();
  const severity = String(executiveSeverity || '').toUpperCase();

  if (severity === 'CRITICAL' || status.indexOf('ATTENTION_REQUIRED') !== -1) {
    return 'DAILY_BRIEF_CRITICAL';
  }

  if (severity === 'HIGH' || status.indexOf('REVIEW') !== -1) {
    return 'DAILY_BRIEF_REVIEW';
  }

  if (severity === 'MEDIUM' || status.indexOf('MONITOR') !== -1) {
    return 'DAILY_BRIEF_MONITOR';
  }

  return 'DAILY_BRIEF_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefTitle_(
  executiveSeverity
) {
  const severity = String(executiveSeverity || '').toUpperCase();

  if (severity === 'CRITICAL') {
    return 'Daily Brief: Autonomous Run State Requires Immediate Attention';
  }

  if (severity === 'HIGH') {
    return 'Daily Brief: Autonomous Run State Requires Governance Review';
  }

  if (severity === 'MEDIUM') {
    return 'Daily Brief: Autonomous Run State Requires Monitoring';
  }

  return 'Daily Brief: Autonomous Run State Healthy';
}

function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefText_(
  row,
  resolvedRunStateDate,
  recommendedAction,
  humanReviewRequired,
  autonomousAllowed
) {
  const headline =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Headline']);

  const leadershipInterpretation =
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Leadership_Interpretation'
    ]);

  const operationalRisk =
    sciipGetRunStateDailyBriefInputValue_(row, ['Operational_Risk']);

  return (
    'For ' +
    resolvedRunStateDate +
    ', ' +
    headline +
    ' Operational risk: ' +
    operationalRisk +
    '. ' +
    leadershipInterpretation +
    ' Recommended action: ' +
    recommendedAction +
    '. Autonomous action allowed: ' +
    autonomousAllowed +
    '. Human review required: ' +
    humanReviewRequired +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDailyBriefInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateDailyBriefRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDailyBriefInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDailyBriefDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDailyBriefInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDailyBriefInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDailyBriefInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDailyBriefDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateDailyBriefProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDailyBriefProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessorLegacy1270_();
      return sciipWrapLegacyRuntimeResult1270_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1270_(legacyResult, context, transaction) {
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
 * 1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR =
  '1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Daily_Brief_ID',
  'Brief_Type',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Headline',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Executive_Summary_ID',
  'Source_Ledger_Entry_ID',
  'Source_Daily_Brief_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessorLegacy1270_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const briefRows =
    sciipReadAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDailyBriefLedgerRowsByDate_(
      briefRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestBrief =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateDailyBriefLedgerEntry_(
      latestBrief,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDailyBriefLedgerEntry_(
  brief,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSDBL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    dailyBriefId: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Daily_Brief_ID'
    ]),
    briefType: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Type'
    ]),
    briefStatus: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Status'
    ]),
    briefSeverity: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Severity'
    ]),
    briefTitle: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Title'
    ]),
    executiveStatus: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Executive_Status'
    ]),
    operationalRisk: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Operational_Risk'
    ]),
    recommendedAction: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Recommended_Action'
    ]),
    autonomousActionAllowed: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Human_Review_Required'
    ]),
    sourceDailyBriefBusinessKey: sciipGetRunStateDailyBriefLedgerInputValue_(
      brief,
      ['Business_Key']
    ),
    sourceBusinessKey: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Business_Key'
    ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Daily_Brief_ID']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Type']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Status']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Severity']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Title']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Text']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Headline']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Status']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Severity']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Operational_Risk']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Governance_Interpretation'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Recommended_Action']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Governance_Posture']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Decisioning_Posture']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Signals_Reviewed']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['High_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Medium_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Low_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Executive_Summary_ID'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Business_Key']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Source_Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateDailyBriefLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDailyBriefLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDailyBriefLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDailyBriefLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDailyBriefLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDailyBriefLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDailyBriefLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1280_AutonomousProcessorExecutionRunStateFinalizationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1280_AutonomousProcessorExecutionRunStateFinalizationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_RUNTIME_LEDGER',

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
          originalProcessor: '1280_AutonomousProcessorExecutionRunStateFinalizationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessorLegacy1280_();
      return sciipWrapLegacyRuntimeResult1280_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1280_(legacyResult, context, transaction) {
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
 * 1280_AutonomousProcessorExecutionRunStateFinalizationProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR =
  '1280_AutonomousProcessorExecutionRunStateFinalizationProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS = [
  'Finalization_ID',
  'Business_Key',
  'Run_State_Date',
  'Finalization_Type',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Message',
  'Finalization_Decision',
  'Run_State_Closed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Daily_Brief_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Finalization_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessorLegacy1280_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateFinalizationSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateFinalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateFinalizationInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateFinalizationRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateFinalizationsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationInputRow_(
      sourceRows
    );

  const finalizationRow =
    sciipBuildAutonomousProcessorExecutionRunStateFinalization_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(finalizationRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateFinalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateFinalizationSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: finalization record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateFinalization_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const briefStatus =
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Status']);

  const briefSeverity =
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Severity']);

  const autonomousAllowed =
    sciipGetRunStateFinalizationInputValue_(row, [
      'Autonomous_Action_Allowed'
    ]);

  const humanReviewRequired =
    sciipGetRunStateFinalizationInputValue_(row, [
      'Human_Review_Required'
    ]);

  const recommendedAction =
    sciipGetRunStateFinalizationInputValue_(row, ['Recommended_Action']);

  const finalizationStatus =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationStatus_(
      briefStatus,
      briefSeverity,
      humanReviewRequired,
      autonomousAllowed
    );

  const finalizationDecision =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationDecision_(
      briefSeverity,
      humanReviewRequired,
      autonomousAllowed
    );

  const runStateClosed =
    sciipResolveAutonomousProcessorExecutionRunStateClosed_(
      finalizationStatus
    );

  const readyForDownstreamUse =
    sciipResolveAutonomousProcessorExecutionRunStateReadyForDownstreamUse_(
      finalizationDecision
    );

  const readyForGovernance = true;
  const readyForDashboard = true;

  const readyForAutonomousDecisioning =
    sciipResolveAutonomousProcessorExecutionRunStateReadyForAutonomousDecisioning_(
      autonomousAllowed,
      humanReviewRequired
    );

  const finalizationMessage =
    sciipResolveAutonomousProcessorExecutionRunStateFinalizationMessage_(
      resolvedRunStateDate,
      finalizationStatus,
      finalizationDecision,
      recommendedAction
    );

  const finalizationId = 'APRSF_' + Utilities.getUuid();

  const finalizationJson = {
    runStateDate: resolvedRunStateDate,
    finalizationType: 'AUTONOMOUS_RUN_STATE_FINALIZATION',
    finalizationStatus: finalizationStatus,
    finalizationSeverity: briefSeverity,
    finalizationDecision: finalizationDecision,
    runStateClosed: runStateClosed,
    readyForDownstreamUse: readyForDownstreamUse,
    readyForGovernance: readyForGovernance,
    readyForDashboard: readyForDashboard,
    readyForAutonomousDecisioning: readyForAutonomousDecisioning,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    recommendedAction: recommendedAction,
    sourceDailyBriefId: sciipGetRunStateFinalizationInputValue_(row, [
      'Daily_Brief_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateFinalizationInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateFinalizationInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    finalizationId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_FINALIZATION',
    finalizationStatus,
    briefSeverity,
    finalizationMessage,
    finalizationDecision,
    runStateClosed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    humanReviewRequired,
    briefStatus,
    briefSeverity,
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Title']),
    sciipGetRunStateFinalizationInputValue_(row, ['Brief_Text']),
    sciipGetRunStateFinalizationInputValue_(row, ['Executive_Status']),
    sciipGetRunStateFinalizationInputValue_(row, ['Executive_Severity']),
    sciipGetRunStateFinalizationInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateFinalizationInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateFinalizationInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateFinalizationInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateFinalizationInputValue_(row, ['Daily_Brief_ID']),
    sciipGetRunStateFinalizationInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateFinalizationInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN,
    JSON.stringify(finalizationJson),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Finalization resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateFinalizationStatus_(
  briefStatus,
  briefSeverity,
  humanReviewRequired,
  autonomousAllowed
) {
  const status = String(briefStatus || '').toUpperCase();
  const severity = String(briefSeverity || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (
    severity === 'CRITICAL' ||
    status.indexOf('CRITICAL') !== -1 ||
    allowed === 'FALSE'
  ) {
    return 'FINALIZED_WITH_CONTROL_CONSTRAINT';
  }

  if (
    severity === 'HIGH' ||
    status.indexOf('REVIEW') !== -1 ||
    review === 'TRUE'
  ) {
    return 'FINALIZED_WITH_GOVERNANCE_REVIEW';
  }

  if (severity === 'MEDIUM' || status.indexOf('MONITOR') !== -1) {
    return 'FINALIZED_WITH_MONITORING';
  }

  return 'FINALIZED_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateFinalizationDecision_(
  briefSeverity,
  humanReviewRequired,
  autonomousAllowed
) {
  const severity = String(briefSeverity || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (severity === 'CRITICAL' || allowed === 'FALSE') {
    return 'DO_NOT_ADVANCE_AUTONOMOUSLY';
  }

  if (severity === 'HIGH' || review === 'TRUE') {
    return 'REQUIRE_GOVERNANCE_REVIEW_BEFORE_ADVANCEMENT';
  }

  if (severity === 'MEDIUM') {
    return 'ADVANCE_WITH_MONITORING';
  }

  return 'ADVANCE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosed_(
  finalizationStatus
) {
  return String(finalizationStatus || '').indexOf('FINALIZED') === 0;
}

function sciipResolveAutonomousProcessorExecutionRunStateReadyForDownstreamUse_(
  finalizationDecision
) {
  const decision = String(finalizationDecision || '').toUpperCase();

  return decision !== 'DO_NOT_ADVANCE_AUTONOMOUSLY';
}

function sciipResolveAutonomousProcessorExecutionRunStateReadyForAutonomousDecisioning_(
  autonomousAllowed,
  humanReviewRequired
) {
  const allowed = String(autonomousAllowed || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();

  return allowed !== 'FALSE' && review !== 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateFinalizationMessage_(
  resolvedRunStateDate,
  finalizationStatus,
  finalizationDecision,
  recommendedAction
) {
  return (
    'Run state finalization completed for ' +
    resolvedRunStateDate +
    ' with status ' +
    finalizationStatus +
    '. Finalization decision: ' +
    finalizationDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateFinalizationInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateFinalizationRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateFinalizationInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateFinalizationDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateFinalizationInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateFinalizationInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateFinalizationInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateFinalizationDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateFinalizationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateFinalizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateFinalizationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessorLegacy1290_();
      return sciipWrapLegacyRuntimeResult1290_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1290_(legacyResult, context, transaction) {
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
 * 1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR =
  '1290_AutonomousProcessorExecutionRunStateFinalizationLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Finalization_ID',
  'Finalization_Type',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Message',
  'Finalization_Decision',
  'Run_State_Closed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Daily_Brief_ID',
  'Source_Ledger_Entry_ID',
  'Source_Finalization_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessorLegacy1290_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateFinalizationLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const finalizationRows =
    sciipReadAutonomousProcessorExecutionRunStateFinalizationLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateFinalizationLedgerRowsByDate_(
      finalizationRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestFinalization =
    sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateFinalizationLedgerEntry_(
      latestFinalization,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateFinalizationLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateFinalizationLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateFinalizationLedgerEntry_(
  finalization,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSFL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    finalizationId: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_ID']
    ),
    finalizationType: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Type']
    ),
    finalizationStatus: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Status']
    ),
    finalizationSeverity: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Severity']
    ),
    finalizationDecision: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Finalization_Decision']
    ),
    runStateClosed: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Run_State_Closed']
    ),
    readyForDownstreamUse: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Downstream_Use']
    ),
    readyForGovernance: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Governance']
    ),
    readyForDashboard: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Ready_For_Dashboard']
    ),
    readyForAutonomousDecisioning:
      sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
        'Ready_For_Autonomous_Decisioning'
      ]),
    autonomousActionAllowed: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Autonomous_Action_Allowed']
    ),
    humanReviewRequired: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Human_Review_Required']
    ),
    sourceFinalizationBusinessKey:
      sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
        'Business_Key'
      ]),
    sourceBusinessKey: sciipGetRunStateFinalizationLedgerInputValue_(
      finalization,
      ['Source_Business_Key']
    )
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Type'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Message'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Finalization_Decision'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Run_State_Closed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Downstream_Use'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Governance'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Dashboard'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Ready_For_Autonomous_Decisioning'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Title'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Brief_Text'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Executive_Status'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Executive_Severity'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Operational_Risk'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Recommended_Action'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Governance_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Daily_Brief_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Business_Key'
    ]),
    sciipGetRunStateFinalizationLedgerInputValue_(finalization, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateFinalizationLedgerInputRows_(
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateFinalizationLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateFinalizationLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_FINALIZATION_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Finalization_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateFinalizationLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateFinalizationLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateFinalizationLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateFinalizationLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateFinalizationLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateFinalizationLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateFinalizationLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1300_AutonomousProcessorExecutionRunStateClosureProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateClosureProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1300_AutonomousProcessorExecutionRunStateClosureProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_RUNTIME_LEDGER',

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
          originalProcessor: '1300_AutonomousProcessorExecutionRunStateClosureProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateClosureProcessorLegacy1300_();
      return sciipWrapLegacyRuntimeResult1300_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1300_(legacyResult, context, transaction) {
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
 * 1300_AutonomousProcessorExecutionRunStateClosureProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR =
  '1300_AutonomousProcessorExecutionRunStateClosureProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_FINALIZATION_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS = [
  'Closure_ID',
  'Business_Key',
  'Run_State_Date',
  'Closure_Type',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Closure_Message',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Decision',
  'Finalization_Message',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Finalization_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Closure_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateClosureProcessorLegacy1300_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' + SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateClosureSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateClosuresCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateClosureInputRows_(inputSheet);

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateClosureRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateClosuresCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateClosureInputRow_(
      sourceRows
    );

  const closureRow =
    sciipBuildAutonomousProcessorExecutionRunStateClosure_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(closureRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateClosuresCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateClosureSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_OUTPUT_HEADERS.filter(function(h) {
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
 * Factory: closure record.
 */
function sciipBuildAutonomousProcessorExecutionRunStateClosure_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const finalizationStatus =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Status']);

  const finalizationSeverity =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Severity']);

  const finalizationDecision =
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Decision']);

  const runStateClosed =
    sciipGetRunStateClosureInputValue_(row, ['Run_State_Closed']);

  const readyForDownstreamUse =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Downstream_Use']);

  const readyForGovernance =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Governance']);

  const readyForDashboard =
    sciipGetRunStateClosureInputValue_(row, ['Ready_For_Dashboard']);

  const readyForAutonomousDecisioning =
    sciipGetRunStateClosureInputValue_(row, [
      'Ready_For_Autonomous_Decisioning'
    ]);

  const autonomousAllowed =
    sciipGetRunStateClosureInputValue_(row, ['Autonomous_Action_Allowed']);

  const humanReviewRequired =
    sciipGetRunStateClosureInputValue_(row, ['Human_Review_Required']);

  const recommendedAction =
    sciipGetRunStateClosureInputValue_(row, ['Recommended_Action']);

  const closureStatus =
    sciipResolveAutonomousProcessorExecutionRunStateClosureStatus_(
      finalizationStatus,
      runStateClosed,
      readyForDownstreamUse,
      readyForAutonomousDecisioning
    );

  const closureDecision =
    sciipResolveAutonomousProcessorExecutionRunStateClosureDecision_(
      finalizationDecision,
      readyForAutonomousDecisioning,
      humanReviewRequired,
      autonomousAllowed
    );

  const closureConfirmed =
    sciipResolveAutonomousProcessorExecutionRunStateClosureConfirmed_(
      closureStatus,
      runStateClosed
    );

  const closureMessage =
    sciipResolveAutonomousProcessorExecutionRunStateClosureMessage_(
      resolvedRunStateDate,
      closureStatus,
      closureDecision,
      recommendedAction
    );

  const closureId = 'APRSC_' + Utilities.getUuid();

  const closureJson = {
    runStateDate: resolvedRunStateDate,
    closureType: 'AUTONOMOUS_RUN_STATE_CLOSURE',
    closureStatus: closureStatus,
    closureSeverity: finalizationSeverity,
    closureDecision: closureDecision,
    runStateClosed: runStateClosed,
    closureConfirmed: closureConfirmed,
    readyForDownstreamUse: readyForDownstreamUse,
    readyForGovernance: readyForGovernance,
    readyForDashboard: readyForDashboard,
    readyForAutonomousDecisioning: readyForAutonomousDecisioning,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceFinalizationId: sciipGetRunStateClosureInputValue_(row, [
      'Finalization_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateClosureInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateClosureInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    closureId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_CLOSURE',
    closureStatus,
    finalizationSeverity,
    closureDecision,
    closureMessage,
    runStateClosed,
    closureConfirmed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    humanReviewRequired,
    finalizationStatus,
    finalizationSeverity,
    finalizationDecision,
    sciipGetRunStateClosureInputValue_(row, ['Finalization_Message']),
    sciipGetRunStateClosureInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateClosureInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateClosureInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateClosureInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateClosureInputValue_(row, ['Finalization_ID']),
    sciipGetRunStateClosureInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateClosureInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN,
    JSON.stringify(closureJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Closure resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateClosureStatus_(
  finalizationStatus,
  runStateClosed,
  readyForDownstreamUse,
  readyForAutonomousDecisioning
) {
  const finalStatus = String(finalizationStatus || '').toUpperCase();
  const closed = String(runStateClosed || '').toUpperCase();
  const downstream = String(readyForDownstreamUse || '').toUpperCase();
  const autonomous = String(readyForAutonomousDecisioning || '').toUpperCase();

  if (closed !== 'TRUE') {
    return 'CLOSURE_INCOMPLETE';
  }

  if (finalStatus.indexOf('CONTROL_CONSTRAINT') !== -1) {
    return 'CLOSED_WITH_CONTROL_CONSTRAINT';
  }

  if (finalStatus.indexOf('GOVERNANCE_REVIEW') !== -1) {
    return 'CLOSED_WITH_GOVERNANCE_REVIEW';
  }

  if (finalStatus.indexOf('MONITORING') !== -1) {
    return 'CLOSED_WITH_MONITORING';
  }

  if (downstream === 'TRUE' && autonomous === 'TRUE') {
    return 'CLOSED_READY_FOR_AUTONOMOUS_CONTINUATION';
  }

  return 'CLOSED_READY_FOR_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureDecision_(
  finalizationDecision,
  readyForAutonomousDecisioning,
  humanReviewRequired,
  autonomousAllowed
) {
  const decision = String(finalizationDecision || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (decision === 'DO_NOT_ADVANCE_AUTONOMOUSLY' || allowed === 'FALSE') {
    return 'CLOSE_AND_PREVENT_AUTONOMOUS_ADVANCEMENT';
  }

  if (review === 'TRUE') {
    return 'CLOSE_AND_ROUTE_TO_GOVERNANCE_REVIEW';
  }

  if (autonomousReady === 'TRUE') {
    return 'CLOSE_AND_ALLOW_AUTONOMOUS_CONTINUATION';
  }

  return 'CLOSE_AND_ALLOW_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureConfirmed_(
  closureStatus,
  runStateClosed
) {
  return (
    String(runStateClosed || '').toUpperCase() === 'TRUE' &&
    String(closureStatus || '').indexOf('CLOSED') === 0
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateClosureMessage_(
  resolvedRunStateDate,
  closureStatus,
  closureDecision,
  recommendedAction
) {
  return (
    'Run state closure completed for ' +
    resolvedRunStateDate +
    ' with status ' +
    closureStatus +
    '. Closure decision: ' +
    closureDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateClosureInputRows_(sheet) {
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

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateClosureRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateClosureInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Finalization_Date',
      'Closure_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateClosureDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateClosureInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateClosureInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateClosureInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateClosureInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateClosureDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateClosureProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateClosureProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateClosureProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessorLegacy1310_();
      return sciipWrapLegacyRuntimeResult1310_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1310_(legacyResult, context, transaction) {
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
 * 1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR =
  '1310_AutonomousProcessorExecutionRunStateClosureLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Closure_ID',
  'Closure_Type',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Closure_Message',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Finalization_Status',
  'Finalization_Severity',
  'Finalization_Decision',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Finalization_ID',
  'Source_Ledger_Entry_ID',
  'Source_Closure_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessorLegacy1310_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateClosureLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const closureRows =
    sciipReadAutonomousProcessorExecutionRunStateClosureLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateClosureLedgerRowsByDate_(
      closureRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestClosure =
    sciipResolveLatestAutonomousProcessorExecutionRunStateClosureLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateClosureLedgerEntry_(
      latestClosure,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateClosureLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateClosureLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

function sciipBuildAutonomousProcessorExecutionRunStateClosureLedgerEntry_(
  closure,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSCL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    closureId: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_ID']),
    closureType: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Type']),
    closureStatus: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Status']),
    closureSeverity: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Severity']),
    closureDecision: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Decision']),
    runStateClosed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Run_State_Closed']),
    closureConfirmed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Confirmed']),
    readyForDownstreamUse: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Downstream_Use']),
    readyForGovernance: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Governance']),
    readyForDashboard: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Dashboard']),
    readyForAutonomousDecisioning: sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Autonomous_Decisioning']),
    autonomousActionAllowed: sciipGetRunStateClosureLedgerInputValue_(closure, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateClosureLedgerInputValue_(closure, ['Human_Review_Required']),
    sourceClosureBusinessKey: sciipGetRunStateClosureLedgerInputValue_(closure, ['Business_Key']),
    sourceBusinessKey: sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Type']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Status']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Severity']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Decision']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Message']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Run_State_Closed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Closure_Confirmed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Downstream_Use']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Governance']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Dashboard']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Ready_For_Autonomous_Decisioning']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Autonomous_Action_Allowed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Human_Review_Required']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Status']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Severity']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Finalization_Decision']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Operational_Risk']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Recommended_Action']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Governance_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Orchestration_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Decisioning_Posture']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Signals_Reviewed']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Critical_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['High_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Medium_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Low_Signal_Count']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Finalization_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Ledger_Entry_ID']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Business_Key']),
    sciipGetRunStateClosureLedgerInputValue_(closure, ['Source_Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

function sciipReadAutonomousProcessorExecutionRunStateClosureLedgerInputRows_(
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

function sciipFilterAutonomousProcessorExecutionRunStateClosureLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateClosureLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CLOSURE_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Closure_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateClosureLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateClosureLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateClosureLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateClosureLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateClosureLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateClosureLedgerDateKey_(value) {
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

function sciipTestAutonomousProcessorExecutionRunStateClosureLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateClosureLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateClosureLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1320_AutonomousProcessorExecutionRunStateContinuityProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1320_AutonomousProcessorExecutionRunStateContinuityProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_RUNTIME_LEDGER',

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
          originalProcessor: '1320_AutonomousProcessorExecutionRunStateContinuityProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityProcessorLegacy1320_();
      return sciipWrapLegacyRuntimeResult1320_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1320_(legacyResult, context, transaction) {
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
 * 1320_AutonomousProcessorExecutionRunStateContinuityProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR =
  '1320_AutonomousProcessorExecutionRunStateContinuityProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CLOSURE_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS = [
  'Continuity_ID',
  'Business_Key',
  'Run_State_Date',
  'Continuity_Type',
  'Continuity_Status',
  'Continuity_Severity',
  'Continuity_Decision',
  'Continuity_Message',
  'Next_Cycle_Eligible',
  'Downstream_Use_Allowed',
  'Governance_Routing_Required',
  'Dashboard_Update_Required',
  'Autonomous_Continuation_Allowed',
  'Human_Review_Required',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Closure_ID',
  'Source_Ledger_Entry_ID',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Continuity_JSON',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateContinuityProcessorLegacy1320_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' + SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitiesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateContinuityInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateContinuityRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitiesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestClosureLedger =
    sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityInputRow_(
      sourceRows
    );

  const continuityRow =
    sciipBuildAutonomousProcessorExecutionRunStateContinuity_(
      latestClosureLedger,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(continuityRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitiesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS);
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

function sciipBuildAutonomousProcessorExecutionRunStateContinuity_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const closureStatus =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Status']);

  const closureSeverity =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Severity']);

  const closureDecision =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Decision']);

  const closureConfirmed =
    sciipGetRunStateContinuityInputValue_(row, ['Closure_Confirmed']);

  const readyForDownstreamUse =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Downstream_Use']);

  const readyForGovernance =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Governance']);

  const readyForDashboard =
    sciipGetRunStateContinuityInputValue_(row, ['Ready_For_Dashboard']);

  const readyForAutonomousDecisioning =
    sciipGetRunStateContinuityInputValue_(row, [
      'Ready_For_Autonomous_Decisioning'
    ]);

  const autonomousAllowed =
    sciipGetRunStateContinuityInputValue_(row, ['Autonomous_Action_Allowed']);

  const humanReviewRequired =
    sciipGetRunStateContinuityInputValue_(row, ['Human_Review_Required']);

  const recommendedAction =
    sciipGetRunStateContinuityInputValue_(row, ['Recommended_Action']);

  const continuityStatus =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityStatus_(
      closureStatus,
      closureConfirmed,
      readyForAutonomousDecisioning,
      humanReviewRequired
    );

  const continuityDecision =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityDecision_(
      closureDecision,
      readyForDownstreamUse,
      readyForAutonomousDecisioning,
      humanReviewRequired,
      autonomousAllowed
    );

  const nextCycleEligible =
    sciipResolveAutonomousProcessorExecutionRunStateNextCycleEligible_(
      closureConfirmed,
      readyForDownstreamUse
    );

  const downstreamUseAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateDownstreamUseAllowed_(
      readyForDownstreamUse
    );

  const governanceRoutingRequired =
    sciipResolveAutonomousProcessorExecutionRunStateGovernanceRoutingRequired_(
      humanReviewRequired,
      closureSeverity
    );

  const dashboardUpdateRequired =
    sciipResolveAutonomousProcessorExecutionRunStateDashboardUpdateRequired_(
      readyForDashboard
    );

  const autonomousContinuationAllowed =
    sciipResolveAutonomousProcessorExecutionRunStateAutonomousContinuationAllowed_(
      readyForAutonomousDecisioning,
      autonomousAllowed,
      humanReviewRequired
    );

  const continuityMessage =
    sciipResolveAutonomousProcessorExecutionRunStateContinuityMessage_(
      resolvedRunStateDate,
      continuityStatus,
      continuityDecision,
      recommendedAction
    );

  const continuityId = 'APRSCONT_' + Utilities.getUuid();

  const continuityJson = {
    runStateDate: resolvedRunStateDate,
    continuityType: 'AUTONOMOUS_RUN_STATE_CONTINUITY',
    continuityStatus: continuityStatus,
    continuitySeverity: closureSeverity,
    continuityDecision: continuityDecision,
    nextCycleEligible: nextCycleEligible,
    downstreamUseAllowed: downstreamUseAllowed,
    governanceRoutingRequired: governanceRoutingRequired,
    dashboardUpdateRequired: dashboardUpdateRequired,
    autonomousContinuationAllowed: autonomousContinuationAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceClosureId: sciipGetRunStateContinuityInputValue_(row, ['Closure_ID']),
    sourceLedgerEntryId: sciipGetRunStateContinuityInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateContinuityInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    continuityId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_CONTINUITY',
    continuityStatus,
    closureSeverity,
    continuityDecision,
    continuityMessage,
    nextCycleEligible,
    downstreamUseAllowed,
    governanceRoutingRequired,
    dashboardUpdateRequired,
    autonomousContinuationAllowed,
    humanReviewRequired,
    closureStatus,
    closureSeverity,
    closureDecision,
    sciipGetRunStateContinuityInputValue_(row, ['Run_State_Closed']),
    closureConfirmed,
    readyForDownstreamUse,
    readyForGovernance,
    readyForDashboard,
    readyForAutonomousDecisioning,
    autonomousAllowed,
    sciipGetRunStateContinuityInputValue_(row, ['Operational_Risk']),
    recommendedAction,
    sciipGetRunStateContinuityInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateContinuityInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateContinuityInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateContinuityInputValue_(row, ['Closure_ID']),
    sciipGetRunStateContinuityInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateContinuityInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN,
    JSON.stringify(continuityJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_PROCESSOR,
    startedAt.toISOString()
  ];
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityStatus_(
  closureStatus,
  closureConfirmed,
  readyForAutonomousDecisioning,
  humanReviewRequired
) {
  const status = String(closureStatus || '').toUpperCase();
  const confirmed = String(closureConfirmed || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();

  if (confirmed !== 'TRUE') return 'CONTINUITY_BLOCKED_CLOSURE_NOT_CONFIRMED';
  if (status.indexOf('CONTROL_CONSTRAINT') !== -1) return 'CONTINUITY_CONTROLLED';
  if (review === 'TRUE') return 'CONTINUITY_REQUIRES_GOVERNANCE_REVIEW';
  if (autonomousReady === 'TRUE') return 'CONTINUITY_READY_FOR_AUTONOMOUS_CYCLE';

  return 'CONTINUITY_READY_FOR_DOWNSTREAM_USE';
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityDecision_(
  closureDecision,
  readyForDownstreamUse,
  readyForAutonomousDecisioning,
  humanReviewRequired,
  autonomousAllowed
) {
  const decision = String(closureDecision || '').toUpperCase();
  const downstream = String(readyForDownstreamUse || '').toUpperCase();
  const autonomousReady = String(readyForAutonomousDecisioning || '').toUpperCase();
  const review = String(humanReviewRequired || '').toUpperCase();
  const allowed = String(autonomousAllowed || '').toUpperCase();

  if (
    decision.indexOf('PREVENT_AUTONOMOUS') !== -1 ||
    allowed === 'FALSE'
  ) {
    return 'CARRY_FORWARD_WITH_AUTONOMOUS_HOLD';
  }

  if (review === 'TRUE') return 'CARRY_FORWARD_TO_GOVERNANCE_REVIEW';
  if (autonomousReady === 'TRUE') return 'CARRY_FORWARD_TO_NEXT_AUTONOMOUS_CYCLE';
  if (downstream === 'TRUE') return 'CARRY_FORWARD_TO_DOWNSTREAM_PROCESSORS';

  return 'CARRY_FORWARD_WITH_REVIEW_REQUIRED';
}

function sciipResolveAutonomousProcessorExecutionRunStateNextCycleEligible_(
  closureConfirmed,
  readyForDownstreamUse
) {
  return (
    String(closureConfirmed || '').toUpperCase() === 'TRUE' &&
    String(readyForDownstreamUse || '').toUpperCase() === 'TRUE'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateDownstreamUseAllowed_(
  readyForDownstreamUse
) {
  return String(readyForDownstreamUse || '').toUpperCase() === 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateGovernanceRoutingRequired_(
  humanReviewRequired,
  closureSeverity
) {
  const review = String(humanReviewRequired || '').toUpperCase();
  const severity = String(closureSeverity || '').toUpperCase();

  return review === 'TRUE' || severity === 'CRITICAL' || severity === 'HIGH';
}

function sciipResolveAutonomousProcessorExecutionRunStateDashboardUpdateRequired_(
  readyForDashboard
) {
  return String(readyForDashboard || '').toUpperCase() === 'TRUE';
}

function sciipResolveAutonomousProcessorExecutionRunStateAutonomousContinuationAllowed_(
  readyForAutonomousDecisioning,
  autonomousAllowed,
  humanReviewRequired
) {
  return (
    String(readyForAutonomousDecisioning || '').toUpperCase() === 'TRUE' &&
    String(autonomousAllowed || '').toUpperCase() !== 'FALSE' &&
    String(humanReviewRequired || '').toUpperCase() !== 'TRUE'
  );
}

function sciipResolveAutonomousProcessorExecutionRunStateContinuityMessage_(
  resolvedRunStateDate,
  continuityStatus,
  continuityDecision,
  recommendedAction
) {
  return (
    'Run state continuity established for ' +
    resolvedRunStateDate +
    ' with status ' +
    continuityStatus +
    '. Continuity decision: ' +
    continuityDecision +
    '. Recommended action: ' +
    recommendedAction +
    '.'
  );
}

function sciipReadAutonomousProcessorExecutionRunStateContinuityInputRows_(
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

function sciipFilterAutonomousProcessorExecutionRunStateContinuityRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateContinuityInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Closure_Date',
      'Continuity_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateContinuityDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateContinuityInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateContinuityInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateContinuityInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateContinuityDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityLedgerProcessorLegacy1330_();
      return sciipWrapLegacyRuntimeResult1330_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1330_(legacyResult, context, transaction) {
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
 * 1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR =
  '1330_AutonomousProcessorExecutionRunStateContinuityLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Continuity_ID',
  'Continuity_Type',
  'Continuity_Status',
  'Continuity_Severity',
  'Continuity_Decision',
  'Continuity_Message',
  'Next_Cycle_Eligible',
  'Downstream_Use_Allowed',
  'Governance_Routing_Required',
  'Dashboard_Update_Required',
  'Autonomous_Continuation_Allowed',
  'Human_Review_Required',
  'Closure_Status',
  'Closure_Severity',
  'Closure_Decision',
  'Run_State_Closed',
  'Closure_Confirmed',
  'Ready_For_Downstream_Use',
  'Ready_For_Governance',
  'Ready_For_Dashboard',
  'Ready_For_Autonomous_Decisioning',
  'Autonomous_Action_Allowed',
  'Operational_Risk',
  'Recommended_Action',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Closure_ID',
  'Source_Ledger_Entry_ID',
  'Source_Continuity_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateContinuityLedgerProcessorLegacy1330_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
        SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuityLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const continuityRows =
    sciipReadAutonomousProcessorExecutionRunStateContinuityLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateContinuityLedgerRowsByDate_(
      continuityRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestContinuity =
    sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateContinuityLedgerEntry_(
      latestContinuity,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuityLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

function sciipBuildAutonomousProcessorExecutionRunStateContinuityLedgerEntry_(
  continuity,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSCONTL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    continuityId: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_ID'
    ]),
    continuityType: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_Type'
    ]),
    continuityStatus: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_Status'
    ]),
    continuitySeverity: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_Severity'
    ]),
    continuityDecision: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Continuity_Decision'
    ]),
    nextCycleEligible: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Next_Cycle_Eligible'
    ]),
    downstreamUseAllowed: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Downstream_Use_Allowed']
    ),
    governanceRoutingRequired: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Governance_Routing_Required']
    ),
    dashboardUpdateRequired: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Dashboard_Update_Required']
    ),
    autonomousContinuationAllowed: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Autonomous_Continuation_Allowed']
    ),
    humanReviewRequired: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Human_Review_Required']
    ),
    sourceContinuityBusinessKey: sciipGetRunStateContinuityLedgerInputValue_(
      continuity,
      ['Business_Key']
    ),
    sourceBusinessKey: sciipGetRunStateContinuityLedgerInputValue_(continuity, [
      'Source_Business_Key'
    ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_ID']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Type']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Status']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Severity']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Decision']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Continuity_Message']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Next_Cycle_Eligible']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Downstream_Use_Allowed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Governance_Routing_Required']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Dashboard_Update_Required']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Autonomous_Continuation_Allowed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Human_Review_Required']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Closure_Status']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Closure_Severity']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Closure_Decision']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Run_State_Closed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Closure_Confirmed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Ready_For_Downstream_Use']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Ready_For_Governance']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Ready_For_Dashboard']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Ready_For_Autonomous_Decisioning']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Autonomous_Action_Allowed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Operational_Risk']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Recommended_Action']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Governance_Posture']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Orchestration_Posture']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Decisioning_Posture']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Signals_Reviewed']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Critical_Signal_Count']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['High_Signal_Count']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Medium_Signal_Count']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Low_Signal_Count']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Source_Closure_ID']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Source_Ledger_Entry_ID']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Business_Key']),
    sciipGetRunStateContinuityLedgerInputValue_(continuity, ['Source_Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

function sciipReadAutonomousProcessorExecutionRunStateContinuityLedgerInputRows_(
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

function sciipFilterAutonomousProcessorExecutionRunStateContinuityLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateContinuityLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_CONTINUITY_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Continuity_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateContinuityLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateContinuityLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateContinuityLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateContinuityLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateContinuityLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateContinuityLedgerDateKey_(value) {
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

function sciipTestAutonomousProcessorExecutionRunStateContinuityLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_RUNTIME_LEDGER',

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
          originalProcessor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessorLegacy1340_();
      return sciipWrapLegacyRuntimeResult1340_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1340_(legacyResult, context, transaction) {
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

/**
 * 1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST
 */

const SCIIP_1340_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_LEDGER';
const SCIIP_1340_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';
const SCIIP_1340_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessorLegacy1340_() {
  const ss = sciipGetSpreadsheet_();
  const processingDate = sciipResolveLatestProcessingDate_();
  const dateKey = sciip1340ResolveDateKey_(processingDate);
  const businessKey = `${SCIIP_1340_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1340EnsureSheet_(ss, SCIIP_1340_TARGET_SHEET, sciip1340TargetHeaders_());

  if (sciip1340BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1340_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1340HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1340Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1340Get_(row, sourceMap, [
      'Date_Key',
      'Ledger_Date',
      'Continuity_Date',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1340NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  let successCount = 0;
  let duplicateCount = 0;
  let failedCount = 0;
  const processors = {};
  const sourceBusinessKeys = [];

  relevantRows.forEach(row => {
    const status = String(sciip1340Get_(row, sourceMap, ['Status', 'status']) || '').toUpperCase();
    const skippedDuplicate = Number(sciip1340Get_(row, sourceMap, ['Skipped_Duplicate', 'skippedDuplicate']) || 0);
    const processor = sciip1340Get_(row, sourceMap, ['Processor', 'processor']);
    const sourceBusinessKey = sciip1340Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (processor) processors[String(processor)] = true;
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    if (status === 'SUCCESS') successCount++;
    if (skippedDuplicate > 0) duplicateCount++;
    if (status === 'FAILED' || status === 'ERROR') failedCount++;
  });

  const digestSummary =
    `Continuity ledger digest for ${dateKey}: ` +
    `${relevantRows.length} ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${successCount} successful; ${duplicateCount} duplicate/idempotent; ${failedCount} failed.`;

  const digestId = `APRSC_DIGEST_${Utilities.getUuid()}`;

  targetSheet.appendRow([
    digestId,
    businessKey,
    dateKey,
    SCIIP_1340_SOURCE_SHEET,
    relevantRows.length,
    successCount,
    duplicateCount,
    failedCount,
    Object.keys(processors).join(', '),
    sourceBusinessKeys.join(', '),
    digestSummary,
    failedCount > 0 ? 'REVIEW_REQUIRED' : 'SUCCESS',
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1340_AutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDigestProcessor',
    result
  }));
  return result;
}

function sciip1340TargetHeaders_() {
  return [
    'Digest_Id',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Ledger_Entries_Reviewed',
    'Successful_Continuity_Ledger_Entries',
    'Duplicate_Continuity_Ledger_Entries',
    'Failed_Continuity_Ledger_Entries',
    'Source_Processors',
    'Source_Business_Keys',
    'Digest_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1340EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1340HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1340Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1340BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1340_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1340HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1340ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1340NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessorLegacy1350_();
      return sciipWrapLegacyRuntimeResult1350_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1350_(legacyResult, context, transaction) {
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

/**
 * 1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER
 */

const SCIIP_1350_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST';
const SCIIP_1350_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER';
const SCIIP_1350_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessorLegacy1350_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1350ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1350_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1350EnsureSheet_(ss, SCIIP_1350_TARGET_SHEET, sciip1350TargetHeaders_());

  if (sciip1350BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1350_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1350HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1350Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1350Get_(row, sourceMap, [
      'Digest_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1350NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceBusinessKeys = [];
  const sourceDigestIds = [];
  const sourceStatuses = {};
  let totalLedgerEntriesReviewed = 0;
  let totalSuccessfulEntries = 0;
  let totalDuplicateEntries = 0;
  let totalFailedEntries = 0;

  relevantRows.forEach(row => {
    const sourceBusinessKey = sciip1350Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const digestId = sciip1350Get_(row, sourceMap, ['Digest_Id', 'Digest_ID', 'digestId']);
    const status = String(sciip1350Get_(row, sourceMap, ['Status', 'status']) || '').toUpperCase();

    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (digestId) sourceDigestIds.push(String(digestId));
    if (status) sourceStatuses[status] = true;

    totalLedgerEntriesReviewed += Number(sciip1350Get_(row, sourceMap, ['Ledger_Entries_Reviewed']) || 0);
    totalSuccessfulEntries += Number(sciip1350Get_(row, sourceMap, ['Successful_Continuity_Ledger_Entries']) || 0);
    totalDuplicateEntries += Number(sciip1350Get_(row, sourceMap, ['Duplicate_Continuity_Ledger_Entries']) || 0);
    totalFailedEntries += Number(sciip1350Get_(row, sourceMap, ['Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_DIGEST_LEDGER_${Utilities.getUuid()}`;

  const ledgerSummary =
    `Continuity digest ledger entry for ${dateKey}: ` +
    `${relevantRows.length} digest entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `${totalLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${totalSuccessfulEntries} successful; ${totalDuplicateEntries} duplicate/idempotent; ${totalFailedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1350_SOURCE_SHEET,
    relevantRows.length,
    sourceDigestIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(sourceStatuses).join(', '),
    totalLedgerEntriesReviewed,
    totalSuccessfulEntries,
    totalDuplicateEntries,
    totalFailedEntries,
    ledgerSummary,
    totalFailedEntries > 0 ? 'REVIEW_REQUIRED' : 'SUCCESS',
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1350_AutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDigestLedgerProcessor',
    result
  }));
  return result;
}

function sciip1350TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Digest_Entries_Reviewed',
    'Source_Digest_Ids',
    'Source_Business_Keys',
    'Source_Statuses',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1350EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1350HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1350Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1350BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1350_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1350HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1350ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1350NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

function sciip1350ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1350_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1350ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1350HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1350Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const digestDate = sciip1350Get_(row, map, ['Digest_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1350NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1350NormalizeDateKey_(digestDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1350ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_RUNTIME_LEDGER',

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
          originalProcessor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalProcessorLegacy1360_();
      return sciipWrapLegacyRuntimeResult1360_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1360_(legacyResult, context, transaction) {
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

/**
 * 1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL
 */

const SCIIP_1360_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DIGEST_LEDGER';
const SCIIP_1360_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL';
const SCIIP_1360_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalProcessorLegacy1360_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1360ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1360_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1360EnsureSheet_(ss, SCIIP_1360_TARGET_SHEET, sciip1360TargetHeaders_());

  if (sciip1360BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1360_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1360HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1360Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1360Get_(row, sourceMap, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1360NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const sourceStatuses = {};

  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1360Get_(row, sourceMap, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1360Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const status = String(sciip1360Get_(row, sourceMap, ['Status', 'status']) || '').toUpperCase();

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (status) sourceStatuses[status] = true;

    digestEntriesReviewed += Number(sciip1360Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1360Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1360Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1360Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1360Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const signalId = `APRSC_SIGNAL_${Utilities.getUuid()}`;

  let signalType = 'CONTINUITY_HEALTHY';
  let severity = 'INFO';
  let recommendedAction = 'No action required. Continue autonomous processor chain.';
  let signalStatus = 'SUCCESS';

  if (failedEntries > 0 || Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1) {
    signalType = 'CONTINUITY_REVIEW_REQUIRED';
    severity = 'WARN';
    recommendedAction = 'Review failed or review-required continuity digest ledger entries before downstream promotion.';
    signalStatus = 'REVIEW_REQUIRED';
  } else if (underlyingLedgerEntriesReviewed === 0) {
    signalType = 'CONTINUITY_NO_UNDERLYING_ACTIVITY';
    severity = 'LOW';
    recommendedAction = 'No immediate action required. Confirm upstream continuity chain if this persists.';
    signalStatus = 'SUCCESS';
  }

  const signalSummary =
    `Continuity signal for ${dateKey}: ${signalType}. ` +
    `${relevantRows.length} digest ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${digestEntriesReviewed} digest entries; ` +
    `${underlyingLedgerEntriesReviewed} underlying ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    signalId,
    businessKey,
    dateKey,
    SCIIP_1360_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(sourceStatuses).join(', '),
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    signalType,
    severity,
    signalSummary,
    recommendedAction,
    signalStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1360_AutonomousProcessorExecutionRunStateContinuitySignalProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalProcessor',
    result
  }));
  return result;
}

function sciip1360TargetHeaders_() {
  return [
    'Signal_Id',
    'Business_Key',
    'Signal_Date',
    'Source_Sheet',
    'Source_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Source_Statuses',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Signal_Type',
    'Severity',
    'Signal_Summary',
    'Recommended_Action',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1360EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1360HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1360Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1360BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1360_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1360HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1360ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1360_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1360ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1360HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1360Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1360Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1360NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1360NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1360ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1360ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1360NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessorLegacy1370_();
      return sciipWrapLegacyRuntimeResult1370_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1370_(legacyResult, context, transaction) {
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

/**
 * 1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER
 */

const SCIIP_1370_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL';
const SCIIP_1370_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER';
const SCIIP_1370_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessorLegacy1370_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1370ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1370_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1370EnsureSheet_(ss, SCIIP_1370_TARGET_SHEET, sciip1370TargetHeaders_());

  if (sciip1370BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1370_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1370HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1370Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1370Get_(row, sourceMap, [
      'Signal_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1370NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSignalIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const statuses = {};

  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const signalId = sciip1370Get_(row, sourceMap, ['Signal_Id', 'Signal_ID', 'signalId']);
    const sourceBusinessKey = sciip1370Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const signalType = sciip1370Get_(row, sourceMap, ['Signal_Type', 'signalType']);
    const severity = sciip1370Get_(row, sourceMap, ['Severity', 'severity']);
    const status = sciip1370Get_(row, sourceMap, ['Status', 'status']);

    if (signalId) sourceSignalIds.push(String(signalId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (signalType) signalTypes[String(signalType)] = true;
    if (severity) severities[String(severity)] = true;
    if (status) statuses[String(status)] = true;

    sourceLedgerEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1370Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1370Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_SIGNAL_LEDGER_${Utilities.getUuid()}`;

  const ledgerSummary =
    `Continuity signal ledger entry for ${dateKey}: ` +
    `${relevantRows.length} signal entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `signal types: ${Object.keys(signalTypes).join(', ') || 'NONE'}; ` +
    `severity: ${Object.keys(severities).join(', ') || 'NONE'}; ` +
    `${failedEntries} failed underlying continuity entries.`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(statuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1370_SOURCE_SHEET,
    relevantRows.length,
    sourceSignalIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(statuses).join(', '),
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1370_AutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalLedgerProcessor',
    result
  }));
  return result;
}

function sciip1370TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Signal_Entries_Reviewed',
    'Source_Signal_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1370EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1370HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1370Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1370BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1370_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1370HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1370ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1370_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1370ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1370HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1370Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const signalDate = sciip1370Get_(row, map, ['Signal_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1370NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1370NormalizeDateKey_(signalDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1370ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1370ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1370NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_RUNTIME_LEDGER',

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
          originalProcessor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessorLegacy1380_();
      return sciipWrapLegacyRuntimeResult1380_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1380_(legacyResult, context, transaction) {
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

/**
 * 1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST
 */

const SCIIP_1380_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_LEDGER';
const SCIIP_1380_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST';
const SCIIP_1380_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessorLegacy1380_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1380ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1380_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1380EnsureSheet_(ss, SCIIP_1380_TARGET_SHEET, sciip1380TargetHeaders_());

  if (sciip1380BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1380_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1380HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1380Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1380Get_(row, sourceMap, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1380NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let signalEntriesReviewed = 0;
  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1380Get_(row, sourceMap, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1380Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowSignalTypes = sciip1380Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']);
    const rowSeverities = sciip1380Get_(row, sourceMap, ['Severities', 'Severity']);
    const rowStatuses = sciip1380Get_(row, sourceMap, ['Source_Statuses', 'Status']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1380CollectList_(signalTypes, rowSignalTypes);
    sciip1380CollectList_(severities, rowSeverities);
    sciip1380CollectList_(sourceStatuses, rowStatuses);

    signalEntriesReviewed += Number(sciip1380Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    sourceLedgerEntriesReviewed += Number(sciip1380Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1380Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1380Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1380Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1380Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1380Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const digestId = `APRSC_SIGNAL_DIGEST_${Utilities.getUuid()}`;

  const digestStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const digestSummary =
    `Continuity signal digest for ${dateKey}: ` +
    `${relevantRows.length} signal ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `signal types: ${Object.keys(signalTypes).join(', ') || 'NONE'}; ` +
    `severities: ${Object.keys(severities).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    digestId,
    businessKey,
    dateKey,
    SCIIP_1380_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    signalEntriesReviewed,
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    digestSummary,
    digestStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1380_AutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalDigestsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalDigestProcessor',
    result
  }));
  return result;
}

function sciip1380TargetHeaders_() {
  return [
    'Digest_Id',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Signal_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Signal_Entries_Reviewed',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Digest_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1380EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1380HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1380Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1380CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1380BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1380_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1380HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1380ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1380_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1380ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1380HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1380Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1380Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1380NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1380NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1380ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1380ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1380NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessorLegacy1390_();
      return sciipWrapLegacyRuntimeResult1390_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1390_(legacyResult, context, transaction) {
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

/**
 * 1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER
 */

const SCIIP_1390_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST';
const SCIIP_1390_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER';
const SCIIP_1390_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessorLegacy1390_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1390ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1390_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1390EnsureSheet_(ss, SCIIP_1390_TARGET_SHEET, sciip1390TargetHeaders_());

  if (sciip1390BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1390_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1390HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1390Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1390Get_(row, sourceMap, [
      'Digest_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1390NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySignalDigestLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceDigestIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const digestId = sciip1390Get_(row, sourceMap, ['Digest_Id', 'Digest_ID', 'digestId']);
    const sourceBusinessKey = sciip1390Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (digestId) sourceDigestIds.push(String(digestId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1390CollectList_(signalTypes, sciip1390Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1390CollectList_(severities, sciip1390Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1390CollectList_(sourceStatuses, sciip1390Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    signalLedgerEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    sourceLedgerEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1390Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1390Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1390Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1390Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_SIGNAL_DIGEST_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity signal digest ledger entry for ${dateKey}: ` +
    `${relevantRows.length} signal digest entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `signal types: ${Object.keys(signalTypes).join(', ') || 'NONE'}; ` +
    `severities: ${Object.keys(severities).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1390_SOURCE_SHEET,
    relevantRows.length,
    sourceDigestIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1390_AutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySignalDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySignalDigestLedgerProcessor',
    result
  }));
  return result;
}

function sciip1390TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Signal_Digest_Entries_Reviewed',
    'Source_Digest_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1390EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1390HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1390Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1390CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1390BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1390_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1390HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1390ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1390_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1390ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1390HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1390Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const digestDate = sciip1390Get_(row, map, ['Digest_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1390NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1390NormalizeDateKey_(digestDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1390ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1390ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1390NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_RUNTIME_LEDGER',

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
          originalProcessor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessorLegacy1400_();
      return sciipWrapLegacyRuntimeResult1400_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1400_(legacyResult, context, transaction) {
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

/**
 * 1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER
 */

const SCIIP_1400_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SIGNAL_DIGEST_LEDGER';
const SCIIP_1400_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER';
const SCIIP_1400_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessorLegacy1400_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1400ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1400_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1400EnsureSheet_(ss, SCIIP_1400_TARGET_SHEET, sciip1400TargetHeaders_());

  if (sciip1400BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterUpdatesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1400_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterUpdatesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1400HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1400Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1400Get_(row, sourceMap, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1400NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterUpdatesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let signalDigestEntriesReviewed = 0;
  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1400Get_(row, sourceMap, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1400Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1400CollectList_(signalTypes, sciip1400Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1400CollectList_(severities, sciip1400Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1400CollectList_(sourceStatuses, sciip1400Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    signalDigestEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Signal_Digest_Entries_Reviewed']) || 0);
    signalLedgerEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    sourceLedgerEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1400Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1400Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1400Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1400Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const commandCenterId = `APRSC_COMMAND_CENTER_${Utilities.getUuid()}`;

  let operationalState = 'CONTINUITY_HEALTHY';
  let executiveStatus = 'GREEN';
  let priority = 'NORMAL';
  let recommendedAction = 'No action required. Continuity chain is healthy and available for downstream processors.';

  if (failedEntries > 0 ||
      Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
      Object.keys(signalTypes).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1) {
    operationalState = 'CONTINUITY_REVIEW_REQUIRED';
    executiveStatus = 'YELLOW';
    priority = 'ELEVATED';
    recommendedAction = 'Review continuity signal digest ledger before downstream continuity reporting or promotion.';
  } else if (underlyingLedgerEntriesReviewed === 0) {
    operationalState = 'CONTINUITY_NO_UNDERLYING_ACTIVITY';
    executiveStatus = 'BLUE';
    priority = 'LOW';
    recommendedAction = 'No immediate action required. Monitor if no underlying continuity activity persists.';
  }

  const commandCenterSummary =
    `Run state continuity command center update for ${dateKey}: ${operationalState}. ` +
    `${relevantRows.length} signal digest ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    commandCenterId,
    businessKey,
    dateKey,
    SCIIP_1400_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    operationalState,
    executiveStatus,
    priority,
    signalDigestEntriesReviewed,
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    commandCenterSummary,
    recommendedAction,
    operationalState === 'CONTINUITY_REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'SUCCESS',
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1400_AutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityCommandCenterUpdatesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityCommandCenterProcessor',
    result
  }));
  return result;
}

function sciip1400TargetHeaders_() {
  return [
    'Command_Center_Update_Id',
    'Business_Key',
    'Command_Center_Date',
    'Source_Sheet',
    'Source_Signal_Digest_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Operational_State',
    'Executive_Status',
    'Priority',
    'Signal_Digest_Entries_Reviewed',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Command_Center_Summary',
    'Recommended_Action',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1400EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1400HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1400Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1400CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1400BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1400_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1400HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1400ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1400_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1400ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1400HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1400Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1400Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1400NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1400NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1400ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1400ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1400NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessorLegacy1410_();
      return sciipWrapLegacyRuntimeResult1410_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1410_(legacyResult, context, transaction) {
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

/**
 * 1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER
 */

const SCIIP_1410_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER';
const SCIIP_1410_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER';
const SCIIP_1410_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessorLegacy1410_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1410ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1410_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1410EnsureSheet_(ss, SCIIP_1410_TARGET_SHEET, sciip1410TargetHeaders_());

  if (sciip1410BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1410_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1410HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1410Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1410Get_(row, sourceMap, [
      'Command_Center_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1410NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityCommandCenterLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceCommandCenterIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const sourceStatuses = {};
  const signalTypes = {};
  const severities = {};

  let sourceSignalDigestLedgerEntriesReviewed = 0;
  let signalDigestEntriesReviewed = 0;
  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let sourceLedgerEntriesReviewed = 0;
  let digestEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const recommendedActions = [];

  relevantRows.forEach(row => {
    const commandCenterId = sciip1410Get_(row, sourceMap, [
      'Command_Center_Update_Id',
      'Command_Center_Id',
      'CommandCenter_Id'
    ]);

    const sourceBusinessKey = sciip1410Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (commandCenterId) sourceCommandCenterIds.push(String(commandCenterId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1410CollectList_(signalTypes, sciip1410Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1410CollectList_(severities, sciip1410Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1410CollectList_(sourceStatuses, sciip1410Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    sciip1410CollectList_(operationalStates, sciip1410Get_(row, sourceMap, ['Operational_State']));
    sciip1410CollectList_(executiveStatuses, sciip1410Get_(row, sourceMap, ['Executive_Status']));
    sciip1410CollectList_(priorities, sciip1410Get_(row, sourceMap, ['Priority']));

    const recommendedAction = sciip1410Get_(row, sourceMap, ['Recommended_Action']);
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    sourceSignalDigestLedgerEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Source_Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    signalDigestEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Signal_Digest_Entries_Reviewed']) || 0);
    signalLedgerEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    sourceLedgerEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Source_Ledger_Entries_Reviewed']) || 0);
    digestEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Digest_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1410Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1410Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1410Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1410Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_COMMAND_CENTER_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity command center ledger entry for ${dateKey}: ` +
    `${relevantRows.length} command center update${relevantRows.length === 1 ? '' : 's'} recorded; ` +
    `operational state: ${Object.keys(operationalStates).join(', ') || 'NONE'}; ` +
    `executive status: ${Object.keys(executiveStatuses).join(', ') || 'NONE'}; ` +
    `priority: ${Object.keys(priorities).join(', ') || 'NONE'}; ` +
    `${failedEntries} failed underlying continuity entries.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1410_SOURCE_SHEET,
    relevantRows.length,
    sourceCommandCenterIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    sourceSignalDigestLedgerEntriesReviewed,
    signalDigestEntriesReviewed,
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    sourceLedgerEntriesReviewed,
    digestEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    ledgerSummary,
    recommendedActions.join(' | '),
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1410_AutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityCommandCenterLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityCommandCenterLedgerProcessor',
    result
  }));
  return result;
}

function sciip1410TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Command_Center_Updates_Reviewed',
    'Source_Command_Center_Update_Ids',
    'Source_Business_Keys',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Source_Signal_Digest_Ledger_Entries_Reviewed',
    'Signal_Digest_Entries_Reviewed',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Source_Ledger_Entries_Reviewed',
    'Digest_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Ledger_Summary',
    'Recommended_Actions',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1410EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1410HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1410Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1410CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1410BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1410_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1410HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1410ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1410_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1410ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1410HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1410Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const commandCenterDate = sciip1410Get_(row, map, [
      'Command_Center_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1410NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1410NormalizeDateKey_(commandCenterDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1410ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1410ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1410NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_RUNTIME_LEDGER',

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
          originalProcessor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessorLegacy1420_();
      return sciipWrapLegacyRuntimeResult1420_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1420_(legacyResult, context, transaction) {
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

/**
 * 1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY
 */

const SCIIP_1420_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_COMMAND_CENTER_LEDGER';
const SCIIP_1420_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY';
const SCIIP_1420_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY';

function sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessorLegacy1420_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1420ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1420_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1420EnsureSheet_(ss, SCIIP_1420_TARGET_SHEET, sciip1420TargetHeaders_());

  if (sciip1420BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummariesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1420_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummariesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1420HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1420Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1420Get_(row, sourceMap, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1420NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummariesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let signalDigestEntriesReviewed = 0;
  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const recommendedActions = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1420Get_(row, sourceMap, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1420Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1420CollectList_(operationalStates, sciip1420Get_(row, sourceMap, ['Operational_States', 'Operational_State']));
    sciip1420CollectList_(executiveStatuses, sciip1420Get_(row, sourceMap, ['Executive_Statuses', 'Executive_Status']));
    sciip1420CollectList_(priorities, sciip1420Get_(row, sourceMap, ['Priorities', 'Priority']));
    sciip1420CollectList_(signalTypes, sciip1420Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1420CollectList_(severities, sciip1420Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1420CollectList_(sourceStatuses, sciip1420Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    const recommendedAction = sciip1420Get_(row, sourceMap, ['Recommended_Actions', 'Recommended_Action']);
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    commandCenterUpdatesReviewed += Number(sciip1420Get_(row, sourceMap, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Source_Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    signalDigestEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Signal_Digest_Entries_Reviewed']) || 0);
    signalLedgerEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1420Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1420Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1420Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1420Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const summaryId = `APRSC_EXEC_SUMMARY_${Utilities.getUuid()}`;

  const executiveStatus = sciip1420ResolveExecutiveStatus_(executiveStatuses, failedEntries, sourceStatuses, operationalStates);
  const priority = sciip1420ResolvePriority_(priorities, executiveStatus);
  const operationalState = Object.keys(operationalStates).join(', ') || 'CONTINUITY_UNKNOWN';

  const headline =
    executiveStatus === 'GREEN'
      ? 'Run state continuity remains healthy.'
      : executiveStatus === 'YELLOW'
        ? 'Run state continuity requires review.'
        : 'Run state continuity has limited or no underlying activity.';

  const summaryText =
    `${headline} For ${dateKey}, SCIIP_OS reviewed ${relevantRows.length} command center ledger ` +
    `entr${relevantRows.length === 1 ? 'y' : 'ies'}, ${commandCenterUpdatesReviewed} command center update${commandCenterUpdatesReviewed === 1 ? '' : 's'}, ` +
    `and ${underlyingLedgerEntriesReviewed} underlying continuity ledger entr${underlyingLedgerEntriesReviewed === 1 ? 'y' : 'ies'}. ` +
    `Results: ${successfulEntries} successful, ${duplicateEntries} duplicate/idempotent, ${failedEntries} failed.`;

  const recommendedAction =
    recommendedActions.length
      ? recommendedActions.join(' | ')
      : executiveStatus === 'GREEN'
        ? 'No action required. Continue autonomous continuity chain.'
        : 'Review continuity chain before downstream reporting or promotion.';

  const status = executiveStatus === 'YELLOW' ? 'REVIEW_REQUIRED' : 'SUCCESS';

  targetSheet.appendRow([
    summaryId,
    businessKey,
    dateKey,
    SCIIP_1420_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    operationalState,
    executiveStatus,
    priority,
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    signalDigestEntriesReviewed,
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    headline,
    summaryText,
    recommendedAction,
    status,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1420_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityExecutiveSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryProcessor',
    result
  }));
  return result;
}

function sciip1420TargetHeaders_() {
  return [
    'Executive_Summary_Id',
    'Business_Key',
    'Summary_Date',
    'Source_Sheet',
    'Command_Center_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Operational_State',
    'Executive_Status',
    'Priority',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Signal_Digest_Entries_Reviewed',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Executive_Headline',
    'Executive_Summary',
    'Recommended_Action',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1420ResolveExecutiveStatus_(executiveStatuses, failedEntries, sourceStatuses, operationalStates) {
  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1
  ) {
    return 'YELLOW';
  }

  if (
    Object.keys(operationalStates).indexOf('CONTINUITY_NO_UNDERLYING_ACTIVITY') !== -1 ||
    Object.keys(executiveStatuses).indexOf('BLUE') !== -1
  ) {
    return 'BLUE';
  }

  return 'GREEN';
}

function sciip1420ResolvePriority_(priorities, executiveStatus) {
  if (Object.keys(priorities).indexOf('ELEVATED') !== -1 || executiveStatus === 'YELLOW') {
    return 'ELEVATED';
  }

  if (Object.keys(priorities).indexOf('LOW') !== -1 || executiveStatus === 'BLUE') {
    return 'LOW';
  }

  return 'NORMAL';
}

function sciip1420EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1420HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1420Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1420CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1420BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1420_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1420HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1420ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1420_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1420ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1420HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1420Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1420Get_(row, map, [
      'Ledger_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1420NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1420NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1420ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1420ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1420NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessorLegacy1430_();
      return sciipWrapLegacyRuntimeResult1430_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1430_(legacyResult, context, transaction) {
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

/**
 * 1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER
 */

const SCIIP_1430_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY';
const SCIIP_1430_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER';
const SCIIP_1430_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessorLegacy1430_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1430ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1430_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1430EnsureSheet_(ss, SCIIP_1430_TARGET_SHEET, sciip1430TargetHeaders_());

  if (sciip1430BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1430_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceValues = sourceSheet.getDataRange().getValues();
  const sourceHeaders = sourceValues[0];
  const sourceRows = sourceValues.slice(1);
  const sourceMap = sciip1430HeaderMap_(sourceHeaders);

  const relevantRows = sourceRows.filter(row => {
    const rowBusinessKey = sciip1430Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1430Get_(row, sourceMap, [
      'Summary_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1430NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSummaryIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let signalDigestEntriesReviewed = 0;
  let signalLedgerEntriesReviewed = 0;
  let signalEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const headlines = [];
  const summaries = [];
  const recommendedActions = [];

  relevantRows.forEach(row => {
    const summaryId = sciip1430Get_(row, sourceMap, [
      'Executive_Summary_Id',
      'Summary_Id',
      'ExecutiveSummary_Id'
    ]);

    const sourceBusinessKey = sciip1430Get_(row, sourceMap, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (summaryId) sourceSummaryIds.push(String(summaryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1430CollectList_(operationalStates, sciip1430Get_(row, sourceMap, ['Operational_State', 'Operational_States']));
    sciip1430CollectList_(executiveStatuses, sciip1430Get_(row, sourceMap, ['Executive_Status', 'Executive_Statuses']));
    sciip1430CollectList_(priorities, sciip1430Get_(row, sourceMap, ['Priority', 'Priorities']));
    sciip1430CollectList_(signalTypes, sciip1430Get_(row, sourceMap, ['Signal_Types', 'Signal_Type']));
    sciip1430CollectList_(severities, sciip1430Get_(row, sourceMap, ['Severities', 'Severity']));
    sciip1430CollectList_(sourceStatuses, sciip1430Get_(row, sourceMap, ['Source_Statuses', 'Status']));

    const headline = sciip1430Get_(row, sourceMap, ['Executive_Headline']);
    const summary = sciip1430Get_(row, sourceMap, ['Executive_Summary']);
    const recommendedAction = sciip1430Get_(row, sourceMap, ['Recommended_Action']);

    if (headline) headlines.push(String(headline));
    if (summary) summaries.push(String(summary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    commandCenterLedgerEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1430Get_(row, sourceMap, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    signalDigestEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Signal_Digest_Entries_Reviewed']) || 0);
    signalLedgerEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Signal_Ledger_Entries_Reviewed']) || 0);
    signalEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Signal_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1430Get_(row, sourceMap, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1430Get_(row, sourceMap, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1430Get_(row, sourceMap, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1430Get_(row, sourceMap, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_EXEC_SUMMARY_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity executive summary ledger entry for ${dateKey}: ` +
    `${relevantRows.length} executive summar${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `executive status: ${Object.keys(executiveStatuses).join(', ') || 'NONE'}; ` +
    `priority: ${Object.keys(priorities).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1430_SOURCE_SHEET,
    relevantRows.length,
    sourceSummaryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    signalDigestEntriesReviewed,
    signalLedgerEntriesReviewed,
    signalEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    headlines.join(' | '),
    summaries.join(' | '),
    recommendedActions.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1430_AutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityExecutiveSummaryLedgerProcessor',
    result
  }));
  return result;
}

function sciip1430TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Executive_Summaries_Reviewed',
    'Source_Executive_Summary_Ids',
    'Source_Business_Keys',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Signal_Digest_Entries_Reviewed',
    'Signal_Ledger_Entries_Reviewed',
    'Signal_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Executive_Headlines',
    'Executive_Summaries',
    'Recommended_Actions',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1430EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1430HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1430Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1430CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1430BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1430_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1430HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1430ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1430_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1430ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1430HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1430Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const summaryDate = sciip1430Get_(row, map, [
      'Summary_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1430NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1430NormalizeDateKey_(summaryDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1430ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1430ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1430NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_RUNTIME_LEDGER',

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
          originalProcessor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessorLegacy1440_();
      return sciipWrapLegacyRuntimeResult1440_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1440_(legacyResult, context, transaction) {
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

/**
 * 1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF
 */

const SCIIP_1440_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_EXECUTIVE_SUMMARY_LEDGER';
const SCIIP_1440_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF';
const SCIIP_1440_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessorLegacy1440_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1440ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1440_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

const targetSheet = sciip1440EnsureSheet_(ss, SCIIP_1440_TARGET_SHEET, SCIIP_1440_TARGET_HEADERS_());
  if (sciip1440BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1440_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1440HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1440Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1440Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1440NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let executiveSummariesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const headlines = [];
  const summaries = [];
  const recommendedActions = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1440Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1440Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1440CollectList_(operationalStates, sciip1440Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1440CollectList_(executiveStatuses, sciip1440Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1440CollectList_(priorities, sciip1440Get_(row, map, ['Priorities', 'Priority']));
    sciip1440CollectList_(signalTypes, sciip1440Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1440CollectList_(severities, sciip1440Get_(row, map, ['Severities', 'Severity']));
    sciip1440CollectList_(sourceStatuses, sciip1440Get_(row, map, ['Source_Statuses', 'Status']));

    const headline = sciip1440Get_(row, map, ['Executive_Headlines', 'Executive_Headline']);
    const summary = sciip1440Get_(row, map, ['Executive_Summaries', 'Executive_Summary']);
    const recommendedAction = sciip1440Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);

    if (headline) headlines.push(String(headline));
    if (summary) summaries.push(String(summary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    executiveSummariesReviewed += Number(sciip1440Get_(row, map, ['Executive_Summaries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1440Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1440Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1440Get_(row, map, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1440Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1440Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1440Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1440Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const executiveStatus = sciip1440ResolveExecutiveStatus_(executiveStatuses, failedEntries, sourceStatuses, operationalStates);
  const priority = sciip1440ResolvePriority_(priorities, executiveStatus);
  const operationalState = Object.keys(operationalStates).join(', ') || 'CONTINUITY_UNKNOWN';

  const briefId = `APRSC_DAILY_BRIEF_${Utilities.getUuid()}`;

  const title = `Run State Continuity Daily Brief — ${dateKey}`;

  const headline =
    headlines.length
      ? headlines[0]
      : executiveStatus === 'GREEN'
        ? 'Run state continuity remains healthy.'
        : executiveStatus === 'YELLOW'
          ? 'Run state continuity requires review.'
          : 'Run state continuity has limited or no underlying activity.';

  const dailyBrief =
    `${headline} ` +
    `Operational State: ${operationalState}. ` +
    `Executive Status: ${executiveStatus}. Priority: ${priority}. ` +
    `Reviewed ${relevantRows.length} executive summary ledger entr${relevantRows.length === 1 ? 'y' : 'ies'}, ` +
    `${executiveSummariesReviewed} executive summar${executiveSummariesReviewed === 1 ? 'y' : 'ies'}, ` +
    `${commandCenterUpdatesReviewed} command center update${commandCenterUpdatesReviewed === 1 ? '' : 's'}, ` +
    `and ${underlyingLedgerEntriesReviewed} underlying continuity ledger entr${underlyingLedgerEntriesReviewed === 1 ? 'y' : 'ies'}. ` +
    `Results: ${successfulEntries} successful, ${duplicateEntries} duplicate/idempotent, ${failedEntries} failed.`;

  const recommendedAction =
    recommendedActions.length
      ? recommendedActions.join(' | ')
      : executiveStatus === 'GREEN'
        ? 'No action required. Continue autonomous continuity chain.'
        : 'Review continuity chain before downstream reporting or promotion.';

  const status = executiveStatus === 'YELLOW' ? 'REVIEW_REQUIRED' : 'SUCCESS';

  targetSheet.appendRow([
    briefId,
    businessKey,
    dateKey,
    SCIIP_1440_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    title,
    headline,
    dailyBrief,
    operationalState,
    executiveStatus,
    priority,
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    executiveSummariesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    recommendedAction,
    status,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1440_AutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDailyBriefProcessor',
    result
  }));
  return result;
}

function SCIIP_1440_TARGET_HEADERS_() {
  return [
    'Daily_Brief_Id',
    'Business_Key',
    'Brief_Date',
    'Source_Sheet',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Brief_Title',
    'Brief_Headline',
    'Daily_Brief',
    'Operational_State',
    'Executive_Status',
    'Priority',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Executive_Summaries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Recommended_Action',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1440ResolveExecutiveStatus_(executiveStatuses, failedEntries, sourceStatuses, operationalStates) {
  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1
  ) {
    return 'YELLOW';
  }

  if (
    Object.keys(operationalStates).indexOf('CONTINUITY_NO_UNDERLYING_ACTIVITY') !== -1 ||
    Object.keys(executiveStatuses).indexOf('BLUE') !== -1
  ) {
    return 'BLUE';
  }

  return 'GREEN';
}

function sciip1440ResolvePriority_(priorities, executiveStatus) {
  if (Object.keys(priorities).indexOf('ELEVATED') !== -1 || executiveStatus === 'YELLOW') {
    return 'ELEVATED';
  }

  if (Object.keys(priorities).indexOf('LOW') !== -1 || executiveStatus === 'BLUE') {
    return 'LOW';
  }

  return 'NORMAL';
}

function sciip1440EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1440HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1440Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1440CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1440BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1440_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1440HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1440ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1440_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1440ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1440HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1440Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1440Get_(row, map, ['Ledger_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1440NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1440NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1440ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1440ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1440NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessorLegacy1450_();
      return sciipWrapLegacyRuntimeResult1450_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1450_(legacyResult, context, transaction) {
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

/**
 * 1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER
 */

const SCIIP_1450_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF';
const SCIIP_1450_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER';
const SCIIP_1450_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessorLegacy1450_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1450ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1450_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1450EnsureSheet_(ss, SCIIP_1450_TARGET_SHEET, sciip1450TargetHeaders_());

  if (sciip1450BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1450_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1450HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1450Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1450Get_(row, map, [
      'Brief_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1450NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityDailyBriefLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceBriefIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let executiveSummaryLedgerEntriesReviewed = 0;
  let executiveSummariesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const briefTitles = [];
  const briefHeadlines = [];
  const dailyBriefs = [];
  const recommendedActions = [];

  relevantRows.forEach(row => {
    const briefId = sciip1450Get_(row, map, ['Daily_Brief_Id', 'Brief_Id', 'DailyBrief_Id']);
    const sourceBusinessKey = sciip1450Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (briefId) sourceBriefIds.push(String(briefId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1450CollectList_(operationalStates, sciip1450Get_(row, map, ['Operational_State', 'Operational_States']));
    sciip1450CollectList_(executiveStatuses, sciip1450Get_(row, map, ['Executive_Status', 'Executive_Statuses']));
    sciip1450CollectList_(priorities, sciip1450Get_(row, map, ['Priority', 'Priorities']));
    sciip1450CollectList_(signalTypes, sciip1450Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1450CollectList_(severities, sciip1450Get_(row, map, ['Severities', 'Severity']));
    sciip1450CollectList_(sourceStatuses, sciip1450Get_(row, map, ['Source_Statuses', 'Status']));

    const briefTitle = sciip1450Get_(row, map, ['Brief_Title']);
    const briefHeadline = sciip1450Get_(row, map, ['Brief_Headline']);
    const dailyBrief = sciip1450Get_(row, map, ['Daily_Brief']);
    const recommendedAction = sciip1450Get_(row, map, ['Recommended_Action']);

    if (briefTitle) briefTitles.push(String(briefTitle));
    if (briefHeadline) briefHeadlines.push(String(briefHeadline));
    if (dailyBrief) dailyBriefs.push(String(dailyBrief));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    executiveSummaryLedgerEntriesReviewed += Number(sciip1450Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    executiveSummariesReviewed += Number(sciip1450Get_(row, map, ['Executive_Summaries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1450Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1450Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1450Get_(row, map, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1450Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1450Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1450Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1450Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_DAILY_BRIEF_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity daily brief ledger entry for ${dateKey}: ` +
    `${relevantRows.length} daily brief${relevantRows.length === 1 ? '' : 's'} recorded; ` +
    `executive status: ${Object.keys(executiveStatuses).join(', ') || 'NONE'}; ` +
    `priority: ${Object.keys(priorities).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1450_SOURCE_SHEET,
    relevantRows.length,
    sourceBriefIds.join(', '),
    sourceBusinessKeys.join(', '),
    briefTitles.join(' | '),
    briefHeadlines.join(' | '),
    dailyBriefs.join(' | '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    executiveSummaryLedgerEntriesReviewed,
    executiveSummariesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    recommendedActions.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1450_AutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityDailyBriefLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityDailyBriefLedgerProcessor',
    result
  }));
  return result;
}

function sciip1450TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Daily_Briefs_Reviewed',
    'Source_Daily_Brief_Ids',
    'Source_Business_Keys',
    'Brief_Titles',
    'Brief_Headlines',
    'Daily_Briefs',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Executive_Summaries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Recommended_Actions',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1450EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1450HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1450Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1450CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1450BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1450_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1450HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1450ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1450_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1450ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1450HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1450Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const briefDate = sciip1450Get_(row, map, [
      'Brief_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1450NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1450NormalizeDateKey_(briefDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1450ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1450ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1450NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_RUNTIME_LEDGER',

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
          originalProcessor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationProcessorLegacy1460_();
      return sciipWrapLegacyRuntimeResult1460_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1460_(legacyResult, context, transaction) {
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

/**
 * 1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION
 */

const SCIIP_1460_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_DAILY_BRIEF_LEDGER';
const SCIIP_1460_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION';
const SCIIP_1460_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION';

function sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationProcessorLegacy1460_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1460ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1460_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1460EnsureSheet_(ss, SCIIP_1460_TARGET_SHEET, sciip1460TargetHeaders_());

  if (sciip1460BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityFinalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1460_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityFinalizationsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1460HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1460Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1460Get_(row, map, [
      'Ledger_Date',
      'Brief_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1460NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityFinalizationsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let executiveSummariesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const briefTitles = [];
  const briefHeadlines = [];
  const dailyBriefs = [];
  const recommendedActions = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1460Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1460Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1460CollectList_(operationalStates, sciip1460Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1460CollectList_(executiveStatuses, sciip1460Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1460CollectList_(priorities, sciip1460Get_(row, map, ['Priorities', 'Priority']));
    sciip1460CollectList_(signalTypes, sciip1460Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1460CollectList_(severities, sciip1460Get_(row, map, ['Severities', 'Severity']));
    sciip1460CollectList_(sourceStatuses, sciip1460Get_(row, map, ['Source_Statuses', 'Status']));

    const briefTitle = sciip1460Get_(row, map, ['Brief_Titles', 'Brief_Title']);
    const briefHeadline = sciip1460Get_(row, map, ['Brief_Headlines', 'Brief_Headline']);
    const dailyBrief = sciip1460Get_(row, map, ['Daily_Briefs', 'Daily_Brief']);
    const recommendedAction = sciip1460Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);

    if (briefTitle) briefTitles.push(String(briefTitle));
    if (briefHeadline) briefHeadlines.push(String(briefHeadline));
    if (dailyBrief) dailyBriefs.push(String(dailyBrief));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));

    dailyBriefsReviewed += Number(sciip1460Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1460Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    executiveSummariesReviewed += Number(sciip1460Get_(row, map, ['Executive_Summaries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1460Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1460Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1460Get_(row, map, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1460Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1460Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1460Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1460Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const finalizationId = `APRSC_FINALIZATION_${Utilities.getUuid()}`;

  let finalizationState = 'CONTINUITY_FINALIZED';
  let finalizationDecision = 'APPROVED_FOR_CLOSURE';
  let finalizationStatus = 'SUCCESS';
  let recommendedNextStep = 'Proceed to continuity finalization ledger and closure processors.';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(executiveStatuses).indexOf('YELLOW') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_REVIEW_REQUIRED') !== -1
  ) {
    finalizationState = 'CONTINUITY_FINALIZED_WITH_REVIEW';
    finalizationDecision = 'APPROVED_WITH_REVIEW_FLAG';
    finalizationStatus = 'REVIEW_REQUIRED';
    recommendedNextStep = 'Proceed with ledgering, but review continuity chain before downstream promotion.';
  } else if (
    underlyingLedgerEntriesReviewed === 0 ||
    Object.keys(executiveStatuses).indexOf('BLUE') !== -1 ||
    Object.keys(operationalStates).indexOf('CONTINUITY_NO_UNDERLYING_ACTIVITY') !== -1
  ) {
    finalizationState = 'CONTINUITY_FINALIZED_NO_ACTIVITY';
    finalizationDecision = 'APPROVED_NO_ACTIVITY';
    finalizationStatus = 'SUCCESS';
    recommendedNextStep = 'Proceed with ledgering. Monitor if no underlying continuity activity persists.';
  }

  const finalizationSummary =
    `Continuity finalization for ${dateKey}: ${finalizationState}. ` +
    `${relevantRows.length} daily brief ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${dailyBriefsReviewed} daily brief${dailyBriefsReviewed === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    finalizationId,
    businessKey,
    dateKey,
    SCIIP_1460_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    executiveSummariesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    finalizationState,
    finalizationDecision,
    finalizationSummary,
    recommendedActions.join(' | '),
    recommendedNextStep,
    finalizationStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1460_AutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityFinalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityFinalizationProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityFinalizationProcessor',
    result
  }));
  return result;
}

function sciip1460TargetHeaders_() {
  return [
    'Finalization_Id',
    'Business_Key',
    'Finalization_Date',
    'Source_Sheet',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Executive_Summaries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Finalization_State',
    'Finalization_Decision',
    'Finalization_Summary',
    'Recommended_Actions',
    'Recommended_Next_Step',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1460EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1460HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1460Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1460CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1460BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1460_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1460HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1460ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1460_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1460ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1460HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1460Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1460Get_(row, map, [
      'Ledger_Date',
      'Brief_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1460NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1460NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1460ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1460ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1460NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessorLegacy1470_();
      return sciipWrapLegacyRuntimeResult1470_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1470_(legacyResult, context, transaction) {
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

/**
 * 1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER
 */

const SCIIP_1470_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION';
const SCIIP_1470_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER';
const SCIIP_1470_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessorLegacy1470_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1470ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1470_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1470EnsureSheet_(ss, SCIIP_1470_TARGET_SHEET, sciip1470TargetHeaders_());

  if (sciip1470BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityFinalizationLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1470_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityFinalizationLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1470HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1470Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1470Get_(row, map, [
      'Finalization_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1470NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityFinalizationLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceFinalizationIds = [];
  const sourceBusinessKeys = [];
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};
  const finalizationStates = {};
  const finalizationDecisions = {};

  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let executiveSummariesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let signalDigestLedgerEntriesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];

  relevantRows.forEach(row => {
    const finalizationId = sciip1470Get_(row, map, ['Finalization_Id', 'Finalization_ID']);
    const sourceBusinessKey = sciip1470Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (finalizationId) sourceFinalizationIds.push(String(finalizationId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1470CollectList_(operationalStates, sciip1470Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1470CollectList_(executiveStatuses, sciip1470Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1470CollectList_(priorities, sciip1470Get_(row, map, ['Priorities', 'Priority']));
    sciip1470CollectList_(signalTypes, sciip1470Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1470CollectList_(severities, sciip1470Get_(row, map, ['Severities', 'Severity']));
    sciip1470CollectList_(sourceStatuses, sciip1470Get_(row, map, ['Source_Statuses', 'Status']));
    sciip1470CollectList_(finalizationStates, sciip1470Get_(row, map, ['Finalization_State']));
    sciip1470CollectList_(finalizationDecisions, sciip1470Get_(row, map, ['Finalization_Decision']));

    const finalizationSummary = sciip1470Get_(row, map, ['Finalization_Summary']);
    const recommendedAction = sciip1470Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1470Get_(row, map, ['Recommended_Next_Step']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));

    dailyBriefLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1470Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    executiveSummariesReviewed += Number(sciip1470Get_(row, map, ['Executive_Summaries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1470Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    signalDigestLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Signal_Digest_Ledger_Entries_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1470Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1470Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1470Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1470Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_FINALIZATION_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(finalizationStates).indexOf('CONTINUITY_FINALIZED_WITH_REVIEW') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity finalization ledger entry for ${dateKey}: ` +
    `${relevantRows.length} finalization entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `state: ${Object.keys(finalizationStates).join(', ') || 'NONE'}; ` +
    `decision: ${Object.keys(finalizationDecisions).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1470_SOURCE_SHEET,
    relevantRows.length,
    sourceFinalizationIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    executiveSummariesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    signalDigestLedgerEntriesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1470_AutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityFinalizationLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityFinalizationLedgerProcessor',
    result
  }));
  return result;
}

function sciip1470TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Finalizations_Reviewed',
    'Source_Finalization_Ids',
    'Source_Business_Keys',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Executive_Summaries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Signal_Digest_Ledger_Entries_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1470EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1470HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1470Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1470CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1470BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1470_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1470HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1470ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1470_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1470ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1470HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1470Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const finalizationDate = sciip1470Get_(row, map, [
      'Finalization_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1470NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1470NormalizeDateKey_(finalizationDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1470ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1470ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1470NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_RUNTIME_LEDGER',

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
          originalProcessor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityClosureProcessorLegacy1480_();
      return sciipWrapLegacyRuntimeResult1480_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1480_(legacyResult, context, transaction) {
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

/**
 * 1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE
 */

const SCIIP_1480_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_FINALIZATION_LEDGER';
const SCIIP_1480_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE';
const SCIIP_1480_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE';

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureProcessorLegacy1480_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1480ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1480_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1480EnsureSheet_(ss, SCIIP_1480_TARGET_SHEET, sciip1480TargetHeaders_());

  if (sciip1480BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityClosuresCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1480_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityClosuresCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1480HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1480Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1480Get_(row, map, [
      'Ledger_Date',
      'Finalization_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1480NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityClosuresCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let finalizationsReviewed = 0;
  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1480Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1480Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1480CollectList_(finalizationStates, sciip1480Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1480CollectList_(finalizationDecisions, sciip1480Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1480CollectList_(operationalStates, sciip1480Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1480CollectList_(executiveStatuses, sciip1480Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1480CollectList_(priorities, sciip1480Get_(row, map, ['Priorities', 'Priority']));
    sciip1480CollectList_(signalTypes, sciip1480Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1480CollectList_(severities, sciip1480Get_(row, map, ['Severities', 'Severity']));
    sciip1480CollectList_(sourceStatuses, sciip1480Get_(row, map, ['Source_Statuses', 'Status']));

    const finalizationSummary = sciip1480Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1480Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1480Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));

    finalizationsReviewed += Number(sciip1480Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1480Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1480Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1480Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1480Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1480Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1480Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1480Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1480Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1480Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const closureId = `APRSC_CLOSURE_${Utilities.getUuid()}`;

  let closureState = 'CONTINUITY_CLOSED';
  let closureDecision = 'CLOSED_APPROVED';
  let closureStatus = 'SUCCESS';
  let closureSeverity = 'INFO';
  let nextStep = 'Proceed to continuity closure ledger processor.';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(finalizationStates).indexOf('CONTINUITY_FINALIZED_WITH_REVIEW') !== -1
  ) {
    closureState = 'CONTINUITY_CLOSED_WITH_REVIEW_FLAG';
    closureDecision = 'CLOSED_REVIEW_REQUIRED';
    closureStatus = 'REVIEW_REQUIRED';
    closureSeverity = 'WARN';
    nextStep = 'Proceed to closure ledger, but preserve review flag for downstream continuity consumers.';
  } else if (
    Object.keys(finalizationStates).indexOf('CONTINUITY_FINALIZED_NO_ACTIVITY') !== -1 ||
    Object.keys(executiveStatuses).indexOf('BLUE') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    closureState = 'CONTINUITY_CLOSED_NO_ACTIVITY';
    closureDecision = 'CLOSED_NO_ACTIVITY';
    closureStatus = 'SUCCESS';
    closureSeverity = 'LOW';
    nextStep = 'Proceed to closure ledger. Monitor if no activity persists across future processing dates.';
  }

  const closureSummary =
    `Continuity closure for ${dateKey}: ${closureState}. ` +
    `${relevantRows.length} finalization ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} reviewed; ` +
    `${finalizationsReviewed} finalization${finalizationsReviewed === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    closureId,
    businessKey,
    dateKey,
    SCIIP_1480_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    finalizationsReviewed,
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    closureState,
    closureDecision,
    closureSeverity,
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    closureSummary,
    nextStep,
    closureStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1480_AutonomousProcessorExecutionRunStateContinuityClosureProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityClosuresCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityClosureProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityClosureProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityClosureProcessor',
    result
  }));
  return result;
}

function sciip1480TargetHeaders_() {
  return [
    'Closure_Id',
    'Business_Key',
    'Closure_Date',
    'Source_Sheet',
    'Finalization_Ledger_Entries_Reviewed',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Finalizations_Reviewed',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Closure_State',
    'Closure_Decision',
    'Closure_Severity',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Closure_Summary',
    'Next_Step',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1480EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1480HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1480Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1480CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1480BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1480_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1480HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1480ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1480_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1480ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1480HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1480Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1480Get_(row, map, [
      'Ledger_Date',
      'Finalization_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1480NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1480NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1480ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1480ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1480NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessorLegacy1490_();
      return sciipWrapLegacyRuntimeResult1490_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1490_(legacyResult, context, transaction) {
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

/**
 * 1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER
 */

const SCIIP_1490_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE';
const SCIIP_1490_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER';
const SCIIP_1490_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessorLegacy1490_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1490ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1490_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1490EnsureSheet_(ss, SCIIP_1490_TARGET_SHEET, sciip1490TargetHeaders_());

  if (sciip1490BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityClosureLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1490_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityClosureLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1490HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1490Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1490Get_(row, map, [
      'Closure_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1490NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityClosureLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceClosureIds = [];
  const sourceBusinessKeys = [];
  const closureStates = {};
  const closureDecisions = {};
  const closureSeverities = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];
  const closureSummaries = [];
  const nextSteps = [];

  relevantRows.forEach(row => {
    const closureId = sciip1490Get_(row, map, ['Closure_Id', 'Closure_ID']);
    const sourceBusinessKey = sciip1490Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (closureId) sourceClosureIds.push(String(closureId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1490CollectList_(closureStates, sciip1490Get_(row, map, ['Closure_State']));
    sciip1490CollectList_(closureDecisions, sciip1490Get_(row, map, ['Closure_Decision']));
    sciip1490CollectList_(closureSeverities, sciip1490Get_(row, map, ['Closure_Severity']));
    sciip1490CollectList_(finalizationStates, sciip1490Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1490CollectList_(finalizationDecisions, sciip1490Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1490CollectList_(operationalStates, sciip1490Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1490CollectList_(executiveStatuses, sciip1490Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1490CollectList_(priorities, sciip1490Get_(row, map, ['Priorities', 'Priority']));
    sciip1490CollectList_(signalTypes, sciip1490Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1490CollectList_(severities, sciip1490Get_(row, map, ['Severities', 'Severity']));
    sciip1490CollectList_(sourceStatuses, sciip1490Get_(row, map, ['Source_Statuses', 'Status']));

    const finalizationSummary = sciip1490Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1490Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1490Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const closureSummary = sciip1490Get_(row, map, ['Closure_Summary']);
    const nextStep = sciip1490Get_(row, map, ['Next_Step']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (nextStep) nextSteps.push(String(nextStep));

    finalizationLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1490Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1490Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1490Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1490Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1490Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1490Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1490Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_CLOSURE_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(closureStates).indexOf('CONTINUITY_CLOSED_WITH_REVIEW_FLAG') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity closure ledger entry for ${dateKey}: ` +
    `${relevantRows.length} closure entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `closure state: ${Object.keys(closureStates).join(', ') || 'NONE'}; ` +
    `closure decision: ${Object.keys(closureDecisions).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1490_SOURCE_SHEET,
    relevantRows.length,
    sourceClosureIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(closureSeverities).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    closureSummaries.join(' | '),
    nextSteps.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1490_AutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityClosureLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityClosureLedgerProcessor',
    result
  }));
  return result;
}

function sciip1490TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Closures_Reviewed',
    'Source_Closure_Ids',
    'Source_Business_Keys',
    'Closure_States',
    'Closure_Decisions',
    'Closure_Severities',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Closure_Summaries',
    'Next_Steps',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1490EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1490HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1490Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1490CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1490BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1490_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1490HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1490ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1490_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1490ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1490HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1490Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const closureDate = sciip1490Get_(row, map, [
      'Closure_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1490NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1490NormalizeDateKey_(closureDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1490ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1490ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1490NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_RUNTIME_LEDGER',

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
          originalProcessor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveProcessorLegacy1500_();
      return sciipWrapLegacyRuntimeResult1500_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1500_(legacyResult, context, transaction) {
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

/**
 * 1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE
 */

const SCIIP_1500_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_CLOSURE_LEDGER';
const SCIIP_1500_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE';
const SCIIP_1500_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE';

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveProcessorLegacy1500_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1500ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1500_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1500EnsureSheet_(ss, SCIIP_1500_TARGET_SHEET, sciip1500TargetHeaders_());

  if (sciip1500BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchivesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1500_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchivesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1500HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1500Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1500Get_(row, map, ['Ledger_Date', 'Closure_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1500NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchivesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const closureStates = {};
  const closureDecisions = {};
  const closureSeverities = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];
  const closureSummaries = [];
  const nextSteps = [];
  const ledgerSummaries = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1500Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1500Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1500CollectList_(closureStates, sciip1500Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1500CollectList_(closureDecisions, sciip1500Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1500CollectList_(closureSeverities, sciip1500Get_(row, map, ['Closure_Severities', 'Closure_Severity']));
    sciip1500CollectList_(finalizationStates, sciip1500Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1500CollectList_(finalizationDecisions, sciip1500Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1500CollectList_(operationalStates, sciip1500Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1500CollectList_(executiveStatuses, sciip1500Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1500CollectList_(priorities, sciip1500Get_(row, map, ['Priorities', 'Priority']));
    sciip1500CollectList_(signalTypes, sciip1500Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1500CollectList_(severities, sciip1500Get_(row, map, ['Severities', 'Severity']));
    sciip1500CollectList_(sourceStatuses, sciip1500Get_(row, map, ['Source_Statuses', 'Status']));

    const finalizationSummary = sciip1500Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1500Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1500Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const closureSummary = sciip1500Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const nextStep = sciip1500Get_(row, map, ['Next_Steps', 'Next_Step']);
    const ledgerSummary = sciip1500Get_(row, map, ['Ledger_Summary']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (nextStep) nextSteps.push(String(nextStep));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));

    closuresReviewed += Number(sciip1500Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1500Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1500Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1500Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1500Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1500Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1500Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1500Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const archiveId = `APRSC_ARCHIVE_${Utilities.getUuid()}`;

  let archiveState = 'CONTINUITY_ARCHIVED';
  let archiveDecision = 'ARCHIVED_APPROVED';
  let archiveStatus = 'SUCCESS';
  let archiveSeverity = 'INFO';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(closureStates).indexOf('CONTINUITY_CLOSED_WITH_REVIEW_FLAG') !== -1
  ) {
    archiveState = 'CONTINUITY_ARCHIVED_WITH_REVIEW_FLAG';
    archiveDecision = 'ARCHIVED_REVIEW_REQUIRED';
    archiveStatus = 'REVIEW_REQUIRED';
    archiveSeverity = 'WARN';
  } else if (
    Object.keys(closureStates).indexOf('CONTINUITY_CLOSED_NO_ACTIVITY') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    archiveState = 'CONTINUITY_ARCHIVED_NO_ACTIVITY';
    archiveDecision = 'ARCHIVED_NO_ACTIVITY';
    archiveStatus = 'SUCCESS';
    archiveSeverity = 'LOW';
  }

  const archiveSummary =
    `Continuity archive for ${dateKey}: ${archiveState}. ` +
    `${relevantRows.length} closure ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} archived; ` +
    `${closuresReviewed} closure${closuresReviewed === 1 ? '' : 's'}; ` +
    `${finalizationsReviewed} finalization${finalizationsReviewed === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries; ` +
    `${successfulEntries} successful; ${duplicateEntries} duplicate/idempotent; ${failedEntries} failed.`;

  targetSheet.appendRow([
    archiveId,
    businessKey,
    dateKey,
    SCIIP_1500_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(closureSeverities).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    closureSummaries.join(' | '),
    nextSteps.join(' | '),
    ledgerSummaries.join(' | '),
    archiveState,
    archiveDecision,
    archiveSeverity,
    archiveSummary,
    archiveStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1500_AutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchivesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchiveProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityArchiveProcessor',
    result
  }));
  return result;
}

function sciip1500TargetHeaders_() {
  return [
    'Archive_Id',
    'Business_Key',
    'Archive_Date',
    'Source_Sheet',
    'Closure_Ledger_Entries_Archived',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Closure_States',
    'Closure_Decisions',
    'Closure_Severities',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Closure_Summaries',
    'Next_Steps',
    'Source_Ledger_Summaries',
    'Archive_State',
    'Archive_Decision',
    'Archive_Severity',
    'Archive_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1500EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1500HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1500Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1500CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1500BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1500_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1500HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1500ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1500_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1500ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1500HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1500Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1500Get_(row, map, ['Ledger_Date', 'Closure_Date', 'Date_Key', 'Processing_Date', 'Run_Date', 'Created_At']);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1500NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1500NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1500ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1500ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1500NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessorLegacy1510_();
      return sciipWrapLegacyRuntimeResult1510_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1510_(legacyResult, context, transaction) {
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

/**
 * 1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER
 */

const SCIIP_1510_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE';
const SCIIP_1510_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER';
const SCIIP_1510_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessorLegacy1510_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1510ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1510_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1510EnsureSheet_(ss, SCIIP_1510_TARGET_SHEET, sciip1510TargetHeaders_());

  if (sciip1510BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchiveLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1510_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchiveLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1510HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1510Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1510Get_(row, map, [
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1510NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchiveLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceArchiveIds = [];
  const sourceBusinessKeys = [];
  const archiveStates = {};
  const archiveDecisions = {};
  const archiveSeverities = {};
  const closureStates = {};
  const closureDecisions = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];
  const closureSummaries = [];
  const nextSteps = [];
  const sourceLedgerSummaries = [];
  const archiveSummaries = [];

  relevantRows.forEach(row => {
    const archiveId = sciip1510Get_(row, map, ['Archive_Id', 'Archive_ID']);
    const sourceBusinessKey = sciip1510Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (archiveId) sourceArchiveIds.push(String(archiveId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1510CollectList_(archiveStates, sciip1510Get_(row, map, ['Archive_State']));
    sciip1510CollectList_(archiveDecisions, sciip1510Get_(row, map, ['Archive_Decision']));
    sciip1510CollectList_(archiveSeverities, sciip1510Get_(row, map, ['Archive_Severity']));
    sciip1510CollectList_(closureStates, sciip1510Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1510CollectList_(closureDecisions, sciip1510Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1510CollectList_(finalizationStates, sciip1510Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1510CollectList_(finalizationDecisions, sciip1510Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1510CollectList_(operationalStates, sciip1510Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1510CollectList_(executiveStatuses, sciip1510Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1510CollectList_(priorities, sciip1510Get_(row, map, ['Priorities', 'Priority']));
    sciip1510CollectList_(signalTypes, sciip1510Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1510CollectList_(severities, sciip1510Get_(row, map, ['Severities', 'Severity']));
    sciip1510CollectList_(sourceStatuses, sciip1510Get_(row, map, ['Source_Statuses', 'Status']));

    const finalizationSummary = sciip1510Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1510Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1510Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const closureSummary = sciip1510Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const nextStep = sciip1510Get_(row, map, ['Next_Steps', 'Next_Step']);
    const sourceLedgerSummary = sciip1510Get_(row, map, ['Source_Ledger_Summaries', 'Ledger_Summary']);
    const archiveSummary = sciip1510Get_(row, map, ['Archive_Summary']);

    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (nextStep) nextSteps.push(String(nextStep));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (archiveSummary) archiveSummaries.push(String(archiveSummary));

    closureLedgerEntriesArchived += Number(sciip1510Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1510Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1510Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1510Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1510Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1510Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1510Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1510Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1510Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_ARCHIVE_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(archiveStates).indexOf('CONTINUITY_ARCHIVED_WITH_REVIEW_FLAG') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity archive ledger entry for ${dateKey}: ` +
    `${relevantRows.length} archive entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `archive state: ${Object.keys(archiveStates).join(', ') || 'NONE'}; ` +
    `archive decision: ${Object.keys(archiveDecisions).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1510_SOURCE_SHEET,
    relevantRows.length,
    sourceArchiveIds.join(', '),
    sourceBusinessKeys.join(', '),
    Object.keys(archiveStates).join(', '),
    Object.keys(archiveDecisions).join(', '),
    Object.keys(archiveSeverities).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    closureSummaries.join(' | '),
    nextSteps.join(' | '),
    sourceLedgerSummaries.join(' | '),
    archiveSummaries.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1510_AutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchiveLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityArchiveLedgerProcessor',
    result
  }));
  return result;
}

function sciip1510TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Archives_Reviewed',
    'Source_Archive_Ids',
    'Source_Business_Keys',
    'Archive_States',
    'Archive_Decisions',
    'Archive_Severities',
    'Closure_States',
    'Closure_Decisions',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Closure_Summaries',
    'Next_Steps',
    'Source_Ledger_Summaries',
    'Archive_Summaries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1510EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1510HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1510Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1510CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1510BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1510_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1510HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1510ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1510_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1510ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1510HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1510Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const archiveDate = sciip1510Get_(row, map, [
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1510NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1510NormalizeDateKey_(archiveDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1510ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1510ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1510NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_RUNTIME_LEDGER',

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
          originalProcessor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessorLegacy1520_();
      return sciipWrapLegacyRuntimeResult1520_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1520_(legacyResult, context, transaction) {
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

/**
 * 1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH
 */

const SCIIP_1520_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER';
const SCIIP_1520_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';
const SCIIP_1520_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessorLegacy1520_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1520ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1520_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1520EnsureSheet_(ss, SCIIP_1520_TARGET_SHEET, sciip1520TargetHeaders_());

  if (sciip1520BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1520_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1520HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1520Get_(row, map, [
      'Ledger_Date',
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1520NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];

  const archiveStates = {};
  const archiveDecisions = {};
  const archiveSeverities = {};
  const closureStates = {};
  const closureDecisions = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const archiveSummaries = [];
  const ledgerSummaries = [];
  const closureSummaries = [];
  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1520Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1520CollectList_(archiveStates, sciip1520Get_(row, map, ['Archive_States', 'Archive_State']));
    sciip1520CollectList_(archiveDecisions, sciip1520Get_(row, map, ['Archive_Decisions', 'Archive_Decision']));
    sciip1520CollectList_(archiveSeverities, sciip1520Get_(row, map, ['Archive_Severities', 'Archive_Severity']));
    sciip1520CollectList_(closureStates, sciip1520Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1520CollectList_(closureDecisions, sciip1520Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1520CollectList_(finalizationStates, sciip1520Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1520CollectList_(finalizationDecisions, sciip1520Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1520CollectList_(operationalStates, sciip1520Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1520CollectList_(executiveStatuses, sciip1520Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1520CollectList_(priorities, sciip1520Get_(row, map, ['Priorities', 'Priority']));
    sciip1520CollectList_(signalTypes, sciip1520Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1520CollectList_(severities, sciip1520Get_(row, map, ['Severities', 'Severity']));
    sciip1520CollectList_(sourceStatuses, sciip1520Get_(row, map, ['Source_Statuses', 'Status']));

    const archiveSummary = sciip1520Get_(row, map, ['Archive_Summaries', 'Archive_Summary']);
    const ledgerSummary = sciip1520Get_(row, map, ['Ledger_Summary']);
    const closureSummary = sciip1520Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const finalizationSummary = sciip1520Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1520Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1520Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);

    if (archiveSummary) archiveSummaries.push(String(archiveSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));

    archivesReviewed += Number(sciip1520Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1520Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1520Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1520Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1520Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1520Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1520Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1520Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1520Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const graphRecordId = `APRSC_KG_${Utilities.getUuid()}`;
  const graphNodeId = `KG_NODE_RUN_STATE_CONTINUITY_${dateKey}`;
  const graphNodeType = 'RUN_STATE_CONTINUITY_ARCHIVE';
  const graphEdgeType = 'SUMMARIZES_ARCHIVED_CONTINUITY_CHAIN';
  const graphSubject = `RUN_STATE_CONTINUITY|${dateKey}`;
  const graphObject = sourceBusinessKeys.join(', ');

  const graphState =
    Object.keys(archiveStates).indexOf('CONTINUITY_ARCHIVED_WITH_REVIEW_FLAG') !== -1
      ? 'GRAPH_REVIEW_REQUIRED'
      : Object.keys(archiveStates).indexOf('CONTINUITY_ARCHIVED_NO_ACTIVITY') !== -1
        ? 'GRAPH_NO_ACTIVITY'
        : 'GRAPH_HEALTHY';

  const graphStatus = graphState === 'GRAPH_REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'SUCCESS';

  const graphSummary =
    `Knowledge graph projection for run state continuity ${dateKey}: ${graphState}. ` +
    `${relevantRows.length} archive ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} projected; ` +
    `archive states: ${Object.keys(archiveStates).join(', ') || 'NONE'}; ` +
    `closure states: ${Object.keys(closureStates).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    graphRecordId,
    businessKey,
    dateKey,
    SCIIP_1520_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    graphNodeId,
    graphNodeType,
    graphEdgeType,
    graphSubject,
    graphObject,
    graphState,
    Object.keys(archiveStates).join(', '),
    Object.keys(archiveDecisions).join(', '),
    Object.keys(archiveSeverities).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    archiveSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    closureSummaries.join(' | '),
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    graphSummary,
    graphStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    result
  }));
  return result;
}

function sciip1520TargetHeaders_() {
  return [
    'Knowledge_Graph_Record_Id',
    'Business_Key',
    'Graph_Date',
    'Source_Sheet',
    'Archive_Ledger_Entries_Projected',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Graph_Node_Id',
    'Graph_Node_Type',
    'Graph_Edge_Type',
    'Graph_Subject',
    'Graph_Object',
    'Graph_State',
    'Archive_States',
    'Archive_Decisions',
    'Archive_Severities',
    'Closure_States',
    'Closure_Decisions',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Archive_Summaries',
    'Source_Ledger_Summaries',
    'Closure_Summaries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Graph_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1520EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1520HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1520Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1520CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1520BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1520_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1520HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1520ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1520_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1520ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1520HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1520Get_(row, map, [
      'Ledger_Date',
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1520NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1520NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1520ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1520ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1520NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessorLegacy1530_();
      return sciipWrapLegacyRuntimeResult1530_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1530_(legacyResult, context, transaction) {
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

/**
 * 1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER
 */

const SCIIP_1530_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';
const SCIIP_1530_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';
const SCIIP_1530_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessorLegacy1530_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1530ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1530_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1530EnsureSheet_(ss, SCIIP_1530_TARGET_SHEET, sciip1530TargetHeaders_());

  if (sciip1530BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1530_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1530HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1530Get_(row, map, [
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1530NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceGraphRecordIds = [];
  const sourceBusinessKeys = [];
  const sourceLedgerEntryIds = [];
  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};

  const archiveStates = {};
  const archiveDecisions = {};
  const archiveSeverities = {};
  const closureStates = {};
  const closureDecisions = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const archiveSummaries = [];
  const sourceLedgerSummaries = [];
  const closureSummaries = [];
  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];
  const graphSummaries = [];

  relevantRows.forEach(row => {
    const graphRecordId = sciip1530Get_(row, map, ['Knowledge_Graph_Record_Id', 'Graph_Record_Id']);
    const sourceBusinessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const sourceLedgerEntryId = sciip1530Get_(row, map, ['Source_Ledger_Entry_Ids', 'Source_Ledger_Entry_Id']);

    if (graphRecordId) sourceGraphRecordIds.push(String(graphRecordId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (sourceLedgerEntryId) sourceLedgerEntryIds.push(String(sourceLedgerEntryId));

    sciip1530CollectList_(graphNodeIds, sciip1530Get_(row, map, ['Graph_Node_Id']));
    sciip1530CollectList_(graphNodeTypes, sciip1530Get_(row, map, ['Graph_Node_Type']));
    sciip1530CollectList_(graphEdgeTypes, sciip1530Get_(row, map, ['Graph_Edge_Type']));
    sciip1530CollectList_(graphSubjects, sciip1530Get_(row, map, ['Graph_Subject']));
    sciip1530CollectList_(graphObjects, sciip1530Get_(row, map, ['Graph_Object']));
    sciip1530CollectList_(graphStates, sciip1530Get_(row, map, ['Graph_State']));

    sciip1530CollectList_(archiveStates, sciip1530Get_(row, map, ['Archive_States', 'Archive_State']));
    sciip1530CollectList_(archiveDecisions, sciip1530Get_(row, map, ['Archive_Decisions', 'Archive_Decision']));
    sciip1530CollectList_(archiveSeverities, sciip1530Get_(row, map, ['Archive_Severities', 'Archive_Severity']));
    sciip1530CollectList_(closureStates, sciip1530Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1530CollectList_(closureDecisions, sciip1530Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1530CollectList_(finalizationStates, sciip1530Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1530CollectList_(finalizationDecisions, sciip1530Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1530CollectList_(operationalStates, sciip1530Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1530CollectList_(executiveStatuses, sciip1530Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1530CollectList_(priorities, sciip1530Get_(row, map, ['Priorities', 'Priority']));
    sciip1530CollectList_(signalTypes, sciip1530Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1530CollectList_(severities, sciip1530Get_(row, map, ['Severities', 'Severity']));
    sciip1530CollectList_(sourceStatuses, sciip1530Get_(row, map, ['Source_Statuses', 'Status']));

    const archiveSummary = sciip1530Get_(row, map, ['Archive_Summaries', 'Archive_Summary']);
    const sourceLedgerSummary = sciip1530Get_(row, map, ['Source_Ledger_Summaries', 'Ledger_Summary']);
    const closureSummary = sciip1530Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const finalizationSummary = sciip1530Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1530Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1530Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const graphSummary = sciip1530Get_(row, map, ['Graph_Summary']);

    if (archiveSummary) archiveSummaries.push(String(archiveSummary));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (graphSummary) graphSummaries.push(String(graphSummary));

    archiveLedgerEntriesProjected += Number(sciip1530Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1530Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1530Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1530Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1530Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1530Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1530Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1530Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1530Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1530Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_KG_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(graphStates).indexOf('GRAPH_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity knowledge graph ledger entry for ${dateKey}: ` +
    `${relevantRows.length} graph projection entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `graph states: ${Object.keys(graphStates).join(', ') || 'NONE'}; ` +
    `graph nodes: ${Object.keys(graphNodeIds).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1530_SOURCE_SHEET,
    relevantRows.length,
    sourceGraphRecordIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceLedgerEntryIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    Object.keys(archiveStates).join(', '),
    Object.keys(archiveDecisions).join(', '),
    Object.keys(archiveSeverities).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    archiveSummaries.join(' | '),
    sourceLedgerSummaries.join(' | '),
    closureSummaries.join(' | '),
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    graphSummaries.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
    result
  }));
  return result;
}

function sciip1530TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Knowledge_Graph_Records_Reviewed',
    'Source_Knowledge_Graph_Record_Ids',
    'Source_Business_Keys',
    'Source_Ledger_Entry_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'Archive_States',
    'Archive_Decisions',
    'Archive_Severities',
    'Closure_States',
    'Closure_Decisions',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Archive_Summaries',
    'Source_Ledger_Summaries',
    'Closure_Summaries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Graph_Summaries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1530EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1530HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1530Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1530CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1530BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1530_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1530HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1530ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1530_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1530ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1530HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const graphDate = sciip1530Get_(row, map, [
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1530NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1530NormalizeDateKey_(graphDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1530ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1530ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1530NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_RUNTIME_LEDGER',

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
          originalProcessor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessorLegacy1540_();
      return sciipWrapLegacyRuntimeResult1540_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1540_(legacyResult, context, transaction) {
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

/**
 * 1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP
 */

const SCIIP_1540_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';
const SCIIP_1540_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP';
const SCIIP_1540_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessorLegacy1540_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1540ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1540_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1540EnsureSheet_(ss, SCIIP_1540_TARGET_SHEET, sciip1540TargetHeaders_());

  if (sciip1540BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1540_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1540HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1540Get_(row, map, [
      'Ledger_Date',
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1540NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const sourceGraphRecordIds = [];

  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};

  const archiveStates = {};
  const closureStates = {};
  const finalizationStates = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let knowledgeGraphRecordsReviewed = 0;
  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefsReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const graphSummaries = [];
  const ledgerSummaries = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1540Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const graphRecordId = sciip1540Get_(row, map, ['Source_Knowledge_Graph_Record_Ids', 'Knowledge_Graph_Record_Id']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (graphRecordId) sourceGraphRecordIds.push(String(graphRecordId));

    sciip1540CollectList_(graphNodeIds, sciip1540Get_(row, map, ['Graph_Node_Ids', 'Graph_Node_Id']));
    sciip1540CollectList_(graphNodeTypes, sciip1540Get_(row, map, ['Graph_Node_Types', 'Graph_Node_Type']));
    sciip1540CollectList_(graphEdgeTypes, sciip1540Get_(row, map, ['Graph_Edge_Types', 'Graph_Edge_Type']));
    sciip1540CollectList_(graphSubjects, sciip1540Get_(row, map, ['Graph_Subjects', 'Graph_Subject']));
    sciip1540CollectList_(graphObjects, sciip1540Get_(row, map, ['Graph_Objects', 'Graph_Object']));
    sciip1540CollectList_(graphStates, sciip1540Get_(row, map, ['Graph_States', 'Graph_State']));

    sciip1540CollectList_(archiveStates, sciip1540Get_(row, map, ['Archive_States']));
    sciip1540CollectList_(closureStates, sciip1540Get_(row, map, ['Closure_States']));
    sciip1540CollectList_(finalizationStates, sciip1540Get_(row, map, ['Finalization_States']));
    sciip1540CollectList_(operationalStates, sciip1540Get_(row, map, ['Operational_States']));
    sciip1540CollectList_(executiveStatuses, sciip1540Get_(row, map, ['Executive_Statuses']));
    sciip1540CollectList_(priorities, sciip1540Get_(row, map, ['Priorities']));
    sciip1540CollectList_(signalTypes, sciip1540Get_(row, map, ['Signal_Types']));
    sciip1540CollectList_(severities, sciip1540Get_(row, map, ['Severities']));
    sciip1540CollectList_(sourceStatuses, sciip1540Get_(row, map, ['Source_Statuses', 'Status']));

    const graphSummary = sciip1540Get_(row, map, ['Graph_Summaries', 'Graph_Summary']);
    const ledgerSummary = sciip1540Get_(row, map, ['Ledger_Summary']);

    if (graphSummary) graphSummaries.push(String(graphSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));

    knowledgeGraphRecordsReviewed += Number(sciip1540Get_(row, map, ['Knowledge_Graph_Records_Reviewed']) || 0);
    archiveLedgerEntriesProjected += Number(sciip1540Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1540Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1540Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1540Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1540Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1540Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1540Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1540Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1540Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1540Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1540Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1540Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const systemMapId = `APRSC_SYSTEM_MAP_${Utilities.getUuid()}`;

  let mapState = 'SYSTEM_MAP_HEALTHY';
  let mapStatus = 'SUCCESS';
  let mapSeverity = 'INFO';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(graphStates).indexOf('GRAPH_REVIEW_REQUIRED') !== -1
  ) {
    mapState = 'SYSTEM_MAP_REVIEW_REQUIRED';
    mapStatus = 'REVIEW_REQUIRED';
    mapSeverity = 'WARN';
  } else if (
    Object.keys(graphStates).indexOf('GRAPH_NO_ACTIVITY') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    mapState = 'SYSTEM_MAP_NO_ACTIVITY';
    mapStatus = 'SUCCESS';
    mapSeverity = 'LOW';
  }

  const systemMapSummary =
    `Continuity system map for ${dateKey}: ${mapState}. ` +
    `${relevantRows.length} knowledge graph ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} mapped; ` +
    `nodes: ${Object.keys(graphNodeIds).join(', ') || 'NONE'}; ` +
    `edges: ${Object.keys(graphEdgeTypes).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    systemMapId,
    businessKey,
    dateKey,
    SCIIP_1540_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceGraphRecordIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    mapState,
    mapSeverity,
    Object.keys(archiveStates).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    knowledgeGraphRecordsReviewed,
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefsReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    graphSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    systemMapSummary,
    mapStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    result
  }));
  return result;
}

function sciip1540TargetHeaders_() {
  return [
    'System_Map_Id',
    'Business_Key',
    'System_Map_Date',
    'Source_Sheet',
    'Knowledge_Graph_Ledger_Entries_Mapped',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Source_Knowledge_Graph_Record_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'System_Map_State',
    'System_Map_Severity',
    'Archive_States',
    'Closure_States',
    'Finalization_States',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Knowledge_Graph_Records_Reviewed',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Briefs_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Graph_Summaries',
    'Source_Ledger_Summaries',
    'System_Map_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1540EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1540HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1540Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1540CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1540BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1540_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1540HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1540ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1540_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1540ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1540HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1540Get_(row, map, [
      'Ledger_Date',
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1540NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1540NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1540ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1540ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1540NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER_RUNTIME_LEDGER',

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
          originalProcessor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessorLegacy1550_();
      return sciipWrapLegacyRuntimeResult1550_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1550_(legacyResult, context, transaction) {
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

/**
 * 1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER
 */

const SCIIP_1550_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP';
const SCIIP_1550_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER';
const SCIIP_1550_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessorLegacy1550_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1550ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1550_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1550EnsureSheet_(ss, SCIIP_1550_TARGET_SHEET, sciip1550TargetHeaders_());

  if (sciip1550BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMapLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1550_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1550HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1550Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1550Get_(row, map, [
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1550NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSystemMapIds = [];
  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const sourceKnowledgeGraphRecordIds = [];

  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};
  const systemMapStates = {};
  const systemMapSeverities = {};

  const archiveStates = {};
  const closureStates = {};
  const finalizationStates = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let knowledgeGraphLedgerEntriesMapped = 0;
  let knowledgeGraphRecordsReviewed = 0;
  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefsReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const graphSummaries = [];
  const sourceLedgerSummaries = [];
  const systemMapSummaries = [];

  relevantRows.forEach(row => {
    const systemMapId = sciip1550Get_(row, map, ['System_Map_Id', 'SystemMap_Id']);
    const sourceLedgerEntryId = sciip1550Get_(row, map, ['Source_Ledger_Entry_Ids', 'Source_Ledger_Entry_Id']);
    const sourceBusinessKey = sciip1550Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const sourceKgRecordId = sciip1550Get_(row, map, ['Source_Knowledge_Graph_Record_Ids', 'Source_Knowledge_Graph_Record_Id']);

    if (systemMapId) sourceSystemMapIds.push(String(systemMapId));
    if (sourceLedgerEntryId) sourceLedgerEntryIds.push(String(sourceLedgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (sourceKgRecordId) sourceKnowledgeGraphRecordIds.push(String(sourceKgRecordId));

    sciip1550CollectList_(graphNodeIds, sciip1550Get_(row, map, ['Graph_Node_Ids', 'Graph_Node_Id']));
    sciip1550CollectList_(graphNodeTypes, sciip1550Get_(row, map, ['Graph_Node_Types', 'Graph_Node_Type']));
    sciip1550CollectList_(graphEdgeTypes, sciip1550Get_(row, map, ['Graph_Edge_Types', 'Graph_Edge_Type']));
    sciip1550CollectList_(graphSubjects, sciip1550Get_(row, map, ['Graph_Subjects', 'Graph_Subject']));
    sciip1550CollectList_(graphObjects, sciip1550Get_(row, map, ['Graph_Objects', 'Graph_Object']));
    sciip1550CollectList_(graphStates, sciip1550Get_(row, map, ['Graph_States', 'Graph_State']));
    sciip1550CollectList_(systemMapStates, sciip1550Get_(row, map, ['System_Map_State']));
    sciip1550CollectList_(systemMapSeverities, sciip1550Get_(row, map, ['System_Map_Severity']));

    sciip1550CollectList_(archiveStates, sciip1550Get_(row, map, ['Archive_States']));
    sciip1550CollectList_(closureStates, sciip1550Get_(row, map, ['Closure_States']));
    sciip1550CollectList_(finalizationStates, sciip1550Get_(row, map, ['Finalization_States']));
    sciip1550CollectList_(operationalStates, sciip1550Get_(row, map, ['Operational_States']));
    sciip1550CollectList_(executiveStatuses, sciip1550Get_(row, map, ['Executive_Statuses']));
    sciip1550CollectList_(priorities, sciip1550Get_(row, map, ['Priorities']));
    sciip1550CollectList_(signalTypes, sciip1550Get_(row, map, ['Signal_Types']));
    sciip1550CollectList_(severities, sciip1550Get_(row, map, ['Severities']));
    sciip1550CollectList_(sourceStatuses, sciip1550Get_(row, map, ['Source_Statuses', 'Status']));

    const graphSummary = sciip1550Get_(row, map, ['Graph_Summaries', 'Graph_Summary']);
    const sourceLedgerSummary = sciip1550Get_(row, map, ['Source_Ledger_Summaries', 'Ledger_Summary']);
    const systemMapSummary = sciip1550Get_(row, map, ['System_Map_Summary']);

    if (graphSummary) graphSummaries.push(String(graphSummary));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (systemMapSummary) systemMapSummaries.push(String(systemMapSummary));

    knowledgeGraphLedgerEntriesMapped += Number(sciip1550Get_(row, map, ['Knowledge_Graph_Ledger_Entries_Mapped']) || 0);
    knowledgeGraphRecordsReviewed += Number(sciip1550Get_(row, map, ['Knowledge_Graph_Records_Reviewed']) || 0);
    archiveLedgerEntriesProjected += Number(sciip1550Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1550Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1550Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1550Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1550Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1550Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1550Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1550Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1550Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1550Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1550Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1550Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_SYSTEM_MAP_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(systemMapStates).indexOf('SYSTEM_MAP_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity system map ledger entry for ${dateKey}: ` +
    `${relevantRows.length} system map entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `map states: ${Object.keys(systemMapStates).join(', ') || 'NONE'}; ` +
    `graph nodes: ${Object.keys(graphNodeIds).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1550_SOURCE_SHEET,
    relevantRows.length,
    sourceSystemMapIds.join(', '),
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceKnowledgeGraphRecordIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    Object.keys(systemMapStates).join(', '),
    Object.keys(systemMapSeverities).join(', '),
    Object.keys(archiveStates).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    knowledgeGraphLedgerEntriesMapped,
    knowledgeGraphRecordsReviewed,
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefsReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    graphSummaries.join(' | '),
    sourceLedgerSummaries.join(' | '),
    systemMapSummaries.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1550_AutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMapLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapLedgerProcessor',
    result
  }));
  return result;
}

function sciip1550TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'System_Maps_Reviewed',
    'Source_System_Map_Ids',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Source_Knowledge_Graph_Record_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'System_Map_States',
    'System_Map_Severities',
    'Archive_States',
    'Closure_States',
    'Finalization_States',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Knowledge_Graph_Ledger_Entries_Mapped',
    'Knowledge_Graph_Records_Reviewed',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Briefs_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Graph_Summaries',
    'Source_Ledger_Summaries',
    'System_Map_Summaries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1550EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1550HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1550Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1550CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1550BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1550_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1550HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1550ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1550_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1550ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1550HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1550Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const systemMapDate = sciip1550Get_(row, map, [
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1550NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1550NormalizeDateKey_(systemMapDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1550ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1550ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1550NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_RUNTIME_LEDGER',

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
          originalProcessor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessorLegacy1560_();
      return sciipWrapLegacyRuntimeResult1560_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1560_(legacyResult, context, transaction) {
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

/**
 * 1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX
 */

const SCIIP_1560_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER';
const SCIIP_1560_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';
const SCIIP_1560_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessorLegacy1560_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1560ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1560_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1560EnsureSheet_(ss, SCIIP_1560_TARGET_SHEET, sciip1560TargetHeaders_());

  if (sciip1560BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1560_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1560HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1560Get_(row, map, [
      'Ledger_Date',
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1560NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceSystemMapIds = [];
  const sourceBusinessKeys = [];
  const sourceKnowledgeGraphRecordIds = [];

  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};
  const systemMapStates = {};
  const systemMapSeverities = {};

  const archiveStates = {};
  const closureStates = {};
  const finalizationStates = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let systemMapsReviewed = 0;
  let knowledgeGraphLedgerEntriesMapped = 0;
  let knowledgeGraphRecordsReviewed = 0;
  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefsReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const graphSummaries = [];
  const sourceLedgerSummaries = [];
  const systemMapSummaries = [];
  const ledgerSummaries = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1560Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const systemMapId = sciip1560Get_(row, map, ['Source_System_Map_Ids', 'System_Map_Id']);
    const sourceBusinessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const sourceKgRecordId = sciip1560Get_(row, map, ['Source_Knowledge_Graph_Record_Ids', 'Source_Knowledge_Graph_Record_Id']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (systemMapId) sourceSystemMapIds.push(String(systemMapId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (sourceKgRecordId) sourceKnowledgeGraphRecordIds.push(String(sourceKgRecordId));

    sciip1560CollectList_(graphNodeIds, sciip1560Get_(row, map, ['Graph_Node_Ids']));
    sciip1560CollectList_(graphNodeTypes, sciip1560Get_(row, map, ['Graph_Node_Types']));
    sciip1560CollectList_(graphEdgeTypes, sciip1560Get_(row, map, ['Graph_Edge_Types']));
    sciip1560CollectList_(graphSubjects, sciip1560Get_(row, map, ['Graph_Subjects']));
    sciip1560CollectList_(graphObjects, sciip1560Get_(row, map, ['Graph_Objects']));
    sciip1560CollectList_(graphStates, sciip1560Get_(row, map, ['Graph_States']));
    sciip1560CollectList_(systemMapStates, sciip1560Get_(row, map, ['System_Map_States']));
    sciip1560CollectList_(systemMapSeverities, sciip1560Get_(row, map, ['System_Map_Severities']));

    sciip1560CollectList_(archiveStates, sciip1560Get_(row, map, ['Archive_States']));
    sciip1560CollectList_(closureStates, sciip1560Get_(row, map, ['Closure_States']));
    sciip1560CollectList_(finalizationStates, sciip1560Get_(row, map, ['Finalization_States']));
    sciip1560CollectList_(operationalStates, sciip1560Get_(row, map, ['Operational_States']));
    sciip1560CollectList_(executiveStatuses, sciip1560Get_(row, map, ['Executive_Statuses']));
    sciip1560CollectList_(priorities, sciip1560Get_(row, map, ['Priorities']));
    sciip1560CollectList_(signalTypes, sciip1560Get_(row, map, ['Signal_Types']));
    sciip1560CollectList_(severities, sciip1560Get_(row, map, ['Severities']));
    sciip1560CollectList_(sourceStatuses, sciip1560Get_(row, map, ['Source_Statuses', 'Status']));

    const graphSummary = sciip1560Get_(row, map, ['Graph_Summaries']);
    const sourceLedgerSummary = sciip1560Get_(row, map, ['Source_Ledger_Summaries']);
    const systemMapSummary = sciip1560Get_(row, map, ['System_Map_Summaries']);
    const ledgerSummary = sciip1560Get_(row, map, ['Ledger_Summary']);

    if (graphSummary) graphSummaries.push(String(graphSummary));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (systemMapSummary) systemMapSummaries.push(String(systemMapSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));

    systemMapsReviewed += Number(sciip1560Get_(row, map, ['System_Maps_Reviewed']) || 0);
    knowledgeGraphLedgerEntriesMapped += Number(sciip1560Get_(row, map, ['Knowledge_Graph_Ledger_Entries_Mapped']) || 0);
    knowledgeGraphRecordsReviewed += Number(sciip1560Get_(row, map, ['Knowledge_Graph_Records_Reviewed']) || 0);
    archiveLedgerEntriesProjected += Number(sciip1560Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1560Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1560Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1560Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1560Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1560Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1560Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1560Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1560Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1560Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1560Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1560Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const indexId = `APRSC_SYSTEM_INDEX_${Utilities.getUuid()}`;

  let indexState = 'SYSTEM_INDEX_HEALTHY';
  let indexStatus = 'SUCCESS';
  let indexSeverity = 'INFO';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(systemMapStates).indexOf('SYSTEM_MAP_REVIEW_REQUIRED') !== -1
  ) {
    indexState = 'SYSTEM_INDEX_REVIEW_REQUIRED';
    indexStatus = 'REVIEW_REQUIRED';
    indexSeverity = 'WARN';
  } else if (
    Object.keys(systemMapStates).indexOf('SYSTEM_MAP_NO_ACTIVITY') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    indexState = 'SYSTEM_INDEX_NO_ACTIVITY';
    indexStatus = 'SUCCESS';
    indexSeverity = 'LOW';
  }

  const searchableTerms = [
    dateKey,
    businessKey,
    Object.keys(graphNodeIds).join(' '),
    Object.keys(graphNodeTypes).join(' '),
    Object.keys(graphEdgeTypes).join(' '),
    Object.keys(graphStates).join(' '),
    Object.keys(systemMapStates).join(' '),
    Object.keys(archiveStates).join(' '),
    Object.keys(closureStates).join(' '),
    Object.keys(finalizationStates).join(' '),
    Object.keys(operationalStates).join(' '),
    Object.keys(executiveStatuses).join(' '),
    Object.keys(priorities).join(' '),
    Object.keys(sourceStatuses).join(' ')
  ].join(' ').trim();

  const indexSummary =
    `Continuity system index for ${dateKey}: ${indexState}. ` +
    `${relevantRows.length} system map ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} indexed; ` +
    `${Object.keys(graphNodeIds).length} graph node key${Object.keys(graphNodeIds).length === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    indexId,
    businessKey,
    dateKey,
    SCIIP_1560_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceSystemMapIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceKnowledgeGraphRecordIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    Object.keys(systemMapStates).join(', '),
    Object.keys(systemMapSeverities).join(', '),
    indexState,
    indexSeverity,
    Object.keys(archiveStates).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    systemMapsReviewed,
    knowledgeGraphLedgerEntriesMapped,
    knowledgeGraphRecordsReviewed,
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefsReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    graphSummaries.join(' | '),
    sourceLedgerSummaries.join(' | '),
    systemMapSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    searchableTerms,
    indexSummary,
    indexStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
    result
  }));
  return result;
}

function sciip1560TargetHeaders_() {
  return [
    'System_Index_Id',
    'Business_Key',
    'Index_Date',
    'Source_Sheet',
    'System_Map_Ledger_Entries_Indexed',
    'Source_Ledger_Entry_Ids',
    'Source_System_Map_Ids',
    'Source_Business_Keys',
    'Source_Knowledge_Graph_Record_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'System_Map_States',
    'System_Map_Severities',
    'System_Index_State',
    'System_Index_Severity',
    'Archive_States',
    'Closure_States',
    'Finalization_States',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'System_Maps_Reviewed',
    'Knowledge_Graph_Ledger_Entries_Mapped',
    'Knowledge_Graph_Records_Reviewed',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Briefs_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Graph_Summaries',
    'Source_Ledger_Summaries',
    'System_Map_Summaries',
    'Input_Ledger_Summaries',
    'Searchable_Terms',
    'Index_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1560EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1560HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1560Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1560CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1560BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1560_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1560HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1560ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1560_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1560ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1560HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1560Get_(row, map, [
      'Ledger_Date',
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1560NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1560NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1560ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1560ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1560NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessorLegacy1570_();
      return sciipWrapLegacyRuntimeResult1570_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1570_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor
 ************************************************************/

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessorLegacy1570_() {
  const processor =
    '1570_AutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor';

  const ss = sciipGetSpreadsheet_();

let processingDate = sciipResolveLatestProcessingDate_();
let dateKey = '';

if (processingDate instanceof Date && !isNaN(processingDate.getTime())) {
  dateKey = sciipFormatDateKey_(processingDate);
} else if (processingDate) {
  const parsedDate = new Date(processingDate);

  if (!isNaN(parsedDate.getTime())) {
    dateKey = sciipFormatDateKey_(parsedDate);
  }
}

if (!dateKey || dateKey === '1969-12-31' || dateKey === '1970-01-01') {
  dateKey = '2026-06-25';
}

  const sourceSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexSheet_(ss);

  const ledgerSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerSheet_(ss);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER|' +
    dateKey;

  if (
  sciipAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerBusinessKeyExists_(
    ledgerSheet,
    businessKey
  )
) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceValues = sourceSheet.getDataRange().getValues();

  if (sourceValues.length < 2) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceHeaders = sourceValues[0];
  const latestSourceRow = sourceValues[sourceValues.length - 1];

  const sourceRecord = {};

  sourceHeaders.forEach(function(header, index) {
    sourceRecord[header] = latestSourceRow[index];
  });

  const now = new Date();

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemIndexDateKey || dateKey,
    sourceRecord.systemIndexScope ||
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceRecord.systemIndexName || 'Continuity System Index',
    sourceRecord.systemIndexSummary || '',
    sourceRecord.systemIndexEntryCount || '',
    sourceRecord.systemIndexStatus || '',
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemIndexLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerSheet_(ss) {
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexSummary',
      'systemIndexEntryCount',
      'systemIndexStatus',
      'sourcePayloadJson',
      'createdAt'
    ]);
  }

  return sheet;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexSheet_(ss) {
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'businessKey',
      'dateKey',
      'processor',
      'status',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexSummary',
      'systemIndexEntryCount',
      'systemIndexStatus',
      'createdAt'
    ]);
  }

  return sheet;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerProcessor',
      result
    })
  );

  return result;
}

function sciipAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerBusinessKeyExists_(
  sheet,
  businessKey
) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return false;
  }

  const headers = values[0];
  const businessKeyIndex = headers.indexOf('businessKey');

  if (businessKeyIndex === -1) {
    return false;
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][businessKeyIndex]) === String(businessKey)) {
      return true;
    }
  }

  return false;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRYS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRYS_RUNTIME_LEDGER',

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
          originalProcessor: '1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessorLegacy1580_();
      return sciipWrapLegacyRuntimeResult1580_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1580_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor
 ************************************************************/

const SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessorLegacy1580_() {
  const processor =
    '1580_AutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor';

  const ss = sciipGetSpreadsheet_();

  let processingDate = sciipResolveLatestProcessingDate_();
  let dateKey = '';

  if (processingDate instanceof Date && !isNaN(processingDate.getTime())) {
    dateKey = sciipFormatDateKey_(processingDate);
  } else if (processingDate) {
    const parsedDate = new Date(processingDate);
    if (!isNaN(parsedDate.getTime())) {
      dateKey = sciipFormatDateKey_(parsedDate);
    }
  }

  if (!dateKey || dateKey === '1969-12-31' || dateKey === '1970-01-01') {
    dateKey = '2026-06-25';
  }

  const sourceSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerSheet_(ss);

  const registrySheet =
    sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemRegistrySheet_(ss);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY|' +
    dateKey;

  if (
    sciipAutonomousProcessorExecutionRunStateContinuitySystemRegistryBusinessKeyExists_(
      registrySheet,
      businessKey
    )
  ) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceValues = sourceSheet.getDataRange().getValues();

  if (sourceValues.length < 2) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceHeaders = sourceValues[0];
  const latestSourceRow = sourceValues[sourceValues.length - 1];

  const sourceRecord = {};
  sourceHeaders.forEach(function(header, index) {
    sourceRecord[header] = latestSourceRow[index];
  });

  const now = new Date();

  registrySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Registry',
    'ACTIVE',
    'System index ledger registered as authoritative continuity system state.',
    sourceRecord.systemIndexDateKey || dateKey,
    sourceRecord.systemIndexScope || '',
    sourceRecord.systemIndexName || '',
    sourceRecord.systemIndexStatus || '',
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemRegistryEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemRegistrySheet_(ss) {
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemRegistryScope',
      'systemRegistryName',
      'systemRegistryStatus',
      'systemRegistrySummary',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'sourcePayloadJson',
      'createdAt'
    ]);
  }

  return sheet;
}

function sciipEnsureAutonomousProcessorExecutionRunStateContinuitySystemIndexLedgerSheet_(ss) {
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX_LEDGER_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexSummary',
      'systemIndexEntryCount',
      'systemIndexStatus',
      'sourcePayloadJson',
      'createdAt'
    ]);
  }

  return sheet;
}

function sciipAutonomousProcessorExecutionRunStateContinuitySystemRegistryBusinessKeyExists_(
  sheet,
  businessKey
) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return false;
  }

  const headers = values[0];
  const businessKeyIndex = headers.indexOf('businessKey');

  if (businessKeyIndex === -1) {
    return false;
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][businessKeyIndex]) === String(businessKey)) {
      return true;
    }
  }

  return false;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessorLegacy1590_();
      return sciipWrapLegacyRuntimeResult1590_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1590_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessorLegacy1590_() {
  const processor =
    '1590_AutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemRegistryScope',
      'systemRegistryName',
      'systemRegistryStatus',
      'systemRegistrySummary',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemRegistryScope',
      'systemRegistryName',
      'systemRegistryStatus',
      'systemRegistrySummary',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'sourcePayloadJson',
      'ledgerPayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_REGISTRY_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    registryBusinessKey: sourceRecord.businessKey || '',
    registryStatus: sourceRecord.systemRegistryStatus || '',
    registryName: sourceRecord.systemRegistryName || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemRegistryScope || '',
    sourceRecord.systemRegistryName || '',
    sourceRecord.systemRegistryStatus || '',
    sourceRecord.systemRegistrySummary || '',
    sourceRecord.systemIndexDateKey || '',
    sourceRecord.systemIndexScope || '',
    sourceRecord.systemIndexName || '',
    sourceRecord.systemIndexStatus || '',
    sourceRecord.sourcePayloadJson || '',
    JSON.stringify(ledgerPayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemRegistryLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATES_RUNTIME_LEDGER',

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
          originalProcessor: '1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessorLegacy1600_();
      return sciipWrapLegacyRuntimeResult1600_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1600_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessorLegacy1600_() {
  const processor =
    '1600_AutonomousProcessorExecutionRunStateContinuitySystemStateProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REGISTRY_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemRegistryScope',
      'systemRegistryName',
      'systemRegistryStatus',
      'systemRegistrySummary',
      'systemIndexDateKey',
      'systemIndexScope',
      'systemIndexName',
      'systemIndexStatus',
      'sourcePayloadJson',
      'ledgerPayloadJson',
      'createdAt'
    ]
  );

  const stateSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(stateSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const statePayload = {
    stateType: 'CONTINUITY_SYSTEM_STATE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    registryBusinessKey: sourceRecord.sourceBusinessKey || '',
    registryName: sourceRecord.systemRegistryName || '',
    registryStatus: sourceRecord.systemRegistryStatus || '',
    stateStatus: 'ACTIVE',
    stateDateKey: dateKey,
    recordedAt: now.toISOString()
  };

  stateSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System State',
    'ACTIVE',
    'Current continuity system registry ledger resolved into active system state.',
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemRegistryName || '',
    sourceRecord.systemRegistryStatus || '',
    JSON.stringify(statePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemStatesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessorLegacy1610_();
      return sciipWrapLegacyRuntimeResult1610_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1610_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessorLegacy1610_() {
  const processor =
    '1610_AutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_STATE_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    stateBusinessKey: sourceRecord.businessKey || '',
    stateName: sourceRecord.systemStateName || '',
    stateStatus: sourceRecord.systemStateStatus || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemStateScope || '',
    sourceRecord.systemStateName || '',
    sourceRecord.systemStateStatus || '',
    sourceRecord.systemStateSummary || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    sourceRecord.statePayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemStateLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemStateLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOTS_RUNTIME_LEDGER',

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
          originalProcessor: '1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessorLegacy1620_();
      return sciipWrapLegacyRuntimeResult1620_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1620_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessorLegacy1620_() {
  const processor =
    '1620_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_STATE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemStateScope',
      'systemStateName',
      'systemStateStatus',
      'systemStateSummary',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'statePayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const snapshotSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(snapshotSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemSnapshotsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemSnapshotsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const snapshotPayload = {
    snapshotType: 'CONTINUITY_SYSTEM_SNAPSHOT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    stateBusinessKey: sourceRecord.sourceBusinessKey || '',
    stateName: sourceRecord.systemStateName || '',
    stateStatus: sourceRecord.systemStateStatus || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    registryName: sourceRecord.registryName || '',
    registryStatus: sourceRecord.registryStatus || '',
    snapshotStatus: 'ACTIVE',
    snapshotDateKey: dateKey,
    capturedAt: now.toISOString()
  };

  snapshotSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Snapshot',
    'ACTIVE',
    'Active continuity system state captured as a point-in-time system snapshot.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemStateName || '',
    sourceRecord.systemStateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    JSON.stringify(snapshotPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemSnapshotsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemSnapshotProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessorLegacy1630_();
      return sciipWrapLegacyRuntimeResult1630_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1630_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessorLegacy1630_() {
  const processor =
    '1630_AutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_SNAPSHOT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    snapshotBusinessKey: sourceRecord.businessKey || '',
    snapshotName: sourceRecord.systemSnapshotName || '',
    snapshotStatus: sourceRecord.systemSnapshotStatus || '',
    snapshotDateKey: sourceRecord.snapshotDateKey || dateKey,
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemSnapshotScope || '',
    sourceRecord.systemSnapshotName || '',
    sourceRecord.systemSnapshotStatus || '',
    sourceRecord.systemSnapshotSummary || '',
    sourceRecord.snapshotDateKey || dateKey,
    sourceRecord.stateBusinessKey || '',
    sourceRecord.stateName || '',
    sourceRecord.stateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    sourceRecord.snapshotPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemSnapshotLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRRORS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRRORS_RUNTIME_LEDGER',

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
          originalProcessor: '1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessorLegacy1640_();
      return sciipWrapLegacyRuntimeResult1640_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1640_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessorLegacy1640_() {
  const processor =
    '1640_AutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_SNAPSHOT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemSnapshotScope',
      'systemSnapshotName',
      'systemSnapshotStatus',
      'systemSnapshotSummary',
      'snapshotDateKey',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'snapshotPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const mirrorSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(mirrorSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const mirrorPayload = {
    mirrorType: 'CONTINUITY_SYSTEM_MIRROR',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    snapshotBusinessKey: sourceRecord.sourceBusinessKey || '',
    snapshotName: sourceRecord.systemSnapshotName || '',
    snapshotStatus: sourceRecord.systemSnapshotStatus || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    stateName: sourceRecord.stateName || '',
    stateStatus: sourceRecord.stateStatus || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    registryName: sourceRecord.registryName || '',
    registryStatus: sourceRecord.registryStatus || '',
    mirrorStatus: 'ACTIVE',
    mirrorDateKey: dateKey,
    mirroredAt: now.toISOString()
  };

  mirrorSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Mirror',
    'ACTIVE',
    'Continuity system snapshot ledger mirrored into active system representation.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemSnapshotName || '',
    sourceRecord.systemSnapshotStatus || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.stateName || '',
    sourceRecord.stateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    JSON.stringify(mirrorPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMirrorsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessorLegacy1650_();
      return sciipWrapLegacyRuntimeResult1650_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1650_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessorLegacy1650_() {
  const processor =
    '1650_AutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_MIRROR_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    mirrorBusinessKey: sourceRecord.businessKey || '',
    mirrorName: sourceRecord.systemMirrorName || '',
    mirrorStatus: sourceRecord.systemMirrorStatus || '',
    mirrorDateKey: sourceRecord.mirrorDateKey || dateKey,
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemMirrorScope || '',
    sourceRecord.systemMirrorName || '',
    sourceRecord.systemMirrorStatus || '',
    sourceRecord.systemMirrorSummary || '',
    sourceRecord.mirrorDateKey || dateKey,
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.snapshotName || '',
    sourceRecord.snapshotStatus || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.stateName || '',
    sourceRecord.stateStatus || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.registryName || '',
    sourceRecord.registryStatus || '',
    sourceRecord.mirrorPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMirrorLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICAS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICAS_RUNTIME_LEDGER',

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
          originalProcessor: '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessorLegacy1660_();
      return sciipWrapLegacyRuntimeResult1660_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1660_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessorLegacy1660_() {
  const processor =
    '1660_AutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MIRROR_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMirrorScope',
      'systemMirrorName',
      'systemMirrorStatus',
      'systemMirrorSummary',
      'mirrorDateKey',
      'snapshotBusinessKey',
      'snapshotName',
      'snapshotStatus',
      'stateBusinessKey',
      'stateName',
      'stateStatus',
      'registryBusinessKey',
      'registryName',
      'registryStatus',
      'mirrorPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const replicaSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(replicaSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const replicaPayload = {
    replicaType: 'CONTINUITY_SYSTEM_REPLICA',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    mirrorBusinessKey: sourceRecord.sourceBusinessKey || '',
    mirrorName: sourceRecord.systemMirrorName || '',
    mirrorStatus: sourceRecord.systemMirrorStatus || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    replicaStatus: 'ACTIVE',
    replicaDateKey: dateKey,
    replicatedAt: now.toISOString()
  };

  replicaSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Replica',
    'ACTIVE',
    'Continuity system mirror ledger replicated into durable system replica state.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemMirrorName || '',
    sourceRecord.systemMirrorStatus || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    JSON.stringify(replicaPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemReplicasCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessorLegacy1670_();
      return sciipWrapLegacyRuntimeResult1670_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1670_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessorLegacy1670_() {
  const processor =
    '1670_AutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_REPLICA_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    replicaBusinessKey: sourceRecord.businessKey || '',
    replicaName: sourceRecord.systemReplicaName || '',
    replicaStatus: sourceRecord.systemReplicaStatus || '',
    replicaDateKey: sourceRecord.replicaDateKey || dateKey,
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemReplicaScope || '',
    sourceRecord.systemReplicaName || '',
    sourceRecord.systemReplicaStatus || '',
    sourceRecord.systemReplicaSummary || '',
    sourceRecord.replicaDateKey || dateKey,
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.mirrorName || '',
    sourceRecord.mirrorStatus || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.replicaPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemReplicaLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINTS_RUNTIME_LEDGER',

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
          originalProcessor: '1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessorLegacy1680_();
      return sciipWrapLegacyRuntimeResult1680_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1680_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessorLegacy1680_() {
  const processor =
    '1680_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_REPLICA_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemReplicaScope',
      'systemReplicaName',
      'systemReplicaStatus',
      'systemReplicaSummary',
      'replicaDateKey',
      'mirrorBusinessKey',
      'mirrorName',
      'mirrorStatus',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'replicaPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const checkpointSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(checkpointSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const checkpointPayload = {
    checkpointType: 'CONTINUITY_SYSTEM_CHECKPOINT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    replicaBusinessKey: sourceRecord.sourceBusinessKey || '',
    replicaName: sourceRecord.systemReplicaName || '',
    replicaStatus: sourceRecord.systemReplicaStatus || '',
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    checkpointStatus: 'ACTIVE',
    checkpointDateKey: dateKey,
    checkpointedAt: now.toISOString()
  };

  checkpointSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    'Continuity System Checkpoint',
    'ACTIVE',
    'Continuity system replica ledger captured as durable execution checkpoint.',
    dateKey,
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemReplicaName || '',
    sourceRecord.systemReplicaStatus || '',
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    JSON.stringify(checkpointPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemCheckpointsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessorLegacy1690_();
      return sciipWrapLegacyRuntimeResult1690_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1690_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v4.1
 * 1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessorLegacy1690_() {
  const processor =
    '1690_AutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const ledgerPayload = {
    ledgerType: 'SYSTEM_CHECKPOINT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    checkpointBusinessKey: sourceRecord.businessKey || '',
    checkpointName: sourceRecord.systemCheckpointName || '',
    checkpointStatus: sourceRecord.systemCheckpointStatus || '',
    checkpointDateKey: sourceRecord.checkpointDateKey || dateKey,
    replicaBusinessKey: sourceRecord.replicaBusinessKey || '',
    mirrorBusinessKey: sourceRecord.mirrorBusinessKey || '',
    snapshotBusinessKey: sourceRecord.snapshotBusinessKey || '',
    stateBusinessKey: sourceRecord.stateBusinessKey || '',
    registryBusinessKey: sourceRecord.registryBusinessKey || '',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    sourceRecord.systemCheckpointScope || '',
    sourceRecord.systemCheckpointName || '',
    sourceRecord.systemCheckpointStatus || '',
    sourceRecord.systemCheckpointSummary || '',
    sourceRecord.checkpointDateKey || dateKey,
    sourceRecord.replicaBusinessKey || '',
    sourceRecord.replicaName || '',
    sourceRecord.replicaStatus || '',
    sourceRecord.mirrorBusinessKey || '',
    sourceRecord.snapshotBusinessKey || '',
    sourceRecord.stateBusinessKey || '',
    sourceRecord.registryBusinessKey || '',
    sourceRecord.checkpointPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemCheckpointLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEXS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEXS_RUNTIME_LEDGER',

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
          originalProcessor: '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessorLegacy1700_();
      return sciipWrapLegacyRuntimeResult1700_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1700_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessorLegacy1700_() {
  const processor =
    '1700_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_CHECKPOINT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemCheckpointScope',
      'systemCheckpointName',
      'systemCheckpointStatus',
      'systemCheckpointSummary',
      'checkpointDateKey',
      'replicaBusinessKey',
      'replicaName',
      'replicaStatus',
      'mirrorBusinessKey',
      'snapshotBusinessKey',
      'stateBusinessKey',
      'registryBusinessKey',
      'checkpointPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const indexSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointBusinessKey',
      'checkpointStatus',
      'reviewDeliverablesJson',
      'architectureReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(indexSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const deliverables = [
    'Current Architecture Assessment',
    'Technical Debt and Duplication Audit',
    'Shared Infrastructure Roadmap',
    'Runtime 2.0 Design',
    'Processor Template 2.0',
    'Event Bus Architecture',
    'Knowledge Graph 2.0 Architecture',
    'Migration Plan from v4.1 to v5.0',
    'Executive Architecture Summary'
  ];

  const architectureReviewPayload = {
    reviewType: 'SCIIP_OS_V5_ARCHITECTURE_REVIEW_INDEX',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    reviewTrack: 'V5_ARCHITECTURE_REVIEW',
    currentVersion: 'SCIIP_OS v4.1',
    targetVersion: 'SCIIP_OS v5.0',
    sourceCheckpointLedgerBusinessKey: sourceRecord.businessKey || '',
    checkpointBusinessKey: sourceRecord.sourceBusinessKey || '',
    checkpointStatus: sourceRecord.systemCheckpointStatus || '',
    architectureReviewStatus: 'OPEN',
    architectureReviewPhase: 'INDEX',
    deliverables: deliverables,
    openedAt: now.toISOString()
  };

  indexSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.status || '',
    'SCIIP_OS_ARCHITECTURE',
    'SCIIP_OS v5.0 Architecture Review Index',
    'OPEN',
    'INDEX',
    'Architecture review track opened after completion of the 1600-series continuity state hardening block.',
    'V5_ARCHITECTURE_REVIEW',
    'SCIIP_OS v4.1',
    'SCIIP_OS v5.0',
    sourceRecord.sourceBusinessKey || '',
    sourceRecord.systemCheckpointStatus || '',
    JSON.stringify(deliverables),
    JSON.stringify(architectureReviewPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewIndexProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGERS_RUNTIME_LEDGER',

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
          originalProcessor: '1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessorLegacy1710_();
      return sciipWrapLegacyRuntimeResult1710_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1710_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessorLegacy1710_() {
  const processor =
    '1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'checkpointBusinessKey',
      'checkpointStatus',
      'reviewDeliverablesJson',
      'architectureReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureLedgerStatus',
      'architectureLedgerSummary',
      'architectureDecisionRecordJson',
      'architectureReviewPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const architectureDecisionRecord = {
    decisionType: 'SCIIP_OS_ARCHITECTURE_REVIEW_LEDGER',
    decisionSummary:
      'Architecture review index records are promoted into permanent ledger history so SCIIP_OS can maintain a durable, queryable record of its own platform architecture.',
    architecturalIntent:
      'Use the 1700-series as a platform evolution and architectural memory layer rather than a static design-document workflow.',
    principlesPreserved: [
      'event_sourced',
      'knowledge_graph_native',
      'gis_native',
      'ai_native',
      'processor_driven',
      'asset_driven',
      'permanent_history',
      'idempotent',
      'no_overwrites',
      'production_ready'
    ],
    platformImpact:
      'Creates explicit architecture-review ledger history that future processors can use for planning, governance, system-map enrichment, and autonomous self-improvement.',
    recommendedFutureUse:
      'Future Architecture Review Track processors should consume ledger entries as first-class architectural knowledge.'
  };

  const ledgerPayload = {
    ledgerType: 'ARCHITECTURE_REVIEW_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    sourceArchitectureReviewBusinessKey: sourceRecord.businessKey || '',
    architectureReviewStatus:
      sourceRecord.architectureReviewStatus || 'OPEN',
    architectureReviewPhase:
      sourceRecord.architectureReviewPhase || 'INDEX',
    architectureLedgerStatus: 'ACTIVE',
    recordedAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.architectureReviewStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Ledger',
    sourceRecord.architectureReviewStatus || 'OPEN',
    sourceRecord.architectureReviewPhase || 'LEDGER',
    sourceRecord.architectureReviewSummary ||
      'Architecture review index promoted into permanent architecture review ledger history.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    'ACTIVE',
    'Permanent architecture review ledger entry created from latest architecture review index record.',
    JSON.stringify(architectureDecisionRecord),
    sourceRecord.architectureReviewPayloadJson || '',
    JSON.stringify(ledgerPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNALS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNALS_RUNTIME_LEDGER',

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
          originalProcessor: '1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessorLegacy1720_();
      return sciipWrapLegacyRuntimeResult1720_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1720_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessorLegacy1720_() {
  const processor =
    '1720_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureReviewStatus',
      'architectureReviewPhase',
      'architectureReviewSummary',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureLedgerStatus',
      'architectureLedgerSummary',
      'architectureDecisionRecordJson',
      'architectureReviewPayloadJson',
      'ledgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const signalSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureSignalType',
      'architectureSignalSeverity',
      'architectureSignalStatus',
      'architectureSignalSummary',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureDecisionRecordJson',
      'signalPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(signalSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  let signalType = 'ARCHITECTURE_REVIEW_HEALTHY';
  let severity = 'INFO';
  let signalStatus = 'SUCCESS';
  let recommendedAction =
    'Continue Architecture Review Track. Use ledger entries as durable architectural memory.';
  let humanReviewRequired = 'FALSE';
  let autonomousActionAllowed = 'TRUE';

  const ledgerStatus =
    sourceRecord.architectureLedgerStatus ||
    sourceRecord.architectureReviewStatus ||
    sourceRecord.sourceStatus ||
    '';

  if (String(ledgerStatus).toUpperCase() === 'REVIEW_REQUIRED') {
    signalType = 'ARCHITECTURE_REVIEW_REVIEW_REQUIRED';
    severity = 'WARN';
    signalStatus = 'REVIEW_REQUIRED';
    recommendedAction =
      'Review architecture ledger entry before downstream architecture-review promotion.';
    humanReviewRequired = 'TRUE';
    autonomousActionAllowed = 'FALSE';
  }

  const signalPayload = {
    signalType,
    severity,
    signalStatus,
    sourceLedgerBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architectureReviewPhase:
      sourceRecord.architectureReviewPhase || 'LEDGER',
    architectureLedgerStatus:
      sourceRecord.architectureLedgerStatus || 'ACTIVE',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    emittedAt: now.toISOString()
  };

  signalSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    ledgerStatus,
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Signal',
    signalType,
    severity,
    signalStatus,
    'Architecture review signal emitted from latest permanent architecture review ledger entry.',
    recommendedAction,
    humanReviewRequired,
    autonomousActionAllowed,
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    sourceRecord.architectureDecisionRecordJson || '',
    JSON.stringify(signalPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSignalProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTERS_RUNTIME_LEDGER',

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
          originalProcessor: '1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessorLegacy1730_();
      return sciipWrapLegacyRuntimeResult1730_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1730_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessorLegacy1730_() {
  const processor =
    '1730_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SIGNAL',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'architectureSignalType',
      'architectureSignalSeverity',
      'architectureSignalStatus',
      'architectureSignalSummary',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'architectureDecisionRecordJson',
      'signalPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const commandCenterSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'commandCenterStatus',
      'commandCenterPriority',
      'commandCenterSummary',
      'architectureSignalType',
      'architectureSignalSeverity',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'commandCenterPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(commandCenterSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const signalSeverity =
    sourceRecord.architectureSignalSeverity || 'INFO';

  let commandCenterStatus = 'ACTIVE';
  let commandCenterPriority = 'NORMAL';

  if (String(signalSeverity).toUpperCase() === 'WARN') {
    commandCenterPriority = 'ELEVATED';
  }

  if (
    String(signalSeverity).toUpperCase() === 'ERROR' ||
    String(signalSeverity).toUpperCase() === 'CRITICAL'
  ) {
    commandCenterPriority = 'HIGH';
    commandCenterStatus = 'REVIEW_REQUIRED';
  }

  const commandCenterPayload = {
    commandCenterType: 'ARCHITECTURE_REVIEW_COMMAND_CENTER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceSignalBusinessKey: sourceRecord.businessKey || '',
    architectureSignalType:
      sourceRecord.architectureSignalType || 'ARCHITECTURE_REVIEW_HEALTHY',
    architectureSignalSeverity: signalSeverity,
    architectureSignalStatus:
      sourceRecord.architectureSignalStatus || sourceRecord.sourceStatus || '',
    commandCenterStatus,
    commandCenterPriority,
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    humanReviewRequired:
      sourceRecord.humanReviewRequired || 'FALSE',
    autonomousActionAllowed:
      sourceRecord.autonomousActionAllowed || 'TRUE',
    createdAt: now.toISOString()
  };

  commandCenterSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.architectureSignalStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Command Center',
    commandCenterStatus,
    commandCenterPriority,
    'Architecture review command center updated from latest architecture review signal.',
    sourceRecord.architectureSignalType || 'ARCHITECTURE_REVIEW_HEALTHY',
    signalSeverity,
    sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(commandCenterPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCentersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCommandCenterProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARYS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARYS_RUNTIME_LEDGER',

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
          originalProcessor: '1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessorLegacy1740_();
      return sciipWrapLegacyRuntimeResult1740_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1740_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessorLegacy1740_() {
  const processor =
    '1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'commandCenterStatus',
      'commandCenterPriority',
      'commandCenterSummary',
      'architectureSignalType',
      'architectureSignalSeverity',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'commandCenterPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const summarySheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'executiveSummaryStatus',
      'executiveSummaryPriority',
      'executiveSummaryTitle',
      'executiveSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'executiveSummaryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(summarySheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const executiveSummaryTitle =
    'SCIIP_OS v5.0 Architecture Review Executive Summary';

  const executiveSummary =
    'The Architecture Review Track is operating as a durable architectural memory layer. The latest command-center state indicates that SCIIP_OS can continue using architecture-review outputs as queryable platform knowledge for future processor planning, governance, continuity review, and autonomous self-improvement.';

  const keyArchitectureFinding =
    'Architecture review records should be treated as first-class SCIIP_OS knowledge graph assets, not static documentation or transient execution logs.';

  const payload = {
    summaryType: 'ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCommandCenterBusinessKey: sourceRecord.businessKey || '',
    commandCenterStatus: sourceRecord.commandCenterStatus || '',
    commandCenterPriority: sourceRecord.commandCenterPriority || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    executiveSummaryTitle,
    executiveSummary,
    keyArchitectureFinding,
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    createdAt: now.toISOString()
  };

  summarySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.commandCenterStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || executiveSummaryTitle,
    'ACTIVE',
    sourceRecord.commandCenterPriority || 'NORMAL',
    executiveSummaryTitle,
    executiveSummary,
    keyArchitectureFinding,
    sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(payload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEFS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEFS_RUNTIME_LEDGER',

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
          originalProcessor: '1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessorLegacy1750_();
      return sciipWrapLegacyRuntimeResult1750_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1750_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessorLegacy1750_() {
  const processor =
    '1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'executiveSummaryStatus',
      'executiveSummaryPriority',
      'executiveSummaryTitle',
      'executiveSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'executiveSummaryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const briefSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'dailyBriefStatus',
      'dailyBriefPriority',
      'dailyBriefTitle',
      'dailyBriefSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'dailyBriefPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(briefSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const dailyBriefTitle =
    'SCIIP_OS v5.0 Architecture Review Daily Brief';

  const dailyBriefSummary =
    'Architecture Review Track remains active. The latest executive summary confirms that SCIIP_OS is preserving architecture-review outputs as durable platform memory for continuity, governance, planning, and autonomous improvement.';

  const payload = {
    briefType: 'ARCHITECTURE_REVIEW_DAILY_BRIEF',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceExecutiveSummaryBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    executiveSummaryStatus:
      sourceRecord.executiveSummaryStatus || sourceRecord.sourceStatus || '',
    executiveSummaryPriority:
      sourceRecord.executiveSummaryPriority || 'NORMAL',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    dailyBriefTitle,
    dailyBriefSummary,
    keyArchitectureFinding:
      sourceRecord.keyArchitectureFinding ||
      'Architecture review records should be treated as first-class SCIIP_OS knowledge assets.',
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    createdAt: now.toISOString()
  };

  briefSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.executiveSummaryStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || dailyBriefTitle,
    'ACTIVE',
    sourceRecord.executiveSummaryPriority || 'NORMAL',
    dailyBriefTitle,
    dailyBriefSummary,
    sourceRecord.keyArchitectureFinding ||
      'Architecture review records should be treated as first-class SCIIP_OS knowledge assets.',
    sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(payload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATIONS_RUNTIME_LEDGER',

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
          originalProcessor: '1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessorLegacy1760_();
      return sciipWrapLegacyRuntimeResult1760_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1760_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessorLegacy1760_() {
  const processor =
    '1760_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'dailyBriefStatus',
      'dailyBriefPriority',
      'dailyBriefTitle',
      'dailyBriefSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'dailyBriefPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const finalizationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'finalizationStatus',
      'finalizationPriority',
      'finalizationSummary',
      'finalizedArchitectureFinding',
      'finalizedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'finalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(finalizationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const finalizedArchitectureFinding =
    sourceRecord.keyArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const finalizedRecommendation =
    sourceRecord.recommendedAction ||
    'Continue Architecture Review Track and preserve all architecture-review outputs as permanent platform memory.';

  const finalizationPayload = {
    finalizationType: 'ARCHITECTURE_REVIEW_FINALIZATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceDailyBriefBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    dailyBriefStatus:
      sourceRecord.dailyBriefStatus || sourceRecord.sourceStatus || '',
    dailyBriefPriority:
      sourceRecord.dailyBriefPriority || 'NORMAL',
    finalizationStatus: 'FINALIZED',
    finalizedArchitectureFinding,
    finalizedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    finalizedAt: now.toISOString()
  };

  finalizationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.dailyBriefStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Finalization',
    'FINALIZED',
    sourceRecord.dailyBriefPriority || 'NORMAL',
    'Architecture review daily brief finalized into permanent architecture-review finalization history.',
    finalizedArchitectureFinding,
    finalizedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(finalizationPayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFinalizationProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURES_RUNTIME_LEDGER',

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
          originalProcessor: '1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessorLegacy1770_();
      return sciipWrapLegacyRuntimeResult1770_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1770_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessorLegacy1770_() {
  const processor =
    '1770_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FINALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'finalizationStatus',
      'finalizationPriority',
      'finalizationSummary',
      'finalizedArchitectureFinding',
      'finalizedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'finalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const closureSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'closureStatus',
      'closurePriority',
      'closureSummary',
      'closedArchitectureFinding',
      'closedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'closurePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(closureSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const closedArchitectureFinding =
    sourceRecord.finalizedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const closedRecommendation =
    sourceRecord.finalizedRecommendation ||
    'Preserve architecture-review outputs as permanent platform memory and make them available to downstream continuity processors.';

  const closurePayload = {
    closureType: 'ARCHITECTURE_REVIEW_CLOSURE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceFinalizationBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    finalizationStatus:
      sourceRecord.finalizationStatus || sourceRecord.sourceStatus || '',
    finalizationPriority:
      sourceRecord.finalizationPriority || 'NORMAL',
    closureStatus: 'CLOSED',
    closedArchitectureFinding,
    closedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    closedAt: now.toISOString()
  };

  closureSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.finalizationStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Closure',
    'CLOSED',
    sourceRecord.finalizationPriority || 'NORMAL',
    'Architecture review finalization closed into permanent architecture-review closure history.',
    closedArchitectureFinding,
    closedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(closurePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewClosuresCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewClosureProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVES_RUNTIME_LEDGER',

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
          originalProcessor: '1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessorLegacy1780_();
      return sciipWrapLegacyRuntimeResult1780_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1780_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessorLegacy1780_() {
  const processor =
    '1780_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CLOSURE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'closureStatus',
      'closurePriority',
      'closureSummary',
      'closedArchitectureFinding',
      'closedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'closurePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const archiveSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'archiveStatus',
      'archivePriority',
      'archiveSummary',
      'archivedArchitectureFinding',
      'archivedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'archivePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(archiveSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const archivedArchitectureFinding =
    sourceRecord.closedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const archivedRecommendation =
    sourceRecord.closedRecommendation ||
    'Archive architecture-review closure outputs as permanent platform memory for future continuity and autonomous planning.';

  const archivePayload = {
    archiveType: 'ARCHITECTURE_REVIEW_ARCHIVE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceClosureBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    closureStatus:
      sourceRecord.closureStatus || sourceRecord.sourceStatus || '',
    closurePriority:
      sourceRecord.closurePriority || 'NORMAL',
    archiveStatus: 'ARCHIVED',
    archivedArchitectureFinding,
    archivedRecommendation,
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    archivedAt: now.toISOString()
  };

  archiveSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.closureStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Archive',
    'ARCHIVED',
    sourceRecord.closurePriority || 'NORMAL',
    'Architecture review closure archived into permanent architecture-review archive history.',
    archivedArchitectureFinding,
    archivedRecommendation,
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(archivePayload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewArchivesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewArchiveProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPHS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPHS_RUNTIME_LEDGER',

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
          originalProcessor: '1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessorLegacy1790_();
      return sciipWrapLegacyRuntimeResult1790_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1790_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessorLegacy1790_() {
  const processor =
    '1790_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ARCHIVE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'archiveStatus',
      'archivePriority',
      'archiveSummary',
      'archivedArchitectureFinding',
      'archivedRecommendation',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'archivePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const kgSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'nodeType',
      'nodeKey',
      'nodeLabel',
      'relationshipType',
      'relationshipTargetKey',
      'architectureReviewScope',
      'architectureReviewName',
      'knowledgeGraphStatus',
      'knowledgeGraphSummary',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'knowledgeGraphPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(kgSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const nodeType = 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE';

  const nodeKey =
    'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE|' +
    dateKey +
    '|SCIIP_OS_V5_ARCHITECTURE_MEMORY';

  const architectureFinding =
    sourceRecord.archivedArchitectureFinding ||
    'Architecture review records are first-class SCIIP_OS knowledge assets.';

  const architectureRecommendation =
    sourceRecord.archivedRecommendation ||
    'Preserve architecture-review records as permanent graph-ready platform memory for future continuity processors.';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.archiveStatus || sourceRecord.sourceStatus || '',
    architectureReviewScope: sourceRecord.architectureReviewScope || '',
    architectureReviewName: sourceRecord.architectureReviewName || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const knowledgeGraphPayload = {
    knowledgeGraphType: 'ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceArchiveBusinessKey: sourceRecord.businessKey || '',
    nodeType,
    nodeKey,
    nodeLabel: 'SCIIP_OS v5.0 Architecture Review Memory',
    relationshipType: 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    relationshipTargetKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    architectureFinding,
    architectureRecommendation,
    knowledgeGraphStatus: 'ACTIVE',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  kgSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.archiveStatus || sourceRecord.sourceStatus || '',
    nodeType,
    nodeKey,
    'SCIIP_OS v5.0 Architecture Review Memory',
    'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.businessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || 'SCIIP_OS v5.0 Architecture Review Knowledge Graph',
    'ACTIVE',
    'Architecture review archive promoted into graph-ready architectural knowledge.',
    'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    architectureFinding,
    architectureRecommendation,
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(knowledgeGraphPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewKnowledgeGraphProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAPS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAPS_RUNTIME_LEDGER',

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
          originalProcessor: '1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessorLegacy1800_();
      return sciipWrapLegacyRuntimeResult1800_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1800_(legacyResult, context, transaction) {
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

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessorLegacy1800_() {
  const processor =
    '1800_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_KNOWLEDGE_GRAPH',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'nodeType',
      'nodeKey',
      'nodeLabel',
      'relationshipType',
      'relationshipTargetKey',
      'architectureReviewScope',
      'architectureReviewName',
      'knowledgeGraphStatus',
      'knowledgeGraphSummary',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'knowledgeGraphPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const systemMapSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'systemMapScope',
      'systemMapName',
      'systemMapStatus',
      'systemMapSummary',
      'mappedNodeType',
      'mappedNodeKey',
      'mappedNodeLabel',
      'mappedRelationshipType',
      'mappedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'systemMapPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_SYSTEM_MAP|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(systemMapSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.knowledgeGraphStatus || sourceRecord.sourceStatus || '',
    nodeType: sourceRecord.nodeType || '',
    nodeKey: sourceRecord.nodeKey || '',
    nodeLabel: sourceRecord.nodeLabel || '',
    relationshipType: sourceRecord.relationshipType || '',
    relationshipTargetKey: sourceRecord.relationshipTargetKey || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const systemMapPayload = {
    systemMapType: 'ARCHITECTURE_REVIEW_SYSTEM_MAP',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceKnowledgeGraphBusinessKey: sourceRecord.businessKey || '',
    mappedNodeType:
      sourceRecord.nodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    mappedNodeKey:
      sourceRecord.nodeKey || '',
    mappedNodeLabel:
      sourceRecord.nodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    mappedRelationshipType:
      sourceRecord.relationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    mappedRelationshipTargetKey:
      sourceRecord.relationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    systemMapStatus: 'ACTIVE',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    createdAt: now.toISOString()
  };

  systemMapSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.knowledgeGraphStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_SYSTEM_MAP',
    'SCIIP_OS v5.0 Architecture Review System Map',
    'ACTIVE',
    'Architecture review knowledge graph node mapped into SCIIP_OS system architecture map.',
    sourceRecord.nodeType || 'ARCHITECTURE_REVIEW_KNOWLEDGE_NODE',
    sourceRecord.nodeKey || '',
    sourceRecord.nodeLabel || 'SCIIP_OS v5.0 Architecture Review Memory',
    sourceRecord.relationshipType || 'DERIVED_FROM_ARCHITECTURE_REVIEW_ARCHIVE',
    sourceRecord.relationshipTargetKey || sourceRecord.sourceBusinessKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    sourceRecord.architectureFinding ||
      'Architecture review records are first-class SCIIP_OS knowledge assets.',
    sourceRecord.architectureRecommendation ||
      'Preserve architecture-review records as graph-ready platform memory for future continuity processors.',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(systemMapPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewSystemMapProcessor',
      result
    })
  );

  return result;
}