/*******************************************************
 * SCIIP_OS v4.1
 * 960_AutonomousProcessorPromotionDecisionProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_960_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_READINESS';
const SCIIP_960_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISIONS';
const SCIIP_960_INPUT_DATE_COLUMN = 'Readiness_Date';

const SCIIP_960_OUTPUT_HEADERS = [
  'Promotion_Decision_ID',
  'Decision_Date',
  'Source_Readiness_ID',
  'Target_Processor',
  'Build_Phase',
  'Readiness_Status',
  'Promotion_Decision',
  'Decision_Rationale',
  'Required_Next_Action',
  'Blocking_Risk',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_960_PROCESSOR = '960_AutonomousProcessorPromotionDecisionProcessor';
const SCIIP_960_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISION';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorPromotionDecisionProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_960_INPUT_SHEET);
  if (!inputSheet) {
    return sciip960Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip960EnsureSheet_(ss, SCIIP_960_OUTPUT_SHEET, SCIIP_960_OUTPUT_HEADERS);

  const resolvedDecisionDate =
    sciipResolveLatestProcessingDate_(SCIIP_960_INPUT_SHEET, SCIIP_960_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_960_BUSINESS_PREFIX}|${resolvedDecisionDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip960Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const readinessRows = sciip960ReadRowsForDate_(
    inputSheet,
    SCIIP_960_INPUT_DATE_COLUMN,
    resolvedDecisionDate
  );

  if (!readinessRows.length) {
    return sciip960Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = readinessRows.map((row, index) =>
    sciip960BuildPromotionDecision_(row, resolvedDecisionDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_960_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip960Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip960BuildPromotionDecision_(row, decisionDate, businessKey, startedAt, index) {
  const sourceReadinessId =
    row.Readiness_ID ||
    row.Source_Readiness_ID ||
    `READINESS_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const buildPhase =
    row.Build_Phase ||
    'GENERAL';

  const readinessStatus =
    row.Readiness_Status ||
    'NEEDS_REVIEW';

  const decision = sciip960ResolvePromotionDecision_(readinessStatus, row);

  return [
    sciip960CreateId_('PROMOTION_DECISION'),
    decisionDate,
    sourceReadinessId,
    targetProcessor,
    buildPhase,
    readinessStatus,
    decision.decision,
    decision.rationale,
    decision.nextAction,
    row.Blocking_Risk || decision.blockingRisk,
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Creates permanent promotion decision history from autonomous processor readiness signals',
    `${businessKey}|${targetProcessor}|${sourceReadinessId}|${buildPhase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip960ResolvePromotionDecision_(readinessStatus, row) {
  const status = String(readinessStatus || '').toUpperCase();

  if (status === 'READY') {
    return {
      decision: 'PROMOTE_TO_NEXT_STAGE',
      rationale: 'Processor readiness signal indicates this build phase is ready for downstream promotion.',
      nextAction: 'Advance processor toward downstream orchestration or implementation.',
      blockingRisk: 'NONE'
    };
  }

  if (status === 'BLOCKED') {
    return {
      decision: 'DO_NOT_PROMOTE',
      rationale: row.Readiness_Rationale || 'Readiness signal indicates a blocking condition.',
      nextAction: row.Required_Next_Action || 'Resolve blocking issue before promotion.',
      blockingRisk: row.Blocking_Risk || 'Blocked readiness may break downstream processor chain.'
    };
  }

  return {
    decision: 'HOLD_FOR_REVIEW',
    rationale: row.Readiness_Rationale || 'Readiness signal requires review before promotion.',
    nextAction: row.Required_Next_Action || 'Review readiness record and decide whether to promote.',
    blockingRisk: row.Blocking_Risk || 'Unreviewed readiness may allow incomplete processor work downstream.'
  };
}

function sciip960ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_960_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip960EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip960CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip960Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_960_PROCESSOR,
    status,
    autonomousProcessorPromotionDecisionsCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorPromotionDecisionProcessor() {
  const result = sciipRunAutonomousProcessorPromotionDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorPromotionDecisionProcessor',
    result
  }));

  return result;
}