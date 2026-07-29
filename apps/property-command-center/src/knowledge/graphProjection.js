const clean=value=>value===null||value===undefined?'':String(value).trim();
const slug=value=>clean(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const stableId=(type,...parts)=>`${type}:${parts.map(slug).filter(Boolean).join(':')||'unknown'}`;
const now=()=>new Date().toISOString();

export const NODE_TYPES=Object.freeze(['Property','Market','Assignment','Source','Status']);
export const EDGE_TYPES=Object.freeze(['LOCATED_IN','SUPPORTS_ASSIGNMENT','OBSERVED_IN','HAS_STATUS']);

export function projectRowsToGraph(rows,{assignmentId,assignmentName='',ingestionId,fileName}={}){
  const nodes=new Map();
  const edges=new Map();
  const observedAt=now();
  const addNode=node=>{const prior=nodes.get(node.id);nodes.set(node.id,{...prior,...node,attributes:{...(prior?.attributes||{}),...(node.attributes||{})}})};
  const addEdge=edge=>edges.set(edge.id,edge);
  const assignmentNodeId=stableId('assignment',assignmentId||assignmentName||'unassigned');
  const sourceNodeId=stableId('source',ingestionId||fileName||'supersheet');
  addNode({id:assignmentNodeId,type:'Assignment',label:assignmentName||assignmentId||'Unassigned',businessKey:assignmentId||assignmentName,attributes:{assignmentId},createdAt:observedAt,updatedAt:observedAt});
  addNode({id:sourceNodeId,type:'Source',label:fileName||'SuperSheet',businessKey:ingestionId||fileName,attributes:{ingestionId,fileName},createdAt:observedAt,updatedAt:observedAt});
  rows.forEach(row=>{
    const propertyKey=row.propertyId||[row.address,row.city,row.state,row.postalCode].filter(Boolean).join('|');
    const propertyId=stableId('property',propertyKey);
    const marketKey=[row.city,row.state].filter(Boolean).join('|')||'Unknown Market';
    const marketId=stableId('market',marketKey);
    const statusId=stableId('status',row.status||'Unknown');
    addNode({id:propertyId,type:'Property',label:row.address||propertyKey,businessKey:propertyKey,attributes:{...row},createdAt:observedAt,updatedAt:observedAt});
    addNode({id:marketId,type:'Market',label:[row.city,row.state].filter(Boolean).join(', ')||'Unknown Market',businessKey:marketKey,attributes:{city:row.city,state:row.state},createdAt:observedAt,updatedAt:observedAt});
    addNode({id:statusId,type:'Status',label:row.status||'Unknown',businessKey:row.status||'Unknown',attributes:{status:row.status||'Unknown'},createdAt:observedAt,updatedAt:observedAt});
    const relation=(type,from,to)=>({id:`edge:${type}:${from}:${to}`,type,from,to,observedAt,sourceId:sourceNodeId,assignmentId});
    addEdge(relation('LOCATED_IN',propertyId,marketId));
    addEdge(relation('SUPPORTS_ASSIGNMENT',propertyId,assignmentNodeId));
    addEdge(relation('OBSERVED_IN',propertyId,sourceNodeId));
    addEdge(relation('HAS_STATUS',propertyId,statusId));
  });
  return {nodes:[...nodes.values()],edges:[...edges.values()],metadata:{assignmentId,ingestionId,fileName,projectedAt:observedAt,rowCount:rows.length}};
}

export function mergeGraph(existing={nodes:[],edges:[],history:[]},projection){
  const nodes=new Map((existing.nodes||[]).map(node=>[node.id,node]));
  projection.nodes.forEach(node=>{const prior=nodes.get(node.id);nodes.set(node.id,{...prior,...node,createdAt:prior?.createdAt||node.createdAt,attributes:{...(prior?.attributes||{}),...(node.attributes||{})}})});
  const edges=new Map((existing.edges||[]).map(edge=>[edge.id,edge]));
  projection.edges.forEach(edge=>edges.set(edge.id,{...(edges.get(edge.id)||{}),...edge}));
  const event={eventId:`graph-event:${projection.metadata.ingestionId||Date.now()}`,type:'GRAPH_PROJECTION_PROMOTED',...projection.metadata,nodeCount:projection.nodes.length,edgeCount:projection.edges.length};
  const history=[event,...(existing.history||[]).filter(item=>item.eventId!==event.eventId)].slice(0,100);
  return {version:'release-1-sprint-5.0',nodes:[...nodes.values()],edges:[...edges.values()],history,updatedAt:new Date().toISOString()};
}
