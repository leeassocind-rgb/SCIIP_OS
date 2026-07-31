const freezeList = rows => Object.freeze(rows.map(row => Object.freeze({...row})));
export function normalizeRecommendationEvidence(evidence=[]){
  const seen=new Set(); const normalized=[];
  for(const item of evidence){
    const evidenceId=String(item?.evidenceId||'').trim();
    if(!evidenceId||seen.has(evidenceId))continue;
    seen.add(evidenceId);
    normalized.push({evidenceId,type:String(item.type||'EXECUTIVE_ANALYTIC'),summary:String(item.summary||''),confidence:Number.isFinite(Number(item.confidence))?Math.max(0,Math.min(1,Number(item.confidence))):0.5,sourceSignalIds:Object.freeze([...(item.sourceSignalIds||[])])});
  }
  return freezeList(normalized);
}
export function calculateEvidenceStrength(evidence=[]){
  const rows=normalizeRecommendationEvidence(evidence);
  if(!rows.length)return Object.freeze({count:0,averageConfidence:0,strength:'NONE'});
  const averageConfidence=Math.round(rows.reduce((n,r)=>n+r.confidence,0)/rows.length*100)/100;
  return Object.freeze({count:rows.length,averageConfidence,strength:averageConfidence>=.8?'HIGH':averageConfidence>=.6?'MEDIUM':'LOW'});
}
