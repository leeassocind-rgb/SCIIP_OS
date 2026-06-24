/************************************************************
 * 530_AutonomousResearchCoordinatorProcessor
 * SCIIP_OS v4.1
 *
 * Inputs:
 * - RESEARCH_MISSIONS
 * - INTELLIGENCE_REQUIREMENTS
 *
 * Output:
 * - AUTONOMOUS_RESEARCH_COORDINATION
 ************************************************************/

const AUTONOMOUS_RESEARCH_COORDINATION_SHEET =
  'AUTONOMOUS_RESEARCH_COORDINATION';

const AUTONOMOUS_RESEARCH_COORDINATION_HEADERS = [
  'Coordination_ID',
  'Business_Key',
  'Coordination_Date',
  'Coordination_Type',
  'Research_Mission_ID',
  'Requirement_ID',
  'Mission_Type',
  'Mission_Priority',
  'Coordination_Status',
  'Research_Route',
  'Research_Objective',
  'Research_Instructions',
  'Suggested_Sources',
  'Expected_Output',
  'Duplicate_Risk',
  'Human_Review_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousResearchCoordinationSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_RESEARCH_COORDINATION_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_RESEARCH_COORDINATION_SHEET);
  }

  sheet.getRange(1, 1, 1, AUTONOMOUS_RESEARCH_COORDINATION_HEADERS.length)
    .setValues([AUTONOMOUS_RESEARCH_COORDINATION_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunAutonomousResearchCoordinatorProcessor() {
  const processor = '530_AutonomousResearchCoordinatorProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureAutonomousResearchCoordinationSchema();

  const coordinationDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `AUTONOMOUS_RESEARCH_COORDINATION|${coordinationDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      researchCoordinationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const missions = sciipGetRecordsByDate_(
    'RESEARCH_MISSIONS',
    'Mission_Date',
    coordinationDate
  );

  const requirements = sciipGetRecordsByDate_(
    'INTELLIGENCE_REQUIREMENTS',
    'Requirement_Date',
    coordinationDate
  );

  if (missions.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_RESEARCH_MISSIONS',
      researchCoordinationsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const coordinationRows =
    sciipCreateAutonomousResearchCoordinations_({
      businessKey,
      coordinationDate,
      missions,
      requirements,
      processor
    });

  coordinationRows.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    researchCoordinationsCreated: coordinationRows.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateAutonomousResearchCoordinations_(args) {
  const now = new Date();

  return args.missions.map(mission => {
    const missionId = sciipExtractFirstAvailable_(mission, [
      'Research_Mission_ID',
      'Mission_ID',
      'Record_ID',
      'ID'
    ]);

    const requirementId = sciipExtractFirstAvailable_(mission, [
      'Requirement_ID'
    ]);

    const missionType = sciipExtractFirstAvailable_(mission, [
      'Mission_Type'
    ]);

    const missionPriority = sciipExtractFirstAvailable_(mission, [
      'Mission_Priority',
      'Priority'
    ]) || 'MEDIUM';

    const matchedRequirement =
      sciipFindRequirementById_(args.requirements, requirementId);

    const researchRoute =
      sciipInferResearchRoute_(missionType, mission, matchedRequirement);

    const duplicateRisk =
      sciipInferResearchDuplicateRisk_(mission, args.missions);

    return [
      sciipGenerateId_('ARC'),
      `${args.businessKey}|${sciipNormalizeMissionKey_(missionId || missionType)}`,
      args.coordinationDate,
      'DAILY_RESEARCH_COORDINATION',
      missionId,
      requirementId,
      missionType,
      missionPriority,
      'QUEUED_FOR_RESEARCH',
      researchRoute,
      sciipExtractFirstAvailable_(mission, [
        'Mission_Objective',
        'Research_Question'
      ]),
      sciipComposeResearchInstructions_({
        mission,
        matchedRequirement,
        researchRoute
      }),
      sciipExtractFirstAvailable_(mission, [
        'Suggested_Sources'
      ]),
      sciipExtractFirstAvailable_(mission, [
        'Expected_Output'
      ]),
      duplicateRisk,
      'PENDING_OPERATOR_REVIEW',
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });
}

function sciipFindRequirementById_(requirements, requirementId) {
  if (!requirementId) return null;

  return requirements.find(req =>
    sciipExtractFirstAvailable_(req, [
      'Requirement_ID',
      'ID'
    ]) === requirementId
  ) || null;
}

function sciipInferResearchRoute_(missionType, mission, requirement) {
  const combined = [
    missionType,
    sciipExtractFirstAvailable_(mission, [
      'Research_Question',
      'Mission_Objective',
      'Research_Scope',
      'Target_Entities'
    ]),
    sciipExtractFirstAvailable_(requirement, [
      'Requirement_Type',
      'Knowledge_Gap',
      'Research_Direction'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('market')) {
    return 'MARKET_RESEARCH_ROUTE';
  }

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('supplier') ||
    combined.includes('oem')
  ) {
    return 'COMPANY_ENTITY_RESEARCH_ROUTE';
  }

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('ownership')
  ) {
    return 'PROPERTY_ENTITY_RESEARCH_ROUTE';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('critical')
  ) {
    return 'RISK_RESEARCH_ROUTE';
  }

  if (
    combined.includes('workflow') ||
    combined.includes('system') ||
    combined.includes('automation') ||
    combined.includes('autonomous')
  ) {
    return 'OPERATING_SYSTEM_RESEARCH_ROUTE';
  }

  return 'GENERAL_RESEARCH_ROUTE';
}

function sciipComposeResearchInstructions_(args) {
  const question = sciipExtractFirstAvailable_(args.mission, [
    'Research_Question'
  ]);

  const scope = sciipExtractFirstAvailable_(args.mission, [
    'Research_Scope'
  ]);

  const targetEntities = sciipExtractFirstAvailable_(args.mission, [
    'Target_Entities'
  ]);

  const requirementGap = sciipExtractFirstAvailable_(args.matchedRequirement, [
    'Knowledge_Gap'
  ]);

  const parts = [];

  parts.push(`Route: ${args.researchRoute}.`);

  if (question) {
    parts.push(`Answer this question: ${question}`);
  }

  if (scope) {
    parts.push(`Research scope: ${scope}`);
  }

  if (targetEntities) {
    parts.push(`Target entities: ${targetEntities}`);
  }

  if (requirementGap) {
    parts.push(`Knowledge gap to resolve: ${requirementGap}`);
  }

  parts.push(
    'Do not overwrite existing knowledge. Produce source-backed findings, confidence level, affected entities, and recommended next action.'
  );

  return parts.join('\n');
}

function sciipInferResearchDuplicateRisk_(mission, allMissions) {
  const missionQuestion = sciipNormalizeComparisonText_(
    sciipExtractFirstAvailable_(mission, [
      'Research_Question',
      'Mission_Objective'
    ])
  );

  if (!missionQuestion) return 'UNKNOWN';

  const similarCount = allMissions.filter(other => {
    const otherQuestion = sciipNormalizeComparisonText_(
      sciipExtractFirstAvailable_(other, [
        'Research_Question',
        'Mission_Objective'
      ])
    );

    return otherQuestion === missionQuestion;
  }).length;

  if (similarCount > 1) {
    return 'POSSIBLE_DUPLICATE';
  }

  return 'LOW';
}

function sciipNormalizeComparisonText_(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function sciipTestAutonomousResearchCoordinatorProcessor() {
  const result =
    sciipRunAutonomousResearchCoordinatorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousResearchCoordinatorProcessor',
    result
  }));

  return result;
}