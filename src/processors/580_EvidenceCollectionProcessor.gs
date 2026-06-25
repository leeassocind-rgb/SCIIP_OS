/************************************************************
 * 580_EvidenceCollectionProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - HYPOTHESIS_VALIDATION_PLANS
 *
 * Output:
 * - EVIDENCE_COLLECTION_TASKS
 ************************************************************/

const EVIDENCE_COLLECTION_TASKS_SHEET =
  'EVIDENCE_COLLECTION_TASKS';

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
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(EVIDENCE_COLLECTION_TASKS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(EVIDENCE_COLLECTION_TASKS_SHEET);
  }

  sheet.getRange(1, 1, 1, EVIDENCE_COLLECTION_TASKS_HEADERS.length)
    .setValues([EVIDENCE_COLLECTION_TASKS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunEvidenceCollectionProcessor() {
  const processor = '580_EvidenceCollectionProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureEvidenceCollectionTasksSchema();

  const taskDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `EVIDENCE_COLLECTION_TASK|${taskDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      evidenceTasksCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const validationPlans = sciipGetRecordsByDate_(
    'HYPOTHESIS_VALIDATION_PLANS',
    'Plan_Date',
    taskDate
  );

  if (validationPlans.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      validationPlansReviewed: 0,
      evidenceTasksCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const tasks = sciipCreateEvidenceCollectionTasks_({
    businessKey,
    taskDate,
    validationPlans,
    processor
  });

  tasks.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    validationPlansReviewed: validationPlans.length,
    evidenceTasksCreated: tasks.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateEvidenceCollectionTasks_(args) {
  const now = new Date();

  const rows = args.validationPlans.map(plan => {
    const validationPlanId = sciipExtractFirstAvailable_(plan, [
      'Validation_Plan_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(plan, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(plan, [
      'Hypothesis_Type'
    ]);

    const profile =
      sciipInferEvidenceCollectionProfile_(plan);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey_(validationPlanId || hypothesisId || profile.evidenceObjective)}`;

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
      `HYPOTHESIS_VALIDATION_PLANS:${validationPlanId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateEvidenceCollectionTaskRows_(rows);
}

function sciipInferEvidenceCollectionProfile_(plan) {
  const hypothesisType = sciipExtractFirstAvailable_(plan, [
    'Hypothesis_Type'
  ]);

  const validationPriority =
    sciipExtractFirstAvailable_(plan, [
      'Validation_Priority'
    ]) || 'MEDIUM';

  const evidenceRequired =
    sciipExtractFirstAvailable_(plan, [
      'Evidence_Required'
    ]);

  const primaryDataSource =
    sciipExtractFirstAvailable_(plan, [
      'Primary_Data_Source'
    ]);

  const secondaryDataSource =
    sciipExtractFirstAvailable_(plan, [
      'Secondary_Data_Source'
    ]);

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    return {
      evidenceTaskType: 'PROPERTY_EVIDENCE_COLLECTION',
      evidenceObjective:
        'Collect property-level evidence required to validate or reject the hypothesis.',
      evidenceRequired,
      primaryDataSource,
      secondaryDataSource,
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
      evidenceRequired,
      primaryDataSource,
      secondaryDataSource,
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
      evidenceRequired,
      primaryDataSource,
      secondaryDataSource,
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
      evidenceRequired,
      primaryDataSource,
      secondaryDataSource,
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
      evidenceRequired,
      primaryDataSource,
      secondaryDataSource,
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
    evidenceRequired,
    primaryDataSource,
    secondaryDataSource,
    collectionMethod:
      'Review recent lease, sale, availability, tenant, pricing, absorption, capital markets, and broker-observed market signals.',
    collectionPriority: validationPriority,
    expectedEvidenceOutput:
      'Structured market evidence packet with supporting signals, counterevidence, source records, and confidence notes.'
  };
}

function sciipDeduplicateEvidenceCollectionTaskRows_(rows) {
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

function sciipTestEvidenceCollectionProcessor() {
  const result =
    sciipRunEvidenceCollectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestEvidenceCollectionProcessor',
    result
  }));

  return result;
}