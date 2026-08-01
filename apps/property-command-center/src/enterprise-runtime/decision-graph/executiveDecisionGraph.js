const freeze=value=>Object.freeze(value);
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));

export function createExecutiveDecisionGraph() {
  const nodes=new Map();
  const edges=new Map();

  const addNode=({id,type,label,attributes={},evidence=[]}={})=>{
    if(!id||!type)throw new Error('Decision graph node id and type are required');
    const existing=nodes.get(id);
    const node=freeze({
      id,
      type,
      label:label||existing?.label||id,
      attributes:freeze({...clone(existing?.attributes||{}),...clone(attributes)}),
      evidence:freeze([...(existing?.evidence||[]),...clone(evidence)]),
      updatedAt:new Date().toISOString()
    });
    nodes.set(id,node);
    return node;
  };

  const addEdge=({from,to,type,evidence=[],attributes={}}={})=>{
    if(!nodes.has(from)||!nodes.has(to))throw new Error('Decision graph edge references unknown nodes');
    const id=`${from}|${type}|${to}`;
    if(edges.has(id))return edges.get(id);
    const edge=freeze({
      id,from,to,type,
      evidence:freeze(clone(evidence)),
      attributes:freeze(clone(attributes)),
      createdAt:new Date().toISOString()
    });
    edges.set(id,edge);
    return edge;
  };

  const recordDecision=({
    decisionId,
    label,
    propertyIds=[],
    marketIds=[],
    peopleIds=[],
    approvalIds=[],
    outcomeIds=[],
    evidence=[]
  }={})=>{
    if(!decisionId)throw new Error('decisionId is required');
    const decision=addNode({
      id:decisionId,
      type:'DECISION',
      label:label||decisionId,
      evidence
    });

    const linkMany=(ids,type,nodeType)=>{
      for(const id of ids){
        if(!nodes.has(id))addNode({id,type:nodeType,label:id});
        addEdge({from:decisionId,to:id,type,evidence});
      }
    };

    linkMany(propertyIds,'CONCERNS_PROPERTY','PROPERTY');
    linkMany(marketIds,'INFORMED_BY_MARKET','MARKET');
    linkMany(peopleIds,'INVOLVES_PERSON','PERSON');
    linkMany(approvalIds,'GOVERNED_BY_APPROVAL','APPROVAL');
    linkMany(outcomeIds,'PRODUCED_OUTCOME','OUTCOME');

    return freeze({
      decision,
      relatedNodes:propertyIds.length+marketIds.length+peopleIds.length+approvalIds.length+outcomeIds.length
    });
  };

  const queryDecision=decisionId=>{
    const decision=nodes.get(decisionId);
    if(!decision)return null;
    const relationships=[...edges.values()].filter(edge=>edge.from===decisionId||edge.to===decisionId);
    const relatedNodeIds=new Set(relationships.flatMap(edge=>[edge.from,edge.to]).filter(id=>id!==decisionId));
    return freeze({
      decision,
      relationships:freeze(relationships),
      relatedNodes:freeze([...relatedNodeIds].map(id=>nodes.get(id)).filter(Boolean)),
      evidence:decision.evidence
    });
  };

  return freeze({
    addNode,addEdge,recordDecision,queryDecision,
    export:()=>freeze({nodes:freeze([...nodes.values()]),edges:freeze([...edges.values()])}),
    snapshot:()=>freeze({
      status:'OPERATIONAL',
      nodes:nodes.size,
      edges:edges.size,
      queryable:true,
      evidenceLinked:true,
      appendOnly:true,
      productionExecutionAuthorized:false
    })
  });
}
