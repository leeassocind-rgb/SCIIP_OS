/************************************************************
 * 290_LearningWeightAdjustmentProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert action outcomes into reusable learning weights.
 *
 * Input:
 * - ACTION_OUTCOME
 *
 * Output:
 * - LEARNING_WEIGHT
 ************************************************************/

const SCIIP_LEARNING_WEIGHT_PROCESSOR = '290_LearningWeightAdjustmentProcessor';
const SCIIP_LEARNING_WEIGHT_SHEET = 'LEARNING_WEIGHT';

const SCIIP_LEARNING_WEIGHT_HEADERS = [
  'Weight_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Action_Type',
  'Outcome_Class',
  'Weight_Type',
  'Weight_Adjustment',
  'Learning_Text',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunLearningWeightAdjustmentProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_LEARNING_WEIGHT_SHEET, SCIIP_LEARNING_WEIGHT_HEADERS);

  const outcomeSheet = ss.getSheetByName('ACTION_OUTCOME');
  const weightSheet = ss.getSheetByName(SCIIP_LEARNING_WEIGHT_SHEET);

  if (!outcomeSheet) throw new Error('Missing ACTION_OUTCOME. Run 280 first.');

  const outcomes = sciipReadSheetAsObjects_(outcomeSheet);
  const existingKeys = sciipGetExistingColumnValues_(weightSheet, 'Business_Key');

  let outcomesReviewed = 0;
  let weightsCreated = 0;
  let skippedDuplicate = 0;

  outcomes.forEach(function(outcome) {
    if (!outcome.Outcome_ID || !outcome.Business_Key) return;

    outcomesReviewed++;

    const weight = sciipCreateLearningWeight_(outcome);

    if (existingKeys.has(weight.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(weightSheet, SCIIP_LEARNING_WEIGHT_HEADERS, weight);
    existingKeys.add(weight.Business_Key);
    weightsCreated++;
  });

  const result = {
    processor: SCIIP_LEARNING_WEIGHT_PROCESSOR,
    status: 'SUCCESS',
    outcomesReviewed: outcomesReviewed,
    weightsCreated: weightsCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * FACTORY
 ************************************************************/

function sciipCreateLearningWeight_(outcome) {
  const now = new Date().toISOString();

  const adjustment = sciipWeightAdjustmentFromOutcome_(outcome);
  const weightType = sciipWeightTypeFromOutcome_(outcome);
  const learningText = sciipBuildLearningWeightText_(outcome, adjustment);

  const keyBasis = [
    outcome.Business_Key,
    outcome.Action_Type,
    outcome.Outcome_Class,
    weightType,
    adjustment
  ].join('|');

  const businessKey = 'LEARNING_WEIGHT|' + sciipStableHash_(keyBasis);

  return {
    Weight_ID: 'LW_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: 'ACTION_OUTCOME',
    Source_ID: outcome.Outcome_ID || '',
    Market: outcome.Market || '',
    Submarket: outcome.Submarket || '',
    City: outcome.City || '',
    Industry: outcome.Industry || '',
    Action_Type: outcome.Action_Type || '',
    Outcome_Class: outcome.Outcome_Class || '',
    Weight_Type: weightType,
    Weight_Adjustment: adjustment,
    Learning_Text: learningText,
    Confidence: sciipNormalizeConfidence_(outcome.Confidence),
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_LEARNING_WEIGHT_PROCESSOR,
    Notes: 'Generated from action outcome learning.'
  };
}

/************************************************************
 * WEIGHT LOGIC
 ************************************************************/

function sciipWeightAdjustmentFromOutcome_(outcome) {
  const c = String(outcome.Outcome_Class || '').toUpperCase();

  if (c === 'POSITIVE_OUTCOME') return 0.15;
  if (c === 'ONGOING_OUTCOME') return 0.05;
  if (c === 'NEUTRAL_OUTCOME') return 0;
  if (c === 'NEGATIVE_OUTCOME') return -0.1;
  if (c === 'UNSPECIFIED_OUTCOME') return 0;

  return 0;
}

function sciipWeightTypeFromOutcome_(outcome) {
  const actionType = String(outcome.Action_Type || '').toUpperCase();

  if (actionType.indexOf('RENT') >= 0 || actionType.indexOf('PRICING') >= 0) {
    return 'PRICING_ACTION_WEIGHT';
  }

  if (actionType.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    return 'ADVANCED_MANUFACTURING_ACTION_WEIGHT';
  }

  if (actionType.indexOf('CLUSTER') >= 0 || actionType.indexOf('MAP') >= 0) {
    return 'CLUSTER_ACTION_WEIGHT';
  }

  if (actionType.indexOf('OUTREACH') >= 0) {
    return 'OUTREACH_ACTION_WEIGHT';
  }

  return 'GENERAL_ACTION_WEIGHT';
}

function sciipBuildLearningWeightText_(outcome, adjustment) {
  const location = outcome.City || outcome.Submarket || outcome.Market || 'the market';
  const actionType = outcome.Action_Type || 'action';

  if (adjustment > 0) {
    return 'Increase future weighting for ' + actionType + ' in ' + location + ' based on positive or ongoing outcome evidence.';
  }

  if (adjustment < 0) {
    return 'Decrease future weighting for ' + actionType + ' in ' + location + ' based on negative outcome evidence.';
  }

  return 'Maintain current weighting for ' + actionType + ' in ' + location + '.';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestLearningWeightAdjustmentProcessor() {
  const result = sciipRunLearningWeightAdjustmentProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestLearningWeightAdjustmentProcessor',
    result: result
  }));

  return result;
}