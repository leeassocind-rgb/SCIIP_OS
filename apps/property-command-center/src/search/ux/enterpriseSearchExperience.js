const freeze=value=>Object.freeze(value);
const safe=value=>Array.isArray(value)?value:[];

const workspaceFor=item=>{
  if(item.kind==='WORKFLOW')return'Action Center';
  if(item.kind==='OPPORTUNITY')return'Opportunity Intelligence';
  if(item.kind==='ASSIGNMENT')return'Executive Summary';
  if(item.kind==='PROPERTY')return'Property Digital Twin';
  if(item.kind==='MARKET')return'Market Intelligence';
  return'Knowledge Graph';
};

export function createEnterpriseSearchExperience({query='',results=[],indexSize=0,assignmentId=null}={}){
  const normalized=safe(results).map(item=>freeze({
    id:item.id||item.name,
    kind:item.kind||'ENTITY',
    label:item.name||item.title||item.address||item.label||item.id,
    subtitle:[item.city,item.market,item.owner,item.status].filter(Boolean).join(' · ')||item.source,
    source:item.source||'UNKNOWN',
    score:Number(item.score||0),
    matchedTokens:freeze([...safe(item.matchedTokens)]),
    workspace:workspaceFor(item),
    assignmentId:item.assignmentId||null
  }));

  const byKind=normalized.reduce((acc,item)=>{
    if(!acc[item.kind])acc[item.kind]=[];
    acc[item.kind].push(item);
    return acc;
  },{});

  const facets=Object.entries(byKind)
    .map(([kind,items])=>freeze({kind,count:items.length}))
    .sort((a,b)=>b.count-a.count||a.kind.localeCompare(b.kind));

  return freeze({
    query:String(query||''),
    active:Boolean(String(query||'').trim()),
    assignmentId,
    indexSize:Number(indexSize||0),
    results:freeze(normalized),
    groups:freeze(Object.entries(byKind).map(([kind,items])=>freeze({kind,items:freeze(items)}))),
    facets:freeze(facets),
    total:normalized.length,
    topResult:normalized[0]||null,
    assignmentScoped:Boolean(assignmentId),
    keyboardShortcut:'⌘ K',
    noResults:Boolean(String(query||'').trim()&&!normalized.length),
    deterministicRanking:true,
    brokerControlled:true
  });
}
