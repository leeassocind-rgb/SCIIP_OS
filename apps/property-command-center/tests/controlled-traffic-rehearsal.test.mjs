import assert from'node:assert/strict';
import fs from'node:fs';
import{runControlledTrafficRehearsal}from'../src/production-activation/traffic-rehearsal/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const stages=[
  {id:'STAGE-1',trafficPct:5},
  {id:'STAGE-2',trafficPct:25},
  {id:'STAGE-3',trafficPct:50},
  {id:'STAGE-4',trafficPct:100}
];
const healthChecks=stages.map(stage=>({stageId:stage.id,passed:true}));
const result=runControlledTrafficRehearsal({
  authorization:{rehearsalAuthorized:true},
  stages,
  healthChecks,
  rollback:{ready:true,rollbackPlanId:'RB-1'}
});
t(result.stagesRun===4);
t(result.stagesPassed===4);
t(result.stagesFailed===0);
t(result.status==='PASSED');
t(result.rollbackReady);
t(result.stages.every(stage=>stage.healthPassed));
t(result.stages.every(stage=>!stage.productionTrafficApplied));
t(!result.productionTrafficApplied);
t(!result.productionTrafficAuthorized);

const source=fs.readFileSync('src/components/LaunchRehearsalCenter.jsx','utf8');
t(source.includes('Production Launch Rehearsal Center'));
t(source.includes('LIVE TRAFFIC DISABLED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE14_SPRINT146_CONTROLLED_TRAFFIC_REHEARSAL',
  status:'PASSED',testsRun:n,result
},null,2));
