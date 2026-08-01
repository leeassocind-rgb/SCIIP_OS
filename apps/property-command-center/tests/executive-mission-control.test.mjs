import assert from'node:assert/strict';
import fs from'node:fs';
import{createExecutiveMissionControlModel}from'../src/enterprise-os/mission-control/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const model=createExecutiveMissionControlModel({
 twin:{status:'SYNCHRONIZED'},
 commandBus:{status:'OPERATIONAL'},
 stateSync:{status:'OPERATIONAL'},
 portfolio:{assets:3},
 workflows:[{status:'IN_PROGRESS'},{status:'COMPLETED'}],
 recommendations:[{id:'R1',confidence:.9}],
 approvals:[{status:'PENDING'},{status:'APPROVED'}],
 risks:[{severity:'CRITICAL',status:'OPEN'}],
 opportunities:[{status:'ACTIVE'}],
 capital:{available:100,allocated:40}
});
t(model.health==='WATCH');
t(model.portfolioAssets===3);
t(model.activeWorkflows===1);
t(model.pendingApprovals===1);
t(model.criticalRisks===1);
t(model.activeOpportunities===1);
t(model.capitalAvailable===100);
t(model.capitalAllocated===40);
t(model.evidenceBacked);
t(model.executiveReady);
t(!model.productionExecutionAuthorized);

const source=fs.readFileSync('src/components/ExecutiveMissionControl.jsx','utf8');
t(source.includes('Executive Mission Control'));
t(source.includes('EXECUTION DISABLED'));

console.log(JSON.stringify({
 framework:'SCIIP_PHASE12_SPRINT122_EXECUTIVE_MISSION_CONTROL',
 status:'PASSED',testsRun:tests,result:model
},null,2));
