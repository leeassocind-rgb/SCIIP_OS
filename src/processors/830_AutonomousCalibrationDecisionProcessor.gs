/*******************************************************
 * 830_AutonomousCalibrationDecisionProcessor
 *******************************************************/

const AUTONOMOUS_CALIBRATION_DECISION_PROCESSOR_NAME = '830_AutonomousCalibrationDecisionProcessor';

const AUTONOMOUS_CALIBRATION_DECISION_INPUT_SHEET = 'AUTONOMOUS_CALIBRATION_SIGNALS';
const AUTONOMOUS_CALIBRATION_DECISION_OUTPUT_SHEET = 'AUTONOMOUS_CALIBRATION_DECISIONS';

const AUTONOMOUS_CALIBRATION_DECISION_SCHEMA = [
  'Calibration_Decision_ID',
  'Business_Key',
  'Decision_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Decision_Title',
  'Decision_Type',
  'Decision',
  'Decision_Rationale',
  'Implementation_Standard',
  'Priority',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousCalibrationDecisionProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousCalibrationDecisionSheet_();

  const decisionDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_CALIBRATION_DECISION_INPUT_SHEET,
      'Signal_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_CALIBRATION_DECISION|${decisionDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_CALIBRATION_DECISION_PROCESSOR_NAME,
    resolvedDecisionDate: decisionDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_CALIBRATION_DECISION_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousCalibrationDecisionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousCalibrationSignalsForDecisionDate_(decisionDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_CALIBRATION_DECISION_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousCalibrationDecisionsCreated: 0,
      decisionDate,
      completedAt: new Date().toISOString()
    };
  }

  const decision = sciipBuildAutonomousCalibrationDecision_({
    decisionDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousCalibrationDecision_(decision);

  return {
    processor: AUTONOMOUS_CALIBRATION_DECISION_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousCalibrationDecisionsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousCalibrationDecision_(payload) {
  const decisionId = `AUTONOMOUS_CALIBRATION_DECISION_${Utilities.getUuid()}`;

  return {
    Calibration_Decision_ID: decisionId,
    Business_Key: payload.businessKey,
    Decision_Date: payload.decisionDate,
    Source_Sheet: AUTONOMOUS_CALIBRATION_DECISION_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Decision_Title: `Autonomous Calibration Decision — ${payload.decisionDate}`,
    Decision_Type: 'PROCESSOR_STANDARDIZATION',
    Decision: sciipCreateAutonomousCalibrationDecisionText_(payload.sourceRows),
    Decision_Rationale: sciipCreateAutonomousCalibrationDecisionRationale_(payload.sourceRows),
    Implementation_Standard: sciipCreateAutonomousCalibrationImplementationStandard_(payload.sourceRows),
    Priority: sciipResolveAutonomousCalibrationDecisionPriority_(payload.sourceRows),
    Status: 'APPROVED',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_CALIBRATION_DECISION_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousCalibrationDecisionSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_CALIBRATION_DECISION_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_CALIBRATION_DECISION_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_CALIBRATION_DECISION_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_CALIBRATION_DECISION_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousCalibrationSignalsForDecisionDate_(decisionDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_CALIBRATION_DECISION_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Signal_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_CALIBRATION_DECISION_PROCESSOR_NAME,
      error: 'SIGNAL_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === decisionDate;
    })
    .map(row => sciipAutonomousCalibrationDecisionRowToObject_(headers, row));
}

function sciipCreateAutonomousCalibrationDecisionText_(sourceRows) {
  return [
    `SCIIP_OS approves ${sourceRows.length} autonomous calibration signal record(s) for implementation.`,
    'The downstream processor date-resolution standard is now treated as an operating-system calibration decision.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationDecisionRationale_(sourceRows) {
  return [
    'The validated 750 fix demonstrated that downstream processors can falsely skip valid upstream batches when they use the current execution date instead of the latest completed upstream processing date.',
    'The calibration signal confirms that latest-date resolution improves processor continuity, idempotency, and batch reliability.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationImplementationStandard_(sourceRows) {
  return [
    'Downstream processors must resolve their processing date from the latest available upstream date column whenever consuming prior processor output.',
    'Required pattern: sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt).',
    'The resolved date must be used consistently in business keys and source-row filters.',
    'Batch-oriented duplicate checks must use sciipBusinessKeyPrefixExists_().'
  ].join('\n');
}

function sciipResolveAutonomousCalibrationDecisionPriority_(sourceRows) {
  const hasHighPrioritySignal = sourceRows.some(row => {
    return String(row.Priority || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighPrioritySignal ? 'HIGH' : 'MEDIUM';
}

function sciipAppendAutonomousCalibrationDecision_(decision) {
  const sheet = sciipEnsureAutonomousCalibrationDecisionSheet_();

  const row = AUTONOMOUS_CALIBRATION_DECISION_SCHEMA.map(header => decision[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousCalibrationDecisionRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousCalibrationDecisionProcessor() {
  const result = sciipRunAutonomousCalibrationDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousCalibrationDecisionProcessor',
    result
  }));

  return result;
}