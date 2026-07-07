/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 560_HypothesisGenerationProcessor
 *
 * KNOWLEDGE_GRAPH_ENRICHMENT + KNOWLEDGE_GAPS +
 * STRATEGIC_INTELLIGENCE → HYPOTHESES
 *
 * Migration note:
 * Preserves original 560 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const HYPOTHESIS_GENERATION_PROCESSOR = '560_HypothesisGenerationProcessor';
const HYPOTHESES_SHEET = 'HYPOTHESES';

const HYPOTHESES_HEADERS = [
  'Hypothesis_ID',
  'Business_Key',
  'Hypothesis_Date',
  'Hypothesis_Type',
  'Hypothesis_Title',
  'Hypothesis_Statement',
  'Testable_Question',
  'Strategic_Intelligence_ID',
  'Knowledge_Gap_ID',
  'Enrichment_ID',
  'Target_Entity_Type',
  'Target_Entity_ID',
  'Target_Graph_Object',
  'Source_Record',
  'Evidence_Basis',
  'Confidence',
  'Validation_Priority',
  'Validation_Status',
  'Recommended_Validation_Action',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureHypothesesSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    HYPOTHESES_SHEET,
    HYPOTHESES_HEADERS
  );
}

function sciipRunHypothesisGenerationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: HYPOTHESIS_GENERATION_PROCESSOR,
    action: 'HYPOTHESES_BUILD',
    sourceSheet: 'KNOWLEDGE_GRAPH_ENRICHMENT',
    targetSheet: HYPOTHESES_SHEET,
    ledgerSheet: 'HYPOTHESES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const enrichments = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('KNOWLEDGE_GRAPH_ENRICHMENT');
      const knowledgeGaps = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('KNOWLEDGE_GAPS');
      const strategicIntelligence = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_INTELLIGENCE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: enrichments.length + knowledgeGaps.length + strategicIntelligence.length,
        outputCount: enrichments.length || knowledgeGaps.length || strategicIntelligence.length || 1,
        summary: 'Hypothesis generation runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: HYPOTHESIS_GENERATION_PROCESSOR,
          inputSheets: [
            'KNOWLEDGE_GRAPH_ENRICHMENT',
            'KNOWLEDGE_GAPS',
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
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureHypothesesSchema();
      const hypothesisDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const hypothesisBusinessKey = 'HYPOTHESIS|' + hypothesisDate;

      if (sciipRuntimeBusinessKeyPrefixExists560_(definition.targetSheet, hypothesisBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: HYPOTHESIS_GENERATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            hypothesesCreated: 0,
            skippedDuplicate: 1,
            hypothesisBusinessKey: hypothesisBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const enrichments = sciipGetRuntimeRecordsByDate560_(
        'KNOWLEDGE_GRAPH_ENRICHMENT',
        'Enrichment_Date',
        hypothesisDate
      );
      const knowledgeGaps = sciipGetRuntimeRecordsByDate560_(
        'KNOWLEDGE_GAPS',
        'Gap_Date',
        hypothesisDate
      );
      const strategicIntelligence = sciipGetRuntimeRecordsByDate560_(
        'STRATEGIC_INTELLIGENCE',
        'Strategic_Intelligence_Date',
        hypothesisDate
      );

      if (enrichments.length === 0 && knowledgeGaps.length === 0 && strategicIntelligence.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: HYPOTHESIS_GENERATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            hypothesesCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const hypothesisRows = sciipCreateHypotheses560_({
        businessKey: hypothesisBusinessKey,
        hypothesisDate: hypothesisDate,
        enrichments: enrichments,
        knowledgeGaps: knowledgeGaps,
        strategicIntelligence: strategicIntelligence,
        processor: HYPOTHESIS_GENERATION_PROCESSOR
      });

      hypothesisRows.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: HYPOTHESIS_GENERATION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: hypothesisRows.length,
        recordsRead: enrichments.length + knowledgeGaps.length + strategicIntelligence.length,
        processed: hypothesisRows.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          enrichmentsReviewed: enrichments.length,
          knowledgeGapsReviewed: knowledgeGaps.length,
          strategicIntelligenceReviewed: strategicIntelligence.length,
          hypothesesCreated: hypothesisRows.length,
          skippedDuplicate: 0,
          hypothesisBusinessKey: hypothesisBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists560_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate560_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue560_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue560_(value) {
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

function sciipExtractFirstAvailable560_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey560_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateHypotheses560_(args) {
  const now = new Date();

  const sourceRecords =
    args.enrichments.length > 0
      ? args.enrichments
      : args.knowledgeGaps.length > 0
        ? args.knowledgeGaps
        : args.strategicIntelligence;

  const rows = sourceRecords.map(record => {
    const enrichmentId = sciipExtractFirstAvailable560_(record, [
      'Enrichment_ID',
      'Knowledge_Graph_Enrichment_ID'
    ]);

    const knowledgeGapId = sciipExtractFirstAvailable560_(record, [
      'Knowledge_Gap_ID',
      'Gap_ID'
    ]);

    const strategicIntelligenceId = sciipExtractFirstAvailable560_(record, [
      'Strategic_Intelligence_ID',
      'Intelligence_ID'
    ]);

    const matchedGap = sciipFindKnowledgeGapById560_(
      args.knowledgeGaps,
      knowledgeGapId
    );

    const matchedStrategicIntelligence = sciipFindStrategicIntelligenceById560_(
      args.strategicIntelligence,
      strategicIntelligenceId
    );

    const profile = sciipInferHypothesisProfile560_(
      record,
      matchedGap,
      matchedStrategicIntelligence
    );

    const rowKey =
      `${args.businessKey}|${profile.hypothesisType}|${profile.targetEntityType}|${sciipNormalizeMissionKey560_(enrichmentId || knowledgeGapId || strategicIntelligenceId || profile.hypothesisTitle)}`;

    return [
      sciipGenerateId_('HYP'),
      rowKey,
      args.hypothesisDate,
      profile.hypothesisType,
      profile.hypothesisTitle,
      profile.hypothesisStatement,
      profile.testableQuestion,
      strategicIntelligenceId,
      knowledgeGapId,
      enrichmentId,
      profile.targetEntityType,
      profile.targetEntityId,
      profile.targetGraphObject,
      profile.sourceRecord,
      profile.evidenceBasis,
      profile.confidence,
      profile.validationPriority,
      'UNVALIDATED',
      profile.recommendedValidationAction,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisRows560_(rows);
}

function sciipInferHypothesisProfile560_(record, gap, strategicIntelligence) {
  const combined = [
    sciipExtractFirstAvailable560_(record, [
      'Enrichment_Type',
      'Target_Entity_Type',
      'Target_Graph_Object',
      'Proposed_Node_Type',
      'Proposed_Edge_Type',
      'Proposed_Property_Update',
      'Enrichment_Rationale',
      'Source_Record'
    ]),
    sciipExtractFirstAvailable560_(gap, [
      'Entity_Type',
      'Gap_Category',
      'Missing_Fact',
      'Why_It_Matters',
      'Suggested_Data_Source',
      'Discovery_Source'
    ]),
    sciipExtractFirstAvailable560_(strategicIntelligence, [
      'Strategic_Theme',
      'Strategic_Intelligence_Summary',
      'Intelligence_Summary',
      'Signal_Type',
      'Recommended_Action'
    ])
  ].join(' ').toLowerCase();

  let hypothesisType = 'MARKET_HYPOTHESIS';
  let targetEntityType =
    sciipExtractFirstAvailable560_(record, ['Target_Entity_Type']) ||
    sciipExtractFirstAvailable560_(gap, ['Entity_Type']) ||
    'MARKET';

  let targetEntityId =
    sciipExtractFirstAvailable560_(record, ['Target_Entity_ID']) ||
    sciipExtractFirstAvailable560_(gap, ['Entity_ID']);

  let targetGraphObject =
    sciipExtractFirstAvailable560_(record, ['Target_Graph_Object']) ||
    'MARKET_INTELLIGENCE_GRAPH';

  let confidence =
    sciipExtractFirstAvailable560_(record, ['Confidence']) ||
    sciipExtractFirstAvailable560_(gap, ['Confidence']) ||
    'MEDIUM';

  let validationPriority = 'MEDIUM';

  if (
    combined.includes('property') ||
    combined.includes('asset') ||
    combined.includes('building') ||
    combined.includes('parcel') ||
    combined.includes('ownership') ||
    combined.includes('yard') ||
    combined.includes('power')
  ) {
    hypothesisType = 'PROPERTY_HYPOTHESIS';
    targetEntityType = 'PROPERTY';
    targetGraphObject = 'PROPERTY_KNOWLEDGE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('company') ||
    combined.includes('tenant') ||
    combined.includes('occupier') ||
    combined.includes('supplier') ||
    combined.includes('oem') ||
    combined.includes('manufacturer')
  ) {
    hypothesisType = 'COMPANY_HYPOTHESIS';
    targetEntityType = 'COMPANY';
    targetGraphObject = 'COMPANY_KNOWLEDGE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('risk') ||
    combined.includes('threat') ||
    combined.includes('constraint') ||
    combined.includes('exposure') ||
    combined.includes('delay') ||
    combined.includes('critical')
  ) {
    hypothesisType = 'RISK_HYPOTHESIS';
    targetGraphObject = 'RISK_INTELLIGENCE_GRAPH';
    validationPriority = 'HIGH';
    confidence = confidence === 'LOW' ? 'MEDIUM' : confidence;
  }

  if (
    combined.includes('opportunity') ||
    combined.includes('growth') ||
    combined.includes('expansion') ||
    combined.includes('demand') ||
    combined.includes('advantage') ||
    combined.includes('signal')
  ) {
    hypothesisType = 'OPPORTUNITY_HYPOTHESIS';
    targetGraphObject = 'OPPORTUNITY_INTELLIGENCE_GRAPH';
    validationPriority = 'HIGH';
  }

  if (
    combined.includes('workflow') ||
    combined.includes('automation') ||
    combined.includes('processor') ||
    combined.includes('pipeline') ||
    combined.includes('system') ||
    combined.includes('knowledge graph')
  ) {
    hypothesisType = 'OPERATING_SYSTEM_HYPOTHESIS';
    targetEntityType = 'SCIIP_SYSTEM';
    targetGraphObject = 'SCIIP_OPERATING_GRAPH';
    validationPriority = 'MEDIUM';
  }

  const evidenceBasis = sciipComposeHypothesisEvidenceBasis560_(
    record,
    gap,
    strategicIntelligence
  );

  const hypothesisTitle =
    sciipComposeHypothesisTitle560_(
      hypothesisType,
      targetEntityType,
      targetEntityId
    );

  return {
    hypothesisType,
    hypothesisTitle,
    hypothesisStatement: sciipComposeHypothesisStatement560_(
      hypothesisType,
      targetEntityType,
      targetEntityId,
      evidenceBasis
    ),
    testableQuestion: sciipComposeTestableQuestion560_(
      hypothesisType,
      targetEntityType,
      targetEntityId
    ),
    targetEntityType,
    targetEntityId,
    targetGraphObject,
    sourceRecord: sciipInferHypothesisSourceRecord560_(record, gap, strategicIntelligence),
    evidenceBasis,
    confidence,
    validationPriority,
    recommendedValidationAction:
      sciipRecommendHypothesisValidationAction560_(hypothesisType)
  };
}

function sciipComposeHypothesisTitle560_(type, entityType, entityId) {
  const subject = entityId || entityType || 'MARKET_SIGNAL';
  return `${type}: ${subject}`;
}

function sciipComposeHypothesisStatement560_(type, entityType, entityId, evidenceBasis) {
  const subject = entityId || entityType || 'the observed market signal';

  return `SCIIP hypothesizes that ${subject} represents a testable ${type.toLowerCase().replace(/_/g, ' ')} based on linked intelligence, knowledge gaps, and graph enrichment evidence.\n\nEvidence basis: ${evidenceBasis}`;
}

function sciipComposeTestableQuestion560_(type, entityType, entityId) {
  const subject = entityId || entityType || 'this signal';

  if (type === 'PROPERTY_HYPOTHESIS') {
    return `Can property-level evidence confirm that ${subject} has materially relevant industrial market characteristics?`;
  }

  if (type === 'COMPANY_HYPOTHESIS') {
    return `Can company-level evidence confirm that ${subject} has a current or emerging real estate requirement?`;
  }

  if (type === 'RISK_HYPOTHESIS') {
    return `Can additional evidence confirm that ${subject} presents a measurable market, property, company, or operating risk?`;
  }

  if (type === 'OPPORTUNITY_HYPOTHESIS') {
    return `Can additional evidence confirm that ${subject} represents an actionable industrial market opportunity?`;
  }

  if (type === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return `Can SCIIP workflow evidence confirm that ${subject} should change processor logic, graph structure, or operating behavior?`;
  }

  return `Can additional market evidence confirm that ${subject} reflects a broader industrial market pattern?`;
}

function sciipComposeHypothesisEvidenceBasis560_(record, gap, strategicIntelligence) {
  const parts = [];

  const enrichmentRationale = sciipExtractFirstAvailable560_(record, [
    'Enrichment_Rationale'
  ]);

  const proposedUpdate = sciipExtractFirstAvailable560_(record, [
    'Proposed_Property_Update'
  ]);

  const missingFact = sciipExtractFirstAvailable560_(gap, [
    'Missing_Fact'
  ]);

  const whyItMatters = sciipExtractFirstAvailable560_(gap, [
    'Why_It_Matters'
  ]);

  const strategicSummary = sciipExtractFirstAvailable560_(strategicIntelligence, [
    'Strategic_Intelligence_Summary',
    'Intelligence_Summary',
    'Strategic_Theme'
  ]);

  if (enrichmentRationale) {
    parts.push(`Graph enrichment rationale: ${enrichmentRationale}`);
  }

  if (proposedUpdate) {
    parts.push(`Proposed graph update: ${proposedUpdate}`);
  }

  if (missingFact) {
    parts.push(`Knowledge gap: ${missingFact}`);
  }

  if (whyItMatters) {
    parts.push(`Why it matters: ${whyItMatters}`);
  }

  if (strategicSummary) {
    parts.push(`Strategic intelligence: ${strategicSummary}`);
  }

  if (parts.length === 0) {
    parts.push(
      'SCIIP identified a connected intelligence signal requiring hypothesis testing.'
    );
  }

  return parts.join('\n');
}

function sciipInferHypothesisSourceRecord560_(record, gap, strategicIntelligence) {
  const enrichmentId = sciipExtractFirstAvailable560_(record, [
    'Enrichment_ID'
  ]);

  if (enrichmentId) {
    return `KNOWLEDGE_GRAPH_ENRICHMENT:${enrichmentId}`;
  }

  const gapId = sciipExtractFirstAvailable560_(gap, [
    'Knowledge_Gap_ID',
    'Gap_ID'
  ]);

  if (gapId) {
    return `KNOWLEDGE_GAPS:${gapId}`;
  }

  const strategicId = sciipExtractFirstAvailable560_(strategicIntelligence, [
    'Strategic_Intelligence_ID',
    'Intelligence_ID'
  ]);

  if (strategicId) {
    return `STRATEGIC_INTELLIGENCE:${strategicId}`;
  }

  return 'UNKNOWN_SOURCE_RECORD';
}

function sciipRecommendHypothesisValidationAction560_(type) {
  if (type === 'PROPERTY_HYPOTHESIS') {
    return 'Validate against asset registry, property events, GIS attributes, ownership facts, tenant signals, power, yard, and availability evidence.';
  }

  if (type === 'COMPANY_HYPOTHESIS') {
    return 'Validate through company research, funding events, hiring signals, permits, supplier relationships, OEM linkages, and occupier movement.';
  }

  if (type === 'RISK_HYPOTHESIS') {
    return 'Validate through counterevidence, timing risk, regulatory constraints, vacancy exposure, tenant exposure, and market weakness signals.';
  }

  if (type === 'OPPORTUNITY_HYPOTHESIS') {
    return 'Validate through demand signals, ownership fit, tenant movement, pricing gaps, supply constraints, and market timing.';
  }

  if (type === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return 'Validate through processor outputs, duplicate patterns, missing fields, workflow friction, graph incompleteness, and operator feedback.';
  }

  return 'Validate against recent lease, sale, availability, tenant, capital markets, and absorption signals.';
}

function sciipFindKnowledgeGapById560_(knowledgeGaps, knowledgeGapId) {
  if (!knowledgeGapId) return null;

  return knowledgeGaps.find(gap =>
    sciipExtractFirstAvailable560_(gap, [
      'Knowledge_Gap_ID',
      'Gap_ID',
      'ID'
    ]) === knowledgeGapId
  ) || null;
}

function sciipFindStrategicIntelligenceById560_(strategicIntelligence, strategicIntelligenceId) {
  if (!strategicIntelligenceId) return null;

  return strategicIntelligence.find(intelligence =>
    sciipExtractFirstAvailable560_(intelligence, [
      'Strategic_Intelligence_ID',
      'Intelligence_ID',
      'ID'
    ]) === strategicIntelligenceId
  ) || null;
}

function sciipDeduplicateHypothesisRows560_(rows) {
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


function sciipTestHypothesisGenerationProcessor() {
  const result = sciipRunHypothesisGenerationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisGenerationProcessor',
    result: result
  }));

  return result;
}
