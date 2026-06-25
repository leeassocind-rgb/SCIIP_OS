/*******************************************************
 * SCIIP_OS v4.1
 * 920_AutonomousProcessorExecutionPlanProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_920_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_GUIDANCE';
const SCIIP_920_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS';
const SCIIP_920_INPUT_DATE_COLUMN = 'Guidance_Date';

const SCIIP_920_OUTPUT_HEADERS = [
  'Execution_Plan_ID',
  'Plan_Date',
  'Source_Guidance_ID',
  'Target_Processor',
  'Priority',
  'Execution_Action',
  'Required_Input',
  'Required_Output',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Test_Expectation',
  'Status',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_920_PROCESSOR = '920_AutonomousProcessorExecutionPlanProcessor';
const SCIIP_920_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_PLAN';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorExecutionPlanProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_920_INPUT_SHEET);
  if (!inputSheet) {
    return sciip920Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip920EnsureSheet_(ss, SCIIP_920_OUTPUT_SHEET, SCIIP_920_OUTPUT_HEADERS);

  const resolvedPlanDate =
    sciipResolveLatestProcessingDate_(SCIIP_920_INPUT_SHEET, SCIIP_920_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_920_BUSINESS_PREFIX}|${resolvedPlanDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip920Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const guidanceRows = sciip920ReadRowsForDate_(inputSheet, SCIIP_920_INPUT_DATE_COLUMN, resolvedPlanDate);

  if (!guidanceRows.length) {
    return sciip920Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = guidanceRows.map((row, index) =>
    sciip920BuildExecutionPlan_(row, resolvedPlanDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_920_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip920Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip920BuildExecutionPlan_(row, planDate, businessKey, startedAt, index) {
  const sourceGuidanceId =
    row.Guidance_ID ||
    row.Autonomous_Guidance_ID ||
    row.Source_Guidance_ID ||
    `GUIDANCE_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    row.Processor ||
    row.Recommended_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const priority =
    row.Priority ||
    row.Guidance_Priority ||
    'NORMAL';

  const executionAction =
    row.Guidance ||
    row.Recommendation ||
    row.Processor_Guidance ||
    row.Action ||
    'Create next downstream SCIIP_OS processor using v4.1 architecture standards.';

  return [
    sciip920CreateId_('EXEC_PLAN'),
    planDate,
    sourceGuidanceId,
    targetProcessor,
    priority,
    executionAction,
    row.Required_Input || row.Input_Sheet || SCIIP_920_INPUT_SHEET,
    row.Required_Output || row.Output_Sheet || SCIIP_920_OUTPUT_SHEET,
    'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    'Converts autonomous processor guidance into build-ready execution plan history',
    'First run creates execution plans; second run returns skippedDuplicate = 1',
    'READY_FOR_BUILD',
    `${businessKey}|${targetProcessor}|${sourceGuidanceId}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip920ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_920_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip920EnsureSheet_(ss, sheetName, headers) {
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

function sciip920CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip920Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_920_PROCESSOR,
    status,
    autonomousProcessorExecutionPlansCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorExecutionPlanProcessor() {
  const result = sciipRunAutonomousProcessorExecutionPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionPlanProcessor',
    result
  }));

  return result;
}