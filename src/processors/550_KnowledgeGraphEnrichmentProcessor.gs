/************************************************************
 * 550_KnowledgeGraphEnrichmentProcessor
 * SCIIP_OS v4.1
 *
 * Inputs:
 * - KNOWLEDGE_GAPS
 * - RESEARCH_MISSIONS
 * - AUTONOMOUS_RESEARCH_COORDINATION
 *
 * Output:
 * - KNOWLEDGE_GRAPH_ENRICHMENT
 ************************************************************/

const KNOWLEDGE_GRAPH_ENRICHMENT_SHEET =
  'KNOWLEDGE_GRAPH_ENRICHMENT';

const KNOWLEDGE_GRAPH_ENRICHMENT_HEADERS = [
  'Enrichment_ID',
  'Business_Key',
  'Enrichment_Date',
  'Enrichment_Type',
  'Knowledge_Gap_ID',
  'Research_Mission_ID',
  'Coordination_ID',
  'Target_Entity_Type',
  'Target_Entity_ID',
  'Target_Graph_Object',
  'Proposed_Node_Type',
  'Proposed_Edge_Type',
  'Proposed_Property_Update',
  'Enrichment_Rationale',
  'Source_Record',
  'Confidence',
  'Human_Review_Status',
  'Enrichment_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureKnowledgeGraphEnrichmentSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(KNOWLEDGE_GRAPH_ENRICHMENT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(KNOWLEDGE_GRAPH_ENRICHMENT_SHEET);
  }

  sheet.getRange(1, 1, 1, KNOWLEDGE_GRAPH_ENRICHMENT_HEADERS.length)
    .setValues([KNOWLEDGE_GRAPH_ENRICHMENT_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunKnowledgeGraphEnrichmentProcessor() {
  const processor = '550_KnowledgeGraphEnrichmentProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureKnowledgeGraphEnrichmentSchema();

  const enrichmentDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `KNOWLEDGE_GRAPH_ENRICHMENT|${enrichmentDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      knowledgeGraphEnrichmentsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const knowledgeGaps = sciipGetRecordsByDate_(
    'KNOWLEDGE_GAPS',
    'Gap_Date',
    enrichmentDate
  );

  const researchMissions = sciipGetRecordsByDate_(
    'RESEARCH_MISSIONS',
    'Mission_Date',
    enrichmentDate
  );

  const coordinations = sciipGetRecordsByDate_(
    'AUTONOMOUS_RESEARCH_COORDINATION',
    'Coordination_Date',
    enrichmentDate
  );

  if (
    knowledgeGaps.length === 0 &&
    researchMissions.length === 0 &&
    coordinations.length === 0
  ) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      knowledgeGraphEnrichmentsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const enrichments =
    sciipCreateKnowledgeGraphEnrichments_({
      businessKey,
      enrichmentDate,
      knowledgeGaps,
      researchMissions,
      coordinations,
      processor
    });

  enrichments.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    knowledgeGraphEnrichmentsCreated: enrichments.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateKnowledgeGraphEnrichments_(args) {
  const now = new Date();

  const sourceRecords =
    args.knowledgeGaps.length > 0
      ? args.knowledgeGaps
      : args.researchMissions.length > 0
        ? args.researchMissions
        : args.coordinations;

  const rows = sourceRecords.map(record => {
    const knowledgeGapId = sciipExtractFirstAvailable_(record, [
      'Knowledge_Gap_ID',
      'Gap_ID'
    ]);

    const researchMissionId = sciipExtractFirstAvailable_(record, [
      'Research_Mission_ID'
    ]);

    const coordinationId = sciipExtractFirstAvailable_(record, [
      'Coordination_ID'
    ]);

    const matchedMission =
      sciipFindMissionById_(args.researchMissions, researchMissionId);

    const matchedCoordination =
      sciipFindCoordinationById_(args.coordinations, coordinationId);

    const profile =
      sciipInferGraphEnrichmentProfile_(
        record,
        matchedMission,
        matchedCoordination
      );

    const rowKey =
      `${args.businessKey}|${profile.targetEntityType}|${profile.proposedNodeType}|${sciipNormalizeMissionKey_(knowledgeGapId || researchMissionId || coordinationId || profile.proposedPropertyUpdate)}`;

    return [
      sciipGenerateId_('KGE'),
      rowKey,
      args.enrichmentDate,
      'DAILY_KNOWLEDGE_GRAPH_ENRICHMENT',
      knowledgeGapId,
      researchMissionId,
      coordinationId,
      profile.targetEntityType,
      profile.targetEntityId,
      profile.targetGraphObject,
      profile.proposedNodeType,
      profile.proposedEdgeType,
      profile.proposedPropertyUpdate,
      profile.enrichmentRationale,
      profile.sourceRecord,
      profile.confidence,
      'PENDING_OPERATOR_REVIEW',
      'PROPOSED',
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateKnowledgeGraphEnrichmentRows_(rows);
}

function sciipInferGraphEnrichmentProfile_(gap, mission, coordination) {
  const combined = [
    sciipExtractFirstAvailable_(gap, [
      'Entity_Type',
      'Gap_Category',
      'Missing_Fact',
      'Why_It_Matters',
      'Suggested_Data_Source',
      'Discovery_Source'
    ]),
    sciipExtractFirstAvailable_(mission, [
      'Mission_Type',
      'Research_Question',
      'Mission_Objective',
      'Target_Entities',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable_(coordination, [
      'Research_Route',
      'Research_Objective',
      'Research_Instructions',
      'Expected_Output'
    ])
  ].join(' ').toLowerCase();

  let targetEntityType =
    sciipExtractFirstAvailable_(gap, ['Entity_Type']) ||
    'UNKNOWN_ENTITY';

  let proposedNodeType = 'KNOWLEDGE_GAP';
  let proposedEdgeType = 'HAS_KNOWLEDGE_GAP';
  let targetGraphObject = 'KNOWLEDGE_GRAPH';
  let proposedPropertyUpdate =
    'Add or update graph metadata describing missing intelligence and research need.';
  let confidence =
    sciipExtractFirstAvailable_(gap, ['Confidence']) || 'MEDIUM';

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('supplier') ||
    combined.includes('oem')
  ) {
    targetEntityType = 'COMPANY';
    proposedNodeType = 'COMPANY_NODE';
    proposedEdgeType = 'HAS_UNRESOLVED_COMPANY_INTELLIGENCE_GAP';
    targetGraphObject = 'COMPANY_KNOWLEDGE_GRAPH';
    proposedPropertyUpdate =
      'Create or update company intelligence gap metadata, including missing activity, tenant movement, supplier relationship, or OEM linkage.';
  }

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('ownership')
  ) {
    targetEntityType = 'PROPERTY';
    proposedNodeType = 'PROPERTY_NODE';
    proposedEdgeType = 'HAS_UNRESOLVED_PROPERTY_INTELLIGENCE_GAP';
    targetGraphObject = 'PROPERTY_KNOWLEDGE_GRAPH';
    proposedPropertyUpdate =
      'Create or update property intelligence gap metadata, including missing ownership, tenant, building attribute, power, yard, or availability information.';
  }

  if (
    combined.includes('market') ||
    combined.includes('opportunity')
  ) {
    if (targetEntityType === 'UNKNOWN_ENTITY') {
      targetEntityType = 'MARKET';
    }

    proposedNodeType = 'MARKET_SIGNAL_NODE';
    proposedEdgeType = 'REQUIRES_MARKET_SIGNAL_VALIDATION';
    targetGraphObject = 'MARKET_INTELLIGENCE_GRAPH';
    proposedPropertyUpdate =
      'Create market signal validation metadata linking the signal to affected companies, properties, or submarkets once validated.';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('critical')
  ) {
    proposedNodeType = 'RISK_SIGNAL_NODE';
    proposedEdgeType = 'HAS_UNRESOLVED_RISK_SIGNAL';
    targetGraphObject = 'RISK_INTELLIGENCE_GRAPH';
    proposedPropertyUpdate =
      'Create risk signal metadata including severity, affected entities, timing, source confidence, and mitigation pathway.';
    confidence = confidence === 'LOW' ? 'MEDIUM' : confidence;
  }

  if (
    combined.includes('workflow') ||
    combined.includes('automation') ||
    combined.includes('autonomous') ||
    combined.includes('system')
  ) {
    targetEntityType = 'SCIIP_SYSTEM';
    proposedNodeType = 'SYSTEM_LEARNING_NODE';
    proposedEdgeType = 'HAS_OPERATING_SYSTEM_IMPROVEMENT_GAP';
    targetGraphObject = 'SCIIP_OPERATING_GRAPH';
    proposedPropertyUpdate =
      'Create system learning metadata for workflow friction, automation readiness, blocker pattern, or processor improvement.';
  }

  return {
    targetEntityType,
    targetEntityId: sciipExtractFirstAvailable_(gap, ['Entity_ID']),
    targetGraphObject,
    proposedNodeType,
    proposedEdgeType,
    proposedPropertyUpdate,
    enrichmentRationale: sciipComposeGraphEnrichmentRationale_(gap, mission, coordination),
    sourceRecord: sciipInferGraphEnrichmentSourceRecord_(gap, mission, coordination),
    confidence
  };
}

function sciipComposeGraphEnrichmentRationale_(gap, mission, coordination) {
  const parts = [];

  const missingFact = sciipExtractFirstAvailable_(gap, [
    'Missing_Fact'
  ]);

  const why = sciipExtractFirstAvailable_(gap, [
    'Why_It_Matters'
  ]);

  const missionObjective = sciipExtractFirstAvailable_(mission, [
    'Mission_Objective'
  ]);

  const instructions = sciipExtractFirstAvailable_(coordination, [
    'Research_Instructions'
  ]);

  if (missingFact) {
    parts.push(`Missing fact: ${missingFact}`);
  }

  if (why) {
    parts.push(`Strategic rationale: ${why}`);
  }

  if (missionObjective) {
    parts.push(`Research mission objective: ${missionObjective}`);
  }

  if (instructions) {
    parts.push(`Research coordination instructions: ${instructions}`);
  }

  if (parts.length === 0) {
    parts.push(
      'This enrichment candidate was generated because SCIIP identified unresolved knowledge that may strengthen the graph.'
    );
  }

  return parts.join('\n');
}

function sciipInferGraphEnrichmentSourceRecord_(gap, mission, coordination) {
  const gapId = sciipExtractFirstAvailable_(gap, [
    'Knowledge_Gap_ID'
  ]);

  if (gapId) {
    return `KNOWLEDGE_GAPS:${gapId}`;
  }

  const missionId = sciipExtractFirstAvailable_(mission, [
    'Research_Mission_ID'
  ]);

  if (missionId) {
    return `RESEARCH_MISSIONS:${missionId}`;
  }

  const coordinationId = sciipExtractFirstAvailable_(coordination, [
    'Coordination_ID'
  ]);

  if (coordinationId) {
    return `AUTONOMOUS_RESEARCH_COORDINATION:${coordinationId}`;
  }

  return 'UNKNOWN_SOURCE_RECORD';
}

function sciipFindCoordinationById_(coordinations, coordinationId) {
  if (!coordinationId) return null;

  return coordinations.find(coordination =>
    sciipExtractFirstAvailable_(coordination, [
      'Coordination_ID',
      'ID'
    ]) === coordinationId
  ) || null;
}

function sciipDeduplicateKnowledgeGraphEnrichmentRows_(rows) {
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

function sciipTestKnowledgeGraphEnrichmentProcessor() {
  const result = sciipRunKnowledgeGraphEnrichmentProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeGraphEnrichmentProcessor',
    result
  }));

  return result;
}