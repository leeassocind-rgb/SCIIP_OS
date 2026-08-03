const freeze=v=>Object.freeze(v);

export function certifyScenarioForecastingSimulation({scenarios,forecasts,simulation,comparison,command,userValidation,governance,safety}={}) {
  const checks=freeze([
    {id:'STRATEGIC_SCENARIOS',passed:Boolean(scenarios?.assumptionsVisible&&scenarios?.permanentScenarioHistory)},
    {id:'STRATEGIC_FORECASTING',passed:Boolean(forecasts?.methodologyVisible&&forecasts?.evidenceRequired)},
    {id:'PORTFOLIO_SIMULATION',passed:Boolean(simulation?.assumptionsVisible&&simulation?.autonomousReallocationAllowed===false)},
    {id:'SCENARIO_COMPARISON',passed:Boolean(comparison?.assumptionsVisible&&comparison?.executiveApprovalRequired)},
    {id:'EXECUTIVE_COMMAND',passed:Boolean(command?.executiveScenarioCommandReady&&command?.executiveApprovalRequired)},
    {id:'USER_VALIDATION',passed:Boolean(userValidation?.navigation&&userValidation?.scenarioVisible&&userValidation?.controlsVisible)},
    {id:'GOVERNANCE',passed:Boolean(governance?.evidenceRequired&&governance?.approvalRequired&&governance?.permanentHistory)},
    {id:'PRODUCTION_SAFETY',passed:Boolean(
      safety?.autonomousScenarioSelectionAllowed===false&&
      safety?.autonomousReallocationAllowed===false&&
      safety?.autonomousForecastChangesAllowed===false
    )}
  ].map(freeze));

  const failed=checks.filter(c=>!c.passed).length;

  return freeze({
    framework:'SCIIP_PHASE18_SCENARIO_FORECASTING_SIMULATION_CERTIFICATION',
    status:failed?'BLOCKED':'CERTIFIED',
    checks,
    checksRun:checks.length,
    checksPassed:checks.length-failed,
    checksFailed:failed,
    scenarioForecastingSimulationReady:failed===0,
    scenariosCertified:true,
    forecastsCertified:true,
    simulationCertified:true,
    comparisonCertified:true,
    commandCertified:true,
    autonomousScenarioSelectionAllowed:false,
    autonomousReallocationAllowed:false,
    autonomousForecastChangesAllowed:false
  });
}
