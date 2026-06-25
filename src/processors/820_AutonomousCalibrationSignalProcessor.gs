/*******************************************************
 * 820_AutonomousCalibrationSignalProcessor
 *******************************************************/

const AUTONOMOUS_CALIBRATION_SIGNAL_PROCESSOR_NAME = '820_AutonomousCalibrationSignalProcessor';

const AUTONOMOUS_CALIBRATION_SIGNAL_INPUT_SHEET = 'AUTONOMOUS_IMPROVEMENT_MEMORY';
const AUTONOMOUS_CALIBRATION_SIGNAL_OUTPUT_SHEET = 'AUTONOMOUS_CALIBRATION_SIGNALS';

const AUTONOMOUS_CALIBRATION_SIGNAL_SCHEMA = [
  'Calibration_Signal_ID',
  'Business_Key',
  'Signal_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Signal_Title',
  'Signal_Type',
  'Calibration_Finding',
  'Calibration_Recommendation',
  'Affected_System_Area',
  'Priority',
  'Confidence',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousCalibrationSignalProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousCalibrationSignalSheet_();

  const signalDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_CALIBRATION_SIGNAL_INPUT_SHEET,
      'Memory_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_CALIBRATION_SIGNAL|${signalDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_CALIBRATION_SIGNAL_PROCESSOR_NAME,
    resolvedSignalDate: signalDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_CALIBRATION_SIGNAL_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousCalibrationSignalsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousImprovementMemoryForSignalDate_(signalDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_CALIBRATION_SIGNAL_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousCalibrationSignalsCreated: 0,
      signalDate,
      completedAt: new Date().toISOString()
    };
  }

  const signal = sciipBuildAutonomousCalibrationSignal_({
    signalDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousCalibrationSignal_(signal);

  return {
    processor: AUTONOMOUS_CALIBRATION_SIGNAL_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousCalibrationSignalsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousCalibrationSignal_(payload) {
  const signalId = `AUTONOMOUS_CALIBRATION_SIGNAL_${Utilities.getUuid()}`;

  return {
    Calibration_Signal_ID: signalId,
    Business_Key: payload.businessKey,
    Signal_Date: payload.signalDate,
    Source_Sheet: AUTONOMOUS_CALIBRATION_SIGNAL_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Signal_Title: `Autonomous Calibration Signal — ${payload.signalDate}`,
    Signal_Type: 'PROCESSING_DATE_STANDARD',
    Calibration_Finding: sciipCreateAutonomousCalibrationFinding_(payload.sourceRows),
    Calibration_Recommendation: sciipCreateAutonomousCalibrationRecommendation_(payload.sourceRows),
    Affected_System_Area: 'DOWNSTREAM_PROCESSOR_DATE_RESOLUTION',
    Priority: 'HIGH',
    Confidence: sciipResolveAutonomousCalibrationSignalConfidence_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_CALIBRATION_SIGNAL_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousCalibrationSignalSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_CALIBRATION_SIGNAL_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_CALIBRATION_SIGNAL_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_CALIBRATION_SIGNAL_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_CALIBRATION_SIGNAL_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousImprovementMemoryForSignalDate_(signalDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_CALIBRATION_SIGNAL_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Memory_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_CALIBRATION_SIGNAL_PROCESSOR_NAME,
      error: 'MEMORY_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === signalDate;
    })
    .map(row => sciipAutonomousCalibrationSignalRowToObject_(headers, row));
}

function sciipCreateAutonomousCalibrationFinding_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} autonomous improvement memory record(s).`,
    'The durable memory confirms that downstream processors must resolve the latest completed upstream processing date instead of assuming the current execution date.',
    'This prevents false SKIPPED_NO_INPUTS results when processors run after midnight or on a later calendar date.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationRecommendation_(sourceRows) {
  return [
    'Adopt sciipResolveLatestProcessingDate_(sheetName, dateColumnName) as the standard date resolver for downstream processors.',
    'Use the resolved upstream date in business keys, source-row filters, and test expectations.',
    'Continue using sciipBusinessKeyPrefixExists_() for multi-row or batch-oriented processors.'
  ].join(' ');
}

function sciipResolveAutonomousCalibrationSignalConfidence_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasHighMemory = sourceRows.some(row => {
    return String(row.Confidence || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighMemory ? 'HIGH' : 'MEDIUM';
}

function sciipAppendAutonomousCalibrationSignal_(signal) {
  const sheet = sciipEnsureAutonomousCalibrationSignalSheet_();

  const row = AUTONOMOUS_CALIBRATION_SIGNAL_SCHEMA.map(header => signal[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousCalibrationSignalRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousCalibrationSignalProcessor() {
  const result = sciipRunAutonomousCalibrationSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousCalibrationSignalProcessor',
    result
  }));

  return result;
}