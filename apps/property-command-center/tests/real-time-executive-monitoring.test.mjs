import assert from'node:assert/strict';import{evaluateExecutiveConditions}from'../src/autonomous-executive/monitoring/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=evaluateExecutiveConditions({signals:[{subjectId:'P1',risk:88}],rules:[{ruleId:'R1',field:'risk',operator:'GT',threshold:80,severity:'HIGH'}]});
t(r.alertCount===1);t(r.alerts[0].severity==='HIGH');t(r.monitoringActive);t(r.notificationOnly);t(!r.executionAuthorized);
console.log(JSON.stringify({framework:'SCIIP_PHASE8_SPRINT97_REAL_TIME_EXECUTIVE_MONITORING',status:'PASSED',testsRun:n,result:r},null,2));
