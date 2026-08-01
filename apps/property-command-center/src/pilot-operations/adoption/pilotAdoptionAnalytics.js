const freeze=value=>Object.freeze(value);

export function analyzePilotAdoption({events=[],workflows=[]}={}) {
  const activeUsers=new Set(events.map(item=>item.userId).filter(Boolean));
  const workspaces=new Map();

  for(const event of events){
    const workspace=event.workspace||'UNKNOWN';
    const current=workspaces.get(workspace)||{interactions:0,successes:0,failures:0,totalDurationMs:0};
    current.interactions+=1;
    current.successes+=event.success===false?0:1;
    current.failures+=event.success===false?1:0;
    current.totalDurationMs+=Number(event.durationMs||0);
    workspaces.set(workspace,current);
  }

  const workspaceAnalytics=[...workspaces.entries()].map(([workspace,stats])=>freeze({
    workspace,
    interactions:stats.interactions,
    successRate:stats.interactions?Number((stats.successes/stats.interactions).toFixed(4)):0,
    failureRate:stats.interactions?Number((stats.failures/stats.interactions).toFixed(4)):0,
    averageDurationMs:stats.interactions?Number((stats.totalDurationMs/stats.interactions).toFixed(2)):0
  })).sort((a,b)=>b.interactions-a.interactions);

  const completed=workflows.filter(item=>item.status==='COMPLETED').length;
  const abandoned=workflows.filter(item=>item.status==='ABANDONED').length;
  const started=workflows.length;

  return freeze({
    activeUsers:activeUsers.size,
    interactions:events.length,
    workspaces:freeze(workspaceAnalytics),
    workflowsStarted:started,
    workflowsCompleted:completed,
    workflowsAbandoned:abandoned,
    workflowCompletionRate:started?Number((completed/started).toFixed(4)):0,
    adoptionMeasured:true,
    productionImpact:false
  });
}
