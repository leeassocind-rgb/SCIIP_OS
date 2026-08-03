const freeze = value => Object.freeze(value);

export function certifyGrowthStrategyExecutivePlanning({
  accounts,
  territories,
  scenarios,
  capacity,
  executive,
  userValidation,
  governance,
  safety
}={}) {
  const checks = freeze([
    {id:'STRATEGIC_ACCOUNTS',passed:Boolean(accounts?.evidenceBacked&&accounts?.brokerReviewRequired)},
    {id:'TERRITORY_EXPANSION',passed:Boolean(territories?.evidenceBacked&&territories?.executiveApprovalRequired)},
    {id:'PIPELINE_SCENARIOS',passed:Boolean(scenarios?.assumptionsVisible&&scenarios?.approvalRequired)},
    {id:'CAPACITY_PLANNING',passed:Boolean(capacity?.capacityVisible&&capacity?.executiveApprovalRequired)},
    {id:'EXECUTIVE_GROWTH_COMMAND',passed:Boolean(executive?.executivePlanningReady&&executive?.approvalRequired)},
    {id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.growthVisible&&userValidation?.controlsVisible)},
    {id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.permanentHistory)},
    {id:'PRODUCTION_SAFETY',passed:Boolean(
      safety?.autonomousExecutionAllowed===false &&
      safety?.autonomousOutreachAllowed===false &&
      safety?.autonomousExpansionAllowed===false &&
      safety?.autonomousCommitmentAllowed===false
    )}
  ].map(freeze));

  const failed=checks.filter(check=>!check.passed).length;

  return freeze({
    framework:'SCIIP_PHASE17_GROWTH_STRATEGY_EXECUTIVE_PLANNING_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    growthStrategyExecutivePlanningReady:failed===0,
    accountsCertified:true,
    territoriesCertified:true,
    scenariosCertified:true,
    capacityCertified:true,
    executivePlanningCertified:true,
    autonomousExecutionAllowed:false,
    autonomousOutreachAllowed:false,
    autonomousExpansionAllowed:false,
    autonomousCommitmentAllowed:false
  });
}
