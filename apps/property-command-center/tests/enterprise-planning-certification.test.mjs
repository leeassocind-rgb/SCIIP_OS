import assert from 'node:assert/strict';
import { certifyEnterprisePlanning } from '../src/enterprise-planning/certification/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=certifyEnterprisePlanning({
  forecasting:{assumptionsVisible:true,evidenceBacked:true},
  capital:{evidenceBacked:true,executiveApprovalRequired:true},
  scenarios:{assumptionsVisible:true,sensitivityAnalysis:true},
  decisionSupport:{evidenceChainPreserved:true,approvalRequired:true},
  command:{strategicPlanningReady:true,executiveApprovalRequired:true},
  userValidation:{navigation:true,planningVisible:true,controlsVisible:true},
  governance:{evidenceRequired:true,approvalRequired:true,permanentHistory:true},
  safety:{
    autonomousExecutionAllowed:false,
    autonomousCapitalDeploymentAllowed:false,
    autonomousCommitmentAllowed:false
  }
});

t(r.status==='CERTIFIED');
t(r.checksRun===8);
t(r.checksPassed===8);
t(r.checksFailed===0);
t(r.enterprisePlanningReady);
t(r.forecastingCertified);
t(r.capitalCertified);
t(r.scenariosCertified);
t(r.decisionSupportCertified);
t(r.planningCommandCertified);
t(!r.autonomousExecutionAllowed);
t(!r.autonomousCapitalDeploymentAllowed);
t(!r.autonomousCommitmentAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT252_ENTERPRISE_PLANNING_CERTIFICATION',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
