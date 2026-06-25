/*******************************************************
 * 800_AutonomousImprovementOutcomeProcessor
 *******************************************************/

const AUTONOMOUS_IMPROVEMENT_OUTCOME_PROCESSOR_NAME = '800_AutonomousImprovementOutcomeProcessor';

const AUTONOMOUS_IMPROVEMENT_OUTCOME_INPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS';
const AUTONOMOUS_IMPROVEMENT_OUTCOME_OUTPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_OUTCOMES';

const AUTONOMOUS_IMPROVEMENT_OUTCOME_SCHEMA = [
  'Outcome_ID',
  'Business_Key',
  'Outcome_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Outcome_Title',
  'Outcome_Summary',
  'Learning_Captured',
  'System_Adjustment_Recommendation',
  'Outcome_Status',
  'Confidence',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousImprovementOutcomeProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousImprovementOutcomeSheet_();

  const outcomeDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_IMPROVEMENT_OUTCOME_INPUT_SHEET,
      'Execution_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_IMPROVEMENT_OUTCOME|${outcomeDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_IMPROVEMENT_OUTCOME_PROCESSOR_NAME,
    resolvedOutcomeDate: outcomeDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_OUTCOME_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousImprovementOutcomesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousImprovementExecutionsForOutcomeDate_(outcomeDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_OUTCOME_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousImprovementOutcomesCreated: 0,
      outcomeDate,
      completedAt: new Date().toISOString()
    };
  }

  const outcome = sciipBuildAutonomousImprovementOutcome_({
    outcomeDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousImprovementOutcome_(outcome);

  return {
    processor: AUTONOMOUS_IMPROVEMENT_OUTCOME_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousImprovementOutcomesCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousImprovementOutcome_(payload) {
  const outcomeId = `AUTONOMOUS_IMPROVEMENT_OUTCOME_${Utilities.getUuid()}`;

  return {
    Outcome_ID: outcomeId,
    Business_Key: payload.businessKey,
    Outcome_Date: payload.outcomeDate,
    Source_Sheet: AUTONOMOUS_IMPROVEMENT_OUTCOME_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Outcome_Title: `Autonomous Improvement Outcome — ${payload.outcomeDate}`,
    Outcome_Summary: sciipCreateAutonomousImprovementOutcomeSummary_(payload.sourceRows),
    Learning_Captured: sciipCreateAutonomousImprovementOutcomeLearning_(payload.sourceRows),
    System_Adjustment_Recommendation: sciipCreateAutonomousImprovementOutcomeRecommendation_(payload.sourceRows),
    Outcome_Status: 'CAPTURED',
    Confidence: sciipResolveAutonomousImprovementOutcomeConfidence_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_IMPROVEMENT_OUTCOME_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousImprovementOutcomeSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_OUTCOME_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_IMPROVEMENT_OUTCOME_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_OUTCOME_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_OUTCOME_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousImprovementExecutionsForOutcomeDate_(outcomeDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_OUTCOME_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Execution_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_IMPROVEMENT_OUTCOME_PROCESSOR_NAME,
      error: 'EXECUTION_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === outcomeDate;
    })
    .map(row => sciipAutonomousImprovementOutcomeRowToObject_(headers, row));
}

function sciipCreateAutonomousImprovementOutcomeSummary_(sourceRows) {
  return [
    `SCIIP_OS captured outcome learning from ${sourceRows.length} autonomous improvement execution record(s).`,
    'This completes the improvement loop from learning, to plan, to task, to execution, to outcome history.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementOutcomeLearning_(sourceRows) {
  const recordedCount = sourceRows.filter(row => {
    return String(row.Execution_Status || '').trim().toUpperCase() === 'RECORDED';
  }).length;

  return [
    `${recordedCount} execution record(s) reached RECORDED status.`,
    'The system successfully preserved execution-stage activity as permanent downstream learning.',
    'Future processors can now use this outcome layer to improve calibration, prioritization, and autonomous routing.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementOutcomeRecommendation_(sourceRows) {
  return [
    'Continue using latest completed processing dates for downstream autonomous processors.',
    'Preserve all improvement-loop outputs as event-sourced history.',
    'Route captured outcomes into future strategic memory consolidation and model calibration processors.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementOutcomeConfidence_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasRecordedExecution = sourceRows.some(row => {
    return String(row.Execution_Status || '').trim().toUpperCase() === 'RECORDED';
  });

  return hasRecordedExecution ? 'MEDIUM' : 'LOW';
}

function sciipAppendAutonomousImprovementOutcome_(outcome) {
  const sheet = sciipEnsureAutonomousImprovementOutcomeSheet_();

  const row = AUTONOMOUS_IMPROVEMENT_OUTCOME_SCHEMA.map(header => outcome[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousImprovementOutcomeRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementOutcomeProcessor() {
  const result = sciipRunAutonomousImprovementOutcomeProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementOutcomeProcessor',
    result
  }));

  return result;
}