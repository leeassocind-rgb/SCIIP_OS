function sciipRun14960_SecurityLedgerProcessor() {
  return SCIIP_STORAGE_SECURITY_BACKEND.executeSecurityPlan({
    processorNumber: 14960,
    processorName: 'SecurityLedger',
    statusField: 'securityLedgerStatus',
    component: 'Storage Security Execution',
    backendLayer: 'Storage Security',
    sourceSheet: 'SECURITY_EXECUTION',
    targetSheet: 'SECURITY_LEDGER',
    nextAction: 'Run 14970_SecurityValidationProcessor after this processor completes.'
  });
}

function sciipTest14960_SecurityLedgerProcessor() {
  var result = sciipRun14960_SecurityLedgerProcessor();
  console.log(JSON.stringify({test: 'sciipTest14960_SecurityLedgerProcessor', result: result}));
  return result;
}
