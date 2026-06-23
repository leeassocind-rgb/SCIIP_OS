/************************************************************
 * 190_AutonomousResearchAgentProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * SCIIP asks SCIIP.
 *
 * Inputs:
 * - MARKET_SIGNAL
 * - CHANGE_EVENT
 * - MARKET_STATISTICS
 * - GIS_CLUSTER
 *
 * Outputs:
 * - RESEARCH_QUEUE
 * - RESEARCH_FINDINGS
 * - RESEARCH_INSIGHTS
 *
 * Design:
 * - Event sourced
 * - Knowledge graph native
 * - GIS native
 * - Idempotent
 * - Stable business keys
 * - No duplicate research questions
 ************************************************************/

const SCIIP_RESEARCH_QUEUE_SHEET = 'RESEARCH_QUEUE';
const SCIIP_RESEARCH_FINDINGS_SHEET = 'RESEARCH_FINDINGS';
const SCIIP_RESEARCH_INSIGHTS_SHEET = 'RESEARCH_INSIGHTS';

const SCIIP_RESEARCH_QUEUE_HEADERS = [
  'Research_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Source_Business_Key',
  'Asset_ID',
  'Asset_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Cluster_ID',
  'Signal_Type',
  'Research_Question',
  'Research_Category',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const SCIIP_RESEARCH_FINDINGS_HEADERS = [
  'Finding_ID',
  'Research_ID',
  'Research_Business_Key',
  'Finding_Business_Key',
  'Finding_Type',
  'Finding_Text',
  'Evidence_Source',
  'Evidence_ID',
  'Confidence',
  'Status',
  'Created_At',
  'Processor',
  'Notes'
];

const SCIIP_RESEARCH_INSIGHTS_HEADERS = [
  'Insight_ID',
  'Research_ID',
  'Research_Business_Key',
  'Insight_Business_Key',
  'Insight_Type',
  'Insight_Text',
  'Market',
  'Submarket',
  'City',
  'Asset_ID',
  'Cluster_ID',
  'Confidence',
  'Status',
  'Created_At',
  'Processor',
  'Notes'
];

/**
 * Main entry point.
 */
function sciipRunAutonomousResearchAgentProcessor() {
  const startedAt = new Date();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  sciipEnsureAutonomousResearchSheets_(ss);

  const queueSheet = ss.getSheetByName(SCIIP_RESEARCH_QUEUE_SHEET);
  const existingResearchKeys = sciipGetExistingColumnValues_(queueSheet, 'Business_Key');

  const candidates = []
    .concat(sciipBuildResearchFromMarketSignals_(ss))
    .concat(sciipBuildResearchFromChangeEvents_(ss))
    .concat(sciipBuildResearchFromMarketStatistics_(ss))
    .concat(sciipBuildResearchFromGISClusters_(ss));

  let created = 0;
  let skippedDuplicate = 0;

  candidates.forEach(function(candidate) {
    if (!candidate || !candidate.Business_Key) return;

    if (existingResearchKeys.has(candidate.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(queueSheet, SCIIP_RESEARCH_QUEUE_HEADERS, candidate);
    existingResearchKeys.add(candidate.Business_Key);
    created++;
  });

  const result = {
    processor: '190_AutonomousResearchAgentProcessor',
    status: 'SUCCESS',
    candidatesGenerated: candidates.length,
    researchQuestionsCreated: created,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * One-time / safe repeated initializer.
 */
function sciipEnsureAutonomousResearchSheets_(ss) {
  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_QUEUE_SHEET, SCIIP_RESEARCH_QUEUE_HEADERS);
  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_FINDINGS_SHEET, SCIIP_RESEARCH_FINDINGS_HEADERS);
  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_INSIGHTS_SHEET, SCIIP_RESEARCH_INSIGHTS_HEADERS);
}

/************************************************************
 * SOURCE BUILDERS
 ************************************************************/

function sciipBuildResearchFromMarketSignals_(ss) {
  const sheet = ss.getSheetByName('MARKET_SIGNAL');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    const signalType = sciipFirstValue_(r, ['Signal_Type', 'SignalType', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Signal_ID', 'Market_Signal_ID', 'ID']);
    const sourceKey = sciipFirstValue_(r, ['Business_Key', 'Signal_Business_Key']);
    const assetId = sciipFirstValue_(r, ['Asset_ID']);
    const assetKey = sciipFirstValue_(r, ['Asset_Business_Key']);
    const city = sciipFirstValue_(r, ['City']);
    const submarket = sciipFirstValue_(r, ['Submarket']);
    const market = sciipFirstValue_(r, ['Market']);
    const clusterId = sciipFirstValue_(r, ['Cluster_ID']);
    const confidence = sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score']));

    const q = sciipResearchQuestionForSignal_(signalType, r);
    if (!q) return;

    out.push(sciipCreateResearchCandidate_({
      Source_Type: 'MARKET_SIGNAL',
      Source_ID: sourceId,
      Source_Business_Key: sourceKey,
      Asset_ID: assetId,
      Asset_Business_Key: assetKey,
      Market: market,
      Submarket: submarket,
      City: city,
      Cluster_ID: clusterId,
      Signal_Type: signalType,
      Research_Question: q.question,
      Research_Category: q.category,
      Priority: q.priority,
      Confidence: confidence,
      Notes: q.notes
    }));
  });

  return out;
}

function sciipBuildResearchFromChangeEvents_(ss) {
  const sheet = ss.getSheetByName('CHANGE_EVENT');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    const changeType = sciipFirstValue_(r, ['Change_Type', 'Event_Type', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Change_ID', 'Change_Event_ID', 'Event_ID', 'ID']);
    const sourceKey = sciipFirstValue_(r, ['Business_Key', 'Change_Business_Key']);
    const assetId = sciipFirstValue_(r, ['Asset_ID']);
    const assetKey = sciipFirstValue_(r, ['Asset_Business_Key']);
    const city = sciipFirstValue_(r, ['City']);
    const submarket = sciipFirstValue_(r, ['Submarket']);
    const market = sciipFirstValue_(r, ['Market']);

    const q = sciipResearchQuestionForChange_(changeType, r);
    if (!q) return;

    out.push(sciipCreateResearchCandidate_({
      Source_Type: 'CHANGE_EVENT',
      Source_ID: sourceId,
      Source_Business_Key: sourceKey,
      Asset_ID: assetId,
      Asset_Business_Key: assetKey,
      Market: market,
      Submarket: submarket,
      City: city,
      Cluster_ID: '',
      Signal_Type: changeType,
      Research_Question: q.question,
      Research_Category: q.category,
      Priority: q.priority,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: q.notes
    }));
  });

  return out;
}

function sciipBuildResearchFromMarketStatistics_(ss) {
  const sheet = ss.getSheetByName('MARKET_STATISTICS');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    const statType = sciipFirstValue_(r, ['Statistic_Type', 'Metric', 'Signal_Type', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Statistic_ID', 'Market_Statistic_ID', 'ID']);
    const sourceKey = sciipFirstValue_(r, ['Business_Key', 'Statistic_Business_Key']);
    const city = sciipFirstValue_(r, ['City']);
    const submarket = sciipFirstValue_(r, ['Submarket']);
    const market = sciipFirstValue_(r, ['Market']);
    const count = Number(sciipFirstValue_(r, ['Count', 'Signal_Count', 'Observation_Count']) || 0);

    const q = sciipResearchQuestionForStatistic_(statType, r, count);
    if (!q) return;

    out.push(sciipCreateResearchCandidate_({
      Source_Type: 'MARKET_STATISTICS',
      Source_ID: sourceId,
      Source_Business_Key: sourceKey,
      Asset_ID: '',
      Asset_Business_Key: '',
      Market: market,
      Submarket: submarket,
      City: city,
      Cluster_ID: '',
      Signal_Type: statType,
      Research_Question: q.question,
      Research_Category: q.category,
      Priority: q.priority,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: q.notes
    }));
  });

  return out;
}

function sciipBuildResearchFromGISClusters_(ss) {
  const sheet = ss.getSheetByName('GIS_CLUSTER');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    const clusterId = sciipFirstValue_(r, ['Cluster_ID', 'GIS_Cluster_ID', 'ID']);
    const clusterType = sciipFirstValue_(r, ['Cluster_Type', 'Type', 'Signal_Type']);
    const city = sciipFirstValue_(r, ['City']);
    const submarket = sciipFirstValue_(r, ['Submarket']);
    const market = sciipFirstValue_(r, ['Market']);
    const activityCount = Number(sciipFirstValue_(r, ['Activity_Count', 'Asset_Count', 'Count']) || 0);

    const q = sciipResearchQuestionForGISCluster_(clusterType, r, activityCount);
    if (!q) return;

    out.push(sciipCreateResearchCandidate_({
      Source_Type: 'GIS_CLUSTER',
      Source_ID: clusterId,
      Source_Business_Key: sciipFirstValue_(r, ['Business_Key']),
      Asset_ID: '',
      Asset_Business_Key: '',
      Market: market,
      Submarket: submarket,
      City: city,
      Cluster_ID: clusterId,
      Signal_Type: clusterType,
      Research_Question: q.question,
      Research_Category: q.category,
      Priority: q.priority,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: q.notes
    }));
  });

  return out;
}

