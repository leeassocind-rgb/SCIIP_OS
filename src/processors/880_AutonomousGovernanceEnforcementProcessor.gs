/*******************************************************
 * 880_AutonomousGovernanceEnforcementProcessor
 *******************************************************/

const AUTONOMOUS_GOVERNANCE_ENFORCEMENT_PROCESSOR_NAME = '880_AutonomousGovernanceEnforcementProcessor';

const AUTONOMOUS_GOVERNANCE_ENFORCEMENT_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_AUDITS';
const AUTONOMOUS_GOVERNANCE_ENFORCEMENT_OUTPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_ENFORCEMENTS';

const AUTONOMOUS_GOVERNANCE_ENFORCEMENT_SCHEMA = [
  'Enforcement_ID',
  'Business_Key',
  'Enforcement_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Enforcement_Title',
  'Enforcement_Type',
  'Enforcement_Rule',
  'Enforcement_Scope',
  'Validation_Checklist',
  'Enforcement_Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousGovernanceEnforcementProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousGovernanceEnforcementSheet_();

  const enforcementDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_GOVERNANCE_ENFORCEMENT_INPUT_SHEET,
      'Audit_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_GOVERNANCE_ENFORCEMENT|${enforcementDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_GOVERNANCE_ENFORCEMENT_PROCESSOR_NAME,
    resolvedEnforcementDate: enforcementDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_ENFORCEMENT_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousGovernanceEnforcementsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceAuditsForEnforcementDate_(enforcementDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_ENFORCEMENT_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousGovernanceEnforcementsCreated: 0,
      enforcementDate,
      completedAt: new Date().toISOString()
    };
  }

  const enforcement = sciipBuildAutonomousGovernanceEnforcement_({
    enforcementDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousGovernanceEnforcement_(enforcement);

  return {
    processor: AUTONOMOUS_GOVERNANCE_ENFORCEMENT_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousGovernanceEnforcementsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousGovernanceEnforcement_(payload) {
  const enforcementId = `AUTONOMOUS_GOVERNANCE_ENFORCEMENT_${Utilities.getUuid()}`;

  return {
    Enforcement_ID: enforcementId,
    Business_Key: payload.businessKey,
    Enforcement_Date: payload.enforcementDate,
    Source_Sheet: AUTONOMOUS_GOVERNANCE_ENFORCEMENT_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Enforcement_Title: `Autonomous Governance Enforcement — ${payload.enforcementDate}`,
    Enforcement_Type: 'PROCESSOR_BUILD_STANDARD_ENFORCEMENT',
    Enforcement_Rule: sciipCreateAutonomousGovernanceEnforcementRule_(payload.sourceRows),
    Enforcement_Scope: sciipCreateAutonomousGovernanceEnforcementScope_(payload.sourceRows),
    Validation_Checklist: sciipCreateAutonomousGovernanceValidationChecklist_(payload.sourceRows),
    Enforcement_Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_GOVERNANCE_ENFORCEMENT_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousGovernanceEnforcementSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_ENFORCEMENT_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_GOVERNANCE_ENFORCEMENT_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_ENFORCEMENT_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_ENFORCEMENT_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceAuditsForEnforcementDate_(enforcementDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_ENFORCEMENT_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Audit_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_GOVERNANCE_ENFORCEMENT_PROCESSOR_NAME,
      error: 'AUDIT_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === enforcementDate;
    })
    .map(row => sciipAutonomousGovernanceEnforcementRowToObject_(headers, row));
}

function sciipCreateAutonomousGovernanceEnforcementRule_(sourceRows) {
  return [
    'Every downstream SCIIP_OS processor that consumes prior processor output must resolve its processing date from the latest completed upstream batch.',
    'The resolved date must be used for both business-key generation and source-row filtering.',
    'Processors may only fall back to the current execution date when no upstream date exists.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceEnforcementScope_(sourceRows) {
  return [
    'Applies to all future autonomous processors.',
    'Applies to existing downstream processors during refactor or bug fix review.',
    'Applies to all batch-oriented processors that depend on upstream output sheets.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceValidationChecklist_(sourceRows) {
  return [
    '1. Identify the processor input sheet.',
    '2. Identify the upstream processing date column.',
    '3. Resolve date using sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN).',
    '4. Use the resolved date in the business key.',
    '5. Use the resolved date in source-row filtering.',
    '6. Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate protection.',
    '7. Log resolved date and business key during test execution.',
    '8. Validate first run creates one record.',
    '9. Validate second run skips duplicate with skippedDuplicate: 1.'
  ].join('\n');
}

function sciipAppendAutonomousGovernanceEnforcement_(enforcement) {
  const sheet = sciipEnsureAutonomousGovernanceEnforcementSheet_();

  const row = AUTONOMOUS_GOVERNANCE_ENFORCEMENT_SCHEMA.map(header => enforcement[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousGovernanceEnforcementRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceEnforcementProcessor() {
  const result = sciipRunAutonomousGovernanceEnforcementProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceEnforcementProcessor',
    result
  }));

  return result;
}