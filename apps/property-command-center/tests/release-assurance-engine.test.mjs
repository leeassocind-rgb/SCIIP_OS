import assert from'node:assert/strict';
import{evaluateReleaseAssurance}from'../src/enterprise-governance/release/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateReleaseAssurance({
 releaseId:'REL-1',
 gates:[{gateId:'G1',passed:true},{gateId:'G2',passed:true,approvalId:'A1'}],
 approvals:[{approvalId:'A1',status:'APPROVED'}]
});
t(r.releaseId==='REL-1');t(r.gatesRun===2);t(r.gatesPassed===2);t(r.gatesFailed===0);t(r.status==='RELEASE_READY');t(r.approvalRequired);t(r.immutableDecisionRecord);t(!r.autonomousReleaseAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT262_RELEASE_ASSURANCE_ENGINE',status:'PASSED',testsRun:n,result:r},null,2));
