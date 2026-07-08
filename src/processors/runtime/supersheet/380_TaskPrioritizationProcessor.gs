/*******************************************************
 * SCIIP_OS v4.0
 * 380_TaskPrioritizationProcessor
 *
 * EXECUTION_TASK → TASK_PRIORITY_SCORE
 *******************************************************/

const TASK_PRIORITY_SCORE_SHEET = 'TASK_PRIORITY_SCORE';

const TASK_PRIORITY_SCORE_HEADERS = [
  'ID',
  'Business_Key',
  'Execution_Task_ID',
  'Score_Date',
  'Priority_Label',
  'Priority_Score',
  'Urgency_Score',
  'Impact_Score',
  'Confidence_Score',
  'Escalation_Score',
  'Composite_Score',
  'Recommended_Order',
  'Prioritization_Rationale',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const TASK_PRIORITY_SCORE_PROCESSOR = '380_TaskPrioritizationProcessor';

function sciipRunTaskPrioritizationProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const taskSheet = ss.getSheetByName('EXECUTION_TASK');
  if (!taskSheet) throw new Error('Missing EXECUTION_TASK sheet');

  const scoreSheet = sciipEnsureTaskPriorityScoreSheet_();

  const tasks = sciipReadSheetObjects_(taskSheet);
  const existingScores = sciipReadSheetObjects_(scoreSheet);

  const existingKeys = new Set(
    existingScores.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoTask = 0;

  tasks.forEach(task => {
    const taskId = task.ID || task.Execution_Task_ID;

    if (!taskId) {
      skippedNoTask++;
      return;
    }

    const businessKey = `TASK_PRIORITY_SCORE|${taskId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const score = sciipBuildTaskPriorityScore_(task, businessKey);

    scoreSheet.appendRow(
      TASK_PRIORITY_SCORE_HEADERS.map(h => score[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: TASK_PRIORITY_SCORE_PROCESSOR,
    status: 'SUCCESS',
    executionTasksReviewed: tasks.length,
    taskPriorityScoresCreated: created,
    skippedDuplicate,
    skippedNoTask,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildTaskPriorityScore_(task, businessKey) {
  const now = new Date().toISOString();

  const priorityScore = sciipPriorityLabelScore_(task.Priority);
  const urgencyScore = sciipUrgencyScore_(task.Due_Timing);
  const impactScore = sciipImpactScore_(task.Task_Category);
  const confidenceScore = sciipConfidenceScore_(task.Confidence);
  const escalationScore = sciipEscalationScore_(task);

  const compositeScore =
    priorityScore +
    urgencyScore +
    impactScore +
    confidenceScore +
    escalationScore;

  return {
    ID: sciipGenerateTaskPriorityScoreId_(),
    Business_Key: businessKey,
    Execution_Task_ID: task.ID || '',
    Score_Date: now,
    Priority_Label: sciipCompositePriorityLabel_(compositeScore),
    Priority_Score: priorityScore,
    Urgency_Score: urgencyScore,
    Impact_Score: impactScore,
    Confidence_Score: confidenceScore,
    Escalation_Score: escalationScore,
    Composite_Score: compositeScore,
    Recommended_Order: sciipRecommendedOrder_(compositeScore),
    Prioritization_Rationale: sciipPriorityRationale_(task, compositeScore),
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: TASK_PRIORITY_SCORE_PROCESSOR,
    Notes: 'Generated from EXECUTION_TASK'
  };
}

/**
 * Scoring logic
 */
function sciipPriorityLabelScore_(priority) {
  const value = String(priority || '').toUpperCase();

  if (value === 'HIGH') return 30;
  if (value === 'LOW') return 10;

  return 20;
}

function sciipUrgencyScore_(dueTiming) {
  const value = String(dueTiming || '').toUpperCase();

  if (value.indexOf('IMMEDIATE') !== -1) return 30;
  if (value.indexOf('CURRENT') !== -1) return 25;
  if (value.indexOf('NEXT') !== -1) return 15;

  return 10;
}

function sciipImpactScore_(category) {
  const value = String(category || '').toUpperCase();

  if (value === 'ACTION_DECISION') return 25;
  if (value === 'TRACKING') return 20;
  if (value === 'OUTCOME_LEARNING') return 20;
  if (value === 'CLASSIFICATION') return 15;
  if (value === 'REVIEW') return 15;

  return 10;
}

function sciipConfidenceScore_(confidence) {
  const value = String(confidence || '').toUpperCase();

  if (value === 'HIGH') return 15;
  if (value === 'LOW') return 5;

  return 10;
}

function sciipEscalationScore_(task) {
  const trigger = String(task.Escalation_Trigger || '').toUpperCase();
  const status = String(task.Task_Status || '').toUpperCase();

  let score = 0;

  if (trigger) score += 10;
  if (trigger.indexOf('LANDLORD') !== -1) score += 5;
  if (trigger.indexOf('TIME-SENSITIVE') !== -1) score += 5;
  if (status === 'OPEN') score += 5;

  return score;
}

function sciipCompositePriorityLabel_(score) {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'MEDIUM';

  return 'LOW';
}

function sciipRecommendedOrder_(score) {
  if (score >= 85) return 1;
  if (score >= 70) return 2;
  if (score >= 50) return 3;

  return 4;
}

function sciipPriorityRationale_(task, score) {
  return [
    `Task "${task.Task_Title || 'Untitled Task'}" received a composite score of ${score}.`,
    `Scoring reflects priority, timing, task category, confidence, escalation language, and current task status.`,
    'Higher scores should be reviewed first during SCIIP execution cycles.'
  ].join('\n');
}

/**
 * Sheet setup
 */
function sciipEnsureTaskPriorityScoreSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(TASK_PRIORITY_SCORE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(TASK_PRIORITY_SCORE_SHEET);
    sheet.appendRow(TASK_PRIORITY_SCORE_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== TASK_PRIORITY_SCORE_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(TASK_PRIORITY_SCORE_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateTaskPriorityScoreId_() {
  return 'TASK_SCORE_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
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
function sciipTestTaskPrioritizationProcessor() {
  const result = sciipRunTaskPrioritizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestTaskPrioritizationProcessor',
    result
  }));

  return result;
}