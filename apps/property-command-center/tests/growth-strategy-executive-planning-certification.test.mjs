import assert from 'node:assert/strict';
import { certifyGrowthStrategyExecutivePlanning } from '../src/growth-strategy/certification/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=certifyGrowthStrategyExecutivePlanning({
  accounts:{evidenceBacked:true,brokerReviewRequired:true},
  territories:{evidenceBacked:true,executiveApprovalRequired:true},
  scenarios:{assumptionsVisible:true,approvalRequired:true},
  capacity:{capacityVisible:true,executiveApprovalRequired:true},
  executive:{executivePlanningReady:true,approvalRequired:true},
  userValidation:{navigation:true,growthVisible:true,controlsVisible:true},
  governance:{evidenceRequired:true,approvalRequired:true,permanentHistory:true},
  safety:{
    autonomousExecutionAllowed:false,
    autonomousOutreachAllowed:false,
    autonomousExpansionAllowed:false,
    autonomousCommitmentAllowed:false
  }
});

t(r.status==='CERTIFIED');
t(r.checksRun===8);
t(r.checksPassed===8);
t(r.checksFailed===0);
t(r.growthStrategyExecutivePlanningReady);
t(r.accountsCertified);
t(r.territoriesCertified);
t(r.scenariosCertified);
t(r.capacityCertified);
t(r.executivePlanningCertified);
t(!r.autonomousExecutionAllowed);
t(!r.autonomousOutreachAllowed);
t(!r.autonomousExpansionAllowed);
t(!r.autonomousCommitmentAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT246_GROWTH_STRATEGY_EXECUTIVE_PLANNING_CERTIFICATION',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
