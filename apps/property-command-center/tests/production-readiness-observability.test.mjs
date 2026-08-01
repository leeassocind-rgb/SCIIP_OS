import assert from'node:assert/strict';
import fs from'node:fs';
import{createProductionReadinessObservability}from'../src/production-activation/observability/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const result=createProductionReadinessObservability({
  deployments:[{status:'ACTIVE'}],
  telemetry:[{success:true}],
  incidents:[],
  approvals:[{status:'APPROVED'}],
  recoveryTests:[{passed:true},{passed:true}],
  performance:{buildPassed:true,interactionReady:true,memoryWithinBudget:true}
});
t(result.activeDeployments===1);
t(result.failedTelemetry===0);
t(result.openIncidents===0);
t(result.pendingApprovals===0);
t(result.recoveryPassed);
t(result.performanceReady);
t(result.blockerCount===0);
t(result.status==='READY');
t(result.traceable);
t(result.auditable);
t(!result.productionDeploymentAuthorized);

const source=fs.readFileSync('src/components/ProductionActivationCenter.jsx','utf8');
t(source.includes('Production Activation Center'));
t(source.includes('PRODUCTION DEPLOYMENT BLOCKED'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE14_SPRINT140_PRODUCTION_READINESS_OBSERVABILITY',
  status:'PASSED',testsRun:n,result
},null,2));
