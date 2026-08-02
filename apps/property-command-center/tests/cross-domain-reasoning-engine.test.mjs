import assert from 'node:assert/strict';
import { reasonAcrossDomains } from '../src/intelligence-platform/reasoning/index.js';

let n = 0;
const t = condition => { n++; assert.ok(condition); };

const result = reasonAcrossDomains({
  question: 'Where is opportunity increasing?',
  domains: [
    { id: 'PROPERTY', type: 'PROPERTY' },
    { id: 'MARKET', type: 'MARKET' },
    { id: 'TENANT', type: 'TENANT' }
  ],
  relationships: [
    { from: 'PROPERTY', to: 'MARKET', type: 'LOCATED_IN' },
    { from: 'MARKET', to: 'TENANT', type: 'ATTRACTS' }
  ],
  maximumHops: 2
});

t(result.domainCount === 3);
t(result.findingCount >= 2);
t(result.crossDomain);
t(result.explainable);
t(result.evidenceBacked);
t(result.findings.some(item => item.hops === 2));
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE17_SPRINT205_CROSS_DOMAIN_REASONING_ENGINE',
  status: 'PASSED',
  testsRun: n,
  result
}, null, 2));
