import assert from'node:assert/strict';
import fs from'node:fs';
import{createExecutiveDecisionCommand}from'../src/phase18-decision/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createExecutiveDecisionCommand({
 graph:{nodes:[{decisionId:'D1',evidenceComplete:false}]},
 evidence:{chains:[{claimId:'C1',status:'UNSUPPORTED'}]},
 recommendations:{recommendations:[{recommendationId:'R1',status:'LOW_CONFIDENCE'}]},
 orchestration:{decisions:[{decisionId:'D2',status:'BLOCKED'}]},
 approvals:[{approvalId:'A1',status:'PENDING'}]
});
t(r.attentionCount===5);t(r.executiveDecisionCommandReady);t(r.humanApprovalRequired);t(!r.autonomousDecisionAllowed);t(!r.autonomousExecutionAllowed);
const source=fs.readFileSync('src/components/EnterpriseDecisionIntelligenceCenter.jsx','utf8');
t(source.includes('Enterprise Decision Intelligence & Governed Recommendation Center'));t(source.includes('DECISION GOVERNANCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT305_EXECUTIVE_DECISION_COMMAND_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
