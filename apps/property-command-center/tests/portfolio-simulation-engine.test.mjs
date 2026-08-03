import assert from'node:assert/strict';
import{simulatePortfolio}from'../src/phase18-scenarios/simulation/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=simulatePortfolio({
 scenario:{revenueFactor:1.1,costFactor:1.05,riskFactor:1.2},
 assets:[
  {assetId:'A1',revenue:100,cost:60,riskScore:20},
  {assetId:'A2',revenue:50,cost:70,riskScore:80}
 ]
});
t(r.total===2);t(r.resilient===1);t(r.atRisk===1);t(r.assets[0].simulatedRevenue===110);
t(r.assets[1].status==='AT_RISK');t(r.assumptionsVisible);t(!r.autonomousReallocationAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT327_PORTFOLIO_SIMULATION_ENGINE',status:'PASSED',testsRun:n,result:r},null,2));
