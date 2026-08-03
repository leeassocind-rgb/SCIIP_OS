import assert from 'node:assert/strict';
import { generateEnterpriseForecast } from '../src/enterprise-planning/forecasting/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=generateEnterpriseForecast({
  series:[{period:'Q1',value:100},{period:'Q2',value:120},{period:'Q3',value:140}],
  horizon:3
});

t(r.forecast.length===3);
t(r.trend===20);
t(r.forecast[0].forecast===160);
t(r.forecast[2].forecast===200);
t(r.confidenceLevel===.9);
t(r.assumptionsVisible);
t(r.evidenceBacked);
t(!r.autonomousCommitmentAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT247_ENTERPRISE_FORECASTING_ENGINE',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
