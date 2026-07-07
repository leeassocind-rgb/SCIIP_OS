/************************************************************
 * 250_OpportunityDetectionProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert SCIIP intelligence into actionable opportunities.
 *
 * Inputs:
 * - FORECAST
 * - MARKET_THESIS
 * - THESIS_VALIDATION
 * - RESEARCH_INSIGHTS
 * - RESEARCH_FINDINGS
 *
 * Output:
 * - OPPORTUNITY
 ************************************************************/

const SCIIP_OPPORTUNITY_DETECTION_PROCESSOR = '250_OpportunityDetectionProcessor';
const SCIIP_OPPORTUNITY_SHEET = 'OPPORTUNITY';

const SCIIP_OPPORTUNITY_HEADERS = [
  'Opportunity_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Source_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Opportunity_Type',
  'Opportunity_Text',
  'Action_Type',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunOpportunityDetectionProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_OPPORTUNITY_SHEET, SCIIP_OPPORTUNITY_HEADERS);

  const opportunitySheet = ss.getSheetByName(SCIIP_OPPORTUNITY_SHEET);
  const existingKeys = sciipGetExistingColumnValues_(opportunitySheet, 'Business_Key');

  const candidates = []
    .concat(sciipOpportunitiesFromForecasts_(ss))
    .concat(sciipOpportunitiesFromMarketTheses_(ss))
    .concat(sciipOpportunitiesFromValidatedTheses_(ss))
    .concat(sciipOpportunitiesFromResearchInsights_(ss));

  let opportunitiesCreated = 0;
  let skippedDuplicate = 0;

  candidates.forEach(function(o) {
    if (!o || !o.Business_Key) return;

    if (existingKeys.has(o.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(opportunitySheet, SCIIP_OPPORTUNITY_HEADERS, o);
    existingKeys.add(o.Business_Key);
    opportunitiesCreated++;
  });

  const result = {
    processor: SCIIP_OPPORTUNITY_DETECTION_PROCESSOR,
    status: 'SUCCESS',
    candidatesGenerated: candidates.length,
    opportunitiesCreated: opportunitiesCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * SOURCE BUILDERS
 ************************************************************/

function sciipOpportunitiesFromForecasts_(ss) {
  const sheet = ss.getSheetByName('FORECAST');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(f) {
      return String(f.Status || '').toUpperCase() === 'ACTIVE';
    })
    .filter(function(f) {
      return sciipNormalizeConfidence_(f.Confidence) >= 0.7;
    })
    .map(function(f) {
      return sciipCreateOpportunityCandidate_({
        Source_Type: 'FORECAST',
        Source_ID: f.Forecast_ID,
        Source_Business_Key: f.Business_Key,
        Market: f.Market,
        Submarket: f.Submarket,
        City: f.City,
        Industry: f.Industry,
        Opportunity_Type: sciipOpportunityTypeFromForecast_(f),
        Opportunity_Text: sciipOpportunityTextFromForecast_(f),
        Action_Type: sciipActionTypeFromForecast_(f),
        Priority: sciipPriorityFromConfidence_(f.Confidence),
        Confidence: f.Confidence,
        Notes: 'Generated from forecast.'
      });
    });
}

function sciipOpportunitiesFromMarketTheses_(ss) {
  const sheet = ss.getSheetByName('MARKET_THESIS');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(t) {
      return String(t.Status || '').toUpperCase() === 'ACTIVE';
    })
    .map(function(t) {
      return sciipCreateOpportunityCandidate_({
        Source_Type: 'MARKET_THESIS',
        Source_ID: t.Thesis_ID,
        Source_Business_Key: t.Business_Key,
        Market: t.Market,
        Submarket: t.Submarket,
        City: t.City,
        Industry: t.Industry,
        Opportunity_Type: sciipOpportunityTypeFromThesis_(t.Thesis_Type),
        Opportunity_Text: sciipOpportunityTextFromThesis_(t),
        Action_Type: sciipActionTypeFromThesis_(t.Thesis_Type),
        Priority: sciipPriorityFromConfidence_(t.Confidence),
        Confidence: t.Confidence,
        Notes: 'Generated from active market thesis.'
      });
    });
}

function sciipOpportunitiesFromValidatedTheses_(ss) {
  const sheet = ss.getSheetByName('THESIS_VALIDATION');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(v) {
      const status = String(v.Validation_Status || '').toUpperCase();
      return status === 'SUPPORTED' || status === 'WEAKLY_SUPPORTED';
    })
    .map(function(v) {
      return sciipCreateOpportunityCandidate_({
        Source_Type: 'THESIS_VALIDATION',
        Source_ID: v.Validation_ID,
        Source_Business_Key: v.Business_Key,
        Market: v.Market,
        Submarket: v.Submarket,
        City: v.City,
        Industry: v.Industry,
        Opportunity_Type: sciipOpportunityTypeFromThesis_(v.Thesis_Type),
        Opportunity_Text: sciipOpportunityTextFromValidation_(v),
        Action_Type: sciipActionTypeFromThesis_(v.Thesis_Type),
        Priority: sciipPriorityFromValidation_(v),
        Confidence: v.Confidence,
        Notes: 'Generated from validated thesis.'
      });
    });
}

