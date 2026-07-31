import{freezeDeep}from'./_shared.js';
import{createExecutiveGovernanceReviewDecision}from'./executiveGovernanceReviewDecision.js';
import{resolveExecutiveGovernanceConflict}from'./executiveGovernanceConflictResolution.js';
import{evaluateExecutiveGovernanceReviewPolicy}from'./executiveGovernanceReviewPolicy.js';
import{createExecutiveGovernanceDecisionLedger}from'./executiveGovernanceDecisionLedger.js';
import{createExecutiveGovernanceReviewScorecard}from'./executiveGovernanceReviewScorecard.js';

export function createExecutiveGovernanceReviewEngine({maxEntries=100}={}){
  const ledger=createExecutiveGovernanceDecisionLedger({maxEntries});
  const reviews=new Map();
  let started=true;
  return Object.freeze({
    review(input={}){
      if(!started)throw new Error('Governance review engine is stopped');
      if(!input.id)throw new Error('Review id is required');
      if(!input.advisory?.id)throw new Error('Governance advisory is required');
      if(reviews.has(input.id))return{duplicate:true,review:reviews.get(input.id)};
      const resolutions=(input.conflictResolutions||[]).map(resolveExecutiveGovernanceConflict);
      const resolutionByConflict=new Map(resolutions.map(item=>[item.conflictId,item]));
      const recommendationById=new Map(input.advisory.recommendations.map(item=>[
        item.id,
        {...item,conflictIds:(input.advisory.conflicts?.conflicts||[])
          .filter(conflict=>conflict.recommendationIds.includes(item.id))
          .map(conflict=>conflict.id)}
      ]));
      const decisions=(input.decisions||[]).map(createExecutiveGovernanceReviewDecision);
      const policyResults=decisions.map(decision=>{
        const recommendation=recommendationById.get(decision.recommendationId);
        const conflictId=recommendation?.conflictIds?.[0];
        return evaluateExecutiveGovernanceReviewPolicy({
          recommendation,
          decision,
          conflictResolution:conflictId?resolutionByConflict.get(conflictId):null
        });
      });
      const ledgerEntries=[];
      for(let i=0;i<decisions.length;i++){
        const decision=decisions[i];
        const policy=policyResults[i];
        const appended=ledger.append(freezeDeep({
          id:`LEDGER:${decision.id}`,
          advisoryId:input.advisory.id,
          recommendationId:decision.recommendationId,
          decision,
          policy,
          status:policy.passed?'RECORDED':'BLOCKED'
        }));
        ledgerEntries.push(appended.entry);
      }
      const scorecard=createExecutiveGovernanceReviewScorecard({
        id:`SCORECARD:${input.id}`,
        advisory:input.advisory,
        decisions,
        conflictResolutions:resolutions,
        policyResults
      });
      const review=freezeDeep({
        id:String(input.id),
        advisoryId:input.advisory.id,
        createdAt:input.createdAt||new Date().toISOString(),
        decisions,
        conflictResolutions:resolutions,
        policyResults,
        ledgerEntries,
        scorecard,
        status:scorecard.reviewComplete?'REVIEW_COMPLETED':'REVIEW_INCOMPLETE'
      });
      reviews.set(input.id,review);
      return{duplicate:false,review};
    },
    getReviews:()=>[...reviews.values()],
    getDecisionLedger:()=>ledger.list(),
    getStatus:()=>freezeDeep({
      status:started?'OPERATIONAL':'STOPPED',
      reviews:reviews.size,
      decisionLedgerEntries:ledger.list().length,
      appendOnly:true,
      humanReviewRequired:true,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    }),
    stop(){started=false},
    start(){started=true}
  });
}
