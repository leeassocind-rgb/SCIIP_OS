function sciipRun14990_SecurityAcceptanceProcessor() {
  return SCIIP_STORAGE_SECURITY_BACKEND.executeSecurityPlan({
    processorNumber: 14990,
    processorName: 'SecurityAcceptance',
    statusField: 'securityAcceptanceStatus',
    component: 'Storage Security Execution',
    backendLayer: 'Storage Security',
    sourceSheet: 'SECURITY_CERTIFICATIONS',
    targetSheet: 'SECURITY_ACCEPTANCES',
    nextAction: 'Storage Security Execution accepted through 14990.'
  });
}

function sciipTest14990_SecurityAcceptanceProcessor() {
  var result = sciipRun14990_SecurityAcceptanceProcessor();
  console.log(JSON.stringify({test: 'sciipTest14990_SecurityAcceptanceProcessor', result: result}));
  return result;
}
