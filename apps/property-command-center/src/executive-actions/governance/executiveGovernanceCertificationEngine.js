import{freezeDeep}from'./_shared.js';
import{createExecutiveGovernancePolicyEngine}from'./executiveGovernancePolicyEngine.js';
import{evaluateExecutiveGovernancePolicy}from'./executiveGovernanceRuleEvaluator.js';
import{buildExecutiveGovernanceEvidenceChain}from'./executiveGovernanceEvidenceChain.js';
import{applyExecutiveGovernanceExceptions}from'./executiveGovernanceExceptionManager.js';
import{createExecutiveCertificationLedger}from'./executiveCertificationLedger.js';
import{createExecutiveGovernanceScorecard}from'./executiveGovernanceScorecard.js';

export function createExecutiveGovernanceCertificationEngine({policies=[],maxEntries=100}={}){
  const policyEngine=createExecutiveGovernancePolicyEngine({policies});
  const ledger=createExecutiveCertificationLedger({maxEntries});
  let started=true;
  return Object.freeze({
    certify(input={}){
      if(!started)throw new Error('Governance certification engine is stopped');
      if(!input.id)throw new Error('Certification id is required');
      if(!input.subjectId)throw new Error('Certification subjectId is required');
      const existing=ledger.get(input.id);
      if(existing)return{duplicate:true,certification:existing};
      const selectedPolicies=(input.policyIds||[]).map(id=>policyEngine.get(id)).filter(Boolean);
      if(!selectedPolicies.length)throw new Error('At least one registered policy is required');
      const evidenceChain=buildExecutiveGovernanceEvidenceChain(input.evidence||[]);
      const verifiedEvidence=evidenceChain.evidence.filter(item=>item.status==='VERIFIED');
      const policyEvaluations=selectedPolicies.map(policy=>evaluateExecutiveGovernancePolicy({
        policy,
        context:{...(input.context||{}),evaluatedAt:input.evaluatedAt},
        evidence:verifiedEvidence
      }));
      const exceptionResult=applyExecutiveGovernanceExceptions({
        policyEvaluation:{
          failedRequiredRules:policyEvaluations.flatMap(item=>item.failedRequiredRules)
        },
        exceptions:input.exceptions||[]
      });
      const scorecard=createExecutiveGovernanceScorecard({
        id:input.id,
        subjectId:input.subjectId,
        policyEvaluations,
        exceptionResult,
        evidenceChain,
        humanApproval:input.humanApproval,
        sourceSignalIds:input.sourceSignalIds
      });
      const certification=freezeDeep({
        id:String(input.id),
        subjectId:String(input.subjectId),
        createdAt:input.createdAt||new Date().toISOString(),
        policyEvaluations,
        evidenceChain,
        exceptionResult,
        scorecard,
        certificationStatus:scorecard.certificationStatus
      });
      const appended=ledger.append(certification);
      return{duplicate:false,certification:appended.entry};
    },
    registerPolicy:policy=>policyEngine.register(policy),
    getPolicies:()=>policyEngine.list(),
    getLedger:()=>ledger.list(),
    getStatus(){return freezeDeep({
      status:started?'OPERATIONAL':'STOPPED',
      policies:policyEngine.list().length,
      ledgerEntries:ledger.list().length,
      appendOnly:true,
      readOnly:true,
      advisoryOnly:true,
      humanReviewRequired:true,
      workflowMutationAllowed:false,
      autonomousExecutionAllowed:false
    })},
    stop(){started=false},
    start(){started=true}
  });
}
