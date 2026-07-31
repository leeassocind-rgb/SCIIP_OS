import assert from 'node:assert/strict';import fs from 'node:fs';
import { certifyProductionActivation } from '../src/production-activation/readiness/index.js';
const reportPath=process.env.SCIIP_PHASE5_PILOT_REPORT||process.argv[2];if(!reportPath||!fs.existsSync(reportPath))throw new Error('SCIIP_PHASE5_PILOT_REPORT is required');
let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const result=certifyProductionActivation({pilotReport:reportPath,phase4Certified:true,productionBuildPassed:true,rollbackReady:true});
t(result.status==='ACTIVATION_READY');t(Object.values(result.gates).every(Boolean));t(result.activationMode==='CONTROLLED_PILOT');t(result.writebackMode==='APPROVAL_GATED');t(result.rollbackReady);t(result.autonomousConsequentialActions==='BLOCKED');t(result.pilot.inputRows>0);t(result.pilot.actionableRows>0);t(result.pilot.stagedRows>0);t(result.pilot.schemaCoveragePct>=90);t(result.pilot.digest.length===64);
console.log(JSON.stringify({framework:result.framework,status:'PASSED',testsRun:tests,result},null,2));
