const freeze = value => Object.freeze(value);
const safeArray = value => Array.isArray(value) ? value : [];

const workspaceByType = Object.freeze({
  WORKFLOW:'Action Center',
  OPPORTUNITY:'Opportunity Intelligence',
  SIGNAL:'Executive Command Center',
  DECISION:'Action Center'
});

export function createExecutiveTimelineExperience({
  workflows = [],
  opportunities = [],
  signals = [],
  decisions = [],
  limit = 30
} = {}) {
  const events = [
    ...safeArray(workflows).map(item => ({
      id:`WF-${item.id}`,type:'WORKFLOW',at:item.updatedAt||item.createdAt,title:`Workflow ${String(item.status||'UPDATED').replaceAll('_',' ')}`,
      summary:item.title||item.workflowType||'Governed workflow',severity:item.status==='BLOCKED'?'HIGH':'INFO',workspace:'Action Center',sourceIds:item.evidenceRefs||[]
    })),
    ...safeArray(opportunities).map(item => ({
      id:`OP-${item.id}`,type:'OPPORTUNITY',at:item.preservedAt||item.updatedAt,title:`Opportunity ${String(item.status||'REVIEWED').replaceAll('_',' ')}`,
      summary:item.title||item.propertyId||'Opportunity',severity:Number(item.score||0)>=80?'MEDIUM':'INFO',workspace:'Opportunity Intelligence',sourceIds:item.evidenceIds||[]
    })),
    ...safeArray(signals).map(item => ({
      id:`SIG-${item.id}`,type:'SIGNAL',at:item.occurredAt||item.createdAt,title:item.title||String(item.type||'Executive signal').replaceAll('_',' '),
      summary:item.summary||item.source||'Executive signal',severity:item.severity||'INFO',workspace:'Executive Command Center',sourceIds:(item.evidence||[]).map(e=>e.id)
    })),
    ...safeArray(decisions).map(item => ({
      id:`DEC-${item.id||item.decisionId}`,type:'DECISION',at:item.decidedAt||item.createdAt,title:`Decision ${String(item.disposition||item.status||'RECORDED').replaceAll('_',' ')}`,
      summary:item.reason||item.recommendationId||'Governed decision',severity:item.disposition==='REJECTED'?'HIGH':'INFO',workspace:'Action Center',sourceIds:item.evidenceIds||[]
    }))
  ].filter(item => item.at);

  const normalized = events
    .map(item => freeze({...item,workspace:item.workspace||workspaceByType[item.type],sourceIds:freeze([...safeArray(item.sourceIds)])}))
    .sort((a,b)=>String(b.at).localeCompare(String(a.at)))
    .slice(0,Math.max(1,Number(limit)||30));

  const groups = [];
  for(const event of normalized){
    const date=String(event.at).slice(0,10);
    let group=groups.find(item=>item.date===date);
    if(!group){group={date,events:[]};groups.push(group)}
    group.events.push(event);
  }

  const counts = normalized.reduce((acc,item)=>{
    acc[item.type]=(acc[item.type]||0)+1;
    return acc;
  },{WORKFLOW:0,OPPORTUNITY:0,SIGNAL:0,DECISION:0});

  return freeze({
    events:freeze(normalized),
    groups:freeze(groups.map(group=>freeze({date:group.date,events:freeze(group.events)}))),
    counts:freeze(counts),
    total:normalized.length,
    appendOnly:true,
    traceable:normalized.every(item=>Array.isArray(item.sourceIds)),
    autonomousExecutionAllowed:false
  });
}
