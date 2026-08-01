const freeze=value=>Object.freeze(value);

export function runControlledTrafficRehearsal({
  authorization,
  stages=[],
  healthChecks=[],
  rollback
}={}) {
  if(!authorization?.rehearsalAuthorized)throw new Error('Launch rehearsal authorization required');
  if(!rollback?.ready)throw new Error('Rollback readiness required');

  const simulatedStages=stages.map((stage,index)=>{
    const stageChecks=healthChecks.filter(check=>check.stageId===stage.id);
    const passed=stageChecks.length>0&&stageChecks.every(check=>check.passed);
    return freeze({
      stageId:stage.id,
      sequence:index+1,
      trafficPct:Number(stage.trafficPct||0),
      healthChecks:stageChecks.length,
      healthPassed:passed,
      status:passed?'REHEARSAL_PASSED':'REHEARSAL_BLOCKED',
      productionTrafficApplied:false
    });
  });

  const failed=simulatedStages.filter(stage=>!stage.healthPassed).length;
  return freeze({
    rehearsalId:`TRAFFIC-REHEARSAL-${Date.now()}`,
    stages:freeze(simulatedStages),
    stagesRun:simulatedStages.length,
    stagesPassed:simulatedStages.length-failed,
    stagesFailed:failed,
    rollbackPlanId:rollback.rollbackPlanId,
    rollbackReady:true,
    status:failed?'BLOCKED':'PASSED',
    productionTrafficApplied:false,
    productionTrafficAuthorized:false
  });
}
