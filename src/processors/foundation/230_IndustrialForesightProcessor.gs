/************************************************************
 * 230_IndustrialForesightProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 220 creates market theses.
 * 230 creates forward-looking industrial forecasts.
 *
 * Inputs:
 * - MARKET_THESIS
 * - RESEARCH_INSIGHTS
 *
 * Output:
 * - FORECAST
 ************************************************************/

const SCIIP_INDUSTRIAL_FORESIGHT_PROCESSOR = '230_IndustrialForesightProcessor';
const SCIIP_FORECAST_SHEET = 'FORECAST';

const SCIIP_FORECAST_HEADERS = [
  'Forecast_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Source_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Forecast_Type',
  'Forecast_Horizon',
  'Forecast_Text',
  'Direction',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunIndustrialForesightProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_FORECAST_SHEET, SCIIP_FORECAST_HEADERS);

  const forecastSheet = ss.getSheetByName(SCIIP_FORECAST_SHEET);
  const existingKeys = sciipGetExistingColumnValues_(forecastSheet, 'Business_Key');

  const candidates = []
    .concat(sciipForecastsFromMarketTheses_(ss))
    .concat(sciipForecastsFromResearchInsights_(ss));

  let forecastsCreated = 0;
  let skippedDuplicate = 0;

  candidates.forEach(function(forecast) {
    if (!forecast || !forecast.Business_Key) return;

    if (existingKeys.has(forecast.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(forecastSheet, SCIIP_FORECAST_HEADERS, forecast);
    existingKeys.add(forecast.Business_Key);
    forecastsCreated++;
  });

  const result = {
    processor: SCIIP_INDUSTRIAL_FORESIGHT_PROCESSOR,
    status: 'SUCCESS',
    candidatesGenerated: candidates.length,
    forecastsCreated: forecastsCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * FORECAST SOURCES
 ************************************************************/

function sciipForecastsFromMarketTheses_(ss) {
  const sheet = ss.getSheetByName('MARKET_THESIS');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(t) {
    if (String(t.Status || '').toUpperCase() !== 'ACTIVE') return;

    out.push(sciipCreateForecastCandidate_({
      Source_Type: 'MARKET_THESIS',
      Source_ID: t.Thesis_ID,
      Source_Business_Key: t.Business_Key,
      Market: t.Market,
      Submarket: t.Submarket,
      City: t.City,
      Industry: t.Industry,
      Forecast_Type: sciipForecastTypeFromThesis_(t.Thesis_Type),
      Forecast_Horizon: 'NEAR_TERM',
      Forecast_Text: sciipForecastTextFromThesis_(t),
      Direction: sciipDirectionFromThesis_(t.Thesis_Type),
      Confidence: t.Confidence,
      Notes: 'Generated from active market thesis.'
    }));
  });

  return out;
}

function sciipForecastsFromResearchInsights_(ss) {
  const sheet = ss.getSheetByName('RESEARCH_INSIGHTS');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(i) {
    if (String(i.Status || '').toUpperCase() !== 'ACTIVE') return;

    const confidence = Number(i.Confidence || 0);
    if (confidence < 0.75) return;

    out.push(sciipCreateForecastCandidate_({
      Source_Type: 'RESEARCH_INSIGHTS',
      Source_ID: i.Insight_ID,
      Source_Business_Key: i.Insight_Business_Key,
      Market: i.Market,
      Submarket: i.Submarket,
      City: i.City,
      Industry: sciipIndustryFromInsightType_(i.Insight_Type),
      Forecast_Type: sciipForecastTypeFromInsight_(i.Insight_Type),
      Forecast_Horizon: 'SHORT_TERM',
      Forecast_Text: sciipForecastTextFromInsight_(i),
      Direction: sciipDirectionFromInsight_(i.Insight_Type),
      Confidence: i.Confidence,
      Notes: 'Generated from high-confidence research insight.'
    }));
  });

  return out;
}

/************************************************************
 * FORECAST FACTORY
 ************************************************************/

function sciipCreateForecastCandidate_(o) {
  const now = new Date().toISOString();

  const keyBasis = [
    o.Source_Type,
    o.Source_Business_Key || o.Source_ID,
    o.Forecast_Type,
    o.Forecast_Horizon,
    o.Direction
  ].join('|');

  const businessKey = 'FORECAST|' + sciipStableHash_(keyBasis);

  return {
    Forecast_ID: 'FC_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: o.Source_Type || '',
    Source_ID: o.Source_ID || '',
    Source_Business_Key: o.Source_Business_Key || '',
    Market: o.Market || '',
    Submarket: o.Submarket || '',
    City: o.City || '',
    Industry: o.Industry || '',
    Forecast_Type: o.Forecast_Type || 'GENERAL_MARKET_FORECAST',
    Forecast_Horizon: o.Forecast_Horizon || 'SHORT_TERM',
    Forecast_Text: o.Forecast_Text || '',
    Direction: o.Direction || 'UNKNOWN',
    Confidence: sciipNormalizeConfidence_(o.Confidence),
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_INDUSTRIAL_FORESIGHT_PROCESSOR,
    Notes: o.Notes || ''
  };
}

/************************************************************
 * CLASSIFICATION
 ************************************************************/

function sciipForecastTypeFromThesis_(thesisType) {
  const t = String(thesisType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'PRICING_FORECAST';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_FORECAST';
  if (t.indexOf('SPATIAL') >= 0) return 'SPATIAL_ACTIVITY_FORECAST';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_FORECAST';

  return 'GENERAL_MARKET_FORECAST';
}

function sciipForecastTypeFromInsight_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'PRICING_FORECAST';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_DEMAND_FORECAST';
  if (t.indexOf('SPATIAL') >= 0) return 'SPATIAL_ACTIVITY_FORECAST';
  if (t.indexOf('ACTIVITY') >= 0) return 'MARKET_ACTIVITY_FORECAST';

  return 'GENERAL_MARKET_FORECAST';
}

function sciipDirectionFromThesis_(thesisType) {
  const t = String(thesisType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'UPWARD';
  if (t.indexOf('DEMAND') >= 0) return 'INCREASING';
  if (t.indexOf('ACTIVITY') >= 0) return 'INCREASING';

  return 'UNKNOWN';
}

function sciipDirectionFromInsight_(insightType) {
  const t = String(insightType || '').toUpperCase();

  if (t.indexOf('PRICING') >= 0) return 'UPWARD';
  if (t.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'INCREASING';
  if (t.indexOf('ACTIVITY') >= 0) return 'INCREASING';
  if (t.indexOf('SPATIAL') >= 0) return 'CONCENTRATING';

  return 'UNKNOWN';
}

/************************************************************
 * FORECAST TEXT
 ************************************************************/

function sciipForecastTextFromThesis_(t) {
  const location = t.City || t.Submarket || t.Market || 'the market';
  const type = String(t.Thesis_Type || '').toUpperCase();

  if (type.indexOf('PRICING') >= 0) {
    return location + ' is likely to continue showing upward pricing pressure if supporting conditions persist.';
  }

  if (type.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    return location + ' is likely to see continued advanced manufacturing demand based on current thesis evidence.';
  }

  if (type.indexOf('SPATIAL') >= 0 || type.indexOf('ACTIVITY') >= 0) {
    return location + ' is likely to remain an active industrial cluster in the near term.';
  }

  return location + ' is showing conditions that may continue into the near term.';
}

function sciipForecastTextFromInsight_(i) {
  const location = i.City || i.Submarket || i.Market || 'the market';
  const type = String(i.Insight_Type || '').toUpperCase();

  if (type.indexOf('PRICING') >= 0) {
    return location + ' may experience continued pricing pressure based on recent research insight.';
  }

  if (type.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    return location + ' may experience increasing advanced manufacturing demand based on recent research insight.';
  }

  if (type.indexOf('SPATIAL') >= 0) {
    return location + ' may continue to show geographically concentrated activity.';
  }

  if (type.indexOf('ACTIVITY') >= 0) {
    return location + ' may continue to show elevated industrial market activity.';
  }

  return location + ' may continue the pattern identified by recent research insight.';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestIndustrialForesightProcessor() {
  const result = sciipRunIndustrialForesightProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestIndustrialForesightProcessor',
    result: result
  }));

  return result;
}