const freeze=v=>Object.freeze(v);

export function createEnterpriseIngestionCommand({
  orchestration={},
  integrity={},
  delta={},
  rehearsal={},
  approvals=[]
}={}) {
  const attention=[
    ...(orchestration.jobs||[]).filter(j=>j.status==='BLOCKED').map(j=>freeze({type:'INGESTION_JOB',id:j.jobId})),
    ...(integrity.relationships||[]).filter(r=>!r.passed).map(r=>freeze({type:'ORPHAN_RELATIONSHIP',id:r.relationshipId})),
    ...(rehearsal.batches||[]).filter(b=>!b.passed).map(b=>freeze({type:'REHEARSAL_FAILURE',id:b.batchId})),
    ...approvals.filter(a=>a.status==='PENDING').map(a=>freeze({type:'APPROVAL',id:a.approvalId}))
  ];

  return freeze({
    orchestration:freeze({...orchestration}),
    integrity:freeze({...integrity}),
    delta:freeze({...delta}),
    rehearsal:freeze({...rehearsal}),
    approvals:freeze([...approvals]),
    attention:freeze(attention),
    attentionCount:attention.length,
    enterpriseIngestionReady:true,
    brokerApprovalRequired:true,
    autonomousProductionCommitAllowed:false,
    destructiveWritesAllowed:false
  });
}
