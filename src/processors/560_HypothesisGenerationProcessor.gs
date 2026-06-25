/************************************************************
 * 560_HypothesisGenerationProcessor
 * SCIIP_OS v4.1
 *
 * Inputs:
 * - KNOWLEDGE_GRAPH_ENRICHMENT
 * - KNOWLEDGE_GAPS
 * - STRATEGIC_INTELLIGENCE
 *
 * Output:
 * - HYPOTHESES
 ************************************************************/

const HYPOTHESES_SHEET = 'HYPOTHESES';

const HYPOTHESES_HEADERS = [
  'Hypothesis_ID',
  'Business_Key',
  'Hypothesis_Date',
  'Hypothesis_Type',
  'Hypothesis_Title',
  'Hypothesis_Statement',
  'Testable_Question',
  'Strategic_Intelligence_ID',
  'Knowledge_Gap_ID',
  'Enrichment_ID',
  'Target_Entity_Type',
  'Target_Entity_ID',
  'Target_Graph_Object',
  'Source_Record',
  'Evidence_Basis',
  'Confidence',
  'Validation_Priority',
  'Validation_Status',
  'Recommended_Validation_Action',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureHypothesesSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(HYPOTHESES_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(HYPOTHESES_SHEET);
  }

  sheet.getRange(1, 1, 1, HYPOTHESES_HEADERS.length)
    .setValues([HYPOTHESES_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunHypothesisGenerationProcessor() {
  const processor = '560_HypothesisGenerationProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsureHypothesesSchema();

  const hypothesisDate = sciipFormatDateKey_(startedAt);
  const businessKey = `HYPOTHESIS|${hypothesisDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      hypothesesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const enrichments = sciipGetRecordsByDate_(
    'KNOWLEDGE_GRAPH_ENRICHMENT',
    'Enrichment_Date',
    hypothesisDate
  );

  const knowledgeGaps = sciipGetRecordsByDate_(
    'KNOWLEDGE_GAPS',
    'Gap_Date',
    hypothesisDate
  );

  const strategicIntelligence = sciipGetRecordsByDate_(
    'STRATEGIC_INTELLIGENCE',
    'Strategic_Intelligence_Date',
    hypothesisDate
  );

  if (
    enrichments.length === 0 &&
    knowledgeGaps.length === 0 &&
    strategicIntelligence.length === 0
  ) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      hypothesesCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const hypotheses = sciipCreateHypotheses_({
    businessKey,
    hypothesisDate,
    enrichments,
    knowledgeGaps,
    strategicIntelligence,
    processor
  });

  hypotheses.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    hypothesesCreated: hypotheses.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateHypotheses_(args) {
  const now = new Date();

  const sourceRecords =
    args.enrichments.length > 0
      ? args.enrichments
      : args.knowledgeGaps.length > 0
        ? args.knowledgeGaps
        : args.strategicIntelligence;

  const rows = sourceRecords.map(record => {
    const enrichmentId = sciipExtractFirstAvailable_(record, [
      'Enrichment_ID',
      'Knowledge_Graph_Enrichment_ID'
    ]);

    const knowledgeGapId = sciipExtractFirstAvailable_(record, [
      'Knowledge_Gap_ID',
      'Gap_ID'
    ]);

    const strategicIntelligenceId = sciipExtractFirstAvailable_(record, [
      'Strategic_Intelligence_ID',
      'Intelligence_ID'
    ]);

    const matchedGap = sciipFindKnowledgeGapById_(
      args.knowledgeGaps,
      knowledgeGapId
    );

    const matchedStrategicIntelligence = sciipFindStrategicIntelligenceById_(
      args.strategicIntelligence,
      strategicIntelligenceId
    );

    const profile = sciipInferHypothesisProfile_(
      record,
      matchedGap,
      matchedStrategicIntelligence
    );

    const rowKey =
      `${args.businessKey}|${profile.hypothesisType}|${profile.targetEntityType}|${sciipNormalizeMissionKey_(enrichmentId || knowledgeGapId || strategicIntelligenceId || profile.hypothesisTitle)}`;

    return [
      sciipGenerateId_('HYP'),
      rowKey,
      args.hypothesisDate,
      profile.hypothesisType,
      profile.hypothesisTitle,
      profile.hypothesisStatement,
      profile.testableQuestion,
      strategicIntelligenceId,
      knowledgeGapId,
      enrichmentId,
      profile.targetEntityType,
      profile.targetEntityId,
      profile.targetGraphObject,
      profile.sourceRecord,
      profile.evidenceBasis,
      profile.confidence,
      profile.validationPriority,
      'UNVALIDATED',
      profile.recommendedValidationAction,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisRows_(rows);
}

function sciipInferHypothesisProfile_(record, gap, strategicIntelligence) {
  const combined = [
    sciipExtractFirstAvailable_(record, [
      'Enrichment_Type',
      'Target_Entity_Type',
      'Target_Graph_Object',
      'Proposed_Node_Type',
      'Proposed_Edge_Type',
      'Proposed_Property_Update',
      'Enrichment_Rationale',
      'Source_Record'
    ]),
    sciipExtractFirstAvailable_(gap, [
      'Entity_Type',
      'Gap_Category',
      'Missing_Fact',
      'Why_It_Matters',
      'Suggested_Data_Source',
      'Discovery_Source'
    ]),
    sciipExtractFirstAvailable_(strategicIntelligence, [
      'Strategic_Theme',
      'Strategic_Intelligence_Summary',
      'Intelligence_Summary',
      'Signal_Type',
      'Recommended_Action'
    ])
  ].join(' ').toLowerCase();

  let hypothesisType = 'MARKET_HYPOTHESIS';
  let targetEntityType =
    sciipExtractFirstAvailable_(record, ['Target_Entity_Type']) ||
    sciipExtractFirstAvailable_(gap, ['Entity_Type']) ||
    'MARKET';

  let targetEntityId =
    sciipExtractFirstAvailable_(record, ['Target_Entity_ID']) ||
    sciipExtractFirstAvailable_(gap, ['Entity_ID']);

  let targetGraphObject =
    sciipExtractFirstAvailable_(record, ['Target_Graph_Object']) ||
    'MARKET_INTELLIGENCE_GRAPH';

  let confidence =
    sciipExtractFirstAvailable_(record, ['Confidence']) ||
    sciipExtractFirstAvailable_(gap, ['Confidence']) ||
    'MEDIUM';

  let validationPriority = 'MEDIUM';

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('parcel') ||
    combined.includes('ownership') ||
    combined.includes('yard') ||
    combined.includes('power')
  ) {
    hypothesisType = 'PROPERTY_HYPOTHESIS';
    targetEntityType = 'PROPERTY';
    targetGraphObject = 'PROPERTY_KNOWLEDGE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('occupier') ||
    combined.includes('supplier') ||
    combined.includes('oem') ||
    combined.includes('manufacturer')
  ) {
    hypothesisType = 'COMPANY_HYPOTHESIS';
    targetEntityType = 'COMPANY';
    targetGraphObject = 'COMPANY_KNOWLEDGE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('constraint') ||
    combined.includes('exposure') ||
    combined.includes('delay') ||
    combined.includes('critical')
  ) {
    hypothesisType = 'RISK_HYPOTHESIS';
    targetGraphObject = 'RISK_INTELLIGENCE_GRAPH';
    validationPriority = 'HIGH';
    confidence = confidence === 'LOW' ? 'MEDIUM' : confidence;
  }

  if (
    combined.includes('opportunity') ||
    combined.includes('growth') ||
    combined.includes('expansion') ||
    combined.includes('demand') ||
    combined.includes('advantage') ||
    combined.includes('signal')
  ) {
    hypothesisType = 'OPPORTUNITY_HYPOTHESIS';
    targetGraphObject = 'OPPORTUNITY_INTELLIGENCE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('workflow') ||
    combined.includes('automation') ||
    combined.includes('processor') ||
    combined.includes('pipeline') ||
    combined.includes('system') ||
    combined.includes('knowledge graph')
  ) {
    hypothesisType = 'OPERATING_SYSTEM_HYPOTHESIS';
    targetEntityType = 'SCIIP_SYSTEM';
    targetGraphObject = 'SCIIP_OPERATING_GRAPH';
    validationPriority = 'MEDIUM';
  }

  const evidenceBasis = sciipComposeHypothesisEvidenceBasis_(
    record,
    gap,
    strategicIntelligence
  );

  const hypothesisTitle =
    sciipComposeHypothesisTitle_(
      hypothesisType,
      targetEntityType,
      targetEntityId
    );

  return {
    hypothesisType,
    hypothesisTitle,
    hypothesisStatement: sciipComposeHypothesisStatement_(
      hypothesisType,
      targetEntityType,
      targetEntityId,
      evidenceBasis
    ),
    testableQuestion: sciipComposeTestableQuestion_(
      hypothesisType,
      targetEntityType,
      targetEntityId
    ),
    targetEntityType,
    targetEntityId,
    targetGraphObject,
    sourceRecord: sciipInferHypothesisSourceRecord_(record, gap, strategicIntelligence),
    evidenceBasis,
    confidence,
    validationPriority,
    recommendedValidationAction:
      sciipRecommendHypothesisValidationAction_(hypothesisType)
  };
}

function sciipComposeHypothesisTitle_(type, entityType, entityId) {
  const subject = entityId || entityType || 'MARKET_SIGNAL';
  return `${type}: ${subject}`;
}

function sciipComposeHypothesisStatement_(type, entityType, entityId, evidenceBasis) {
  const subject = entityId || entityType || 'the observed market signal';

  return `SCIIP hypothesizes that ${subject} represents a testable ${type.toLowerCase().replace(/_/g, ' ')} based on linked intelligence, knowledge gaps, and graph enrichment evidence.\n\nEvidence basis: ${evidenceBasis}`;
}

function sciipComposeTestableQuestion_(type, entityType, entityId) {
  const subject = entityId || entityType || 'this signal';

  if (type === 'PROPERTY_HYPOTHESIS') {
    return `Can property-level evidence confirm that ${subject} has materially relevant industrial market characteristics?`;
  }

  if (type === 'COMPANY_HYPOTHESIS') {
    return `Can company-level evidence confirm that ${subject} has a current or emerging real estate requirement?`;
  }

  if (type === 'RISK_HYPOTHESIS') {
    return `Can additional evidence confirm that ${subject} presents a measurable market, property, company, or operating risk?`;
  }

  if (type === 'OPPORTUNITY_HYPOTHESIS') {
    return `Can additional evidence confirm that ${subject} represents an actionable industrial market opportunity?`;
  }

  if (type === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return `Can SCIIP workflow evidence confirm that ${subject} should change processor logic, graph structure, or operating behavior?`;
  }

  return `Can additional market evidence confirm that ${subject} reflects a broader industrial market pattern?`;
}

function sciipComposeHypothesisEvidenceBasis_(record, gap, strategicIntelligence) {
  const parts = [];

  const enrichmentRationale = sciipExtractFirstAvailable_(record, [
    'Enrichment_Rationale'
  ]);

  const proposedUpdate = sciipExtractFirstAvailable_(record, [
    'Proposed_Property_Update'
  ]);

  const missingFact = sciipExtractFirstAvailable_(gap, [
    'Missing_Fact'
  ]);

  const whyItMatters = sciipExtractFirstAvailable_(gap, [
    'Why_It_Matters'
  ]);

  const strategicSummary = sciipExtractFirstAvailable_(strategicIntelligence, [
    'Strategic_Intelligence_Summary',
    'Intelligence_Summary',
    'Strategic_Theme'
  ]);

  if (enrichmentRationale) {
    parts.push(`Graph enrichment rationale: ${enrichmentRationale}`);
  }

  if (proposedUpdate) {
    parts.push(`Proposed graph update: ${proposedUpdate}`);
  }

  if (missingFact) {
    parts.push(`Knowledge gap: ${missingFact}`);
  }

  if (whyItMatters) {
    parts.push(`Why it matters: ${whyItMatters}`);
  }

  if (strategicSummary) {
    parts.push(`Strategic intelligence: ${strategicSummary}`);
  }

  if (parts.length === 0) {
    parts.push(
      'SCIIP identified a connected intelligence signal requiring hypothesis testing.'
    );
  }

  return parts.join('\n');
}

function sciipInferHypothesisSourceRecord_(record, gap, strategicIntelligence) {
  const enrichmentId = sciipExtractFirstAvailable_(record, [
    'Enrichment_ID'
  ]);

  if (enrichmentId) {
    return `KNOWLEDGE_GRAPH_ENRICHMENT:${enrichmentId}`;
  }

  const gapId = sciipExtractFirstAvailable_(gap, [
    'Knowledge_Gap_ID',
    'Gap_ID'
  ]);

  if (gapId) {
    return `KNOWLEDGE_GAPS:${gapId}`;
  }

  const strategicId = sciipExtractFirstAvailable_(strategicIntelligence, [
    'Strategic_Intelligence_ID',
    'Intelligence_ID'
  ]);

  if (strategicId) {
    return `STRATEGIC_INTELLIGENCE:${strategicId}`;
  }

  return 'UNKNOWN_SOURCE_RECORD';
}

function sciipRecommendHypothesisValidationAction_(type) {
  if (type === 'PROPERTY_HYPOTHESIS') {
    return 'Validate against asset registry, property events, GIS attributes, ownership facts, tenant signals, power, yard, and availability evidence.';
  }

  if (type === 'COMPANY_HYPOTHESIS') {
    return 'Validate through company research, funding events, hiring signals, permits, supplier relationships, OEM linkages, and occupier movement.';
  }

  if (type === 'RISK_HYPOTHESIS') {
    return 'Validate through counterevidence, timing risk, regulatory constraints, vacancy exposure, tenant exposure, and market weakness signals.';
  }

  if (type === 'OPPORTUNITY_HYPOTHESIS') {
    return 'Validate through demand signals, ownership fit, tenant movement, pricing gaps, supply constraints, and market timing.';
  }

  if (type === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return 'Validate through processor outputs, duplicate patterns, missing fields, workflow friction, graph incompleteness, and operator feedback.';
  }

  return 'Validate against recent lease, sale, availability, tenant, capital markets, and absorption signals.';
}

function sciipFindKnowledgeGapById_(knowledgeGaps, knowledgeGapId) {
  if (!knowledgeGapId) return null;

  return knowledgeGaps.find(gap =>
    sciipExtractFirstAvailable_(gap, [
      'Knowledge_Gap_ID',
      'Gap_ID',
      'ID'
    ]) === knowledgeGapId
  ) || null;
}

function sciipFindStrategicIntelligenceById_(strategicIntelligence, strategicIntelligenceId) {
  if (!strategicIntelligenceId) return null;

  return strategicIntelligence.find(intelligence =>
    sciipExtractFirstAvailable_(intelligence, [
      'Strategic_Intelligence_ID',
      'Intelligence_ID',
      'ID'
    ]) === strategicIntelligenceId
  ) || null;
}

function sciipDeduplicateHypothesisRows_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(row => {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestHypothesisGenerationProcessor() {
  const result = sciipRunHypothesisGenerationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisGenerationProcessor',
    result
  }));

  return result;
}