/************************************************************
 * QUESTION LOGIC
 ************************************************************/

function sciipResearchQuestionForSignal_(signalType, r) {
  const s = String(signalType || '').toUpperCase();
  const asset = sciipAssetLabel_(r);
  const city = sciipFirstValue_(r, ['City']) || 'this market';

  if (s.indexOf('RATE_INCREASE') >= 0 || s.indexOf('RENT_INCREASE') >= 0) {
    return {
      question: 'Why did the asking rate increase for ' + asset + '?',
      category: 'PRICING_POWER',
      priority: 'HIGH',
      notes: 'Generated from rate increase market signal.'
    };
  }

  if (s.indexOf('RATE_DECREASE') >= 0 || s.indexOf('RENT_DECREASE') >= 0) {
    return {
      question: 'Why did the asking rate decrease for ' + asset + '?',
      category: 'PRICING_WEAKNESS',
      priority: 'MEDIUM',
      notes: 'Generated from rate decrease market signal.'
    };
  }

  if (s.indexOf('AEROSPACE') >= 0 || s.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    return {
      question: 'Is advanced manufacturing demand accelerating in ' + city + '?',
      category: 'ADVANCED_MANUFACTURING_DEMAND',
      priority: 'HIGH',
      notes: 'Generated from aerospace / advanced manufacturing signal.'
    };
  }

  if (s.indexOf('ACTIVITY_CLUSTER') >= 0 || s.indexOf('HIGH_ACTIVITY') >= 0) {
    return {
      question: 'What is driving elevated industrial activity in ' + city + '?',
      category: 'MARKET_ACTIVITY',
      priority: 'HIGH',
      notes: 'Generated from high activity market signal.'
    };
  }

  return null;
}

