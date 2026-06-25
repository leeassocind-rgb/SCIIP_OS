/*******************************************************
 * SCIIP_OS v4.1
 * 930_AutonomousProcessorBuildTaskProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_930_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS';
const SCIIP_930_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_BUILD_TASKS';
const SCIIP_930_INPUT_DATE_COLUMN = 'Plan_Date';

const SCIIP_930_OUTPUT_HEADERS = [
  'Build_Task_ID',
  'Build_Task_Date',
  'Source_Execution_Plan_ID',
  'Target_Processor',
  'Build_Phase',
  'Build_Task',
  'Required_Input',
  'Required_Output',
  'Acceptance_Criteria',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Status',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_930_PROCESSOR = '930_AutonomousProcessorBuildTaskProcessor';
const SCIIP_930_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_BUILD_TASK';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorBuildTaskProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_930_INPUT_SHEET);
  if (!inputSheet) {
    return sciip930Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip930EnsureSheet_(ss, SCIIP_930_OUTPUT_SHEET, SCIIP_930_OUTPUT_HEADERS);

  const resolvedBuildDate =
    sciipResolveLatestProcessingDate_(SCIIP_930_INPUT_SHEET, SCIIP_930_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_930_BUSINESS_PREFIX}|${resolvedBuildDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip930Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const executionPlans = sciip930ReadRowsForDate_(inputSheet, SCIIP_930_INPUT_DATE_COLUMN, resolvedBuildDate);

  if (!executionPlans.length) {
    return sciip930Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = [];

  executionPlans.forEach((row, index) => {
    records.push(
      sciip930BuildTask_(row, resolvedBuildDate, businessKey, startedAt, index, 'SCHEMA', 'Define output sheet schema and required headers.'),
      sciip930BuildTask_(row, resolvedBuildDate, businessKey, startedAt, index, 'PROCESSOR', 'Implement main processor with resolved-date filtering and idempotent business key logic.'),
      sciip930BuildTask_(row, resolvedBuildDate, businessKey, startedAt, index, 'TEST', 'Implement and run standalone test function validating first run and duplicate rerun behavior.')
    );
  });

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_930_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip930Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip930BuildTask_(row, buildDate, businessKey, startedAt, index, phase, task) {
  const sourceExecutionPlanId =
    row.Execution_Plan_ID ||
    row.Source_Execution_Plan_ID ||
    `EXECUTION_PLAN_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  return [
    sciip930CreateId_('BUILD_TASK'),
    buildDate,
    sourceExecutionPlanId,
    targetProcessor,
    phase,
    task,
    row.Required_Input || SCIIP_930_INPUT_SHEET,
    row.Required_Output || 'Downstream processor output sheet',
    row.Test_Expectation || 'First run creates records; second run returns skippedDuplicate = 1',
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Transforms execution plans into build task history for autonomous processor development',
    'READY',
    `${businessKey}|${targetProcessor}|${sourceExecutionPlanId}|${phase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip930ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_930_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip930EnsureSheet_(ss, sheetName, headers) {
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

function sciip930CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip930Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_930_PROCESSOR,
    status,
    autonomousProcessorBuildTasksCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorBuildTaskProcessor() {
  const result = sciipRunAutonomousProcessorBuildTaskProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorBuildTaskProcessor',
    result
  }));

  return result;
}