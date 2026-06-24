/*******************************************************
 * SCIIP_OS v4.0
 * 360_DecisionExecutionPlanProcessor
 *
 * STRATEGIC_DECISION → DECISION_EXECUTION_PLAN
 *******************************************************/

const DECISION_EXECUTION_PLAN_SHEET = 'DECISION_EXECUTION_PLAN';

const DECISION_EXECUTION_PLAN_HEADERS = [
  'ID',
  'Business_Key',
  'Strategic_Decision_ID',
  'Plan_Date',
  'Execution_Title',
  'Execution_Objective',
  'Execution_Steps',
  'Required_Inputs',
  'Stakeholders',
  'Timing',
  'Success_Criteria',
  'Risks',
  'Escalation_Trigger',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const DECISION_EXECUTION_PLAN_PROCESSOR = '360_DecisionExecutionPlanProcessor';

/**
 * Main processor
 */
function sciipRunDecisionExecutionPlanProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const decisionSheet = ss.getSheetByName('STRATEGIC_DECISION');
  if (!decisionSheet) throw new Error('Missing STRATEGIC_DECISION sheet');

  const planSheet = sciipEnsureDecisionExecutionPlanSheet_();

  const decisions = sciipReadSheetObjects_(decisionSheet);
  const existingPlans = sciipReadSheetObjects_(planSheet);

  const existingKeys = new Set(
    existingPlans.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoDecision = 0;

  decisions.forEach(decision => {
    const decisionId = decision.ID || decision.Strategic_Decision_ID;

    if (!decisionId) {
      skippedNoDecision++;
      return;
    }

    const businessKey = `DECISION_EXECUTION_PLAN|${decisionId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const plan = sciipBuildDecisionExecutionPlan_(decision, businessKey);

    planSheet.appendRow(
      DECISION_EXECUTION_PLAN_HEADERS.map(h => plan[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: DECISION_EXECUTION_PLAN_PROCESSOR,
    status: 'SUCCESS',
    strategicDecisionsReviewed: decisions.length,
    executionPlansCreated: created,
    skippedDuplicate,
    skippedNoDecision,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory
 */
function sciipBuildDecisionExecutionPlan_(decision, businessKey) {
  const now = new Date().toISOString();

  const sourceText = [
    decision.Strategic_Decision,
    decision.Ownership_Posture,
    decision.Strategic_Rationale,
    decision.Expected_Impact,
    decision.Execution_Path,
    decision.Follow_Up_Trigger,
    decision.Notes
  ].filter(Boolean).join('\n\n');

  return {
    ID: sciipGenerateDecisionExecutionPlanId_(),
    Business_Key: businessKey,
    Strategic_Decision_ID: decision.ID || '',
    Plan_Date: decision.Decision_Date || now,
    Execution_Title: sciipExecutionPlanTitle_(decision),
    Execution_Objective: sciipExecutionObjective_(sourceText),
    Execution_Steps: sciipExecutionSteps_(sourceText),
    Required_Inputs: sciipRequiredInputs_(sourceText),
    Stakeholders: sciipStakeholders_(sourceText),
    Timing: sciipExecutionTiming_(decision),
    Success_Criteria: sciipSuccessCriteria_(sourceText),
    Risks: sciipExecutionRisks_(sourceText),
    Escalation_Trigger: sciipEscalationTrigger_(sourceText),
    Priority: decision.Urgency || 'MEDIUM',
    Confidence: decision.Confidence || 'MEDIUM',
    Status: 'PENDING',
    Created_At: now,
    Updated_At: now,
    Processor: DECISION_EXECUTION_PLAN_PROCESSOR,
    Notes: 'Generated from STRATEGIC_DECISION'
  };
}

/**
 * Execution logic
 */
function sciipExecutionPlanTitle_(decision) {
  const date =
    decision.Decision_Date ||
    new Date().toISOString().slice(0, 10);

  return `Execution Plan — ${date}`;
}

function sciipExecutionObjective_(text) {
  return (
    'Convert the strategic decision into an executable landlord-facing workflow that can be reviewed, assigned, tracked, and evaluated.'
  );
}

function sciipExecutionSteps_(text) {
  return [
    'Review the source strategic decision.',
    'Identify whether the decision applies to a specific asset, landlord, tenant requirement, market, or competitive condition.',
    'Determine whether immediate broker action, landlord communication, pricing review, marketing update, or additional research is required.',
    'Create or update recommended actions where appropriate.',
    'Track execution and outcomes through SCIIP action and learning processors.'
  ].join('\n');
}

function sciipRequiredInputs_(text) {
  return [
    'Source strategic decision',
    'Related decision brief',
    'Relevant market signals',
    'Related opportunities',
    'Recommended actions',
    'Broker judgment or landlord direction where needed'
  ].join('\n');
}

function sciipStakeholders_(text) {
  return [
    'Brokerage team',
    'Landlord / ownership',
    'Asset manager',
    'Prospect or tenant representative where applicable',
    'SCIIP intelligence workflow'
  ].join('\n');
}

function sciipExecutionTiming_(decision) {
  const urgency = String(decision.Urgency || '').toUpperCase();

  if (urgency === 'HIGH') return 'Immediate review recommended';
  if (urgency === 'LOW') return 'Monitor and review during next regular intelligence cycle';

  return 'Review during current or next landlord intelligence cycle';
}

function sciipSuccessCriteria_(text) {
  return [
    'Decision is reviewed by the appropriate stakeholder.',
    'Recommended action is created, updated, or dismissed with rationale.',
    'Relevant landlord communication or broker follow-up is completed where appropriate.',
    'Outcome is captured for future SCIIP learning.'
  ].join('\n');
}

function sciipExecutionRisks_(text) {
  return [
    'Decision may be based on early or incomplete intelligence.',
    'Execution may require human confirmation before landlord communication.',
    'Market conditions may change before action is completed.',
    'Action may not be attributable to a measurable outcome without tracking discipline.'
  ].join('\n');
}

function sciipEscalationTrigger_(text) {
  return (
    'Escalate if the same decision theme appears repeatedly, if urgency increases, if a landlord-facing action is overdue, or if a related opportunity becomes time-sensitive.'
  );
}

/**
 * Sheet setup
 */
function sciipEnsureDecisionExecutionPlanSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(DECISION_EXECUTION_PLAN_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(DECISION_EXECUTION_PLAN_SHEET);
    sheet.appendRow(DECISION_EXECUTION_PLAN_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== DECISION_EXECUTION_PLAN_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(DECISION_EXECUTION_PLAN_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateDecisionExecutionPlanId_() {
  return 'EXEC_PLAN_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestDecisionExecutionPlanProcessor() {
  const result = sciipRunDecisionExecutionPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestDecisionExecutionPlanProcessor',
    result
  }));

  return result;
}