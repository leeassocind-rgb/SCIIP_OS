/************************************************************
 * 590_EvidenceAssessmentProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - EVIDENCE_COLLECTION_TASKS
 *
 * Output:
 * - EVIDENCE_ASSESSMENTS
 ************************************************************/

const EVIDENCE_ASSESSMENTS_SHEET =
  'EVIDENCE_ASSESSMENTS';

const EVIDENCE_ASSESSMENTS_HEADERS = [
  'Evidence_Assessment_ID',
  'Business_Key',
  'Assessment_Date',
  'Evidence_Task_ID',
  'Validation_Plan_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Assessment_Type',
  'Assessment_Objective',
  'Evidence_Reviewed',
  'Supporting_Evidence',
  'Counter_Evidence',
  'Evidence_Gaps',
  'Assessment_Finding',
  'Validation_Implication',
  'Assessment_Confidence',
  'Recommended_Next_Action',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureEvidenceAssessmentsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(EVIDENCE_ASSESSMENTS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(EVIDENCE_ASSESSMENTS_SHEET);
  }

  sheet.getRange(1, 1, 1, EVIDENCE_ASSESSMENTS_HEADERS.length)
    .setValues([EVIDENCE_ASSESSMENTS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunEvidenceAssessmentProcessor() {
  const processor = '590_EvidenceAssessmentProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureEvidenceAssessmentsSchema();

  const assessmentDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `EVIDENCE_ASSESSMENT|${assessmentDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      evidenceAssessmentsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const evidenceTasks = sciipGetRecordsByDate_(
    'EVIDENCE_COLLECTION_TASKS',
    'Task_Date',
    assessmentDate
  );

  if (evidenceTasks.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      evidenceTasksReviewed: 0,
      evidenceAssessmentsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const assessments = sciipCreateEvidenceAssessments_({
    businessKey,
    assessmentDate,
    evidenceTasks,
    processor
  });

  assessments.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    evidenceTasksReviewed: evidenceTasks.length,
    evidenceAssessmentsCreated: assessments.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateEvidenceAssessments_(args) {
  const now = new Date();

  const rows = args.evidenceTasks.map(task => {
    const evidenceTaskId = sciipExtractFirstAvailable_(task, [
      'Evidence_Task_ID'
    ]);

    const validationPlanId = sciipExtractFirstAvailable_(task, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(task, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(task, [
      'Hypothesis_Type'
    ]);

    const profile =
      sciipInferEvidenceAssessmentProfile_(task);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey_(evidenceTaskId || validationPlanId || hypothesisId || profile.assessmentObjective)}`;

    return [
      sciipGenerateId_('EVA'),
      rowKey,
      args.assessmentDate,
      evidenceTaskId,
      validationPlanId,
      hypothesisId,
      hypothesisType,
      profile.assessmentType,
      profile.assessmentObjective,
      profile.evidenceReviewed,
      profile.supportingEvidence,
      profile.counterEvidence,
      profile.evidenceGaps,
      profile.assessmentFinding,
      profile.validationImplication,
      profile.assessmentConfidence,
      profile.recommendedNextAction,
      `EVIDENCE_COLLECTION_TASKS:${evidenceTaskId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateEvidenceAssessmentRows_(rows);
}

function sciipInferEvidenceAssessmentProfile_(task) {
  const hypothesisType = sciipExtractFirstAvailable_(task, [
    'Hypothesis_Type'
  ]);

  const evidenceTaskType = sciipExtractFirstAvailable_(task, [
    'Evidence_Task_Type'
  ]);

  const evidenceRequired = sciipExtractFirstAvailable_(task, [
    'Evidence_Required'
  ]);

  const primaryDataSource = sciipExtractFirstAvailable_(task, [
    'Primary_Data_Source'
  ]);

  const secondaryDataSource = sciipExtractFirstAvailable_(task, [
    'Secondary_Data_Source'
  ]);

  const expectedOutput = sciipExtractFirstAvailable_(task, [
    'Expected_Evidence_Output'
  ]);

  const collectionPriority =
    sciipExtractFirstAvailable_(task, [
      'Collection_Priority'
    ]) || 'MEDIUM';

  const evidenceReviewed =
    `Evidence task reviewed: ${evidenceTaskType || 'GENERAL_EVIDENCE_COLLECTION'}\n` +
    `Evidence required: ${evidenceRequired || 'No specific evidence requirement recorded.'}\n` +
    `Primary source: ${primaryDataSource || 'Not specified.'}\n` +
    `Secondary source: ${secondaryDataSource || 'Not specified.'}`;

  let assessmentType = 'MARKET_EVIDENCE_ASSESSMENT';
  let assessmentObjective =
    'Assess whether collected or requested market evidence is sufficient to advance hypothesis validation.';
  let supportingEvidence =
    'Evidence collection task defines the required market evidence, sources, and expected output needed for validation.';
  let counterEvidence =
    'No counterevidence has been collected by this processor. Counterevidence remains pending until source-specific collection is completed.';
  let evidenceGaps =
    'Actual source-level evidence has not yet been attached. Additional collection is required before final validation.';
  let assessmentFinding =
    'EVIDENCE_REQUIREMENTS_DEFINED';
  let validationImplication =
    'READY_FOR_PRELIMINARY_VALIDATION_REVIEW';
  let assessmentConfidence =
    collectionPriority === 'HIGH' ? 'MEDIUM' : 'LOW';
  let recommendedNextAction =
    'Collect source-specific evidence and compare supporting evidence against counterevidence before final validation.';

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    assessmentType = 'PROPERTY_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether property-level evidence requirements are sufficient to validate the property hypothesis.';
    supportingEvidence =
      'The task identifies property registry, property events, GIS attributes, ownership, tenant activity, physical characteristics, and broker evidence as required inputs.';
    recommendedNextAction =
      'Gather property facts, GIS attributes, ownership records, availability status, tenant signals, and comparable market evidence.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    assessmentType = 'COMPANY_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether company-level evidence requirements are sufficient to validate the company hypothesis.';
    supportingEvidence =
      'The task identifies company activity, funding, hiring, permits, facility footprint, OEM relationships, supplier linkages, and occupier movement as required inputs.';
    recommendedNextAction =
      'Gather company growth signals, footprint evidence, hiring/funding indicators, permit activity, and real estate movement evidence.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    assessmentType = 'RISK_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether risk evidence requirements are sufficient to measure severity, timing, affected entities, and mitigation pathway.';
    supportingEvidence =
      'The task identifies negative indicators, counterevidence, vacancy exposure, tenant exposure, regulatory constraints, timing risk, and market weakness as required inputs.';
    validationImplication =
      'HIGH_PRIORITY_VALIDATION_REVIEW_REQUIRED';
    assessmentConfidence = 'MEDIUM';
    recommendedNextAction =
      'Collect source-specific risk evidence and determine severity, timing, affected entities, and mitigation options.';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    assessmentType = 'OPPORTUNITY_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether opportunity evidence requirements are sufficient to determine actionability.';
    supportingEvidence =
      'The task identifies demand signals, target fit, ownership fit, tenant movement, pricing gaps, competitive supply, and timing evidence as required inputs.';
    validationImplication =
      'HIGH_PRIORITY_VALIDATION_REVIEW_REQUIRED';
    assessmentConfidence = 'MEDIUM';
    recommendedNextAction =
      'Collect demand evidence, target fit evidence, timing indicators, ownership fit, and pursuit rationale.';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    assessmentType = 'SYSTEM_EVIDENCE_ASSESSMENT';
    assessmentObjective =
      'Assess whether SCIIP operating evidence requirements are sufficient to validate a system improvement hypothesis.';
    supportingEvidence =
      'The task identifies processor logs, system health records, skipped records, duplicates, missing fields, graph gaps, workflow friction, and operator feedback as required inputs.';
    recommendedNextAction =
      'Gather processor logs, skipped/duplicate patterns, missing field evidence, graph incompleteness evidence, and operator feedback.';
  }

  return {
    assessmentType,
    assessmentObjective,
    evidenceReviewed,
    supportingEvidence,
    counterEvidence,
    evidenceGaps,
    assessmentFinding,
    validationImplication,
    assessmentConfidence,
    recommendedNextAction
  };
}

function sciipDeduplicateEvidenceAssessmentRows_(rows) {
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

function sciipTestEvidenceAssessmentProcessor() {
  const result =
    sciipRunEvidenceAssessmentProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestEvidenceAssessmentProcessor',
    result
  }));

  return result;
}