import assert from'node:assert/strict';
import{evaluateComplianceReadiness}from'../src/enterprise-governance/compliance/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateComplianceReadiness({
 requirements:[{requirementId:'REQ1',controlIds:['C1','C2']}],
 controls:[{controlId:'C1',passed:true},{controlId:'C2',passed:true}],
 evidencePackages:[{controlId:'C1',complete:true},{controlId:'C2',complete:true}]
});
t(r.total===1);t(r.ready===1);t(r.requirements[0].readinessPct===100);t(r.requirements[0].evidenceComplete);t(r.requirements[0].status==='READY');t(r.readinessVisible);t(r.executiveReviewRequired);t(!r.autonomousAttestationAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT261_COMPLIANCE_READINESS_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));
