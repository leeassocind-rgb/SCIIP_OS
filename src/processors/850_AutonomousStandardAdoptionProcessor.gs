/*******************************************************
 * 850_AutonomousStandardAdoptionProcessor
 *******************************************************/

const AUTONOMOUS_STANDARD_ADOPTION_PROCESSOR_NAME = '850_AutonomousStandardAdoptionProcessor';

const AUTONOMOUS_STANDARD_ADOPTION_INPUT_SHEET = 'AUTONOMOUS_STANDARDIZATIONS';
const AUTONOMOUS_STANDARD_ADOPTION_OUTPUT_SHEET = 'AUTONOMOUS_STANDARD_ADOPTIONS';

const AUTONOMOUS_STANDARD_ADOPTION_SCHEMA = [
  'Adoption_ID',
  'Business_Key',
  'Adoption_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Adoption_Title',
  'Standard_Name',
  'Adoption_Scope',
  'Adoption_Rationale',
  'Governance_Rule',
  'Compliance_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousStandardAdoptionProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousStandardAdoptionSheet_();

  const adoptionDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_STANDARD_ADOPTION_INPUT_SHEET,
      'Standard_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_STANDARD_ADOPTION|${adoptionDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_STANDARD_ADOPTION_PROCESSOR_NAME,
    resolvedAdoptionDate: adoptionDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_STANDARD_ADOPTION_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousStandardAdoptionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousStandardizationsForAdoptionDate_(adoptionDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_STANDARD_ADOPTION_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousStandardAdoptionsCreated: 0,
      adoptionDate,
      completedAt: new Date().toISOString()
    };
  }

  const adoption = sciipBuildAutonomousStandardAdoption_({
    adoptionDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousStandardAdoption_(adoption);

  return {
    processor: AUTONOMOUS_STANDARD_ADOPTION_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousStandardAdoptionsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousStandardAdoption_(payload) {
  const adoptionId = `AUTONOMOUS_STANDARD_ADOPTION_${Utilities.getUuid()}`;

  return {
    Adoption_ID: adoptionId,
    Business_Key: payload.businessKey,
    Adoption_Date: payload.adoptionDate,
    Source_Sheet: AUTONOMOUS_STANDARD_ADOPTION_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Adoption_Title: `Autonomous Standard Adoption — ${payload.adoptionDate}`,
    Standard_Name: sciipResolveAdoptedStandardName_(payload.sourceRows),
    Adoption_Scope: sciipCreateAutonomousStandardAdoptionScope_(payload.sourceRows),
    Adoption_Rationale: sciipCreateAutonomousStandardAdoptionRationale_(payload.sourceRows),
    Governance_Rule: sciipCreateAutonomousStandardGovernanceRule_(payload.sourceRows),
    Compliance_Status: 'STANDARD_ADOPTED',
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_STANDARD_ADOPTION_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousStandardAdoptionSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_STANDARD_ADOPTION_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_STANDARD_ADOPTION_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_STANDARD_ADOPTION_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_STANDARD_ADOPTION_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousStandardizationsForAdoptionDate_(adoptionDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_STANDARD_ADOPTION_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Standard_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_STANDARD_ADOPTION_PROCESSOR_NAME,
      error: 'STANDARD_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === adoptionDate;
    })
    .map(row => sciipAutonomousStandardAdoptionRowToObject_(headers, row));
}

function sciipResolveAdoptedStandardName_(sourceRows) {
  const names = sourceRows
    .map(row => String(row.Standard_Name || '').trim())
    .filter(Boolean);

  return names.length ? names[0] : 'Latest Completed Processing Date Standard';
}

function sciipCreateAutonomousStandardAdoptionScope_(sourceRows) {
  return [
    'Applies to all downstream SCIIP_OS processors that consume prior processor output sheets.',
    'Applies to business-key generation, source-row filtering, duplicate detection, and test expectations.',
    'Applies especially to processors that may run after the upstream batch date.'
  ].join(' ');
}

function sciipCreateAutonomousStandardAdoptionRationale_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} active standardization record(s).`,
    'The latest completed processing date standard has been validated through the 750 processor fix and downstream autonomous improvement chain.',
    'Adopting this standard reduces false SKIPPED_NO_INPUTS outcomes and improves deterministic batch continuity.'
  ].join(' ');
}

function sciipCreateAutonomousStandardGovernanceRule_(sourceRows) {
  return [
    'Before building or revising a downstream processor, identify the upstream input sheet and upstream date column.',
    'Resolve the processing date using sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN).',
    'Use the resolved date consistently in the business key and source-row filter.',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate checks.',
    'Do not assume the current execution date unless no upstream processing date exists.'
  ].join('\n');
}

function sciipAppendAutonomousStandardAdoption_(adoption) {
  const sheet = sciipEnsureAutonomousStandardAdoptionSheet_();

  const row = AUTONOMOUS_STANDARD_ADOPTION_SCHEMA.map(header => adoption[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousStandardAdoptionRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardAdoptionProcessor() {
  const result = sciipRunAutonomousStandardAdoptionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardAdoptionProcessor',
    result
  }));

  return result;
}