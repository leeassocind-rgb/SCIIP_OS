/************************************************************
 * 620_KnowledgeEvolutionProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - VALIDATED_LEARNINGS
 *
 * Output:
 * - KNOWLEDGE_EVOLUTION
 ************************************************************/

const KNOWLEDGE_EVOLUTION_SHEET =
  'KNOWLEDGE_EVOLUTION';

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
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(KNOWLEDGE_EVOLUTION_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(KNOWLEDGE_EVOLUTION_SHEET);
  }

  sheet.getRange(1, 1, 1, KNOWLEDGE_EVOLUTION_HEADERS.length)
    .setValues([KNOWLEDGE_EVOLUTION_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunKnowledgeEvolutionProcessor() {
  const processor = '620_KnowledgeEvolutionProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureKnowledgeEvolutionSchema();

  const evolutionDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `KNOWLEDGE_EVOLUTION|${evolutionDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      knowledgeEvolutionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const learnings = sciipGetRecordsByDate_(
    'VALIDATED_LEARNINGS',
    'Learning_Date',
    evolutionDate
  );

  if (learnings.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      learningsReviewed: 0,
      knowledgeEvolutionsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const evolutions = sciipCreateKnowledgeEvolutions_({
    businessKey,
    evolutionDate,
    learnings,
    processor
  });

  evolutions.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    learningsReviewed: learnings.length,
    knowledgeEvolutionsCreated: evolutions.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateKnowledgeEvolutions_(args) {
  const now = new Date();

  const rows = args.learnings.map(learning => {
    const learningId = sciipExtractFirstAvailable_(learning, [
      'Learning_ID'
    ]);

    const validationDecisionId = sciipExtractFirstAvailable_(learning, [
      'Validation_Decision_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(learning, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(learning, [
      'Hypothesis_Type'
    ]);

    const learningType = sciipExtractFirstAvailable_(learning, [
      'Learning_Type'
    ]);

    const profile =
      sciipInferKnowledgeEvolutionProfile_(learning);

    const rowKey =
      `${args.businessKey}|${learningType}|${sciipNormalizeMissionKey_(learningId || validationDecisionId || hypothesisId || profile.evolutionTitle)}`;

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
      `VALIDATED_LEARNINGS:${learningId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateKnowledgeEvolutionRows_(rows);
}

function sciipInferKnowledgeEvolutionProfile_(learning) {
  const hypothesisType = sciipExtractFirstAvailable_(learning, [
    'Hypothesis_Type'
  ]);

  const learningType = sciipExtractFirstAvailable_(learning, [
    'Learning_Type'
  ]);

  const validationDecision = sciipExtractFirstAvailable_(learning, [
    'Validation_Decision'
  ]);

  const whatSciipLearned = sciipExtractFirstAvailable_(learning, [
    'What_SCIIP_Learned'
  ]);

  const graphRecommendation = sciipExtractFirstAvailable_(learning, [
    'Graph_Update_Recommendation'
  ]);

  const processorRecommendation = sciipExtractFirstAvailable_(learning, [
    'Processor_Update_Recommendation'
  ]);

  const futureSignalWeighting = sciipExtractFirstAvailable_(learning, [
    'Future_Signal_Weighting'
  ]);

  const learningConfidence =
    sciipExtractFirstAvailable_(learning, [
      'Learning_Confidence'
    ]) || 'LOW';

  let evolutionType = 'GENERAL_KNOWLEDGE_EVOLUTION';
  let evolutionTitle = `Knowledge evolution from ${learningType || 'validated learning'}`;
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
    evolutionType = `PROPERTY_${evolutionType}`;
    evolutionTitle = 'Property knowledge evolution';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    evolutionType = `COMPANY_${evolutionType}`;
    evolutionTitle = 'Company knowledge evolution';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    evolutionType = `RISK_${evolutionType}`;
    evolutionTitle = 'Risk knowledge evolution';
    evolutionPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    evolutionType = `OPPORTUNITY_${evolutionType}`;
    evolutionTitle = 'Opportunity knowledge evolution';
    evolutionPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    evolutionType = `SYSTEM_${evolutionType}`;
    evolutionTitle = 'Operating system knowledge evolution';
    processorEvolutionAction =
      processorRecommendation ||
      'Review processor logic, schema design, graph completeness, and workflow automation for possible improvement.';
  }

  const evolutionRationale = [
    `Validation decision: ${validationDecision || 'UNKNOWN'}.`,
    `Learning type: ${learningType || 'UNKNOWN'}.`,
    `What SCIIP learned: ${whatSciipLearned || 'No learning statement recorded.'}`,
    `Graph recommendation: ${graphUpdateAction}`,
    `Processor recommendation: ${processorEvolutionAction}`,
    `Future signal weighting: ${signalWeightAdjustment}`
  ].join('\n');

  return {
    evolutionType,
    evolutionTitle,
    graphUpdateAction,
    entityConfidenceAdjustment,
    relationshipStrengthAdjustment,
    signalWeightAdjustment,
    processorEvolutionAction,
    reasoningImprovement,
    evolutionRationale,
    evolutionPriority
  };
}

function sciipDeduplicateKnowledgeEvolutionRows_(rows) {
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

function sciipTestKnowledgeEvolutionProcessor() {
  const result =
    sciipRunKnowledgeEvolutionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestKnowledgeEvolutionProcessor',
    result
  }));

  return result;
}