const freeze=v=>Object.freeze(v);

export function governLearningCandidates({candidates=[],approvals=[]}={}) {
  const approved=new Set(
    approvals.filter(a=>a.status==='APPROVED').map(a=>a.candidateId)
  );

  const rows=candidates.map(candidate=>{
    const evidenceSatisfied=Number(candidate.evidenceCount||0)>=Number(candidate.minimumEvidence||1);
    const approvalSatisfied=approved.has(candidate.candidateId);
    return freeze({
      ...candidate,
      evidenceSatisfied,
      approvalSatisfied,
      status:evidenceSatisfied&&approvalSatisfied?'APPROVED_FOR_CONTROLLED_UPDATE':'BLOCKED',
      autoApply:false
    });
  });

  return freeze({
    candidates:freeze(rows),
    total:rows.length,
    approved:rows.filter(r=>r.status==='APPROVED_FOR_CONTROLLED_UPDATE').length,
    blocked:rows.filter(r=>r.status==='BLOCKED').length,
    approvalRequired:true,
    rollbackRequired:true,
    autonomousLearningAllowed:false
  });
}
