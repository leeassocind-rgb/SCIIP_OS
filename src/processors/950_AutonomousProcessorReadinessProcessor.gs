/*******************************************************
 * SCIIP_OS v4.1
 * 950_AutonomousProcessorReadinessProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_950_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS';
const SCIIP_950_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_READINESS';
const SCIIP_950_INPUT_DATE_COLUMN = 'Validation_Date';

const SCIIP_950_OUTPUT_HEADERS = [
  'Readiness_ID',
  'Readiness_Date',
  'Source_Validation_ID',
  'Target_Processor',
  'Build_Phase',
  'Readiness_Status',
  'Readiness_Rationale',
  'Required_Next_Action',
  'Blocking_Risk',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_950_PROCESSOR = '950_AutonomousProcessorReadinessProcessor';
const SCIIP_950_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_READINESS';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorReadinessProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_950_INPUT_SHEET);
  if (!inputSheet) {
    return sciip950Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip950EnsureSheet_(ss, SCIIP_950_OUTPUT_SHEET, SCIIP_950_OUTPUT_HEADERS);

  const resolvedReadinessDate =
    sciipResolveLatestProcessingDate_(SCIIP_950_INPUT_SHEET, SCIIP_950_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_950_BUSINESS_PREFIX}|${resolvedReadinessDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip950Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const validations = sciip950ReadRowsForDate_(
    inputSheet,
    SCIIP_950_INPUT_DATE_COLUMN,
    resolvedReadinessDate
  );

  if (!validations.length) {
    return sciip950Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = validations.map((row, index) =>
    sciip950BuildReadiness_(row, resolvedReadinessDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_950_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip950Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip950BuildReadiness_(row, readinessDate, businessKey, startedAt, index) {
  const sourceValidationId =
    row.Build_Validation_ID ||
    row.Source_Validation_ID ||
    `BUILD_VALIDATION_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const buildPhase =
    row.Build_Phase ||
    'GENERAL';

  const validationStatus =
    row.Validation_Status ||
    'PENDING_VALIDATION';

  const readiness = sciip950ResolveReadiness_(validationStatus, buildPhase, row);

  return [
    sciip950CreateId_('READINESS'),
    readinessDate,
    sourceValidationId,
    targetProcessor,
    buildPhase,
    readiness.status,
    readiness.rationale,
    readiness.nextAction,
    readiness.blockingRisk,
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Creates permanent readiness signal from build validation history',
    `${businessKey}|${targetProcessor}|${sourceValidationId}|${buildPhase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip950ResolveReadiness_(validationStatus, buildPhase, row) {
  const status = String(validationStatus || '').toUpperCase();

  if (status === 'VALIDATED' || status === 'PASSED' || status === 'SUCCESS') {
    return {
      status: 'READY',
      rationale: 'Validation passed and processor build phase is ready for downstream use.',
      nextAction: 'Proceed to downstream processor implementation or orchestration.',
      blockingRisk: 'NONE'
    };
  }

  if (status === 'FAILED' || status === 'BLOCKED') {
    return {
      status: 'BLOCKED',
      rationale: row.Failure_Risk || 'Validation indicates a blocking issue.',
      nextAction: 'Resolve validation failure before advancing processor chain.',
      blockingRisk: row.Failure_Risk || 'Validation failure may break downstream processor reliability.'
    };
  }

  return {
    status: 'NEEDS_REVIEW',
    rationale: `Build phase ${buildPhase} has pending validation and should be reviewed before promotion.`,
    nextAction: 'Review validation check and confirm whether this phase is ready.',
    blockingRisk: row.Failure_Risk || 'Pending validation may allow incomplete processor work downstream.'
  };
}

function sciip950ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_950_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip950EnsureSheet_(ss, sheetName, headers) {
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

function sciip950CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip950Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_950_PROCESSOR,
    status,
    autonomousProcessorReadinessCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorReadinessProcessor() {
  const result = sciipRunAutonomousProcessorReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorReadinessProcessor',
    result
  }));

  return result;
}