/************************************************************
 * 240_ThesisValidationProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * 220 creates theses.
 * 240 validates theses against supporting and contradicting evidence.
 *
 * Input:
 * - MARKET_THESIS
 * - RESEARCH_INSIGHTS
 * - RESEARCH_FINDINGS
 * - CHANGE_EVENT
 * - MARKET_SIGNAL
 *
 * Output:
 * - THESIS_VALIDATION
 ************************************************************/

const SCIIP_THESIS_VALIDATION_PROCESSOR = '240_ThesisValidationProcessor';
const SCIIP_THESIS_VALIDATION_SHEET = 'THESIS_VALIDATION';

const SCIIP_THESIS_VALIDATION_HEADERS = [
  'Validation_ID',
  'Business_Key',
  'Thesis_ID',
  'Thesis_Business_Key',
  'Thesis_Type',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Supporting_Evidence_Count',
  'Contradicting_Evidence_Count',
  'Evidence_Diversity_Count',
  'Net_Score',
  'Confidence',
  'Validation_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunThesisValidationProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_THESIS_VALIDATION_SHEET, SCIIP_THESIS_VALIDATION_HEADERS);

  const thesisSheet = ss.getSheetByName('MARKET_THESIS');
  const validationSheet = ss.getSheetByName(SCIIP_THESIS_VALIDATION_SHEET);

  if (!thesisSheet) throw new Error('Missing MARKET_THESIS. Run 220 first.');

  const theses = sciipReadSheetAsObjects_(thesisSheet).filter(function(t) {
    return String(t.Status || '').toUpperCase() === 'ACTIVE';
  });

  const existingKeys = sciipGetExistingColumnValues_(validationSheet, 'Business_Key');

  let thesesReviewed = 0;
  let validationsCreated = 0;
  let skippedDuplicate = 0;
  let skippedNoThesis = 0;

  theses.forEach(function(thesis) {
    if (!thesis.Thesis_ID || !thesis.Business_Key) {
      skippedNoThesis++;
      return;
    }

    thesesReviewed++;

    const validation = sciipCreateThesisValidation_(ss, thesis);

    if (existingKeys.has(validation.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(validationSheet, SCIIP_THESIS_VALIDATION_HEADERS, validation);
    existingKeys.add(validation.Business_Key);
    validationsCreated++;
  });

  const result = {
    processor: SCIIP_THESIS_VALIDATION_PROCESSOR,
    status: 'SUCCESS',
    thesesReviewed: thesesReviewed,
    validationsCreated: validationsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoThesis: skippedNoThesis,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * VALIDATION FACTORY
 ************************************************************/

function sciipCreateThesisValidation_(ss, thesis) {
  const now = new Date().toISOString();

  const evidence = sciipCollectThesisValidationEvidence_(ss, thesis);

  const supporting = evidence.filter(function(e) {
    return e.Direction === 'SUPPORTING';
  });

  const contradicting = evidence.filter(function(e) {
    return e.Direction === 'CONTRADICTING';
  });

  const diversity = sciipUniqueValues_(evidence.map(function(e) {
    return e.Source_Type;
  })).length;

  const netScore = supporting.length - contradicting.length;
  const confidence = sciipCalculateValidationConfidence_(thesis, supporting.length, contradicting.length, diversity);
  const status = sciipValidationStatusFromScore_(netScore, confidence);

  const keyBasis = [
    thesis.Business_Key,
    supporting.length,
    contradicting.length,
    diversity,
    status
  ].join('|');

  const businessKey = 'THESIS_VALIDATION|' + sciipStableHash_(keyBasis);

  return {
    Validation_ID: 'TV_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Thesis_ID: thesis.Thesis_ID,
    Thesis_Business_Key: thesis.Business_Key,
    Thesis_Type: thesis.Thesis_Type || '',
    Market: thesis.Market || '',
    Submarket: thesis.Submarket || '',
    City: thesis.City || '',
    Industry: thesis.Industry || '',
    Supporting_Evidence_Count: supporting.length,
    Contradicting_Evidence_Count: contradicting.length,
    Evidence_Diversity_Count: diversity,
    Net_Score: netScore,
    Confidence: confidence,
    Validation_Status: status,
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_THESIS_VALIDATION_PROCESSOR,
    Notes: 'Validated against internal SCIIP evidence.'
  };
}

/************************************************************
 * EVIDENCE COLLECTION
 ************************************************************/

function sciipCollectThesisValidationEvidence_(ss, thesis) {
  const evidence = [];

  evidence.push.apply(evidence, sciipValidationEvidenceFromInsights_(ss, thesis));
  evidence.push.apply(evidence, sciipValidationEvidenceFromFindings_(ss, thesis));
  evidence.push.apply(evidence, sciipValidationEvidenceFromMarketSignals_(ss, thesis));
  evidence.push.apply(evidence, sciipValidationEvidenceFromChangeEvents_(ss, thesis));

  return evidence;
}

function sciipValidationEvidenceFromInsights_(ss, thesis) {
  const sheet = ss.getSheetByName('RESEARCH_INSIGHTS');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(i) {
      return String(i.Status || '').toUpperCase() === 'ACTIVE';
    })
    .filter(function(i) {
      return sciipThesisLocationMatches_(thesis, i);
    })
    .map(function(i) {
      return {
        Source_Type: 'RESEARCH_INSIGHTS',
        Source_ID: i.Insight_ID,
        Direction: sciipEvidenceDirectionForThesis_(thesis, i.Insight_Type, i.Insight_Text),
        Confidence: sciipNormalizeConfidence_(i.Confidence)
      };
    });
}

function sciipValidationEvidenceFromFindings_(ss, thesis) {
  const sheet = ss.getSheetByName('RESEARCH_FINDINGS');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(f) {
      return String(f.Status || '').toUpperCase() === 'ACTIVE';
    })
    .map(function(f) {
      return {
        Source_Type: 'RESEARCH_FINDINGS',
        Source_ID: f.Finding_ID,
        Direction: sciipEvidenceDirectionForThesis_(thesis, f.Finding_Type, f.Finding_Text),
        Confidence: sciipNormalizeConfidence_(f.Confidence)
      };
    })
    .filter(function(e) {
      return e.Direction !== 'NEUTRAL';
    });
}

function sciipValidationEvidenceFromMarketSignals_(ss, thesis) {
  const sheet = ss.getSheetByName('MARKET_SIGNAL');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(s) {
      return sciipThesisLocationMatches_(thesis, s);
    })
    .map(function(s) {
      const type = sciipFirstValue_(s, ['Signal_Type', 'SignalType', 'Type']);
      return {
        Source_Type: 'MARKET_SIGNAL',
        Source_ID: sciipFirstValue_(s, ['Signal_ID', 'Market_Signal_ID', 'ID']),
        Direction: sciipEvidenceDirectionForThesis_(thesis, type, ''),
        Confidence: sciipNormalizeConfidence_(sciipFirstValue_(s, ['Confidence', 'Score']))
      };
    })
    .filter(function(e) {
      return e.Direction !== 'NEUTRAL';
    });
}

function sciipValidationEvidenceFromChangeEvents_(ss, thesis) {
  const sheet = ss.getSheetByName('CHANGE_EVENT');
  if (!sheet) return [];

  return sciipReadSheetAsObjects_(sheet)
    .filter(function(c) {
      return sciipThesisLocationMatches_(thesis, c);
    })
    .map(function(c) {
      const type = sciipFirstValue_(c, ['Change_Type', 'Event_Type', 'Type']);
      return {
        Source_Type: 'CHANGE_EVENT',
        Source_ID: sciipFirstValue_(c, ['Change_ID', 'Change_Event_ID', 'Event_ID', 'ID']),
        Direction: sciipEvidenceDirectionForThesis_(thesis, type, ''),
        Confidence: sciipNormalizeConfidence_(sciipFirstValue_(c, ['Confidence', 'Score']))
      };
    })
    .filter(function(e) {
      return e.Direction !== 'NEUTRAL';
    });
}

/************************************************************
 * EVIDENCE DIRECTION
 ************************************************************/

function sciipEvidenceDirectionForThesis_(thesis, type, text) {
  const thesisType = String(thesis.Thesis_Type || '').toUpperCase();
  const value = (String(type || '') + ' ' + String(text || '')).toUpperCase();

  if (thesisType.indexOf('PRICING') >= 0) {
    if (value.indexOf('RATE_INCREASE') >= 0 || value.indexOf('RENT_INCREASE') >= 0 || value.indexOf('PRICING') >= 0) return 'SUPPORTING';
    if (value.indexOf('RATE_DECREASE') >= 0 || value.indexOf('RENT_DECREASE') >= 0) return 'CONTRADICTING';
  }

  if (thesisType.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    if (value.indexOf('ADVANCED_MANUFACTURING') >= 0 || value.indexOf('AEROSPACE') >= 0 || value.indexOf('DEFENSE') >= 0) return 'SUPPORTING';
    if (value.indexOf('VACANCY_INCREASE') >= 0 || value.indexOf('DEMAND_DECREASE') >= 0) return 'CONTRADICTING';
  }

  if (thesisType.indexOf('SPATIAL') >= 0 || thesisType.indexOf('ACTIVITY') >= 0) {
    if (value.indexOf('ACTIVITY') >= 0 || value.indexOf('CLUSTER') >= 0 || value.indexOf('GIS') >= 0) return 'SUPPORTING';
    if (value.indexOf('ACTIVITY_DECREASE') >= 0 || value.indexOf('CLUSTER_WEAKENING') >= 0) return 'CONTRADICTING';
  }

  return 'NEUTRAL';
}

/************************************************************
 * LOCATION MATCHING
 ************************************************************/

function sciipThesisLocationMatches_(thesis, row) {
  const thesisCity = String(thesis.City || '').trim().toUpperCase();
  const thesisSubmarket = String(thesis.Submarket || '').trim().toUpperCase();
  const thesisMarket = String(thesis.Market || '').trim().toUpperCase();

  const rowCity = String(sciipFirstValue_(row, ['City']) || '').trim().toUpperCase();
  const rowSubmarket = String(sciipFirstValue_(row, ['Submarket']) || '').trim().toUpperCase();
  const rowMarket = String(sciipFirstValue_(row, ['Market']) || '').trim().toUpperCase();

  if (thesisCity && rowCity && thesisCity === rowCity) return true;
  if (thesisSubmarket && rowSubmarket && thesisSubmarket === rowSubmarket) return true;
  if (thesisMarket && rowMarket && thesisMarket === rowMarket) return true;

  return false;
}

/************************************************************
 * SCORING
 ************************************************************/

function sciipCalculateValidationConfidence_(thesis, supportCount, contradictCount, diversity) {
  const base = sciipNormalizeConfidence_(thesis.Confidence || 0.65);

  let modifier = 0;
  modifier += Math.min(supportCount * 0.04, 0.2);
  modifier += Math.min(diversity * 0.03, 0.12);
  modifier -= Math.min(contradictCount * 0.06, 0.3);

  const score = Math.max(0.1, Math.min(0.99, base + modifier));

  return Math.round(score * 100) / 100;
}

function sciipValidationStatusFromScore_(netScore, confidence) {
  if (netScore >= 3 && confidence >= 0.75) return 'SUPPORTED';
  if (netScore >= 1) return 'WEAKLY_SUPPORTED';
  if (netScore === 0) return 'NEUTRAL';
  if (netScore <= -3) return 'INVALIDATED';
  return 'CHALLENGED';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestThesisValidationProcessor() {
  const result = sciipRunThesisValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestThesisValidationProcessor',
    result: result
  }));

  return result;
}