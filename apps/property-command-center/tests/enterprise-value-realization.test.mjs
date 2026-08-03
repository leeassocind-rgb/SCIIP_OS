import assert from'node:assert/strict';
import{evaluateEnterpriseValue}from'../src/enterprise-deployment/value/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=evaluateEnterpriseValue({
 baselines:{hoursSaved:100,dealsWon:5},
 initiatives:[
  {initiativeId:'I1',metric:'hoursSaved',currentValue:150,unitValue:100},
  {initiativeId:'I2',metric:'dealsWon',currentValue:6,unitValue:50000}
 ]
});
t(r.total===2);t(r.realized===2);t(r.totalValue===55000);t(r.initiatives[0].delta===50);t(r.initiatives[1].value===50000);t(r.assumptionsVisible);t(r.evidenceBacked);t(!r.autonomousFinancialClaimsAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT267_ENTERPRISE_VALUE_REALIZATION',status:'PASSED',testsRun:n,result:r},null,2));
