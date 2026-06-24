/************************************************************
 * 510_IntelligenceRequirementProcessor
 * SCIIP_OS v4.1
 *
 * Inputs:
 * - STRATEGIC_INTELLIGENCE
 * - COMMAND_BRIEF
 * - SYSTEM_LEARNING
 *
 * Output:
 * - INTELLIGENCE_REQUIREMENTS
 ************************************************************/

const INTELLIGENCE_REQUIREMENTS_SHEET = 'INTELLIGENCE_REQUIREMENTS';

const INTELLIGENCE_REQUIREMENTS_HEADERS = [
  'Requirement_ID',
  'Business_Key',
  'Requirement_Date',
  'Requirement_Type',
  'Strategic_Intelligence_ID',
  'Command_Brief_ID',
  'System_Learning_ID',
  'Priority',
  'Requirement_Status',
  'Intelligence_Question',
  'Why_It_Matters',
  'Knowledge_Gap',
  'Research_Direction',
  'Suggested_Sources',
  'Decision_Linkage',
  'Operator_Action',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureIntelligenceRequirementsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(INTELLIGENCE_REQUIREMENTS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(INTELLIGENCE_REQUIREMENTS_SHEET);
  }

  sheet.getRange(1, 1, 1, INTELLIGENCE_REQUIREMENTS_HEADERS.length)
    .setValues([INTELLIGENCE_REQUIREMENTS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunIntelligenceRequirementProcessor() {
  const processor = '510_IntelligenceRequirementProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsureIntelligenceRequirementsSchema();

  const strategicIntelligence = sciipGetLatestRecordByCreatedAt_('STRATEGIC_INTELLIGENCE');
  const commandBrief = sciipGetLatestRecordByCreatedAt_('COMMAND_BRIEF');
  const systemLearning = sciipGetLatestRecordByCreatedAt_('SYSTEM_LEARNING');

  if (!strategicIntelligence && !commandBrief && !systemLearning) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      intelligenceRequirementsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const requirementDate = sciipFormatDateKey_(startedAt);
  const businessKey = `INTELLIGENCE_REQUIREMENTS|${requirementDate}`;

  if (sciipBusinessKeyExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      intelligenceRequirementsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const requirements = sciipCreateIntelligenceRequirements_({
    businessKey,
    requirementDate,
    strategicIntelligence,
    commandBrief,
    systemLearning,
    processor
  });

  requirements.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    intelligenceRequirementsCreated: requirements.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateIntelligenceRequirements_(args) {
  const now = new Date();

  const strategicText = [
    sciipExtractFirstAvailable_(args.strategicIntelligence, [
      'Strategic_Thesis',
      'Market_Intelligence',
      'Platform_Intelligence',
      'Operational_Intelligence',
      'Strategic_Risks',
      'Strategic_Opportunities',
      'Recommended_Strategic_Actions'
    ]),
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Situation',
      'Mission',
      'Execution',
      'Risks',
      'Decisions',
      'Commander_Intent'
    ]),
    sciipExtractFirstAvailable_(args.systemLearning, [
      'Operating_Lesson',
      'System_Improvement_Signal',
      'Workflow_Improvement_Signal',
      'Risk_Learning',
      'Automation_Learning'
    ])
  ].join('\n').toLowerCase();

  const requirementSeeds = sciipGenerateRequirementSeeds_(strategicText);

  return requirementSeeds.map(seed => [
    sciipGenerateId_('IRQ'),
    `${args.businessKey}|${seed.key}`,
    args.requirementDate,
    seed.type,
    sciipExtractFirstAvailable_(args.strategicIntelligence, [
      'Strategic_Intelligence_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Brief_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.systemLearning, [
      'Learning_ID',
      'System_Learning_ID',
      'Record_ID',
      'ID'
    ]),
    seed.priority,
    'OPEN',
    seed.question,
    seed.why,
    seed.gap,
    seed.direction,
    seed.sources,
    seed.decisionLinkage,
    seed.operatorAction,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ]);
}

function sciipGenerateRequirementSeeds_(text) {
  const seeds = [];

  seeds.push({
    key: 'MARKET_SIGNAL',
    type: 'MARKET_INTELLIGENCE_REQUIREMENT',
    priority: text.includes('market') || text.includes('opportunity') ? 'HIGH' : 'MEDIUM',
    question: 'What market signals require deeper research or validation today?',
    why: 'SCIIP should convert daily intelligence into specific market questions instead of passive reporting.',
    gap: 'Unvalidated market movement, company activity, tenant demand, capital activity, or asset-level implications.',
    direction: 'Review recent market intelligence, company activity, tenant movement, property events, and strategic opportunities.',
    sources: 'Briefing digests, broker notes, AIR CRE data, company announcements, city records, property records, news sources.',
    decisionLinkage: 'Supports prospecting, asset prioritization, landlord strategy, and research focus.',
    operatorAction: 'Review and convert the strongest market signal into a research mission.'
  });

  seeds.push({
    key: 'KNOWLEDGE_GAP',
    type: 'KNOWLEDGE_GAP_REQUIREMENT',
    priority: text.includes('gap') || text.includes('missing') || text.includes('unknown') ? 'HIGH' : 'MEDIUM',
    question: 'What does SCIIP not know yet that would improve the knowledge graph?',
    why: 'The platform becomes more valuable when uncertainty is converted into explicit research requirements.',
    gap: 'Missing company, property, ownership, tenant, supplier, relationship, timing, or confidence data.',
    direction: 'Identify missing facts that prevent stronger property, company, or market conclusions.',
    sources: 'Property registry, company registry, relationship tables, public records, news, broker intelligence, operator notes.',
    decisionLinkage: 'Improves confidence scoring and prevents weak assumptions from becoming permanent intelligence.',
    operatorAction: 'Select one missing data category and assign it to a research mission.'
  });

  seeds.push({
    key: 'WORKFLOW_FRICTION',
    type: 'OPERATING_SYSTEM_REQUIREMENT',
    priority: text.includes('blocked') || text.includes('overdue') || text.includes('backlog') ? 'HIGH' : 'LOW',
    question: 'Which workflow friction points should be corrected before the next operating cycle?',
    why: 'SCIIP must learn from operational friction and improve its own execution loop.',
    gap: 'Unclear owners, blockers, next actions, escalation logic, or automation readiness.',
    direction: 'Analyze work queue, autonomous operations, system learning, and command brief friction signals.',
    sources: 'WORK_QUEUE, AUTONOMOUS_OPERATIONS, SYSTEM_LEARNING, COMMAND_BRIEF.',
    decisionLinkage: 'Supports better execution discipline and reduces repeated operator intervention.',
    operatorAction: 'If friction exists, create a corrective execution task or schema improvement.'
  });

  seeds.push({
    key: 'STRATEGIC_RISK',
    type: 'STRATEGIC_RISK_REQUIREMENT',
    priority: text.includes('risk') || text.includes('critical') || text.includes('attention_required') ? 'HIGH' : 'MEDIUM',
    question: 'What strategic risk should SCIIP monitor or investigate next?',
    why: 'Strategic risks need to be tracked as durable intelligence requirements, not buried inside daily reports.',
    gap: 'Unconfirmed risk severity, affected assets, affected companies, timing, exposure, or mitigation path.',
    direction: 'Review strategic risks, command decisions, platform risks, and market intelligence warning signals.',
    sources: 'STRATEGIC_INTELLIGENCE, COMMAND_BRIEF, PLATFORM_DAILY_REPORT, SYSTEM_HEALTH, market sources.',
    decisionLinkage: 'Supports executive awareness, landlord advisory, and proactive market positioning.',
    operatorAction: 'Escalate high-priority risk into a research mission or monitoring item.'
  });

  seeds.push({
    key: 'AUTONOMY_IMPROVEMENT',
    type: 'AUTONOMY_REQUIREMENT',
    priority: text.includes('automation') || text.includes('autonomous') ? 'MEDIUM' : 'LOW',
    question: 'What should SCIIP learn before increasing autonomous execution?',
    why: 'Autonomy should expand only where the system has confidence, clear inputs, and human-review controls.',
    gap: 'Insufficient evidence about which tasks are safe to automate, require review, or should remain manual.',
    direction: 'Review system learning, autonomous operations, operator actions, and recurring task patterns.',
    sources: 'AUTONOMOUS_OPERATIONS, SYSTEM_LEARNING, WORK_QUEUE, OPERATOR_CONSOLE.',
    decisionLinkage: 'Supports safe expansion from reporting automation to controlled operational automation.',
    operatorAction: 'Identify one repeatable task that may become automation-ready after additional validation.'
  });

  return seeds;
}

function sciipTestIntelligenceRequirementProcessor() {
  const result = sciipRunIntelligenceRequirementProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestIntelligenceRequirementProcessor',
    result
  }));
  return result;
}