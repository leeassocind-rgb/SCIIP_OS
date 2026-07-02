/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 580_EvidenceCollectionProcessor
 *
 * HYPOTHESIS_VALIDATION_PLANS → EVIDENCE_COLLECTION_TASKS
 *
 * Migration note:
 * Preserves original 580 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const EVIDENCE_COLLECTION_PROCESSOR = '580_EvidenceCollectionProcessor';
const EVIDENCE_COLLECTION_TASKS_SHEET = 'EVIDENCE_COLLECTION_TASKS';

const EVIDENCE_COLLECTION_TASKS_HEADERS = [
  'Evidence_Task_ID',
  'Business_Key',
  'Task_Date',
  'Validation_Plan_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Evidence_Task_Type',
  'Evidence_Objective',
  'Evidence_Required',
  'Primary_Data_Source',
  'Secondary_Data_Source',
  'Collection_Method',
  'Collection_Priority',
  'Expected_Evidence_Output',
  'Evidence_Status',
  'Assigned_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureEvidenceCollectionTasksSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    EVIDENCE_COLLECTION_TASKS_SHEET,
    EVIDENCE_COLLECTION_TASKS_HEADERS
  );
}

function sciipRunEvidenceCollectionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: EVIDENCE_COLLECTION_PROCESSOR,
    action: 'EVIDENCE_COLLECTION_TASKS_BUILD',
    sourceSheet: 'HYPOTHESIS_VALIDATION_PLANS',
    targetSheet: EVIDENCE_COLLECTION_TASKS_SHEET,
    ledgerSheet: 'EVIDENCE_COLLECTION_TASKS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const validationPlans = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('HYPOTHESIS_VALIDATION_PLANS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: validationPlans.length,
        outputCount: validationPlans.length || 1,
        summary: 'Evidence collection runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: EVIDENCE_COLLECTION_PROCESSOR,
          inputSheets: ['HYPOTHESIS_VALIDATION_PLANS']
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
      const outputSheet = sciipEnsureEvidenceCollectionTasksSchema();
      const taskDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const evidenceTaskBusinessKey = 'EVIDENCE_COLLECTION_TASK|' + taskDate;

      if (sciipRuntimeBusinessKeyPrefixExists580_(definition.targetSheet, evidenceTaskBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: EVIDENCE_COLLECTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            evidenceTasksCreated: 0,
            skippedDuplicate: 1,
            evidenceTaskBusinessKey: evidenceTaskBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const validationPlans = sciipGetRuntimeRecordsByDate580_(
        'HYPOTHESIS_VALIDATION_PLANS',
        'Plan_Date',
        taskDate
      );

      if (validationPlans.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: EVIDENCE_COLLECTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            validationPlansReviewed: 0,
            evidenceTasksCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const tasks = sciipCreateEvidenceCollectionTasks580_({
        businessKey: evidenceTaskBusinessKey,
        taskDate: taskDate,
        validationPlans: validationPlans,
        processor: EVIDENCE_COLLECTION_PROCESSOR
      });

      tasks.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: EVIDENCE_COLLECTION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: tasks.length,
        recordsRead: validationPlans.length,
        processed: tasks.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          validationPlansReviewed: validationPlans.length,
          evidenceTasksCreated: tasks.length,
          skippedDuplicate: 0,
          evidenceTaskBusinessKey: evidenceTaskBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists580_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate580_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue580_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue580_(value) {
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

function sciipExtractFirstAvailable580_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey580_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateEvidenceCollectionTasks580_(args) {
  const now = new Date();

  const rows = args.validationPlans.map(function(plan) {
    const validationPlanId = sciipExtractFirstAvailable580_(plan, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable580_(plan, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable580_(plan, [
      'Hypothesis_Type'
    ]);

    const profile = sciipInferEvidenceCollectionProfile580_(plan);

    const rowKey =
      args.businessKey + '|' + hypothesisType + '|' +
      sciipNormalizeMissionKey580_(validationPlanId || hypothesisId || profile.evidenceObjective);

    return [
      sciipGenerateId_('ECT'),
      rowKey,
      args.taskDate,
      validationPlanId,
      hypothesisId,
      hypothesisType,
      profile.evidenceTaskType,
      profile.evidenceObjective,
      profile.evidenceRequired,
      profile.primaryDataSource,
      profile.secondaryDataSource,
      profile.collectionMethod,
      profile.collectionPriority,
      profile.expectedEvidenceOutput,
      'NOT_COLLECTED',
      'PENDING_COLLECTION',
      'HYPOTHESIS_VALIDATION_PLANS:' + validationPlanId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateEvidenceCollectionTaskRows580_(rows);
}

function sciipInferEvidenceCollectionProfile580_(plan) {
  const hypothesisType = sciipExtractFirstAvailable580_(plan, [
    'Hypothesis_Type'
  ]);

  const validationPriority =
    sciipExtractFirstAvailable580_(plan, [
      'Validation_Priority'
    ]) || 'MEDIUM';

  const evidenceRequired =
    sciipExtractFirstAvailable580_(plan, [
      'Evidence_Required'
    ]);

  const primaryDataSource =
    sciipExtractFirstAvailable580_(plan, [
      'Primary_Data_Source'
    ]);

  const secondaryDataSource =
    sciipExtractFirstAvailable580_(plan, [
      'Secondary_Data_Source'
    ]);

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    return {
      evidenceTaskType: 'PROPERTY_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect property-level evidence required to validate or reject the hypothesis.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Query property registry, property events, asset nodes, GIS attributes, ownership records, availability data, and broker notes.',
      collectionPriority: validationPriority,
      expectedEvidenceOutput:
        'Structured property evidence packet with supporting facts, counterevidence, source records, and confidence notes.'
    };
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    return {
      evidenceTaskType: 'COMPANY_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect company-level evidence required to validate or reject the hypothesis.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Research company activity, funding, hiring, permits, facility footprint, supplier relationships, OEM linkages, and occupier movement.',
      collectionPriority: validationPriority,
      expectedEvidenceOutput:
        'Structured company evidence packet with growth indicators, real estate signals, timing indicators, and confidence notes.'
    };
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    return {
      evidenceTaskType: 'RISK_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect evidence needed to measure risk severity, affected entities, timing, and counterevidence.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Review negative indicators, counterevidence, market weakness, vacancy exposure, tenant exposure, regulatory constraints, and timing risk.',
      collectionPriority: 'HIGH',
      expectedEvidenceOutput:
        'Structured risk evidence packet with risk severity, affected entities, timing, mitigation path, and confidence notes.'
    };
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    return {
      evidenceTaskType: 'OPPORTUNITY_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect evidence needed to determine whether the hypothesis represents an actionable opportunity.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Review demand signals, target fit, ownership fit, tenant activity, pricing gaps, competitive supply, and timing evidence.',
      collectionPriority: 'HIGH',
      expectedEvidenceOutput:
        'Structured opportunity evidence packet with actionable target, timing, rationale, confidence, and recommended pursuit path.'
    };
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return {
      evidenceTaskType: 'SYSTEM_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect SCIIP operating evidence needed to validate or reject the system improvement hypothesis.',
      evidenceRequired: evidenceRequired,
      primaryDataSource: primaryDataSource,
      secondaryDataSource: secondaryDataSource,
      collectionMethod:
        'Review processor logs, system health records, skipped records, duplicates, missing fields, graph gaps, workflow friction, and operator feedback.',
      collectionPriority: validationPriority,
      expectedEvidenceOutput:
        'Structured system evidence packet with processor evidence, workflow evidence, graph evidence, and recommended system improvement.'
    };
  }

  return {
    evidenceTaskType: 'MARKET_EVIDENCE_COLLECTION',
    evidenceObjective:
      'Collect market evidence required to validate or reject the hypothesis.',
    evidenceRequired: evidenceRequired,
    primaryDataSource: primaryDataSource,
    secondaryDataSource: secondaryDataSource,
    collectionMethod:
      'Review recent lease, sale, availability, tenant, pricing, absorption, capital markets, and broker-observed market signals.',
    collectionPriority: validationPriority,
    expectedEvidenceOutput:
      'Structured market evidence packet with supporting signals, counterevidence, source records, and confidence notes.'
  };
}

function sciipDeduplicateEvidenceCollectionTaskRows580_(rows) {
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

function sciipTestEvidenceCollectionProcessor() {
  const result = sciipRunEvidenceCollectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestEvidenceCollectionProcessor',
    result: result
  }));

  return result;
}
