import{freezeDeep,round}from'./_shared.js';

const severityWeight={CRITICAL:45,HIGH:30,MEDIUM:18,LOW:8};
const actionWeight={
  RETEST_CONTROL:25,
  REVALIDATE_POLICY:20,
  REVERIFY_EVIDENCE:18,
  REASSESS_READINESS:16,
  REVIEW_EXCEPTION:12,
  REVIEW_GOVERNANCE_DRIFT:10
};

export function prioritizeExecutiveGovernanceRecommendations(recommendations=[]){
  return recommendations.map(item=>{
    const evidenceBonus=Math.min(20,(item.evidenceIds||[]).length*3);
    const confidence=Math.min(100,round(
      (severityWeight[item.severity]||5)+(actionWeight[item.action]||5)+evidenceBonus
    ));
    return freezeDeep({...item,priorityScore:confidence,confidence});
  }).sort((a,b)=>b.priorityScore-a.priorityScore||a.id.localeCompare(b.id));
}
