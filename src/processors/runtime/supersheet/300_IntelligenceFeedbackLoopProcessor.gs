/************************************************************
 * 300_IntelligenceFeedbackLoopProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert learning weights into reusable intelligence feedback.
 *
 * Input:
 * - LEARNING_WEIGHT
 *
 * Output:
 * - INTELLIGENCE_FEEDBACK
 ************************************************************/

const SCIIP_INTELLIGENCE_FEEDBACK_PROCESSOR = '300_IntelligenceFeedbackLoopProcessor';
const SCIIP_INTELLIGENCE_FEEDBACK_SHEET = 'INTELLIGENCE_FEEDBACK';

const SCIIP_INTELLIGENCE_FEEDBACK_HEADERS = [
  'Feedback_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Feedback_Type',
  'Feedback_Text',
  'Weight_Adjustment',
  'Confidence_Adjustment',
  'Priority_Adjustment',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunIntelligenceFeedbackLoopProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_INTELLIGENCE_FEEDBACK_SHEET, SCIIP_INTELLIGENCE_FEEDBACK_HEADERS);

  const weightSheet = ss.getSheetByName('LEARNING_WEIGHT');
  const feedbackSheet = ss.getSheetByName(SCIIP_INTELLIGENCE_FEEDBACK_SHEET);

  if (!weightSheet) throw new Error('Missing LEARNING_WEIGHT. Run 290 first.');

  const weights = sciipReadSheetAsObjects_(weightSheet).filter(function(w) {
    return String(w.Status || '').toUpperCase() === 'ACTIVE';
  });

  const existingKeys = sciipGetExistingColumnValues_(feedbackSheet, 'Business_Key');

  let weightsReviewed = 0;
  let feedbackCreated = 0;
  let skippedDuplicate = 0;

  weights.forEach(function(w) {
    if (!w.Weight_ID || !w.Business_Key) return;

    weightsReviewed++;

    const feedback = sciipCreateIntelligenceFeedback_(w);

    if (existingKeys.has(feedback.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(feedbackSheet, SCIIP_INTELLIGENCE_FEEDBACK_HEADERS, feedback);
    existingKeys.add(feedback.Business_Key);
    feedbackCreated++;
  });

  const result = {
    processor: SCIIP_INTELLIGENCE_FEEDBACK_PROCESSOR,
    status: 'SUCCESS',
    weightsReviewed: weightsReviewed,
    feedbackCreated: feedbackCreated,
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

function sciipCreateIntelligenceFeedback_(weight) {
  const now = new Date().toISOString();

  const weightAdjustment = Number(weight.Weight_Adjustment || 0);
  const confidenceAdjustment = sciipConfidenceAdjustmentFromWeight_(weightAdjustment);
  const priorityAdjustment = sciipPriorityAdjustmentFromWeight_(weightAdjustment);
  const feedbackType = sciipFeedbackTypeFromWeight_(weight);
  const feedbackText = sciipBuildFeedbackText_(weight, confidenceAdjustment, priorityAdjustment);

  const keyBasis = [
    weight.Business_Key,
    feedbackType,
    weightAdjustment,
    confidenceAdjustment,
    priorityAdjustment
  ].join('|');

  const businessKey = 'INTELLIGENCE_FEEDBACK|' + sciipStableHash_(keyBasis);

  return {
    Feedback_ID: 'IF_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: 'LEARNING_WEIGHT',
    Source_ID: weight.Weight_ID || '',
    Market: weight.Market || '',
    Submarket: weight.Submarket || '',
    City: weight.City || '',
    Industry: weight.Industry || '',
    Feedback_Type: feedbackType,
    Feedback_Text: feedbackText,
    Weight_Adjustment: weightAdjustment,
    Confidence_Adjustment: confidenceAdjustment,
    Priority_Adjustment: priorityAdjustment,
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_INTELLIGENCE_FEEDBACK_PROCESSOR,
    Notes: 'Generated from learning weight.'
  };
}

/************************************************************
 * FEEDBACK LOGIC
 ************************************************************/

function sciipFeedbackTypeFromWeight_(weight) {
  const type = String(weight.Weight_Type || '').toUpperCase();

  if (type.indexOf('PRICING') >= 0) return 'PRICING_FEEDBACK';
  if (type.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_FEEDBACK';
  if (type.indexOf('CLUSTER') >= 0) return 'CLUSTER_FEEDBACK';
  if (type.indexOf('OUTREACH') >= 0) return 'OUTREACH_FEEDBACK';

  return 'GENERAL_FEEDBACK';
}

function sciipConfidenceAdjustmentFromWeight_(weightAdjustment) {
  const w = Number(weightAdjustment || 0);

  if (w >= 0.15) return 0.05;
  if (w >= 0.05) return 0.02;
  if (w <= -0.1) return -0.04;

  return 0;
}

function sciipPriorityAdjustmentFromWeight_(weightAdjustment) {
  const w = Number(weightAdjustment || 0);

  if (w >= 0.15) return 1;
  if (w <= -0.1) return -1;

  return 0;
}

function sciipBuildFeedbackText_(weight, confidenceAdjustment, priorityAdjustment) {
  const location = weight.City || weight.Submarket || weight.Market || 'the market';
  const type = weight.Weight_Type || 'general intelligence';

  if (confidenceAdjustment > 0 || priorityAdjustment > 0) {
    return 'Increase future confidence or priority for ' + type + ' in ' + location + ' based on positive learning weight.';
  }

  if (confidenceAdjustment < 0 || priorityAdjustment < 0) {
    return 'Reduce future confidence or priority for ' + type + ' in ' + location + ' based on negative learning weight.';
  }

  return 'Maintain current confidence and priority for ' + type + ' in ' + location + '.';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestIntelligenceFeedbackLoopProcessor() {
  const result = sciipRunIntelligenceFeedbackLoopProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestIntelligenceFeedbackLoopProcessor',
    result: result
  }));

  return result;
}