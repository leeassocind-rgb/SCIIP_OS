/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 540_KnowledgeGapProcessor
 *
 * AUTONOMOUS_RESEARCH_COORDINATION + RESEARCH_MISSIONS
 * + INTELLIGENCE_REQUIREMENTS → KNOWLEDGE_GAPS
 *
 * Migration note:
 * Preserves original 540 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const KNOWLEDGE_GAP_PROCESSOR = '540_KnowledgeGapProcessor';
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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    KNOWLEDGE_GAPS_SHEET,
    KNOWLEDGE_GAPS_HEADERS
  );
}

function sciipRunKnowledgeGapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: KNOWLEDGE_GAP_PROCESSOR,
    action: 'KNOWLEDGE_GAPS_BUILD',
    sourceSheet: 'AUTONOMOUS_RESEARCH_COORDINATION',
    targetSheet: KNOWLEDGE_GAPS_SHEET,
    ledgerSheet: 'KNOWLEDGE_GAPS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const coordinations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_RESEARCH_COORDINATION');
      const missions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('RESEARCH_MISSIONS');
      const requirements = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('INTELLIGENCE_REQUIREMENTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: coordinations.length + missions.length + requirements.length,
        outputCount: coordinations.length || missions.length || requirements.length || 1,
        summary: 'Knowledge gap runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: KNOWLEDGE_GAP_PROCESSOR,
          inputSheets: [
            'AUTONOMOUS_RESEARCH_COORDINATION',
            'RESEARCH_MISSIONS',
            'INTELLIGENCE_REQUIREMENTS'
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
      const outputSheet = sciipEnsureKnowledgeGapsSchema();
      const gapDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const gapBusinessKey = 'KNOWLEDGE_GAPS|' + gapDate;

      if (sciipRuntimeBusinessKeyPrefixExists540_(definition.targetSheet, gapBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: KNOWLEDGE_GAP_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeGapsCreated: 0,
            skippedDuplicate: 1,
            knowledgeGapsBusinessKey: gapBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const coordinations = sciipGetRuntimeRecordsByDate540_(
        'AUTONOMOUS_RESEARCH_COORDINATION',
        'Coordination_Date',
        gapDate
      );

      const missions = sciipGetRuntimeRecordsByDate540_(
        'RESEARCH_MISSIONS',
        'Mission_Date',
        gapDate
      );

      const requirements = sciipGetRuntimeRecordsByDate540_(
        'INTELLIGENCE_REQUIREMENTS',
        'Requirement_Date',
        gapDate
      );

      if (
        coordinations.length === 0 &&
        missions.length === 0 &&
        requirements.length === 0
      ) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: KNOWLEDGE_GAP_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeGapsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const gapRows = sciipCreateKnowledgeGaps540_({
        businessKey: gapBusinessKey,
        gapDate: gapDate,
        coordinations: coordinations,
        missions: missions,
        requirements: requirements,
        processor: KNOWLEDGE_GAP_PROCESSOR
      });

      gapRows.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: KNOWLEDGE_GAP_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: gapRows.length,
        recordsRead: coordinations.length + missions.length + requirements.length,
        processed: gapRows.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          researchCoordinationsReviewed: coordinations.length,
          researchMissionsReviewed: missions.length,
          intelligenceRequirementsReviewed: requirements.length,
          knowledgeGapsCreated: gapRows.length,
          skippedDuplicate: 0,
          knowledgeGapsBusinessKey: gapBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists540_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;

  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate540_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];

  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue540_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue540_(value) {
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

function sciipCreateKnowledgeGaps540_(args) {
  const now = new Date();
  const rows = [];

  const sourceRecords =
    args.coordinations.length > 0
      ? args.coordinations
      : args.missions.length > 0
        ? args.missions
        : args.requirements;

  sourceRecords.forEach(record => {
    const coordinationId = sciipExtractFirstAvailable540_(record, [
      'Coordination_ID'
    ]);

    const missionId = sciipExtractFirstAvailable540_(record, [
      'Research_Mission_ID'
    ]);

    const requirementId = sciipExtractFirstAvailable540_(record, [
      'Requirement_ID'
    ]);

    const matchedMission =
      sciipFindMissionById540_(args.missions, missionId);

    const matchedRequirement =
      sciipFindRequirementById540_(args.requirements, requirementId);

    const gapProfile =
      sciipInferKnowledgeGapProfile540_(record, matchedMission, matchedRequirement);

    const rowBusinessKey =
      `${args.businessKey}|${gapProfile.entityType}|${gapProfile.gapCategory}|${sciipNormalizeMissionKey540_(missionId || requirementId || gapProfile.missingFact)}`;

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

  return sciipDeduplicateKnowledgeGapRows540_(rows);
}

function sciipInferKnowledgeGapProfile540_(record, mission, requirement) {
  const combined = [
    sciipExtractFirstAvailable540_(record, [
      'Mission_Type',
      'Research_Route',
      'Research_Objective',
      'Research_Instructions',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable540_(mission, [
      'Mission_Type',
      'Research_Question',
      'Mission_Objective',
      'Research_Scope',
      'Target_Entities',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable540_(requirement, [
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
    whyItMatters: sciipInferKnowledgeGapWhyItMatters540_(record, mission, requirement),
    suggestedDataSource,
    priority,
    confidence,
    discoverySource: sciipInferKnowledgeGapDiscoverySource540_(record, mission, requirement)
  };
}

function sciipInferKnowledgeGapWhyItMatters540_(record, mission, requirement) {
  const explicitWhy = sciipExtractFirstAvailable540_(requirement, [
    'Why_It_Matters',
    'Decision_Linkage'
  ]);

  if (explicitWhy) {
    return explicitWhy;
  }

  const missionObjective = sciipExtractFirstAvailable540_(mission, [
    'Mission_Objective',
    'Decision_Linkage'
  ]);

  if (missionObjective) {
    return missionObjective;
  }

  const researchObjective = sciipExtractFirstAvailable540_(record, [
    'Research_Objective',
    'Expected_Output'
  ]);

  if (researchObjective) {
    return researchObjective;
  }

  return 'Closing this gap improves SCIIP confidence, strengthens the knowledge graph, and supports better strategic decisions.';
}

function sciipInferKnowledgeGapDiscoverySource540_(record, mission, requirement) {
  if (record && sciipExtractFirstAvailable540_(record, ['Coordination_ID'])) {
    return 'AUTONOMOUS_RESEARCH_COORDINATION';
  }

  if (mission && sciipExtractFirstAvailable540_(mission, ['Research_Mission_ID'])) {
    return 'RESEARCH_MISSIONS';
  }

  if (requirement && sciipExtractFirstAvailable540_(requirement, ['Requirement_ID'])) {
    return 'INTELLIGENCE_REQUIREMENTS';
  }

  return 'UNKNOWN';
}

function sciipFindMissionById540_(missions, missionId) {
  if (!missionId) return null;

  return missions.find(mission =>
    sciipExtractFirstAvailable540_(mission, [
      'Research_Mission_ID',
      'Mission_ID',
      'ID'
    ]) === missionId
  ) || null;
}

function sciipDeduplicateKnowledgeGapRows540_(rows) {
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


function sciipFindRequirementById540_(requirements, requirementId) {
  if (!requirementId) return null;

  return requirements.find(function(requirement) {
    return sciipExtractFirstAvailable540_(requirement, [
      'Requirement_ID',
      'Intelligence_Requirement_ID',
      'ID'
    ]) === requirementId;
  }) || null;
}

function sciipNormalizeMissionKey540_(value) {
  return String(value || 'UNKNOWN')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'UNKNOWN';
}

function sciipExtractFirstAvailable540_(record, fieldNames) {
  if (!record) return '';

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    const value = record[fieldName];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return '';
}

function sciipTestKnowledgeGapProcessor() {
  const result = sciipRunKnowledgeGapProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeGapProcessor',
    result: result
  }));

  return result;
}
