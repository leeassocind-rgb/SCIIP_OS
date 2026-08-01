const freeze=value=>Object.freeze(value);

export function createPilotTelemetryAndTriage({events=[],issues=[]}={}) {
  const normalizedEvents=events.map((event,index)=>freeze({
    eventId:event.eventId||`PILOT-EVENT-${index+1}`,
    type:event.type||'INTERACTION',
    userId:event.userId||null,
    workspace:event.workspace||null,
    durationMs:Number(event.durationMs||0),
    success:event.success!==false,
    occurredAt:event.occurredAt||new Date().toISOString()
  }));

  const normalizedIssues=issues.map((issue,index)=>freeze({
    issueId:issue.issueId||`PILOT-ISSUE-${index+1}`,
    severity:issue.severity||'MEDIUM',
    category:issue.category||'UX',
    status:issue.status||'OPEN',
    owner:issue.owner||null,
    evidenceCount:(issue.evidence||[]).length,
    productionImpact:false
  }));

  const failedInteractions=normalizedEvents.filter(item=>!item.success).length;
  const criticalIssues=normalizedIssues.filter(item=>item.severity==='CRITICAL'&&item.status!=='CLOSED').length;
  const openIssues=normalizedIssues.filter(item=>item.status!=='CLOSED').length;
  const averageDurationMs=normalizedEvents.length
    ? Number((normalizedEvents.reduce((sum,item)=>sum+item.durationMs,0)/normalizedEvents.length).toFixed(2))
    : 0;

  const orderedIssues=[...normalizedIssues].sort((a,b)=>{
    const rank={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1};
    return (rank[b.severity]||0)-(rank[a.severity]||0);
  });

  return freeze({
    events:freeze(normalizedEvents),
    issues:freeze(orderedIssues),
    interactions:normalizedEvents.length,
    failedInteractions,
    openIssues,
    criticalIssues,
    averageDurationMs,
    telemetryActive:true,
    triageActive:true,
    productionImpact:false
  });
}
