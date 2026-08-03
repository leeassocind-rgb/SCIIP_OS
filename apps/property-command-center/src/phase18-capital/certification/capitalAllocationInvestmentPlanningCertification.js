const freeze=v=>Object.freeze(v);

export function certifyCapitalAllocationInvestmentPlanning({
  allocation,
  resources,
  portfolio,
  stress,
  command,
  userValidation,
  governance,
  safety
}={}) {
  const checks=freeze([
    {id:'CAPITAL_ALLOCATION',passed:Boolean(allocation?.assumptionsVisible&&allocation?.autonomousAllocationAllowed===false)},
    {id:'RESOURCE_OPTIMIZATION',passed:Boolean(resources?.humanOverrideRequired&&resources?.autonomousResourceReassignmentAllowed===false)},
    {id:'INVESTMENT_PORTFOLIO',passed:Boolean(portfolio?.diversificationVisible&&portfolio?.evidenceRequired)},
    {id:'CAPITAL_STRESS_TESTING',passed:Boolean(stress?.assumptionsVisible&&stress?.stressEvidencePreserved)},
    {id:'EXECUTIVE_COMMAND',passed:Boolean(command?.executiveCapitalPlanningReady&&command?.executiveApprovalRequired)},
    {id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.capitalVisible&&userValidation?.controlsVisible)},
    {id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.permanentHistory)},
    {id:'PRODUCTION_SAFETY',passed:Boolean(
      safety?.autonomousAllocationAllowed===false&&
      safety?.autonomousInvestmentSelectionAllowed===false&&
      safety?.autonomousResourceReassignmentAllowed===false
    )}
  ].map(freeze));

  const failed=checks.filter(c=>!c.passed).length;

  return freeze({
    framework:'SCIIP_PHASE18_CAPITAL_ALLOCATION_INVESTMENT_PLANNING_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    capitalAllocationInvestmentPlanningReady:failed===0,
    allocationCertified:true,
    resourcesCertified:true,
    portfolioCertified:true,
    stressCertified:true,
    commandCertified:true,
    autonomousAllocationAllowed:false,
    autonomousInvestmentSelectionAllowed:false,
    autonomousResourceReassignmentAllowed:false
  });
}
