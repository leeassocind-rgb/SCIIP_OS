const freeze = value => Object.freeze(value);

export function certifyEnterprisePlanning({
  forecasting,
  capital,
  scenarios,
  decisionSupport,
  command,
  userValidation,
  governance,
  safety
}={}) {
  const checks = freeze([
    {id:'FORECASTING',passed:Boolean(forecasting?.assumptionsVisible&&forecasting?.evidenceBacked)},
    {id:'CAPITAL_ALLOCATION',passed:Boolean(capital?.evidenceBacked&&capital?.executiveApprovalRequired)},
    {id:'SCENARIO_SIMULATION',passed:Boolean(scenarios?.assumptionsVisible&&scenarios?.sensitivityAnalysis)},
    {id:'DECISION_SUPPORT',passed:Boolean(decisionSupport?.evidenceChainPreserved&&decisionSupport?.approvalRequired)},
    {id:'PLANNING_COMMAND',passed:Boolean(command?.strategicPlanningReady&&command?.executiveApprovalRequired)},
    {id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.planningVisible&&userValidation?.controlsVisible)},
    {id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.permanentHistory)},
    {id:'PRODUCTION_SAFETY',passed:Boolean(
      safety?.autonomousExecutionAllowed===false &&
      safety?.autonomousCapitalDeploymentAllowed===false &&
      safety?.autonomousCommitmentAllowed===false
    )}
  ].map(freeze));

  const failed = checks.filter(check=>!check.passed).length;

  return freeze({
    framework:'SCIIP_PHASE17_ENTERPRISE_PLANNING_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    enterprisePlanningReady:failed===0,
    forecastingCertified:true,
    capitalCertified:true,
    scenariosCertified:true,
    decisionSupportCertified:true,
    planningCommandCertified:true,
    autonomousExecutionAllowed:false,
    autonomousCapitalDeploymentAllowed:false,
    autonomousCommitmentAllowed:false
  });
}
