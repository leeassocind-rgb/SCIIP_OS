import assert from'node:assert/strict';
import{
  createExecutiveGovernanceAdvisorEngine,
  buildExecutiveRecommendationEvidence,
  generateExecutiveGovernanceRecommendations,
  prioritizeExecutiveGovernanceRecommendations,
  detectExecutiveRecommendationConflicts,
  createExecutiveGovernanceAdvisoryLedger
}from'../src/executive-actions/governance-advisor/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const assessment={
  id:'MON-20-2',
  baseline:{subjectId:'INITIATIVE-1',certificationId:'CERT-19-1'},
  detection:{
    drifts:[
      {type:'CONTROL_STATUS_DRIFT',key:'C1',severity:'CRITICAL'},
      {type:'POLICY_VERSION_DRIFT',key:'POL-GOV',severity:'HIGH'},
      {type:'EVIDENCE_DRIFT',key:'E1',severity:'MEDIUM'},
      {type:'READINESS_SCORE_DRIFT',key:'readinessScore',severity:'HIGH'},
      {type:'NEW_EXCEPTION',key:'EX-NEW',severity:'HIGH'}
    ]
  },
  alert:{sourceSignalIds:['SIG-20']}
};

const evidence=[
  {id:'EV1',type:'MONITORING_ASSESSMENT',status:'VERIFIED',source:'SPRINT20',sourceSignalIds:['SIG-20']},
  {id:'EV2',type:'CERTIFICATION_LEDGER',status:'VERIFIED',source:'SPRINT19',sourceSignalIds:['SIG-19']},
  {id:'EV3',type:'READINESS_BASELINE',status:'VERIFIED',source:'SPRINT18',sourceSignalIds:['SIG-18']}
];

const engine=createExecutiveGovernanceAdvisorEngine({maxEntries:2});
t(engine.getStatus().status==='OPERATIONAL');
t(engine.getStatus().appendOnly);
t(engine.getStatus().readOnly);
t(engine.getStatus().advisoryOnly);
t(engine.getStatus().humanReviewRequired);
t(!engine.getStatus().workflowMutationAllowed);
t(!engine.getStatus().autonomousExecutionAllowed);

const result=engine.advise({id:'ADV-21-1',assessment,evidence});
const a=result.advisory;
t(!result.duplicate);
t(a.id==='ADV-21-1');
t(a.assessmentId==='MON-20-2');
t(a.status==='PENDING_HUMAN_REVIEW');
t(a.evidenceChain.evidence.length===3);
t(a.evidenceChain.verifiedEvidenceIds.length===3);
t(a.evidenceChain.complete);
t(a.evidenceChain.sourceSignalIds.includes('SIG-18'));
t(a.evidenceChain.sourceSignalIds.includes('SIG-19'));
t(a.evidenceChain.sourceSignalIds.includes('SIG-20'));
t(a.recommendations.length===5);
t(a.recommendations[0].action==='RETEST_CONTROL');
t(a.recommendations[0].severity==='CRITICAL');
t(a.recommendations[0].priorityScore===79);
t(a.recommendations.every(item=>item.humanApprovalRequired));
t(a.recommendations.every(item=>item.advisoryOnly));
t(a.recommendations.every(item=>!item.workflowMutationAllowed));
t(a.recommendations.every(item=>!item.autonomousExecutionAllowed));
t(a.recommendations.some(item=>item.action==='REVALIDATE_POLICY'));
t(a.recommendations.some(item=>item.action==='REVERIFY_EVIDENCE'));
t(a.recommendations.some(item=>item.action==='REASSESS_READINESS'));
t(a.recommendations.some(item=>item.action==='REVIEW_EXCEPTION'));
t(a.scorecard.recommendationsGenerated===5);
t(a.scorecard.recommendationGroups===5);
t(a.scorecard.groups.includes('CONTROL'));
t(a.scorecard.groups.includes('POLICY'));
t(a.scorecard.groups.includes('EVIDENCE'));
t(a.scorecard.groups.includes('READINESS'));
t(a.scorecard.groups.includes('EXCEPTION'));
t(a.scorecard.averageConfidence===57.8);
t(a.scorecard.evidenceComplete);
t(a.scorecard.humanReviewRequired);
t(a.scorecard.readOnly);
t(a.scorecard.advisoryOnly);
t(!a.scorecard.workflowMutationAllowed);
t(!a.scorecard.autonomousExecutionAllowed);
t(a.scorecard.decisionTraceability);
t(Object.isFrozen(a));
t(Object.isFrozen(a.scorecard));
t(Object.isFrozen(a.recommendations[0]));

const duplicate=engine.advise({id:'ADV-21-1',assessment,evidence});
t(duplicate.duplicate);
t(duplicate.advisory===a);
t(engine.getAdvisories().length===1);
t(engine.getAdvisories()[0].sequence===1);

const conflictAssessment={
  id:'MON-20-3',
  baseline:{subjectId:'INITIATIVE-2',certificationId:'CERT-19-2'},
  detection:{
    drifts:[
      {type:'POLICY_VERSION_DRIFT',key:'POL-GOV',severity:'HIGH'},
      {type:'POLICY_VERSION_DRIFT',key:'POL-AUDIT',severity:'HIGH'},
      {type:'NEW_EXCEPTION',key:'EX-X',severity:'HIGH'}
    ]
  },
  alert:{sourceSignalIds:['SIG-20-X']}
};
const conflictAdvisory=engine.advise({
  id:'ADV-21-2',
  assessment:conflictAssessment,
  evidence
}).advisory;
t(conflictAdvisory.recommendations.length===3);
t(conflictAdvisory.conflicts.conflictCount===3);
t(conflictAdvisory.conflicts.conflicts[0].reason==='DUPLICATIVE_DOMAIN_ACTIONS');
t(conflictAdvisory.scorecard.conflictsDetected===3);
t(engine.getAdvisories().length===2);
t(engine.getAdvisories()[1].sequence===2);

const chain=buildExecutiveRecommendationEvidence({evidence});
t(chain.complete);
const generated=generateExecutiveGovernanceRecommendations({assessment,evidenceChain:chain});
t(generated.length===5);
const prioritized=prioritizeExecutiveGovernanceRecommendations(generated);
t(prioritized[0].confidence===79);
const conflicts=detectExecutiveRecommendationConflicts(prioritized);
t(conflicts.conflictCount===1);

const ledger=createExecutiveGovernanceAdvisoryLedger({maxEntries:1});
t(!ledger.append({id:'L1'}).duplicate);
t(ledger.append({id:'L1'}).duplicate);
t(!ledger.append({id:'L2'}).duplicate);
t(ledger.list().length===1);
t(ledger.list()[0].id==='L2');
t(ledger.getStatus().appendOnly);

engine.stop();
t(engine.getStatus().status==='STOPPED');
let stopped=false;
try{engine.advise({id:'ADV-X',assessment,evidence})}catch{stopped=true}
t(stopped);
engine.start();
t(engine.getStatus().status==='OPERATIONAL');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE2_SPRINT21_EXECUTIVE_AUTONOMOUS_GOVERNANCE_ADVISOR',
  status:'PASSED',
  testsRun:tests,
  result:{
    recommendationsGenerated:a.scorecard.recommendationsGenerated,
    recommendationGroups:a.scorecard.recommendationGroups,
    conflictsDetected:conflictAdvisory.scorecard.conflictsDetected,
    recommendationLedgerEntries:engine.getAdvisories().length,
    recommendationConfidence:a.scorecard.averageConfidence,
    humanReviewRequired:true,
    readOnly:true,
    advisoryOnly:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  }
},null,2));
