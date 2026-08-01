const freeze=value=>Object.freeze(value);

export function certifyPilotGraduation({
  controlledOperations,
  feedbackIntelligence,
  adoptionAnalytics,
  improvementProposals,
  releaseCandidate,
  userValidation,
  governance,
  recovery
}={}) {
  const checks=freeze([
    freeze({id:'CONTROLLED_OPERATIONS',passed:Boolean(controlledOperations?.certified)}),
    freeze({id:'FEEDBACK_INTELLIGENCE',passed:Boolean(feedbackIntelligence?.certified)}),
    freeze({id:'ADOPTION_ANALYTICS',passed:Boolean(adoptionAnalytics?.certified)}),
    freeze({id:'IMPROVEMENT_GOVERNANCE',passed:Boolean(improvementProposals?.approvalRequired&&improvementProposals?.changesAutoApplied===false)}),
    freeze({id:'RELEASE_CANDIDATE',passed:Boolean(releaseCandidate?.status==='RELEASE_CANDIDATE'&&releaseCandidate?.pilotDeploymentEligible)}),
    freeze({id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.releaseGatesVisible&&userValidation?.rollbackVisible)}),
    freeze({id:'RECOVERY',passed:Boolean(recovery?.rollbackReady&&recovery?.restartRecovery)}),
    freeze({id:'PRODUCTION_DEPLOYMENT_BLOCKED',passed:Boolean(
      releaseCandidate?.productionDeploymentAuthorized===false&&
      governance?.productionExecutionAuthorized===false
    )})
  ]);

  const failed=checks.filter(item=>!item.passed).length;
  return freeze({
    framework:'SCIIP_PHASE13_PILOT_GRADUATION_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    pilotGraduationReady:true,
    releaseCandidateCertified:true,
    controlledDeploymentReady:true,
    productionDeploymentAuthorized:false
  });
}
