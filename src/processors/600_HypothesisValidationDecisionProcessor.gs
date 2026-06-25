/************************************************************
 * 600_HypothesisValidationDecisionProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - EVIDENCE_ASSESSMENTS
 *
 * Output:
 * - HYPOTHESIS_VALIDATION_DECISIONS
 ************************************************************/

const HYPOTHESIS_VALIDATION_DECISIONS_SHEET =
  'HYPOTHESIS_VALIDATION_DECISIONS';

const HYPOTHESIS_VALIDATION_DECISIONS_HEADERS = [
  'Validation_Decision_ID',
  'Business_Key',
  'Decision_Date',
  'Evidence_Assessment_ID',
  'Evidence_Task_ID',
  'Validation_Plan_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Validation_Decision',
  'Decision_Rationale',
  'Supporting_Evidence',
  'Counter_Evidence',
  'Evidence_Gaps',
  'Decision_Confidence',
  'Validation_Status',
  'Recommended_Next_Action',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureHypothesisValidationDecisionsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(HYPOTHESIS_VALIDATION_DECISIONS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(HYPOTHESIS_VALIDATION_DECISIONS_SHEET);
  }

  sheet.getRange(1, 1, 1, HYPOTHESIS_VALIDATION_DECISIONS_HEADERS.length)
    .setValues([HYPOTHESIS_VALIDATION_DECISIONS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunHypothesisValidationDecisionProcessor() {
  const processor = '600_HypothesisValidationDecisionProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureHypothesisValidationDecisionsSchema();

  const decisionDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `HYPOTHESIS_VALIDATION_DECISION|${decisionDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      validationDecisionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const evidenceAssessments = sciipGetRecordsByDate_(
    'EVIDENCE_ASSESSMENTS',
    'Assessment_Date',
    decisionDate
  );

  if (evidenceAssessments.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      evidenceAssessmentsReviewed: 0,
      validationDecisionsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const decisions = sciipCreateHypothesisValidationDecisions_({
    businessKey,
    decisionDate,
    evidenceAssessments,
    processor
  });

  decisions.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    evidenceAssessmentsReviewed: evidenceAssessments.length,
    validationDecisionsCreated: decisions.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateHypothesisValidationDecisions_(args) {
  const now = new Date();

  const rows = args.evidenceAssessments.map(assessment => {
    const evidenceAssessmentId = sciipExtractFirstAvailable_(assessment, [
      'Evidence_Assessment_ID'
    ]);

    const evidenceTaskId = sciipExtractFirstAvailable_(assessment, [
      'Evidence_Task_ID'
    ]);

    const validationPlanId = sciipExtractFirstAvailable_(assessment, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(assessment, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(assessment, [
      'Hypothesis_Type'
    ]);

    const profile =
      sciipInferHypothesisValidationDecisionProfile_(assessment);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey_(evidenceAssessmentId || evidenceTaskId || validationPlanId || hypothesisId)}`;

    return [
      sciipGenerateId_('HVD'),
      rowKey,
      args.decisionDate,
      evidenceAssessmentId,
      evidenceTaskId,
      validationPlanId,
      hypothesisId,
      hypothesisType,
      profile.validationDecision,
      profile.decisionRationale,
      profile.supportingEvidence,
      profile.counterEvidence,
      profile.evidenceGaps,
      profile.decisionConfidence,
      profile.validationStatus,
      profile.recommendedNextAction,
      `EVIDENCE_ASSESSMENTS:${evidenceAssessmentId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisValidationDecisionRows_(rows);
}

function sciipInferHypothesisValidationDecisionProfile_(assessment) {
  const hypothesisType = sciipExtractFirstAvailable_(assessment, [
    'Hypothesis_Type'
  ]);

  const assessmentFinding = sciipExtractFirstAvailable_(assessment, [
    'Assessment_Finding'
  ]);

  const validationImplication = sciipExtractFirstAvailable_(assessment, [
    'Validation_Implication'
  ]);

  const assessmentConfidence =
    sciipExtractFirstAvailable_(assessment, [
      'Assessment_Confidence'
    ]) || 'LOW';

  const supportingEvidence = sciipExtractFirstAvailable_(assessment, [
    'Supporting_Evidence'
  ]);

  const counterEvidence = sciipExtractFirstAvailable_(assessment, [
    'Counter_Evidence'
  ]);

  const evidenceGaps = sciipExtractFirstAvailable_(assessment, [
    'Evidence_Gaps'
  ]);

  let validationDecision = 'NEEDS_MORE_EVIDENCE';
  let validationStatus = 'PENDING_ADDITIONAL_EVIDENCE';
  let decisionConfidence = assessmentConfidence;
  let decisionRationale =
    'Evidence assessment defines the evidence requirements, but source-level evidence remains incomplete. Hypothesis cannot be fully validated or rejected yet.';
  let recommendedNextAction =
    'Continue source-specific evidence collection before final validation.';

  const combined = [
    assessmentFinding,
    validationImplication,
    supportingEvidence,
    counterEvidence,
    evidenceGaps
  ].join(' ').toLowerCase();

  if (
    combined.includes('counterevidence') &&
    !combined.includes('no counterevidence')
  ) {
    validationDecision = 'CONTESTED';
    validationStatus = 'REQUIRES_OPERATOR_REVIEW';
    decisionConfidence = 'MEDIUM';
    decisionRationale =
      'Assessment references counterevidence or unresolved conflicting evidence. The hypothesis requires operator review before validation.';
    recommendedNextAction =
      'Review supporting evidence and counterevidence, then determine whether to validate, reject, or revise the hypothesis.';
  }

  if (
    combined.includes('actual source-level evidence has not yet been attached') ||
    combined.includes('additional collection is required') ||
    combined.includes('not yet been attached')
  ) {
    validationDecision = 'NEEDS_MORE_EVIDENCE';
    validationStatus = 'PENDING_ADDITIONAL_EVIDENCE';
    decisionConfidence = assessmentConfidence === 'HIGH' ? 'MEDIUM' : assessmentConfidence;
    decisionRationale =
      'The assessment confirms that evidence requirements are defined, but actual source-level evidence has not yet been attached.';
    recommendedNextAction =
      'Collect and attach source-level evidence, then rerun validation decisioning.';
  }

  if (
    combined.includes('high_priority_validation_review_required')
  ) {
    validationDecision = 'READY_FOR_OPERATOR_REVIEW';
    validationStatus = 'PENDING_OPERATOR_REVIEW';
    decisionConfidence = 'MEDIUM';
    decisionRationale =
      'The hypothesis has high-priority validation implications and should be reviewed after evidence collection is completed.';
    recommendedNextAction =
      sciipRecommendHypothesisValidationDecisionNextAction_(hypothesisType);
  }

  return {
    validationDecision,
    decisionRationale,
    supportingEvidence,
    counterEvidence,
    evidenceGaps,
    decisionConfidence,
    validationStatus,
    recommendedNextAction
  };
}

function sciipRecommendHypothesisValidationDecisionNextAction_(hypothesisType) {
  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    return 'Operator should review property facts, GIS evidence, ownership, tenant signals, availability, and comparable activity before final validation.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    return 'Operator should review company activity, funding, hiring, facility movement, permits, and real estate demand signals before final validation.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    return 'Operator should review risk severity, affected entities, timing, counterevidence, and mitigation path before final validation.';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    return 'Operator should review demand evidence, target fit, timing, actionability, and pursuit rationale before final validation.';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return 'Operator should review processor logs, skipped records, duplicate patterns, missing fields, graph gaps, and workflow friction before approving system changes.';
  }

  return 'Operator should review market evidence, supporting signals, counterevidence, and confidence before final validation.';
}

function sciipDeduplicateHypothesisValidationDecisionRows_(rows) {
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

function sciipTestHypothesisValidationDecisionProcessor() {
  const result =
    sciipRunHypothesisValidationDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisValidationDecisionProcessor',
    result
  }));

  return result;
}