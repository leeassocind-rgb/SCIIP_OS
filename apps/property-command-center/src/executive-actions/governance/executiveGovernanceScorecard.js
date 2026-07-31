import{freezeDeep,round,uniq}from'./_shared.js';

export function createExecutiveGovernanceScorecard({
  id,subjectId,policyEvaluations,exceptionResult,evidenceChain,humanApproval,sourceSignalIds=[]
}={}){
  const rulesEvaluated=policyEvaluations.reduce((sum,item)=>sum+item.rulesEvaluated,0);
  const rulesPassed=policyEvaluations.reduce((sum,item)=>sum+item.rulesPassed,0);
  const complianceScore=rulesEvaluated?round((rulesPassed/rulesEvaluated)*100):0;
  const unresolvedRules=policyEvaluations.flatMap(item=>item.failedRequiredRules)
    .filter(ruleId=>!exceptionResult.coveredRuleIds.includes(ruleId));
  const evidenceComplete=evidenceChain.complete;
  const approved=Boolean(humanApproval?.approved&&humanApproval?.actorId);
  const certified=unresolvedRules.length===0&&evidenceComplete&&approved;
  return freezeDeep({
    id:String(id),
    subjectId:String(subjectId),
    policiesEvaluated:policyEvaluations.length,
    rulesEvaluated,
    rulesPassed,
    rulesFailed:rulesEvaluated-rulesPassed,
    complianceScore,
    exceptions:exceptionResult.exceptions.length,
    waivers:exceptionResult.waivers.length,
    unresolvedRules,
    evidenceComplete,
    certificationStatus:certified?'CERTIFIED':'CERTIFICATION_BLOCKED',
    humanApprovalRequired:true,
    humanApprovedBy:humanApproval?.actorId||null,
    sourceSignalIds:uniq([...evidenceChain.sourceSignalIds,...sourceSignalIds]),
    appendOnly:true,
    readOnly:true,
    advisoryOnly:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  });
}
