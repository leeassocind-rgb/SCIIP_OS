const freeze=v=>Object.freeze(v);

export function trackStrategicObjectives({objectives=[],initiatives=[]}={}) {
  const rows=objectives.map(objective=>{
    const linked=initiatives.filter(i=>i.objectiveId===objective.objectiveId);
    const complete=linked.filter(i=>i.status==='COMPLETE').length;
    const progressPct=linked.length?Number((complete/linked.length*100).toFixed(2)):0;
    return freeze({
      ...objective,
      initiativeCount:linked.length,
      completedInitiatives:complete,
      progressPct,
      status:progressPct===100?'COMPLETE':progressPct>=50?'ON_TRACK':'AT_RISK',
      executiveReviewRequired:true
    });
  });

  return freeze({
    objectives:freeze(rows),
    total:rows.length,
    complete:rows.filter(r=>r.status==='COMPLETE').length,
    onTrack:rows.filter(r=>r.status==='ON_TRACK').length,
    atRisk:rows.filter(r=>r.status==='AT_RISK').length,
    permanentHistory:true,
    autonomousObjectiveChangesAllowed:false
  });
}
