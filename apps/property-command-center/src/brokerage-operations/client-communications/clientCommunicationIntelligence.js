const freeze=v=>Object.freeze(v);

export function prepareClientCommunication({clientId,updates=[],evidence=[],channel='EMAIL'}={}) {
  if(!clientId) throw new Error('clientId is required');

  const evidenceIds=new Set(evidence.map(item=>item.evidenceId));
  const prepared=updates.map((update,index)=>{
    const refs=[...(update.evidenceIds||[])];
    const supported=refs.length>0&&refs.every(id=>evidenceIds.has(id));
    return freeze({
      communicationId:update.communicationId||`COMM-${String(index+1).padStart(4,'0')}`,
      subject:update.subject,
      supported,
      evidenceIds:freeze(refs),
      status:supported?'READY_FOR_BROKER_REVIEW':'INSUFFICIENT_EVIDENCE',
      brokerApprovalRequired:true,
      autoSend:false
    });
  });

  return freeze({
    clientId,
    channel,
    communications:freeze(prepared),
    total:prepared.length,
    ready:prepared.filter(item=>item.supported).length,
    evidenceRequired:true,
    brokerApprovalRequired:true,
    autonomousCommunicationAllowed:false
  });
}
