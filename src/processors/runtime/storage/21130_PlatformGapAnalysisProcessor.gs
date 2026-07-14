function sciipRun21130_PlatformGapAnalysisProcessor() {
  return SCIIP_STORAGE_PLATFORM_ACCEPTANCE_BACKEND.executePlatformAcceptancePlan({
    processorNumber: 21130,
    processorName: 'PlatformGapAnalysis',
    statusField: 'platformGapAnalysisStatus',
    component: 'Storage Platform Acceptance Execution',
    backendLayer: 'Storage Platform Acceptance',
    sourceSheet: 'PLATFORM_COVERAGE_ASSESSMENT',
    targetSheet: 'PLATFORM_GAP_ANALYSIS',
    nextAction: 'Run 21140_PlatformAcceptancePlanningProcessor after this processor completes.'
  });
}

function sciipTest21130_PlatformGapAnalysisProcessor() {
  var result = sciipRun21130_PlatformGapAnalysisProcessor();
  console.log(JSON.stringify({test: 'sciipTest21130_PlatformGapAnalysisProcessor', result: result}));
  return result;
}
