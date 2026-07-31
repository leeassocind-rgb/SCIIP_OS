import assert from'node:assert/strict';
import{createCopilotEvidenceViewModel}from'../src/enterprise-intelligence/copilot-ui/index.js';
let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const view=createCopilotEvidenceViewModel({copilot:{question:'Q',answer:'A',confidence:.75,grounded:true,citations:[{kind:'GRAPH_NODE',id:'P1'}]}});
t(view.grounded);t(view.evidenceCount===1);t(view.confidence===.75);t(!view.unsupportedClaimsAllowed);t(!view.executionAuthority);
console.log(JSON.stringify({framework:'SCIIP_PHASE6_SPRINT85_COPILOT_EVIDENCE_PANEL',status:'PASSED',testsRun:n,result:view},null,2));
