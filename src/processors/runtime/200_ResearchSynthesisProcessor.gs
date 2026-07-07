/************************************************************
 * 200_ResearchSynthesisProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 190 asks the questions.
 * 200 begins answering them using internal SCIIP evidence.
 *
 * Input:
 * - RESEARCH_QUEUE
 * - MARKET_SIGNAL
 * - CHANGE_EVENT
 * - MARKET_STATISTICS
 * - GIS_CLUSTER
 * - ASSET_PROFILE
 * - MARKET_ACTIVITY
 * - CAMPUS_PROFILE
 *
 * Output:
 * - RESEARCH_FINDINGS
 *
 * Design:
 * - Event sourced
 * - Idempotent
 * - Evidence based
 * - No duplicate findings
 ************************************************************/

const SCIIP_RESEARCH_SYNTHESIS_PROCESSOR = '200_ResearchSynthesisProcessor';

function sciipRunResearchSynthesisProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_RESEARCH_FINDINGS_SHEET, SCIIP_RESEARCH_FINDINGS_HEADERS);

  const queueSheet = ss.getSheetByName(SCIIP_RESEARCH_QUEUE_SHEET);
  const findingsSheet = ss.getSheetByName(SCIIP_RESEARCH_FINDINGS_SHEET);

  if (!queueSheet) {
    throw new Error('Missing RESEARCH_QUEUE. Run 190 first.');
  }

  const researchRows = sciipReadSheetAsObjects_(queueSheet);
  const existingFindingKeys = sciipGetExistingColumnValues_(findingsSheet, 'Finding_Business_Key');

  let findingsCreated = 0;
  let researchReviewed = 0;
  let skippedNoEvidence = 0;
  let skippedDuplicate = 0;

  researchRows.forEach(function(research) {
    if (!research.Research_ID || !research.Business_Key) return;
    if (String(research.Status || '').toUpperCase() === 'CLOSED') return;

    researchReviewed++;

    const evidence = sciipCollectEvidenceForResearch_(ss, research);

    if (!evidence.length) {
      skippedNoEvidence++;
      return;
    }

    evidence.forEach(function(e) {
      const finding = sciipCreateResearchFinding_(research, e);

      if (existingFindingKeys.has(finding.Finding_Business_Key)) {
        skippedDuplicate++;
        return;
      }

      sciipAppendObjectRow_(findingsSheet, SCIIP_RESEARCH_FINDINGS_HEADERS, finding);
      existingFindingKeys.add(finding.Finding_Business_Key);
      findingsCreated++;
    });
  });

  const result = {
    processor: SCIIP_RESEARCH_SYNTHESIS_PROCESSOR,
    status: 'SUCCESS',
    researchReviewed: researchReviewed,
    findingsCreated: findingsCreated,
    skippedNoEvidence: skippedNoEvidence,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * EVIDENCE COLLECTION
 ************************************************************/

function sciipCollectEvidenceForResearch_(ss, research) {
  const evidence = [];

  evidence.push.apply(evidence, sciipEvidenceFromMarketSignals_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromChangeEvents_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromMarketStatistics_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromGISClusters_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromAssetProfiles_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromMarketActivity_(ss, research));
  evidence.push.apply(evidence, sciipEvidenceFromCampusProfiles_(ss, research));

  return evidence;
}

function sciipEvidenceFromMarketSignals_(ss, research) {
  const sheet = ss.getSheetByName('MARKET_SIGNAL');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const signalType = sciipFirstValue_(r, ['Signal_Type', 'SignalType', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Signal_ID', 'Market_Signal_ID', 'ID']);

    out.push({
      Finding_Type: 'MARKET_SIGNAL_EVIDENCE',
      Finding_Text: 'Market signal detected: ' + signalType + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'MARKET_SIGNAL',
      Evidence_ID: sourceId,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: 'Evidence matched to autonomous research question.'
    });
  });

  return out;
}

function sciipEvidenceFromChangeEvents_(ss, research) {
  const sheet = ss.getSheetByName('CHANGE_EVENT');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const changeType = sciipFirstValue_(r, ['Change_Type', 'Event_Type', 'Type']);
    const sourceId = sciipFirstValue_(r, ['Change_ID', 'Change_Event_ID', 'Event_ID', 'ID']);

    out.push({
      Finding_Type: 'CHANGE_EVENT_EVIDENCE',
      Finding_Text: 'Change event detected: ' + changeType + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'CHANGE_EVENT',
      Evidence_ID: sourceId,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: 'Evidence matched to autonomous research question.'
    });
  });

  return out;
}

