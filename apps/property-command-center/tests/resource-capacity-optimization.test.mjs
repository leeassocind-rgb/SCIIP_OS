import assert from'node:assert/strict';
import{optimizeResourceCapacity}from'../src/phase18-capital/resources/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=optimizeResourceCapacity({
 resources:[{resourceId:'Analyst',capacity:100}],
 demands:[
  {demandId:'D1',resourceId:'Analyst',required:70},
  {demandId:'D2',resourceId:'Analyst',required:50}
 ]
});
t(r.total===2);t(r.met===1);t(r.constrained===1);t(r.demands[1].allocated===30);
t(r.resourceUsage.Analyst===100);t(r.humanOverrideRequired);
t(!r.autonomousResourceReassignmentAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT332_RESOURCE_CAPACITY_OPTIMIZATION',status:'PASSED',testsRun:n,result:r},null,2));
