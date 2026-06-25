/*******************************************************
 * 760_AutonomousOpsLearningProcessor
 *******************************************************/

const AUTONOMOUS_OPS_LEARNING_PROCESSOR_NAME = '760_AutonomousOpsLearningProcessor';

const AUTONOMOUS_OPS_LEARNING_INPUT_SHEET = 'AUTONOMOUS_OPS_DIGESTS';
const AUTONOMOUS_OPS_LEARNING_OUTPUT_SHEET = 'AUTONOMOUS_OPS_LEARNINGS';

const AUTONOMOUS_OPS_LEARNING_SCHEMA = [
  'Learning_ID',
  'Business_Key',
  'Learning_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Learning_Title',
  'Operational_Learning',
  'Recommended_Adjustment',
  'Confidence',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousOpsLearningProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousOpsLearningSheet_();

  const learningDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_OPS_LEARNING_INPUT_SHEET,
      'Digest_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_OPS_LEARNING|${learningDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_OPS_LEARNING_PROCESSOR_NAME,
    resolvedLearningDate: learningDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_OPS_LEARNING_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousOpsLearningsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousOpsDigestsForLearningDate_(learningDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_OPS_LEARNING_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousOpsLearningsCreated: 0,
      learningDate,
      completedAt: new Date().toISOString()
    };
  }

  const learning = sciipBuildAutonomousOpsLearning_({
    learningDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousOpsLearning_(learning);

  return {
    processor: AUTONOMOUS_OPS_LEARNING_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousOpsLearningsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousOpsLearning_(payload) {
  const learningId = `AUTONOMOUS_OPS_LEARNING_${Utilities.getUuid()}`;

  const sourceCount = payload.sourceRows.length;

  return {
    Learning_ID: learningId,
    Business_Key: payload.businessKey,
    Learning_Date: payload.learningDate,
    Source_Sheet: AUTONOMOUS_OPS_LEARNING_INPUT_SHEET,
    Source_Record_Count: sourceCount,
    Learning_Title: `Autonomous Operations Learning — ${payload.learningDate}`,
    Operational_Learning: sciipCreateAutonomousOpsLearningText_(payload.sourceRows),
    Recommended_Adjustment: sciipCreateAutonomousOpsAdjustmentText_(payload.sourceRows),
    Confidence: sourceCount > 0 ? 'MEDIUM' : 'LOW',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_OPS_LEARNING_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousOpsLearningSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_OPS_LEARNING_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_OPS_LEARNING_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_OPS_LEARNING_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_OPS_LEARNING_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousOpsDigestsForLearningDate_(learningDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_OPS_LEARNING_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Digest_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_OPS_LEARNING_PROCESSOR_NAME,
      error: 'DIGEST_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === learningDate;
    })
    .map(row => sciipAutonomousOpsLearningRowToObject_(headers, row));
}

function sciipCreateAutonomousOpsLearningText_(sourceRows) {
  const digestCount = sourceRows.length;

  const totalSourceRecords = sourceRows.reduce((sum, row) => {
    const count = Number(row.Source_Record_Count || 0);
    return sum + count;
  }, 0);

  return [
    `SCIIP completed an autonomous operations digest cycle using ${digestCount} digest record(s).`,
    `The operating loop reviewed ${totalSourceRecords} upstream command center update record(s).`,
    'The system successfully converted operational activity into durable learning history.'
  ].join(' ');
}

function sciipCreateAutonomousOpsAdjustmentText_(sourceRows) {
  if (!sourceRows.length) {
    return 'No adjustment recommended because no source digest records were available.';
  }

  return [
    'Continue routing completed autonomous operating loops into durable learning records.',
    'Use these learnings to support future memory consolidation, reasoning calibration, and strategic feedback processors.'
  ].join(' ');
}

function sciipAppendAutonomousOpsLearning_(learning) {
  const sheet = sciipEnsureAutonomousOpsLearningSheet_();

  const row = AUTONOMOUS_OPS_LEARNING_SCHEMA.map(header => learning[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousOpsLearningRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousOpsLearningProcessor() {
  const result = sciipRunAutonomousOpsLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsLearningProcessor',
    result
  }));

  return result;
}