const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createGovernedCanaryExecutionRuntime({
  allowedCapabilities=['NOTIFY','CREATE_DRAFT','UPDATE_SANDBOX'],
  maximumConcurrentRuns=3
}={}) {
  const runs=[];
  const execute=({playbook,approval,environment='CANARY'}={})=>{
    if(!playbook?.instanceId)throw new Error('Playbook instance required');
    if(approval?.status!=='APPROVED_FOR_CANARY')throw new Error('Canary approval required');
    if(environment!=='CANARY')return freeze({status:'PRODUCTION_BLOCKED',executionAuthorized:false});
    if(runs.filter(run=>run.status==='RUNNING').length>=maximumConcurrentRuns)throw new Error('Canary concurrency limit reached');

    const blocked=(playbook.steps||[]).filter(step=>!allowedCapabilities.includes(step.capability));
    if(blocked.length)return freeze({
      status:'CAPABILITY_BLOCKED',
      blockedCapabilities:freeze(blocked.map(step=>step.capability)),
      executionAuthorized:false
    });

    const run=freeze({
      runId:`CANARY-RUN-${runs.length+1}`,
      playbookInstanceId:playbook.instanceId,
      environment:'CANARY',
      status:'RUNNING',
      steps:freeze((playbook.steps||[]).map((step,index)=>freeze({
        ...clone(step),
        executionId:`CANARY-STEP-${runs.length+1}-${index+1}`,
        status:'READY'
      }))),
      approvedBy:approval.reviewer,
      productionExecutionAuthorized:false,
      startedAt:new Date().toISOString()
    });
    runs.push(run);
    return freeze({status:'CANARY_STARTED',run,executionAuthorized:true,productionExecutionAuthorized:false});
  };

  return freeze({
    execute,
    list:()=>freeze([...runs]),
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      runs:runs.length,
      maximumConcurrentRuns,
      canaryExecutionEnabled:true,
      productionExecutionAuthorized:false
    })
  });
}
