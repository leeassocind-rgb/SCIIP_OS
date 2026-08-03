import assert from 'node:assert/strict';
import { evaluateCapacity } from '../src/growth-strategy/capacity/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateCapacity({
  teams:[{teamId:'T1',capacityHours:100},{teamId:'T2',capacityHours:80}],
  assignments:[
    {teamId:'T1',requiredHours:110},
    {teamId:'T2',requiredHours:60}
  ]
});

t(r.totalTeams===2);
t(r.overCapacity===1);
t(r.teams[0].status==='OVER_CAPACITY');
t(r.teams[1].status==='AVAILABLE');
t(r.capacityVisible);
t(r.executiveApprovalRequired);
t(!r.autonomousStaffingAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT244_CAPACITY_RESOURCE_PLANNING',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
