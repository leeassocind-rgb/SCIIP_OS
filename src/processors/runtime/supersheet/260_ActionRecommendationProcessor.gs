/************************************************************
 * 260_ActionRecommendationProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert detected opportunities into recommended actions.
 *
 * Input:
 * - OPPORTUNITY
 *
 * Output:
 * - RECOMMENDED_ACTION
 ************************************************************/

const SCIIP_ACTION_RECOMMENDATION_PROCESSOR = '260_ActionRecommendationProcessor';
const SCIIP_RECOMMENDED_ACTION_SHEET = 'RECOMMENDED_ACTION';

const SCIIP_RECOMMENDED_ACTION_HEADERS = [
  'Action_ID',
  'Business_Key',
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
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunActionRecommendationProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_RECOMMENDED_ACTION_SHEET, SCIIP_RECOMMENDED_ACTION_HEADERS);

  const opportunitySheet = ss.getSheetByName('OPPORTUNITY');
  const actionSheet = ss.getSheetByName(SCIIP_RECOMMENDED_ACTION_SHEET);

  if (!opportunitySheet) throw new Error('Missing OPPORTUNITY. Run 250 first.');

  const opportunities = sciipReadSheetAsObjects_(opportunitySheet).filter(function(o) {
    return String(o.Status || '').toUpperCase() === 'OPEN';
  });

  const existingKeys = sciipGetExistingColumnValues_(actionSheet, 'Business_Key');

  let opportunitiesReviewed = 0;
  let actionsCreated = 0;
  let skippedDuplicate = 0;

  opportunities.forEach(function(o) {
    opportunitiesReviewed++;

    const action = sciipCreateRecommendedAction_(o);

    if (existingKeys.has(action.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(actionSheet, SCIIP_RECOMMENDED_ACTION_HEADERS, action);
    existingKeys.add(action.Business_Key);
    actionsCreated++;
  });

  const result = {
    processor: SCIIP_ACTION_RECOMMENDATION_PROCESSOR,
    status: 'SUCCESS',
    opportunitiesReviewed: opportunitiesReviewed,
    actionsCreated: actionsCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * ACTION FACTORY
 ************************************************************/

function sciipCreateRecommendedAction_(opportunity) {
  const now = new Date().toISOString();

  const actionType = opportunity.Action_Type || 'REVIEW';
  const actionText = sciipBuildRecommendedActionText_(opportunity);

  const keyBasis = [
    opportunity.Business_Key,
    actionType,
    actionText
  ].join('|');

  const businessKey = 'RECOMMENDED_ACTION|' + sciipStableHash_(keyBasis);

  return {
    Action_ID: 'RA_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Opportunity_ID: opportunity.Opportunity_ID || '',
    Opportunity_Business_Key: opportunity.Business_Key || '',
    Market: opportunity.Market || '',
    Submarket: opportunity.Submarket || '',
    City: opportunity.City || '',
    Industry: opportunity.Industry || '',
    Action_Type: actionType,
    Recommended_Action: actionText,
    Owner_Role: sciipOwnerRoleForAction_(actionType),
    Priority: opportunity.Priority || 'MEDIUM',
    Confidence: sciipNormalizeConfidence_(opportunity.Confidence),
    Status: 'OPEN',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_ACTION_RECOMMENDATION_PROCESSOR,
    Notes: 'Generated from detected SCIIP opportunity.'
  };
}

/************************************************************
 * ACTION TEXT
 ************************************************************/

function sciipBuildRecommendedActionText_(o) {
  const location = o.City || o.Submarket || o.Market || 'the market';
  const actionType = String(o.Action_Type || '').toUpperCase();

  if (actionType === 'BROKER_REVIEW_RENT_POSITION') {
    return 'Review current asking rents, competing availabilities, and recent activity in ' + location + ' to determine whether lease pricing should be adjusted.';
  }

  if (actionType === 'TARGET_ADVANCED_MANUFACTURING_REQUIREMENTS') {
    return 'Identify and prioritize advanced manufacturing, aerospace, defense, robotics, and autonomy requirements active in or near ' + location + '.';
  }

  if (actionType === 'MAP_AND_TARGET_CLUSTER') {
    return 'Map the active cluster in ' + location + ', identify nearby tenants and suppliers, and create a targeted outreach list.';
  }

  if (actionType === 'PRIORITIZE_MARKET_OUTREACH') {
    return 'Prioritize broker, owner, and tenant outreach in ' + location + ' based on elevated SCIIP activity signals.';
  }

  return 'Review the opportunity in ' + location + ' and determine whether broker action, owner advisory, or tenant outreach is warranted.';
}

function sciipOwnerRoleForAction_(actionType) {
  const t = String(actionType || '').toUpperCase();

  if (t === 'BROKER_REVIEW_RENT_POSITION') return 'Leasing Broker';
  if (t === 'TARGET_ADVANCED_MANUFACTURING_REQUIREMENTS') return 'Tenant Rep / Market Research';
  if (t === 'MAP_AND_TARGET_CLUSTER') return 'GIS / Market Research';
  if (t === 'PRIORITIZE_MARKET_OUTREACH') return 'Brokerage Team';

  return 'Research Lead';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestActionRecommendationProcessor() {
  const result = sciipRunActionRecommendationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionRecommendationProcessor',
    result: result
  }));

  return result;
}