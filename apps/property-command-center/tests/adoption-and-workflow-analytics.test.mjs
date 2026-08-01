import assert from'node:assert/strict';
import fs from'node:fs';
import{analyzePilotAdoption}from'../src/pilot-operations/adoption/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=analyzePilotAdoption({
  events:[
    {userId:'U1',workspace:'GIS Intelligence',success:true,durationMs:100},
    {userId:'U1',workspace:'GIS Intelligence',success:false,durationMs:300},
    {userId:'U2',workspace:'Executive Mission Control',success:true,durationMs:200}
  ],
  workflows:[
    {status:'COMPLETED'},
    {status:'COMPLETED'},
    {status:'ABANDONED'}
  ]
});

t(result.activeUsers===2);
t(result.interactions===3);
t(result.workspaces.length===2);
t(result.workspaces[0].workspace==='GIS Intelligence');
t(result.workspaces[0].successRate===0.5);
t(result.workflowsStarted===3);
t(result.workflowsCompleted===2);
t(result.workflowsAbandoned===1);
t(result.workflowCompletionRate===0.6667);
t(result.adoptionMeasured);
t(!result.productionImpact);

const source=fs.readFileSync('src/components/PilotImprovementCenter.jsx','utf8');
t(source.includes('Pilot Improvement Center'));
t(source.includes('CHANGES REQUIRE APPROVAL'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT134_ADOPTION_AND_WORKFLOW_ANALYTICS',
  status:'PASSED',testsRun:n,result
},null,2));
