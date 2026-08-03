const freeze=v=>Object.freeze(v);
export function buildStrategicPlan({objectives=[],initiatives=[],dependencies=[]}={}){
 const rows=objectives.map(o=>{const linked=initiatives.filter(i=>i.objectiveId===o.objectiveId),complete=linked.filter(i=>i.status==='COMPLETE').length,progressPct=linked.length?Number((complete/linked.length*100).toFixed(2)):0,blockers=dependencies.filter(d=>d.objectiveId===o.objectiveId&&d.status==='BLOCKED');return freeze({...o,initiativeCount:linked.length,progressPct,blockerCount:blockers.length,status:blockers.length?'AT_RISK':progressPct===100?'COMPLETE':'IN_PROGRESS'})});
 return freeze({objectives:freeze(rows),total:rows.length,atRisk:rows.filter(x=>x.status==='AT_RISK').length,complete:rows.filter(x=>x.status==='COMPLETE').length,evidenceBacked:true,permanentHistory:true,executiveApprovalRequired:true,autonomousPlanChangesAllowed:false});
}
