const freeze=value=>Object.freeze(value);

export function createExecutivePlaybookApprovalQueue({items=[]}={}) {
  let queue=items.map((item,index)=>freeze({
    queueId:item.queueId||`PBQ-${index+1}`,
    playbookInstanceId:item.instanceId,
    subjectId:item.context?.subjectId||null,
    name:item.name,
    status:item.status||'PENDING_REVIEW',
    approvalRequired:true,
    executionAuthorized:false,
    submittedAt:item.submittedAt||new Date().toISOString()
  }));

  const decide=({queueId,decision,reviewer}={})=>{
    if(!reviewer)throw new Error('Reviewer required');
    queue=queue.map(item=>item.queueId===queueId?freeze({
      ...item,
      status:decision==='APPROVE'?'APPROVED_FOR_CANARY':decision==='REJECT'?'REJECTED':'DEFERRED',
      reviewer,
      decidedAt:new Date().toISOString(),
      executionAuthorized:false
    }):item);
    return freeze([...queue]);
  };

  return freeze({
    list:()=>freeze([...queue]),
    decide,
    snapshot:()=>freeze({
      total:queue.length,
      pending:queue.filter(item=>item.status==='PENDING_REVIEW').length,
      approved:queue.filter(item=>item.status==='APPROVED_FOR_CANARY').length,
      executionAuthorized:false
    })
  });
}
