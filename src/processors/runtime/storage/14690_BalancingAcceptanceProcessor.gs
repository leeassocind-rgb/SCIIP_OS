/**
 * SCIIP_OS v6.0 — 14690_BalancingAcceptanceProcessor
 */
function sciipRun14690_BalancingAcceptanceProcessor() {
  var cfg = {
    processorNumber: 14690,
    processorName: 'BalancingAcceptance',
    component: 'Storage Balancing Execution',
    backendLayer: 'Storage Balancing',
    sourceSheet: 'BALANCING_CERTIFICATIONS',
    targetSheet: 'BALANCING_ACCEPTANCES',
    statusField: 'balancingAcceptanceStatus',
    nextAction: 'Storage Balancing Execution accepted through 14690.'
  };
  return SCIIP_STORAGE_BALANCING_BACKEND.executeBalancingPlan(cfg);
}

function sciipTest14690_BalancingAcceptanceProcessor() {
  var result = sciipRun14690_BalancingAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest14690_BalancingAcceptanceProcessor', result: result }));
  return result;
}
