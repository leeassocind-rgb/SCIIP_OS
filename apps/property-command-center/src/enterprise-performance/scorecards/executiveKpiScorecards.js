const freeze=v=>Object.freeze(v);
export function buildExecutiveScorecards({metrics=[]}={}){
 const rows=metrics.map(x=>{const actual=Number(x.actual||0),target=Number(x.target||0),variance=Number((actual-target).toFixed(2)),attainmentPct=target?Number((actual/target*100).toFixed(2)):0;return freeze({...x,variance,attainmentPct,status:attainmentPct>=100?'ON_OR_ABOVE_TARGET':attainmentPct>=85?'WATCH':'BELOW_TARGET',evidenceRequired:true})});
 return freeze({metrics:freeze(rows),total:rows.length,onTarget:rows.filter(x=>x.status==='ON_OR_ABOVE_TARGET').length,belowTarget:rows.filter(x=>x.status==='BELOW_TARGET').length,assumptionsVisible:true,executiveReviewRequired:true,autonomousMetricChangesAllowed:false});
}
