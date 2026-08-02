import assert from'node:assert/strict';
import{reasonAcrossEnterpriseGraph}from'../src/enterprise-ai/graph/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=reasonAcrossEnterpriseGraph({
  startNodeId:'T1',
  nodes:[
    {id:'T1',type:'TENANT'},
    {id:'P1',type:'PROPERTY'},
    {id:'C1',type:'CITY'},
    {id:'M1',type:'MARKET'}
  ],
  edges:[
    {from:'T1',to:'P1',type:'OCCUPIES'},
    {from:'P1',to:'C1',type:'LOCATED_IN'},
    {from:'C1',to:'M1',type:'PART_OF'}
  ],
  targetTypes:['MARKET'],
  maximumHops:3
});
t(result.findingCount===1);
t(result.findings[0].nodeId==='M1');
t(result.findings[0].hops===3);
t(result.findings[0].path.length===4);
t(result.findings[0].evidence.length===3);
t(result.findings[0].confidence>0);
t(result.explainable);
t(result.evidenceRanked);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE16_SPRINT181_ENTERPRISE_KNOWLEDGE_GRAPH_INTELLIGENCE',
  status:'PASSED',
  testsRun:n,
  result
},null,2));
