import assert from'node:assert/strict';
import{buildDecisionGraph}from'../src/phase18-decision/graph/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=buildDecisionGraph({
 decisions:[{decisionId:'D1',minimumEvidence:2},{decisionId:'D2',minimumEvidence:1}],
 evidence:[{decisionId:'D1'},{decisionId:'D1'},{decisionId:'D2'}],
 dependencies:[{fromDecisionId:'D1',toDecisionId:'D2'}]
});
t(r.totalDecisions===2);t(r.evidenceReady===2);t(r.edges[0].fromExists);t(r.edges[0].toExists);t(r.permanentDecisionHistory);t(r.evidenceRequired);t(!r.autonomousDecisionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT301_DECISION_GRAPH_ENGINE',status:'PASSED',testsRun:n,result:r},null,2));
