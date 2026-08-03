import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createExecutiveGrowthCommand } from '../src/growth-strategy/executive/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=createExecutiveGrowthCommand({
  accounts:[{accountId:'C1',status:'PRIORITY_GROWTH',score:90}],
  territories:[{territoryId:'T1',status:'EXPANSION_CANDIDATE',score:85}],
  scenarios:[{scenarioId:'UPSIDE'}],
  capacity:[{teamId:'TEAM1',status:'OVER_CAPACITY'}],
  approvals:[{approvalId:'A1',status:'PENDING'}]
});

t(r.attentionCount===4);
t(r.executivePlanningReady);
t(r.evidenceBacked);
t(r.approvalRequired);
t(!r.autonomousExecutionAllowed);

const source=fs.readFileSync('src/components/GrowthStrategyExecutivePlanningCenter.jsx','utf8');
t(source.includes('Growth Strategy & Executive Planning Center'));
t(source.includes('GROWTH GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT245_EXECUTIVE_GROWTH_COMMAND',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
