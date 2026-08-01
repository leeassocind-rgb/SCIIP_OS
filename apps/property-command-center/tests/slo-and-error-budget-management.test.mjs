import assert from'node:assert/strict';import fs from'node:fs';import{evaluateSLOs}from'../src/production-operations/slo/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateSLOs({objectives:[{id:'API',targetPct:99.9,actualPct:99.95},{id:'INGEST',targetPct:99.0,actualPct:98.0}]});
t(r.objectivesTotal===2);t(r.objectivesMet===1);t(r.breaches===1);t(r.objectives[0].status==='MET');t(r.objectives[1].status==='BREACHED');t(r.releaseFreezeRecommended);t(r.productionWritesGoverned);t(!r.autonomousExecutionAllowed);
const s=fs.readFileSync('src/components/IncidentResponseRecoveryCenter.jsx','utf8');t(s.includes('Incident Response & Recovery Center'));t(s.includes('MANUAL RECOVERY CONTROL'));
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT161_SLO_AND_ERROR_BUDGET_MANAGEMENT',status:'PASSED',testsRun:n,result:r},null,2));
