function sciipRun14940_SecurityControlPlanningProcessor() {
  return SCIIP_STORAGE_SECURITY_BACKEND.executeSecurityPlan({
    processorNumber: 14940,
    processorName: 'SecurityControlPlanning',
    statusField: 'securityControlPlanningStatus',
    component: 'Storage Security Execution',
    backendLayer: 'Storage Security',
    sourceSheet: 'ACCESS_RISK_ANALYSIS',
    targetSheet: 'SECURITY_CONTROL_PLANNING',
    nextAction: 'Run 14950_SecurityExecutionProcessor after this processor completes.'
  });
}

function sciipTest14940_SecurityControlPlanningProcessor() {
  var result = sciipRun14940_SecurityControlPlanningProcessor();
  console.log(JSON.stringify({test: 'sciipTest14940_SecurityControlPlanningProcessor', result: result}));
  return result;
}
