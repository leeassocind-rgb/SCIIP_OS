/*******************************************************
 * SCIIP_OS v4.0
 * 340_DecisionBriefProcessor
 *
 * EXECUTIVE_SUMMARY → DECISION_BRIEF
 *******************************************************/

const DECISION_BRIEF_SHEET = 'DECISION_BRIEF';

const DECISION_BRIEF_HEADERS = [
  'ID',
  'Business_Key',
  'Executive_Summary_ID',
  'Brief_Date',
  'Decision_Audience',
  'Decision_Title',
  'Decision_Context',
  'Decision_Question',
  'Recommended_Decision',
  'Rationale',
  'Risk_Considerations',
  'Next_Actions',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const DECISION_BRIEF_PROCESSOR = '340_DecisionBriefProcessor';

/**
 * Main processor
 */
function sciipRunDecisionBriefProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const summarySheet = ss.getSheetByName('EXECUTIVE_SUMMARY');
  if (!summarySheet) throw new Error('Missing EXECUTIVE_SUMMARY sheet');

  const briefSheet = sciipEnsureDecisionBriefSheet_();

  const summaries = sciipReadSheetObjects_(summarySheet);
  const existingBriefs = sciipReadSheetObjects_(briefSheet);

  const existingKeys = new Set(
    existingBriefs.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoSummary = 0;

  summaries.forEach(summary => {
    const summaryId = summary.ID || summary.Executive_Summary_ID;

    if (!summaryId) {
      skippedNoSummary++;
      return;
    }

    const businessKey = `DECISION_BRIEF|${summaryId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const brief = sciipBuildDecisionBrief_(summary, businessKey);

    briefSheet.appendRow(DECISION_BRIEF_HEADERS.map(h => brief[h] || ''));

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: DECISION_BRIEF_PROCESSOR,
    status: 'SUCCESS',
    executiveSummariesReviewed: summaries.length,
    decisionBriefsCreated: created,
    skippedDuplicate,
    skippedNoSummary,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory
 */
function sciipBuildDecisionBrief_(summary, businessKey) {
  const now = new Date().toISOString();

  const contextText = [
    summary.Summary_Title,
    summary.Executive_Summary,
    summary.Key_Takeaways,
    summary.Market_Implications,
    summary.Recommended_Focus,
    summary.Notes
  ].filter(Boolean).join('\n\n');

  return {
    ID: sciipGenerateDecisionBriefId_(),
    Business_Key: businessKey,
    Executive_Summary_ID: summary.ID || '',
    Brief_Date: summary.Summary_Date || now,
    Decision_Audience: 'Landlord / Executive',
    Decision_Title: sciipDecisionBriefTitle_(summary),
    Decision_Context: sciipDecisionContext_(contextText),
    Decision_Question: sciipDecisionQuestion_(contextText),
    Recommended_Decision: sciipRecommendedDecision_(contextText),
    Rationale: sciipDecisionRationale_(contextText),
    Risk_Considerations: sciipDecisionRisks_(contextText),
    Next_Actions: sciipDecisionNextActions_(contextText),
    Priority: 'MEDIUM',
    Confidence: summary.Confidence || 'MEDIUM',
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: DECISION_BRIEF_PROCESSOR,
    Notes: 'Generated from EXECUTIVE_SUMMARY'
  };
}

/**
 * Decision logic
 */
function sciipDecisionBriefTitle_(summary) {
  const date =
    summary.Summary_Date ||
    new Date().toISOString().slice(0, 10);

  return `Decision Brief — ${date}`;
}

function sciipDecisionContext_(text) {
  return (
    'SCIIP converted the latest executive summary into a decision-ready brief. ' +
    'This brief is intended to help ownership evaluate whether current market intelligence requires a change in leasing strategy, pricing posture, marketing emphasis, prospect targeting, or follow-up priority.'
  );
}

function sciipDecisionQuestion_(text) {
  return (
    'Does the current intelligence support a near-term ownership decision, strategic adjustment, or focused landlord action?'
  );
}

function sciipRecommendedDecision_(text) {
  return (
    'Continue monitoring current market signals while prioritizing follow-up on opportunities, tenant requirements, competitive changes, or landlord actions identified by SCIIP.'
  );
}

function sciipDecisionRationale_(text) {
  return [
    'SCIIP has identified digest-level intelligence that may affect landlord positioning.',
    'The executive summary indicates themes that should be translated into practical ownership decisions.',
    'Decision briefs allow market intelligence to move from passive reporting into active decision support.'
  ].join('\n');
}

function sciipDecisionRisks_(text) {
  return [
    'Market signals may still be incomplete or early-stage.',
    'Tenant requirements may change before ownership can act.',
    'Competitive positioning may require additional validation from brokers, tours, proposals, or pricing data.'
  ].join('\n');
}

function sciipDecisionNextActions_(text) {
  return [
    'Review related opportunities and recommended actions.',
    'Identify whether any landlord communication should be sent.',
    'Compare current decision brief against prior briefs for recurring themes.',
    'Escalate high-confidence items into action tracking.'
  ].join('\n');
}

/**
 * Sheet setup
 */
function sciipEnsureDecisionBriefSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(DECISION_BRIEF_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(DECISION_BRIEF_SHEET);
    sheet.appendRow(DECISION_BRIEF_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== DECISION_BRIEF_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(DECISION_BRIEF_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateDecisionBriefId_() {
  return 'DEC_BRIEF_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
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
function sciipTestDecisionBriefProcessor() {
  const result = sciipRunDecisionBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestDecisionBriefProcessor',
    result
  }));

  return result;
}