import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createEnterprisePlanningCommand } from '../src/enterprise-planning/executive/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=createEnterprisePlanningCommand({
  forecasts:[{period:1,forecast:100}],
  capitalPlans:[{opportunityId:'O1',status:'RECOMMENDED',score:90}],
  scenarios:[{scenarioId:'UPSIDE'}],
  decisions:[{decisionId:'D1',status:'READY_FOR_EXECUTIVE_REVIEW',score:85}],
  approvals:[{approvalId:'A1',status:'PENDING'}]
});

t(r.attentionCount===3);
t(r.strategicPlanningReady);
t(r.executiveApprovalRequired);
t(!r.autonomousExecutionAllowed);
t(!r.autonomousCapitalDeploymentAllowed);

const source=fs.readFileSync('src/components/EnterpriseForecastingCapitalPlanningCenter.jsx','utf8');
t(source.includes('Enterprise Forecasting & Capital Planning Center'));
t(source.includes('CAPITAL GOVERNANCE ACTIVE'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT251_ENTERPRISE_PLANNING_COMMAND_CENTER',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
