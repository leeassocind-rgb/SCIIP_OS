/*******************************************************
 * 770_AutonomousImprovementPlanProcessor
 *******************************************************/

const AUTONOMOUS_IMPROVEMENT_PLAN_PROCESSOR_NAME = '770_AutonomousImprovementPlanProcessor';

const AUTONOMOUS_IMPROVEMENT_PLAN_INPUT_SHEET = 'AUTONOMOUS_OPS_LEARNINGS';
const AUTONOMOUS_IMPROVEMENT_PLAN_OUTPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_PLANS';

const AUTONOMOUS_IMPROVEMENT_PLAN_SCHEMA = [
  'Improvement_Plan_ID',
  'Business_Key',
  'Plan_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Plan_Title',
  'Improvement_Objective',
  'Improvement_Actions',
  'Expected_System_Impact',
  'Priority',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousImprovementPlanProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousImprovementPlanSheet_();

  const planDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_IMPROVEMENT_PLAN_INPUT_SHEET,
      'Learning_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_IMPROVEMENT_PLAN|${planDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_IMPROVEMENT_PLAN_PROCESSOR_NAME,
    resolvedPlanDate: planDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_PLAN_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousImprovementPlansCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousOpsLearningsForPlanDate_(planDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_PLAN_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousImprovementPlansCreated: 0,
      planDate,
      completedAt: new Date().toISOString()
    };
  }

  const plan = sciipBuildAutonomousImprovementPlan_({
    planDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousImprovementPlan_(plan);

  return {
    processor: AUTONOMOUS_IMPROVEMENT_PLAN_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousImprovementPlansCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousImprovementPlan_(payload) {
  const planId = `AUTONOMOUS_IMPROVEMENT_PLAN_${Utilities.getUuid()}`;

  return {
    Improvement_Plan_ID: planId,
    Business_Key: payload.businessKey,
    Plan_Date: payload.planDate,
    Source_Sheet: AUTONOMOUS_IMPROVEMENT_PLAN_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Plan_Title: `Autonomous Improvement Plan — ${payload.planDate}`,
    Improvement_Objective: sciipCreateAutonomousImprovementObjective_(payload.sourceRows),
    Improvement_Actions: sciipCreateAutonomousImprovementActions_(payload.sourceRows),
    Expected_System_Impact: sciipCreateAutonomousImprovementImpact_(payload.sourceRows),
    Priority: 'MEDIUM',
    Status: 'PROPOSED',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_IMPROVEMENT_PLAN_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousImprovementPlanSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_PLAN_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_IMPROVEMENT_PLAN_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_PLAN_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_PLAN_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousOpsLearningsForPlanDate_(planDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_PLAN_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Learning_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_IMPROVEMENT_PLAN_PROCESSOR_NAME,
      error: 'LEARNING_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === planDate;
    })
    .map(row => sciipAutonomousImprovementPlanRowToObject_(headers, row));
}

function sciipCreateAutonomousImprovementObjective_(sourceRows) {
  return [
    `Convert ${sourceRows.length} autonomous operations learning record(s) into an actionable improvement plan.`,
    'Strengthen SCIIP_OS by ensuring operational feedback becomes permanent system improvement history.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementActions_(sourceRows) {
  const actions = [
    'Review autonomous learning records for recurring system patterns.',
    'Identify whether routing, digesting, memory consolidation, or reasoning calibration should be adjusted.',
    'Preserve the improvement recommendation as a durable operating-system record.',
    'Make the improvement plan available to downstream prioritization and execution processors.'
  ];

  return actions.join('\n');
}

function sciipCreateAutonomousImprovementImpact_(sourceRows) {
  return [
    'Expected impact is improved autonomous loop closure, stronger processor accountability, and better continuity between system activity, learning, and execution.',
    `This plan was generated from ${sourceRows.length} validated upstream learning record(s).`
  ].join(' ');
}

function sciipAppendAutonomousImprovementPlan_(plan) {
  const sheet = sciipEnsureAutonomousImprovementPlanSheet_();

  const row = AUTONOMOUS_IMPROVEMENT_PLAN_SCHEMA.map(header => plan[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousImprovementPlanRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementPlanProcessor() {
  const result = sciipRunAutonomousImprovementPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementPlanProcessor',
    result
  }));

  return result;
}