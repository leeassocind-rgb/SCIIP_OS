import assert from'node:assert/strict';import{protectSensitiveData}from'../src/enterprise-ai/assurance/data-protection/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=protectSensitiveData({fields:[{name:'email',type:'PII',value:'a@example.com'},{name:'address',type:'PUBLIC',value:'100 Main'}],policy:{sensitiveTypes:['PII'],action:'REDACT'}});
t(r.total===2);t(r.protected===1);t(r.fields[0].value==='[REDACTED]');t(r.fields[0].action==='REDACT');t(r.fields[1].value==='100 Main');t(r.policyApplied);t(!r.rawSensitiveDataExposed);t(r.auditRequired);t(!r.autonomousOverrideAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE16_SPRINT196_SENSITIVE_DATA_PROTECTION',status:'PASSED',testsRun:n,result:r},null,2));
