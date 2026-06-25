/*******************************************************
 * 790_AutonomousImprovementExecutionProcessor
 *******************************************************/

const AUTONOMOUS_IMPROVEMENT_EXECUTION_PROCESSOR_NAME = '790_AutonomousImprovementExecutionProcessor';

const AUTONOMOUS_IMPROVEMENT_EXECUTION_INPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_TASKS';
const AUTONOMOUS_IMPROVEMENT_EXECUTION_OUTPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS';

const AUTONOMOUS_IMPROVEMENT_EXECUTION_SCHEMA = [
  'Execution_ID',
  'Business_Key',
  'Execution_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Execution_Title',
  'Execution_Summary',
  'Execution_Status',
  'Execution_Result',
  'Next_Action',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousImprovementExecutionProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousImprovementExecutionSheet_();

  const executionDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_IMPROVEMENT_EXECUTION_INPUT_SHEET,
      'Task_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_IMPROVEMENT_EXECUTION|${executionDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_IMPROVEMENT_EXECUTION_PROCESSOR_NAME,
    resolvedExecutionDate: executionDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_EXECUTION_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousImprovementExecutionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousImprovementTasksForExecutionDate_(executionDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_EXECUTION_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousImprovementExecutionsCreated: 0,
      executionDate,
      completedAt: new Date().toISOString()
    };
  }

  const execution = sciipBuildAutonomousImprovementExecution_({
    executionDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousImprovementExecution_(execution);

  return {
    processor: AUTONOMOUS_IMPROVEMENT_EXECUTION_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousImprovementExecutionsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousImprovementExecution_(payload) {
  const executionId = `AUTONOMOUS_IMPROVEMENT_EXECUTION_${Utilities.getUuid()}`;

  return {
    Execution_ID: executionId,
    Business_Key: payload.businessKey,
    Execution_Date: payload.executionDate,
    Source_Sheet: AUTONOMOUS_IMPROVEMENT_EXECUTION_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Execution_Title: `Autonomous Improvement Execution — ${payload.executionDate}`,
    Execution_Summary: sciipCreateAutonomousImprovementExecutionSummary_(payload.sourceRows),
    Execution_Status: 'RECORDED',
    Execution_Result: sciipCreateAutonomousImprovementExecutionResult_(payload.sourceRows),
    Next_Action: sciipCreateAutonomousImprovementExecutionNextAction_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_IMPROVEMENT_EXECUTION_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousImprovementExecutionSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_EXECUTION_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_IMPROVEMENT_EXECUTION_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_EXECUTION_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_EXECUTION_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousImprovementTasksForExecutionDate_(executionDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_EXECUTION_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Task_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_IMPROVEMENT_EXECUTION_PROCESSOR_NAME,
      error: 'TASK_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === executionDate;
    })
    .map(row => sciipAutonomousImprovementExecutionRowToObject_(headers, row));
}

function sciipCreateAutonomousImprovementExecutionSummary_(sourceRows) {
  return [
    `SCIIP_OS recorded execution tracking for ${sourceRows.length} autonomous improvement task record(s).`,
    'This preserves the transition from proposed system improvement into an execution-stage operating record.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementExecutionResult_(sourceRows) {
  const pendingCount = sourceRows.filter(row => {
    return String(row.Status || '').trim().toUpperCase() === 'PENDING';
  }).length;

  return [
    `${pendingCount} source task record(s) were pending at execution-record creation.`,
    'Execution has been recorded for downstream monitoring and outcome learning.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementExecutionNextAction_(sourceRows) {
  return [
    'Monitor execution outcome.',
    'Route completed execution records into autonomous improvement outcome learning.',
    'Preserve result history without overwriting the original improvement task.'
  ].join(' ');
}

function sciipAppendAutonomousImprovementExecution_(execution) {
  const sheet = sciipEnsureAutonomousImprovementExecutionSheet_();

  const row = AUTONOMOUS_IMPROVEMENT_EXECUTION_SCHEMA.map(header => execution[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousImprovementExecutionRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementExecutionProcessor() {
  const result = sciipRunAutonomousImprovementExecutionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementExecutionProcessor',
    result
  }));

  return result;
}