function sciipResearchQuestionForChange_(changeType, r) {
  const c = String(changeType || '').toUpperCase();
  const asset = sciipAssetLabel_(r);

  if (c.indexOf('RATE') >= 0 || c.indexOf('PRICE') >= 0) {
    return {
      question: 'What changed in the market position of ' + asset + '?',
      category: 'ASSET_POSITIONING',
      priority: 'HIGH',
      notes: 'Generated from pricing-related change event.'
    };
  }

  if (c.indexOf('STATUS') >= 0 || c.indexOf('AVAILABILITY') >= 0) {
    return {
      question: 'What does the status change at ' + asset + ' indicate about demand?',
      category: 'SUPPLY_DEMAND',
      priority: 'MEDIUM',
      notes: 'Generated from status / availability change event.'
    };
  }

  return null;
}

function sciipResearchQuestionForStatistic_(statType, r, count) {
  const s = String(statType || '').toUpperCase();
  const city = sciipFirstValue_(r, ['City']) || sciipFirstValue_(r, ['Submarket']) || 'this market';

  if ((s.indexOf('RATE_INCREASE') >= 0 || s.indexOf('RENT_INCREASE') >= 0) && count >= 3) {
    return {
      question: 'Is ' + city + ' experiencing upward rent pressure?',
      category: 'RENT_PRESSURE',
      priority: 'HIGH',
      notes: 'Generated from repeated rent increase statistics.'
    };
  }

  if (s.indexOf('ACTIVITY') >= 0 && count >= 3) {
    return {
      question: 'What is driving concentrated activity in ' + city + '?',
      category: 'MARKET_ACTIVITY',
      priority: 'HIGH',
      notes: 'Generated from market activity statistics.'
    };
  }

  return null;
}

