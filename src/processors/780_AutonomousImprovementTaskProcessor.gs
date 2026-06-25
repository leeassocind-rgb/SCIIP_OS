/*******************************************************
 * 780_AutonomousImprovementTaskProcessor
 *******************************************************/

const AUTONOMOUS_IMPROVEMENT_TASK_PROCESSOR_NAME = '780_AutonomousImprovementTaskProcessor';

const AUTONOMOUS_IMPROVEMENT_TASK_INPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_PLANS';
const AUTONOMOUS_IMPROVEMENT_TASK_OUTPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_TASKS';

const AUTONOMOUS_IMPROVEMENT_TASK_SCHEMA = [
  'Task_ID',
  'Business_Key',
  'Task_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Task_Title',
  'Task_Description',
  'Task_Type',
  'Priority',
  'Status',
  'Execution_Owner',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousImprovementTaskProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousImprovementTaskSheet_();

  const taskDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_IMPROVEMENT_TASK_INPUT_SHEET,
      'Plan_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_IMPROVEMENT_TASK|${taskDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_IMPROVEMENT_TASK_PROCESSOR_NAME,
    resolvedTaskDate: taskDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_TASK_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousImprovementTasksCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousImprovementPlansForTaskDate_(taskDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_TASK_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousImprovementTasksCreated: 0,
      taskDate,
      completedAt: new Date().toISOString()
    };
  }

  const task = sciipBuildAutonomousImprovementTask_({
    taskDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousImprovementTask_(task);

  return {
    processor: AUTONOMOUS_IMPROVEMENT_TASK_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousImprovementTasksCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousImprovementTask_(payload) {
  const taskId = `AUTONOMOUS_IMPROVEMENT_TASK_${Utilities.getUuid()}`;

  return {
    Task_ID: taskId,
    Business_Key: payload.businessKey,
    Task_Date: payload.taskDate,
    Source_Sheet: AUTONOMOUS_IMPROVEMENT_TASK_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Task_Title: `Execute Autonomous Improvement Plan — ${payload.taskDate}`,
    Task_Description: sciipCreateAutonomousImprovementTaskDescription_(payload.sourceRows),
    Task_Type: 'AUTONOMOUS_SYSTEM_IMPROVEMENT',
    Priority: sciipResolveAutonomousImprovementTaskPriority_(payload.sourceRows),
    Status: 'PENDING',
    Execution_Owner: 'SCIIP_OS',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_IMPROVEMENT_TASK_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousImprovementTaskSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_TASK_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_IMPROVEMENT_TASK_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_TASK_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_TASK_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousImprovementPlansForTaskDate_(taskDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_TASK_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Plan_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_IMPROVEMENT_TASK_PROCESSOR_NAME,
      error: 'PLAN_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === taskDate;
    })
    .map(row => sciipAutonomousImprovementTaskRowToObject_(headers, row));
}

function sciipCreateAutonomousImprovementTaskDescription_(sourceRows) {
  return [
    `Create an execution task from ${sourceRows.length} autonomous improvement plan record(s).`,
    'Review the proposed improvement objective, actions, and expected system impact.',
    'Route the improvement into downstream execution tracking so SCIIP_OS can close the loop from learning to action.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementTaskPriority_(sourceRows) {
  const hasHighPriorityPlan = sourceRows.some(row => {
    return String(row.Priority || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighPriorityPlan ? 'HIGH' : 'MEDIUM';
}

function sciipAppendAutonomousImprovementTask_(task) {
  const sheet = sciipEnsureAutonomousImprovementTaskSheet_();

  const row = AUTONOMOUS_IMPROVEMENT_TASK_SCHEMA.map(header => task[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousImprovementTaskRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementTaskProcessor() {
  const result = sciipRunAutonomousImprovementTaskProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementTaskProcessor',
    result
  }));

  return result;
}