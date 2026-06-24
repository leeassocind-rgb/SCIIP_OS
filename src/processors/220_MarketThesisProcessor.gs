/************************************************************
 * 220_MarketThesisProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 210 creates insights.
 * 220 converts repeated insights into durable market theses.
 *
 * Input:
 * - RESEARCH_INSIGHTS
 *
 * Output:
 * - MARKET_THESIS
 ************************************************************/

const SCIIP_MARKET_THESIS_PROCESSOR = '220_MarketThesisProcessor';
const SCIIP_MARKET_THESIS_SHEET = 'MARKET_THESIS';

const SCIIP_MARKET_THESIS_HEADERS = [
  'Thesis_ID',
  'Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Thesis_Type',
  'Thesis_Text',
  'Supporting_Insight_Count',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunMarketThesisProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_MARKET_THESIS_SHEET, SCIIP_MARKET_THESIS_HEADERS);

  const insightsSheet = ss.getSheetByName(SCIIP_RESEARCH_INSIGHTS_SHEET);
  const thesisSheet = ss.getSheetByName(SCIIP_MARKET_THESIS_SHEET);

  if (!insightsSheet) throw new Error('Missing RESEARCH_INSIGHTS. Run 210 first.');

  const insights = sciipReadSheetAsObjects_(insightsSheet).filter(function(i) {
    return String(i.Status || '').toUpperCase() === 'ACTIVE';
  });

  const existingThesisKeys = sciipGetExistingColumnValues_(thesisSheet, 'Business_Key');
  const groups = sciipGroupInsightsForThesis_(insights);

  let groupsReviewed = 0;
  let thesesCreated = 0;
  let skippedInsufficientEvidence = 0;
  let skippedDuplicate = 0;

  Object.keys(groups).forEach(function(groupKey) {
    const group = groups[groupKey];
    groupsReviewed++;

    if (group.insights.length < 2) {
      skippedInsufficientEvidence++;
      return;
    }

    const thesis = sciipCreateMarketThesis_(group);

    if (existingThesisKeys.has(thesis.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(thesisSheet, SCIIP_MARKET_THESIS_HEADERS, thesis);
    existingThesisKeys.add(thesis.Business_Key);
    thesesCreated++;
  });

  const result = {
    processor: SCIIP_MARKET_THESIS_PROCESSOR,
    status: 'SUCCESS',
    groupsReviewed: groupsReviewed,
    thesesCreated: thesesCreated,
    skippedInsufficientEvidence: skippedInsufficientEvidence,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * GROUPING
 ************************************************************/

function sciipGroupInsightsForThesis_(insights) {
  const groups = {};

  insights.forEach(function(i) {
    const market = String(i.Market || '').trim();
    const submarket = String(i.Submarket || '').trim();
    const city = String(i.City || '').trim();
    const type = String(i.Insight_Type || 'GENERAL_MARKET_INSIGHT').trim();

    const location = city || submarket || market || 'UNKNOWN_MARKET';
    const thesisType = sciipThesisTypeFromInsight_(type);

    const key = [
      location.toUpperCase(),
      thesisType
    ].join('|');

    if (!groups[key]) {
      groups[key] = {
        Market: market,
        Submarket: submarket,
        City: city,
        Thesis_Type: thesisType,
        Industry: sciipIndustryFromInsightType_(type),
        insights: []
      };
    }

    groups[key].insights.push(i);
  });

  return groups;
}

/************************************************************
 * THESIS FACTORY
 ************************************************************/

function sciipCreateMarketThesis_(group) {
  const now = new Date().toISOString();
  const location = group.City || group.Submarket || group.Market || 'the market';
  const count = group.insights.length;
  const confidence = sciipAverageConfidence_(group.insights);

  const thesisText = sciipBuildMarketThesisText_(group, location, count, confidence);

  const keyBasis = [
    location,
    group.Thesis_Type,
    group.Industry,
    count
  ].join('|');

  const businessKey = 'MARKET_THESIS|' + sciipStableHash_(keyBasis);

  return {
    Thesis_ID: 'MT_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Market: group.Market || '',
    Submarket: group.Submarket || '',
    City: group.City || '',
    Industry: group.Industry || '',
    Thesis_Type: group.Thesis_Type || 'GENERAL_MARKET_THESIS',
    Thesis_Text: thesisText,
    Supporting_Insight_Count: count,
    Confidence: confidence,
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_MARKET_THESIS_PROCESSOR,
    Notes: 'Generated from repeated intelligence insights.'
  };
}

function sciipBuildMarketThesisText_(group, location, count, confidence) {
  const type = group.Thesis_Type;

  if (type === 'PRICING_POWER_THESIS') {
    return location + ' is showing evidence of upward pricing pressure based on ' + count + ' supporting intelligence insights.';
  }

  if (type === 'ADVANCED_MANUFACTURING_DEMAND_THESIS') {
    return location + ' is showing evidence of accelerating advanced manufacturing demand based on ' + count + ' supporting intelligence insights.';
  }

  if (type === 'SPATIAL_ACTIVITY_THESIS') {
    return location + ' is showing evidence of spatially concentrated industrial activity based on ' + count + ' supporting intelligence insights.';
  }

  if (type === 'MARKET_ACTIVITY_THESIS') {
    return location + ' is showing evidence of elevated industrial market activity based on ' + count + ' supporting intelligence insights.';
  }

  return location + ' is showing an emerging market pattern based on ' + count + ' supporting intelligence insights.';
}

/************************************************************
 * CLASSIFICATION
 ************************************************************/

function sciipThesisTypeFromInsight_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'PRICING_POWER_THESIS';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_THESIS';
  if (t.indexOf('SPATIAL') >= 0 || t.indexOf('GIS') >= 0) return 'SPATIAL_ACTIVITY_THESIS';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_THESIS';

  return 'GENERAL_MARKET_THESIS';
}

function sciipIndustryFromInsightType_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'Advanced Manufacturing';
  if (t.indexOf('AEROSPACE') >= 0) return 'Aerospace / Defense';

  return '';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestMarketThesisProcessor() {
  const result = sciipRunMarketThesisProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestMarketThesisProcessor',
    result: result
  }));

  return result;
}