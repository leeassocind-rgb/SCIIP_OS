import assert from'node:assert/strict';
import{runGovernedResearch}from'../src/enterprise-ai/research/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=runGovernedResearch({
  question:'Which properties merit review?',
  sources:[
    {sourceId:'S1',verified:true,citation:'SRC-1',claim:'P1 has improving demand',confidence:.9},
    {sourceId:'S2',verified:true,citation:'SRC-2',claim:'P1 has strong power',confidence:.8},
    {sourceId:'S3',verified:false,citation:null,claim:'Unsupported',confidence:.95}
  ]
});
t(result.evidenceCount===2);
t(result.citations.length===2);
t(result.confidence===.85);
t(result.status==='RESEARCH_READY');
t(result.sourceValidationRequired);
t(!result.unsupportedClaimsAllowed);
t(result.approvalRequired);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE16_SPRINT183_GOVERNED_AUTONOMOUS_RESEARCH_ENGINE',
  status:'PASSED',
  testsRun:n,
  result
},null,2));
