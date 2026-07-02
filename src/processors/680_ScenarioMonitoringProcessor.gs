/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 680_ScenarioMonitoringProcessor
 *
 * PREDICTIVE_SCENARIOS → SCENARIO_MONITORING
 *
 * Migration note:
 * Preserves original 680 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const SCENARIO_MONITORING_PROCESSOR = '680_ScenarioMonitoringProcessor';
const SCENARIO_MONITORING_SHEET = 'SCENARIO_MONITORING';

const SCENARIO_MONITORING_HEADERS = [
  'Monitoring_ID',
  'Business_Key',
  'Monitoring_Date',
  'Scenario_ID',
  'Reasoning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Scenario_Type',
  'Monitoring_Type',
  'Monitoring_Title',
  'Monitoring_Objective',
  'Trigger_Condition',
  'Early_Indicators',
  'Primary_Monitoring_Source',
  'Secondary_Monitoring_Source',
  'Escalation_Condition',
  'Recommended_Response',
  'Monitoring_Frequency',
  'Monitoring_Priority',
  'Monitoring_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureScenarioMonitoringSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SCENARIO_MONITORING_SHEET,
    SCENARIO_MONITORING_HEADERS
  );
}

function sciipRunScenarioMonitoringProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SCENARIO_MONITORING_PROCESSOR,
    action: 'SCENARIO_MONITORING_BUILD',
    sourceSheet: 'PREDICTIVE_SCENARIOS',
    targetSheet: SCENARIO_MONITORING_SHEET,
    ledgerSheet: 'SCENARIO_MONITORING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const scenarios = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PREDICTIVE_SCENARIOS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: scenarios.length,
        outputCount: scenarios.length || 1,
        summary: 'Scenario monitoring runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: SCENARIO_MONITORING_PROCESSOR,
          inputSheets: ['PREDICTIVE_SCENARIOS']
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
      const outputSheet = sciipEnsureScenarioMonitoringSchema();
      const monitoringDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const monitoringBusinessKey = 'SCENARIO_MONITORING|' + monitoringDate;

      if (sciipRuntimeBusinessKeyPrefixExists680_(definition.targetSheet, monitoringBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: SCENARIO_MONITORING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            monitoringRequirementsCreated: 0,
            skippedDuplicate: 1,
            monitoringBusinessKey: monitoringBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const scenarios = sciipGetRuntimeRecordsByDate680_(
        'PREDICTIVE_SCENARIOS',
        'Scenario_Date',
        monitoringDate
      );

      if (scenarios.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: SCENARIO_MONITORING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            scenariosReviewed: 0,
            monitoringRequirementsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const monitoringRequirements = sciipCreateScenarioMonitoringRequirements680_({
        businessKey: monitoringBusinessKey,
        monitoringDate: monitoringDate,
        scenarios: scenarios,
        processor: SCENARIO_MONITORING_PROCESSOR
      });

      monitoringRequirements.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SCENARIO_MONITORING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: monitoringRequirements.length,
        recordsRead: scenarios.length,
        processed: monitoringRequirements.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          scenariosReviewed: scenarios.length,
          monitoringRequirementsCreated: monitoringRequirements.length,
          skippedDuplicate: 0,
          monitoringBusinessKey: monitoringBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists680_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate680_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue680_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue680_(value) {
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

function sciipExtractFirstAvailable680_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey680_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateScenarioMonitoringRequirements680_(args) {
  const now = new Date();

  const rows = args.scenarios.map(function(scenario) {
    const scenarioId = sciipExtractFirstAvailable680_(scenario, [
      'Scenario_ID'
    ]);

    const reasoningId = sciipExtractFirstAvailable680_(scenario, [
      'Reasoning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable680_(scenario, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable680_(scenario, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable680_(scenario, [
      'Signal_Category'
    ]);

    const scenarioType = sciipExtractFirstAvailable680_(scenario, [
      'Scenario_Type'
    ]);

    const profile =
      sciipInferScenarioMonitoringProfile680_(scenario);

    const rowKey =
      `${args.businessKey}|${profile.monitoringType}|${sciipNormalizeMissionKey680_(scenarioId || reasoningId || hypothesisId || profile.monitoringTitle)}`;

    return [
      sciipGenerateId_('MON'),
      rowKey,
      args.monitoringDate,
      scenarioId,
      reasoningId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      scenarioType,
      profile.monitoringType,
      profile.monitoringTitle,
      profile.monitoringObjective,
      profile.triggerCondition,
      profile.earlyIndicators,
      profile.primaryMonitoringSource,
      profile.secondaryMonitoringSource,
      profile.escalationCondition,
      profile.recommendedResponse,
      profile.monitoringFrequency,
      profile.monitoringPriority,
      'ACTIVE_MONITORING_REQUIREMENT',
      `PREDICTIVE_SCENARIOS:${scenarioId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateScenarioMonitoringRows680_(rows);
}

function sciipInferScenarioMonitoringProfile680_(scenario) {
  const hypothesisType = sciipExtractFirstAvailable680_(scenario, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable680_(scenario, [
    'Signal_Category'
  ]);

  const scenarioType = sciipExtractFirstAvailable680_(scenario, [
    'Scenario_Type'
  ]);

  const scenarioTitle = sciipExtractFirstAvailable680_(scenario, [
    'Scenario_Title'
  ]);

  const probabilityAssessment = sciipExtractFirstAvailable680_(scenario, [
    'Probability_Assessment'
  ]);

  const strategicImplication = sciipExtractFirstAvailable680_(scenario, [
    'Strategic_Implication'
  ]);

  const marketImplication = sciipExtractFirstAvailable680_(scenario, [
    'Market_Implication'
  ]);

  const operatingImplication = sciipExtractFirstAvailable680_(scenario, [
    'Operating_Implication'
  ]);

  const earlyIndicators =
    sciipExtractFirstAvailable680_(scenario, [
      'Early_Indicators'
    ]) || 'Repeated signals, corroborating evidence, counterevidence, or operator-confirmed changes.';

  const monitoringAction =
    sciipExtractFirstAvailable680_(scenario, [
      'Monitoring_Action'
    ]) || 'Monitor for additional evidence and related signals.';

  const scenarioConfidence =
    sciipExtractFirstAvailable680_(scenario, [
      'Scenario_Confidence'
    ]) || 'LOW';

  let monitoringType = 'GENERAL_SCENARIO_MONITORING';
  let monitoringTitle = `Monitor scenario: ${scenarioTitle || signalCategory || 'general scenario'}`;
  let monitoringObjective =
    'Monitor whether the predictive scenario strengthens, weakens, or requires operator review.';
  let triggerCondition =
    'Trigger review when matching signals repeat, confidence increases, or new source evidence materially changes the scenario.';
  let primaryMonitoringSource =
    'PREDICTIVE_SCENARIOS; AUTONOMOUS_REASONING; STRATEGIC_MEMORY';
  let secondaryMonitoringSource =
    'Broker intelligence; property events; company research; market observations; operator notes';
  let escalationCondition =
    'Escalate when evidence moves the scenario from possible to likely, when risk/opportunity impact becomes material, or when conflicting evidence requires review.';
  let recommendedResponse =
    monitoringAction;
  let monitoringFrequency = 'DAILY';
  let monitoringPriority =
    scenarioConfidence === 'MEDIUM' ? 'MEDIUM' : 'LOW';

  const scenarioTypeText = String(scenarioType || '').toUpperCase();
  const probabilityText = String(probabilityAssessment || '').toUpperCase();

  if (
    scenarioTypeText.includes('REINFORCED') ||
    probabilityText === 'LIKELY'
  ) {
    monitoringType = 'REINFORCED_PATTERN_MONITORING';
    monitoringObjective =
      'Monitor whether the reinforced pattern continues to appear across new intelligence records.';
    triggerCondition =
      'Trigger escalation when two or more new related signals support the same reinforced pattern.';
    escalationCondition =
      'Escalate into intelligence requirement or opportunity/risk review if the reinforced pattern repeats with credible evidence.';
    monitoringPriority = 'HIGH';
  }

  if (
    scenarioTypeText.includes('WEAKENED') ||
    scenarioTypeText.includes('SUPPRESSION')
  ) {
    monitoringType = 'WEAKENED_PATTERN_MONITORING';
    monitoringObjective =
      'Monitor whether a weakened or suppressed pattern remains weak or is revived by stronger evidence.';
    triggerCondition =
      'Trigger review only when stronger corroborating evidence appears against the previously weakened pattern.';
    escalationCondition =
      'Escalate only if new source evidence is materially stronger than the evidence that caused suppression.';
    monitoringPriority = 'MEDIUM';
  }

  if (
    scenarioTypeText.includes('OPERATOR_REVIEW') ||
    probabilityText === 'REQUIRES_REVIEW'
  ) {
    monitoringType = 'OPERATOR_REVIEW_MONITORING';
    monitoringObjective =
      'Monitor unresolved or governed scenarios that require operator review before autonomous escalation.';
    triggerCondition =
      'Trigger operator review when conflicting evidence, contested validation, or high-priority unresolved reasoning appears.';
    escalationCondition =
      'Escalate directly to operator review before changing graph confidence, signal weights, or processor behavior.';
    recommendedResponse =
      'Prepare operator-review packet with scenario, reasoning, memory, evidence basis, and monitoring indicators.';
    monitoringPriority = 'HIGH';
  }

  if (scenarioTypeText.includes('STABILITY')) {
    monitoringType = 'STABILITY_MONITORING';
    monitoringObjective =
      'Monitor stable scenarios without changing processor behavior unless stronger evidence appears.';
    triggerCondition =
      'Trigger review only when new evidence materially changes scenario probability or confidence.';
    escalationCondition =
      'Escalate only after repeated corroborating evidence accumulates.';
    monitoringFrequency = 'DAILY';
    monitoringPriority = 'LOW';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    monitoringType = `PROPERTY_${monitoringType}`;
    monitoringTitle = 'Property scenario monitoring';
    primaryMonitoringSource =
      'PROPERTY_REGISTRY; PROPERTY_EVENTS; ASSET_NODE; GIS_DATA';
    secondaryMonitoringSource =
      'Broker notes; AIR CRE data; public records; listing materials; ownership records';
    triggerCondition =
      'Trigger review when property events, ownership changes, tenant activity, availability, GIS attributes, power, yard, or comparable activity changes.';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    monitoringType = `COMPANY_${monitoringType}`;
    monitoringTitle = 'Company scenario monitoring';
    primaryMonitoringSource =
      'COMPANY_INTELLIGENCE; RESEARCH_MISSIONS; KNOWLEDGE_GRAPH_ENRICHMENT';
    secondaryMonitoringSource =
      'Company website; news; permits; LinkedIn; funding data; broker intelligence';
    triggerCondition =
      'Trigger review when company funding, hiring, permits, facility movement, supplier relationships, OEM linkages, or occupier signals change.';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    monitoringType = `RISK_${monitoringType}`;
    monitoringTitle = 'Risk scenario monitoring';
    primaryMonitoringSource =
      'RISK_INTELLIGENCE_GRAPH; PROPERTY_EVENTS; STRATEGIC_INTELLIGENCE';
    secondaryMonitoringSource =
      'Market reports; public records; broker intelligence; operator notes';
    escalationCondition =
      'Escalate immediately when severity, affected entities, timing risk, or mitigation urgency becomes material.';
    recommendedResponse =
      'Route into risk review, counterevidence collection, and possible alerting.';
    monitoringPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    monitoringType = `OPPORTUNITY_${monitoringType}`;
    monitoringTitle = 'Opportunity scenario monitoring';
    primaryMonitoringSource =
      'OPPORTUNITY_INTELLIGENCE_GRAPH; STRATEGIC_INTELLIGENCE; HYPOTHESES';
    secondaryMonitoringSource =
      'Broker intelligence; listing data; tenant activity; ownership research';
    escalationCondition =
      'Escalate when demand, timing, target fit, ownership fit, or pricing gap becomes actionable.';
    recommendedResponse =
      'Route into opportunity review, target validation, and possible action recommendation.';
    monitoringPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    monitoringType = `SYSTEM_${monitoringType}`;
    monitoringTitle = 'Operating system scenario monitoring';
    primaryMonitoringSource =
      'SYSTEM_HEALTH; PROCESSOR_LOGS; AUTONOMOUS_MODEL_CALIBRATION';
    secondaryMonitoringSource =
      'Operator console; command center; daily reports; processor execution logs';
    triggerCondition =
      'Trigger review when processor friction, skipped records, duplicate patterns, missing fields, graph gaps, or operator feedback repeats.';
    recommendedResponse =
      'Route into processor improvement, schema review, workflow automation, or graph completeness review.';
  }

  const monitoringObjectiveText = [
    monitoringObjective,
    `Strategic implication: ${strategicImplication || 'No strategic implication recorded.'}`,
    `Market implication: ${marketImplication || 'No market implication recorded.'}`,
    `Operating implication: ${operatingImplication || 'No operating implication recorded.'}`
  ].join('\n');

  return {
    monitoringType,
    monitoringTitle,
    monitoringObjective: monitoringObjectiveText,
    triggerCondition,
    earlyIndicators,
    primaryMonitoringSource,
    secondaryMonitoringSource,
    escalationCondition,
    recommendedResponse,
    monitoringFrequency,
    monitoringPriority
  };
}

function sciipDeduplicateScenarioMonitoringRows680_(rows) {
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

function sciipTestScenarioMonitoringProcessor() {
  const result =
    sciipRunScenarioMonitoringProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestScenarioMonitoringProcessor',
    result: result
  }));

  return result;
}
