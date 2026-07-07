/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 670_PredictiveScenarioProcessor
 *
 * AUTONOMOUS_REASONING → PREDICTIVE_SCENARIOS
 *
 * Migration note:
 * Preserves original 670 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const PREDICTIVE_SCENARIO_PROCESSOR = '670_PredictiveScenarioProcessor';
const PREDICTIVE_SCENARIOS_SHEET = 'PREDICTIVE_SCENARIOS';

const PREDICTIVE_SCENARIOS_HEADERS = [
  'Scenario_ID',
  'Business_Key',
  'Scenario_Date',
  'Reasoning_ID',
  'Memory_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Reasoning_Type',
  'Scenario_Type',
  'Scenario_Title',
  'Scenario_Statement',
  'Scenario_Driver',
  'Expected_Direction',
  'Probability_Assessment',
  'Strategic_Implication',
  'Market_Implication',
  'Operating_Implication',
  'Early_Indicators',
  'Monitoring_Action',
  'Scenario_Confidence',
  'Scenario_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsurePredictiveScenariosSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    PREDICTIVE_SCENARIOS_SHEET,
    PREDICTIVE_SCENARIOS_HEADERS
  );
}

function sciipRunPredictiveScenarioProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: PREDICTIVE_SCENARIO_PROCESSOR,
    action: 'PREDICTIVE_SCENARIO_BUILD',
    sourceSheet: 'AUTONOMOUS_REASONING',
    targetSheet: PREDICTIVE_SCENARIOS_SHEET,
    ledgerSheet: 'PREDICTIVE_SCENARIOS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const reasoningOutputs = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_REASONING');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: reasoningOutputs.length,
        outputCount: reasoningOutputs.length || 1,
        summary: 'Predictive scenario runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: PREDICTIVE_SCENARIO_PROCESSOR,
          inputSheets: ['AUTONOMOUS_REASONING']
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
      const outputSheet = sciipEnsurePredictiveScenariosSchema();
      const scenarioDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const scenarioBusinessKey = 'PREDICTIVE_SCENARIO|' + scenarioDate;

      if (sciipRuntimeBusinessKeyPrefixExists670_(definition.targetSheet, scenarioBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: PREDICTIVE_SCENARIO_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            scenariosCreated: 0,
            skippedDuplicate: 1,
            scenarioBusinessKey: scenarioBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const reasoningOutputs = sciipGetRuntimeRecordsByDate670_(
        'AUTONOMOUS_REASONING',
        'Reasoning_Date',
        scenarioDate
      );

      if (reasoningOutputs.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: PREDICTIVE_SCENARIO_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            reasoningOutputsReviewed: 0,
            scenariosCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const scenarios = sciipCreatePredictiveScenarios670_({
        businessKey: scenarioBusinessKey,
        scenarioDate: scenarioDate,
        reasoningOutputs: reasoningOutputs,
        processor: PREDICTIVE_SCENARIO_PROCESSOR
      });

      scenarios.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: PREDICTIVE_SCENARIO_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: scenarios.length,
        recordsRead: reasoningOutputs.length,
        processed: scenarios.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          reasoningOutputsReviewed: reasoningOutputs.length,
          scenariosCreated: scenarios.length,
          skippedDuplicate: 0,
          scenarioBusinessKey: scenarioBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists670_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate670_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue670_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue670_(value) {
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

function sciipExtractFirstAvailable670_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey670_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreatePredictiveScenarios670_(args) {
  const now = new Date();

  const rows = args.reasoningOutputs.map(function(reasoning) {
    const reasoningId = sciipExtractFirstAvailable670_(reasoning, [
      'Reasoning_ID'
    ]);

    const memoryId = sciipExtractFirstAvailable670_(reasoning, [
      'Memory_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable670_(reasoning, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable670_(reasoning, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable670_(reasoning, [
      'Signal_Category'
    ]);

    const reasoningType = sciipExtractFirstAvailable670_(reasoning, [
      'Reasoning_Type'
    ]);

    const profile =
      sciipInferPredictiveScenarioProfile670_(reasoning);

    const rowKey =
      args.businessKey + '|' + profile.scenarioType + '|' + sciipNormalizeMissionKey670_(reasoningId || memoryId || hypothesisId || profile.scenarioTitle);

    return [
      sciipGenerateId_('SCN'),
      rowKey,
      args.scenarioDate,
      reasoningId,
      memoryId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      reasoningType,
      profile.scenarioType,
      profile.scenarioTitle,
      profile.scenarioStatement,
      profile.scenarioDriver,
      profile.expectedDirection,
      profile.probabilityAssessment,
      profile.strategicImplication,
      profile.marketImplication,
      profile.operatingImplication,
      profile.earlyIndicators,
      profile.monitoringAction,
      profile.scenarioConfidence,
      'ACTIVE_SCENARIO',
      'AUTONOMOUS_REASONING:' + reasoningId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicatePredictiveScenarioRows670_(rows);
}

function sciipInferPredictiveScenarioProfile670_(reasoning) {
  const hypothesisType = sciipExtractFirstAvailable670_(reasoning, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable670_(reasoning, [
    'Signal_Category'
  ]);

  const reasoningType = sciipExtractFirstAvailable670_(reasoning, [
    'Reasoning_Type'
  ]);

  const strategicInterpretation = sciipExtractFirstAvailable670_(reasoning, [
    'Strategic_Interpretation'
  ]);

  const futureImplication = sciipExtractFirstAvailable670_(reasoning, [
    'Future_Implication'
  ]);

  const recommendedIntelligenceAction = sciipExtractFirstAvailable670_(reasoning, [
    'Recommended_Intelligence_Action'
  ]);

  const recommendedOperatingAction = sciipExtractFirstAvailable670_(reasoning, [
    'Recommended_Operating_Action'
  ]);

  const nextStrategicQuestion = sciipExtractFirstAvailable670_(reasoning, [
    'Next_Strategic_Question'
  ]);

  const reasoningConfidence =
    sciipExtractFirstAvailable670_(reasoning, [
      'Reasoning_Confidence'
    ]) || 'LOW';

  let scenarioType = 'GENERAL_MARKET_SCENARIO';
  let scenarioTitle = 'Predictive scenario: ' + (signalCategory || 'general signal');
  let scenarioDriver =
    signalCategory || 'General SCIIP intelligence signal';
  let expectedDirection = 'UNCERTAIN';
  let probabilityAssessment = 'POSSIBLE';
  let strategicImplication =
    futureImplication || 'This scenario may affect future SCIIP reasoning and intelligence prioritization.';
  let marketImplication =
    'Market implication is not yet specific enough for autonomous conclusion.';
  let operatingImplication =
    recommendedOperatingAction || 'Continue monitoring through future SCIIP processors.';
  let earlyIndicators =
    'Additional related signals, repeated evidence patterns, stronger source confirmation, or operator validation.';
  let monitoringAction =
    recommendedIntelligenceAction || 'Monitor for additional evidence and related signals.';
  let scenarioConfidence = reasoningConfidence;

  const reasoningTypeText = String(reasoningType || '').toUpperCase();

  if (reasoningTypeText === 'REINFORCEMENT_REASONING') {
    scenarioType = 'REINFORCED_PATTERN_SCENARIO';
    expectedDirection = 'INCREASING_RELEVANCE';
    probabilityAssessment = reasoningConfidence === 'MEDIUM' ? 'LIKELY' : 'POSSIBLE';
    marketImplication =
      'The underlying signal pattern may become more important if repeated across additional properties, companies, or market events.';
    earlyIndicators =
      'Repeated matching signals, stronger corroborating evidence, additional related hypotheses, or increased confidence from future validation.';
  }

  if (reasoningTypeText === 'SUPPRESSION_REASONING') {
    scenarioType = 'WEAKENED_PATTERN_SCENARIO';
    expectedDirection = 'DECREASING_RELEVANCE';
    probabilityAssessment = 'POSSIBLE';
    marketImplication =
      'The underlying signal pattern may be less reliable unless stronger supporting evidence appears.';
    earlyIndicators =
      'Repeated weak signals without corroboration, rejected hypotheses, contradictory evidence, or declining confidence.';
  }

  if (reasoningTypeText === 'GOVERNED_REASONING') {
    scenarioType = 'OPERATOR_REVIEW_SCENARIO';
    expectedDirection = 'PENDING_OPERATOR_DECISION';
    probabilityAssessment = 'REQUIRES_REVIEW';
    strategicImplication =
      'SCIIP should not autonomously resolve this scenario until operator review clarifies the proper reasoning path.';
    operatingImplication =
      'Route similar future cases to operator review before changing confidence, weight, or graph structure.';
    earlyIndicators =
      'Conflicting evidence, contested validation outcomes, high-priority unresolved reasoning, or repeated review flags.';
    monitoringAction =
      'Prepare operator-review packets and preserve supporting evidence and counterevidence.';
    scenarioConfidence = 'MEDIUM';
  }

  if (reasoningTypeText === 'STABILITY_REASONING') {
    scenarioType = 'STABILITY_SCENARIO';
    expectedDirection = 'BASELINE_CONTINUITY';
    probabilityAssessment = 'POSSIBLE';
    strategicImplication =
      'SCIIP should preserve the signal but avoid changing future model behavior until stronger evidence accumulates.';
    operatingImplication =
      'Maintain baseline processor behavior while monitoring for new evidence.';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    scenarioTitle = 'Property predictive scenario';
    scenarioDriver = 'Property-level intelligence signal';
    marketImplication =
      'The scenario may affect property-level opportunity, risk, availability, tenant movement, asset confidence, or GIS-based reasoning.';
    earlyIndicators =
      'New property events, ownership changes, tenant activity, listing changes, GIS attribute updates, power/yard changes, or comparable activity.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    scenarioTitle = 'Company predictive scenario';
    scenarioDriver = 'Company-level intelligence signal';
    marketImplication =
      'The scenario may indicate future occupier movement, expansion, contraction, supplier activity, OEM linkage, or real estate demand.';
    earlyIndicators =
      'Funding, hiring, permits, facility movement, supplier announcements, OEM relationships, lease activity, or operational expansion.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    scenarioTitle = 'Risk predictive scenario';
    scenarioDriver = 'Risk intelligence signal';
    scenarioType = 'RISK_' + scenarioType;
    probabilityAssessment =
      probabilityAssessment === 'REQUIRES_REVIEW' ? probabilityAssessment : 'POSSIBLE';
    strategicImplication =
      'This scenario may expose a measurable risk that should be monitored for severity, timing, affected entities, and mitigation pathway.';
    operatingImplication =
      'Route into risk monitoring, counterevidence collection, and future alerting if repeated or strengthened.';
    earlyIndicators =
      'Negative market signals, vacancy exposure, tenant exposure, regulatory constraints, timing delays, contradictory evidence, or broker-observed weakness.';
    scenarioConfidence = reasoningConfidence === 'LOW' ? 'MEDIUM' : reasoningConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    scenarioTitle = 'Opportunity predictive scenario';
    scenarioDriver = 'Opportunity intelligence signal';
    scenarioType = 'OPPORTUNITY_' + scenarioType;
    strategicImplication =
      'This scenario may indicate an actionable opportunity if demand, timing, ownership fit, pricing, and target relevance are confirmed.';
    operatingImplication =
      'Route into opportunity monitoring, target validation, and future action recommendation if strengthened.';
    earlyIndicators =
      'Tenant demand, pricing gaps, ownership fit, limited supply, expansion signals, off-market movement, or repeated opportunity hypotheses.';
    scenarioConfidence = reasoningConfidence === 'LOW' ? 'MEDIUM' : reasoningConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    scenarioTitle = 'Operating system predictive scenario';
    scenarioDriver = 'SCIIP operating-system signal';
    scenarioType = 'SYSTEM_' + scenarioType;
    marketImplication =
      'Market implication is indirect; the scenario primarily affects SCIIP reasoning quality and operating performance.';
    operatingImplication =
      'Evaluate whether processor logic, schema design, graph completeness, workflow automation, or operator routing should change.';
    earlyIndicators =
      'Repeated processor friction, skipped records, duplicate patterns, missing fields, graph gaps, failed validation paths, or operator feedback.';
  }

  const scenarioStatement = [
    'SCIIP generated a forward-looking scenario from autonomous reasoning.',
    'Reasoning type: ' + (reasoningType || 'UNKNOWN') + '.',
    'Signal category: ' + (signalCategory || 'UNKNOWN') + '.',
    'Strategic interpretation: ' + (strategicInterpretation || 'No strategic interpretation recorded.'),
    'Future implication: ' + (futureImplication || 'No future implication recorded.'),
    'Next strategic question: ' + (nextStrategicQuestion || 'No next strategic question recorded.')
  ].join('\n');

  return {
    scenarioType: scenarioType,
    scenarioTitle: scenarioTitle,
    scenarioStatement: scenarioStatement,
    scenarioDriver: scenarioDriver,
    expectedDirection: expectedDirection,
    probabilityAssessment: probabilityAssessment,
    strategicImplication: strategicImplication,
    marketImplication: marketImplication,
    operatingImplication: operatingImplication,
    earlyIndicators: earlyIndicators,
    monitoringAction: monitoringAction,
    scenarioConfidence: scenarioConfidence
  };
}

function sciipDeduplicatePredictiveScenarioRows670_(rows) {
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

function sciipTestPredictiveScenarioProcessor() {
  const result =
    sciipRunPredictiveScenarioProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestPredictiveScenarioProcessor',
    result: result
  }));

  return result;
}
