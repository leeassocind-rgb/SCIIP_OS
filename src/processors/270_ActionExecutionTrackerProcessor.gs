/************************************************************
 * 270_ActionExecutionTrackerProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert recommended actions into trackable execution items.
 *
 * Input:
 * - RECOMMENDED_ACTION
 *
 * Output:
 * - ACTION_TRACKER
 ************************************************************/

const SCIIP_ACTION_TRACKER_PROCESSOR = '270_ActionExecutionTrackerProcessor';
const SCIIP_ACTION_TRACKER_SHEET = 'ACTION_TRACKER';

const SCIIP_ACTION_TRACKER_HEADERS = [
  'Tracker_ID',
  'Business_Key',
  'Action_ID',
  'Action_Business_Key',
  'Opportunity_ID',
  'Opportunity_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Action_Type',
  'Recommended_Action',
  'Owner_Role',
  'Priority',
  'Confidence',
  'Execution_Status',
  'Assigned_To',
  'Due_Date',
  'Completed_At',
  'Outcome',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunActionExecutionTrackerProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_ACTION_TRACKER_SHEET, SCIIP_ACTION_TRACKER_HEADERS);

  const actionSheet = ss.getSheetByName('RECOMMENDED_ACTION');
  const trackerSheet = ss.getSheetByName(SCIIP_ACTION_TRACKER_SHEET);

  if (!actionSheet) throw new Error('Missing RECOMMENDED_ACTION. Run 260 first.');

  const actions = sciipReadSheetAsObjects_(actionSheet).filter(function(a) {
    return String(a.Status || '').toUpperCase() === 'OPEN';
  });

  const existingKeys = sciipGetExistingColumnValues_(trackerSheet, 'Business_Key');

  let actionsReviewed = 0;
  let trackersCreated = 0;
  let skippedDuplicate = 0;

  actions.forEach(function(action) {
    actionsReviewed++;

    const tracker = sciipCreateActionTracker_(action);

    if (existingKeys.has(tracker.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(trackerSheet, SCIIP_ACTION_TRACKER_HEADERS, tracker);
    existingKeys.add(tracker.Business_Key);
    trackersCreated++;
  });

  const result = {
    processor: SCIIP_ACTION_TRACKER_PROCESSOR,
    status: 'SUCCESS',
    actionsReviewed: actionsReviewed,
    trackersCreated: trackersCreated,
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

function sciipCreateActionTracker_(action) {
  const now = new Date().toISOString();

  const keyBasis = [
    action.Business_Key,
    action.Action_Type,
    action.Recommended_Action
  ].join('|');

  const businessKey = 'ACTION_TRACKER|' + sciipStableHash_(keyBasis);

  return {
    Tracker_ID: 'AT_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Action_ID: action.Action_ID || '',
    Action_Business_Key: action.Business_Key || '',
    Opportunity_ID: action.Opportunity_ID || '',
    Opportunity_Business_Key: action.Opportunity_Business_Key || '',
    Market: action.Market || '',
    Submarket: action.Submarket || '',
    City: action.City || '',
    Industry: action.Industry || '',
    Action_Type: action.Action_Type || '',
    Recommended_Action: action.Recommended_Action || '',
    Owner_Role: action.Owner_Role || '',
    Priority: action.Priority || 'MEDIUM',
    Confidence: sciipNormalizeConfidence_(action.Confidence),
    Execution_Status: 'NOT_STARTED',
    Assigned_To: '',
    Due_Date: sciipDefaultDueDateForPriority_(action.Priority),
    Completed_At: '',
    Outcome: '',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_ACTION_TRACKER_PROCESSOR,
    Notes: 'Created from recommended action.'
  };
}

/************************************************************
 * DUE DATE LOGIC
 ************************************************************/

function sciipDefaultDueDateForPriority_(priority) {
  const p = String(priority || '').toUpperCase();
  const d = new Date();

  if (p === 'CRITICAL') d.setDate(d.getDate() + 1);
  else if (p === 'HIGH') d.setDate(d.getDate() + 3);
  else if (p === 'MEDIUM') d.setDate(d.getDate() + 7);
  else d.setDate(d.getDate() + 14);

  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestActionExecutionTrackerProcessor() {
  const result = sciipRunActionExecutionTrackerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionExecutionTrackerProcessor',
    result: result
  }));

  return result;
}