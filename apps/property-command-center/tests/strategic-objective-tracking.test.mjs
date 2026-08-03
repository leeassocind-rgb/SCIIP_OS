import assert from'node:assert/strict';
import{trackStrategicObjectives}from'../src/phase18-executive-intelligence/objectives/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=trackStrategicObjectives({
 objectives:[{objectiveId:'O1'},{objectiveId:'O2'},{objectiveId:'O3'}],
 initiatives:[
  {objectiveId:'O1',status:'COMPLETE'},
  {objectiveId:'O2',status:'COMPLETE'},
  {objectiveId:'O2',status:'OPEN'},
  {objectiveId:'O3',status:'OPEN'}
 ]
});
t(r.total===3);t(r.complete===1);t(r.onTrack===1);t(r.atRisk===1);
t(r.objectives[1].progressPct===50);t(r.permanentHistory);
t(!r.autonomousObjectiveChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT320_STRATEGIC_OBJECTIVE_TRACKING',status:'PASSED',testsRun:n,result:r},null,2));
