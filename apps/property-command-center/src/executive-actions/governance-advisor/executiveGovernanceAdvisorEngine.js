import{freezeDeep}from'./_shared.js';
import{buildExecutiveRecommendationEvidence}from'./executiveRecommendationEvidence.js';
import{generateExecutiveGovernanceRecommendations}from'./executiveRecommendationGenerator.js';
import{prioritizeExecutiveGovernanceRecommendations}from'./executiveRecommendationPrioritizer.js';
import{detectExecutiveRecommendationConflicts}from'./executiveRecommendationConflictDetector.js';
import{createExecutiveRecommendationScorecard}from'./executiveRecommendationScorecard.js';
import{createExecutiveGovernanceAdvisoryLedger}from'./executiveGovernanceAdvisoryLedger.js';

export function createExecutiveGovernanceAdvisorEngine({maxEntries=100}={}){
  const ledger=createExecutiveGovernanceAdvisoryLedger({maxEntries});
  let started=true;
  return Object.freeze({
    advise(input={}){
      if(!started)throw new Error('Governance advisor engine is stopped');
      if(!input.id)throw new Error('Advisory id is required');
      if(!input.assessment?.id)throw new Error('Certification monitoring assessment is required');
      const existing=ledger.get(input.id);
      if(existing)return{duplicate:true,advisory:existing};
      const evidenceChain=buildExecutiveRecommendationEvidence({evidence:input.evidence});
      const generated=generateExecutiveGovernanceRecommendations({
        assessment:input.assessment,
        evidenceChain
      });
      const recommendations=prioritizeExecutiveGovernanceRecommendations(generated);
      const conflicts=detectExecutiveRecommendationConflicts(recommendations);
      const scorecard=createExecutiveRecommendationScorecard({
        id:`SCORECARD:${input.id}`,
        assessment:input.assessment,
        recommendations,
        conflicts,
        evidenceChain
      });
      const advisory=freezeDeep({
        id:String(input.id),
        createdAt:input.createdAt||new Date().toISOString(),
        assessmentId:input.assessment.id,
        evidenceChain,
        recommendations,
        conflicts,
        scorecard,
        status:'PENDING_HUMAN_REVIEW'
      });
      const appended=ledger.append(advisory);
      return{duplicate:false,advisory:appended.entry};
    },
    getAdvisories:()=>ledger.list(),
    getStatus:()=>freezeDeep({
      status:started?'OPERATIONAL':'STOPPED',
      advisories:ledger.list().length,
      appendOnly:true,
      readOnly:true,
      advisoryOnly:true,
      humanReviewRequired:true,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    }),
    stop(){started=false},
    start(){started=true}
  });
}
