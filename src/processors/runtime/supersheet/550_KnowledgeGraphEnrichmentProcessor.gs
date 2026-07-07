/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 550_KnowledgeGraphEnrichmentProcessor
 *
 * KNOWLEDGE_GAPS + RESEARCH_MISSIONS +
 * AUTONOMOUS_RESEARCH_COORDINATION → KNOWLEDGE_GRAPH_ENRICHMENT
 *
 * Migration note:
 * Preserves original 550 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR = '550_KnowledgeGraphEnrichmentProcessor';
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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    KNOWLEDGE_GRAPH_ENRICHMENT_SHEET,
    KNOWLEDGE_GRAPH_ENRICHMENT_HEADERS
  );
}

function sciipRunKnowledgeGraphEnrichmentProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
    action: 'KNOWLEDGE_GRAPH_ENRICHMENT_BUILD',
    sourceSheet: 'KNOWLEDGE_GAPS',
    targetSheet: KNOWLEDGE_GRAPH_ENRICHMENT_SHEET,
    ledgerSheet: 'KNOWLEDGE_GRAPH_ENRICHMENT_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const knowledgeGaps = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('KNOWLEDGE_GAPS');
      const researchMissions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('RESEARCH_MISSIONS');
      const coordinations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_RESEARCH_COORDINATION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: knowledgeGaps.length + researchMissions.length + coordinations.length,
        outputCount: knowledgeGaps.length || researchMissions.length || coordinations.length || 1,
        summary: 'Knowledge graph enrichment runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
          inputSheets: [
            'KNOWLEDGE_GAPS',
            'RESEARCH_MISSIONS',
            'AUTONOMOUS_RESEARCH_COORDINATION'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureKnowledgeGraphEnrichmentSchema();
      const enrichmentDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const enrichmentBusinessKey = 'KNOWLEDGE_GRAPH_ENRICHMENT|' + enrichmentDate;

      if (sciipRuntimeBusinessKeyPrefixExists550_(definition.targetSheet, enrichmentBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeGraphEnrichmentsCreated: 0,
            skippedDuplicate: 1,
            enrichmentBusinessKey: enrichmentBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const knowledgeGaps = sciipGetRuntimeRecordsByDate550_(
        'KNOWLEDGE_GAPS',
        'Gap_Date',
        enrichmentDate
      );
      const researchMissions = sciipGetRuntimeRecordsByDate550_(
        'RESEARCH_MISSIONS',
        'Mission_Date',
        enrichmentDate
      );
      const coordinations = sciipGetRuntimeRecordsByDate550_(
        'AUTONOMOUS_RESEARCH_COORDINATION',
        'Coordination_Date',
        enrichmentDate
      );

      if (knowledgeGaps.length === 0 && researchMissions.length === 0 && coordinations.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeGraphEnrichmentsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const enrichmentRows = sciipCreateKnowledgeGraphEnrichments550_({
        businessKey: enrichmentBusinessKey,
        enrichmentDate: enrichmentDate,
        knowledgeGaps: knowledgeGaps,
        researchMissions: researchMissions,
        coordinations: coordinations,
        processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR
      });

      enrichmentRows.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: KNOWLEDGE_GRAPH_ENRICHMENT_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: enrichmentRows.length,
        recordsRead: knowledgeGaps.length + researchMissions.length + coordinations.length,
        processed: enrichmentRows.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          knowledgeGapsReviewed: knowledgeGaps.length,
          researchMissionsReviewed: researchMissions.length,
          researchCoordinationsReviewed: coordinations.length,
          knowledgeGraphEnrichmentsCreated: enrichmentRows.length,
          skippedDuplicate: 0,
          enrichmentBusinessKey: enrichmentBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists550_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate550_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue550_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue550_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateKnowledgeGraphEnrichments550_(args) {
  const now = new Date();

  const sourceRecords =
    args.knowledgeGaps.length > 0
      ? args.knowledgeGaps
      : args.researchMissions.length > 0
        ? args.researchMissions
        : args.coordinations;

  const rows = sourceRecords.map(record => {
    const knowledgeGapId = sciipExtractFirstAvailable550_(record, [
      'Knowledge_Gap_ID',
      'Gap_ID'
    ]);

    const researchMissionId = sciipExtractFirstAvailable550_(record, [
      'Research_Mission_ID'
    ]);

    const coordinationId = sciipExtractFirstAvailable550_(record, [
      'Coordination_ID'
    ]);

    const matchedMission =
      sciipFindMissionById550_(args.researchMissions, researchMissionId);

    const matchedCoordination =
      sciipFindCoordinationById550_(args.coordinations, coordinationId);

    const profile =
      sciipInferGraphEnrichmentProfile550_(
        record,
        matchedMission,
        matchedCoordination
      );

    const rowKey =
      `${args.businessKey}|${profile.targetEntityType}|${profile.proposedNodeType}|${sciipNormalizeMissionKey550_(knowledgeGapId || researchMissionId || coordinationId || profile.proposedPropertyUpdate)}`;

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

  return sciipDeduplicateKnowledgeGraphEnrichmentRows550_(rows);
}

function sciipInferGraphEnrichmentProfile550_(gap, mission, coordination) {
  const combined = [
    sciipExtractFirstAvailable550_(gap, [
      'Entity_Type',
      'Gap_Category',
      'Missing_Fact',
      'Why_It_Matters',
      'Suggested_Data_Source',
      'Discovery_Source'
    ]),
    sciipExtractFirstAvailable550_(mission, [
      'Mission_Type',
      'Research_Question',
      'Mission_Objective',
      'Target_Entities',
      'Expected_Output'
    ]),
    sciipExtractFirstAvailable550_(coordination, [
      'Research_Route',
      'Research_Objective',
      'Research_Instructions',
      'Expected_Output'
    ])
  ].join(' ').toLowerCase();

  let targetEntityType =
    sciipExtractFirstAvailable550_(gap, ['Entity_Type']) ||
    'UNKNOWN_ENTITY';

  let proposedNodeType = 'KNOWLEDGE_GAP';
  let proposedEdgeType = 'HAS_KNOWLEDGE_GAP';
  let targetGraphObject = 'KNOWLEDGE_GRAPH';
  let proposedPropertyUpdate =
    'Add or update graph metadata describing missing intelligence and research need.';
  let confidence =
    sciipExtractFirstAvailable550_(gap, ['Confidence']) || 'MEDIUM';

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
    targetEntityId: sciipExtractFirstAvailable550_(gap, ['Entity_ID']),
    targetGraphObject,
    proposedNodeType,
    proposedEdgeType,
    proposedPropertyUpdate,
    enrichmentRationale: sciipComposeGraphEnrichmentRationale550_(gap, mission, coordination),
    sourceRecord: sciipInferGraphEnrichmentSourceRecord550_(gap, mission, coordination),
    confidence
  };
}

function sciipComposeGraphEnrichmentRationale550_(gap, mission, coordination) {
  const parts = [];

  const missingFact = sciipExtractFirstAvailable550_(gap, [
    'Missing_Fact'
  ]);

  const why = sciipExtractFirstAvailable550_(gap, [
    'Why_It_Matters'
  ]);

  const missionObjective = sciipExtractFirstAvailable550_(mission, [
    'Mission_Objective'
  ]);

  const instructions = sciipExtractFirstAvailable550_(coordination, [
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

function sciipInferGraphEnrichmentSourceRecord550_(gap, mission, coordination) {
  const gapId = sciipExtractFirstAvailable550_(gap, [
    'Knowledge_Gap_ID'
  ]);

  if (gapId) {
    return `KNOWLEDGE_GAPS:${gapId}`;
  }

  const missionId = sciipExtractFirstAvailable550_(mission, [
    'Research_Mission_ID'
  ]);

  if (missionId) {
    return `RESEARCH_MISSIONS:${missionId}`;
  }

  const coordinationId = sciipExtractFirstAvailable550_(coordination, [
    'Coordination_ID'
  ]);

  if (coordinationId) {
    return `AUTONOMOUS_RESEARCH_COORDINATION:${coordinationId}`;
  }

  return 'UNKNOWN_SOURCE_RECORD';
}

function sciipFindCoordinationById550_(coordinations, coordinationId) {
  if (!coordinationId) return null;

  return coordinations.find(coordination =>
    sciipExtractFirstAvailable550_(coordination, [
      'Coordination_ID',
      'ID'
    ]) === coordinationId
  ) || null;
}

function sciipDeduplicateKnowledgeGraphEnrichmentRows550_(rows) {
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

function sciipExtractFirstAvailable550_(record, fieldNames) {
  if (!record) return '';
  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (record[fieldName] !== undefined && record[fieldName] !== null && record[fieldName] !== '') {
      return String(record[fieldName]);
    }
  }
  return '';
}

function sciipNormalizeMissionKey550_(value) {
  return String(value || 'MISSION')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80);
}

function sciipTestKnowledgeGraphEnrichmentProcessor() {
  const result = sciipRunKnowledgeGraphEnrichmentProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeGraphEnrichmentProcessor',
    result: result
  }));
  return result;
}
