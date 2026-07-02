/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 570_HypothesisValidationPlanningProcessor
 *
 * HYPOTHESES → HYPOTHESIS_VALIDATION_PLANS
 *
 * Migration note:
 * Preserves original 570 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR = '570_HypothesisValidationPlanningProcessor';
const HYPOTHESIS_VALIDATION_PLANS_SHEET = 'HYPOTHESIS_VALIDATION_PLANS';

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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    HYPOTHESIS_VALIDATION_PLANS_SHEET,
    HYPOTHESIS_VALIDATION_PLANS_HEADERS
  );
}

function sciipRunHypothesisValidationPlanningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
    action: 'HYPOTHESIS_VALIDATION_PLANS_BUILD',
    sourceSheet: 'HYPOTHESES',
    targetSheet: HYPOTHESIS_VALIDATION_PLANS_SHEET,
    ledgerSheet: 'HYPOTHESIS_VALIDATION_PLANS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const hypotheses = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('HYPOTHESES');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: hypotheses.length,
        outputCount: hypotheses.length || 1,
        summary: 'Hypothesis validation planning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
          inputSheets: ['HYPOTHESES']
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
      const outputSheet = sciipEnsureHypothesisValidationPlansSchema();
      const planDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const validationPlanBusinessKey = 'HYPOTHESIS_VALIDATION_PLAN|' + planDate;

      if (sciipRuntimeBusinessKeyPrefixExists570_(definition.targetSheet, validationPlanBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            validationPlansCreated: 0,
            skippedDuplicate: 1,
            validationPlanBusinessKey: validationPlanBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const hypotheses = sciipGetRuntimeRecordsByDate570_(
        'HYPOTHESES',
        'Hypothesis_Date',
        planDate
      );

      if (hypotheses.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            hypothesesReviewed: 0,
            validationPlansCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const plans = sciipCreateHypothesisValidationPlans570_({
        businessKey: validationPlanBusinessKey,
        planDate: planDate,
        hypotheses: hypotheses,
        processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR
      });

      plans.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: HYPOTHESIS_VALIDATION_PLANNING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: plans.length,
        recordsRead: hypotheses.length,
        processed: plans.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          hypothesesReviewed: hypotheses.length,
          validationPlansCreated: plans.length,
          skippedDuplicate: 0,
          validationPlanBusinessKey: validationPlanBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists570_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate570_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue570_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue570_(value) {
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

function sciipExtractFirstAvailable570_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey570_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateHypothesisValidationPlans570_(args) {
  const now = new Date();

  const rows = args.hypotheses.map(function(hypothesis) {
    const hypothesisId = sciipExtractFirstAvailable570_(hypothesis, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable570_(hypothesis, [
      'Hypothesis_Type'
    ]);

    const profile = sciipInferHypothesisValidationPlanProfile570_(hypothesis);

    const rowKey =
      args.businessKey + '|' + hypothesisType + '|' +
      sciipNormalizeMissionKey570_(hypothesisId || profile.validationObjective);

    return [
      sciipGenerateId_('HVP'),
      rowKey,
      args.planDate,
      hypothesisId,
      hypothesisType,
      sciipExtractFirstAvailable570_(hypothesis, ['Hypothesis_Title']),
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
      'HYPOTHESES:' + hypothesisId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateHypothesisValidationPlanRows570_(rows);
}

function sciipInferHypothesisValidationPlanProfile570_(hypothesis) {
  const hypothesisType = sciipExtractFirstAvailable570_(hypothesis, [
    'Hypothesis_Type'
  ]);

  const priority =
    sciipExtractFirstAvailable570_(hypothesis, [
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


function sciipDeduplicateHypothesisValidationPlanRows570_(rows) {
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

function sciipTestHypothesisValidationPlanningProcessor() {
  const result = sciipRunHypothesisValidationPlanningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestHypothesisValidationPlanningProcessor',
    result: result
  }));

  return result;
}
