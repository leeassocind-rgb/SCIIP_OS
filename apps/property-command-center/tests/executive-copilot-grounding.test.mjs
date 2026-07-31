import assert from 'node:assert/strict';
import { groundExecutiveCopilot } from '../src/enterprise-intelligence/copilot/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=groundExecutiveCopilot({
  question:'What properties should we review?',
  searchResults:[{nodeId:'P1',label:'Rialto',score:90}],
  reasoningFindings:[{nodeId:'M1',path:['P1','M1'],hops:1}],
  recommendations:[{recommendationId:'R1',evidence:[{source:'market'}]}]
});

t(result.grounded);
t(result.evidenceCount===3);
t(result.confidence>0.5);
t(result.citations.some(citation=>citation.kind==='GRAPH_NODE'));
t(!result.unsupportedClaimsAllowed);
t(!result.executionAuthority);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE6_SPRINT79_EXECUTIVE_COPILOT_GROUNDING',
  status:'PASSED',testsRun:tests,result
},null,2));
