const freeze=v=>Object.freeze(v);
export function evaluateEnterprisePortfolio({portfolios=[]}={}){
 const rows=portfolios.map(x=>{const score=Number((Number(x.revenue||0)*.00001+Number(x.marginPct||0)*.30+Number(x.growthPct||0)*.35-Number(x.riskScore||0)*.20).toFixed(2));return freeze({...x,score,status:score>=65?'OUTPERFORMING':score>=45?'STABLE':'ATTENTION',evidenceRequired:true,executiveReviewRequired:true})}).sort((a,b)=>b.score-a.score);
 return freeze({portfolios:freeze(rows),total:rows.length,outperforming:rows.filter(x=>x.status==='OUTPERFORMING').length,attentionRequired:rows.filter(x=>x.status==='ATTENTION').length,topPortfolio:rows[0]||null,evidenceBacked:true,crossPortfolio:true,autonomousRebalancingAllowed:false});
}