function sciipOpportunitiesFromResearchInsights_(ss) {
  const sheet = ss.getSheetByName('RESEARCH_INSIGHTS');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(i) {
      return String(i.Status || '').toUpperCase() === 'ACTIVE';
    })
    .filter(function(i) {
      return sciipNormalizeConfidence_(i.Confidence) >= 0.75;
    })
    .map(function(i) {
      return sciipCreateOpportunityCandidate_({
        Source_Type: 'RESEARCH_INSIGHTS',
        Source_ID: i.Insight_ID,
        Source_Business_Key: i.Insight_Business_Key,
        Market: i.Market,
        Submarket: i.Submarket,
        City: i.City,
        Industry: sciipIndustryFromInsightType_(i.Insight_Type),
        Opportunity_Type: sciipOpportunityTypeFromInsight_(i.Insight_Type),
        Opportunity_Text: sciipOpportunityTextFromInsight_(i),
        Action_Type: sciipActionTypeFromInsight_(i.Insight_Type),
        Priority: sciipPriorityFromConfidence_(i.Confidence),
        Confidence: i.Confidence,
        Notes: 'Generated from high-confidence research insight.'
      });
    });
}

/************************************************************
 * FACTORY
 ************************************************************/

function sciipCreateOpportunityCandidate_(o) {
  const now = new Date().toISOString();

  const keyBasis = [
    o.Source_Type,
    o.Source_Business_Key || o.Source_ID,
    o.Opportunity_Type,
    o.Action_Type
  ].join('|');

  const businessKey = 'OPPORTUNITY|' + sciipStableHash_(keyBasis);

  return {
    Opportunity_ID: 'OP_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: o.Source_Type || '',
    Source_ID: o.Source_ID || '',
    Source_Business_Key: o.Source_Business_Key || '',
    Market: o.Market || '',
    Submarket: o.Submarket || '',
    City: o.City || '',
    Industry: o.Industry || '',
    Opportunity_Type: o.Opportunity_Type || 'GENERAL_OPPORTUNITY',
    Opportunity_Text: o.Opportunity_Text || '',
    Action_Type: o.Action_Type || 'REVIEW',
    Priority: o.Priority || 'MEDIUM',
    Confidence: sciipNormalizeConfidence_(o.Confidence),
    Status: 'OPEN',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_OPPORTUNITY_DETECTION_PROCESSOR,
    Notes: o.Notes || ''
  };
}

/************************************************************
 * CLASSIFICATION
 ************************************************************/

