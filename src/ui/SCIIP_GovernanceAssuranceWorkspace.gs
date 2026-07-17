/** SCIIP_OS v7.0 Sprint 3E — governance assurance projection. */
var SCIIP_GOVERNANCE_ASSURANCE_WORKSPACE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3e';
  function snapshot(){var risks=SCIIP_RISK_REGISTRY.list({}),decisions=SCIIP_DECISION_LEDGER.list({}),policy=SCIIP_POLICY_DECISION_ENGINE.history();var open=risks.filter(function(r){return r.status==='OPEN';}),critical=open.filter(function(r){return r.level==='CRITICAL'||r.level==='HIGH';});return {version:VERSION,status:critical.length?'ATTENTION_REQUIRED':'ASSURED',kpis:[{id:'open-risks',label:'Open Risks',value:open.length},{id:'high-risks',label:'High/Critical Risks',value:critical.length},{id:'decisions',label:'Recorded Decisions',value:decisions.length},{id:'policy-checks',label:'Policy Decisions',value:policy.length},{id:'blocked',label:'Blocked Decisions',value:policy.filter(function(p){return p.status==='BLOCKED';}).length}],risks:risks,decisions:decisions,policyDecisions:policy,generatedAt:new Date().toISOString()};}
  return {VERSION:VERSION,snapshot:snapshot};
})();
function sciipGovernanceAssuranceSnapshotV7(){return SCIIP_GOVERNANCE_ASSURANCE_WORKSPACE.snapshot();}
