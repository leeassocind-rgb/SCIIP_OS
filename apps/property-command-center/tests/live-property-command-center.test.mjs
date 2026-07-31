import assert from'node:assert/strict';
import{createLivePropertyCommandViewModel}from'../src/production-activation/live-property/index.js';
let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};

const view=createLivePropertyCommandViewModel({
 activation:{ingestion:{totalRuns:1,latest:{fileName:'live.csv',accepted:2,warnings:0,rejected:0}}},
 graphSnapshot:{nodes:[{id:'P1',type:'PROPERTY',label:'100 Test Way',latitude:34.1}]},
 ledger:[{id:'L1'}]
});
t(view.health==='OPERATIONAL');
t(view.propertyCount===1);
t(view.accepted===2);
t(view.graphConnected);
t(view.activationRuntimeConnected);
t(view.searchReady);
t(view.copilotEvidenceReady);
t(view.gisReady);
t(view.ledgerCount===1);
t(!view.productionExecutionAuthorized);

const blocked=createLivePropertyCommandViewModel({activation:{},graphSnapshot:{nodes:[]}});
t(blocked.health==='ATTENTION_REQUIRED');
t(blocked.blockers.includes('NO_LIVE_INGESTION'));
t(blocked.blockers.includes('NO_PROPERTY_GRAPH_RECORDS'));

console.log(JSON.stringify({
 framework:'SCIIP_PHASE5_SPRINT65_LIVE_PROPERTY_COMMAND_CENTER',
 status:'PASSED',
 testsRun:n,
 result:view
},null,2));
