import assert from'node:assert/strict';
import fs from'node:fs';
import{createExecutiveGovernanceCommand}from'../src/enterprise-governance/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createExecutiveGovernanceCommand({
 policies:[{policyId:'P1',passed:false}],
 auditPackages:[{controlId:'C1',complete:false}],
 requirements:[{requirementId:'REQ1',status:'NOT_READY'}],
 releases:[{releaseId:'REL1',status:'BLOCKED'}],
 approvals:[{approvalId:'A1',status:'PENDING'}]
});
t(r.attentionCount===5);t(r.governanceCommandReady);t(r.executiveReviewRequired);t(!r.autonomousPolicyChangesAllowed);t(!r.autonomousReleaseAllowed);
const s=fs.readFileSync('src/components/EnterpriseGovernanceAuditReleaseCenter.jsx','utf8');
t(s.includes('Enterprise Governance, Audit & Release Assurance Center'));t(s.includes('GOVERNANCE ASSURANCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT263_EXECUTIVE_GOVERNANCE_COMMAND_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
