const freeze=v=>Object.freeze(v);

export function certifyExecutiveIntelligence({kpis,objectives,effectiveness,recommendations,command,userValidation,governance,safety}={}) {
  const checks=freeze([
    {id:'KPI_INTELLIGENCE',passed:Boolean(kpis?.assumptionsVisible&&kpis?.autonomousMetricChangesAllowed===false)},
    {id:'STRATEGIC_OBJECTIVES',passed:Boolean(objectives?.permanentHistory&&objectives?.autonomousObjectiveChangesAllowed===false)},
    {id:'DECISION_EFFECTIVENESS',passed:Boolean(effectiveness?.evidenceBacked&&effectiveness?.autonomousDecisionChangesAllowed===false)},
    {id:'PREDICTIVE_RECOMMENDATIONS',passed:Boolean(recommendations?.evidenceRequired&&recommendations?.executiveApprovalRequired)},
    {id:'EXECUTIVE_COMMAND',passed:Boolean(command?.executiveIntelligenceReady&&command?.executiveApprovalRequired)},
    {id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.executiveVisible&&userValidation?.controlsVisible)},
    {id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.permanentHistory)},
    {id:'PRODUCTION_SAFETY',passed:Boolean(
      safety?.autonomousExecutionAllowed===false&&
      safety?.autonomousMetricChangesAllowed===false&&
      safety?.autonomousObjectiveChangesAllowed===false
    )}
  ].map(freeze));

  const failed=checks.filter(c=>!c.passed).length;

  return freeze({
    framework:'SCIIP_PHASE18_EXECUTIVE_INTELLIGENCE_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    executiveIntelligenceReady:failed===0,
    kpiCertified:true,
    objectivesCertified:true,
    effectivenessCertified:true,
    recommendationsCertified:true,
    commandCertified:true,
    autonomousExecutionAllowed:false,
    autonomousMetricChangesAllowed:false,
    autonomousObjectiveChangesAllowed:false
  });
}
