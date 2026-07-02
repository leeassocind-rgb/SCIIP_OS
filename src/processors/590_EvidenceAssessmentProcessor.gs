/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 590_EvidenceAssessmentProcessor
 *
 * EVIDENCE_COLLECTION_TASKS → EVIDENCE_ASSESSMENTS
 *
 * Migration note:
 * Preserves original 590 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const EVIDENCE_ASSESSMENT_PROCESSOR = '590_EvidenceAssessmentProcessor';
const EVIDENCE_ASSESSMENTS_SHEET = 'EVIDENCE_ASSESSMENTS';

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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    EVIDENCE_ASSESSMENTS_SHEET,
    EVIDENCE_ASSESSMENTS_HEADERS
  );
}

function sciipRunEvidenceAssessmentProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: EVIDENCE_ASSESSMENT_PROCESSOR,
    action: 'EVIDENCE_ASSESSMENTS_BUILD',
    sourceSheet: 'EVIDENCE_COLLECTION_TASKS',
    targetSheet: EVIDENCE_ASSESSMENTS_SHEET,
    ledgerSheet: 'EVIDENCE_ASSESSMENTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const evidenceTasks = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('EVIDENCE_COLLECTION_TASKS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: evidenceTasks.length,
        outputCount: evidenceTasks.length || 1,
        summary: 'Evidence assessment runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: EVIDENCE_ASSESSMENT_PROCESSOR,
          inputSheets: ['EVIDENCE_COLLECTION_TASKS']
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
      const outputSheet = sciipEnsureEvidenceAssessmentsSchema();
      const assessmentDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const evidenceAssessmentBusinessKey = 'EVIDENCE_ASSESSMENT|' + assessmentDate;

      if (sciipRuntimeBusinessKeyPrefixExists590_(definition.targetSheet, evidenceAssessmentBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: EVIDENCE_ASSESSMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            evidenceAssessmentsCreated: 0,
            skippedDuplicate: 1,
            evidenceAssessmentBusinessKey: evidenceAssessmentBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const evidenceTasks = sciipGetRuntimeRecordsByDate590_(
        'EVIDENCE_COLLECTION_TASKS',
        'Task_Date',
        assessmentDate
      );

      if (evidenceTasks.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: EVIDENCE_ASSESSMENT_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            evidenceTasksReviewed: 0,
            evidenceAssessmentsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const assessments = sciipCreateEvidenceAssessments590_({
        businessKey: evidenceAssessmentBusinessKey,
        assessmentDate: assessmentDate,
        evidenceTasks: evidenceTasks,
        processor: EVIDENCE_ASSESSMENT_PROCESSOR
      });

      assessments.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: EVIDENCE_ASSESSMENT_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: assessments.length,
        recordsRead: evidenceTasks.length,
        processed: assessments.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          evidenceTasksReviewed: evidenceTasks.length,
          evidenceAssessmentsCreated: assessments.length,
          skippedDuplicate: 0,
          evidenceAssessmentBusinessKey: evidenceAssessmentBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists590_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate590_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue590_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue590_(value) {
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

function sciipExtractFirstAvailable590_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey590_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateEvidenceAssessments590_(args) {
  const now = new Date();

  const rows = args.evidenceTasks.map(task => {
    const evidenceTaskId = sciipExtractFirstAvailable590_(task, [
      'Evidence_Task_ID'
    ]);

    const validationPlanId = sciipExtractFirstAvailable590_(task, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable590_(task, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable590_(task, [
      'Hypothesis_Type'
    ]);

    const profile =
      sciipInferEvidenceAssessmentProfile590_(task);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey590_(evidenceTaskId || validationPlanId || hypothesisId || profile.assessmentObjective)}`;

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

  return sciipDeduplicateEvidenceAssessmentRows590_(rows);
}

function sciipInferEvidenceAssessmentProfile590_(task) {
  const hypothesisType = sciipExtractFirstAvailable590_(task, [
    'Hypothesis_Type'
  ]);

  const evidenceTaskType = sciipExtractFirstAvailable590_(task, [
    'Evidence_Task_Type'
  ]);

  const evidenceRequired = sciipExtractFirstAvailable590_(task, [
    'Evidence_Required'
  ]);

  const primaryDataSource = sciipExtractFirstAvailable590_(task, [
    'Primary_Data_Source'
  ]);

  const secondaryDataSource = sciipExtractFirstAvailable590_(task, [
    'Secondary_Data_Source'
  ]);

  const expectedOutput = sciipExtractFirstAvailable590_(task, [
    'Expected_Evidence_Output'
  ]);

  const collectionPriority =
    sciipExtractFirstAvailable590_(task, [
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

function sciipDeduplicateEvidenceAssessmentRows590_(rows) {
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
  const result = sciipRunEvidenceAssessmentProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestEvidenceAssessmentProcessor',
    result: result
  }));

  return result;
}
