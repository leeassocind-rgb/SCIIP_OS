/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 520_ResearchMissionProcessor
 *
 * INTELLIGENCE_REQUIREMENTS + STRATEGIC_INTELLIGENCE
 * → RESEARCH_MISSIONS
 *
 * Migration note:
 * Preserves original 520 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const RESEARCH_MISSION_PROCESSOR = '520_ResearchMissionProcessor';
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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    RESEARCH_MISSIONS_SHEET,
    RESEARCH_MISSIONS_HEADERS
  );
}

function sciipRunResearchMissionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: RESEARCH_MISSION_PROCESSOR,
    action: 'RESEARCH_MISSIONS_BUILD',
    sourceSheet: 'INTELLIGENCE_REQUIREMENTS',
    targetSheet: RESEARCH_MISSIONS_SHEET,
    ledgerSheet: 'RESEARCH_MISSIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const requirements = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('INTELLIGENCE_REQUIREMENTS');
      const strategicIntelligenceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_INTELLIGENCE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: requirements.length + strategicIntelligenceRecords.length,
        outputCount: requirements.length || 1,
        summary: 'Research missions runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: RESEARCH_MISSION_PROCESSOR,
          inputSheets: [
            'INTELLIGENCE_REQUIREMENTS',
            'STRATEGIC_INTELLIGENCE'
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
      const outputSheet = sciipEnsureResearchMissionsSchema();
      const missionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const researchMissionsBusinessKey = 'RESEARCH_MISSIONS|' + missionDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        researchMissionsBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: RESEARCH_MISSION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            researchMissionsCreated: 0,
            skippedDuplicate: 1,
            researchMissionsBusinessKey: researchMissionsBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const requirements = sciipGetRuntimeRecordsByDate_(
        'INTELLIGENCE_REQUIREMENTS',
        'Requirement_Date',
        missionDate
      );

      const strategicIntelligence = sciipGetLatestRuntimeRecordByCreatedAt_('STRATEGIC_INTELLIGENCE');

      if (requirements.length === 0 && !strategicIntelligence) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: RESEARCH_MISSION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            researchMissionsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const missions = sciipCreateResearchMissions_({
        businessKey: researchMissionsBusinessKey,
        missionDate: missionDate,
        requirements: requirements,
        strategicIntelligence: strategicIntelligence,
        processor: RESEARCH_MISSION_PROCESSOR
      });

      missions.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: RESEARCH_MISSION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: missions.length,
        recordsRead: requirements.length + (strategicIntelligence ? 1 : 0),
        processed: missions.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          intelligenceRequirementsReviewed: requirements.length,
          strategicIntelligenceFound: !!strategicIntelligence,
          researchMissionsCreated: missions.length,
          skippedDuplicate: 0,
          researchMissionsBusinessKey: researchMissionsBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetRuntimeRecordsByDate_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];

  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(
      value,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(
      parsed,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  }

  return text;
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


function sciipTestResearchMissionProcessor() {
  const result = sciipRunResearchMissionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestResearchMissionProcessor',
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
