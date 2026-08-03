import assert from'node:assert/strict';
import{evaluateGovernancePolicies}from'../src/enterprise-governance/policy/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateGovernancePolicies({
  policies:[
    {policyId:'P1',implemented:true,minimumEvidence:1,evidenceIds:['E1']},
    {policyId:'P2',implemented:false,minimumEvidence:1,evidenceIds:['E2']}
  ],
  evidence:[{evidenceId:'E1'},{evidenceId:'E2'}]
});
t(r.total===2);t(r.compliant===1);t(r.nonCompliant===1);t(r.policies[0].status==='COMPLIANT');t(r.policies[1].remediationRequired);t(r.evidenceRequired);t(r.permanentHistory);t(!r.autonomousPolicyChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT259_GOVERNANCE_POLICY_EVALUATION',status:'PASSED',testsRun:n,result:r},null,2));
