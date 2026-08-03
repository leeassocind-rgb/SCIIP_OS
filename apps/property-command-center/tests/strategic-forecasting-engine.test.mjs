import assert from'node:assert/strict';
import{generateStrategicForecasts}from'../src/phase18-scenarios/forecasting/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=generateStrategicForecasts({horizonPeriods:3,series:[
 {seriesId:'Rents',values:[100,110,120]},
 {seriesId:'Vacancy',values:[10,9,8]}
]});
t(r.total===2);t(r.horizonPeriods===3);t(r.forecasts[0].projected[0]===130);
t(r.forecasts[1].direction==='DOWN');t(r.methodologyVisible);t(r.evidenceRequired);
t(!r.autonomousForecastChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT326_STRATEGIC_FORECASTING_ENGINE',status:'PASSED',testsRun:n,result:r},null,2));
