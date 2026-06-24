/*******************************************************
 * SCIIP_OS v4.0
 * 370_ExecutionTaskProcessor
 *
 * DECISION_EXECUTION_PLAN → EXECUTION_TASK
 *******************************************************/

const EXECUTION_TASK_SHEET = 'EXECUTION_TASK';

const EXECUTION_TASK_HEADERS = [
  'ID',
  'Business_Key',
  'Decision_Execution_Plan_ID',
  'Task_Date',
  'Task_Number',
  'Task_Title',
  'Task_Description',
  'Task_Category',
  'Assigned_Role',
  'Priority',
  'Due_Timing',
  'Completion_Criteria',
  'Dependency',
  'Escalation_Trigger',
  'Task_Status',
  'Confidence',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const EXECUTION_TASK_PROCESSOR = '370_ExecutionTaskProcessor';

/**
 * Main processor
 */
function sciipRunExecutionTaskProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const planSheet = ss.getSheetByName('DECISION_EXECUTION_PLAN');
  if (!planSheet) throw new Error('Missing DECISION_EXECUTION_PLAN sheet');

  const taskSheet = sciipEnsureExecutionTaskSheet_();

  const plans = sciipReadSheetObjects_(planSheet);
  const existingTasks = sciipReadSheetObjects_(taskSheet);

  const existingKeys = new Set(
    existingTasks.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoPlan = 0;

  plans.forEach(plan => {
    const planId = plan.ID || plan.Decision_Execution_Plan_ID;

    if (!planId) {
      skippedNoPlan++;
      return;
    }

    const tasks = sciipBuildExecutionTasks_(plan);

    tasks.forEach(task => {
      const businessKey = `EXECUTION_TASK|${planId}|${task.Task_Number}`;

      if (existingKeys.has(businessKey)) {
        skippedDuplicate++;
        return;
      }

      task.Business_Key = businessKey;

      taskSheet.appendRow(
        EXECUTION_TASK_HEADERS.map(h => task[h] || '')
      );

      existingKeys.add(businessKey);
      created++;
    });
  });

  const result = {
    processor: EXECUTION_TASK_PROCESSOR,
    status: 'SUCCESS',
    executionPlansReviewed: plans.length,
    executionTasksCreated: created,
    skippedDuplicate,
    skippedNoPlan,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory
 */
function sciipBuildExecutionTasks_(plan) {
  const now = new Date().toISOString();
  const planId = plan.ID || '';

  const base = {
    Decision_Execution_Plan_ID: planId,
    Task_Date: plan.Plan_Date || now,
    Priority: plan.Priority || 'MEDIUM',
    Confidence: plan.Confidence || 'MEDIUM',
    Task_Status: 'OPEN',
    Created_At: now,
    Updated_At: now,
    Processor: EXECUTION_TASK_PROCESSOR,
    Notes: 'Generated from DECISION_EXECUTION_PLAN'
  };

  return [
    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 1,
      Task_Title: 'Review Execution Plan',
      Task_Description: 'Review the source decision execution plan and confirm whether action is required.',
      Task_Category: 'REVIEW',
      Assigned_Role: 'Brokerage Team',
      Due_Timing: sciipTaskDueTiming_(plan),
      Completion_Criteria: 'Execution plan reviewed and marked for action, monitoring, or dismissal.',
      Dependency: 'Decision execution plan must exist.',
      Escalation_Trigger: 'Escalate if the plan is high priority or has not been reviewed during the current intelligence cycle.'
    }),

    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 2,
      Task_Title: 'Identify Applicable Asset or Market',
      Task_Description: 'Determine whether the plan applies to a specific asset, landlord, tenant requirement, market, or competitive condition.',
      Task_Category: 'CLASSIFICATION',
      Assigned_Role: 'Brokerage Team / SCIIP Operator',
      Due_Timing: sciipTaskDueTiming_(plan),
      Completion_Criteria: 'Applicable asset, landlord, market, or requirement is identified, or the task is documented as general market intelligence.',
      Dependency: 'Review Execution Plan',
      Escalation_Trigger: 'Escalate if asset-level relevance is unclear but the priority is high.'
    }),

    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 3,
      Task_Title: 'Determine Recommended Action',
      Task_Description: 'Decide whether the plan should result in landlord communication, pricing review, marketing update, prospect follow-up, or additional research.',
      Task_Category: 'ACTION_DECISION',
      Assigned_Role: 'Brokerage Team',
      Due_Timing: sciipTaskDueTiming_(plan),
      Completion_Criteria: 'Recommended next action is selected or documented as no-action with rationale.',
      Dependency: 'Identify Applicable Asset or Market',
      Escalation_Trigger: 'Escalate if the recommended action is time-sensitive or landlord-facing.'
    }),

    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 4,
      Task_Title: 'Create or Update Action Tracker',
      Task_Description: 'Create or update related recommended actions and action tracker records where appropriate.',
      Task_Category: 'TRACKING',
      Assigned_Role: 'SCIIP Operator',
      Due_Timing: sciipTaskDueTiming_(plan),
      Completion_Criteria: 'Relevant action tracker item exists, or no tracker item is needed with rationale.',
      Dependency: 'Determine Recommended Action',
      Escalation_Trigger: 'Escalate if an action is recommended but not tracked.'
    }),

    Object.assign({}, base, {
      ID: sciipGenerateExecutionTaskId_(),
      Business_Key: '',
      Task_Number: 5,
      Task_Title: 'Capture Outcome',
      Task_Description: 'Capture whether the execution plan resulted in a landlord action, broker follow-up, market update, or no-action decision.',
      Task_Category: 'OUTCOME_LEARNING',
      Assigned_Role: 'Brokerage Team / SCIIP Operator',
      Due_Timing: 'After action or next intelligence cycle',
      Completion_Criteria: 'Outcome is captured for future SCIIP learning.',
      Dependency: 'Create or Update Action Tracker',
      Escalation_Trigger: 'Escalate if action occurred but no outcome was recorded.'
    })
  ];
}

/**
 * Task logic
 */
function sciipTaskDueTiming_(plan) {
  const priority = String(plan.Priority || '').toUpperCase();

  if (priority === 'HIGH') return 'Immediate / current cycle';
  if (priority === 'LOW') return 'Next regular review cycle';

  return 'Current or next intelligence cycle';
}

/**
 * Sheet setup
 */
function sciipEnsureExecutionTaskSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(EXECUTION_TASK_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(EXECUTION_TASK_SHEET);
    sheet.appendRow(EXECUTION_TASK_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== EXECUTION_TASK_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(EXECUTION_TASK_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateExecutionTaskId_() {
  return 'EXEC_TASK_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestExecutionTaskProcessor() {
  const result = sciipRunExecutionTaskProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestExecutionTaskProcessor',
    result
  }));

  return result;
}