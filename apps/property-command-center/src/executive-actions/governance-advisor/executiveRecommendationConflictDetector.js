import{freezeDeep,uniq}from'./_shared.js';

export function detectExecutiveRecommendationConflicts(recommendations=[]){
  const conflicts=[];
  for(let i=0;i<recommendations.length;i++){
    for(let j=i+1;j<recommendations.length;j++){
      const a=recommendations[i],b=recommendations[j];
      const sameSubject=a.subjectId===b.subjectId;
      const sameDomain=a.domain===b.domain;
      const opposing=(a.action==='REVALIDATE_POLICY'&&b.action==='REVIEW_EXCEPTION')||
        (a.action==='REVIEW_EXCEPTION'&&b.action==='REVALIDATE_POLICY');
      if(sameSubject&&(sameDomain||opposing)&&a.id!==b.id){
        conflicts.push(freezeDeep({
          id:`CONFLICT:${a.id}:${b.id}`,
          recommendationIds:[a.id,b.id],
          subjectId:a.subjectId,
          domain:sameDomain?a.domain:'CROSS_DOMAIN',
          reason:opposing?'POTENTIALLY_OPPOSING_GOVERNANCE_ACTIONS':'DUPLICATIVE_DOMAIN_ACTIONS',
          humanReviewRequired:true
        }));
      }
    }
  }
  return freezeDeep({
    conflicts,
    conflictCount:conflicts.length,
    recommendationIds:uniq(conflicts.flatMap(item=>item.recommendationIds))
  });
}
