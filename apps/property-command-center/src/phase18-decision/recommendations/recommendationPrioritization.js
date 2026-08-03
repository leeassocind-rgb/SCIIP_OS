const freeze=v=>Object.freeze(v);

export function prioritizeRecommendations({recommendations=[]}={}) {
  const rows=recommendations.map(item=>{
    const value=Number(item.valueScore||0);
    const urgency=Number(item.urgencyScore||0);
    const confidence=Number(item.confidence||0);
    const risk=Number(item.riskScore||0);
    const score=Number((value*.35+urgency*.25+confidence*20-risk*.20).toFixed(2));
    return freeze({
      ...item,
      score,
      status:confidence>=.75?'READY_FOR_REVIEW':'LOW_CONFIDENCE',
      approvalRequired:true,
      autoExecute:false
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    recommendations:freeze(rows),
    total:rows.length,
    reviewReady:rows.filter(r=>r.status==='READY_FOR_REVIEW').length,
    topRecommendation:rows.find(r=>r.status==='READY_FOR_REVIEW')||null,
    assumptionsVisible:true,
    executiveApprovalRequired:true,
    autonomousExecutionAllowed:false
  });
}
