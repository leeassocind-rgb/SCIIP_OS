/*******************************************************
 * SCIIP_OS v4.0
 * 350_StrategicDecisionProcessor
 *
 * DECISION_BRIEF → STRATEGIC_DECISION
 *******************************************************/

const STRATEGIC_DECISION_SHEET = 'STRATEGIC_DECISION';

const STRATEGIC_DECISION_HEADERS = [
  'ID',
  'Business_Key',
  'Decision_Brief_ID',
  'Decision_Date',
  'Decision_Type',
  'Strategic_Decision',
  'Ownership_Posture',
  'Strategic_Rationale',
  'Urgency',
  'Expected_Impact',
  'Execution_Path',
  'Follow_Up_Trigger',
  'Decision_Status',
  'Confidence',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const STRATEGIC_DECISION_PROCESSOR = '350_StrategicDecisionProcessor';

/**
 * Main processor
 */
function sciipRunStrategicDecisionProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const briefSheet = ss.getSheetByName('DECISION_BRIEF');
  if (!briefSheet) throw new Error('Missing DECISION_BRIEF sheet');

  const decisionSheet = sciipEnsureStrategicDecisionSheet_();

  const briefs = sciipReadSheetObjects_(briefSheet);
  const existingDecisions = sciipReadSheetObjects_(decisionSheet);

  const existingKeys = new Set(
    existingDecisions.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoBrief = 0;

  briefs.forEach(brief => {
    const briefId = brief.ID || brief.Decision_Brief_ID;

    if (!briefId) {
      skippedNoBrief++;
      return;
    }

    const businessKey = `STRATEGIC_DECISION|${briefId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const decision = sciipBuildStrategicDecision_(brief, businessKey);

    decisionSheet.appendRow(
      STRATEGIC_DECISION_HEADERS.map(h => decision[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: STRATEGIC_DECISION_PROCESSOR,
    status: 'SUCCESS',
    decisionBriefsReviewed: briefs.length,
    strategicDecisionsCreated: created,
    skippedDuplicate,
    skippedNoBrief,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory
 */
function sciipBuildStrategicDecision_(brief, businessKey) {
  const now = new Date().toISOString();

  const sourceText = [
    brief.Decision_Title,
    brief.Decision_Context,
    brief.Decision_Question,
    brief.Recommended_Decision,
    brief.Rationale,
    brief.Risk_Considerations,
    brief.Next_Actions,
    brief.Notes
  ].filter(Boolean).join('\n\n');

  return {
    ID: sciipGenerateStrategicDecisionId_(),
    Business_Key: businessKey,
    Decision_Brief_ID: brief.ID || '',
    Decision_Date: brief.Brief_Date || now,
    Decision_Type: sciipStrategicDecisionType_(sourceText),
    Strategic_Decision: sciipStrategicDecisionText_(sourceText),
    Ownership_Posture: sciipOwnershipPosture_(sourceText),
    Strategic_Rationale: sciipStrategicRationale_(sourceText),
    Urgency: sciipDecisionUrgency_(brief, sourceText),
    Expected_Impact: sciipExpectedImpact_(sourceText),
    Execution_Path: sciipExecutionPath_(sourceText),
    Follow_Up_Trigger: sciipFollowUpTrigger_(sourceText),
    Decision_Status: 'PROPOSED',
    Confidence: brief.Confidence || 'MEDIUM',
    Created_At: now,
    Updated_At: now,
    Processor: STRATEGIC_DECISION_PROCESSOR,
    Notes: 'Generated from DECISION_BRIEF'
  };
}

/**
 * Decision logic
 */
function sciipStrategicDecisionType_(text) {
  return 'LANDLORD_STRATEGY';
}

function sciipStrategicDecisionText_(text) {
  return (
    'Maintain an active ownership posture and translate current SCIIP intelligence into targeted leasing, marketing, pricing, and prospect follow-up decisions.'
  );
}

function sciipOwnershipPosture_(text) {
  return (
    'Proactive: ownership should remain informed, responsive, and prepared to adjust asset positioning as market intelligence strengthens.'
  );
}

function sciipStrategicRationale_(text) {
  return [
    'SCIIP has elevated intelligence from briefing into decision support.',
    'The decision brief indicates that current market signals may affect landlord positioning or execution.',
    'A strategic decision record preserves the reasoning behind ownership posture and creates a durable link between intelligence and future action.'
  ].join('\n');
}

function sciipDecisionUrgency_(brief, text) {
  const priority = String(brief.Priority || '').toUpperCase();

  if (priority === 'HIGH') return 'HIGH';
  if (priority === 'LOW') return 'LOW';

  return 'MEDIUM';
}

function sciipExpectedImpact_(text) {
  return (
    'Improved landlord alignment, stronger prospect prioritization, better market responsiveness, and clearer connection between intelligence and execution.'
  );
}

function sciipExecutionPath_(text) {
  return [
    'Review the source decision brief.',
    'Confirm whether the decision applies to a specific asset, landlord, market, or tenant requirement.',
    'Convert the decision into one or more executable actions where appropriate.',
    'Track resulting outcomes through SCIIP action and learning processors.'
  ].join('\n');
}

function sciipFollowUpTrigger_(text) {
  return (
    'Trigger follow-up if related opportunities, recommended actions, market signals, tenant requirements, pricing changes, or competitive movements appear in future SCIIP runs.'
  );
}

/**
 * Sheet setup
 */
function sciipEnsureStrategicDecisionSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(STRATEGIC_DECISION_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(STRATEGIC_DECISION_SHEET);
    sheet.appendRow(STRATEGIC_DECISION_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== STRATEGIC_DECISION_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(STRATEGIC_DECISION_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateStrategicDecisionId_() {
  return 'STRAT_DEC_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
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
function sciipTestStrategicDecisionProcessor() {
  const result = sciipRunStrategicDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestStrategicDecisionProcessor',
    result
  }));

  return result;
}