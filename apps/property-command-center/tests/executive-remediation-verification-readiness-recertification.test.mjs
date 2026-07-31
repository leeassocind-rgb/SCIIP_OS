import assert from'node:assert/strict';
import{
  createExecutiveReadinessRecertificationEngine,
  createExecutiveRemediationEvidence,
  verifyExecutiveControl,
  evaluateExecutiveCertificationGate
}from'../src/executive-actions/recertification/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message)};

const remediationPlan={
  id:'REM-17-1',
  readinessAssessmentId:'READY-16-1',
  sourceSignalIds:['SIG-17'],
  actions:[
    {id:'A',gapId:'G1',priority:'CRITICAL',evidenceRequired:['policy']},
    {id:'B',gapId:'G2',priority:'HIGH',evidenceRequired:['approval']},
    {id:'C',gapId:'G3',priority:'MEDIUM',evidenceRequired:['test']}
  ]
};

const evidence=[
  {id:'E1',actionId:'A',status:'VERIFIED',verifiedBy:'USR-1',verifiedAt:'2026-07-31T18:00:00.000Z',sourceSignalIds:['SIG-17']},
  {id:'E2',actionId:'B',status:'VERIFIED',verifiedBy:'USR-1',verifiedAt:'2026-07-31T18:05:00.000Z'},
  {id:'E3',actionId:'C',status:'VERIFIED',verifiedBy:'USR-1',verifiedAt:'2026-07-31T18:10:00.000Z'}
];

const controls=[
  {id:'CTRL-A',actionId:'A',status:'PASSED',critical:true,testedBy:'USR-2',testedAt:'2026-07-31T18:20:00.000Z',evidenceIds:['E1']},
  {id:'CTRL-B',actionId:'B',status:'PASSED',critical:true,testedBy:'USR-2',testedAt:'2026-07-31T18:25:00.000Z',evidenceIds:['E2']},
  {id:'CTRL-C',actionId:'C',status:'PASSED',critical:false,testedBy:'USR-2',testedAt:'2026-07-31T18:30:00.000Z',evidenceIds:['E3']}
];

const engine=createExecutiveReadinessRecertificationEngine({maxAssessments:2});
const result=engine.assess({
  id:'RECERT-18-1',
  remediationPlan,
  baselineReadinessScore:67,
  evidence,
  controls,
  humanSignoff:{approved:true,actorId:'EXEC-1',signedAt:'2026-07-31T18:45:00.000Z'},
  sourceSignalIds:['SIG-18']
});
const a=result.assessment;

t(!result.duplicate);
t(a.id==='RECERT-18-1');
t(a.remediationPlanId==='REM-17-1');
t(a.evidence.length===3);
t(a.controls.length===3);
t(a.evidence.every(item=>item.status==='VERIFIED'));
t(a.controls.every(item=>item.status==='PASSED'));
t(a.residualAssessment.resolvedCount===3);
t(a.residualAssessment.unresolvedCount===0);
t(a.residualAssessment.residualGaps.length===3);
t(a.residualAssessment.residualGaps.every(item=>item.resolved));
t(a.residualAssessment.residualGaps.every(item=>item.evidenceCoveragePct===100));
t(a.residualAssessment.residualGaps.every(item=>item.controlPassPct===100));
t(a.rescore.baselineScore===67);
t(a.rescore.remediationLift===33);
t(a.rescore.penalty===0);
t(a.rescore.readinessScore===100);
t(a.rescore.status==='CERTIFIABLE');
t(a.gate.passed);
t(a.gate.status==='CERTIFIED');
t(a.gate.reasons.length===0);
t(a.gate.humanSignoffRequired);
t(a.gate.humanSignoffActor==='EXEC-1');
t(a.scorecard.remediationActions===3);
t(a.scorecard.verifiedEvidence===3);
t(a.scorecard.controlsPassed===3);
t(a.scorecard.resolvedGaps===3);
t(a.scorecard.unresolvedGaps===0);
t(a.scorecard.readinessScore===100);
t(a.scorecard.readinessStatus==='CERTIFIABLE');
t(a.scorecard.certificationStatus==='CERTIFIED');
t(a.scorecard.sourceSignalIds.includes('SIG-17'));
t(a.scorecard.sourceSignalIds.includes('SIG-18'));
t(a.scorecard.readOnly);
t(a.scorecard.advisoryOnly);
t(a.scorecard.humanReviewRequired);
t(!a.scorecard.workflowMutationAllowed);
t(!a.scorecard.autonomousExecutionAllowed);
t(a.scorecard.decisionTraceability);
t(Object.isFrozen(a));
t(Object.isFrozen(a.scorecard));
t(Object.isFrozen(a.evidence[0]));
const dup=engine.assess({id:'RECERT-18-1',remediationPlan,baselineReadinessScore:67,evidence,controls,humanSignoff:{approved:true,actorId:'EXEC-1'}});
t(dup.duplicate);
t(dup.assessment===a);
t(engine.getAssessments().length===1);
t(engine.getStatus().status==='OPERATIONAL');
t(engine.getStatus().readOnly);
t(engine.getStatus().advisoryOnly);
t(engine.getStatus().humanReviewRequired);
t(!engine.getStatus().workflowMutationAllowed);
t(!engine.getStatus().autonomousExecutionAllowed);

