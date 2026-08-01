const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createControlledDeploymentRuntime({
  allowedEnvironments=['PILOT','STAGING'],
  maximumConcurrentDeployments=1
}={}) {
  const deployments=[];

  const deploy=({
    releaseCandidate,
    approval,
    environment='PILOT',
    rollbackPlan
  }={})=>{
    if(releaseCandidate?.status!=='RELEASE_CANDIDATE')throw new Error('Certified release candidate required');
    if(approval?.status!=='APPROVED')throw new Error('Deployment approval required');
    if(!rollbackPlan?.ready)throw new Error('Rollback plan required');
    if(!allowedEnvironments.includes(environment)){
      return freeze({status:'ENVIRONMENT_BLOCKED',environment,productionDeploymentAuthorized:false});
    }
    if(deployments.filter(item=>item.status==='ACTIVE').length>=maximumConcurrentDeployments){
      throw new Error('Deployment concurrency limit reached');
    }

    const deployment=freeze({
      deploymentId:`DEPLOY-${deployments.length+1}`,
      releaseCandidateId:releaseCandidate.releaseCandidateId,
      environment,
      status:'ACTIVE',
      approvedBy:approval.reviewer,
      rollbackPlanId:rollbackPlan.rollbackPlanId,
      startedAt:new Date().toISOString(),
      productionDeploymentAuthorized:false
    });
    deployments.push(deployment);
    return freeze({
      status:'DEPLOYED',
      deployment,
      productionDeploymentAuthorized:false
    });
  };

  const stop=({deploymentId,reason,approvedBy}={})=>{
    if(!approvedBy)throw new Error('Stop approval required');
    const index=deployments.findIndex(item=>item.deploymentId===deploymentId);
    if(index<0)throw new Error('Deployment not found');
    const stopped=freeze({
      ...clone(deployments[index]),
      status:'STOPPED',
      reason,
      approvedBy,
      stoppedAt:new Date().toISOString()
    });
    deployments[index]=stopped;
    return stopped;
  };

  return freeze({
    deploy,
    stop,
    list:()=>freeze([...deployments]),
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      deployments:deployments.length,
      activeDeployments:deployments.filter(item=>item.status==='ACTIVE').length,
      controlled:true,
      productionDeploymentAuthorized:false
    })
  });
}
