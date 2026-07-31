const freeze=value=>Object.freeze(value);

export function validateProductionGraph({nodes=[],edges=[],temporalLinks=[],thresholds={}}={}) {
  const policy={
    minimumNodes:Number(thresholds.minimumNodes??1),
    minimumEdges:Number(thresholds.minimumEdges??1),
    maximumOrphanPct:Number(thresholds.maximumOrphanPct??10),
    maximumUnresolvedPct:Number(thresholds.maximumUnresolvedPct??5)
  };

  const nodeIds=new Set(nodes.map(node=>node.id));
  const connected=new Set();
  let invalidEdges=0;

  for(const edge of edges){
    if(!nodeIds.has(edge.from)||!nodeIds.has(edge.to)){
      invalidEdges++;
    }else{
      connected.add(edge.from);
      connected.add(edge.to);
    }
  }

  const orphanCount=nodes.filter(node=>!connected.has(node.id)).length;
  const orphanPct=nodes.length?Number(((orphanCount/nodes.length)*100).toFixed(2)):100;
  const unresolvedCount=nodes.filter(node=>node.status==='UNRESOLVED').length;
  const unresolvedPct=nodes.length?Number(((unresolvedCount/nodes.length)*100).toFixed(2)):100;

  const checks=freeze([
    freeze({id:'MINIMUM_NODES',passed:nodes.length>=policy.minimumNodes}),
    freeze({id:'MINIMUM_EDGES',passed:edges.length>=policy.minimumEdges}),
    freeze({id:'EDGE_REFERENTIAL_INTEGRITY',passed:invalidEdges===0}),
    freeze({id:'ORPHAN_RATE',passed:orphanPct<=policy.maximumOrphanPct}),
    freeze({id:'UNRESOLVED_RATE',passed:unresolvedPct<=policy.maximumUnresolvedPct}),
    freeze({id:'TEMPORAL_LINK_INTEGRITY',passed:temporalLinks.every(link=>nodeIds.has(link.from)&&nodeIds.has(link.to))})
  ]);

  const failed=checks.filter(check=>!check.passed).length;

  return freeze({
    status:failed?'BLOCKED':'VALIDATED',
    checks,
    checksRun:checks.length,
    checksFailed:failed,
    nodeCount:nodes.length,
    edgeCount:edges.length,
    orphanPct,
    unresolvedPct,
    invalidEdges
  });
}
