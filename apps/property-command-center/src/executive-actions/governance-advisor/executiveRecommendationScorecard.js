import{freezeDeep,round,uniq}from'./_shared.js';

export function createExecutiveRecommendationScorecard({
  id,assessment,recommendations,conflicts,evidenceChain
}={}){
  const averageConfidence=recommendations.length
    ?round(recommendations.reduce((sum,item)=>sum+item.confidence,0)/recommendations.length)
    :0;
  const groups=uniq(recommendations.map(item=>item.domain));
  return freezeDeep({
    id:String(id),
    assessmentId:assessment.id,
    subjectId:assessment.baseline.subjectId,
    certificationId:assessment.baseline.certificationId,
    recommendationsGenerated:recommendations.length,
    recommendationGroups:groups.length,
    groups,
    conflictsDetected:conflicts.conflictCount,
    averageConfidence,
    evidenceComplete:evidenceChain.complete,
    humanReviewRequired:true,
    readOnly:true,
    advisoryOnly:true,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  });
}
