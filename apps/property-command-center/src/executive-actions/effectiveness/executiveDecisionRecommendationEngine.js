export function generateExecutiveDecisionRecommendations({kpis={},trend={},benchmark=null}={}) {
  const recommendations=[];
  if(Number(kpis.evidenceCompletenessPct||0)<100)recommendations.push('INCREASE_EVIDENCE_COLLECTION');
  if(Number(kpis.failureRatePct||0)>=25)recommendations.push('REVIEW_RECURRING_FAILURES');
  if(Number(kpis.reviewRatePct||0)>=25)recommendations.push('PRIORITIZE_HUMAN_REVIEW');
  if(trend.direction==='DECLINING')recommendations.push('INVESTIGATE_DECLINING_TREND');
  if(benchmark?.rank===1&&Number(kpis.successRatePct||0)>=75)recommendations.push('PREFERRED_DECISION_PATTERN');
  if(!recommendations.length)recommendations.push('CONTINUE_GOVERNED_MONITORING');
  return Object.freeze(recommendations.map((code,index)=>Object.freeze({id:`REC-${index+1}`,code,advisoryOnly:true,humanApprovalRequired:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false})));
}
