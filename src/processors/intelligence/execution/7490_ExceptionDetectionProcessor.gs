/**
 * SCIIP_OS v5.5 — 7490_ExceptionDetectionProcessor
 * Detects operational exceptions from schedule and execution intelligence.
 */
function sciipRun7490_ExceptionDetectionProcessor() {
  var cfg = {
    processorNumber: 7490,
    processorName: 'ExceptionDetection',
    layer: 'Exception Detection',
    sourceSheet: 'SCHEDULE_INTELLIGENCE',
    targetSheet: 'EXCEPTION_DETECTION',
    statusField: 'exceptionDetectionStatus',
    requiresSource: false,
    operationalAction: 'Exception Detection produced for operational intelligence review.',
    successMessage: 'Detects operational exceptions from schedule and execution intelligence.',
    nextAction: 'Run 7500_BottleneckAnalysisProcessor after this processor completes.'
  };
  return SCIIP_OPERATIONAL_INTELLIGENCE_EXECUTION.runWithRuntimeBase(cfg);
}

function sciipTest7490_ExceptionDetectionProcessor() {
  var result = sciipRun7490_ExceptionDetectionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest7490_ExceptionDetectionProcessor', result: result }));
  return result;
}
