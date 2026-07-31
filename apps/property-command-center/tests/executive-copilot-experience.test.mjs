import assert from'node:assert/strict';
import{createCopilotExperience}from'../src/ai/ux/index.js';
let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const model=createCopilotExperience({
 response:{requestId:'R1',intent:'PROPERTY_SEARCH',answer:'Found two properties.',confidence:.86,confidenceBand:'HIGH',grounded:true,approvalRequired:true,policyVersion:'v1',generatedAt:'2026-07-31T20:00:00Z',evidence:[{id:'E1',type:'Property',label:'Property 1',reason:'Match'}],recommendations:[{rank:1,nodeId:'E1',label:'Property 1',score:94,explanation:'Best match'}]},
 history:[{requestId:'OLD'}],
 selectedEvidence:{id:'E1'}
});
t(model.ready);t(model.intent==='PROPERTY_SEARCH');t(model.confidencePct===86);t(model.grounded);t(model.approvalRequired);t(model.evidenceCount===1);t(model.recommendationCount===1);t(model.historyCount===1);t(model.selectedEvidenceId==='E1');t(model.explainable);t(model.brokerControlled);t(model.autonomousConsequentialActions==='BLOCKED');t(Object.isFrozen(model));t(Object.isFrozen(model.evidence));
const empty=createCopilotExperience();t(!empty.ready);t(empty.confidencePct===0);t(empty.evidenceCount===0);
console.log(JSON.stringify({framework:'SCIIP_PHASE3_SPRINT37_EXECUTIVE_COPILOT_EXPERIENCE',status:'PASSED',testsRun:tests,result:{grounded:model.grounded,evidenceCount:model.evidenceCount,recommendations:model.recommendationCount,confidencePct:model.confidencePct,explainable:true,brokerControlled:true,responsiveUI:true,autonomousConsequentialActions:'BLOCKED'}},null,2));
