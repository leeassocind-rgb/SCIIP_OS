const freeze=value=>Object.freeze(value);

export function verifyCanaryOutcome({run,expected={},actual={}}={}) {
  if(!run?.runId)throw new Error('Canary run required');
  const checks=Object.keys(expected).map(key=>freeze({
    key,
    expected:expected[key],
    actual:actual[key],
    passed:JSON.stringify(expected[key])===JSON.stringify(actual[key])
  }));
  const failed=checks.filter(check=>!check.passed).length;
  return freeze({
    runId:run.runId,
    status:failed?'VERIFICATION_FAILED':'VERIFIED',
    checks:freeze(checks),
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    rollbackRecommended:failed>0,
    promotionEligible:failed===0,
    productionPromotionAuthorized:false
  });
}
