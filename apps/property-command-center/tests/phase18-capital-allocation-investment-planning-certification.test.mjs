import assert from'node:assert/strict';
import{certifyCapitalAllocationInvestmentPlanning}from'../src/phase18-capital/certification/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=certifyCapitalAllocationInvestmentPlanning({
 allocation:{assumptionsVisible:true,autonomousAllocationAllowed:false},
 resources:{humanOverrideRequired:true,autonomousResourceReassignmentAllowed:false},
 portfolio:{diversificationVisible:true,evidenceRequired:true},
 stress:{assumptionsVisible:true,stressEvidencePreserved:true},
 command:{executiveCapitalPlanningReady:true,executiveApprovalRequired:true},
 userValidation:{navigation:true,capitalVisible:true,controlsVisible:true},
 governance:{evidenceRequired:true,approvalRequired:true,permanentHistory:true},
 safety:{
  autonomousAllocationAllowed:false,
  autonomousInvestmentSelectionAllowed:false,
  autonomousResourceReassignmentAllowed:false
 }
});
t(r.status==='CERTIFIED');t(r.checksRun===8);t(r.checksPassed===8);t(r.checksFailed===0);
t(r.capitalAllocationInvestmentPlanningReady);t(r.allocationCertified);t(r.resourcesCertified);
t(r.portfolioCertified);t(r.stressCertified);t(r.commandCertified);
t(!r.autonomousAllocationAllowed);t(!r.autonomousInvestmentSelectionAllowed);
t(!r.autonomousResourceReassignmentAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE18_SPRINT336_CAPITAL_ALLOCATION_INVESTMENT_PLANNING_CERTIFICATION',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
