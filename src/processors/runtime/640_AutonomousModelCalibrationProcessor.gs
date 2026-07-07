/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 640_AutonomousModelCalibrationProcessor
 *
 * SIGNAL_WEIGHT_OPTIMIZATION → AUTONOMOUS_MODEL_CALIBRATION
 *
 * Migration note:
 * Preserves original 640 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR = '640_AutonomousModelCalibrationProcessor';
const AUTONOMOUS_MODEL_CALIBRATION_SHEET = 'AUTONOMOUS_MODEL_CALIBRATION';

const AUTONOMOUS_MODEL_CALIBRATION_HEADERS = [
  'Calibration_ID',
  'Business_Key',
  'Calibration_Date',
  'Signal_Weight_ID',
  'Evolution_ID',
  'Learning_ID',
  'Hypothesis_ID',
  'Hypothesis_Type',
  'Signal_Category',
  'Affected_Processor',
  'Affected_Graph_Object',
  'Calibration_Type',
  'Calibration_Action',
  'Calibration_Direction',
  'Calibration_Magnitude',
  'Calibration_Rationale',
  'Expected_Model_Effect',
  'Implementation_Status',
  'Calibration_Priority',
  'Source_Record',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousModelCalibrationSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    AUTONOMOUS_MODEL_CALIBRATION_SHEET,
    AUTONOMOUS_MODEL_CALIBRATION_HEADERS
  );
}

function sciipRunAutonomousModelCalibrationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
    action: 'AUTONOMOUS_MODEL_CALIBRATION_BUILD',
    sourceSheet: 'SIGNAL_WEIGHT_OPTIMIZATION',
    targetSheet: AUTONOMOUS_MODEL_CALIBRATION_SHEET,
    ledgerSheet: 'AUTONOMOUS_MODEL_CALIBRATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const signalWeights = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SIGNAL_WEIGHT_OPTIMIZATION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: signalWeights.length,
        outputCount: signalWeights.length || 1,
        summary: 'Autonomous model calibration runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
          inputSheets: ['SIGNAL_WEIGHT_OPTIMIZATION']
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
      const outputSheet = sciipEnsureAutonomousModelCalibrationSchema();
      const calibrationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const calibrationBusinessKey = 'AUTONOMOUS_MODEL_CALIBRATION|' + calibrationDate;

      if (sciipRuntimeBusinessKeyPrefixExists640_(definition.targetSheet, calibrationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            calibrationsCreated: 0,
            skippedDuplicate: 1,
            calibrationBusinessKey: calibrationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const signalWeights = sciipGetRuntimeRecordsByDate640_(
        'SIGNAL_WEIGHT_OPTIMIZATION',
        'Optimization_Date',
        calibrationDate
      );

      if (signalWeights.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            signalWeightsReviewed: 0,
            calibrationsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const calibrations = sciipCreateAutonomousModelCalibrations640_({
        businessKey: calibrationBusinessKey,
        calibrationDate: calibrationDate,
        signalWeights: signalWeights,
        processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR
      });

      calibrations.forEach(function(row) {
        outputSheet.appendRow(row);
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_MODEL_CALIBRATION_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: calibrations.length,
        recordsRead: signalWeights.length,
        processed: calibrations.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          signalWeightsReviewed: signalWeights.length,
          calibrationsCreated: calibrations.length,
          skippedDuplicate: 0,
          calibrationBusinessKey: calibrationBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists640_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate640_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue640_(record[dateField]) === String(dateValue);
  });
}

function sciipNormalizeRuntimeDateValue640_(value) {
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

function sciipExtractFirstAvailable640_(record, fields) {
  if (!record) return '';
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function sciipNormalizeMissionKey640_(value) {
  return String(value || 'UNKNOWN')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 80) || 'UNKNOWN';
}

function sciipCreateAutonomousModelCalibrations640_(args) {
  const now = new Date();

  const rows = args.signalWeights.map(function(signalWeight) {
    const signalWeightId = sciipExtractFirstAvailable640_(signalWeight, [
      'Signal_Weight_ID'
    ]);

    const evolutionId = sciipExtractFirstAvailable640_(signalWeight, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable640_(signalWeight, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable640_(signalWeight, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable640_(signalWeight, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable640_(signalWeight, [
      'Signal_Category'
    ]);

    const profile =
      sciipInferAutonomousModelCalibrationProfile640_(signalWeight);

    const rowKey =
      args.businessKey + '|' + signalCategory + '|' + sciipNormalizeMissionKey640_(signalWeightId || evolutionId || learningId || hypothesisId || profile.calibrationType);

    return [
      sciipGenerateId_('CAL'),
      rowKey,
      args.calibrationDate,
      signalWeightId,
      evolutionId,
      learningId,
      hypothesisId,
      hypothesisType,
      signalCategory,
      profile.affectedProcessor,
      profile.affectedGraphObject,
      profile.calibrationType,
      profile.calibrationAction,
      profile.calibrationDirection,
      profile.calibrationMagnitude,
      profile.calibrationRationale,
      profile.expectedModelEffect,
      'PROPOSED',
      profile.calibrationPriority,
      'SIGNAL_WEIGHT_OPTIMIZATION:' + signalWeightId,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateAutonomousModelCalibrationRows640_(rows);
}

function sciipInferAutonomousModelCalibrationProfile640_(signalWeight) {
  const hypothesisType = sciipExtractFirstAvailable640_(signalWeight, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable640_(signalWeight, [
    'Signal_Category'
  ]);

  const affectedProcessor =
    sciipExtractFirstAvailable640_(signalWeight, [
      'Affected_Processor'
    ]) || '560_HypothesisGenerationProcessor';

  const affectedGraphObject =
    sciipExtractFirstAvailable640_(signalWeight, [
      'Affected_Graph_Object'
    ]) || 'MARKET_INTELLIGENCE_GRAPH';

  const recommendedWeightAction = sciipExtractFirstAvailable640_(signalWeight, [
    'Recommended_Weight_Action'
  ]);

  const recommendedWeightDirection = sciipExtractFirstAvailable640_(signalWeight, [
    'Recommended_Weight_Direction'
  ]);

  const recommendedWeightMagnitude = sciipExtractFirstAvailable640_(signalWeight, [
    'Recommended_Weight_Magnitude'
  ]);

  const optimizationRationale = sciipExtractFirstAvailable640_(signalWeight, [
    'Optimization_Rationale'
  ]);

  const optimizationPriority =
    sciipExtractFirstAvailable640_(signalWeight, [
      'Optimization_Priority'
    ]) || 'MEDIUM';

  let calibrationType = 'SIGNAL_WEIGHT_CALIBRATION';
  let calibrationAction = 'MAINTAIN_MODEL_BEHAVIOR';
  let calibrationDirection = 'NO_CHANGE';
  let calibrationMagnitude = 'NONE';
  let calibrationPriority = optimizationPriority;
  let expectedModelEffect =
    'Future model behavior should remain stable until more validated learning is available.';

  const action = String(recommendedWeightAction || '').toUpperCase();
  const direction = String(recommendedWeightDirection || '').toUpperCase();

  if (
    action === 'INCREASE_SIGNAL_WEIGHT' ||
    direction === 'UP'
  ) {
    calibrationAction = 'CALIBRATE_MODEL_TO_PRIORITIZE_SIGNAL';
    calibrationDirection = 'INCREASE_SENSITIVITY';
    calibrationMagnitude = recommendedWeightMagnitude || 'LOW';
    expectedModelEffect =
      'Future hypothesis generation and signal interpretation should become more sensitive to this signal category.';
  }

  if (
    action === 'DECREASE_SIGNAL_WEIGHT' ||
    direction === 'DOWN'
  ) {
    calibrationAction = 'CALIBRATE_MODEL_TO_DOWNWEIGHT_SIGNAL';
    calibrationDirection = 'DECREASE_SENSITIVITY';
    calibrationMagnitude = recommendedWeightMagnitude || 'LOW';
    expectedModelEffect =
      'Future hypothesis generation and signal interpretation should become less sensitive to this signal category.';
  }

  if (
    action === 'FLAG_WEIGHT_FOR_OPERATOR_REVIEW' ||
    direction === 'REVIEW'
  ) {
    calibrationAction = 'ROUTE_CALIBRATION_TO_OPERATOR_REVIEW';
    calibrationDirection = 'PENDING_REVIEW';
    calibrationMagnitude = 'PENDING_REVIEW';
    calibrationPriority = 'HIGH';
    expectedModelEffect =
      'No autonomous calibration should be applied until operator review resolves the signal weighting recommendation.';
  }

  if (
    action === 'MAINTAIN_SIGNAL_WEIGHT' ||
    direction === 'NO_CHANGE'
  ) {
    calibrationAction = 'MAINTAIN_MODEL_BEHAVIOR';
    calibrationDirection = 'NO_CHANGE';
    calibrationMagnitude = 'NONE';
  }

  if (hypothesisType === 'PROPERTY_HYPOTHESIS') {
    calibrationType = 'PROPERTY_MODEL_CALIBRATION';
  }

  if (hypothesisType === 'COMPANY_HYPOTHESIS') {
    calibrationType = 'COMPANY_MODEL_CALIBRATION';
  }

  if (hypothesisType === 'RISK_HYPOTHESIS') {
    calibrationType = 'RISK_MODEL_CALIBRATION';
    calibrationPriority = 'HIGH';
  }

  if (hypothesisType === 'OPPORTUNITY_HYPOTHESIS') {
    calibrationType = 'OPPORTUNITY_MODEL_CALIBRATION';
    calibrationPriority = 'HIGH';
  }

  if (hypothesisType === 'OPERATING_SYSTEM_HYPOTHESIS') {
    calibrationType = 'SYSTEM_MODEL_CALIBRATION';
  }

  const calibrationRationale = [
    'Signal category: ' + (signalCategory || 'UNKNOWN') + '.',
    'Hypothesis type: ' + (hypothesisType || 'UNKNOWN') + '.',
    'Affected processor: ' + affectedProcessor + '.',
    'Affected graph object: ' + affectedGraphObject + '.',
    'Recommended weight action: ' + (recommendedWeightAction || 'UNKNOWN') + '.',
    'Recommended direction: ' + (recommendedWeightDirection || 'UNKNOWN') + '.',
    'Recommended magnitude: ' + (recommendedWeightMagnitude || 'UNKNOWN') + '.',
    'Optimization rationale: ' + (optimizationRationale || 'No rationale recorded.')
  ].join('\n');

  return {
    affectedProcessor: affectedProcessor,
    affectedGraphObject: affectedGraphObject,
    calibrationType: calibrationType,
    calibrationAction: calibrationAction,
    calibrationDirection: calibrationDirection,
    calibrationMagnitude: calibrationMagnitude,
    calibrationRationale: calibrationRationale,
    expectedModelEffect: expectedModelEffect,
    calibrationPriority: calibrationPriority
  };
}

function sciipDeduplicateAutonomousModelCalibrationRows640_(rows) {
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

function sciipTestAutonomousModelCalibrationProcessor() {
  const result =
    sciipRunAutonomousModelCalibrationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousModelCalibrationProcessor',
    result: result
  }));

  return result;
}
