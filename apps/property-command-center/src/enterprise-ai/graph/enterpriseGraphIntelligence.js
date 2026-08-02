const freeze=value=>Object.freeze(value);

export function reasonAcrossEnterpriseGraph({
  startNodeId,
  nodes=[],
  edges=[],
  targetTypes=[],
  maximumHops=4
}={}) {
  if(!startNodeId) throw new Error('startNodeId is required');
  const nodeMap=new Map(nodes.map(node=>[node.id,node]));
  const adjacency=new Map();
  for(const edge of edges){
    if(!adjacency.has(edge.from)) adjacency.set(edge.from,[]);
    adjacency.get(edge.from).push(edge);
  }

  const queue=[{id:startNodeId,path:[startNodeId],evidence:[]}];
  const visited=new Map([[startNodeId,0]]);
  const findings=[];

  while(queue.length){
    const current=queue.shift();
    const hops=current.path.length-1;
    const node=nodeMap.get(current.id);
    if(hops>0 && (!targetTypes.length || targetTypes.includes(node?.type))){
      findings.push(freeze({
        nodeId:current.id,
        node:freeze({...node}),
        hops,
        path:freeze([...current.path]),
        evidence:freeze(current.evidence.map(item=>freeze({...item}))),
        confidence:Number(Math.max(0.1,1-(hops*0.12)).toFixed(2))
      }));
    }
    if(hops>=maximumHops) continue;
    for(const edge of adjacency.get(current.id)||[]){
      const nextHops=hops+1;
      if(visited.has(edge.to) && visited.get(edge.to)<=nextHops) continue;
      visited.set(edge.to,nextHops);
      queue.push({
        id:edge.to,
        path:[...current.path,edge.to],
        evidence:[...current.evidence,edge]
      });
    }
  }

  return freeze({
    startNodeId,
    findings:freeze(findings),
    findingCount:findings.length,
    maximumHops,
    explainable:true,
    evidenceRanked:true,
    productionExecutionAuthorized:false
  });
}
