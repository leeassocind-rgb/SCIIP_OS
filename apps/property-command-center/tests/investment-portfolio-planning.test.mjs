import assert from'node:assert/strict';
import{planInvestmentPortfolio}from'../src/phase18-capital/portfolio/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=planInvestmentPortfolio({investments:[
 {investmentId:'INV1',returnScore:90,strategicFit:85,confidence:.9,riskScore:20},
 {investmentId:'INV2',returnScore:95,strategicFit:80,confidence:.5,riskScore:10}
]});
t(r.total===2);t(r.reviewReady===1);t(r.topInvestment.investmentId==='INV1');
t(r.diversificationVisible);t(r.evidenceRequired);t(!r.autonomousInvestmentSelectionAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT333_INVESTMENT_PORTFOLIO_PLANNING',status:'PASSED',testsRun:n,result:r},null,2));
