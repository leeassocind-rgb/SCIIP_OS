import assert from'node:assert/strict';
import{orchestrateCrossWorkspaceDecisions}from'../src/phase18-decision/orchestration/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=orchestrateCrossWorkspaceDecisions({
 workspaces:[{workspaceId:'W1'},{workspaceId:'W2'}],
 approvals:[{approvalId:'A1',status:'APPROVED'}],
 decisions:[
  {decisionId:'D1',workspaceIds:['W1','W2'],approvalId:'A1'},
  {decisionId:'D2',workspaceIds:['W3']}
 ]
});
t(r.total===2);t(r.ready===1);t(r.blocked===1);t(r.decisions[0].workspaceCoverage===2);t(r.crossWorkspace);t(r.approvalAware);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT304_CROSS_WORKSPACE_DECISION_ORCHESTRATION',status:'PASSED',testsRun:n,result:r},null,2));