const blocked=engine.assess({
  id:'RECERT-18-2',
  remediationPlan,
  baselineReadinessScore:67,
  evidence:[...evidence.slice(0,2),{id:'E3X',actionId:'C',status:'SUBMITTED'}],
  controls:[...controls.slice(0,2),{id:'CTRL-CX',actionId:'C',status:'FAILED',critical:true}],
  humanSignoff:{approved:false}
}).assessment;
t(blocked.status==='CERTIFICATION_BLOCKED');
t(!blocked.gate.passed);
t(blocked.gate.reasons.includes('UNRESOLVED_GAPS'));
t(blocked.gate.reasons.includes('CRITICAL_CONTROL_FAILURE'));
t(blocked.gate.reasons.includes('EVIDENCE_NOT_VERIFIED'));
t(blocked.gate.reasons.includes('HUMAN_SIGNOFF_REQUIRED'));
t(blocked.rescore.readinessScore<90);

const ev=createExecutiveRemediationEvidence({id:'EV-X',actionId:'A'});
t(ev.status==='SUBMITTED');
const ctrl=verifyExecutiveControl({id:'CTRL-X',actionId:'A'});
t(ctrl.status==='NOT_TESTED');
const gate=evaluateExecutiveCertificationGate({residualAssessment:{unresolvedCount:1},rescore:{status:'NOT_READY',criticalControlFailures:1},evidence:[],controls:[],humanSignoff:null});
t(!gate.passed);
t(gate.status==='CERTIFICATION_BLOCKED');

engine.stop();
t(engine.getStatus().status==='STOPPED');
let stoppedError=false;
try{engine.assess({id:'RECERT-X',remediationPlan})}catch{stoppedError=true}
t(stoppedError);
engine.start();
t(engine.getStatus().status==='OPERATIONAL');

t(tests===65);
console.log(JSON.stringify({
  framework:'SCIIP_PHASE2_SPRINT18_EXECUTIVE_REMEDIATION_VERIFICATION_READINESS_RECERTIFICATION',
  status:'PASSED',
  testsRun:tests,
  result:{
    recertificationAssessments:engine.getAssessments().length,
    verifiedEvidence:a.scorecard.verifiedEvidence,
    controlsPassed:a.scorecard.controlsPassed,
    resolvedGaps:a.scorecard.resolvedGaps,
    readinessScore:a.scorecard.readinessScore,
    certificationStatus:a.scorecard.certificationStatus,
    blockedCertificationStatus:blocked.scorecard.certificationStatus,
    readOnly:true,
    advisoryOnly:true,
    humanReviewRequired:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  }
},null,2));
