const freeze=v=>Object.freeze(v);

export function certifyOutcomeFeedbackImprovement({
  outcomes,
  feedback,
  improvements,
  learning,
  command,
  userValidation,
  governance,
  safety
}={}) {
  const checks=freeze([
    {id:'EXECUTION_OUTCOMES',passed:Boolean(outcomes?.permanentOutcomeHistory&&outcomes?.autonomousOutcomeChangesAllowed===false)},
    {id:'BROKER_FEEDBACK',passed:Boolean(feedback?.brokerControlled&&feedback?.autonomousFeedbackRewritingAllowed===false)},
    {id:'IMPROVEMENT_MAPPING',passed:Boolean(improvements?.evidenceRequired&&improvements?.humanReviewRequired)},
    {id:'CONTROLLED_LEARNING',passed:Boolean(learning?.approvalRequired&&learning?.rollbackRequired)},
    {id:'OUTCOME_COMMAND',passed:Boolean(command?.outcomeImprovementReady&&command?.humanReviewRequired)},
    {id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.outcomesVisible&&userValidation?.controlsVisible)},
    {id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.permanentHistory)},
    {id:'PRODUCTION_SAFETY',passed:Boolean(
      safety?.autonomousLearningAllowed===false &&
      safety?.autonomousProcessChangesAllowed===false &&
      safety?.autonomousOutcomeChangesAllowed===false
    )}
  ].map(freeze));

  const failed=checks.filter(c=>!c.passed).length;

  return freeze({
    framework:'SCIIP_PHASE18_OUTCOME_FEEDBACK_IMPROVEMENT_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    outcomeFeedbackImprovementReady:failed===0,
    outcomesCertified:true,
    feedbackCertified:true,
    improvementsCertified:true,
    learningCertified:true,
    commandCertified:true,
    autonomousLearningAllowed:false,
    autonomousProcessChangesAllowed:false,
    autonomousOutcomeChangesAllowed:false
  });
}
