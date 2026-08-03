import assert from'node:assert/strict';
import{reconcileKnowledgeGraph}from'../src/phase18-corpus/graph/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=reconcileKnowledgeGraph({
 expectedNodes:[{id:'N1'},{id:'N2'}],
 actualNodes:[{id:'N1'},{id:'N3'}],
 expectedEdges:[{id:'E1'}],
 actualEdges:[{id:'E1'}]
});
t(r.nodeDrift===2);t(r.edgeDrift===0);t(!r.synchronized);t(r.missingNodes[0].id==='N2');t(r.unexpectedNodes[0].id==='N3');t(r.reconciliationEvidencePreserved);t(!r.autonomousGraphMutationAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT298_KNOWLEDGE_GRAPH_RECONCILIATION',status:'PASSED',testsRun:n,result:r},null,2));
