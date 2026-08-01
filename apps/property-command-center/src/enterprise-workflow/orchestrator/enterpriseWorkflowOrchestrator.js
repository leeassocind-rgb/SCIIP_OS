const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createEnterpriseWorkflowOrchestrator() {
  const workflows=new Map();

  const createWorkflow=({workflowId,name,steps=[],context={}}={})=>{
    if(!workflowId||!steps.length)throw new Error('workflowId and steps are required');
    const normalized=steps.map((step,index)=>freeze({
      stepId:step.stepId||`${workflowId}-STEP-${index+1}`,
      capability:step.capability,
      workspace:step.workspace,
      dependsOn:freeze([...(step.dependsOn||[])]),
      status:'PENDING',
      approvalRequired:step.approvalRequired!==false,
      executionAuthorized:false
    }));

    const workflow=freeze({
      workflowId,
      name:name||workflowId,
      context:freeze(clone(context)),
      steps:freeze(normalized),
      status:'PLANNED',
      distributed:true,
      approvalRequired:normalized.some(step=>step.approvalRequired),
      executionAuthorized:false,
      createdAt:new Date().toISOString()
    });

    workflows.set(workflowId,workflow);
    return workflow;
  };

  const readySteps=workflowId=>{
    const workflow=workflows.get(workflowId);
    if(!workflow)throw new Error('Unknown workflow');
    const completed=new Set(workflow.steps.filter(step=>step.status==='COMPLETED').map(step=>step.stepId));
    return freeze(workflow.steps.filter(step=>
      step.status==='PENDING' &&
      step.dependsOn.every(dependency=>completed.has(dependency))
    ));
  };

  const updateStep=({workflowId,stepId,status,evidence=[]}={})=>{
    const workflow=workflows.get(workflowId);
    if(!workflow)throw new Error('Unknown workflow');
    const steps=workflow.steps.map(step=>step.stepId===stepId?freeze({
      ...step,
      status,
      evidence:freeze(clone(evidence)),
      executionAuthorized:false
    }):step);

    const nextStatus=steps.every(step=>step.status==='COMPLETED')
      ? 'COMPLETED'
      : steps.some(step=>step.status==='FAILED')
        ? 'ATTENTION_REQUIRED'
        : 'IN_PROGRESS';

    const next=freeze({...workflow,steps:freeze(steps),status:nextStatus,updatedAt:new Date().toISOString()});
    workflows.set(workflowId,next);
    return next;
  };

  return freeze({
    createWorkflow,
    readySteps,
    updateStep,
    read:workflowId=>workflows.get(workflowId)||null,
    list:()=>freeze([...workflows.values()]),
    snapshot:()=>freeze({
      workflows:workflows.size,
      distributed:true,
      dependencyAware:true,
      sharedState:true,
      executionAuthorized:false
    })
  });
}
