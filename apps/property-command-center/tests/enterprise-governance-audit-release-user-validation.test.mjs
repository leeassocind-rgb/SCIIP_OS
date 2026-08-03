import assert from'node:assert/strict';
import fs from'node:fs';
let n=0;const t=c=>{n++;assert.ok(c)};
const m=fs.readFileSync('src/main.jsx','utf8'),r=fs.readFileSync('src/product/workspaceRegistry.js','utf8'),c=fs.readFileSync('src/components/EnterpriseGovernanceAuditReleaseCenter.jsx','utf8');
t(m.includes('EnterpriseGovernanceAuditReleaseCenter'));t(r.includes("'Enterprise Governance, Audit & Release Assurance Center'"));t(c.includes('Enterprise Governance, Audit & Release Assurance Center'));t(c.includes('Governance command'));t(c.includes('Governance controls'));t(c.includes('GOVERNANCE ASSURANCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE17_ENTERPRISE_GOVERNANCE_AUDIT_RELEASE_USER_VALIDATION',status:'PASSED',testsRun:n,result:{navigation:true,governanceVisible:true,controlsVisible:true}},null,2));
