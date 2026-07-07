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