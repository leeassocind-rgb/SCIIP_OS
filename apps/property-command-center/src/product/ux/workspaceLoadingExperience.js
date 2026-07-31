const freeze=value=>Object.freeze(value);

export function createWorkspaceLoadingExperience({
  workspace='Intelligence workspace',
  elapsedMs=0,
  attempt=1,
  online=true,
  reducedMotion=false
}={}){
  const elapsed=Math.max(0,Number(elapsedMs)||0);
  const phase=elapsed<800?'PREPARING':elapsed<2500?'LOADING':'TAKING_LONGER';
  const progress=phase==='PREPARING'?28:phase==='LOADING'?64:86;
  return freeze({
    workspace,
    phase,
    progress,
    attempt:Math.max(1,Number(attempt)||1),
    online:Boolean(online),
    reducedMotion:Boolean(reducedMotion),
    message:!online
      ?'Connection unavailable. SCIIP will resume when connectivity returns.'
      :phase==='TAKING_LONGER'
        ?'This workspace is taking longer than expected. Your context is preserved.'
        :`Loading ${workspace.toLowerCase()}…`,
    retryAvailable:online&&phase==='TAKING_LONGER',
    contextPreserved:true,
    accessibleStatus:true,
    lazyLoading:true,
    codeSplitting:true
  });
}
