540_KnowledgeGapProcessor.gs/************************************************************
 * 540_KnowledgeGapProcessor
 * SCIIP_OS v4.1
 *
 * Inputs:
 * - AUTONOMOUS_RESEARCH_COORDINATION
 * - RESEARCH_MISSIONS
 * - INTELLIGENCE_REQUIREMENTS
 *
 * Output:
 * - KNOWLEDGE_GAPS
 ************************************************************/

const KNOWLEDGE_GAPS_SHEET = 'KNOWLEDGE_GAPS';

const KNOWLEDGE_GAPS_HEADERS = [
  'Knowledge_Gap_ID',
  'Business_Key',
  'Gap_Date',
  'Gap_Type',
  'Coordination_ID',
  'Research_Mission_ID',
  'Requirement_ID',
  'Entity_Type',
  'Entity_ID',
  'Gap_Category',
  'Missing_Fact',
  'Why_It_Matters',
  'Suggested_Data_Source',
  'Priority',
  'Confidence',
  'Gap_Status',
  'Discovery_Source',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureKnowledgeGapsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(KNOWLEDGE_GAPS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(KNOWLEDGE_GAPS_SHEET);
  }

  sheet.getRange(1, 1, 1, KNOWLEDGE_GAPS_HEADERS.length)
    .setValues([KNOWLEDGE_GAPS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunKnowledgeGapProcessor() {
  const processor = '540_KnowledgeGapProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsureKnowledgeGapsSchema();

  const gapDate = sciipFormatDateKey_(startedAt);
  const businessKey = `KNOWLEDGE_GAPS|${gapDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      knowledgeGapsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const coordinations = sciipGetRecordsByDate_(
    'AUTONOMOUS_RESEARCH_COORDINATION',
    'Coordination_Date',
    gapDate
  );

  const missions = sciipGetRecordsByDate_(
    'RESEARCH_MISSIONS',
    'Mission_Date',
    gapDate
  );

  const requirements = sciipGetRecordsByDate_(
    'INTELLIGENCE_REQUIREMENTS',
    'Requirement_Date',
    gapDate
  );

  if (
    coordinations.length === 0 &&
    missions.length === 0 &&
    requirements.length === 0
  ) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      knowledgeGapsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const gaps = sciipCreateKnowledgeGaps_({
    businessKey,
    gapDate,
    coordinations,
    missions,
    requirements,
    processor
  });

  gaps.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    knowledgeGapsCreated: gaps.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateKnowledgeGaps_(args) {
  const now = new Date();
  const rows = [];

  const sourceRecords =
    args.coordinations.length > 0
      ? args.coordinations
      : args.missions.length > 0
        ? args.missions
        : args.requirements;

  sourceRecords.forEach(record => {
    const coordinationId = sciipExtractFirstAvailable_(record, [
      'Coordination_ID'
    ]);

    const missionId = sciipExtractFirstAvailable_(record, [
      'Research_Mission_ID'
    ]);

    const requirementId = sciipExtractFirstAvailable_(record, [
      'Requirement_ID'
    ]);

    const matchedMission =
      sciipFindMissionById_(args.missions, missionId);

    const matchedRequirement =
      sciipFindRequirementById_(args.requirements, requirementId);

    const gapProfile =
      sciipInferKnowledgeGapProfile_(record, matchedMission, matchedRequirement);

    const rowBusinessKey =
      `${args.businessKey}|${gapProfile.entityType}|${gapProfile.gapCategory}|${sciipNormalizeMissionKey_(missionId || requirementId || gapProfile.missingFact)}`;

    rows.push([
      sciipGenerateId_('KGP'),
      rowBusinessKey,
      args.gapDate,
      'DAILY_KNOWLEDGE_GAP',
      coordinationId,
      missionId,
      requirementId,
      gapProfile.entityType,
      gapProfile.entityId,
      gapProfile.gapCategory,
      gapProfile.missingFact,
      gapProfile.whyItMatters,
      gapProfile.suggestedDataSource,
      gapProfile.priority,
      gapProfile.confidence,
      'OPEN',
      gapProfile.discoverySource,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ]);
  });

  return sciipDeduplicateKnowledgeGapRows_(rows);
}

function sciipInferKnowledgeGapProfile_(record, mission, requirement) {
  const combined = [
    sciipExtractFirstAvailable_(record, [
      'Mission_Type',
      'Research_Route',
      'Research_Objective',
      'Research_Instructions',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable_(mission, [
      'Mission_Type',
      'Research_Question',
      'Mission_Objective',
      'Research_Scope',
      'Target_Entities',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable_(requirement, [
      'Requirement_Type',
      'Intelligence_Question',
      'Knowledge_Gap',
      'Research_Direction',
      'Why_It_Matters',
      'Suggested_Sources'
    ])
  ].join(' ').toLowerCase();

  let entityType = 'UNKNOWN_ENTITY';
  let gapCategory = 'GENERAL_KNOWLEDGE_GAP';
  let missingFact = 'Missing validated intelligence required to strengthen SCIIP knowledge graph.';
  let suggestedDataSource = 'Research missions, public records, broker notes, company sources, and operator review.';
  let priority = 'MEDIUM';
  let confidence = 'MEDIUM';

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('supplier') ||
    combined.includes('oem')
  ) {
    entityType = 'COMPANY';
    gapCategory = 'COMPANY_RELATIONSHIP_OR_ACTIVITY_GAP';
    missingFact = 'Missing company, tenant, supplier, OEM relationship, activity, or expansion intelligence.';
    suggestedDataSource = 'Company websites, press releases, LinkedIn, funding announcements, broker notes, property records.';
  }

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('ownership')
  ) {
    entityType = 'PROPERTY';
    gapCategory = 'PROPERTY_ATTRIBUTE_OR_OWNERSHIP_GAP';
    missingFact = 'Missing property attribute, ownership, tenant, availability, power, yard, or building-level intelligence.';
    suggestedDataSource = 'Property registry, AIR CRE data, assessor records, broker packages, city records, owner websites.';
  }

  if (
    combined.includes('market') ||
    combined.includes('opportunity')
  ) {
    entityType = entityType === 'UNKNOWN_ENTITY' ? 'MARKET' : entityType;
    gapCategory = 'MARKET_SIGNAL_VALIDATION_GAP';
    missingFact = 'Missing validation of market signal, opportunity, demand driver, timing, affected entities, or strategic relevance.';
    suggestedDataSource = 'Briefing digests, market reports, tenant activity, broker intelligence, public announcements.';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('critical')
  ) {
    gapCategory = 'RISK_VALIDATION_GAP';
    missingFact = 'Missing risk severity, affected entities, timing, confidence, and mitigation path.';
    priority = 'HIGH';
    suggestedDataSource = 'Strategic intelligence, command brief, system health, public records, and monitoring sources.';
  }

  if (
    combined.includes('workflow') ||
    combined.includes('automation') ||
    combined.includes('autonomous') ||
    combined.includes('system')
  ) {
    entityType = 'SCIIP_SYSTEM';
    gapCategory = 'OPERATING_SYSTEM_GAP';
    missingFact = 'Missing operating-system insight about workflow friction, automation readiness, blocker pattern, or process improvement.';
    suggestedDataSource = 'WORK_QUEUE, AUTONOMOUS_OPERATIONS, SYSTEM_LEARNING, OPERATOR_CONSOLE.';
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog')
  ) {
    priority = 'HIGH';
  }

  if (
    combined.includes('unknown') ||
    combined.includes('missing') ||
    combined.includes('gap')
  ) {
    confidence = 'HIGH';
  }

  return {
    entityType,
    entityId: '',
    gapCategory,
    missingFact,
    whyItMatters: sciipInferKnowledgeGapWhyItMatters_(record, mission, requirement),
    suggestedDataSource,
    priority,
    confidence,
    discoverySource: sciipInferKnowledgeGapDiscoverySource_(record, mission, requirement)
  };
}

function sciipInferKnowledgeGapWhyItMatters_(record, mission, requirement) {
  const explicitWhy = sciipExtractFirstAvailable_(requirement, [
    'Why_It_Matters',
    'Decision_Linkage'
  ]);

  if (explicitWhy) {
    return explicitWhy;
  }

  const missionObjective = sciipExtractFirstAvailable_(mission, [
    'Mission_Objective',
    'Decision_Linkage'
  ]);

  if (missionObjective) {
    return missionObjective;
  }

  const researchObjective = sciipExtractFirstAvailable_(record, [
    'Research_Objective',
    'Expected_Output'
  ]);

  if (researchObjective) {
    return researchObjective;
  }

  return 'Closing this gap improves SCIIP confidence, strengthens the knowledge graph, and supports better strategic decisions.';
}

function sciipInferKnowledgeGapDiscoverySource_(record, mission, requirement) {
  if (record && sciipExtractFirstAvailable_(record, ['Coordination_ID'])) {
    return 'AUTONOMOUS_RESEARCH_COORDINATION';
  }

  if (mission && sciipExtractFirstAvailable_(mission, ['Research_Mission_ID'])) {
    return 'RESEARCH_MISSIONS';
  }

  if (requirement && sciipExtractFirstAvailable_(requirement, ['Requirement_ID'])) {
    return 'INTELLIGENCE_REQUIREMENTS';
  }

  return 'UNKNOWN';
}

function sciipFindMissionById_(missions, missionId) {
  if (!missionId) return null;

  return missions.find(mission =>
    sciipExtractFirstAvailable_(mission, [
      'Research_Mission_ID',
      'Mission_ID',
      'ID'
    ]) === missionId
  ) || null;
}

function sciipDeduplicateKnowledgeGapRows_(rows) {
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

function sciipTestKnowledgeGapProcessor() {
  const result = sciipRunKnowledgeGapProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeGapProcessor',
    result
  }));

  return result;
}