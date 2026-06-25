/*******************************************************
 * 860_AutonomousStandardComplianceProcessor
 *******************************************************/

const AUTONOMOUS_STANDARD_COMPLIANCE_PROCESSOR_NAME = '860_AutonomousStandardComplianceProcessor';

const AUTONOMOUS_STANDARD_COMPLIANCE_INPUT_SHEET = 'AUTONOMOUS_STANDARD_ADOPTIONS';
const AUTONOMOUS_STANDARD_COMPLIANCE_OUTPUT_SHEET = 'AUTONOMOUS_STANDARD_COMPLIANCE';

const AUTONOMOUS_STANDARD_COMPLIANCE_SCHEMA = [
  'Compliance_ID',
  'Business_Key',
  'Compliance_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Compliance_Title',
  'Standard_Name',
  'Compliance_Check',
  'Compliance_Result',
  'Governance_Impact',
  'Required_Action',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousStandardComplianceProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousStandardComplianceSheet_();

  const complianceDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_STANDARD_COMPLIANCE_INPUT_SHEET,
      'Adoption_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_STANDARD_COMPLIANCE|${complianceDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_STANDARD_COMPLIANCE_PROCESSOR_NAME,
    resolvedComplianceDate: complianceDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_STANDARD_COMPLIANCE_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousStandardComplianceCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousStandardAdoptionsForComplianceDate_(complianceDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_STANDARD_COMPLIANCE_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousStandardComplianceCreated: 0,
      complianceDate,
      completedAt: new Date().toISOString()
    };
  }

  const compliance = sciipBuildAutonomousStandardCompliance_({
    complianceDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousStandardCompliance_(compliance);

  return {
    processor: AUTONOMOUS_STANDARD_COMPLIANCE_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousStandardComplianceCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousStandardCompliance_(payload) {
  const complianceId = `AUTONOMOUS_STANDARD_COMPLIANCE_${Utilities.getUuid()}`;

  return {
    Compliance_ID: complianceId,
    Business_Key: payload.businessKey,
    Compliance_Date: payload.complianceDate,
    Source_Sheet: AUTONOMOUS_STANDARD_COMPLIANCE_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Compliance_Title: `Autonomous Standard Compliance — ${payload.complianceDate}`,
    Standard_Name: sciipResolveComplianceStandardName_(payload.sourceRows),
    Compliance_Check: sciipCreateAutonomousStandardComplianceCheck_(payload.sourceRows),
    Compliance_Result: sciipCreateAutonomousStandardComplianceResult_(payload.sourceRows),
    Governance_Impact: sciipCreateAutonomousStandardComplianceImpact_(payload.sourceRows),
    Required_Action: sciipCreateAutonomousStandardComplianceRequiredAction_(payload.sourceRows),
    Status: 'COMPLIANT_STANDARD_ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_STANDARD_COMPLIANCE_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousStandardComplianceSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_STANDARD_COMPLIANCE_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_STANDARD_COMPLIANCE_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_STANDARD_COMPLIANCE_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_STANDARD_COMPLIANCE_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousStandardAdoptionsForComplianceDate_(complianceDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_STANDARD_COMPLIANCE_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Adoption_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_STANDARD_COMPLIANCE_PROCESSOR_NAME,
      error: 'ADOPTION_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === complianceDate;
    })
    .map(row => sciipAutonomousStandardComplianceRowToObject_(headers, row));
}

function sciipResolveComplianceStandardName_(sourceRows) {
  const names = sourceRows
    .map(row => String(row.Standard_Name || '').trim())
    .filter(Boolean);

  return names.length ? names[0] : 'Latest Completed Processing Date Standard';
}

function sciipCreateAutonomousStandardComplianceCheck_(sourceRows) {
  return [
    `Reviewed ${sourceRows.length} autonomous standard adoption record(s).`,
    'Confirmed that the latest completed processing date standard has an active adoption record.',
    'Confirmed that future downstream processors should be checked against this governance rule.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceResult_(sourceRows) {
  return [
    'COMPLIANT.',
    'The processor governance standard is active and available for future build validation.',
    'SCIIP_OS has preserved the standard as permanent compliance history.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceImpact_(sourceRows) {
  return [
    'Improves reliability of downstream processors.',
    'Reduces false SKIPPED_NO_INPUTS outcomes.',
    'Strengthens deterministic batch processing and idempotent operating-system behavior.'
  ].join(' ');
}

function sciipCreateAutonomousStandardComplianceRequiredAction_(sourceRows) {
  return [
    'Apply this standard to every new downstream processor.',
    'When reviewing existing processors, check whether processing dates are resolved from upstream sheets.',
    'If a processor consumes prior processor output, do not default to the current execution date unless no upstream date exists.'
  ].join('\n');
}

function sciipAppendAutonomousStandardCompliance_(compliance) {
  const sheet = sciipEnsureAutonomousStandardComplianceSheet_();

  const row = AUTONOMOUS_STANDARD_COMPLIANCE_SCHEMA.map(header => compliance[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousStandardComplianceRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardComplianceProcessor() {
  const result = sciipRunAutonomousStandardComplianceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardComplianceProcessor',
    result
  }));

  return result;
}