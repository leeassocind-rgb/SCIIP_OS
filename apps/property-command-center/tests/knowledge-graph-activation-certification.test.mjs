import assert from 'node:assert/strict';
import { certifyKnowledgeGraphActivation } from '../src/production-activation/knowledge-graph-certification/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const result=certifyKnowledgeGraphActivation({
  stitching:{edgeCount:3},
  entityResolution:{newCanonical:2,destructiveMergeAllowed:false},
  promotion:{status:'PROMOTED',certificate:{stage:'CANARY',productionWritesEnabled:false}},
  temporal:{eventCount:2,duplicateSafe:true},
  validation:{status:'VALIDATED'}
});

t(result.status==='CERTIFIED');
t(result.checksRun===6);
t(result.checksPassed===6);
t(result.checksFailed===0);
t(!result.productionExecutionAuthorized);
t(!result.destructiveMergeAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE5_SPRINT75_KNOWLEDGE_GRAPH_ACTIVATION_CERTIFICATION',
  status:'PASSED',
  testsRun:tests,
  result
},null,2));