function sciipEvidenceFromMarketStatistics_(ss, research) {
  const sheet = ss.getSheetByName('MARKET_STATISTICS');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const metric = sciipFirstValue_(r, ['Statistic_Type', 'Metric', 'Signal_Type', 'Type']);
    const count = sciipFirstValue_(r, ['Count', 'Signal_Count', 'Observation_Count']);
    const sourceId = sciipFirstValue_(r, ['Statistic_ID', 'Market_Statistic_ID', 'ID']);

    out.push({
      Finding_Type: 'MARKET_STATISTIC_EVIDENCE',
      Finding_Text: 'Market statistic supports research question: ' + metric + ' count=' + count + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'MARKET_STATISTICS',
      Evidence_ID: sourceId,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: 'Statistical evidence matched to research question.'
    });
  });

  return out;
}

function sciipEvidenceFromGISClusters_(ss, research) {
  const sheet = ss.getSheetByName('GIS_CLUSTER');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const clusterId = sciipFirstValue_(r, ['Cluster_ID', 'GIS_Cluster_ID', 'ID']);
    const clusterType = sciipFirstValue_(r, ['Cluster_Type', 'Type', 'Signal_Type']);

    out.push({
      Finding_Type: 'GIS_CLUSTER_EVIDENCE',
      Finding_Text: 'GIS cluster evidence detected: ' + clusterType + ' cluster ' + clusterId + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'GIS_CLUSTER',
      Evidence_ID: clusterId,
      Confidence: sciipNormalizeConfidence_(sciipFirstValue_(r, ['Confidence', 'Score'])),
      Notes: 'Spatial evidence matched to research question.'
    });
  });

  return out;
}

function sciipEvidenceFromAssetProfiles_(ss, research) {
  const sheet = ss.getSheetByName('ASSET_PROFILE');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!research.Asset_ID && !research.Asset_Business_Key) return;
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const assetId = sciipFirstValue_(r, ['Asset_ID']);
    const address = sciipFirstValue_(r, ['Address', 'Asset_Address', 'Property_Address']);

    out.push({
      Finding_Type: 'ASSET_PROFILE_EVIDENCE',
      Finding_Text: 'Asset profile evidence found for ' + (address || assetId) + '.',
      Evidence_Source: 'ASSET_PROFILE',
      Evidence_ID: assetId,
      Confidence: 0.8,
      Notes: 'Asset profile matched to research question.'
    });
  });

  return out;
}

function sciipEvidenceFromMarketActivity_(ss, research) {
  const sheet = ss.getSheetByName('MARKET_ACTIVITY');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const activityType = sciipFirstValue_(r, ['Activity_Type', 'Event_Type', 'Type']);
    const activityId = sciipFirstValue_(r, ['Activity_ID', 'ID']);

    out.push({
      Finding_Type: 'MARKET_ACTIVITY_EVIDENCE',
      Finding_Text: 'Market activity evidence detected: ' + activityType + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'MARKET_ACTIVITY',
      Evidence_ID: activityId,
      Confidence: 0.75,
      Notes: 'Market activity matched to research question.'
    });
  });

  return out;
}

function sciipEvidenceFromCampusProfiles_(ss, research) {
  const sheet = ss.getSheetByName('CAMPUS_PROFILE');
  if (!sheet) return [];

  const rows = sciipReadSheetAsObjects_(sheet);
  const out = [];

  rows.forEach(function(r) {
    if (!sciipResearchEvidenceMatches_(research, r)) return;

    const campusId = sciipFirstValue_(r, ['Campus_ID', 'ID']);
    const campusName = sciipFirstValue_(r, ['Campus_Name', 'Name']);

    out.push({
      Finding_Type: 'CAMPUS_PROFILE_EVIDENCE',
      Finding_Text: 'Campus intelligence evidence found: ' + (campusName || campusId) + sciipLocationSuffix_(r) + '.',
      Evidence_Source: 'CAMPUS_PROFILE',
      Evidence_ID: campusId,
      Confidence: 0.75,
      Notes: 'Campus profile matched to research question.'
    });
  });

  return out;
}

