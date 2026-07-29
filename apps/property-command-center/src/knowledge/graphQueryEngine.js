const text=value=>String(value??'').toLowerCase();
const includes=(value,term)=>text(value).includes(text(term));
export function graphSummary(graph){const byType={};(graph.nodes||[]).forEach(node=>{byType[node.type]=(byType[node.type]||0)+1});return{nodes:(graph.nodes||[]).length,edges:(graph.edges||[]).length,properties:byType.Property||0,markets:byType.Market||0,sources:byType.Source||0,assignments:byType.Assignment||0,byType}}
export function queryGraph(graph,{term='',type='All',assignmentId=''}={}){
 const edgeSet=assignmentId?new Set((graph.edges||[]).filter(edge=>edge.type==='SUPPORTS_ASSIGNMENT'&&edge.to.endsWith(`:${String(assignmentId).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`)).map(edge=>edge.from)):null;
 return(graph.nodes||[]).filter(node=>{
  if(type!=='All'&&node.type!==type)return false;
  if(edgeSet&&node.type==='Property'&&!edgeSet.has(node.id))return false;
  if(!term)return true;
  return includes(node.label,term)||includes(node.businessKey,term)||Object.values(node.attributes||{}).some(value=>includes(value,term));
 });
}
export function neighborsOf(graph,nodeId){const edges=(graph.edges||[]).filter(edge=>edge.from===nodeId||edge.to===nodeId);const ids=new Set(edges.flatMap(edge=>[edge.from,edge.to]).filter(id=>id!==nodeId));const nodes=(graph.nodes||[]).filter(node=>ids.has(node.id));return{edges,nodes}}
export function evidenceForNode(graph,nodeId){const related=neighborsOf(graph,nodeId);return related.nodes.filter(node=>node.type==='Source').map(source=>({source,edges:related.edges.filter(edge=>edge.from===source.id||edge.to===source.id)}))}
