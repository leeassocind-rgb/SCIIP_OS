const freeze=value=>Object.freeze(value);
const tokens=value=>String(value??'').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

export function searchKnowledgeGraph({query,nodes=[],edges=[],limit=10}={}) {
  const queryTokens=new Set(tokens(query));
  if(!queryTokens.size)return freeze({
    query:String(query||''),results:freeze([]),total:0,evidenceBacked:true,
    graphNative:true,productionExecutionAuthorized:false
  });

  const adjacency=new Map();
  for(const edge of edges){
    if(!adjacency.has(edge.from))adjacency.set(edge.from,[]);
    if(!adjacency.has(edge.to))adjacency.set(edge.to,[]);
    adjacency.get(edge.from).push(edge);
    adjacency.get(edge.to).push(edge);
  }

  const results=nodes.map(node=>{
    const text=tokens([
      node.label,node.type,node.kind,node.city,node.address,
      JSON.stringify(node.attributes||{})
    ].join(' '));
    const matched=[...new Set(text.filter(token=>queryTokens.has(token)))];
    const coverage=matched.length/queryTokens.size;
    const relationshipCount=(adjacency.get(node.id)||[]).length;
    const score=Number((coverage*80+Math.min(relationshipCount,10)*2).toFixed(2));
    return freeze({
      nodeId:node.id,
      type:node.type||node.kind||'UNKNOWN',
      label:node.label||node.address||node.id,
      score,
      matchedTerms:freeze(matched),
      relationshipCount,
      evidence:freeze((adjacency.get(node.id)||[]).slice(0,5))
    });
  }).filter(item=>item.score>0)
    .sort((a,b)=>b.score-a.score||String(a.label).localeCompare(String(b.label)))
    .slice(0,limit);

  return freeze({
    query:String(query),results:freeze(results),total:results.length,
    evidenceBacked:true,graphNative:true,productionExecutionAuthorized:false
  });
}
