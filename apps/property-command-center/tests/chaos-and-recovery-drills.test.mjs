import assert from'node:assert/strict';import{runRecoveryDrill}from'../src/production-operations/drills/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=runRecoveryDrill({scenario:{scenarioId:'DRILL-1',rtoMinutes:30},controls:{productionTrafficAffected:false,productionWritesAffected:false},results:{recovered:true,recoveryMinutes:20,evidence:[{}]}});
t(r.scenarioId==='DRILL-1');t(r.safe);t(r.recovered);t(r.recoveryMinutes===20);t(r.rtoMinutes===30);t(r.rtoMet);t(r.status==='PASSED');t(r.evidence.length===1);t(!r.productionTrafficAffected);t(!r.productionWritesAffected);
console.log(JSON.stringify({framework:'SCIIP_PHASE15_SPRINT160_CHAOS_AND_RECOVERY_DRILLS',status:'PASSED',testsRun:n,result:r},null,2));
