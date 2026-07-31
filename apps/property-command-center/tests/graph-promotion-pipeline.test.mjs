import assert from 'node:assert/strict';
import { createGraphPromotionPipeline } from '../src/production-activation/graph-promotion/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const pipeline=createGraphPromotionPipeline();
const canary=pipeline.promote({
  graph:{nodes:[{}],edges:[{}]},
  stage:'CANARY',
  approvedBy:'A1',
  evidenceDigest:'D1'
});
t(canary.status==='PROMOTED');
t(Boolean(canary.certificate.rollbackCheckpoint));
t(canary.certificate.nodes===1);

const production=pipeline.promote({
  graph:{nodes:[{}],edges:[]},
  stage:'PRODUCTION',
  approvedBy:'A1',
  evidenceDigest:'D2'
});
t(production.status==='PRODUCTION_BLOCKED');
t(!production.committed);
t(pipeline.snapshot().productionDefaultDenied);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE5_SPRINT72_GRAPH_PROMOTION_PIPELINE',
  status:'PASSED',
  testsRun:tests,
  result:pipeline.snapshot()
},null,2));
