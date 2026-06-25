/*******************************************************
 * 910_AutonomousProcessorGuidanceProcessor
 *******************************************************/

const AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME = '910_AutonomousProcessorGuidanceProcessor';

const AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_REVIEWS';
const AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_GUIDANCE';

const AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA = [
  'Guidance_ID',
  'Business_Key',
  'Guidance_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Guidance_Title',
  'Guidance_Type',
  'Processor_Build_Guidance',
  'Required_Architecture_Pattern',
  'Validation_Requirement',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousProcessorGuidanceProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousProcessorGuidanceSheet_();

  const guidanceDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET,
      'Review_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_PROCESSOR_GUIDANCE|${guidanceDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
    resolvedGuidanceDate: guidanceDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousProcessorGuidanceCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceReviewsForGuidanceDate_(guidanceDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorGuidanceCreated: 0,
      guidanceDate,
      completedAt: new Date().toISOString()
    };
  }

  const guidance = sciipBuildAutonomousProcessorGuidance_({
    guidanceDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousProcessorGuidance_(guidance);

  return {
    processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousProcessorGuidanceCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousProcessorGuidance_(payload) {
  const guidanceId = `AUTONOMOUS_PROCESSOR_GUIDANCE_${Utilities.getUuid()}`;

  return {
    Guidance_ID: guidanceId,
    Business_Key: payload.businessKey,
    Guidance_Date: payload.guidanceDate,
    Source_Sheet: AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Guidance_Title: `Autonomous Processor Guidance — ${payload.guidanceDate}`,
    Guidance_Type: 'PROCESSOR_BUILD_GOVERNANCE',
    Processor_Build_Guidance: sciipCreateAutonomousProcessorBuildGuidance_(payload.sourceRows),
    Required_Architecture_Pattern: sciipCreateAutonomousProcessorRequiredPattern_(payload.sourceRows),
    Validation_Requirement: sciipCreateAutonomousProcessorValidationRequirement_(payload.sourceRows),
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousProcessorGuidanceSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceReviewsForGuidanceDate_(guidanceDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Review_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      error: 'REVIEW_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === guidanceDate;
    })
    .map(row => sciipAutonomousProcessorGuidanceRowToObject_(headers, row));
}

function sciipCreateAutonomousProcessorBuildGuidance_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} governance review record(s).`,
    'Future downstream processors must follow the active latest completed processing date standard.',
    'Each processor should strengthen the knowledge graph, preserve permanent history, and remain deterministic, idempotent, and production ready.'
  ].join(' ');
}

function sciipCreateAutonomousProcessorRequiredPattern_(sourceRows) {
  return [
    'Required downstream date pattern:',
    '',
    'const processingDate =',
    '  sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt);',
    '',
    'const businessKey = `OUTPUT_TYPE|${processingDate}`;',
    '',
    'Use processingDate for source-row filtering.',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate checks.'
  ].join('\n');
}

function sciipCreateAutonomousProcessorValidationRequirement_(sourceRows) {
  return [
    'First run must create exactly one durable output record when source input exists.',
    'Second run must return SUCCESS with created count 0 and skippedDuplicate: 1.',
    'Execution logs must include the resolved processing date and business key.',
    'A SKIPPED_NO_INPUTS result must include the resolved date for diagnosis.'
  ].join('\n');
}

function sciipAppendAutonomousProcessorGuidance_(guidance) {
  const sheet = sciipEnsureAutonomousProcessorGuidanceSheet_();

  const row = AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA.map(header => guidance[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousProcessorGuidanceRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousProcessorGuidanceProcessor() {
  const result = sciipRunAutonomousProcessorGuidanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorGuidanceProcessor',
    result
  }));

  return result;
}