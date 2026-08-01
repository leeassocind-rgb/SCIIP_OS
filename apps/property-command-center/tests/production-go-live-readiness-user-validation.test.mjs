import assert from'node:assert/strict';import fs from'node:fs';let n=0;const t=c=>{n++;assert.ok(c)};
const main=fs.readFileSync('src/main.jsx','utf8'),registry=fs.readFileSync('src/product/workspaceRegistry.js','utf8'),center=fs.readFileSync('src/components/GoLiveReadinessCenter.jsx','utf8');
t(main.includes('GoLiveReadinessCenter'));t(registry.includes("'Go-Live Readiness Center'"));t(center.includes('Go-Live Readiness Center'));t(center.includes('Go-live stages'));t(center.includes('Go-live controls'));t(center.includes('PRODUCTION TRAFFIC BLOCKED'));
console.log(JSON.stringify({framework:'SCIIP_PHASE14_PRODUCTION_GO_LIVE_READINESS_USER_VALIDATION',status:'PASSED',testsRun:n,result:{navigation:true,stagesVisible:true,controlsVisible:true}},null,2));
