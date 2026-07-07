/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 620_KnowledgeEvolutionProcessor
 *
 * VALIDATED_LEARNINGS → KNOWLEDGE_EVOLUTION
 *
 * Migration note:
 * Preserves original 620 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const KNOWLEDGE_EVOLUTION_PROCESSOR = '620_KnowledgeEvolutionProcessor';
const KNOWLEDGE_EVOLUTION_SHEET = 'KNOWLEDGE_EVOLUTION';

const KNOWLEDGE_EVOLUTION_HEADERS = [
  'Evolution_ID',
  'Business_Key',
  'Evolution_Date',
  'Learning_ID',
  'Validation_Decision_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Learning_Type',
  'Evolution_Type',
  'Evolution_Title',
  'Graph_Update_Action',
  'Entity_Confidence_Adjustment',
  'Relationship_Strength_Adjustment',
  'Signal_Weight_Adjustment',
  'Processor_Evolution_Action',
  'Reasoning_Improvement',
  'Evolution_Rationale',
  'Evolution_Priority',
  'Evolution_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureKnowledgeEvolutionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    KNOWLEDGE_EVOLUTION_SHEET,
    KNOWLEDGE_EVOLUTION_HEADERS
  );
}

function sciipRunKnowledgeEvolutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: KNOWLEDGE_EVOLUTION_PROCESSOR,
    action: 'KNOWLEDGE_EVOLUTION_BUILD',
    sourceSheet: 'VALIDATED_LEARNINGS',
    targetSheet: KNOWLEDGE_EVOLUTION_SHEET,
    ledgerSheet: 'KNOWLEDGE_EVOLUTION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const learnings = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('VALIDATED_LEARNINGS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: learnings.length,
        outputCount: learnings.length || 1,
        summary: 'Knowledge evolution runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: KNOWLEDGE_EVOLUTION_PROCESSOR,
          inputSheets: ['VALIDATED_LEARNINGS']
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
      const outputSheet = sciipEnsureKnowledgeEvolutionSchema();
      const evolutionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const evolutionBusinessKey = 'KNOWLEDGE_EVOLUTION|' + evolutionDate;

      if (sciipRuntimeBusinessKeyPrefixExists620_(definition.targetSheet, evolutionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: KNOWLEDGE_EVOLUTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            knowledgeEvolutionsCreated: 0,
            skippedDuplicate: 1,
            evolutionBusinessKey: evolutionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const learnings = sciipGetRuntimeRecordsByDate620_(
        'VALIDATED_LEARNINGS',
        'Learning_Date',
        evolutionDate
      );

      if (learnings.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: KNOWLEDGE_EVOLUTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            learningsReviewed: 0,
            knowledgeEvolutionsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const evolutions = sciipCreateKnowledgeEvolutions620_({
        businessKey: evolutionBusinessKey,
        evolutionDate: evolutionDate,
        learnings: learnings,
        processor: KNOWLEDGE_EVOLUTION_PROCESSOR
      });

      evolutions.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: KNOWLEDGE_EVOLUTION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: evolutions.length,
        recordsRead: learnings.length,
        processed: evolutions.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          learningsReviewed: learnings.length,
          knowledgeEvolutionsCreated: evolutions.length,
          skippedDuplicate: 0,
          evolutionBusinessKey: evolutionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists620_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate620_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue620_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue620_(value) {
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

function sciipExtractFirstAvailable620_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey620_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateKnowledgeEvolutions620_(args) {
  const now = new Date();

  const rows = args.learnings.map(function(learning) {
    const learningId = sciipExtractFirstAvailable620_(learning, [
      'Learning_ID'
    ]);

    const validationDecisionId = sciipExtractFirstAvailable620_(learning, [
      'Validation_Decision_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable620_(learning, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable620_(learning, [
      'Hypothesis_Type'
    ]);

    const learningType = sciipExtractFirstAvailable620_(learning, [
      'Learning_Type'
    ]);

    const profile =
      sciipInferKnowledgeEvolutionProfile620_(learning);

    const rowKey =
      args.businessKey + '|' + learningType + '|' +
      sciipNormalizeMissionKey620_(learningId || validationDecisionId || hypothesisId || profile.evolutionTitle);

    return [
      sciipGenerateId_('KNE'),
      rowKey,
      args.evolutionDate,
      learningId,
      validationDecisionId,
      hypothesisId,
      hypothesisType,
      learningType,
      profile.evolutionType,
      profile.evolutionTitle,
      profile.graphUpdateAction,
      profile.entityConfidenceAdjustment,
      profile.relationshipStrengthAdjustment,
      profile.signalWeightAdjustment,
      profile.processorEvolutionAction,
      profile.reasoningImprovement,
      profile.evolutionRationale,
      profile.evolutionPriority,
      'PROPOSED',
      'VALIDATED_LEARNINGS:' + learningId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateKnowledgeEvolutionRows620_(rows);
}

function sciipInferKnowledgeEvolutionProfile620_(learning) {
  const hypothesisType = sciipExtractFirstAvailable620_(learning, [
    'Hypothesis_Type'
  ]);

  const learningType = sciipExtractFirstAvailable620_(learning, [
    'Learning_Type'
  ]);

  const validationDecision = sciipExtractFirstAvailable620_(learning, [
    'Validation_Decision'
  ]);

  const whatSciipLearned = sciipExtractFirstAvailable620_(learning, [
    'What_SCIIP_Learned'
  ]);

  const graphRecommendation = sciipExtractFirstAvailable620_(learning, [
    'Graph_Update_Recommendation'
  ]);

  const processorRecommendation = sciipExtractFirstAvailable620_(learning, [
    'Processor_Update_Recommendation'
  ]);

  const futureSignalWeighting = sciipExtractFirstAvailable620_(learning, [
    'Future_Signal_Weighting'
  ]);

  const learningConfidence =
    sciipExtractFirstAvailable620_(learning, [
      'Learning_Confidence'
    ]) || 'LOW';

  let evolutionType = 'GENERAL_KNOWLEDGE_EVOLUTION';
  let evolutionTitle = 'Knowledge evolution from ' + (learningType || 'validated learning');
  let graphUpdateAction =
    graphRecommendation || 'Preserve learning and source linkage in the knowledge graph.';
  let entityConfidenceAdjustment = 'NO_CHANGE';
  let relationshipStrengthAdjustment = 'NO_CHANGE';
  let signalWeightAdjustment = futureSignalWeighting || 'MAINTAIN_CURRENT_WEIGHT';
  let processorEvolutionAction =
    processorRecommendation || 'No processor update required.';
  let reasoningImprovement =
    'Use this learning to improve future hypothesis generation, evidence routing, and confidence reasoning.';
  let evolutionPriority = 'MEDIUM';

  const decisionText = String(validationDecision || '').toUpperCase();

  if (decisionText === 'VALIDATED') {
    evolutionType = 'PATTERN_REINFORCEMENT';
    entityConfidenceAdjustment = 'INCREASE_CONFIDENCE';
    relationshipStrengthAdjustment = 'STRENGTHEN_RELATED_EDGES';
    signalWeightAdjustment = 'INCREASE_WEIGHT';
    evolutionPriority = 'HIGH';
    reasoningImprovement =
      'Reinforce similar future signals because this hypothesis pattern was validated.';
  }

  if (decisionText === 'REJECTED') {
    evolutionType = 'PATTERN_SUPPRESSION';
    entityConfidenceAdjustment = 'DECREASE_CONFIDENCE';
    relationshipStrengthAdjustment = 'WEAKEN_RELATED_EDGES';
    signalWeightAdjustment = 'DECREASE_WEIGHT';
    evolutionPriority = 'HIGH';
    reasoningImprovement =
      'Suppress or downgrade similar future signals because this hypothesis pattern was rejected.';
  }

  if (decisionText === 'CONTESTED') {
    evolutionType = 'CONFLICT_PRESERVATION';
    entityConfidenceAdjustment = 'FLAG_CONFIDENCE_CONFLICT';
    relationshipStrengthAdjustment = 'FLAG_EDGE_CONFLICT';
    signalWeightAdjustment = 'FLAG_FOR_REVIEW';
    evolutionPriority = 'HIGH';
    reasoningImprovement =
      'Preserve conflict structure so future reasoning can distinguish supporting evidence from counterevidence.';
  }

  if (decisionText === 'READY_FOR_OPERATOR_REVIEW') {
    evolutionType = 'OPERATOR_REVIEW_ROUTING';
    entityConfidenceAdjustment = 'NO_CHANGE_PENDING_REVIEW';
    relationshipStrengthAdjustment = 'NO_CHANGE_PENDING_REVIEW';
    signalWeightAdjustment = 'REVIEW_BEFORE_WEIGHT_CHANGE';
    evolutionPriority = 'HIGH';
    reasoningImprovement =
      'Route similar high-priority unresolved hypotheses to operator review before autonomous graph confidence changes.';
  }

  if (decisionText === 'NEEDS_MORE_EVIDENCE') {
    evolutionType = 'EVIDENCE_GAP_REINFORCEMENT';
    entityConfidenceAdjustment = 'NO_CHANGE_PENDING_EVIDENCE';
    relationshipStrengthAdjustment = 'NO_CHANGE_PENDING_EVIDENCE';
    signalWeightAdjustment = 'MAINTAIN_CURRENT_WEIGHT';
    evolutionPriority = learningConfidence === 'MEDIUM' ? 'MEDIUM' : 'LOW';
    reasoningImprovement =
      'Increase awareness of evidence gaps before drawing stronger conclusions from similar future signals.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    evolutionType = 'PROPERTY_' + evolutionType;
    evolutionTitle = 'Property knowledge evolution';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    evolutionType = 'COMPANY_' + evolutionType;
    evolutionTitle = 'Company knowledge evolution';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    evolutionType = 'RISK_' + evolutionType;
    evolutionTitle = 'Risk knowledge evolution';
    evolutionPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    evolutionType = 'OPPORTUNITY_' + evolutionType;
    evolutionTitle = 'Opportunity knowledge evolution';
    evolutionPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    evolutionType = 'SYSTEM_' + evolutionType;
    evolutionTitle = 'Operating system knowledge evolution';
    processorEvolutionAction =
      processorRecommendation ||
      'Review processor logic, schema design, graph completeness, and workflow automation for possible improvement.';
  }

  const evolutionRationale = [
    'Validation decision: ' + (validationDecision || 'UNKNOWN') + '.',
    'Learning type: ' + (learningType || 'UNKNOWN') + '.',
    'What SCIIP learned: ' + (whatSciipLearned || 'No learning statement recorded.'),
    'Graph recommendation: ' + graphUpdateAction,
    'Processor recommendation: ' + processorEvolutionAction,
    'Future signal weighting: ' + signalWeightAdjustment
  ].join('\n');

  return {
    evolutionType: evolutionType,
    evolutionTitle: evolutionTitle,
    graphUpdateAction: graphUpdateAction,
    entityConfidenceAdjustment: entityConfidenceAdjustment,
    relationshipStrengthAdjustment: relationshipStrengthAdjustment,
    signalWeightAdjustment: signalWeightAdjustment,
    processorEvolutionAction: processorEvolutionAction,
    reasoningImprovement: reasoningImprovement,
    evolutionRationale: evolutionRationale,
    evolutionPriority: evolutionPriority
  };
}

function sciipDeduplicateKnowledgeEvolutionRows620_(rows) {
  const seen = {};
  const deduped = [];

  rows.forEach(function(row) {
    const businessKey = row[1];

    if (!seen[businessKey]) {
      seen[businessKey] = true;
      deduped.push(row);
    }
  });

  return deduped;
}

function sciipTestKnowledgeEvolutionProcessor() {
  const result =
    sciipRunKnowledgeEvolutionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeEvolutionProcessor',
    result: result
  }));

  return result;
}
