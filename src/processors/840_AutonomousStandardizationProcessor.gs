/*******************************************************
 * 840_AutonomousStandardizationProcessor
 *******************************************************/

const AUTONOMOUS_STANDARDIZATION_PROCESSOR_NAME = '840_AutonomousStandardizationProcessor';

const AUTONOMOUS_STANDARDIZATION_INPUT_SHEET = 'AUTONOMOUS_CALIBRATION_DECISIONS';
const AUTONOMOUS_STANDARDIZATION_OUTPUT_SHEET = 'AUTONOMOUS_STANDARDIZATIONS';

const AUTONOMOUS_STANDARDIZATION_SCHEMA = [
  'Standardization_ID',
  'Business_Key',
  'Standard_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Standard_Title',
  'Standard_Type',
  'Standard_Name',
  'Standard_Description',
  'Required_Pattern',
  'Applies_To',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousStandardizationProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousStandardizationSheet_();

  const standardDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_STANDARDIZATION_INPUT_SHEET,
      'Decision_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_STANDARDIZATION|${standardDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_STANDARDIZATION_PROCESSOR_NAME,
    resolvedStandardDate: standardDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_STANDARDIZATION_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousStandardizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousCalibrationDecisionsForStandardDate_(standardDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_STANDARDIZATION_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousStandardizationsCreated: 0,
      standardDate,
      completedAt: new Date().toISOString()
    };
  }

  const standardization = sciipBuildAutonomousStandardization_({
    standardDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousStandardization_(standardization);

  return {
    processor: AUTONOMOUS_STANDARDIZATION_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousStandardizationsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousStandardization_(payload) {
  const standardizationId = `AUTONOMOUS_STANDARDIZATION_${Utilities.getUuid()}`;

  return {
    Standardization_ID: standardizationId,
    Business_Key: payload.businessKey,
    Standard_Date: payload.standardDate,
    Source_Sheet: AUTONOMOUS_STANDARDIZATION_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Standard_Title: `Autonomous Standardization — ${payload.standardDate}`,
    Standard_Type: 'PROCESSOR_ARCHITECTURE_STANDARD',
    Standard_Name: 'Latest Completed Processing Date Standard',
    Standard_Description: sciipCreateAutonomousStandardDescription_(payload.sourceRows),
    Required_Pattern: sciipCreateAutonomousStandardRequiredPattern_(payload.sourceRows),
    Applies_To: 'All downstream processors that consume prior processor output sheets',
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_STANDARDIZATION_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousStandardizationSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_STANDARDIZATION_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_STANDARDIZATION_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_STANDARDIZATION_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_STANDARDIZATION_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousCalibrationDecisionsForStandardDate_(standardDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_STANDARDIZATION_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Decision_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_STANDARDIZATION_PROCESSOR_NAME,
      error: 'DECISION_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === standardDate;
    })
    .map(row => sciipAutonomousStandardizationRowToObject_(headers, row));
}

function sciipCreateAutonomousStandardDescription_(sourceRows) {
  return [
    `SCIIP_OS converted ${sourceRows.length} approved calibration decision record(s) into an active processor standard.`,
    'The standard requires downstream processors to consume the latest completed upstream processing batch instead of assuming the current calendar date.',
    'This prevents valid upstream records from being skipped when downstream processors run on a later day.'
  ].join(' ');
}

function sciipCreateAutonomousStandardRequiredPattern_(sourceRows) {
  return [
    'const processingDate =',
    '  sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt);',
    '',
    'const businessKey = `PROCESSOR_OUTPUT|${processingDate}`;',
    '',
    'Use processingDate for both:',
    '- Business key generation',
    '- Source-row date filtering',
    '',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented idempotency checks.'
  ].join('\n');
}

function sciipAppendAutonomousStandardization_(standardization) {
  const sheet = sciipEnsureAutonomousStandardizationSheet_();

  const row = AUTONOMOUS_STANDARDIZATION_SCHEMA.map(header => standardization[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousStandardizationRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardizationProcessor() {
  const result = sciipRunAutonomousStandardizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardizationProcessor',
    result
  }));

  return result;
}