const freeze=o=>Object.freeze(o);
export function detectExecutiveLeadingIndicators(history=[]){
  const rows=[...history];
  if(!rows.length)return freeze([]);
  const recent=rows.slice(-3); const avg=k=>recent.reduce((n,r)=>n+Number(r[k]||0),0)/recent.length;
  const indicators=[];
  if(avg('riskScore')>=65)indicators.push(freeze({id:'RISK_CONCENTRATION',severity:'HIGH',message:'Recent portfolio risk remains elevated.',advisoryOnly:true}));
  if(avg('successRatePct')<70)indicators.push(freeze({id:'SUCCESS_RATE_PRESSURE',severity:'MEDIUM',message:'Recent decision success rate is below target.',advisoryOnly:true}));
  if(avg('reviewRatePct')>30)indicators.push(freeze({id:'REVIEW_LOAD',severity:'MEDIUM',message:'Human review demand is increasing.',advisoryOnly:true}));
  return freeze(indicators);
}
