/*******************************************************
 * 810_AutonomousImprovementMemoryProcessor
 *******************************************************/

const AUTONOMOUS_IMPROVEMENT_MEMORY_PROCESSOR_NAME = '810_AutonomousImprovementMemoryProcessor';

const AUTONOMOUS_IMPROVEMENT_MEMORY_INPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_OUTCOMES';
const AUTONOMOUS_IMPROVEMENT_MEMORY_OUTPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_MEMORY';

const AUTONOMOUS_IMPROVEMENT_MEMORY_SCHEMA = [
  'Memory_ID',
  'Business_Key',
  'Memory_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Memory_Title',
  'Memory_Type',
  'Memory_Summary',
  'Reusable_Learning',
  'Future_Use_Case',
  'Confidence',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousImprovementMemoryProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousImprovementMemorySheet_();

  const memoryDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_IMPROVEMENT_MEMORY_INPUT_SHEET,
      'Outcome_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_IMPROVEMENT_MEMORY|${memoryDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_IMPROVEMENT_MEMORY_PROCESSOR_NAME,
    resolvedMemoryDate: memoryDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_MEMORY_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousImprovementMemoryCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousImprovementOutcomesForMemoryDate_(memoryDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_IMPROVEMENT_MEMORY_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousImprovementMemoryCreated: 0,
      memoryDate,
      completedAt: new Date().toISOString()
    };
  }

  const memory = sciipBuildAutonomousImprovementMemory_({
    memoryDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousImprovementMemory_(memory);

  return {
    processor: AUTONOMOUS_IMPROVEMENT_MEMORY_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousImprovementMemoryCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousImprovementMemory_(payload) {
  const memoryId = `AUTONOMOUS_IMPROVEMENT_MEMORY_${Utilities.getUuid()}`;

  return {
    Memory_ID: memoryId,
    Business_Key: payload.businessKey,
    Memory_Date: payload.memoryDate,
    Source_Sheet: AUTONOMOUS_IMPROVEMENT_MEMORY_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Memory_Title: `Autonomous Improvement Memory — ${payload.memoryDate}`,
    Memory_Type: 'AUTONOMOUS_OPERATING_LOOP_LEARNING',
    Memory_Summary: sciipCreateAutonomousImprovementMemorySummary_(payload.sourceRows),
    Reusable_Learning: sciipCreateAutonomousImprovementReusableLearning_(payload.sourceRows),
    Future_Use_Case: sciipCreateAutonomousImprovementFutureUseCase_(payload.sourceRows),
    Confidence: sciipResolveAutonomousImprovementMemoryConfidence_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_IMPROVEMENT_MEMORY_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousImprovementMemorySheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_MEMORY_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_IMPROVEMENT_MEMORY_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_MEMORY_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_IMPROVEMENT_MEMORY_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousImprovementOutcomesForMemoryDate_(memoryDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_IMPROVEMENT_MEMORY_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Outcome_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_IMPROVEMENT_MEMORY_PROCESSOR_NAME,
      error: 'OUTCOME_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === memoryDate;
    })
    .map(row => sciipAutonomousImprovementMemoryRowToObject_(headers, row));
}

function sciipCreateAutonomousImprovementMemorySummary_(sourceRows) {
  return [
    `SCIIP_OS converted ${sourceRows.length} autonomous improvement outcome record(s) into durable system memory.`,
    'The system preserved the full loop from operations, learning, improvement planning, task creation, execution tracking, outcome capture, and memory consolidation.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementReusableLearning_(sourceRows) {
  return [
    'Downstream processors should consume the latest completed processing date from upstream sheets instead of assuming the current execution date.',
    'Idempotent business keys must preserve one durable record per processing batch.',
    'Autonomous improvement loops should terminate in reusable memory so future processors can avoid repeating known failures.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementFutureUseCase_(sourceRows) {
  return [
    'Use this memory when designing future autonomous processors.',
    'Use this memory when diagnosing SKIPPED_NO_INPUTS caused by date mismatch.',
    'Use this memory when routing completed operating-loop outcomes into calibration, prioritization, or strategic reasoning layers.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementMemoryConfidence_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasCapturedOutcome = sourceRows.some(row => {
    return String(row.Outcome_Status || '').trim().toUpperCase() === 'CAPTURED';
  });

  return hasCapturedOutcome ? 'HIGH' : 'MEDIUM';
}

function sciipAppendAutonomousImprovementMemory_(memory) {
  const sheet = sciipEnsureAutonomousImprovementMemorySheet_();

  const row = AUTONOMOUS_IMPROVEMENT_MEMORY_SCHEMA.map(header => memory[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousImprovementMemoryRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementMemoryProcessor() {
  const result = sciipRunAutonomousImprovementMemoryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementMemoryProcessor',
    result
  }));

  return result;
}