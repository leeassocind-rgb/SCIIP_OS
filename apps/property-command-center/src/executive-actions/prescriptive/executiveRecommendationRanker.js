export function rankExecutiveRecommendations(analyses=[]){
  const rows=analyses.filter(row=>row.eligible).map(row=>({...row})).sort((a,b)=>b.utilityScore-a.utilityScore||String(a.alternativeId).localeCompare(String(b.alternativeId)));
  return Object.freeze(rows.map((row,index)=>Object.freeze({...row,rank:index+1})));
}
