/** SCIIP_OS v7.0 Integration Sprint 3F.1 — explicit Apps Script certification. */
function sciipTestV7IntegrationSprint3F(){
  var tests=[
    sciipTestV7AuditTrail(),
    sciipTestV7ControlAssurance(),
    sciipTestV7OperationalResilience(),
    sciipTestV7ReleaseAssurance(),
    sciipTestV7ResilienceAssuranceWorkspace()
  ];
  var w=sciipWireIntegrationSprint3F();
  if(w.status!=='WIRED')throw new Error('Sprint 3F service wiring failed: '+JSON.stringify(w));
  tests.push({test:'ReleaseAssuranceServiceWiring',status:'PASSED',wiringStatus:w.status,queryRegistered:w.queryRegistered,liveServiceRegistered:w.liveServiceRegistered,workflowAvailable:w.workflowAvailable,decisionLedgerAvailable:w.decisionLedgerAvailable,liveRuntimeApi:w.liveRuntimeApi,errors:w.errors});
  var out={framework:'SCIIP_V7_INTEGRATION_SPRINT_3F_OPERATIONAL_RESILIENCE_AUDIT_RELEASE_ASSURANCE',version:'v7.0-integration-sprint-3f.1',status:'PASSED',testsRun:tests.length,tests:tests,generatedAt:new Date().toISOString()};
  console.log(JSON.stringify(out));
  return out;
}
