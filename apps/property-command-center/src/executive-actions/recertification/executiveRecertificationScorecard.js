import{freezeDeep,uniq}from'./_shared.js';
export function createExecutiveRecertificationScorecard({id,plan,residualAssessment,rescore,gate,evidence,controls,sourceSignalIds=[]}={}){
  return freezeDeep({
    id:String(id),
    remediationPlanId:plan.id,
    readinessAssessmentId:plan.readinessAssessmentId||null,
    remediationActions:(plan.actions||[]).length,
    verifiedEvidence:evidence.filter(item=>item.status==='VERIFIED').length,
    controlsPassed:controls.filter(item=>item.status==='PASSED'||item.status==='WAIVED').length,
    resolvedGaps:residualAssessment.resolvedCount,
    unresolvedGaps:residualAssessment.unresolvedCount,
    readinessScore:rescore.readinessScore,
    readinessStatus:rescore.status,
    certificationStatus:gate.status,
    certificationReasons:gate.reasons,
    sourceSignalIds:uniq([...(plan.sourceSignalIds||[]),...sourceSignalIds]),
    readOnly:true,
    advisoryOnly:true,
    humanReviewRequired:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  });
}