function sciipResearchQuestionForGISCluster_(clusterType, r, activityCount) {
  const c = String(clusterType || '').toUpperCase();
  const city = sciipFirstValue_(r, ['City']) || sciipFirstValue_(r, ['Submarket']) || 'this cluster';

  if (activityCount >= 3 || c.indexOf('ACTIVITY') >= 0) {
    return {
      question: 'What is driving the industrial activity cluster in ' + city + '?',
      category: 'GIS_CLUSTER_ACTIVITY',
      priority: 'HIGH',
      notes: 'Generated from GIS cluster intelligence.'
    };
  }

  return null;
}

/************************************************************
 * RESEARCH OBJECT FACTORY
 ************************************************************/

function sciipCreateResearchCandidate_(o) {
  const now = new Date().toISOString();

  const sourceType = o.Source_Type || '';
  const sourceId = o.Source_ID || '';
  const question = o.Research_Question || '';
  const keyBasis = [
    sourceType,
    sourceId,
    o.Source_Business_Key || '',
    o.Asset_Business_Key || '',
    o.Cluster_ID || '',
    question
  ].join('|');

  const businessKey = 'RESEARCH|' + sciipStableHash_(keyBasis);

  return {
    Research_ID: 'RQ_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: sourceType,
    Source_ID: sourceId,
    Source_Business_Key: o.Source_Business_Key || '',
    Asset_ID: o.Asset_ID || '',
    Asset_Business_Key: o.Asset_Business_Key || '',
    Market: o.Market || '',
    Submarket: o.Submarket || '',
    City: o.City || '',
    Cluster_ID: o.Cluster_ID || '',
    Signal_Type: o.Signal_Type || '',
    Research_Question: question,
    Research_Category: o.Research_Category || 'GENERAL_MARKET_RESEARCH',
    Priority: o.Priority || 'MEDIUM',
    Confidence: o.Confidence || 0.75,
    Status: 'PENDING',
    Created_At: now,
    Updated_At: now,
    Processor: '190_AutonomousResearchAgentProcessor',
    Notes: o.Notes || ''
  };
}

/************************************************************
 * OPTIONAL: SIMPLE FINDING / INSIGHT SEEDER
 * This does not answer research externally yet.
 * It records that a question was generated and awaits future research.
 ************************************************************/

function sciipSeedPendingResearchFindings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  sciipEnsureAutonomousResearchSheets_(ss);

  const queue = ss.getSheetByName(SCIIP_RESEARCH_QUEUE_SHEET);
  const findings = ss.getSheetByName(SCIIP_RESEARCH_FINDINGS_SHEET);
  const insights = ss.getSheetByName(SCIIP_RESEARCH_INSIGHTS_SHEET);

  const queueRows = sciipReadSheetAsObjects_(queue);
  const existingFindings = sciipGetExistingColumnValues_(findings, 'Finding_Business_Key');
  const existingInsights = sciipGetExistingColumnValues_(insights, 'Insight_Business_Key');

  let findingsCreated = 0;
  let insightsCreated = 0;

  queueRows.forEach(function(r) {
    const researchId = r.Research_ID;
    const researchKey = r.Business_Key;
    if (!researchId || !researchKey) return;

    const findingKey = 'FINDING|' + sciipStableHash_(researchKey + '|INITIAL_PENDING_FINDING');
    if (!existingFindings.has(findingKey)) {
      sciipAppendObjectRow_(findings, SCIIP_RESEARCH_FINDINGS_HEADERS, {
        Finding_ID: 'RF_' + sciipStableHash_(findingKey).substring(0, 16),
        Research_ID: researchId,
        Research_Business_Key: researchKey,
        Finding_Business_Key: findingKey,
        Finding_Type: 'INITIAL_RESEARCH_PROMPT',
        Finding_Text: 'SCIIP generated an autonomous research question: ' + r.Research_Question,
        Evidence_Source: r.Source_Type,
        Evidence_ID: r.Source_ID,
        Confidence: r.Confidence,
        Status: 'PENDING_RESEARCH',
        Created_At: new Date().toISOString(),
        Processor: '190_AutonomousResearchAgentProcessor',
        Notes: 'Seed finding only. No external research performed.'
      });
      existingFindings.add(findingKey);
      findingsCreated++;
    }

    const insightKey = 'INSIGHT|' + sciipStableHash_(researchKey + '|INITIAL_INSIGHT_PLACEHOLDER');
    if (!existingInsights.has(insightKey)) {
      sciipAppendObjectRow_(insights, SCIIP_RESEARCH_INSIGHTS_HEADERS, {
        Insight_ID: 'RI_' + sciipStableHash_(insightKey).substring(0, 16),
        Research_ID: researchId,
        Research_Business_Key: researchKey,
        Insight_Business_Key: insightKey,
        Insight_Type: 'RESEARCH_AGENDA',
        Insight_Text: 'Autonomous research agenda item created: ' + r.Research_Question,
        Market: r.Market,
        Submarket: r.Submarket,
        City: r.City,
        Asset_ID: r.Asset_ID,
        Cluster_ID: r.Cluster_ID,
        Confidence: r.Confidence,
        Status: 'PENDING_RESEARCH',
        Created_At: new Date().toISOString(),
        Processor: '190_AutonomousResearchAgentProcessor',
        Notes: 'Insight placeholder for permanent intelligence history.'
      });
      existingInsights.add(insightKey);
      insightsCreated++;
    }
  });

  const result = {
    processor: '190_AutonomousResearchAgentProcessor.seed',
    status: 'SUCCESS',
    findingsCreated: findingsCreated,
    insightsCreated: insightsCreated,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestAutonomousResearchAgentProcessor() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  sciipEnsureAutonomousResearchSheets_(ss);

  const result = sciipRunAutonomousResearchAgentProcessor();
  const seed = sciipSeedPendingResearchFindings();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousResearchAgentProcessor',
    processorResult: result,
    seedResult: seed
  }));

  return {
    status: 'SUCCESS',
    processorResult: result,
    seedResult: seed
  };
}

