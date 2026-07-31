export function analyzeExecutiveDecisionTrend(outcomes=[]) {
  const rows=outcomes.filter(Boolean).slice().sort((a,b)=>String(a.completedAt||'').localeCompare(String(b.completedAt||'')));
  if(rows.length<2)return Object.freeze({direction:'STABLE',deltaPct:0,sampleSize:rows.length});
  const midpoint=Math.ceil(rows.length/2), score=part=>part.length?part.filter(r=>r.classification==='COMPLETED').length/part.length:0;
  const delta=(score(rows.slice(midpoint))-score(rows.slice(0,midpoint)))*100;
  return Object.freeze({direction:delta>0?'IMPROVING':delta<0?'DECLINING':'STABLE',deltaPct:Number(delta.toFixed(2)),sampleSize:rows.length});
}
