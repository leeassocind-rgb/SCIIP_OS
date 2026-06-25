/*******************************************************
 * SCIIP_OS v4.1
 * 920_AutonomousProcessorExecutionPlanProcessor
 *
 * Purpose:
 * Converts autonomous processor guidance into permanent
 * implementation execution plans.
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
const SCIIP_920_SPREADSHEET_ID = '1x5lXkh0l63v92tYacGe7S8vHISHycBufaLfE54dPPDk';

function sciip920ResolveSpreadsheet_() {
  if (typeof sciipResolveSpreadsheet_ === 'function') {
    const resolved = sciipResolveSpreadsheet_();
    if (resolved) return resolved;
  }

  if (typeof SCIIP_920_SPREADSHEET_ID !== 'undefined' && SCIIP_920_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SCIIP_920_SPREADSHEET_ID);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error(
    `${SCIIP_920_PROCESSOR}: Unable to resolve spreadsheet. Paste your SCIIP_OS Google Sheet ID into SCIIP_920_SPREADSHEET_ID.`
  );
}

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorExecutionPlanProcessor() {
  const startedAt = new Date();
  const ss = sciip920ResolveSpreadsheet_();

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

  const records = guidanceRows.map((row, i) =>
    sciip920BuildExecutionPlan_(row, resolvedPlanDate, businessKey, startedAt, i)
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
    row.Source_ID ||
    `GUIDANCE_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    row.Processor ||
    row.Recommended_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const priority = row.Priority || row.Guidance_Priority || 'NORMAL';

  const action =
    row.Guidance ||
    row.Recommendation ||
    row.Processor_Guidance ||
    'Create next downstream processor using SCIIP_OS v4.1 standards.';

  return [
    sciip920CreateId_('EXEC_PLAN'),
    planDate,
    sourceGuidanceId,
    targetProcessor,
    priority,
    action,
    row.Required_Input || row.Input_Sheet || 'Resolved from upstream processor output',
    row.Required_Output || row.Output_Sheet || 'Permanent downstream history sheet',
    'Resolved latest processing date, prefix idempotency, standalone spreadsheet resolver',
    'Strengthens autonomous processor knowledge graph by converting guidance into executable planning history',
    'Processor must return SUCCESS on first run and skippedDuplicate = 1 on rerun',
    'READY_FOR_BUILD',
    `${businessKey}|${targetProcessor}|${sourceGuidanceId}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip920ReadRowsForDate_(sheet, dateColumn, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIdx = headers.indexOf(dateColumn);

  if (dateIdx === -1) {
    throw new Error(`${SCIIP_920_PROCESSOR}: Missing input date column: ${dateColumn}`);
  }

  return values.slice(1)
    .filter(r => sciipFormatDateKey_(r[dateIdx]) === dateKey)
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });
}

function sciip920EnsureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip920ResolveSpreadsheet_() {
  if (typeof sciipResolveSpreadsheet_ === 'function') {
    const resolved = sciipResolveSpreadsheet_();
    if (resolved) return resolved;
  }

  if (typeof SCIIP_SPREADSHEET_ID !== 'undefined' && SCIIP_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SCIIP_SPREADSHEET_ID);
  }

  if (typeof SCIIP_CONFIG !== 'undefined' && SCIIP_CONFIG.SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SCIIP_CONFIG.SPREADSHEET_ID);
  }

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error(
    `${SCIIP_920_PROCESSOR}: Unable to resolve spreadsheet. ` +
    `Set SCIIP_SPREADSHEET_ID or SCIIP_CONFIG.SPREADSHEET_ID.`
  );
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