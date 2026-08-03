const freeze=v=>Object.freeze(v);

export function reconcileKnowledgeGraph({expectedNodes=[],actualNodes=[],expectedEdges=[],actualEdges=[]}={}) {
  const actualNodeIds=new Set(actualNodes.map(n=>n.id));
  const expectedNodeIds=new Set(expectedNodes.map(n=>n.id));
  const actualEdgeIds=new Set(actualEdges.map(e=>e.id));
  const expectedEdgeIds=new Set(expectedEdges.map(e=>e.id));

  const missingNodes=expectedNodes.filter(n=>!actualNodeIds.has(n.id));
  const unexpectedNodes=actualNodes.filter(n=>!expectedNodeIds.has(n.id));
  const missingEdges=expectedEdges.filter(e=>!actualEdgeIds.has(e.id));
  const unexpectedEdges=actualEdges.filter(e=>!expectedEdgeIds.has(e.id));

  return freeze({
    missingNodes:freeze(missingNodes),
    unexpectedNodes:freeze(unexpectedNodes),
    missingEdges:freeze(missingEdges),
    unexpectedEdges:freeze(unexpectedEdges),
    nodeDrift:missingNodes.length+unexpectedNodes.length,
    edgeDrift:missingEdges.length+unexpectedEdges.length,
    synchronized:missingNodes.length===0&&unexpectedNodes.length===0&&missingEdges.length===0&&unexpectedEdges.length===0,
    reconciliationEvidencePreserved:true,
    autonomousGraphMutationAllowed:false
  });
}
