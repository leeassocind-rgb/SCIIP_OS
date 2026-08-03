const freeze=v=>Object.freeze(v);

export function planInvestmentPortfolio({investments=[]}={}) {
  const rows=investments.map(item=>{
    const returnScore=Number(item.returnScore||0);
    const strategicFit=Number(item.strategicFit||0);
    const confidence=Number(item.confidence||0);
    const risk=Number(item.riskScore||0);
    const score=Number((returnScore*.35+strategicFit*.35+confidence*20-risk*.20).toFixed(2));
    return freeze({
      ...item,
      score,
      status:confidence>=.75?'READY_FOR_REVIEW':'LOW_CONFIDENCE',
      approvalRequired:true
    });
  }).sort((a,b)=>b.score-a.score);

  return freeze({
    investments:freeze(rows),
    total:rows.length,
    reviewReady:rows.filter(r=>r.status==='READY_FOR_REVIEW').length,
    topInvestment:rows.find(r=>r.status==='READY_FOR_REVIEW')||null,
    diversificationVisible:true,
    evidenceRequired:true,
    autonomousInvestmentSelectionAllowed:false
  });
}
