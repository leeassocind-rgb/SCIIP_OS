const freeze=v=>Object.freeze(v);

export function mapOutcomesToImprovements({outcomes=[],feedback=[],improvements=[]}={}) {
  const outcomeIds=new Set(outcomes.map(o=>o.executionId));
  const feedbackIds=new Set(feedback.map(f=>f.feedbackId));

  const rows=improvements.map(item=>{
    const outcomeEvidence=(item.executionIds||[]).filter(id=>outcomeIds.has(id));
    const feedbackEvidence=(item.feedbackIds||[]).filter(id=>feedbackIds.has(id));
    const evidenceCount=outcomeEvidence.length+feedbackEvidence.length;
    return freeze({
      ...item,
      outcomeEvidence:freeze(outcomeEvidence),
      feedbackEvidence:freeze(feedbackEvidence),
      evidenceCount,
      status:evidenceCount?'EVIDENCE_READY':'INSUFFICIENT_EVIDENCE',
      approvalRequired:true
    });
  });

  return freeze({
    improvements:freeze(rows),
    total:rows.length,
    evidenceReady:rows.filter(r=>r.status==='EVIDENCE_READY').length,
    evidenceRequired:true,
    humanReviewRequired:true,
    autonomousProcessChangesAllowed:false
  });
}
