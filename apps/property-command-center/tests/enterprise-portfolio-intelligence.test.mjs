import assert from'node:assert/strict';import{evaluateEnterprisePortfolio}from'../src/enterprise-performance/portfolio/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};const r=evaluateEnterprisePortfolio({portfolios:[{portfolioId:'P1',revenue:5000000,marginPct:40,growthPct:25,riskScore:10},{portfolioId:'P2',revenue:1000000,marginPct:15,growthPct:5,riskScore:50}]});
t(r.total===2);t(r.outperforming===1);t(r.attentionRequired===1);t(r.topPortfolio.portfolioId==='P1');t(r.evidenceBacked);t(r.crossPortfolio);t(!r.autonomousRebalancingAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT271_ENTERPRISE_PORTFOLIO_INTELLIGENCE',status:'PASSED',testsRun:n,result:r},null,2));
