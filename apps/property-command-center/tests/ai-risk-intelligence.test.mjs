import assert from'node:assert/strict';import{assessAIRisk}from'../src/enterprise-ai/assurance/risk/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=assessAIRisk({signals:[{riskId:'R1',category:'GROUNDING',severity:5,likelihood:4,exposure:4,evidence:[{}]},{riskId:'R2',category:'LATENCY',severity:2,likelihood:2,exposure:1}]});
t(r.total===2);t(r.critical===1);t(r.topRisk.riskId==='R1');t(r.topRisk.status==='CRITICAL');t(r.topRisk.evidence.length===1);t(r.evidenceBacked);t(r.approvalRequired);t(!r.autonomousExecutionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE16_SPRINT193_AI_RISK_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));
