/** SCIIP_OS v7.0 Knowledge Graph Viewer Alpha Apps Script regression. */
function sciipTestKnowledgeGraphViewerAlphaV7() {
  var result = SCIIP_KNOWLEDGE_GRAPH_VIEWER.snapshot({});
  var failures = [];
  if (!result || result.status !== 'AVAILABLE') failures.push('Knowledge Graph Viewer did not report AVAILABLE.');
  if (!result.nodes || result.nodes.length < 1) failures.push('No graph nodes were returned.');
  if (!result.edges || result.edges.length < 1) failures.push('No graph edges were returned.');
  if (!result.facets || !result.facets.types) failures.push('Node-type facets are missing.');
  if (typeof sciipKnowledgeGraphSnapshot !== 'function') failures.push('Snapshot entry point is missing.');
  if (typeof sciipKnowledgeGraphNeighbors !== 'function') failures.push('Neighbor entry point is missing.');
  var focused = SCIIP_KNOWLEDGE_GRAPH_VIEWER.neighbors(result.nodes[0].id);
  if (!focused || focused.nodeCount < 1) failures.push('Neighbor exploration failed.');
  var output = {framework:'SCIIP_KNOWLEDGE_GRAPH_VIEWER_ALPHA_TEST',version:'v7.0-alpha.1',status:failures.length?'FAILED':'PASSED',failures:failures,result:result,focused:focused};
  console.log(JSON.stringify(output));
  if (failures.length) throw new Error(failures.join(' | '));
  return output;
}
