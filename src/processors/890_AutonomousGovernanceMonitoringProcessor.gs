/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 890_AutonomousGovernanceMonitoringProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousGovernanceMonitoringProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '890_AutonomousGovernanceMonitoringProcessor',
    action: 'AUTONOMOUS_GOVERNANCE_MONITORING_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_MONITORING',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_MONITORING_RUNTIME_LEDGER',

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
          originalProcessor: '890_AutonomousGovernanceMonitoringProcessor',
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
      var legacyResult = sciipRunAutonomousGovernanceMonitoringProcessorLegacy890_();
      return sciipWrapLegacyRuntimeResult890_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult890_(legacyResult, context, transaction) {
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
 * 890_AutonomousGovernanceMonitoringProcessor
 *******************************************************/

const AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME = '890_AutonomousGovernanceMonitoringProcessor';

const AUTONOMOUS_GOVERNANCE_MONITORING_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS';
const AUTONOMOUS_GOVERNANCE_MONITORING_OUTPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_MONITORING';

const AUTONOMOUS_GOVERNANCE_MONITORING_SCHEMA = [
  'Monitoring_ID',
  'Business_Key',
  'Monitoring_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Monitoring_Title',
  'Monitoring_Type',
  'Monitored_Standard',
  'Monitoring_Finding',
  'Monitoring_Status',
  'Next_Review_Action',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousGovernanceMonitoringProcessorLegacy890_() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousGovernanceMonitoringSheet_();

  const monitoringDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_GOVERNANCE_MONITORING_INPUT_SHEET,
      'Enforcement_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_GOVERNANCE_MONITORING|${monitoringDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
    resolvedMonitoringDate: monitoringDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousGovernanceMonitoringCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceEnforcementsForMonitoringDate_(monitoringDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousGovernanceMonitoringCreated: 0,
      monitoringDate,
      completedAt: new Date().toISOString()
    };
  }

  const monitoring = sciipBuildAutonomousGovernanceMonitoring_({
    monitoringDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousGovernanceMonitoring_(monitoring);

  return {
    processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousGovernanceMonitoringCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousGovernanceMonitoring_(payload) {
  const monitoringId = `AUTONOMOUS_GOVERNANCE_MONITORING_${Utilities.getUuid()}`;

  return {
    Monitoring_ID: monitoringId,
    Business_Key: payload.businessKey,
    Monitoring_Date: payload.monitoringDate,
    Source_Sheet: AUTONOMOUS_GOVERNANCE_MONITORING_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Monitoring_Title: `Autonomous Governance Monitoring — ${payload.monitoringDate}`,
    Monitoring_Type: 'PROCESSOR_STANDARD_MONITORING',
    Monitored_Standard: 'Latest Completed Processing Date Standard',
    Monitoring_Finding: sciipCreateAutonomousGovernanceMonitoringFinding_(payload.sourceRows),
    Monitoring_Status: 'ACTIVE_MONITORING',
    Next_Review_Action: sciipCreateAutonomousGovernanceMonitoringNextAction_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousGovernanceMonitoringSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_MONITORING_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_GOVERNANCE_MONITORING_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_MONITORING_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_MONITORING_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceEnforcementsForMonitoringDate_(monitoringDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_MONITORING_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Enforcement_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_GOVERNANCE_MONITORING_PROCESSOR_NAME,
      error: 'ENFORCEMENT_DATE_COLUMN_NOT_FOUND',
      headers
    }));
    return [];
  }

  return values
    .slice(1)
    .filter(row => {
      const rawDate = row[dateIndex];
      const rowDate =
        rawDate instanceof Date
          ? sciipFormatDateKey_(rawDate)
          : String(rawDate).trim();

      return rowDate === monitoringDate;
    })
    .map(row => sciipAutonomousGovernanceMonitoringRowToObject_(headers, row));
}

function sciipCreateAutonomousGovernanceMonitoringFinding_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} active governance enforcement record(s).`,
    'The latest completed processing date standard is active and should be monitored during all future downstream processor builds.',
    'Future monitoring should look for processors that incorrectly default to the current execution date when upstream batch dates exist.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceMonitoringNextAction_(sourceRows) {
  return [
    'During each future processor build, verify the input sheet and upstream date column.',
    'Confirm the processor uses sciipResolveLatestProcessingDate_() before falling back to the current date.',
    'Confirm the resolved date is used in both business key creation and input-row filtering.',
    'Confirm duplicate protection returns skippedDuplicate: 1 on the second test run.'
  ].join('\n');
}

function sciipAppendAutonomousGovernanceMonitoring_(monitoring) {
  const sheet = sciipEnsureAutonomousGovernanceMonitoringSheet_();

  const row = AUTONOMOUS_GOVERNANCE_MONITORING_SCHEMA.map(header => monitoring[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousGovernanceMonitoringRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceMonitoringProcessor() {
  const result = sciipRunAutonomousGovernanceMonitoringProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceMonitoringProcessor',
    result
  }));

  return result;
}