/************************************************************
 * MATCHING LOGIC
 ************************************************************/

function sciipResearchEvidenceMatches_(research, row) {
  const researchAssetId = String(research.Asset_ID || '').trim();
  const researchAssetKey = String(research.Asset_Business_Key || '').trim();
  const researchCity = String(research.City || '').trim().toUpperCase();
  const researchSubmarket = String(research.Submarket || '').trim().toUpperCase();
  const researchMarket = String(research.Market || '').trim().toUpperCase();
  const researchCluster = String(research.Cluster_ID || '').trim();
  const researchSignalType = String(research.Signal_Type || '').trim().toUpperCase();

  const rowAssetId = String(sciipFirstValue_(row, ['Asset_ID']) || '').trim();
  const rowAssetKey = String(sciipFirstValue_(row, ['Asset_Business_Key']) || '').trim();
  const rowCity = String(sciipFirstValue_(row, ['City']) || '').trim().toUpperCase();
  const rowSubmarket = String(sciipFirstValue_(row, ['Submarket']) || '').trim().toUpperCase();
  const rowMarket = String(sciipFirstValue_(row, ['Market']) || '').trim().toUpperCase();
  const rowCluster = String(sciipFirstValue_(row, ['Cluster_ID', 'GIS_Cluster_ID']) || '').trim();
  const rowSignalType = String(sciipFirstValue_(row, ['Signal_Type', 'Change_Type', 'Statistic_Type', 'Metric', 'Type']) || '').trim().toUpperCase();

  if (researchAssetId && rowAssetId && researchAssetId === rowAssetId) return true;
  if (researchAssetKey && rowAssetKey && researchAssetKey === rowAssetKey) return true;
  if (researchCluster && rowCluster && researchCluster === rowCluster) return true;

  if (researchCity && rowCity && researchCity === rowCity) return true;
  if (researchSubmarket && rowSubmarket && researchSubmarket === rowSubmarket) return true;
  if (researchMarket && rowMarket && researchMarket === rowMarket) return true;

  if (researchSignalType && rowSignalType && rowSignalType.indexOf(researchSignalType) >= 0) return true;

  return false;
}

/************************************************************
 * FINDING FACTORY
 ************************************************************/

function sciipCreateResearchFinding_(research, evidence) {
  const now = new Date().toISOString();

  const keyBasis = [
    research.Business_Key,
    evidence.Evidence_Source,
    evidence.Evidence_ID,
    evidence.Finding_Type,
    evidence.Finding_Text
  ].join('|');

  const findingKey = 'FINDING|' + sciipStableHash_(keyBasis);

  return {
    Finding_ID: 'RF_' + sciipStableHash_(findingKey).substring(0, 16),
    Research_ID: research.Research_ID,
    Research_Business_Key: research.Business_Key,
    Finding_Business_Key: findingKey,
    Finding_Type: evidence.Finding_Type || 'INTERNAL_EVIDENCE',
    Finding_Text: evidence.Finding_Text || '',
    Evidence_Source: evidence.Evidence_Source || '',
    Evidence_ID: evidence.Evidence_ID || '',
    Confidence: evidence.Confidence || 0.75,
    Status: 'ACTIVE',
    Created_At: now,
    Processor: SCIIP_RESEARCH_SYNTHESIS_PROCESSOR,
    Notes: evidence.Notes || ''
  };
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestResearchSynthesisProcessor() {
  const result = sciipRunResearchSynthesisProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestResearchSynthesisProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * SMALL HELPER
 ************************************************************/

function sciipLocationSuffix_(r) {
  const city = sciipFirstValue_(r, ['City']);
  const submarket = sciipFirstValue_(r, ['Submarket']);
  const market = sciipFirstValue_(r, ['Market']);

  if (city) return ' in ' + city;
  if (submarket) return ' in ' + submarket;
  if (market) return ' in ' + market;
  return '';
}