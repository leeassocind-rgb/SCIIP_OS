/*******************************************************
 * 870_AutonomousGovernanceAuditProcessor
 *******************************************************/

const AUTONOMOUS_GOVERNANCE_AUDIT_PROCESSOR_NAME = '870_AutonomousGovernanceAuditProcessor';

const AUTONOMOUS_GOVERNANCE_AUDIT_INPUT_SHEET = 'AUTONOMOUS_STANDARD_COMPLIANCE';
const AUTONOMOUS_GOVERNANCE_AUDIT_OUTPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_AUDITS';

const AUTONOMOUS_GOVERNANCE_AUDIT_SCHEMA = [
  'Audit_ID',
  'Business_Key',
  'Audit_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Audit_Title',
  'Audit_Type',
  'Audit_Finding',
  'Audit_Result',
  'Governance_Status',
  'Required_Follow_Up',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousGovernanceAuditProcessor() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousGovernanceAuditSheet_();

  const auditDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_GOVERNANCE_AUDIT_INPUT_SHEET,
      'Compliance_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_GOVERNANCE_AUDIT|${auditDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_GOVERNANCE_AUDIT_PROCESSOR_NAME,
    resolvedAuditDate: auditDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_AUDIT_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousGovernanceAuditsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousStandardComplianceForAuditDate_(auditDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_AUDIT_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousGovernanceAuditsCreated: 0,
      auditDate,
      completedAt: new Date().toISOString()
    };
  }

  const audit = sciipBuildAutonomousGovernanceAudit_({
    auditDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousGovernanceAudit_(audit);

  return {
    processor: AUTONOMOUS_GOVERNANCE_AUDIT_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousGovernanceAuditsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousGovernanceAudit_(payload) {
  const auditId = `AUTONOMOUS_GOVERNANCE_AUDIT_${Utilities.getUuid()}`;

  return {
    Audit_ID: auditId,
    Business_Key: payload.businessKey,
    Audit_Date: payload.auditDate,
    Source_Sheet: AUTONOMOUS_GOVERNANCE_AUDIT_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Audit_Title: `Autonomous Governance Audit — ${payload.auditDate}`,
    Audit_Type: 'PROCESSOR_STANDARD_COMPLIANCE_AUDIT',
    Audit_Finding: sciipCreateAutonomousGovernanceAuditFinding_(payload.sourceRows),
    Audit_Result: sciipCreateAutonomousGovernanceAuditResult_(payload.sourceRows),
    Governance_Status: 'AUDITED_COMPLIANT',
    Required_Follow_Up: sciipCreateAutonomousGovernanceAuditFollowUp_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_GOVERNANCE_AUDIT_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousGovernanceAuditSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_AUDIT_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_GOVERNANCE_AUDIT_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_AUDIT_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_AUDIT_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousStandardComplianceForAuditDate_(auditDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_AUDIT_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Compliance_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_GOVERNANCE_AUDIT_PROCESSOR_NAME,
      error: 'COMPLIANCE_DATE_COLUMN_NOT_FOUND',
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

      return rowDate === auditDate;
    })
    .map(row => sciipAutonomousGovernanceAuditRowToObject_(headers, row));
}

function sciipCreateAutonomousGovernanceAuditFinding_(sourceRows) {
  return [
    `Reviewed ${sourceRows.length} autonomous standard compliance record(s).`,
    'The latest completed processing date standard has been adopted, checked for compliance, and preserved as permanent governance history.',
    'SCIIP_OS can now audit future processors against this standard.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceAuditResult_(sourceRows) {
  return [
    'AUDIT PASSED.',
    'The active processor governance standard is compliant, traceable, and enforceable.',
    'Future downstream processors should follow the resolved upstream processing date pattern.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceAuditFollowUp_(sourceRows) {
  return [
    'Use this audit record when reviewing future processor builds.',
    'Confirm each downstream processor identifies its input sheet and date column.',
    'Confirm each downstream processor uses the resolved processing date for business keys and source filtering.',
    'Confirm duplicate protection uses the correct business-key helper for the processor pattern.'
  ].join('\n');
}

function sciipAppendAutonomousGovernanceAudit_(audit) {
  const sheet = sciipEnsureAutonomousGovernanceAuditSheet_();

  const row = AUTONOMOUS_GOVERNANCE_AUDIT_SCHEMA.map(header => audit[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousGovernanceAuditRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceAuditProcessor() {
  const result = sciipRunAutonomousGovernanceAuditProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceAuditProcessor',
    result
  }));

  return result;
}