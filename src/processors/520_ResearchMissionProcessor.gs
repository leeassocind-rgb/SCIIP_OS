/************************************************************
 * 520_ResearchMissionProcessor
 * SCIIP_OS v4.1
 *
 * Inputs:
 * - INTELLIGENCE_REQUIREMENTS
 * - STRATEGIC_INTELLIGENCE
 *
 * Output:
 * - RESEARCH_MISSIONS
 ************************************************************/

const RESEARCH_MISSIONS_SHEET = 'RESEARCH_MISSIONS';

const RESEARCH_MISSIONS_HEADERS = [
  'Research_Mission_ID',
  'Business_Key',
  'Mission_Date',
  'Mission_Type',
  'Requirement_ID',
  'Strategic_Intelligence_ID',
  'Mission_Priority',
  'Mission_Status',
  'Research_Question',
  'Mission_Objective',
  'Research_Scope',
  'Target_Entities',
  'Suggested_Sources',
  'Expected_Output',
  'Decision_Linkage',
  'Assigned_To',
  'Human_Review_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureResearchMissionsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(RESEARCH_MISSIONS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(RESEARCH_MISSIONS_SHEET);
  }

  sheet.getRange(1, 1, 1, RESEARCH_MISSIONS_HEADERS.length)
    .setValues([RESEARCH_MISSIONS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunResearchMissionProcessor() {
  const processor = '520_ResearchMissionProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsureResearchMissionsSchema();

  const missionDate = sciipFormatDateKey_(startedAt);
  const businessKey = `RESEARCH_MISSIONS|${missionDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      researchMissionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const requirements = sciipGetRecordsByDate_(
    'INTELLIGENCE_REQUIREMENTS',
    'Requirement_Date',
    missionDate
  );

  const strategicIntelligence =
    sciipGetLatestRecordByCreatedAt_('STRATEGIC_INTELLIGENCE');

  if (requirements.length === 0 && !strategicIntelligence) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      researchMissionsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const missions = sciipCreateResearchMissions_({
    businessKey,
    missionDate,
    requirements,
    strategicIntelligence,
    processor
  });

  missions.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    researchMissionsCreated: missions.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateResearchMissions_(args) {
  const now = new Date();

  if (!args.requirements || args.requirements.length === 0) {
    return [
      sciipCreateFallbackResearchMission_(args, now)
    ];
  }

  return args.requirements.map(requirement => {
    const requirementId = sciipExtractFirstAvailable_(requirement, [
      'Requirement_ID',
      'ID'
    ]);

    const requirementType = sciipExtractFirstAvailable_(requirement, [
      'Requirement_Type'
    ]);

    const priority = sciipExtractFirstAvailable_(requirement, [
      'Priority'
    ]) || 'MEDIUM';

    const question = sciipExtractFirstAvailable_(requirement, [
      'Intelligence_Question',
      'Question'
    ]);

    const researchDirection = sciipExtractFirstAvailable_(requirement, [
      'Research_Direction',
      'Knowledge_Gap'
    ]);

    const suggestedSources = sciipExtractFirstAvailable_(requirement, [
      'Suggested_Sources'
    ]);

    const decisionLinkage = sciipExtractFirstAvailable_(requirement, [
      'Decision_Linkage'
    ]);

    const seedKey = sciipNormalizeMissionKey_(requirementType || requirementId || question);

    return [
      sciipGenerateId_('RMS'),
      `${args.businessKey}|${seedKey}`,
      args.missionDate,
      sciipMapRequirementTypeToMissionType_(requirementType),
      requirementId,
      sciipExtractFirstAvailable_(args.strategicIntelligence, [
        'Strategic_Intelligence_ID',
        'Record_ID',
        'ID'
      ]),
      priority,
      'OPEN',
      question,
      sciipComposeMissionObjective_(requirement),
      researchDirection,
      sciipInferMissionTargetEntities_(requirement, args.strategicIntelligence),
      suggestedSources,
      sciipComposeMissionExpectedOutput_(requirementType),
      decisionLinkage,
      'SCIIP_OPERATOR',
      'PENDING_OPERATOR_REVIEW',
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });
}

function sciipCreateFallbackResearchMission_(args, now) {
  return [
    sciipGenerateId_('RMS'),
    `${args.businessKey}|FALLBACK_STRATEGIC_REVIEW`,
    args.missionDate,
    'STRATEGIC_RESEARCH_MISSION',
    '',
    sciipExtractFirstAvailable_(args.strategicIntelligence, [
      'Strategic_Intelligence_ID',
      'Record_ID',
      'ID'
    ]),
    'MEDIUM',
    'OPEN',
    'What strategic intelligence from today requires further research?',
    'Review today’s strategic intelligence and identify one actionable research path.',
    sciipExtractFirstAvailable_(args.strategicIntelligence, [
      'Strategic_Thesis',
      'Strategic_Risks',
      'Strategic_Opportunities',
      'Recommended_Strategic_Actions'
    ]),
    'Market, companies, properties, tenants, ownership, and operating system signals.',
    'STRATEGIC_INTELLIGENCE, BRIEFING_DIGEST, property records, broker notes, public sources.',
    'One validated research finding or one new knowledge gap.',
    'Supports strategic intelligence validation.',
    'SCIIP_OPERATOR',
    'PENDING_OPERATOR_REVIEW',
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipMapRequirementTypeToMissionType_(requirementType) {
  const type = String(requirementType || '').toUpperCase();

  if (type.includes('MARKET')) return 'MARKET_RESEARCH_MISSION';
  if (type.includes('KNOWLEDGE_GAP')) return 'KNOWLEDGE_GAP_RESEARCH_MISSION';
  if (type.includes('OPERATING')) return 'OPERATING_SYSTEM_RESEARCH_MISSION';
  if (type.includes('RISK')) return 'RISK_RESEARCH_MISSION';
  if (type.includes('AUTONOMY')) return 'AUTONOMY_RESEARCH_MISSION';

  return 'GENERAL_RESEARCH_MISSION';
}

function sciipComposeMissionObjective_(requirement) {
  const question = sciipExtractFirstAvailable_(requirement, [
    'Intelligence_Question'
  ]);

  const why = sciipExtractFirstAvailable_(requirement, [
    'Why_It_Matters'
  ]);

  if (question && why) {
    return `Answer the intelligence question and determine whether it should update SCIIP knowledge graph or operating priorities.\n\nWhy it matters: ${why}`;
  }

  if (question) {
    return `Answer the intelligence question and determine whether it should become a knowledge graph update, work item, or monitoring requirement.`;
  }

  return 'Convert intelligence requirement into a validated research finding or durable knowledge gap.';
}

function sciipInferMissionTargetEntities_(requirement, strategicIntelligence) {
  const combined = [
    sciipExtractFirstAvailable_(requirement, [
      'Requirement_Type',
      'Intelligence_Question',
      'Knowledge_Gap',
      'Research_Direction'
    ]),
    sciipExtractFirstAvailable_(strategicIntelligence, [
      'Market_Intelligence',
      'Strategic_Opportunities',
      'Strategic_Risks'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('company') || combined.includes('tenant') || combined.includes('supplier')) {
    return 'Companies, tenants, suppliers, OEMs, and related industrial occupiers.';
  }

  if (combined.includes('property') || combined.includes('asset') || combined.includes('building')) {
    return 'Properties, assets, buildings, ownership records, and location-based market signals.';
  }

  if (combined.includes('workflow') || combined.includes('automation') || combined.includes('system')) {
    return 'SCIIP processors, workflows, queues, operating records, and automation candidates.';
  }

  if (combined.includes('risk')) {
    return 'Risk signals, affected assets, affected companies, timing, severity, and mitigation paths.';
  }

  return 'Market signals, companies, properties, relationships, and operating intelligence records.';
}

function sciipComposeMissionExpectedOutput_(requirementType) {
  const type = String(requirementType || '').toUpperCase();

  if (type.includes('KNOWLEDGE_GAP')) {
    return 'Validated missing fact, proposed knowledge graph update, or new knowledge gap record.';
  }

  if (type.includes('MARKET')) {
    return 'Validated market finding, source notes, affected entities, and recommended follow-up.';
  }

  if (type.includes('RISK')) {
    return 'Risk summary, affected entities, confidence level, and recommended monitoring or escalation.';
  }

  if (type.includes('AUTONOMY')) {
    return 'Automation readiness finding and recommendation for human-review, defer, or automate-later.';
  }

  if (type.includes('OPERATING')) {
    return 'Workflow improvement recommendation, blocker pattern, or schema enhancement.';
  }

  return 'Research finding, confidence level, source notes, and recommended next action.';
}

function sciipGetRecordsByDate_(sheetName, dateField, dateValue) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  const dateIndex = headers.indexOf(dateField);

  if (dateIndex === -1) return [];

  return values
    .slice(1)
    .filter(row => String(row[dateIndex]) === String(dateValue))
    .map(row => sciipRowToObject_(headers, row));
}

function sciipNormalizeMissionKey_(value) {
  return String(value || 'MISSION')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80);
}

function sciipTestResearchMissionProcessor() {
  const result = sciipRunResearchMissionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestResearchMissionProcessor',
    result
  }));
  return result;
}