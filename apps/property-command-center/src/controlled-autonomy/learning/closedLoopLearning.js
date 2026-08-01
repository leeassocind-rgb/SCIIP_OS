const freeze=value=>Object.freeze(value);

export function deriveClosedLoopLearning({verifications=[]}={}) {
  const verified=verifications.filter(item=>item.status==='VERIFIED').length;
  const failed=verifications.filter(item=>item.status==='VERIFICATION_FAILED').length;
  const lessons=verifications.map(item=>freeze({
    runId:item.runId,
    outcome:item.status,
    rollbackRecommended:Boolean(item.rollbackRecommended),
    recommendation:item.status==='VERIFIED'?'RETAIN_CANARY_POLICY':'TIGHTEN_POLICY_AND_REVIEW'
  }));
  return freeze({
    lessons:freeze(lessons),
    total:lessons.length,
    verified,
    failed,
    policyChangesAutoApplied:false,
    humanReviewRequired:true,
    productionExecutionAuthorized:false
  });
}
