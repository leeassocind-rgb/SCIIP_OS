const freeze=v=>Object.freeze(v);
export function planGovernedRecovery({incident,recoveryActions=[],approval}={}){
 if(!incident?.incidentId)throw new Error('incident required');
 const approved=approval?.status==='APPROVED';
 const actions=recoveryActions.map((action,index)=>freeze({
  ...action,sequence:index+1,status:approved?'READY':'BLOCKED',approvalRequired:true,autoExecute:false
 }));
 return freeze({
  incidentId:incident.incidentId,
  approvalStatus:approval?.status||'PENDING',
  actions:freeze(actions),
  rollbackReady:Boolean(actions.some(a=>a.type==='ROLLBACK')),
  replayReady:Boolean(actions.some(a=>a.type==='REPLAY')),
  status:approved?'READY_FOR_MANUAL_EXECUTION':'BLOCKED',
  autonomousExecutionAllowed:false
 });
}
