/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 690_MonitoringSignalDetectionProcessor
 *
 * SCENARIO_MONITORING → MONITORING_SIGNALS
 *
 * Migration note:
 * Preserves original 690 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const MONITORING_SIGNAL_DETECTION_PROCESSOR = '690_MonitoringSignalDetectionProcessor';
const MONITORING_SIGNALS_SHEET =
  'MONITORING_SIGNALS';

const MONITORING_SIGNALS_HEADERS = [
  'Monitoring_Signal_ID',
  'Business_Key',
  'Signal_Date',
  'Monitoring_ID',
  'Scenario_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Monitoring_Type',
  'Detected_Signal_Type',
  'Detected_Signal_Title',
  'Detected_Signal_Statement',
  'Detection_Basis',
  'Trigger_Condition',
  'Trigger_State',
  'Escalation_Readiness',
  'Recommended_Action_Route',
  'Signal_Confidence',
  'Signal_Priority',
  'Signal_Status',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];


function sciipEnsureMonitoringSignalsSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    MONITORING_SIGNALS_SHEET,
    MONITORING_SIGNALS_HEADERS
  );
}

function sciipRunMonitoringSignalDetectionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
    action: 'MONITORING_SIGNAL_DETECTION_BUILD',
    sourceSheet: 'SCENARIO_MONITORING',
    targetSheet: MONITORING_SIGNALS_SHEET,
    ledgerSheet: 'MONITORING_SIGNAL_DETECTION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const monitoringRequirements = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCENARIO_MONITORING');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: monitoringRequirements.length,
        outputCount: monitoringRequirements.length || 1,
        summary: 'Monitoring signal detection runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
          inputSheets: ['SCENARIO_MONITORING']
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
      const outputSheet = sciipEnsureMonitoringSignalsSchema();
      const signalDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const monitoringSignalBusinessKey = 'MONITORING_SIGNAL|' + signalDate;

      if (sciipRuntimeBusinessKeyPrefixExists690_(definition.targetSheet, monitoringSignalBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            monitoringSignalsCreated: 0,
            skippedDuplicate: 1,
            monitoringSignalBusinessKey: monitoringSignalBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const monitoringRequirements = sciipGetRuntimeRecordsByDate690_(
        'SCENARIO_MONITORING',
        'Monitoring_Date',
        signalDate
      );

      if (monitoringRequirements.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            monitoringRequirementsReviewed: 0,
            monitoringSignalsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const signals = sciipCreateMonitoringSignals690_({
        businessKey: monitoringSignalBusinessKey,
        signalDate: signalDate,
        monitoringRequirements: monitoringRequirements,
        processor: MONITORING_SIGNAL_DETECTION_PROCESSOR
      });

      signals.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: MONITORING_SIGNAL_DETECTION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: signals.length,
        recordsRead: monitoringRequirements.length,
        processed: signals.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          monitoringRequirementsReviewed: monitoringRequirements.length,
          monitoringSignalsCreated: signals.length,
          skippedDuplicate: 0,
          monitoringSignalBusinessKey: monitoringSignalBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists690_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate690_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue690_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue690_(value) {
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

function sciipExtractFirstAvailable690_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey690_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateMonitoringSignals690_(args) {
  const now = new Date();

  const rows = args.monitoringRequirements.map(monitoring => {
    const monitoringId = sciipExtractFirstAvailable690_(monitoring, [
      'Monitoring_ID'
    ]);

    const scenarioId = sciipExtractFirstAvailable690_(monitoring, [
      'Scenario_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable690_(monitoring, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable690_(monitoring, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable690_(monitoring, [
      'Signal_Category'
    ]);

    const monitoringType = sciipExtractFirstAvailable690_(monitoring, [
      'Monitoring_Type'
    ]);

    const profile =
      sciipInferMonitoringSignalProfile690_(monitoring);

    const rowKey =
      `${args.businessKey}|${profile.detectedSignalType}|${sciipNormalizeMissionKey690_(monitoringId || scenarioId || hypothesisId || profile.detectedSignalTitle)}`;

    return [
      sciipGenerateId_('MSG'),
      rowKey,
      args.signalDate,
      monitoringId,
      scenarioId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      monitoringType,
      profile.detectedSignalType,
      profile.detectedSignalTitle,
      profile.detectedSignalStatement,
      profile.detectionBasis,
      profile.triggerCondition,
      profile.triggerState,
      profile.escalationReadiness,
      profile.recommendedActionRoute,
      profile.signalConfidence,
      profile.signalPriority,
      'DETECTED_MONITORING_SIGNAL',
      `SCENARIO_MONITORING:${monitoringId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateMonitoringSignalRows690_(rows);
}

function sciipInferMonitoringSignalProfile690_(monitoring) {
  const hypothesisType = sciipExtractFirstAvailable690_(monitoring, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable690_(monitoring, [
    'Signal_Category'
  ]);

  const monitoringType = sciipExtractFirstAvailable690_(monitoring, [
    'Monitoring_Type'
  ]);

  const monitoringTitle = sciipExtractFirstAvailable690_(monitoring, [
    'Monitoring_Title'
  ]);

  const monitoringObjective = sciipExtractFirstAvailable690_(monitoring, [
    'Monitoring_Objective'
  ]);

  const triggerCondition = sciipExtractFirstAvailable690_(monitoring, [
    'Trigger_Condition'
  ]);

  const earlyIndicators = sciipExtractFirstAvailable690_(monitoring, [
    'Early_Indicators'
  ]);

  const escalationCondition = sciipExtractFirstAvailable690_(monitoring, [
    'Escalation_Condition'
  ]);

  const recommendedResponse = sciipExtractFirstAvailable690_(monitoring, [
    'Recommended_Response'
  ]);

  const monitoringPriority =
    sciipExtractFirstAvailable690_(monitoring, [
      'Monitoring_Priority'
    ]) || 'MEDIUM';

  let detectedSignalType = 'EXPECTED_MONITORING_SIGNAL';
  let detectedSignalTitle = `Monitoring signal: ${monitoringTitle || signalCategory || 'general signal'}`;
  let triggerState = 'WATCHING';
  let escalationReadiness = 'NOT_READY';
  let recommendedActionRoute = 'CONTINUE_MONITORING';
  let signalConfidence = monitoringPriority === 'HIGH' ? 'MEDIUM' : 'LOW';
  let signalPriority = monitoringPriority;

  const monitoringTypeText = String(monitoringType || '').toUpperCase();

  if (monitoringTypeText.includes('REINFORCED')) {
    detectedSignalType = 'REINFORCED_PATTERN_SIGNAL';
    triggerState = 'WATCHING_FOR_REPEAT_CONFIRMATION';
    escalationReadiness = 'READY_IF_REPEATED';
    recommendedActionRoute = 'ROUTE_TO_INTELLIGENCE_REQUIREMENT_IF_CONFIRMED';
    signalPriority = 'HIGH';
  }

  if (monitoringTypeText.includes('WEAKENED')) {
    detectedSignalType = 'WEAKENED_PATTERN_SIGNAL';
    triggerState = 'WATCHING_FOR_STRONGER_CORROBORATION';
    escalationReadiness = 'NOT_READY';
    recommendedActionRoute = 'REQUIRE_STRONGER_EVIDENCE_BEFORE_ESCALATION';
  }

  if (monitoringTypeText.includes('OPERATOR_REVIEW')) {
    detectedSignalType = 'OPERATOR_REVIEW_SIGNAL';
    triggerState = 'REVIEW_REQUIRED_IF_CONFLICT_REPEATS';
    escalationReadiness = 'READY_FOR_OPERATOR_REVIEW';
    recommendedActionRoute = 'ROUTE_TO_OPERATOR_REVIEW';
    signalConfidence = 'MEDIUM';
    signalPriority = 'HIGH';
  }

  if (monitoringTypeText.includes('STABILITY')) {
    detectedSignalType = 'STABILITY_SIGNAL';
    triggerState = 'BASELINE_MONITORING';
    escalationReadiness = 'NOT_READY';
    recommendedActionRoute = 'CONTINUE_BASELINE_MONITORING';
    signalPriority = 'LOW';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    detectedSignalType = `PROPERTY_${detectedSignalType}`;
    detectedSignalTitle = 'Property monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_PROPERTY_REVIEW_IF_TRIGGERED';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    detectedSignalType = `COMPANY_${detectedSignalType}`;
    detectedSignalTitle = 'Company monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_COMPANY_RESEARCH_IF_TRIGGERED';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    detectedSignalType = `RISK_${detectedSignalType}`;
    detectedSignalTitle = 'Risk monitoring signal';
    escalationReadiness = 'READY_FOR_RISK_REVIEW';
    recommendedActionRoute =
      'ROUTE_TO_RISK_REVIEW_OR_ALERTING';
    signalPriority = 'HIGH';
    signalConfidence = signalConfidence === 'LOW' ? 'MEDIUM' : signalConfidence;
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    detectedSignalType = `OPPORTUNITY_${detectedSignalType}`;
    detectedSignalTitle = 'Opportunity monitoring signal';
    escalationReadiness = 'READY_FOR_OPPORTUNITY_REVIEW';
    recommendedActionRoute =
      'ROUTE_TO_OPPORTUNITY_REVIEW_OR_ACTION_RECOMMENDATION';
    signalPriority = 'HIGH';
    signalConfidence = signalConfidence === 'LOW' ? 'MEDIUM' : signalConfidence;
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    detectedSignalType = `SYSTEM_${detectedSignalType}`;
    detectedSignalTitle = 'Operating system monitoring signal';
    recommendedActionRoute =
      'ROUTE_TO_SYSTEM_IMPROVEMENT_REVIEW';
  }

  const detectionBasis = [
    `Monitoring type: ${monitoringType || 'UNKNOWN'}.`,
    `Signal category: ${signalCategory || 'UNKNOWN'}.`,
    `Monitoring objective: ${monitoringObjective || 'No monitoring objective recorded.'}`,
    `Early indicators: ${earlyIndicators || 'No early indicators recorded.'}`,
    `Escalation condition: ${escalationCondition || 'No escalation condition recorded.'}`,
    `Recommended response: ${recommendedResponse || 'No recommended response recorded.'}`
  ].join('\n');

  const detectedSignalStatement = [
    'SCIIP generated a monitoring signal from an active scenario monitoring requirement.',
    `Detected signal type: ${detectedSignalType}.`,
    `Trigger state: ${triggerState}.`,
    `Escalation readiness: ${escalationReadiness}.`,
    `Recommended action route: ${recommendedActionRoute}.`
  ].join('\n');

  return {
    detectedSignalType,
    detectedSignalTitle,
    detectedSignalStatement,
    detectionBasis,
    triggerCondition,
    triggerState,
    escalationReadiness,
    recommendedActionRoute,
    signalConfidence,
    signalPriority
  };
}

function sciipDeduplicateMonitoringSignalRows690_(rows) {
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


function sciipTestMonitoringSignalDetectionProcessor() {
  const result =
    sciipRunMonitoringSignalDetectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestMonitoringSignalDetectionProcessor',
    result: result
  }));

  return result;
}
