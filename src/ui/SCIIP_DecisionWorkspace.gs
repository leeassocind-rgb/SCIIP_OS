/** SCIIP_OS v7.0 Integration Sprint 3D — unified decision workspace projection. */
var SCIIP_DECISION_WORKSPACE=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3d';
  function snapshot(request){request=request||{};var scenarios=SCIIP_SCENARIO_REGISTRY.snapshot(),runs=SCIIP_DECISION_SIMULATION_ENGINE.list(),latest=runs.length?runs[runs.length-1]:null;return {version:VERSION,status:'AVAILABLE',generatedAt:new Date().toISOString(),kpis:[{id:'scenarios',label:'Scenarios',value:scenarios.scenarioCount},{id:'scenario-events',label:'Scenario Events',value:scenarios.eventCount},{id:'simulation-runs',label:'Simulation Runs',value:runs.length},{id:'latest-candidates',label:'Latest Candidates',value:latest?latest.candidateCount:0},{id:'latest-eligible',label:'Latest Eligible',value:latest?latest.eligibleCount:0}],scenarios:scenarios.scenarios,runs:runs,selectedScenarioId:request.scenarioId||null,latestRun:latest};}
  return {VERSION:VERSION,snapshot:snapshot};
})();
function sciipDecisionWorkspaceSnapshotV7(request){return SCIIP_DECISION_WORKSPACE.snapshot(request||{});}
