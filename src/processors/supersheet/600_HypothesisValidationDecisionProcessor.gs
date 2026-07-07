/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 600_HypothesisValidationDecisionProcessor
 *
 * EVIDENCE_ASSESSMENTS → HYPOTHESIS_VALIDATION_DECISIONS
 *
 * Migration note:
 * Preserves original 600 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const HYPOTHESIS_VALIDATION_DECISION_PROCESSOR = '600_HypothesisValidationDecisionProcessor';
const HYPOTHESIS_VALIDATION_DECISIONS_SHEET = 'HYPOTHESIS_VALIDATION_DECISIONS';

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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    HYPOTHESIS_VALIDATION_DECISIONS_SHEET,
    HYPOTHESIS_VALIDATION_DECISIONS_HEADERS
  );
}

function sciipRunHypothesisValidationDecisionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
    action: 'HYPOTHESIS_VALIDATION_DECISIONS_BUILD',
    sourceSheet: 'EVIDENCE_ASSESSMENTS',
    targetSheet: HYPOTHESIS_VALIDATION_DECISIONS_SHEET,
    ledgerSheet: 'HYPOTHESIS_VALIDATION_DECISIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const evidenceAssessments = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('EVIDENCE_ASSESSMENTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: evidenceAssessments.length,
        outputCount: evidenceAssessments.length || 1,
        summary: 'Hypothesis validation decision runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
          inputSheets: ['EVIDENCE_ASSESSMENTS']
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
      const outputSheet = sciipEnsureHypothesisValidationDecisionsSchema();
      const decisionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const validationDecisionBusinessKey = 'HYPOTHESIS_VALIDATION_DECISION|' + decisionDate;

      if (sciipRuntimeBusinessKeyPrefixExists600_(definition.targetSheet, validationDecisionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            validationDecisionsCreated: 0,
            skippedDuplicate: 1,
            validationDecisionBusinessKey: validationDecisionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const evidenceAssessments = sciipGetRuntimeRecordsByDate600_(
        'EVIDENCE_ASSESSMENTS',
        'Assessment_Date',
        decisionDate
      );

      if (evidenceAssessments.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            evidenceAssessmentsReviewed: 0,
            validationDecisionsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const decisions = sciipCreateHypothesisValidationDecisions600_({
        businessKey: validationDecisionBusinessKey,
        decisionDate: decisionDate,
        evidenceAssessments: evidenceAssessments,
        processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR
      });

      decisions.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: HYPOTHESIS_VALIDATION_DECISION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: decisions.length,
        recordsRead: evidenceAssessments.length,
        processed: decisions.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          evidenceAssessmentsReviewed: evidenceAssessments.length,
          validationDecisionsCreated: decisions.length,
          skippedDuplicate: 0,
          validationDecisionBusinessKey: validationDecisionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists600_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate600_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue600_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue600_(value) {
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

function sciipExtractFirstAvailable600_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey600_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateHypothesisValidationDecisions600_(args) {
  const now = new Date();

  const rows = args.evidenceAssessments.map(function(assessment) {
    const evidenceAssessmentId = sciipExtractFirstAvailable600_(assessment, [
      'Evidence_Assessment_ID'
    ]);

    const evidenceTaskId = sciipExtractFirstAvailable600_(assessment, [
      'Evidence_Task_ID'
    ]);

    const validationPlanId = sciipExtractFirstAvailable600_(assessment, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable600_(assessment, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable600_(assessment, [
      'Hypothesis_Type'
    ]);

    const profile = sciipInferHypothesisValidationDecisionProfile600_(assessment);

    const rowKey =
      args.businessKey + '|' + hypothesisType + '|' +
      sciipNormalizeMissionKey600_(evidenceAssessmentId || evidenceTaskId || validationPlanId || hypothesisId);

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
      'EVIDENCE_ASSESSMENTS:' + evidenceAssessmentId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisValidationDecisionRows600_(rows);
}

function sciipInferHypothesisValidationDecisionProfile600_(assessment) {
  const hypothesisType = sciipExtractFirstAvailable600_(assessment, [
    'Hypothesis_Type'
  ]);

  const assessmentFinding = sciipExtractFirstAvailable600_(assessment, [
    'Assessment_Finding'
  ]);

  const validationImplication = sciipExtractFirstAvailable600_(assessment, [
    'Validation_Implication'
  ]);

  const assessmentConfidence =
    sciipExtractFirstAvailable600_(assessment, [
      'Assessment_Confidence'
    ]) || 'LOW';

  const supportingEvidence = sciipExtractFirstAvailable600_(assessment, [
    'Supporting_Evidence'
  ]);

  const counterEvidence = sciipExtractFirstAvailable600_(assessment, [
    'Counter_Evidence'
  ]);

  const evidenceGaps = sciipExtractFirstAvailable600_(assessment, [
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
      sciipRecommendHypothesisValidationDecisionNextAction600_(hypothesisType);
  }

  return {
    validationDecision: validationDecision,
    decisionRationale: decisionRationale,
    supportingEvidence: supportingEvidence,
    counterEvidence: counterEvidence,
    evidenceGaps: evidenceGaps,
    decisionConfidence: decisionConfidence,
    validationStatus: validationStatus,
    recommendedNextAction: recommendedNextAction
  };
}

function sciipRecommendHypothesisValidationDecisionNextAction600_(hypothesisType) {
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

function sciipDeduplicateHypothesisValidationDecisionRows600_(rows) {
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

function sciipTestHypothesisValidationDecisionProcessor() {
  const result = sciipRunHypothesisValidationDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisValidationDecisionProcessor',
    result: result
  }));

  return result;
}
