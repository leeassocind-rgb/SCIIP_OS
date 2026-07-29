import{requirementFromAssignment,rankPropertyMatches}from'./matchingEngine.js';
const freeze=value=>Object.freeze(value);
const text=value=>String(value??'').trim();
const number=value=>{const parsed=Number(String(value??'').replace(/[^0-9.-]/g,''));return Number.isFinite(parsed)?parsed:0};

function confidence(score,evidenceCount){
  if(score>=85&&evidenceCount>=2)return'HIGH';
  if(score>=70)return'MEDIUM';
  return'LOW';
}
function evidenceFor(graph,propertyId,assignmentId){
  const edges=(graph.edges||[]).filter(edge=>edge.from===propertyId||edge.to===propertyId);
  const assignmentEdges=edges.filter(edge=>String(edge.from).includes(assignmentId)||String(edge.to).includes(assignmentId)||edge.type==='SUPPORTS_ASSIGNMENT');
  return freeze({totalEdges:edges.length,assignmentEdges:assignmentEdges.length,edgeTypes:freeze([...new Set(edges.map(edge=>edge.type))].sort())});
}
function nextAction(match,property){
  if(match.gaps.some(gap=>gap.key==='availability'))return'Verify current availability and deal structure';
  if(match.gaps.some(gap=>gap.key==='powerAmps'))return'Confirm electrical service and expansion feasibility';
  if(match.score>=85)return'Broker review and prioritize outreach';
  return'Review evidence gaps before outreach';
}

export function propertiesFromGraph(graph={nodes:[]}){return(graph.nodes||[]).filter(node=>node.type==='Property').map(node=>Object.freeze({...node,buildingSf:number(node.attributes?.buildingSf??node.attributes?.availableSf),powerAmps:number(node.attributes?.powerAmps),clearHeight:number(node.attributes?.clearHeight),status:text(node.attributes?.status||'Unknown'),evidenceCount:(graph.edges||[]).filter(edge=>edge.from===node.id||edge.to===node.id).length}))}

export function buildAssignmentOpportunities({graph={nodes:[],edges:[]},assignment={},properties=[]}={}){
  const requirement=requirementFromAssignment(assignment);
  const ranked=rankPropertyMatches(properties,requirement,{limit:50});
  return ranked.map((property,index)=>{
    const evidence=evidenceFor(graph,property.id,assignment.id);
    const evidenceCount=evidence.totalEdges;
    return freeze({
      id:`OPP:${text(assignment.id)||'assignment'}:${property.id}`,
      rank:index+1,
      assignmentId:text(assignment.id),
      propertyId:property.id,
      propertyLabel:property.label||property.attributes?.address||property.id,
      score:property.match.score,
      confidence:confidence(property.match.score,evidenceCount),
      strengths:property.match.strengths,
      gaps:property.match.gaps,
      evidence,
      nextAction:nextAction(property.match,property),
      brokerApprovalRequired:true,
      status:'ADVISORY',
      property
    });
  });
}

export function opportunitySummary(opportunities=[]){
  const high=opportunities.filter(item=>item.confidence==='HIGH').length;
  const medium=opportunities.filter(item=>item.confidence==='MEDIUM').length;
  const actionable=opportunities.filter(item=>item.score>=75).length;
  return freeze({total:opportunities.length,highConfidence:high,mediumConfidence:medium,actionable,topScore:opportunities[0]?.score||0});
}
