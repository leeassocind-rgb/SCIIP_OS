import assert from'node:assert/strict';
import fs from'node:fs';
import{createPhase17GraduationCommand}from'../src/enterprise-operating-model/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createPhase17GraduationCommand({
 operatingModel:{domains:[{domainId:'D1',status:'INCOMPLETE'}]},
 improvements:{items:[{improvementId:'I1',status:'INSUFFICIENT_EVIDENCE'}]},
 benchmarks:{metrics:[{metricId:'M1',status:'BELOW_BENCHMARK'}]},
 rhythm:{meetings:[{meetingId:'MEET1',status:'FOLLOW_UP_REQUIRED'}]},
 approvals:[{approvalId:'A1',status:'PENDING'}]
});
t(r.attentionCount===5);t(r.phase17GraduationReady);t(r.executiveApprovalRequired);t(!r.autonomousGraduationAllowed);t(!r.autonomousExecutionAllowed);
const s=fs.readFileSync('src/components/EnterpriseOperatingModelGraduationCenter.jsx','utf8');
t(s.includes('Enterprise Operating Model & Continuous Improvement Center'));t(s.includes('PHASE 17 GRADUATION READY'));
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT281_PHASE17_ENTERPRISE_GRADUATION_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
