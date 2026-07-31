import assert from 'node:assert/strict';
import { reasonAcrossGraph } from '../src/enterprise-intelligence/reasoning/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=reasonAcrossGraph({
  startNodeId:'T1',targetType:'MARKET',maximumHops:3,
  nodes:[
    {id:'T1',type:'TENANT'},{id:'P1',type:'PROPERTY'},
    {id:'C1',type:'CITY'},{id:'M1',type:'MARKET'}
  ],
  edges:[
    {from:'T1',to:'P1',type:'OCCUPIES'},
    {from:'P1',to:'C1',type:'LOCATED_IN'},
    {from:'C1',to:'M1',type:'PART_OF'}
  ]
});

t(result.findingCount===1);
t(result.findings[0].nodeId==='M1');
t(result.findings[0].hops===3);
t(result.findings[0].evidence.length===3);
t(result.explainable);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE6_SPRINT77_MULTI_HOP_GRAPH_REASONING',
  status:'PASSED',testsRun:tests,result
},null,2));
