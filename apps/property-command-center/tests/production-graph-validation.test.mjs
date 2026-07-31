import assert from 'node:assert/strict';
import { validateProductionGraph } from '../src/production-activation/graph-validation/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const valid=validateProductionGraph({
  nodes:[{id:'N1'},{id:'N2'}],
  edges:[{from:'N1',to:'N2'}],
  temporalLinks:[{from:'N1',to:'N2'}]
});

t(valid.status==='VALIDATED');
t(valid.checksFailed===0);
t(valid.invalidEdges===0);
t(valid.orphanPct===0);

const blocked=validateProductionGraph({
  nodes:[{id:'N1'},{id:'N2'}],
  edges:[{from:'N1',to:'MISSING'}]
});

t(blocked.status==='BLOCKED');
t(blocked.invalidEdges===1);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE5_SPRINT74_PRODUCTION_GRAPH_VALIDATION',
  status:'PASSED',
  testsRun:tests,
  result:valid
},null,2));
