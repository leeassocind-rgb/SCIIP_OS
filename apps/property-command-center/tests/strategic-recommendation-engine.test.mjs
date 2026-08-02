import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generateStrategicRecommendations } from '../src/intelligence-platform/recommendations/index.js';

let n = 0;
const t = condition => { n++; assert.ok(condition); };

const result = generateStrategicRecommendations({
  opportunities: [
    { subjectId: 'P1', opportunityScore: 90, action: 'PURSUE' },
    { subjectId: 'P2', opportunityScore: 60, action: 'MONITOR' }
  ],
  risks: [{ subjectId: 'P1', riskScore: 20 }],
  evidence: [{ subjectId: 'P1' }, { subjectId: 'P1' }]
});

t(result.total === 2);
t(result.recommended === 1);
t(result.topRecommendation.subjectId === 'P1');
t(result.topRecommendation.score === 80);
t(result.topRecommendation.riskAdjusted);
t(result.evidenceRequired);
t(result.approvalRequired);
t(!result.autonomousExecutionAllowed);

const source = fs.readFileSync('src/components/EnterpriseIntelligencePlatformCenter.jsx', 'utf8');
t(source.includes('Enterprise Intelligence Platform Center'));
t(source.includes('INTELLIGENCE GOVERNED'));

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE17_SPRINT209_STRATEGIC_RECOMMENDATION_ENGINE',
  status: 'PASSED',
  testsRun: n,
  result
}, null, 2));
