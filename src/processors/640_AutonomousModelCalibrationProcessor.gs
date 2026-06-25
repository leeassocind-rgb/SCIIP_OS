/************************************************************
 * 640_AutonomousModelCalibrationProcessor
 * SCIIP_OS v4.1
 *
 * Input:
 * - SIGNAL_WEIGHT_OPTIMIZATION
 *
 * Output:
 * - AUTONOMOUS_MODEL_CALIBRATION
 ************************************************************/

const AUTONOMOUS_MODEL_CALIBRATION_SHEET =
  'AUTONOMOUS_MODEL_CALIBRATION';

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
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_MODEL_CALIBRATION_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_MODEL_CALIBRATION_SHEET);
  }

  sheet.getRange(1, 1, 1, AUTONOMOUS_MODEL_CALIBRATION_HEADERS.length)
    .setValues([AUTONOMOUS_MODEL_CALIBRATION_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunAutonomousModelCalibrationProcessor() {
  const processor = '640_AutonomousModelCalibrationProcessor';
  const startedAt = new Date();

  const outputSheet =
    sciipEnsureAutonomousModelCalibrationSchema();

  const calibrationDate = sciipFormatDateKey_(startedAt);
  const businessKey =
    `AUTONOMOUS_MODEL_CALIBRATION|${calibrationDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      calibrationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const signalWeights = sciipGetRecordsByDate_(
    'SIGNAL_WEIGHT_OPTIMIZATION',
    'Optimization_Date',
    calibrationDate
  );

  if (signalWeights.length === 0) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      signalWeightsReviewed: 0,
      calibrationsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const calibrations = sciipCreateAutonomousModelCalibrations_({
    businessKey,
    calibrationDate,
    signalWeights,
    processor
  });

  calibrations.forEach(row => outputSheet.appendRow(row));

  const result = {
    processor,
    status: 'SUCCESS',
    signalWeightsReviewed: signalWeights.length,
    calibrationsCreated: calibrations.length,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateAutonomousModelCalibrations_(args) {
  const now = new Date();

  const rows = args.signalWeights.map(signalWeight => {
    const signalWeightId = sciipExtractFirstAvailable_(signalWeight, [
      'Signal_Weight_ID'
    ]);

    const evolutionId = sciipExtractFirstAvailable_(signalWeight, [
      'Evolution_ID'
    ]);

    const learningId = sciipExtractFirstAvailable_(signalWeight, [
      'Learning_ID'
    ]);

    const hypothesisId = sciipExtractFirstAvailable_(signalWeight, [
      'Hypothesis_ID'
    ]);

    const hypothesisType = sciipExtractFirstAvailable_(signalWeight, [
      'Hypothesis_Type'
    ]);

    const signalCategory = sciipExtractFirstAvailable_(signalWeight, [
      'Signal_Category'
    ]);

    const profile =
      sciipInferAutonomousModelCalibrationProfile_(signalWeight);

    const rowKey =
      `${args.businessKey}|${signalCategory}|${sciipNormalizeMissionKey_(signalWeightId || evolutionId || learningId || hypothesisId || profile.calibrationType)}`;

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
      `SIGNAL_WEIGHT_OPTIMIZATION:${signalWeightId}`,
      'ACTIVE',
      now.toISOString(),
      args.processor
    ];
  });

  return sciipDeduplicateAutonomousModelCalibrationRows_(rows);
}

function sciipInferAutonomousModelCalibrationProfile_(signalWeight) {
  const hypothesisType = sciipExtractFirstAvailable_(signalWeight, [
    'Hypothesis_Type'
  ]);

  const signalCategory = sciipExtractFirstAvailable_(signalWeight, [
    'Signal_Category'
  ]);

  const affectedProcessor =
    sciipExtractFirstAvailable_(signalWeight, [
      'Affected_Processor'
    ]) || '560_HypothesisGenerationProcessor';

  const affectedGraphObject =
    sciipExtractFirstAvailable_(signalWeight, [
      'Affected_Graph_Object'
    ]) || 'MARKET_INTELLIGENCE_GRAPH';

  const recommendedWeightAction = sciipExtractFirstAvailable_(signalWeight, [
    'Recommended_Weight_Action'
  ]);

  const recommendedWeightDirection = sciipExtractFirstAvailable_(signalWeight, [
    'Recommended_Weight_Direction'
  ]);

  const recommendedWeightMagnitude = sciipExtractFirstAvailable_(signalWeight, [
    'Recommended_Weight_Magnitude'
  ]);

  const optimizationRationale = sciipExtractFirstAvailable_(signalWeight, [
    'Optimization_Rationale'
  ]);

  const optimizationPriority =
    sciipExtractFirstAvailable_(signalWeight, [
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
    `Signal category: ${signalCategory || 'UNKNOWN'}.`,
    `Hypothesis type: ${hypothesisType || 'UNKNOWN'}.`,
    `Affected processor: ${affectedProcessor}.`,
    `Affected graph object: ${affectedGraphObject}.`,
    `Recommended weight action: ${recommendedWeightAction || 'UNKNOWN'}.`,
    `Recommended direction: ${recommendedWeightDirection || 'UNKNOWN'}.`,
    `Recommended magnitude: ${recommendedWeightMagnitude || 'UNKNOWN'}.`,
    `Optimization rationale: ${optimizationRationale || 'No rationale recorded.'}`
  ].join('\n');

  return {
    affectedProcessor,
    affectedGraphObject,
    calibrationType,
    calibrationAction,
    calibrationDirection,
    calibrationMagnitude,
    calibrationRationale,
    expectedModelEffect,
    calibrationPriority
  };
}

function sciipDeduplicateAutonomousModelCalibrationRows_(rows) {
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

function sciipTestAutonomousModelCalibrationProcessor() {
  const result =
    sciipRunAutonomousModelCalibrationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousModelCalibrationProcessor',
    result
  }));

  return result;
}