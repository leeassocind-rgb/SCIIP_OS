import assert from 'node:assert/strict';
import { fuseEvidence } from '../src/intelligence-platform/evidence/index.js';

let n = 0;
const t = condition => { n++; assert.ok(condition); };

const result = fuseEvidence({
  evidence: [
    { evidenceId: 'E1', subjectId: 'P1', sourceType: 'SUPERSHEET', confidence: .9 },
    { evidenceId: 'E2', subjectId: 'P1', sourceType: 'GRAPH', confidence: .8 },
    { evidenceId: 'E3', subjectId: 'P2', sourceType: 'MARKET', confidence: .4 }
  ]
});

t(result.subjects === 2);
t(result.supported === 1);
t(result.corroborated === 1);
t(result.fused[0].subjectId === 'P1');
t(result.fused[0].confidence === .85);
t(result.fused[0].corroborated);
t(result.provenancePreserved);
t(result.conflictsVisible);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE17_SPRINT206_EVIDENCE_FUSION_ENGINE',
  status: 'PASSED',
  testsRun: n,
  result
}, null, 2));
