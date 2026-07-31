import assert from'node:assert/strict';
import{
  createExecutiveGovernanceReviewEngine,
  createExecutiveGovernanceReviewDecision,
  resolveExecutiveGovernanceConflict,
  evaluateExecutiveGovernanceReviewPolicy,
  createExecutiveGovernanceDecisionLedger
}from'../src/executive-actions/governance-review/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const advisory={
  id:'ADV-21-2',
  recommendations:[
    {id:'REC-1',action:'REVALIDATE_POLICY',domain:'POLICY'},
    {id:'REC-2',action:'REVALIDATE_POLICY',domain:'POLICY'},
    {id:'REC-3',action:'REVIEW_EXCEPTION',domain:'EXCEPTION'}
  ],
  conflicts:{
    conflicts:[
      {id:'CONFLICT-1',recommendationIds:['REC-1','REC-2'],reason:'DUPLICATIVE_DOMAIN_ACTIONS'}
    ]
  }
};

const engine=createExecutiveGovernanceReviewEngine({maxEntries:10});
t(engine.getStatus().status==='OPERATIONAL');
t(engine.getStatus().appendOnly);
t(engine.getStatus().humanReviewRequired);
t(!engine.getStatus().workflowMutationAllowed);
t(!engine.getStatus().autonomousExecutionAllowed);

const result=engine.review({
  id:'REVIEW-22-1',
  advisory,
  conflictResolutions:[
    {
      id:'RES-1',
      conflictId:'CONFLICT-1',
      recommendationIds:['REC-1','REC-2'],
      primaryRecommendationId:'REC-1',
      actorId:'EXEC-1',
      resolution:'SELECT_PRIMARY',
      reason:'REC-1 has stronger evidence.'
    }
  ],
  decisions:[
    {
      id:'DEC-1',
      recommendationId:'REC-1',
      advisoryId:advisory.id,
      actorId:'EXEC-1',
      disposition:'APPROVED',
      reason:'Proceed to governed proposal preparation.',
      evidenceIds:['EV-1'],
      conflictIds:['CONFLICT-1'],
      sourceSignalIds:['SIG-22']
    },
    {
      id:'DEC-2',
      recommendationId:'REC-2',
      advisoryId:advisory.id,
      actorId:'EXEC-1',
      disposition:'REJECTED',
      reason:'Superseded by REC-1.',
      evidenceIds:['EV-2'],
      conflictIds:['CONFLICT-1']
    },
    {
      id:'DEC-3',
      recommendationId:'REC-3',
      advisoryId:advisory.id,
      actorId:'EXEC-2',
      disposition:'DEFERRED',
      reason:'Await additional exception evidence.',
      evidenceIds:['EV-3']
    }
  ]
});
const r=result.review;
t(!result.duplicate);
t(r.id==='REVIEW-22-1');
t(r.advisoryId==='ADV-21-2');
t(r.decisions.length===3);
t(r.conflictResolutions.length===1);
t(r.policyResults.length===3);
t(r.policyResults.every(item=>item.passed));
t(r.ledgerEntries.length===3);
t(r.ledgerEntries.every(item=>item.status==='RECORDED'));
t(r.scorecard.recommendationsReviewed===3);
t(r.scorecard.approved===1);
t(r.scorecard.rejected===1);
t(r.scorecard.deferred===1);
t(r.scorecard.conflictsResolved===1);
t(r.scorecard.blockedReviews===0);
t(r.scorecard.reviewComplete);
t(r.scorecard.humanReviewRequired);
t(r.scorecard.appendOnly);
t(r.scorecard.readOnly);
t(r.scorecard.advisoryOnly);
t(!r.scorecard.workflowMutationAllowed);
t(!r.scorecard.autonomousExecutionAllowed);
t(r.scorecard.decisionTraceability);
t(r.status==='REVIEW_COMPLETED');
t(Object.isFrozen(r));
t(Object.isFrozen(r.scorecard));
t(Object.isFrozen(r.decisions[0]));
t(engine.getReviews().length===1);
t(engine.getDecisionLedger().length===3);
t(engine.getDecisionLedger()[0].sequence===1);
t(engine.getDecisionLedger()[2].sequence===3);

const dup=engine.review({id:'REVIEW-22-1',advisory});
t(dup.duplicate);
t(dup.review===r);

const incomplete=engine.review({
  id:'REVIEW-22-2',
  advisory,
  decisions:[
    {
      id:'DEC-X',
      recommendationId:'REC-1',
      advisoryId:advisory.id,
      actorId:'EXEC-3',
      disposition:'APPROVED',
      reason:'Approve without evidence.'
    }
  ]
}).review;
t(incomplete.status==='REVIEW_INCOMPLETE');
t(incomplete.policyResults[0].status==='REVIEW_POLICY_BLOCKED');
t(incomplete.policyResults[0].reasons.includes('APPROVAL_EVIDENCE_REQUIRED'));
t(incomplete.policyResults[0].reasons.includes('CONFLICT_RESOLUTION_REQUIRED'));
t(incomplete.scorecard.blockedReviews===1);
t(!incomplete.scorecard.reviewComplete);

const decision=createExecutiveGovernanceReviewDecision({
  id:'D-DIRECT',
  recommendationId:'REC-9',
  actorId:'EXEC-9',
  disposition:'REJECTED',
  reason:'Not aligned.'
});
t(decision.humanDecision);
t(decision.disposition==='REJECTED');
const resolution=resolveExecutiveGovernanceConflict({
  id:'R-DIRECT',
  recommendationIds:['A','B'],
  actorId:'EXEC-9',
  resolution:'MERGE',
  reason:'Combine recommendations.'
});
t(resolution.resolution==='MERGE');
const policy=evaluateExecutiveGovernanceReviewPolicy({
  recommendation:{id:'R'},
  decision:createExecutiveGovernanceReviewDecision({
    id:'D-POL',
    recommendationId:'R',
    actorId:'EXEC-9',
    disposition:'REJECTED',
    reason:'No.'
  })
});
t(policy.passed);

const ledger=createExecutiveGovernanceDecisionLedger({maxEntries:1});
t(!ledger.append({id:'L1',recommendationId:'R1'}).duplicate);
t(ledger.append({id:'L1',recommendationId:'R1'}).duplicate);
t(ledger.append({id:'L2',recommendationId:'R1'}).duplicate);
t(!ledger.append({id:'L3',recommendationId:'R3'}).duplicate);
t(ledger.list().length===1);
t(ledger.list()[0].id==='L3');
t(ledger.getStatus().appendOnly);

engine.stop();
t(engine.getStatus().status==='STOPPED');
let stopped=false;
try{engine.review({id:'STOP',advisory})}catch{stopped=true}
t(stopped);
engine.start();
t(engine.getStatus().status==='OPERATIONAL');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE2_SPRINT22_EXECUTIVE_GOVERNANCE_RECOMMENDATION_REVIEW_DECISION_LEDGER',
  status:'PASSED',
  testsRun:tests,
  result:{
    reviews:engine.getReviews().length,
    decisionLedgerEntries:engine.getDecisionLedger().length,
    approved:r.scorecard.approved,
    rejected:r.scorecard.rejected,
    deferred:r.scorecard.deferred,
    conflictsResolved:r.scorecard.conflictsResolved,
    blockedReviews:incomplete.scorecard.blockedReviews,
    humanReviewRequired:true,
    appendOnly:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  }
},null,2));
