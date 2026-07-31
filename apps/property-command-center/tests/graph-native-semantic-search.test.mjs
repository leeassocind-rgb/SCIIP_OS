import assert from 'node:assert/strict';
import { searchKnowledgeGraph } from '../src/enterprise-intelligence/semantic-search/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=searchKnowledgeGraph({
  query:'Rialto logistics',
  nodes:[
    {id:'P1',type:'PROPERTY',label:'Rialto Logistics Center',city:'Rialto'},
    {id:'P2',type:'PROPERTY',label:'Ontario Distribution Center',city:'Ontario'},
    {id:'T1',type:'TENANT',label:'Logistics Tenant'}
  ],
  edges:[{from:'T1',to:'P1',type:'OCCUPIES'}]
});

t(result.total===2);
t(result.results[0].nodeId==='P1');
t(result.results[0].score>result.results[1].score);
t(result.results[0].relationshipCount===1);
t(result.evidenceBacked);
t(result.graphNative);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE6_SPRINT76_GRAPH_NATIVE_SEMANTIC_SEARCH',
  status:'PASSED',testsRun:tests,
  result:{top:result.results[0],total:result.total}
},null,2));
