import assert from 'node:assert/strict';
import { evaluateStrategicAssurance } from '../src/enterprise-assurance/assurance/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateStrategicAssurance({
  controls:[
    {controlId:'C1',implemented:true,minimumEvidence:1},
    {controlId:'C2',implemented:false,minimumEvidence:1}
  ],
  evidence:[{controlId:'C1',evidenceId:'E1'}]
});

t(r.total===2);
t(r.passed===1);
t(r.failed===1);
t(r.controls[0].status==='ASSURED');
t(r.controls[1].remediationRequired);
t(r.evidencePreserved);
t(r.assuranceIndependent);
t(r.executiveReviewRequired);
t(!r.autonomousCertificationAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT256_STRATEGIC_ASSURANCE_ENGINE',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
