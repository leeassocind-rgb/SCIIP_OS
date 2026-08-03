import assert from'node:assert/strict';
import{evaluateEnterpriseAdoption}from'../src/enterprise-deployment/adoption/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateEnterpriseAdoption({
 users:[{userId:'U1'},{userId:'U2'},{userId:'U3'}],
 sessions:[{userId:'U1',workspaceId:'W1'},{userId:'U2',workspaceId:'W1'}],
 workspaces:[{workspaceId:'W1'},{workspaceId:'W2'}]
});
t(r.users===3);t(r.activeUsers===2);t(r.adoptionPct===66.67);t(r.adoptedWorkspaces===1);t(r.workspaceUsage[1].status==='UNUSED');t(r.privacyPreserved);t(!r.userScoringAllowed);t(!r.autonomousBehaviorModificationAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT266_ENTERPRISE_ADOPTION_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));
