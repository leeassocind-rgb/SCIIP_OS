const freeze=value=>Object.freeze(value);
export function createIntelligenceReviewViewModel({recommendations=[],opportunities=[],minimumConfidence=0.65}={}){
 const items=[...recommendations.map(item=>freeze({
  id:item.recommendationId,kind:'RECOMMENDATION',subjectId:item.subjectId,
  score:Number(item.confidence||0)*100,status:item.status,action:item.action,
  evidenceCount:(item.evidence||[]).length,approvalRequired:item.approvalRequired!==false
 })),...opportunities.map(item=>freeze({
  id:item.opportunityId,kind:'OPPORTUNITY',subjectId:item.propertyId,
  score:Number(item.score||0),status:item.status,action:item.recommendedAction,
  evidenceCount:(item.signals||[]).length,approvalRequired:item.approvalRequired!==false
 }))].sort((a,b)=>b.score-a.score);
 return freeze({
  items:freeze(items),total:items.length,
  reviewReady:items.filter(item=>item.score>=minimumConfidence*100).length,
  evidenceComplete:items.filter(item=>item.evidenceCount>0).length,
  approvalRequired:true,autonomousExecutionAllowed:false
 });
}
