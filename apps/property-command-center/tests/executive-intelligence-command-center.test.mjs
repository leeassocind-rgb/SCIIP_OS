import assert from'node:assert/strict';
import fs from'node:fs';
import{createExecutiveIntelligenceCommand}from'../src/phase18-executive-intelligence/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createExecutiveIntelligenceCommand({
 kpis:{metrics:[{metricId:'M1',status:'OFF_TARGET'}]},
 objectives:{objectives:[{objectiveId:'O1',status:'AT_RISK'}]},
 effectiveness:{decisions:[{decisionId:'D1',status:'REVIEW_REQUIRED'}]},
 recommendations:{recommendations:[{recommendationId:'R1',status:'LOW_CONFIDENCE'}]},
 approvals:[{approvalId:'A1',status:'PENDING'}]
});
t(r.attentionCount===5);t(r.executiveIntelligenceReady);t(r.executiveApprovalRequired);
t(!r.autonomousExecutionAllowed);t(!r.autonomousObjectiveChangesAllowed);
const s=fs.readFileSync('src/components/EnterpriseExecutiveIntelligenceCenter.jsx','utf8');
t(s.includes('Enterprise KPI, Strategic Objectives & Predictive Recommendations Center'));
t(s.includes('EXECUTIVE INTELLIGENCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT323_EXECUTIVE_INTELLIGENCE_COMMAND_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
