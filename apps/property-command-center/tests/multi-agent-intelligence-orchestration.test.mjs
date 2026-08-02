import assert from 'node:assert/strict';
import { orchestrateIntelligenceAgents } from '../src/intelligence-platform/agents/index.js';

let n = 0;
const t = condition => { n++; assert.ok(condition); };

const result = orchestrateIntelligenceAgents({
  missionId: 'MISSION-1',
  agents: [
    { agentId: 'GRAPH', capabilities: ['graph', 'reasoning'], confidence: .9 },
    { agentId: 'MARKET', capabilities: ['market', 'research'], confidence: .85 }
  ],
  work: [
    { workId: 'W1', requiredCapabilities: ['graph'], consequential: false },
    { workId: 'W2', requiredCapabilities: ['market'], consequential: true }
  ]
});

t(result.assigned === 2);
t(result.unassigned === 0);
t(result.assignments[0].agentId === 'GRAPH');
t(result.assignments[1].agentId === 'MARKET');
t(result.assignments[1].approvalRequired);
t(result.assignments.every(item => !item.autoExecute));
t(result.sharedContext);
t(result.conflictResolutionRequired);
t(result.governed);
t(!result.autonomousExecutionAllowed);

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE17_SPRINT207_MULTI_AGENT_INTELLIGENCE_ORCHESTRATION',
  status: 'PASSED',
  testsRun: n,
  result
}, null, 2));
