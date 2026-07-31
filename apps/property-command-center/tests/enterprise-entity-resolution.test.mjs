import assert from 'node:assert/strict';
import { resolveEnterpriseEntities } from '../src/production-activation/entity-resolution/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=resolveEnterpriseEntities({entities:[
  {id:'1',type:'COMPANY',legalName:'Acme Holdings',domain:'acme.com'},
  {id:'2',type:'COMPANY',name:'ACME',domain:'acme.com'},
  {id:'3',type:'PERSON',name:'Jane Smith',email:'jane@example.com'},
  {id:'4',type:'PROPERTY',address:'100 Main St'}
]});

t(result.registrySize===3);
t(result.newCanonical===3);
t(result.autoLinked===1);
t(result.reviewRequired===0);
t(!result.destructiveMergeAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE5_SPRINT71_ENTERPRISE_ENTITY_RESOLUTION',
  status:'PASSED',
  testsRun:tests,
  result
},null,2));
