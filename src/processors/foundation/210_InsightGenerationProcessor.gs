/************************************************************
 * 210_InsightGenerationProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 200 creates research findings.
 * 210 turns findings into synthesized intelligence insights.
 *
 * Input:
 * - RESEARCH_QUEUE
 * - RESEARCH_FINDINGS
 *
 * Output:
 * - RESEARCH_INSIGHTS
 ************************************************************/

const SCIIP_INSIGHT_GENERATION_PROCESSOR = '210_InsightGenerationProcessor';

function sciipRunInsightGenerationProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_INSIGHTS_SHEET, SCIIP_RESEARCH_INSIGHTS_HEADERS);

  const queueSheet = ss.getSheetByName(SCIIP_RESEARCH_QUEUE_SHEET);
  const findingsSheet = ss.getSheetByName(SCIIP_RESEARCH_FINDINGS_SHEET);
  const insightsSheet = ss.getSheetByName(SCIIP_RESEARCH_INSIGHTS_SHEET);

  if (!queueSheet) throw new Error('Missing RESEARCH_QUEUE. Run 190 first.');
  if (!findingsSheet) throw new Error('Missing RESEARCH_FINDINGS. Run 200 first.');

  const researchRows = sciipReadSheetAsObjects_(queueSheet);
  const findingRows = sciipReadSheetAsObjects_(findingsSheet);
  const existingInsightKeys = sciipGetExistingColumnValues_(insightsSheet, 'Insight_Business_Key');

  const findingsByResearchKey = sciipGroupFindingsByResearchKey_(findingRows);

  let researchReviewed = 0;
  let insightsCreated = 0;
  let skippedNoFindings = 0;
  let skippedDuplicate = 0;

  researchRows.forEach(function(research) {
    if (!research.Research_ID || !research.Business_Key) return;

    researchReviewed++;

    const findings = findingsByResearchKey[research.Business_Key] || [];

    const activeFindings = findings.filter(function(f) {
      return String(f.Status || '').toUpperCase() !== 'SUPERSEDED';
    });

    if (!activeFindings.length) {
      skippedNoFindings++;
      return;
    }

    const insight = sciipCreateSynthesizedInsight_(research, activeFindings);

    if (existingInsightKeys.has(insight.Insight_Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(insightsSheet, SCIIP_RESEARCH_INSIGHTS_HEADERS, insight);
    existingInsightKeys.add(insight.Insight_Business_Key);
    insightsCreated++;
  });

  const result = {
    processor: SCIIP_INSIGHT_GENERATION_PROCESSOR,
    status: 'SUCCESS',
    researchReviewed: researchReviewed,
    insightsCreated: insightsCreated,
    skippedNoFindings: skippedNoFindings,
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

function sciipGroupFindingsByResearchKey_(findingRows) {
  const grouped = {};

  findingRows.forEach(function(f) {
    const key = f.Research_Business_Key;
    if (!key) return;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  });

  return grouped;
}

/************************************************************
 * INSIGHT FACTORY
 ************************************************************/

function sciipCreateSynthesizedInsight_(research, findings) {
  const now = new Date().toISOString();

  const findingCount = findings.length;
  const evidenceSources = sciipUniqueValues_(findings.map(function(f) {
    return f.Evidence_Source;
  })).filter(Boolean);

  const avgConfidence = sciipAverageConfidence_(findings);

  const insightType = sciipInsightTypeFromResearch_(research);
  const insightText = sciipBuildInsightText_(research, findings, evidenceSources, avgConfidence);

  const keyBasis = [
    research.Business_Key,
    insightType,
    findingCount,
    evidenceSources.join(',')
  ].join('|');

  const insightKey = 'INSIGHT|' + sciipStableHash_(keyBasis);

  return {
    Insight_ID: 'RI_' + sciipStableHash_(insightKey).substring(0, 16),
    Research_ID: research.Research_ID,
    Research_Business_Key: research.Business_Key,
    Insight_Business_Key: insightKey,
    Insight_Type: insightType,
    Insight_Text: insightText,
    Market: research.Market || '',
    Submarket: research.Submarket || '',
    City: research.City || '',
    Asset_ID: research.Asset_ID || '',
    Cluster_ID: research.Cluster_ID || '',
    Confidence: avgConfidence,
    Status: 'ACTIVE',
    Created_At: now,
    Processor: SCIIP_INSIGHT_GENERATION_PROCESSOR,
    Notes: 'Synthesized from ' + findingCount + ' research findings across ' + evidenceSources.length + ' evidence source(s).'
  };
}

function sciipInsightTypeFromResearch_(research) {
  const category = String(research.Research_Category || '').toUpperCase();
  const signal = String(research.Signal_Type || '').toUpperCase();

  if (category.indexOf('RENT') >= 0 || category.indexOf('PRICING') >= 0 || signal.indexOf('RATE') >= 0) {
    return 'PRICING_INSIGHT';
  }

  if (category.indexOf('ADVANCED_MANUFACTURING') >= 0 || signal.indexOf('AEROSPACE') >= 0) {
    return 'ADVANCED_MANUFACTURING_INSIGHT';
  }

  if (category.indexOf('GIS') >= 0 || category.indexOf('CLUSTER') >= 0) {
    return 'SPATIAL_MARKET_INSIGHT';
  }

  if (category.indexOf('ACTIVITY') >= 0) {
    return 'MARKET_ACTIVITY_INSIGHT';
  }

  return 'GENERAL_MARKET_INSIGHT';
}

function sciipBuildInsightText_(research, findings, evidenceSources, confidence) {
  const question = research.Research_Question || 'Autonomous research question';
  const location =
    research.City ||
    research.Submarket ||
    research.Market ||
    'the market';

  const category = research.Research_Category || 'market intelligence';
  const findingCount = findings.length;

  let strength = 'emerging';
  if (confidence >= 0.85 && findingCount >= 5) strength = 'strong';
  else if (confidence >= 0.75 && findingCount >= 3) strength = 'supported';

  return (
    strength.toUpperCase() +
    ' insight for ' +
    location +
    ': ' +
    question +
    ' Evidence review found ' +
    findingCount +
    ' supporting finding(s) across ' +
    evidenceSources.length +
    ' source type(s). Category: ' +
    category +
    '.'
  );
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestInsightGenerationProcessor() {
  const result = sciipRunInsightGenerationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestInsightGenerationProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * HELPERS
 ************************************************************/

function sciipUniqueValues_(arr) {
  const seen = {};
  const out = [];

  arr.forEach(function(v) {
    const key = String(v || '').trim();
    if (!key) return;
    if (seen[key]) return;

    seen[key] = true;
    out.push(key);
  });

  return out;
}

function sciipAverageConfidence_(rows) {
  if (!rows || !rows.length) return 0.75;

  let total = 0;
  let count = 0;

  rows.forEach(function(r) {
    const n = Number(r.Confidence);
    if (!isNaN(n) && n > 0) {
      total += n > 1 ? n / 100 : n;
      count++;
    }
  });

  if (!count) return 0.75;

  return Math.round((total / count) * 100) / 100;
}