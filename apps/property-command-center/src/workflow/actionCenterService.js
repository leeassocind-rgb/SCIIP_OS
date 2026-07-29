import{createWorkflow,transitionWorkflow,updateTask,workflowProgress}from'./workflowEngine.js';
import{appendActionEvent,workflowHistory}from'./actionLedger.js';
const KEY='sciip.workflow.records.v1';const memory=[];
function storage(){try{return globalThis.localStorage||null}catch{return null}}
export function readWorkflows(){const store=storage();if(!store)return[...memory];try{return JSON.parse(store.getItem(KEY)||'[]')}catch{return[]}}
function persist(items){const store=storage();if(store)store.setItem(KEY,JSON.stringify(items));else{memory.splice(0,memory.length,...items)}}
export function upsertWorkflow(workflow){const all=readWorkflows();const index=all.findIndex(item=>item.id===workflow.id);if(index>=0){all[index]=workflow}else all.push(workflow);persist(all);return workflow}
export function orchestrateOpportunity(input){
  const candidate=createWorkflow(input);const existing=readWorkflows().find(item=>item.id===candidate.id);if(existing)return{workflow:existing,created:false,duplicateSafe:true};
  upsertWorkflow(candidate);appendActionEvent({workflowId:candidate.id,assignmentId:candidate.assignmentId,type:'WORKFLOW_CREATED',payload:{opportunityId:candidate.opportunityId,workflowType:candidate.workflowType}});return{workflow:candidate,created:true,duplicateSafe:true};
}
export function performTransition(workflowId,nextStatus,context={}){const current=readWorkflows().find(item=>item.id===workflowId);if(!current)throw new Error('Workflow not found');const next=transitionWorkflow(current,nextStatus,context);upsertWorkflow(next);appendActionEvent({workflowId:next.id,assignmentId:next.assignmentId,type:'STATUS_CHANGED',actor:context.approvedBy||context.actor||'BROKER',payload:{from:current.status,to:next.status},occurredAt:context.at});return next}
export function performTaskUpdate(workflowId,taskId,patch,context={}){const current=readWorkflows().find(item=>item.id===workflowId);if(!current)throw new Error('Workflow not found');const next=updateTask(current,taskId,patch,context);upsertWorkflow(next);appendActionEvent({workflowId:next.id,assignmentId:next.assignmentId,type:'TASK_UPDATED',actor:context.actor||'BROKER',payload:{taskId,status:patch.status},occurredAt:context.at});return next}
export function actionCenterSnapshot(assignmentId){const workflows=readWorkflows().filter(item=>item.assignmentId===assignmentId);return{workflows,counts:{total:workflows.length,pendingApproval:workflows.filter(item=>item.status==='PENDING_APPROVAL').length,inProgress:workflows.filter(item=>item.status==='IN_PROGRESS'||item.status==='APPROVED').length,completed:workflows.filter(item=>item.status==='COMPLETED').length},progress:workflows.map(item=>({workflowId:item.id,...workflowProgress(item)})),history:workflows.flatMap(item=>workflowHistory(item.id))}}
export function clearWorkflowStoreForTests(){const store=storage();if(store)store.removeItem(KEY);memory.splice(0,memory.length)}
