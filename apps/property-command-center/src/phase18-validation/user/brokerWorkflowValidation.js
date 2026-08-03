const F=v=>Object.freeze(v);
export function validateBrokerWorkflows({workflows=[]}={}){
 const r=workflows.map(x=>{const pct=Number(x.totalSteps||0)?Number((Number(x.completedSteps||0)/Number(x.totalSteps)*100).toFixed(2)):0,b=(x.blockers||[]).length,p=pct===100&&b===0&&x.brokerApproved===true;return F({...x,completionPct:pct,blockerCount:b,passed:p,status:p?'USER_VALIDATED':'USER_REVIEW_REQUIRED'})});
 return F({workflows:F(r),total:r.length,validated:r.filter(x=>x.passed).length,reviewRequired:r.filter(x=>!x.passed).length,brokerControlled:true,usabilityEvidenceRequired:true,autonomousApprovalAllowed:false});
}
