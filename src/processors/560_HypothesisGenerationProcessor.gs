/***************************************
 * 560_HypothesisGenerationProcessor
 * SCIIP_OS v4.1
 ***************************************/

const SCIIP_HYPOTHESIS_SHEET = 'HYPOTHESES';

const SCIIP_HYPOTHESIS_SCHEMA = [
  'Hypothesis_ID',
  'Business_Key',
  'Hypothesis_Type',
  'Hypothesis_Title',
  'Hypothesis_Statement',
  'Testable_Question',
  'Source_Strategic_Intelligence_ID',
  'Source_Knowledge_Gap_ID',
  'Source_Enrichment_ID',
  'Linked_Asset_ID',
  'Linked_Company',
  'Linked_Market',
  'Confidence',
  'Validation_Priority',
  'Validation_Status',
  'Recommended_Validation_Action',
  'Created_At',
  'Processor'
];

function sciipRunHypothesisGenerationProcessor() {
  const ss = sciipGetSpreadsheet_();

  const hypothesisSheet = sciipEnsureSheetWithSchema_(
    ss,
    SCIIP_HYPOTHESIS_SHEET,
    SCIIP_HYPOTHESIS_SCHEMA
  );

  const enrichments = sciipReadSheetObjects_(ss, 'KNOWLEDGE_GRAPH_ENRICHMENT');
  const gaps = sciipReadSheetObjects_(ss, 'KNOWLEDGE_GAPS');
  const strategic = sciipReadSheetObjects_(ss, 'STRATEGIC_INTELLIGENCE');

  const rows = [];
  const now = new Date().toISOString();

  enrichments.forEach(function(enrichment) {
    const enrichmentId =
      enrichment.Enrichment_ID ||
      enrichment.Knowledge_Graph_Enrichment_ID ||
      enrichment.ID ||
      '';

    if (!enrichmentId) return;

    const gap = sciipFindRelatedKnowledgeGap_(enrichment, gaps);
    const intel = sciipFindRelatedStrategicIntelligence_(enrichment, strategic);

    const candidates = sciipCreateHypothesesFromEnrichment_(
      enrichment,
      gap,
      intel,
      now
    );

    candidates.forEach(function(hypothesis) {
      const prefix = hypothesis.Business_Key;

      if (!sciipBusinessKeyPrefixExists_(hypothesisSheet, prefix)) {
        rows.push(SCIIP_HYPOTHESIS_SCHEMA.map(function(col) {
          return hypothesis[col] || '';
        }));
      }
    });
  });

  if (rows.length) {
    hypothesisSheet
      .getRange(hypothesisSheet.getLastRow() + 1, 1, rows.length, SCIIP_HYPOTHESIS_SCHEMA.length)
      .setValues(rows);
  }

  const result = {
    processor: '560_HypothesisGenerationProcessor',
    status: 'SUCCESS',
    enrichmentsReviewed: enrichments.length,
    knowledgeGapsReviewed: gaps.length,
    strategicIntelligenceReviewed: strategic.length,
    hypothesesCreated: rows.length,
    completedAt: now
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateHypothesesFromEnrichment_(enrichment, gap, intel, now) {
  const enrichmentId =
    enrichment.Enrichment_ID ||
    enrichment.Knowledge_Graph_Enrichment_ID ||
    enrichment.ID ||
    '';

  const gapId =
    gap.Knowledge_Gap_ID ||
    gap.Gap_ID ||
    '';

  const strategicId =
    intel.Strategic_Intelligence_ID ||
    intel.Intelligence_ID ||
    intel.ID ||
    '';

  const assetId =
    enrichment.Asset_ID ||
    enrichment.Linked_Asset_ID ||
    gap.Asset_ID ||
    '';

  const company =
    enrichment.Company ||
    enrichment.Linked_Company ||
    gap.Company ||
    '';

  const market =
    enrichment.Market ||
    enrichment.Linked_Market ||
    gap.Market ||
    '';

  const sourceText = [
    enrichment.Enrichment_Summary,
    enrichment.Candidate_Summary,
    enrichment.Observation,
    gap.Knowledge_Gap,
    gap.Gap_Statement,
    intel.Strategic_Theme,
    intel.Intelligence_Summary
  ].filter(Boolean).join(' | ');

  const types = sciipInferHypothesisTypes_(sourceText);

  return types.map(function(type) {
    const title = sciipBuildHypothesisTitle_(type, market, company, assetId);
    const statement = sciipBuildHypothesisStatement_(type, sourceText, market, company, assetId);

    return {
      Hypothesis_ID: sciipCreateHypothesisId_(),
      Business_Key: [
        'HYPOTHESIS',
        type,
        enrichmentId,
        gapId || 'NO_GAP',
        strategicId || 'NO_STRATEGIC'
      ].join('|'),
      Hypothesis_Type: type,
      Hypothesis_Title: title,
      Hypothesis_Statement: statement,
      Testable_Question: sciipBuildTestableQuestion_(type, market, company, assetId),
      Source_Strategic_Intelligence_ID: strategicId,
      Source_Knowledge_Gap_ID: gapId,
      Source_Enrichment_ID: enrichmentId,
      Linked_Asset_ID: assetId,
      Linked_Company: company,
      Linked_Market: market,
      Confidence: sciipAssignHypothesisConfidence_(enrichment, gap, intel),
      Validation_Priority: sciipAssignValidationPriority_(type, gap, intel),
      Validation_Status: 'UNVALIDATED',
      Recommended_Validation_Action: sciipRecommendValidationAction_(type),
      Created_At: now,
      Processor: '560_HypothesisGenerationProcessor'
    };
  });
}

function sciipInferHypothesisTypes_(text) {
  const t = String(text || '').toLowerCase();
  const types = [];

  if (t.match(/lease|sale|vacancy|availability|absorption|rate|tenant|market/)) {
    types.push('MARKET_HYPOTHESIS');
  }

  if (t.match(/property|asset|building|parcel|site|dock|clear|yard|power/)) {
    types.push('PROPERTY_HYPOTHESIS');
  }

  if (t.match(/company|tenant|occupier|manufacturer|supplier|oem|operator/)) {
    types.push('COMPANY_HYPOTHESIS');
  }

  if (t.match(/risk|exposure|decline|constraint|weakness|threat|delay/)) {
    types.push('RISK_HYPOTHESIS');
  }

  if (t.match(/opportunity|growth|expansion|demand|advantage|signal/)) {
    types.push('OPPORTUNITY_HYPOTHESIS');
  }

  if (t.match(/processor|workflow|system|pipeline|automation|knowledge graph/)) {
    types.push('OPERATING_SYSTEM_HYPOTHESIS');
  }

  return types.length ? types : ['MARKET_HYPOTHESIS'];
}

function sciipBuildHypothesisTitle_(type, market, company, assetId) {
  const subject = company || assetId || market || 'Observed Market Signal';

  return type.replace(/_/g, ' ') + ': ' + subject;
}

function sciipBuildHypothesisStatement_(type, sourceText, market, company, assetId) {
  const subject = company || assetId || market || 'the observed signal';

  return 'Based on linked intelligence and knowledge graph enrichment, SCIIP hypothesizes that ' +
    subject +
    ' may represent a testable ' +
    type.toLowerCase().replace(/_/g, ' ') +
    '. Source basis: ' +
    String(sourceText || '').substring(0, 500);
}

function sciipBuildTestableQuestion_(type, market, company, assetId) {
  const subject = company || assetId || market || 'this signal';

  const questions = {
    MARKET_HYPOTHESIS:
      'Can additional market evidence confirm that ' + subject + ' reflects a broader market pattern?',
    PROPERTY_HYPOTHESIS:
      'Can property-level evidence confirm that ' + subject + ' has materially differentiated characteristics?',
    COMPANY_HYPOTHESIS:
      'Can company-level evidence confirm that ' + subject + ' has a current or emerging real estate requirement?',
    RISK_HYPOTHESIS:
      'Can additional evidence confirm that ' + subject + ' presents a measurable risk?',
    OPPORTUNITY_HYPOTHESIS:
      'Can additional evidence confirm that ' + subject + ' represents an actionable opportunity?',
    OPERATING_SYSTEM_HYPOTHESIS:
      'Can SCIIP workflow evidence confirm that ' + subject + ' should change system behavior or processor logic?'
  };

  return questions[type] || questions.MARKET_HYPOTHESIS;
}

function sciipAssignHypothesisConfidence_(enrichment, gap, intel) {
  let score = 0.35;

  if (enrichment && Object.keys(enrichment).length) score += 0.2;
  if (gap && Object.keys(gap).length) score += 0.2;
  if (intel && Object.keys(intel).length) score += 0.15;

  if (String(enrichment.Confidence || '').toUpperCase() === 'HIGH') score += 0.1;
  if (String(gap.Priority || '').toUpperCase() === 'HIGH') score += 0.1;

  if (score >= 0.75) return 'HIGH';
  if (score >= 0.5) return 'MEDIUM';
  return 'LOW';
}

function sciipAssignValidationPriority_(type, gap, intel) {
  const gapPriority = String(gap.Priority || gap.Validation_Priority || '').toUpperCase();
  const intelPriority = String(intel.Priority || intel.Strategic_Priority || '').toUpperCase();

  if (gapPriority === 'HIGH' || intelPriority === 'HIGH') return 'HIGH';

  if (
    type === 'OPPORTUNITY_HYPOTHESIS' ||
    type === 'RISK_HYPOTHESIS' ||
    type === 'PROPERTY_HYPOTHESIS'
  ) {
    return 'HIGH';
  }

  return 'MEDIUM';
}

function sciipRecommendValidationAction_(type) {
  const actions = {
    MARKET_HYPOTHESIS:
      'Compare against recent lease, sale, availability, tenant, and absorption signals.',
    PROPERTY_HYPOTHESIS:
      'Validate against asset registry, property events, GIS attributes, and broker-observed property facts.',
    COMPANY_HYPOTHESIS:
      'Validate through company research, funding events, hiring signals, permits, and occupier movement.',
    RISK_HYPOTHESIS:
      'Validate through negative signals, timing risk, regulatory constraints, vacancy exposure, and counterevidence.',
    OPPORTUNITY_HYPOTHESIS:
      'Validate through demand signals, ownership fit, tenant activity, pricing gaps, and market timing.',
    OPERATING_SYSTEM_HYPOTHESIS:
      'Validate through processor outputs, duplicate patterns, missing fields, workflow friction, and graph incompleteness.'
  };

  return actions[type] || actions.MARKET_HYPOTHESIS;
}

function sciipFindRelatedKnowledgeGap_(enrichment, gaps) {
  const gapId =
    enrichment.Knowledge_Gap_ID ||
    enrichment.Source_Knowledge_Gap_ID ||
    enrichment.Gap_ID ||
    '';

  if (gapId) {
    const match = gaps.find(function(g) {
      return String(g.Knowledge_Gap_ID || g.Gap_ID || '') === String(gapId);
    });
    if (match) return match;
  }

  return gaps[0] || {};
}

function sciipFindRelatedStrategicIntelligence_(enrichment, strategic) {
  const strategicId =
    enrichment.Strategic_Intelligence_ID ||
    enrichment.Source_Strategic_Intelligence_ID ||
    enrichment.Intelligence_ID ||
    '';

  if (strategicId) {
    const match = strategic.find(function(s) {
      return String(s.Strategic_Intelligence_ID || s.Intelligence_ID || s.ID || '') === String(strategicId);
    });
    if (match) return match;
  }

  return strategic[0] || {};
}

function sciipCreateHypothesisId_() {
  return 'HYP_' + Utilities.getUuid().replace(/-/g, '').substring(0, 16).toUpperCase();
}

function sciipTestHypothesisGenerationProcessor() {
  const result = sciipRunHypothesisGenerationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisGenerationProcessor',
    result: result
  }));

  return result;
}