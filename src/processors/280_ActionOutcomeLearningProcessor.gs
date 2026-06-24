/************************************************************
 * 280_ActionOutcomeLearningProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Learn from completed action trackers.
 *
 * Input:
 * - ACTION_TRACKER
 *
 * Output:
 * - ACTION_OUTCOME
 ************************************************************/

const SCIIP_ACTION_OUTCOME_LEARNING_PROCESSOR = '280_ActionOutcomeLearningProcessor';
const SCIIP_ACTION_OUTCOME_SHEET = 'ACTION_OUTCOME';

const SCIIP_ACTION_OUTCOME_HEADERS = [
  'Outcome_ID',
  'Business_Key',
  'Tracker_ID',
  'Tracker_Business_Key',
  'Action_ID',
  'Opportunity_ID',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Action_Type',
  'Priority',
  'Execution_Status',
  'Outcome',
  'Outcome_Class',
  'Learning_Text',
  'Confidence',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunActionOutcomeLearningProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_ACTION_OUTCOME_SHEET, SCIIP_ACTION_OUTCOME_HEADERS);

  const trackerSheet = ss.getSheetByName('ACTION_TRACKER');
  const outcomeSheet = ss.getSheetByName(SCIIP_ACTION_OUTCOME_SHEET);

  if (!trackerSheet) throw new Error('Missing ACTION_TRACKER. Run 270 first.');

  const trackers = sciipReadSheetAsObjects_(trackerSheet).filter(function(t) {
    return String(t.Execution_Status || '').toUpperCase() === 'COMPLETED';
  });

  const existingKeys = sciipGetExistingColumnValues_(outcomeSheet, 'Business_Key');

  let trackersReviewed = 0;
  let outcomesCreated = 0;
  let skippedDuplicate = 0;

  trackers.forEach(function(t) {
    trackersReviewed++;

    const outcome = sciipCreateActionOutcome_(t);

    if (existingKeys.has(outcome.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(outcomeSheet, SCIIP_ACTION_OUTCOME_HEADERS, outcome);
    existingKeys.add(outcome.Business_Key);
    outcomesCreated++;
  });

  const result = {
    processor: SCIIP_ACTION_OUTCOME_LEARNING_PROCESSOR,
    status: 'SUCCESS',
    trackersReviewed: trackersReviewed,
    outcomesCreated: outcomesCreated,
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

function sciipCreateActionOutcome_(tracker) {
  const now = new Date().toISOString();

  const outcomeClass = sciipClassifyActionOutcome_(tracker);
  const learningText = sciipBuildActionLearningText_(tracker, outcomeClass);

  const keyBasis = [
    tracker.Business_Key,
    tracker.Execution_Status,
    tracker.Outcome,
    outcomeClass
  ].join('|');

  const businessKey = 'ACTION_OUTCOME|' + sciipStableHash_(keyBasis);

  return {
    Outcome_ID: 'AO_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Tracker_ID: tracker.Tracker_ID || '',
    Tracker_Business_Key: tracker.Business_Key || '',
    Action_ID: tracker.Action_ID || '',
    Opportunity_ID: tracker.Opportunity_ID || '',
    Market: tracker.Market || '',
    Submarket: tracker.Submarket || '',
    City: tracker.City || '',
    Industry: tracker.Industry || '',
    Action_Type: tracker.Action_Type || '',
    Priority: tracker.Priority || '',
    Execution_Status: tracker.Execution_Status || '',
    Outcome: tracker.Outcome || '',
    Outcome_Class: outcomeClass,
    Learning_Text: learningText,
    Confidence: sciipNormalizeConfidence_(tracker.Confidence),
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_ACTION_OUTCOME_LEARNING_PROCESSOR,
    Notes: 'Generated from completed action tracker.'
  };
}

/************************************************************
 * CLASSIFICATION
 ************************************************************/

function sciipClassifyActionOutcome_(tracker) {
  const outcome = String(tracker.Outcome || '').toUpperCase();

  if (!outcome) return 'UNSPECIFIED_OUTCOME';

  if (
    outcome.indexOf('SUCCESS') >= 0 ||
    outcome.indexOf('MEETING') >= 0 ||
    outcome.indexOf('TOUR') >= 0 ||
    outcome.indexOf('PROPOSAL') >= 0 ||
    outcome.indexOf('LEASE') >= 0 ||
    outcome.indexOf('DEAL') >= 0
  ) {
    return 'POSITIVE_OUTCOME';
  }

  if (
    outcome.indexOf('NO RESPONSE') >= 0 ||
    outcome.indexOf('DECLINED') >= 0 ||
    outcome.indexOf('NOT INTERESTED') >= 0 ||
    outcome.indexOf('FAILED') >= 0
  ) {
    return 'NEGATIVE_OUTCOME';
  }

  if (
    outcome.indexOf('FOLLOW UP') >= 0 ||
    outcome.indexOf('PENDING') >= 0 ||
    outcome.indexOf('MONITOR') >= 0
  ) {
    return 'ONGOING_OUTCOME';
  }

  return 'NEUTRAL_OUTCOME';
}

function sciipBuildActionLearningText_(tracker, outcomeClass) {
  const location = tracker.City || tracker.Submarket || tracker.Market || 'the market';
  const actionType = tracker.Action_Type || 'action';

  if (outcomeClass === 'POSITIVE_OUTCOME') {
    return 'SCIIP learned that ' + actionType + ' produced a positive result in ' + location + '. Similar future opportunities may deserve higher priority.';
  }

  if (outcomeClass === 'NEGATIVE_OUTCOME') {
    return 'SCIIP learned that ' + actionType + ' did not produce a positive result in ' + location + '. Similar future opportunities may require stronger evidence or different outreach.';
  }

  if (outcomeClass === 'ONGOING_OUTCOME') {
    return 'SCIIP learned that ' + actionType + ' remains ongoing in ' + location + '. The opportunity should continue to be monitored.';
  }

  return 'SCIIP recorded an action outcome for ' + actionType + ' in ' + location + '.';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestActionOutcomeLearningProcessor() {
  const result = sciipRunActionOutcomeLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionOutcomeLearningProcessor',
    result: result
  }));

  return result;
}