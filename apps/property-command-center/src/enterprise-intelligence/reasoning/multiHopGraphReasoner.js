const freeze=value=>Object.freeze(value);

export function reasonAcrossGraph({startNodeId,targetType,nodes=[],edges=[],maximumHops=3}={}) {
  if(!startNodeId)throw new Error('startNodeId is required');
  const nodeMap=new Map(nodes.map(node=>[node.id,node]));
  const adjacency=new Map();
  for(const edge of edges){
    if(!adjacency.has(edge.from))adjacency.set(edge.from,[]);
    if(!adjacency.has(edge.to))adjacency.set(edge.to,[]);
    adjacency.get(edge.from).push({...edge,next:edge.to});
    adjacency.get(edge.to).push({...edge,next:edge.from});
  }

  const queue=[{nodeId:startNodeId,path:[startNodeId],evidence:[]}];
  const visited=new Set([startNodeId]);
  const findings=[];

  while(queue.length){
    const current=queue.shift();
    const hops=current.path.length-1;
    const node=nodeMap.get(current.nodeId);
    const type=String(node?.type||node?.kind||'').toUpperCase();

    if(hops>0&&(!targetType||type===String(targetType).toUpperCase())){
      findings.push(freeze({
        nodeId:current.nodeId,node:freeze({...node}),hops,
        path:freeze([...current.path]),
        evidence:freeze(current.evidence.map(item=>freeze({...item})))
      }));
    }
    if(hops>=maximumHops)continue;

    for(const relation of adjacency.get(current.nodeId)||[]){
      if(visited.has(relation.next))continue;
      visited.add(relation.next);
      queue.push({
        nodeId:relation.next,
        path:[...current.path,relation.next],
        evidence:[...current.evidence,{from:relation.from,to:relation.to,type:relation.type}]
      });
    }
  }

  return freeze({
    startNodeId,targetType:targetType||null,findings:freeze(findings),
    findingCount:findings.length,maximumHops,explainable:true,
    productionExecutionAuthorized:false
  });
}
