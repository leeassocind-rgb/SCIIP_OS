/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 510_IntelligenceRequirementProcessor
 *
 * STRATEGIC_INTELLIGENCE + COMMAND_BRIEF + SYSTEM_LEARNING
 * → INTELLIGENCE_REQUIREMENTS
 *
 * Migration note:
 * Preserves original 510 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const INTELLIGENCE_REQUIREMENT_PROCESSOR = '510_IntelligenceRequirementProcessor';
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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    INTELLIGENCE_REQUIREMENTS_SHEET,
    INTELLIGENCE_REQUIREMENTS_HEADERS
  );
}

function sciipRunIntelligenceRequirementProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
    action: 'INTELLIGENCE_REQUIREMENTS_BUILD',
    sourceSheet: null,
    targetSheet: INTELLIGENCE_REQUIREMENTS_SHEET,
    ledgerSheet: 'INTELLIGENCE_REQUIREMENTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const strategicIntelligenceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_INTELLIGENCE');
      const commandBriefRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_BRIEF');
      const systemLearningRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SYSTEM_LEARNING');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount:
          strategicIntelligenceRecords.length +
          commandBriefRecords.length +
          systemLearningRecords.length,
        outputCount: 5,
        summary: 'Intelligence requirements runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
          inputSheets: [
            'STRATEGIC_INTELLIGENCE',
            'COMMAND_BRIEF',
            'SYSTEM_LEARNING'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureIntelligenceRequirementsSchema();

      const strategicIntelligence = sciipGetLatestRuntimeRecordByCreatedAt_('STRATEGIC_INTELLIGENCE');
      const commandBrief = sciipGetLatestRuntimeRecordByCreatedAt_('COMMAND_BRIEF');
      const systemLearning = sciipGetLatestRuntimeRecordByCreatedAt_('SYSTEM_LEARNING');

      if (!strategicIntelligence && !commandBrief && !systemLearning) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            intelligenceRequirementsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const requirementDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const intelligenceRequirementsBusinessKey = 'INTELLIGENCE_REQUIREMENTS|' + requirementDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        intelligenceRequirementsBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 3,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            intelligenceRequirementsCreated: 0,
            skippedDuplicate: 1,
            intelligenceRequirementsBusinessKey: intelligenceRequirementsBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const requirements = sciipCreateIntelligenceRequirements_({
        businessKey: intelligenceRequirementsBusinessKey,
        requirementDate: requirementDate,
        strategicIntelligence: strategicIntelligence,
        commandBrief: commandBrief,
        systemLearning: systemLearning,
        processor: INTELLIGENCE_REQUIREMENT_PROCESSOR
      });

      requirements.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: INTELLIGENCE_REQUIREMENT_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: requirements.length,
        recordsRead: 3,
        processed: requirements.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          strategicIntelligenceFound: !!strategicIntelligence,
          commandBriefFound: !!commandBrief,
          systemLearningFound: !!systemLearning,
          intelligenceRequirementsCreated: requirements.length,
          skippedDuplicate: 0,
          intelligenceRequirementsBusinessKey: intelligenceRequirementsBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
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

  return requirementSeeds.map(function(seed) {
    return [
      sciipGenerateId_('IRQ'),
      args.businessKey + '|' + seed.key,
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
    ];
  });
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
    result: result
  }));
  return result;
}

function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record) return '';

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
      return String(record[fieldName]);
    }
  }

  return '';
}