function sciipOpportunityTypeFromForecast_(f) {
  const type = String(f.Forecast_Type || '').toUpperCase();
  const direction = String(f.Direction || '').toUpperCase();

  if (type.indexOf('PRICING') >= 0 && direction === 'UPWARD') return 'LEASE_REPRICING_OPPORTUNITY';
  if (type.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_OPPORTUNITY';
  if (type.indexOf('SPATIAL') >= 0) return 'CLUSTER_TARGETING_OPPORTUNITY';
  if (type.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_OPPORTUNITY';

  return 'GENERAL_MARKET_OPPORTUNITY';
}

function sciipOpportunityTypeFromThesis_(thesisType) {
  const t = String(thesisType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'LEASE_REPRICING_OPPORTUNITY';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_OPPORTUNITY';
  if (t.indexOf('SPATIAL') >= 0) return 'CLUSTER_TARGETING_OPPORTUNITY';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_OPPORTUNITY';

  return 'GENERAL_MARKET_OPPORTUNITY';
}

function sciipOpportunityTypeFromInsight_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'LEASE_REPRICING_OPPORTUNITY';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_OPPORTUNITY';
  if (t.indexOf('SPATIAL') >= 0) return 'CLUSTER_TARGETING_OPPORTUNITY';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_OPPORTUNITY';

  return 'GENERAL_MARKET_OPPORTUNITY';
}

function sciipActionTypeFromForecast_(f) {
  return sciipActionTypeFromOpportunityType_(sciipOpportunityTypeFromForecast_(f));
}

function sciipActionTypeFromThesis_(thesisType) {
  return sciipActionTypeFromOpportunityType_(sciipOpportunityTypeFromThesis_(thesisType));
}

function sciipActionTypeFromInsight_(insightType) {
  return sciipActionTypeFromOpportunityType_(sciipOpportunityTypeFromInsight_(insightType));
}

function sciipActionTypeFromOpportunityType_(opportunityType) {
  const t = String(opportunityType || '').toUpperCase();

  if (t.indexOf('LEASE_REPRICING') >= 0) return 'BROKER_REVIEW_RENT_POSITION';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'TARGET_ADVANCED_MANUFACTURING_REQUIREMENTS';
  if (t.indexOf('CLUSTER') >= 0) return 'MAP_AND_TARGET_CLUSTER';
  if (t.indexOf('ACTIVITY') >= 0) return 'PRIORITIZE_MARKET_OUTREACH';

  return 'REVIEW';
}

/************************************************************
 * TEXT BUILDERS
 ************************************************************/

function sciipOpportunityTextFromForecast_(f) {
  const location = f.City || f.Submarket || f.Market || 'the market';
  const type = sciipOpportunityTypeFromForecast_(f);

  if (type === 'LEASE_REPRICING_OPPORTUNITY') {
    return location + ' may present a lease repricing opportunity due to forecasted upward pricing pressure.';
  }

  if (type === 'ADVANCED_MANUFACTURING_DEMAND_OPPORTUNITY') {
    return location + ' may present a tenant targeting opportunity for advanced manufacturing demand.';
  }

  if (type === 'CLUSTER_TARGETING_OPPORTUNITY') {
    return location + ' may present a cluster targeting opportunity based on spatially concentrated activity.';
  }

  if (type === 'MARKET_ACTIVITY_OPPORTUNITY') {
    return location + ' may warrant prioritized broker outreach due to elevated market activity.';
  }

  return location + ' may present a general industrial market opportunity.';
}

function sciipOpportunityTextFromThesis_(t) {
  const location = t.City || t.Submarket || t.Market || 'the market';
  return location + ' has an active market thesis that may warrant broker, owner, or tenant-targeting action.';
}

function sciipOpportunityTextFromValidation_(v) {
  const location = v.City || v.Submarket || v.Market || 'the market';
  return location + ' has a ' + v.Validation_Status + ' thesis with net score ' + v.Net_Score + ', suggesting an actionable market opportunity.';
}

function sciipOpportunityTextFromInsight_(i) {
  const location = i.City || i.Submarket || i.Market || 'the market';
  return location + ' has a high-confidence intelligence insight that may warrant immediate review.';
}

/************************************************************
 * PRIORITY
 ************************************************************/

function sciipPriorityFromConfidence_(confidence) {
  const c = sciipNormalizeConfidence_(confidence);

  if (c >= 0.9) return 'CRITICAL';
  if (c >= 0.8) return 'HIGH';
  if (c >= 0.65) return 'MEDIUM';
  return 'LOW';
}

function sciipPriorityFromValidation_(v) {
  const status = String(v.Validation_Status || '').toUpperCase();
  const net = Number(v.Net_Score || 0);
  const c = sciipNormalizeConfidence_(v.Confidence);

  if (status === 'SUPPORTED' && net >= 3 && c >= 0.85) return 'CRITICAL';
  if ((status === 'SUPPORTED' || status === 'WEAKLY_SUPPORTED') && c >= 0.75) return 'HIGH';
  if (net >= 1) return 'MEDIUM';

  return 'LOW';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestOpportunityDetectionProcessor() {
  const result = sciipRunOpportunityDetectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestOpportunityDetectionProcessor',
    result: result
  }));

  return result;
}