/************************************************************
 * SHARED HELPERS
 * These are intentionally included here so this processor can run
 * even before shared helper consolidation.
 ************************************************************/

function sciipEnsureSheetWithHeaders_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  const existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
  const hasHeaders = existing.some(function(v) { return String(v || '').trim() !== ''; });

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  const existingSet = new Set(existing.map(function(h) { return String(h || '').trim(); }));
  let col = existing.length;

  headers.forEach(function(h) {
    if (!existingSet.has(h)) {
      col++;
      sheet.getRange(1, col).setValue(h);
    }
  });

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipReadSheetAsObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(function(h) { return String(h || '').trim(); });

  return values
    .filter(function(row) {
      return row.some(function(v) { return String(v || '').trim() !== ''; });
    })
    .map(function(row) {
      const obj = {};
      headers.forEach(function(h, i) {
        obj[h] = row[i];
      });
      return obj;
    });
}

function sciipAppendObjectRow_(sheet, headers, obj) {
  const row = headers.map(function(h) {
    return obj[h] !== undefined ? obj[h] : '';
  });
  sheet.appendRow(row);
}

function sciipGetExistingColumnValues_(sheet, columnName) {
  const set = new Set();
  if (!sheet || sheet.getLastRow() < 2) return set;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function(h) { return String(h || '').trim(); });

  const idx = headers.indexOf(columnName);
  if (idx < 0) return set;

  const values = sheet.getRange(2, idx + 1, sheet.getLastRow() - 1, 1).getValues();
  values.forEach(function(r) {
    const v = String(r[0] || '').trim();
    if (v) set.add(v);
  });

  return set;
}

function sciipFirstValue_(obj, keys) {
  for (let i = 0; i < keys.length; i++) {
    const v = obj[keys[i]];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return '';
}

function sciipNormalizeConfidence_(v) {
  const n = Number(v);
  if (!isNaN(n) && n > 0) {
    if (n > 1) return Math.min(n / 100, 1);
    return Math.min(n, 1);
  }
  return 0.75;
}

function sciipAssetLabel_(r) {
  return (
    sciipFirstValue_(r, ['Address', 'Asset_Address', 'Property_Address']) ||
    sciipFirstValue_(r, ['Asset_Name', 'Property_Name']) ||
    sciipFirstValue_(r, ['Asset_ID']) ||
    'the asset'
  );
}

function sciipStableHash_(input) {
  const raw = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(input || ''),
    Utilities.Charset.UTF_8
  );

  return raw.map(function(b) {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('').toUpperCase();
}