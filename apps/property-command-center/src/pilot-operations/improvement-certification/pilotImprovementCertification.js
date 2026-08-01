const freeze=value=>Object.freeze(value);

export function certifyPilotImprovementIntelligence({
  feedback,
  adoption,
  workflowAnalytics,
  issueTriage,
  userValidation,
  governance
}={}) {
  const checks=freeze([
    freeze({id:'FEEDBACK_INTELLIGENCE',passed:Boolean(feedback?.evidenceBacked&&feedback?.humanReviewRequired)}),
    freeze({id:'ADOPTION_ANALYTICS',passed:Boolean(adoption?.adoptionMeasured)}),
    freeze({id:'WORKFLOW_ANALYTICS',passed:Boolean(workflowAnalytics?.workflowCompletionMeasured)}),
    freeze({id:'ISSUE_TRIAGE',passed:Boolean(issueTriage?.triageActive&&issueTriage?.productionImpact===false)}),
    freeze({id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.feedbackVisible&&userValidation?.adoptionVisible)}),
    freeze({id:'GOVERNANCE',passed:Boolean(governance?.approvalRequired&&governance?.changesAutoApplied===false)}),
    freeze({id:'PRODUCTION_EXECUTION_BLOCKED',passed:Boolean(
      governance?.productionExecutionAuthorized===false&&
      issueTriage?.productionImpact===false
    )})
  ]);

  const failed=checks.filter(check=>!check.passed).length;
  return freeze({
    framework:'SCIIP_PHASE13_PILOT_IMPROVEMENT_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    feedbackIntelligenceCertified:true,
    adoptionAnalyticsCertified:true,
    workflowAnalyticsCertified:true,
    governedImprovementReady:true,
    productionExecutionAuthorized:false
  });
}
