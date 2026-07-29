const TERMINAL = new Set(['COMPLETED','CANCELLED']);
const TRANSITIONS = Object.freeze({
  DRAFT:['PENDING_APPROVAL','CANCELLED'],
  PENDING_APPROVAL:['APPROVED','REJECTED','CANCELLED'],
  APPROVED:['IN_PROGRESS','CANCELLED'],
  REJECTED:['DRAFT','CANCELLED'],
  IN_PROGRESS:['BLOCKED','COMPLETED','CANCELLED'],
  BLOCKED:['IN_PROGRESS','CANCELLED'],
  COMPLETED:[],CANCELLED:[]
});
const canonical=value=>String(value??'').trim();
const hash=value=>{let h=2166136261;for(const ch of value){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36).toUpperCase()};
export function deterministicWorkflowId({assignmentId,opportunityId,workflowType='BROKER_FOLLOW_UP'}){
  return `WF-${hash([canonical(assignmentId),canonical(opportunityId),canonical(workflowType)].join('|'))}`;
}
export function createWorkflow(input={}){
  const assignmentId=canonical(input.assignmentId);const opportunityId=canonical(input.opportunityId);
  if(!assignmentId)throw new Error('assignmentId is required');if(!opportunityId)throw new Error('opportunityId is required');
  const workflowType=canonical(input.workflowType)||'BROKER_FOLLOW_UP';
  const createdAt=input.createdAt||new Date().toISOString();
  return Object.freeze({
    id:deterministicWorkflowId({assignmentId,opportunityId,workflowType}),assignmentId,opportunityId,workflowType,
    title:canonical(input.title)||'Broker opportunity follow-up',status:'DRAFT',priority:canonical(input.priority)||'MEDIUM',
    owner:canonical(input.owner)||'UNASSIGNED',requiresApproval:true,autonomousExecution:false,createdAt,updatedAt:createdAt,
    evidenceRefs:Object.freeze([...(input.evidenceRefs||[])].map(canonical).filter(Boolean)),
    tasks:Object.freeze((input.tasks||defaultTasks()).map((task,index)=>normalizeTask(task,index)))
  });
}
function defaultTasks(){return[
  {title:'Review opportunity evidence',kind:'REVIEW'},
  {title:'Confirm broker strategy',kind:'DECISION'},
  {title:'Prepare outreach draft',kind:'DRAFT'},
  {title:'Approve external outreach',kind:'APPROVAL'}
]}
function normalizeTask(task,index){return Object.freeze({id:canonical(task.id)||`TASK-${String(index+1).padStart(2,'0')}`,title:canonical(task.title)||`Task ${index+1}`,kind:canonical(task.kind)||'ACTION',status:'NOT_STARTED',assignee:canonical(task.assignee)||'UNASSIGNED',dueDate:task.dueDate||null,requiresApproval:task.kind==='APPROVAL'||Boolean(task.requiresApproval)})}
export function allowedTransitions(status){return [...(TRANSITIONS[status]||[])]}
export function transitionWorkflow(workflow,nextStatus,context={}){
  const next=canonical(nextStatus).toUpperCase();if(!(TRANSITIONS[workflow.status]||[]).includes(next))throw new Error(`Invalid workflow transition: ${workflow.status} -> ${next}`);
  if(next==='APPROVED'&&!context.approvedBy)throw new Error('approvedBy is required');
  if(next==='COMPLETED'&&workflow.tasks.some(task=>task.status!=='COMPLETED'))throw new Error('All tasks must be completed');
  const now=context.at||new Date().toISOString();return Object.freeze({...workflow,status:next,updatedAt:now,approval:next==='APPROVED'?Object.freeze({approvedBy:canonical(context.approvedBy),approvedAt:now}):workflow.approval||null});
}
export function updateTask(workflow,taskId,patch={},context={}){
  if(TERMINAL.has(workflow.status))throw new Error('Terminal workflow cannot be modified');
  const tasks=workflow.tasks.map(task=>task.id!==taskId?task:Object.freeze({...task,...patch,id:task.id,status:canonical(patch.status||task.status).toUpperCase()}));
  if(!tasks.some(task=>task.id===taskId))throw new Error(`Unknown task: ${taskId}`);
  return Object.freeze({...workflow,tasks:Object.freeze(tasks),updatedAt:context.at||new Date().toISOString()});
}
export function workflowProgress(workflow){const total=workflow.tasks.length;const completed=workflow.tasks.filter(task=>task.status==='COMPLETED').length;return{total,completed,percent:total?Math.round(completed/total*100):0}}
