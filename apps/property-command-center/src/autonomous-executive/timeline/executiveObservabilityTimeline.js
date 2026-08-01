const freeze=value=>Object.freeze(value);

export function createExecutiveObservabilityTimeline({events=[],runs=[],playbooks=[],alerts=[]}={}) {
  const items=[
    ...events.map(item=>({kind:'EVENT',id:item.eventId,timestamp:item.ingestedAt||item.occurredAt,label:item.type,subjectId:item.subjectId})),
    ...runs.map(item=>({kind:'ORCHESTRATION',id:item.runId,timestamp:item.createdAt||item.updatedAt||new Date(0).toISOString(),label:item.status,subjectId:item.eventId})),
    ...playbooks.map(item=>({kind:'PLAYBOOK',id:item.instanceId,timestamp:item.createdAt||item.submittedAt||new Date(0).toISOString(),label:item.name,subjectId:item.context?.subjectId})),
    ...alerts.map(item=>({kind:'ALERT',id:item.alertId,timestamp:item.createdAt||item.occurredAt||new Date(0).toISOString(),label:item.severity,subjectId:item.subjectId}))
  ].map(item=>freeze(item)).sort((a,b)=>String(b.timestamp).localeCompare(String(a.timestamp)));

  return freeze({
    items:freeze(items),
    total:items.length,
    kinds:freeze([...new Set(items.map(item=>item.kind))]),
    traceable:true,
    auditable:true,
    executionAuthorized:false
  });
}
