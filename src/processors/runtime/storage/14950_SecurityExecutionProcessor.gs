function sciipRun14950_SecurityExecutionProcessor() {
  return SCIIP_STORAGE_SECURITY_BACKEND.executeSecurityPlan({
    processorNumber: 14950,
    processorName: 'SecurityExecution',
    statusField: 'securityExecutionStatus',
    component: 'Storage Security Execution',
    backendLayer: 'Storage Security',
    sourceSheet: 'SECURITY_CONTROL_PLANNING',
    targetSheet: 'SECURITY_EXECUTION',
    nextAction: 'Run 14960_SecurityLedgerProcessor after this processor completes.'
  });
}

function sciipTest14950_SecurityExecutionProcessor() {
  var result = sciipRun14950_SecurityExecutionProcessor();
  console.log(JSON.stringify({test: 'sciipTest14950_SecurityExecutionProcessor', result: result}));
  return result;
}
