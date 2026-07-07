/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 940_AutonomousProcessorBuildValidationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorBuildValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '940_AutonomousProcessorBuildValidationProcessor',
    action: 'AUTONOMOUS_BUILD_VALIDATION_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_BUILD_TASKS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS_RUNTIME_LEDGER',

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
          originalProcessor: '940_AutonomousProcessorBuildValidationProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorBuildValidationProcessorLegacy940_();
      return sciipWrapLegacyRuntimeResult940_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult940_(legacyResult, context, transaction) {
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
 * 940_AutonomousProcessorBuildValidationProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_940_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_BUILD_TASKS';
const SCIIP_940_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS';
const SCIIP_940_INPUT_DATE_COLUMN = 'Build_Task_Date';

const SCIIP_940_OUTPUT_HEADERS = [
  'Build_Validation_ID',
  'Validation_Date',
  'Source_Build_Task_ID',
  'Target_Processor',
  'Build_Phase',
  'Validation_Check',
  'Expected_Result',
  'Failure_Risk',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Validation_Status',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_940_PROCESSOR = '940_AutonomousProcessorBuildValidationProcessor';
const SCIIP_940_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATION';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorBuildValidationProcessorLegacy940_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_940_INPUT_SHEET);
  if (!inputSheet) {
    return sciip940Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip940EnsureSheet_(ss, SCIIP_940_OUTPUT_SHEET, SCIIP_940_OUTPUT_HEADERS);

  const resolvedValidationDate =
    sciipResolveLatestProcessingDate_(SCIIP_940_INPUT_SHEET, SCIIP_940_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_940_BUSINESS_PREFIX}|${resolvedValidationDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip940Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const buildTasks = sciip940ReadRowsForDate_(
    inputSheet,
    SCIIP_940_INPUT_DATE_COLUMN,
    resolvedValidationDate
  );

  if (!buildTasks.length) {
    return sciip940Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = buildTasks.map((row, index) =>
    sciip940BuildValidation_(row, resolvedValidationDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_940_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip940Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip940BuildValidation_(row, validationDate, businessKey, startedAt, index) {
  const sourceBuildTaskId =
    row.Build_Task_ID ||
    row.Source_Build_Task_ID ||
    `BUILD_TASK_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const buildPhase =
    row.Build_Phase ||
    'GENERAL';

  const validationCheck = sciip940ValidationCheckForPhase_(buildPhase, row);

  return [
    sciip940CreateId_('BUILD_VALIDATION'),
    validationDate,
    sourceBuildTaskId,
    targetProcessor,
    buildPhase,
    validationCheck.check,
    validationCheck.expected,
    validationCheck.risk,
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Creates permanent validation history for autonomous processor build tasks',
    'PENDING_VALIDATION',
    `${businessKey}|${targetProcessor}|${sourceBuildTaskId}|${buildPhase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip940ValidationCheckForPhase_(phase, row) {
  const normalizedPhase = String(phase || '').toUpperCase();

  if (normalizedPhase === 'SCHEMA') {
    return {
      check: 'Confirm output sheet exists, headers are complete, and no prior history is overwritten.',
      expected: 'Output sheet is created if missing; header row is frozen; records append below existing history.',
      risk: 'Schema drift or missing headers could break downstream processors.'
    };
  }

  if (normalizedPhase === 'PROCESSOR') {
    return {
      check: 'Confirm processor resolves latest input date, filters source rows by that date, and uses prefix business-key idempotency.',
      expected: 'First eligible run creates records; duplicate run returns skippedDuplicate = 1.',
      risk: 'Incorrect date resolution or idempotency could create duplicate or stale records.'
    };
  }

  if (normalizedPhase === 'TEST') {
    return {
      check: 'Confirm standalone test function logs structured JSON and validates duplicate behavior.',
      expected: 'Test returns SUCCESS with created count or skippedDuplicate = 1 on rerun.',
      risk: 'Insufficient test coverage could allow silent downstream failure.'
    };
  }

  return {
    check: row.Acceptance_Criteria || 'Confirm build task satisfies SCIIP_OS v4.1 architecture standards.',
    expected: 'Task is validated without overwriting prior history.',
    risk: 'Unvalidated task may weaken downstream processor chain.'
  };
}

function sciip940ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_940_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip940EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip940CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip940Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_940_PROCESSOR,
    status,
    autonomousProcessorBuildValidationsCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorBuildValidationProcessor() {
  const result = sciipRunAutonomousProcessorBuildValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorBuildValidationProcessor',
    result
  }));

  return result;
}