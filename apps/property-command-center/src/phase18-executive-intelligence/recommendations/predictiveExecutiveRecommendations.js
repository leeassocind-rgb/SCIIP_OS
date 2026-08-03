const freeze=v=>Object.freeze(v);

export function generatePredictiveExecutiveRecommendations({signals=[],threshold=.75}={}) {
  const rows=signals.map(signal=>{
    const confidence=Number(signal.confidence||0);
    const score=Number((Number(signal.impactScore||0)*.45+Number(signal.urgencyScore||0)*.30+confidence*25-Number(signal.riskScore||0)*.20).toFixed(2));
    return freeze({
      recommendationId:`REC-${signal.signalId}`,
      signalId:signal.signalId,
      title:signal.title,
      confidence,
      score,
      status:confidence>=threshold?'READY_FOR_EXECUTIVE_REVIEW':'LOW_CONFIDENCE',
      evidenceIds:freeze([...(signal.evidenceIds||[])]),
      approvalRequired:true,
      autoExecute:false
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    recommendations:freeze(rows),
    total:rows.length,
    reviewReady:rows.filter(r=>r.status==='READY_FOR_EXECUTIVE_REVIEW').length,
    topRecommendation:rows.find(r=>r.status==='READY_FOR_EXECUTIVE_REVIEW')||null,
    evidenceRequired:true,
    executiveApprovalRequired:true,
    autonomousExecutionAllowed:false
  });
}
