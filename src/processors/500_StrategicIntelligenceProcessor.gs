/************************************************************
 * 500_StrategicIntelligenceProcessor
 * SCIIP_OS v4.0
 *
 * Inputs:
 * - SYSTEM_LEARNING
 * - COMMAND_BRIEF
 * - PLATFORM_DAILY_REPORT
 * - BRIEFING_DIGEST
 *
 * Output:
 * - STRATEGIC_INTELLIGENCE
 ************************************************************/

const STRATEGIC_INTELLIGENCE_SHEET = 'STRATEGIC_INTELLIGENCE';

const STRATEGIC_INTELLIGENCE_HEADERS = [
  'Strategic_Intelligence_ID',
  'Business_Key',
  'Intelligence_Date',
  'Intelligence_Type',
  'System_Learning_ID',
  'Command_Brief_ID',
  'Platform_Daily_Report_ID',
  'Briefing_Digest_ID',
  'Strategic_Status',
  'Strategic_Thesis',
  'Market_Intelligence',
  'Platform_Intelligence',
  'Operational_Intelligence',
  'Learning_Intelligence',
  'Strategic_Risks',
  'Strategic_Opportunities',
  'Recommended_Strategic_Actions',
  'Decision_Required',
  'Confidence',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureStrategicIntelligenceSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(STRATEGIC_INTELLIGENCE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(STRATEGIC_INTELLIGENCE_SHEET);
  }

  sheet.getRange(1, 1, 1, STRATEGIC_INTELLIGENCE_HEADERS.length)
    .setValues([STRATEGIC_INTELLIGENCE_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunStrategicIntelligenceProcessor() {
  const processor = '500_StrategicIntelligenceProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsureStrategicIntelligenceSchema();

  const systemLearning = sciipGetLatestRecordByCreatedAt_('SYSTEM_LEARNING');
  const commandBrief = sciipGetLatestRecordByCreatedAt_('COMMAND_BRIEF');
  const platformReport = sciipGetLatestRecordByCreatedAt_('PLATFORM_DAILY_REPORT');
  const briefingDigest = sciipGetLatestRecordByCreatedAt_('BRIEFING_DIGEST');

  if (!systemLearning && !commandBrief && !platformReport && !briefingDigest) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      strategicIntelligenceCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const intelligenceDate = sciipFormatDateKey_(startedAt);
  const businessKey = `STRATEGIC_INTELLIGENCE|${intelligenceDate}`;

  if (sciipBusinessKeyExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      strategicIntelligenceCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const intelligence = sciipCreateStrategicIntelligence_({
    businessKey,
    intelligenceDate,
    systemLearning,
    commandBrief,
    platformReport,
    briefingDigest,
    processor
  });

  outputSheet.appendRow(intelligence);

  const result = {
    processor,
    status: 'SUCCESS',
    strategicIntelligenceCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateStrategicIntelligence_(args) {
  const now = new Date();

  const strategicStatus = sciipInferStrategicIntelligenceStatus_({
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  const strategicThesis = sciipComposeStrategicThesis_({
    strategicStatus,
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  const marketIntelligence = sciipComposeStrategicMarketIntelligence_({
    briefingDigest: args.briefingDigest,
    platformReport: args.platformReport
  });

  const platformIntelligence = sciipComposeStrategicPlatformIntelligence_({
    platformReport: args.platformReport,
    systemLearning: args.systemLearning
  });

  const operationalIntelligence = sciipComposeStrategicOperationalIntelligence_({
    commandBrief: args.commandBrief,
    platformReport: args.platformReport
  });

  const learningIntelligence = sciipComposeStrategicLearningIntelligence_({
    systemLearning: args.systemLearning
  });

  const strategicRisks = sciipComposeStrategicRisks_({
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  const strategicOpportunities = sciipComposeStrategicOpportunities_({
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  const recommendedStrategicActions = sciipComposeRecommendedStrategicActions_({
    strategicStatus,
    strategicRisks,
    strategicOpportunities,
    operationalIntelligence,
    learningIntelligence
  });

  const decisionRequired = sciipInferStrategicDecisionRequired_({
    strategicStatus,
    strategicRisks,
    recommendedStrategicActions
  });

  const confidence = sciipInferStrategicIntelligenceConfidence_({
    systemLearning: args.systemLearning,
    commandBrief: args.commandBrief,
    platformReport: args.platformReport,
    briefingDigest: args.briefingDigest
  });

  return [
    sciipGenerateId_('SINT'),
    args.businessKey,
    args.intelligenceDate,
    'DAILY_STRATEGIC_INTELLIGENCE',
    sciipExtractFirstAvailable_(args.systemLearning, [
      'Learning_ID',
      'System_Learning_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Brief_ID',
      'Brief_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Report_ID',
      'Platform_Daily_Report_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.briefingDigest, [
      'Digest_ID',
      'Briefing_Digest_ID',
      'Record_ID',
      'ID'
    ]),
    strategicStatus,
    strategicThesis,
    marketIntelligence,
    platformIntelligence,
    operationalIntelligence,
    learningIntelligence,
    strategicRisks,
    strategicOpportunities,
    recommendedStrategicActions,
    decisionRequired,
    confidence,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferStrategicIntelligenceStatus_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.systemLearning, [
      'Learning_Status',
      'Risk_Learning',
      'Recommended_System_Adjustment'
    ]),
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Status',
      'Risks',
      'Decisions',
      'Decision_Required'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Platform_Status',
      'Key_Risks',
      'Decision_Required'
    ]),
    sciipExtractFirstAvailable_(args.briefingDigest, [
      'Briefing_Summary',
      'Market_Intelligence_Summary',
      'Executive_Summary'
    ])
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    return 'STRATEGIC_ATTENTION_REQUIRED';
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('watch') ||
    combined.includes('risk')
  ) {
    return 'STRATEGIC_WATCH';
  }

  return 'STRATEGIC_NORMAL';
}

function sciipComposeStrategicThesis_(args) {
  if (args.strategicStatus === 'STRATEGIC_ATTENTION_REQUIRED') {
    return 'SCIIP is generating strategic intelligence, but current operating signals require executive attention before expanding autonomy or increasing operating tempo.';
  }

  if (args.strategicStatus === 'STRATEGIC_WATCH') {
    return 'SCIIP is operating with usable intelligence flow, but watch items, risks, or workflow friction should remain visible in the strategic cycle.';
  }

  return 'SCIIP is operating normally and converting daily market intelligence, platform status, command intent, and system learning into durable strategic intelligence.';
}

function sciipComposeStrategicMarketIntelligence_(args) {
  const briefingSummary = sciipExtractFirstAvailable_(args.briefingDigest, [
    'Market_Intelligence_Summary',
    'Briefing_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  const platformMarketSummary = sciipExtractFirstAvailable_(args.platformReport, [
    'Market_Intelligence_Summary',
    'Executive_Summary'
  ]);

  if (briefingSummary && platformMarketSummary) {
    return `Briefing digest: ${briefingSummary}\n\nPlatform report market signal: ${platformMarketSummary}`;
  }

  if (briefingSummary) {
    return `Briefing digest: ${briefingSummary}`;
  }

  if (platformMarketSummary) {
    return `Platform report market signal: ${platformMarketSummary}`;
  }

  return 'No market intelligence digest available for this strategic cycle.';
}

function sciipComposeStrategicPlatformIntelligence_(args) {
  const platformSummary = sciipExtractFirstAvailable_(args.platformReport, [
    'Executive_Summary',
    'System_Health_Summary',
    'Work_Queue_Summary',
    'Platform_Status'
  ]);

  const learningSignal = sciipExtractFirstAvailable_(args.systemLearning, [
    'System_Improvement_Signal',
    'Recommended_System_Adjustment',
    'Operating_Lesson'
  ]);

  const parts = [];

  if (platformSummary) parts.push(`Platform condition: ${platformSummary}`);
  if (learningSignal) parts.push(`System learning signal: ${learningSignal}`);

  if (parts.length === 0) {
    parts.push('No platform intelligence signal available.');
  }

  return parts.join('\n\n');
}

function sciipComposeStrategicOperationalIntelligence_(args) {
  const commandSituation = sciipExtractFirstAvailable_(args.commandBrief, [
    'Situation',
    'Mission',
    'Execution',
    'Commander_Intent'
  ]);

  const platformActions = sciipExtractFirstAvailable_(args.platformReport, [
    'Priority_Actions',
    'Recommended_Actions',
    'Executive_Summary'
  ]);

  const parts = [];

  if (commandSituation) parts.push(`Command intelligence: ${commandSituation}`);
  if (platformActions) parts.push(`Platform execution signal: ${platformActions}`);

  if (parts.length === 0) {
    parts.push('No operational intelligence signal available.');
  }

  return parts.join('\n\n');
}

function sciipComposeStrategicLearningIntelligence_(args) {
  const learning = sciipExtractFirstAvailable_(args.systemLearning, [
    'Operating_Lesson',
    'Workflow_Improvement_Signal',
    'Risk_Learning',
    'Automation_Learning',
    'Recommended_System_Adjustment'
  ]);

  if (learning) {
    return learning;
  }

  return 'No system learning intelligence available for this cycle.';
}

function sciipComposeStrategicRisks_(args) {
  const risks = [];

  const learningRisk = sciipExtractFirstAvailable_(args.systemLearning, [
    'Risk_Learning',
    'Recommended_System_Adjustment'
  ]);

  const commandRisk = sciipExtractFirstAvailable_(args.commandBrief, [
    'Risks',
    'Decision_Required'
  ]);

  const platformRisk = sciipExtractFirstAvailable_(args.platformReport, [
    'Key_Risks',
    'Decision_Required'
  ]);

  const marketRisk = sciipExtractFirstAvailable_(args.briefingDigest, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  if (learningRisk) risks.push(`System learning: ${learningRisk}`);
  if (commandRisk) risks.push(`Command brief: ${commandRisk}`);
  if (platformRisk) risks.push(`Platform report: ${platformRisk}`);
  if (marketRisk) risks.push(`Market intelligence: ${marketRisk}`);

  if (risks.length === 0) {
    risks.push('No material strategic risks identified.');
  }

  return risks.join('\n');
}

function sciipComposeStrategicOpportunities_(args) {
  const opportunities = [];

  const marketOpportunity = sciipExtractFirstAvailable_(args.briefingDigest, [
    'Opportunities',
    'Opportunity_Summary',
    'Market_Opportunity',
    'Briefing_Summary',
    'Market_Intelligence_Summary'
  ]);

  const commandOpportunity = sciipExtractFirstAvailable_(args.commandBrief, [
    'Priority_Actions',
    'Commander_Intent',
    'Mission'
  ]);

  const learningOpportunity = sciipExtractFirstAvailable_(args.systemLearning, [
    'System_Improvement_Signal',
    'Workflow_Improvement_Signal',
    'Automation_Learning'
  ]);

  if (marketOpportunity) {
    opportunities.push(`Market opportunity signal: ${marketOpportunity}`);
  }

  if (commandOpportunity) {
    opportunities.push(`Command opportunity signal: ${commandOpportunity}`);
  }

  if (learningOpportunity) {
    opportunities.push(`Learning opportunity signal: ${learningOpportunity}`);
  }

  if (opportunities.length === 0) {
    opportunities.push('No explicit strategic opportunities identified from current inputs.');
  }

  return opportunities.join('\n');
}

function sciipComposeRecommendedStrategicActions_(args) {
  const actions = [];

  const combined = [
    args.strategicStatus,
    args.strategicRisks,
    args.strategicOpportunities,
    args.operationalIntelligence,
    args.learningIntelligence
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    actions.push('Prioritize executive review of critical operating and platform risks.');
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog')
  ) {
    actions.push('Tighten work queue escalation and require owner, blocker, and unblock condition on friction items.');
  }

  if (
    combined.includes('automation') ||
    combined.includes('autonomous')
  ) {
    actions.push('Continue maturing autonomous operations under human-review controls.');
  }

  if (
    combined.includes('market') ||
    combined.includes('opportunity')
  ) {
    actions.push('Translate market intelligence signals into prospecting, asset, or research priorities where applicable.');
  }

  if (actions.length === 0) {
    actions.push('Maintain daily strategic intelligence cadence and continue collecting learning records.');
  }

  return actions.join('\n');
}

function sciipInferStrategicDecisionRequired_(args) {
  const combined = [
    args.strategicStatus,
    args.strategicRisks,
    args.recommendedStrategicActions
  ].join(' ').toLowerCase();

  if (
    combined.includes('strategic_attention_required') ||
    combined.includes('critical') ||
    combined.includes('executive review') ||
    combined.includes('decision_required') ||
    combined.includes('blocked')
  ) {
    return 'YES';
  }

  return 'NO';
}

function sciipInferStrategicIntelligenceConfidence_(args) {
  let score = 0;

  if (args.systemLearning) score++;
  if (args.commandBrief) score++;
  if (args.platformReport) score++;
  if (args.briefingDigest) score++;

  if (score >= 4) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}

function sciipTestStrategicIntelligenceProcessor() {
  const result = sciipRunStrategicIntelligenceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestStrategicIntelligenceProcessor',
    result
  }));
  return result;
}