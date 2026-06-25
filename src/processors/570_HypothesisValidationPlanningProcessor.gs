/************************************************************
 * 570_HypothesisValidationPlanningProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - HYPOTHESES
 *
 * Output:
 * - HYPOTHESIS_VALIDATION_PLANS
 ************************************************************/

const HYPOTHESIS_VALIDATION_PLANS_SHEET =
  'HYPOTHESIS_VALIDATION_PLANS';

const HYPOTHESIS_VALIDATION_PLANS_HEADERS = [
  'Validation_Plan_ID',
  'Business_Key',
  'Plan_Date',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Hypothesis_Title',
  'Validation_Objective',
  'Validation_Method',
  'Evidence_Required',
  'Primary_Data_Source',
  'Secondary_Data_Source',
  'Validation_Priority',
  'Expected_Output',
  'Decision_Rule',
  'Confidence_Threshold',
  'Assigned_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureHypothesisValidationPlansSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(HYPOTHESIS_VALIDATION_PLANS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(HYPOTHESIS_VALIDATION_PLANS_SHEET);
  }

  sheet.getRange(1, 1, 1, HYPOTHESIS_VALIDATION_PLANS_HEADERS.length)
    .setValues([HYPOTHESIS_VALIDATION_PLANS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunHypothesisValidationPlanningProcessor() {
  const processor = '570_HypothesisValidationPlanningProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureHypothesisValidationPlansSchema();

  const planDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `HYPOTHESIS_VALIDATION_PLAN|${planDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      validationPlansCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const hypotheses = sciipGetRecordsByDate_(
    'HYPOTHESES',
    'Hypothesis_Date',
    planDate
  );

  if (hypotheses.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      hypothesesReviewed: 0,
      validationPlansCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const plans = sciipCreateHypothesisValidationPlans_({
    businessKey,
    planDate,
    hypotheses,
    processor
  });

  plans.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    hypothesesReviewed: hypotheses.length,
    validationPlansCreated: plans.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateHypothesisValidationPlans_(args) {
  const now = new Date();

  const rows = args.hypotheses.map(hypothesis => {
    const hypothesisId = sciipExtractFirstAvailable_(hypothesis, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(hypothesis, [
      'Hypothesis_Type'
    ]);

    const profile =
      sciipInferHypothesisValidationPlanProfile_(hypothesis);

    const rowKey =
      `${args.businessKey}|${hypothesisType}|${sciipNormalizeMissionKey_(hypothesisId || profile.validationObjective)}`;

    return [
      sciipGenerateId_('HVP'),
      rowKey,
      args.planDate,
      hypothesisId,
      hypothesisType,
      sciipExtractFirstAvailable_(hypothesis, ['Hypothesis_Title']),
      profile.validationObjective,
      profile.validationMethod,
      profile.evidenceRequired,
      profile.primaryDataSource,
      profile.secondaryDataSource,
      profile.validationPriority,
      profile.expectedOutput,
      profile.decisionRule,
      profile.confidenceThreshold,
      'PENDING_VALIDATION',
      `HYPOTHESES:${hypothesisId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisValidationPlanRows_(rows);
}

function sciipInferHypothesisValidationPlanProfile_(hypothesis) {
  const hypothesisType = sciipExtractFirstAvailable_(hypothesis, [
    'Hypothesis_Type'
  ]);

  const priority =
    sciipExtractFirstAvailable_(hypothesis, [
      'Validation_Priority'
    ]) || 'MEDIUM';

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether property-level evidence supports or rejects the hypothesis.',
      validationMethod:
        'Review asset registry, property events, GIS attributes, ownership facts, tenant activity, building characteristics, and broker-observed evidence.',
      evidenceRequired:
        'Verified property facts, current availability, ownership, tenant movement, physical attributes, power, yard, access, lease/sale activity, and market comparables.',
      primaryDataSource:
        'PROPERTY_REGISTRY; PROPERTY_EVENTS; ASSET_NODE; GIS_DATA',
      secondaryDataSource:
        'Broker notes; AIR CRE data; public records; listing materials',
      validationPriority: priority,
      expectedOutput:
        'Validated property hypothesis with supporting evidence, counterevidence, and recommended next action.',
      decisionRule:
        'Validate if two or more independent property-level evidence sources support the hypothesis and no material counterevidence invalidates it.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether company-level evidence supports or rejects the hypothesis.',
      validationMethod:
        'Review company activity, funding, hiring, permits, supplier relationships, OEM linkages, expansion indicators, and occupier movement.',
      evidenceRequired:
        'Company growth signals, operational footprint, real estate requirement indicators, funding events, hiring signals, facility movement, and relevant market activity.',
      primaryDataSource:
        'COMPANY_INTELLIGENCE; RESEARCH_MISSIONS; KNOWLEDGE_GRAPH_ENRICHMENT',
      secondaryDataSource:
        'Company website; news; permits; LinkedIn; broker intelligence',
      validationPriority: priority,
      expectedOutput:
        'Validated company hypothesis with likely requirement, timing, confidence, and recommended pursuit action.',
      decisionRule:
        'Validate if company activity indicates current or emerging industrial real estate demand.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether measurable risk exists and whether the risk affects a property, company, market, or SCIIP workflow.',
      validationMethod:
        'Review counterevidence, negative indicators, timing risk, vacancy exposure, tenant exposure, regulatory constraints, and market weakness signals.',
      evidenceRequired:
        'Risk indicators, affected entities, severity, timing, source confidence, counterevidence, and mitigation path.',
      primaryDataSource:
        'RISK_INTELLIGENCE_GRAPH; PROPERTY_EVENTS; STRATEGIC_INTELLIGENCE',
      secondaryDataSource:
        'Market reports; public records; broker intelligence; operator notes',
      validationPriority: 'HIGH',
      expectedOutput:
        'Validated risk assessment with severity, affected entities, and mitigation recommendation.',
      decisionRule:
        'Validate if risk is supported by credible evidence and has material impact on market, property, company, or system behavior.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether the hypothesis represents an actionable industrial market opportunity.',
      validationMethod:
        'Review demand signals, ownership fit, tenant movement, pricing gaps, supply constraints, timing, and competitive position.',
      evidenceRequired:
        'Demand evidence, actionable target, timing signal, property/company fit, market gap, and pursuit rationale.',
      primaryDataSource:
        'OPPORTUNITY_INTELLIGENCE_GRAPH; STRATEGIC_INTELLIGENCE; HYPOTHESES',
      secondaryDataSource:
        'Broker intelligence; listing data; tenant activity; ownership research',
      validationPriority: 'HIGH',
      expectedOutput:
        'Validated opportunity with target, timing, confidence, and recommended action path.',
      decisionRule:
        'Validate if the opportunity has clear target relevance, market timing, and supporting evidence sufficient for action.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    return {
      validationObjective:
        'Determine whether SCIIP workflow evidence supports a change to processor logic, graph structure, or operating behavior.',
      validationMethod:
        'Review processor outputs, duplicate patterns, missing fields, workflow friction, graph incompleteness, operator feedback, and automation readiness.',
      evidenceRequired:
        'System logs, processor results, skipped records, duplicate records, missing fields, graph gaps, and operator-observed friction.',
      primaryDataSource:
        'SYSTEM_HEALTH; PROCESSOR_LOGS; KNOWLEDGE_GRAPH_ENRICHMENT',
      secondaryDataSource:
        'Operator console; command center; daily reports',
      validationPriority: priority,
      expectedOutput:
        'Validated system improvement hypothesis with recommended processor, schema, graph, or workflow change.',
      decisionRule:
        'Validate if repeated system evidence shows that SCIIP behavior should be improved or automated.',
      confidenceThreshold: 'MEDIUM_OR_HIGH'
    };
  }

  return {
    validationObjective:
      'Determine whether market evidence supports or rejects the hypothesis.',
    validationMethod:
      'Review recent lease, sale, availability, tenant, capital markets, pricing, absorption, and broker-observed market evidence.',
    evidenceRequired:
      'Market signals, comparable activity, tenant demand, supply constraints, pricing movement, and counterevidence.',
    primaryDataSource:
      'STRATEGIC_INTELLIGENCE; HYPOTHESES; MARKET_SIGNALS',
    secondaryDataSource:
      'AIR CRE data; broker intelligence; market reports; listing data',
    validationPriority: priority,
    expectedOutput:
      'Validated market hypothesis with supporting evidence, confidence, and recommended next action.',
    decisionRule:
      'Validate if market evidence supports the hypothesis across multiple independent signals.',
    confidenceThreshold: 'MEDIUM_OR_HIGH'
  };
}

function sciipDeduplicateHypothesisValidationPlanRows_(rows) {
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

function sciipTestHypothesisValidationPlanningProcessor() {
  const result =
    sciipRunHypothesisValidationPlanningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisValidationPlanningProcessor',
    result
  }));

  return result;
}