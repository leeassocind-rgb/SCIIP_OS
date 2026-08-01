const freeze=v=>Object.freeze(v);
export function instantiateExecutivePlaybook({template,context={}}={}){
 if(!template?.playbookId||!Array.isArray(template.steps))throw new Error('Valid playbook required');
 const steps=template.steps.map((s,i)=>freeze({...s,stepId:`${template.playbookId}-STEP-${i+1}`,status:'PENDING',approvalRequired:s.approvalRequired!==false,executionAuthorized:false}));
 return freeze({instanceId:`${template.playbookId}-${context.subjectId||'GENERAL'}`,playbookId:template.playbookId,name:template.name,context:freeze({...context}),steps:freeze(steps),status:'READY_FOR_REVIEW',approvalRequired:steps.some(s=>s.approvalRequired),executionAuthorized:false,rollbackRequired:true});
}
