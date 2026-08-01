import assert from'node:assert/strict';
import fs from'node:fs';
import{createPilotReleaseCandidate}from'../src/pilot-operations/release-candidate/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=createPilotReleaseCandidate({
  version:'13.0-rc1',
  proposals:[
    {status:'APPROVED'},
    {status:'COMPLETED'}
  ],
  resolvedIssueIds:['I1','I2'],
  certifications:[
    {status:'CERTIFIED'},
    {status:'PASSED'}
  ],
  build:{passed:true},
  userValidation:{passed:true},
  rollback:{ready:true}
});
t(result.status==='RELEASE_CANDIDATE');
t(result.gatesRun===5);
t(result.gatesPassed===5);
t(result.gatesFailed===0);
t(result.resolvedIssues===2);
t(result.unresolvedProposals===0);
t(result.pilotDeploymentEligible);
t(!result.productionDeploymentAuthorized);

const source=fs.readFileSync('src/components/PilotGraduationCenter.jsx','utf8');
t(source.includes('Pilot Graduation Center'));
t(source.includes('PRODUCTION DEPLOYMENT BLOCKED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE13_SPRINT137_PILOT_RELEASE_CANDIDATE',
  status:'PASSED',testsRun:n,result
},null,2));
