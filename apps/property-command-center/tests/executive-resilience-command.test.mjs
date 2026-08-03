import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createExecutiveResilienceCommand } from '../src/enterprise-assurance/executive/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=createExecutiveResilienceCommand({
  risks:[{riskId:'R1',severity:'CRITICAL',score:95}],
  stressTests:[{testId:'S1',status:'VULNERABLE'}],
  contingencies:[{riskId:'R1',status:'PARTIAL'}],
  assurance:{controls:[{controlId:'C1',passed:false}]},
  approvals:[{approvalId:'A1',status:'PENDING'}]
});

t(r.attentionCount===5);
t(r.resilienceCommandReady);
t(r.executiveReviewRequired);
t(!r.autonomousExecutionAllowed);
t(!r.autonomousCertificationAllowed);

const source=fs.readFileSync('src/components/EnterpriseRiskResilienceAssuranceCenter.jsx','utf8');
t(source.includes('Enterprise Risk, Resilience & Strategic Assurance Center'));
t(source.includes('RESILIENCE GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT257_EXECUTIVE_RESILIENCE_COMMAND',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
