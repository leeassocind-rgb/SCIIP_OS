/*******************************************************
 * SCIIP_OS v4.0
 * 390_WorkQueueProcessor
 *
 * TASK_PRIORITY_SCORE → WORK_QUEUE
 *******************************************************/

const WORK_QUEUE_SHEET = 'WORK_QUEUE';

const WORK_QUEUE_HEADERS = [
  'ID',
  'Business_Key',
  'Task_Priority_Score_ID',
  'Execution_Task_ID',
  'Queue_Date',
  'Queue_Type',
  'Queue_Position',
  'Work_Title',
  'Work_Description',
  'Assigned_Role',
  'Priority_Label',
  'Composite_Score',
  'Recommended_Order',
  'Work_Status',
  'Review_Cadence',
  'Escalation_Trigger',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const WORK_QUEUE_PROCESSOR = '390_WorkQueueProcessor';

function sciipRunWorkQueueProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const scoreSheet = ss.getSheetByName('TASK_PRIORITY_SCORE');
  if (!scoreSheet) throw new Error('Missing TASK_PRIORITY_SCORE sheet');

  const taskSheet = ss.getSheetByName('EXECUTION_TASK');
  if (!taskSheet) throw new Error('Missing EXECUTION_TASK sheet');

  const queueSheet = sciipEnsureWorkQueueSheet_();

  const scores = sciipReadSheetObjects_(scoreSheet);
  const tasks = sciipReadSheetObjects_(taskSheet);
  const existingQueue = sciipReadSheetObjects_(queueSheet);

  const taskById = {};
  tasks.forEach(task => {
    if (task.ID) taskById[String(task.ID).trim()] = task;
  });

  const existingKeys = new Set(
    existingQueue.map(r => String(r.Business_Key || '').trim())
  );

  const activeScores = scores
    .filter(score => String(score.Status || '').toUpperCase() !== 'INACTIVE')
    .sort((a, b) => {
      const scoreB = Number(b.Composite_Score || 0);
      const scoreA = Number(a.Composite_Score || 0);
      return scoreB - scoreA;
    });

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoScore = 0;
  let skippedNoTask = 0;

  activeScores.forEach((score, index) => {
    const scoreId = score.ID || score.Task_Priority_Score_ID;
    const taskId = score.Execution_Task_ID;

    if (!scoreId) {
      skippedNoScore++;
      return;
    }

    if (!taskId || !taskById[String(taskId).trim()]) {
      skippedNoTask++;
      return;
    }

    const businessKey = `WORK_QUEUE|${scoreId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const task = taskById[String(taskId).trim()];
    const queueItem = sciipBuildWorkQueueItem_(score, task, businessKey, index + 1);

    queueSheet.appendRow(
      WORK_QUEUE_HEADERS.map(h => queueItem[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: WORK_QUEUE_PROCESSOR,
    status: 'SUCCESS',
    priorityScoresReviewed: scores.length,
    workQueueItemsCreated: created,
    skippedDuplicate,
    skippedNoScore,
    skippedNoTask,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildWorkQueueItem_(score, task, businessKey, queuePosition) {
  const now = new Date().toISOString();

  return {
    ID: sciipGenerateWorkQueueId_(),
    Business_Key: businessKey,
    Task_Priority_Score_ID: score.ID || '',
    Execution_Task_ID: task.ID || '',
    Queue_Date: now,
    Queue_Type: 'EXECUTION',
    Queue_Position: queuePosition,
    Work_Title: task.Task_Title || 'Untitled Work Item',
    Work_Description: task.Task_Description || '',
    Assigned_Role: task.Assigned_Role || 'SCIIP Operator',
    Priority_Label: score.Priority_Label || 'MEDIUM',
    Composite_Score: score.Composite_Score || '',
    Recommended_Order: score.Recommended_Order || '',
    Work_Status: 'OPEN',
    Review_Cadence: sciipWorkQueueReviewCadence_(score),
    Escalation_Trigger: task.Escalation_Trigger || '',
    Created_At: now,
    Updated_At: now,
    Processor: WORK_QUEUE_PROCESSOR,
    Notes: 'Generated from TASK_PRIORITY_SCORE and EXECUTION_TASK'
  };
}

/**
 * Queue logic
 */
function sciipWorkQueueReviewCadence_(score) {
  const label = String(score.Priority_Label || '').toUpperCase();

  if (label === 'CRITICAL') return 'Immediate';
  if (label === 'HIGH') return 'Current cycle';
  if (label === 'MEDIUM') return 'Next intelligence cycle';

  return 'Routine review';
}

/**
 * Sheet setup
 */
function sciipEnsureWorkQueueSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(WORK_QUEUE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(WORK_QUEUE_SHEET);
    sheet.appendRow(WORK_QUEUE_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== WORK_QUEUE_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(WORK_QUEUE_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateWorkQueueId_() {
  return 'WORK_QUEUE_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
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
function sciipTestWorkQueueProcessor() {
  const result = sciipRunWorkQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestWorkQueueProcessor',
    result
  }));

  return result;
}