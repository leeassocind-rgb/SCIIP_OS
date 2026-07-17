/** SCIIP_OS v7.0 Sprint 5B.2 — full Apps Script certification. */
function sciipTestV7AutonomousOpportunityEngine(){
  SCIIP_AUTONOMOUS_OPPORTUNITY_ENGINE.reset();
  var r=SCIIP_AUTONOMOUS_OPPORTUNITY_ENGINE.detect({minimumScore:50,candidates:[
    {id:'P-A',label:'Alpha',marketScore:90,tenantFit:95,suitabilityScore:92,timingScore:80,riskScore:10},
    {id:'P-B',label:'Beta',marketScore:55,tenantFit:50,suitabilityScore:60,timingScore:40,riskScore:40}
  ]});
  if(r.count!==1||r.opportunities[0].candidateId!=='P-A')throw new Error('Autonomous opportunity detection failed.');
  return {test:'AutonomousOpportunityEngine',status:'PASSED',count:r.count,top:r.opportunities[0].candidateId,score:r.opportunities[0].score};
}
function sciipTestV7AnomalyWatchlists(){
  SCIIP_ANOMALY_WATCHLIST_ENGINE.reset();
  var w=SCIIP_ANOMALY_WATCHLIST_ENGINE.createWatchlist({id:'vacancy-spike',metric:'vacancy',threshold:8,direction:'ABOVE',severity:'WARNING'});
  var a=SCIIP_ANOMALY_WATCHLIST_ENGINE.evaluate('vacancy-spike',{entityId:'MARKET-IE',value:9.2});
  if(w.status!=='CREATED'||!a.triggered||a.severity!=='WARNING')throw new Error('Anomaly watchlist failed.');
  return {test:'AnomalyWatchlists',status:'PASSED',triggered:a.triggered,severity:a.severity};
}
function sciipTestV7AutonomousActionPlanner(){
  SCIIP_AUTONOMOUS_ACTION_PLANNER.reset();
  var p=SCIIP_AUTONOMOUS_ACTION_PLANNER.build({opportunity:{opportunityId:'O-1',priority:'PRIORITY'},requireApproval:true});
  var done=SCIIP_AUTONOMOUS_ACTION_PLANNER.execute(p.planId);
  if(done.status!=='COMPLETED'||done.steps.length<4)throw new Error('Autonomous action planner failed.');
  return {test:'AutonomousActionPlanner',status:'PASSED',planId:done.planId,steps:done.steps.length,workflowHandoff:done.workflowHandoff};
}
function sciipTestV7ConfidenceGovernance(){
  SCIIP_CONFIDENCE_GOVERNANCE.reset();
  var high=SCIIP_CONFIDENCE_GOVERNANCE.assess({evidenceCount:8,sourceQuality:95,freshness:90,consistency:95});
  var low=SCIIP_CONFIDENCE_GOVERNANCE.assess({evidenceCount:1,sourceQuality:30,freshness:20,consistency:25});
  if(high.decision!=='AUTONOMOUS_ACTION_ALLOWED'||low.decision!=='HUMAN_REVIEW_REQUIRED')throw new Error('Confidence governance failed.');
  return {test:'ConfidenceGovernance',status:'PASSED',high:high.level,low:low.level};
}
function sciipTestV7OpportunityOrchestration(){
  SCIIP_AUTONOMOUS_OPPORTUNITY_ENGINE.reset();
  SCIIP_AUTONOMOUS_ACTION_PLANNER.reset();
  var r=SCIIP_AUTONOMOUS_OPPORTUNITY_ORCHESTRATOR.run({
    candidates:[{id:'P-Z',marketScore:90,tenantFit:92,suitabilityScore:91,timingScore:85,riskScore:5}],
    evidenceCount:9,sourceQuality:95,freshness:90,consistency:95
  });
  if(!r.opportunity||!r.actionPlan||r.confidence.level!=='HIGH')throw new Error('Opportunity orchestration failed.');
  return {test:'OpportunityOrchestration',status:'PASSED',opportunity:r.opportunity.candidateId,confidence:r.confidence.level,autonomous:r.autonomous};
}
function sciipTestV7OpportunityPlatformWiring(){
  var r=SCIIP_AUTONOMOUS_OPPORTUNITY_ORCHESTRATOR.wire();
  if(r.status!=='WIRED')throw new Error('Sprint 5B.2 platform wiring failed: '+JSON.stringify(r));
  return {test:'PlatformWiring',status:'PASSED',assemblyStatus:r.status,registry:r.registry,assembly:r.assembly,
    queryRegistered:r.queryRegistered,liveServiceRegistered:r.liveServiceRegistered,
    queryEngineApi:r.queryEngineApi,liveRuntimeApi:r.liveRuntimeApi,
    registrationMode:r.registrationMode,errors:r.errors};
}
function sciipTestV7IntegrationSprint5B(){
  var tests=[sciipTestV7AutonomousOpportunityEngine(),sciipTestV7AnomalyWatchlists(),
    sciipTestV7AutonomousActionPlanner(),sciipTestV7ConfidenceGovernance(),
    sciipTestV7OpportunityOrchestration(),sciipTestV7OpportunityPlatformWiring()];
  var output={framework:'SCIIP_V7_INTEGRATION_SPRINT_5B_AUTONOMOUS_OPPORTUNITY_ACTION_PLATFORM',
    version:'v7.0-integration-sprint-5b.2',status:'PASSED',testsRun:tests.length,tests:tests,
    generatedAt:new Date().toISOString()};
  console.log(JSON.stringify(output));return output;
}
