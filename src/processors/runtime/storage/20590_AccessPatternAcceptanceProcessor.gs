function sciipRun20590_AccessPatternAcceptanceProcessor() {
  return SCIIP_STORAGE_ACCESS_PATTERN_BACKEND.executeAccessPatternPlan({
    processorNumber: 20590,
    processorName: 'AccessPatternAcceptance',
    statusField: 'accessPatternAcceptanceStatus',
    component: 'Storage Access Pattern Execution',
    backendLayer: 'Storage Access Pattern',
    sourceSheet: 'ACCESS_PATTERN_CERTIFICATION',
    targetSheet: 'ACCESS_PATTERN_ACCEPTANCE',
    nextAction: 'Storage Access Pattern Execution accepted through 20590.'
  });
}

function sciipTest20590_AccessPatternAcceptanceProcessor() {
  var result = sciipRun20590_AccessPatternAcceptanceProcessor();
  console.log(JSON.stringify({test: 'sciipTest20590_AccessPatternAcceptanceProcessor', result: result}));
  return result;
}
