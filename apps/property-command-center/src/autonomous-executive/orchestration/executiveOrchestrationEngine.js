const freeze=v=>Object.freeze(v);
export function createExecutiveOrchestrationEngine(){
 const runs=[];
 const orchestrate=({event,handlers={}}={})=>{
  if(!event?.type)throw new Error('Event required');
  const plan=(handlers[event.type]||[]).map((step,i)=>freeze({stepId:`STEP-${i+1}`,capability:step.capability,targetWorkspace:step.targetWorkspace,status:'PLANNED',approvalRequired:step.approvalRequired!==false,executionAuthorized:false}));
  const run=freeze({runId:`ORCH-${runs.length+1}`,eventId:event.eventId||null,eventType:event.type,status:plan.length?'PLAN_READY':'NO_HANDLER',steps:freeze(plan),approvalRequired:plan.some(s=>s.approvalRequired),executionAuthorized:false});
  runs.push(run);return run;
 };
 return freeze({orchestrate,runs:()=>freeze([...runs]),snapshot:()=>freeze({runs:runs.length,planningAutonomous:true,executionAuthorized:false,approvalAware:true})});
}
