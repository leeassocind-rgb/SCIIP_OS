const freeze=value=>Object.freeze(value);

export function createGraphPromotionPipeline() {
  const ledger=[];

  const promote=({graph,stage='CANARY',approvedBy,evidenceDigest,productionEnabled=false}={})=>{
    if(!graph?.nodes||!graph?.edges)throw new Error('Graph payload required');
    if(!approvedBy||!evidenceDigest)throw new Error('Approver and evidence digest required');

    if(stage==='PRODUCTION'&&!productionEnabled){
      const blocked=freeze({status:'PRODUCTION_BLOCKED',stage,committed:false});
      ledger.push(blocked);
      return blocked;
    }

    const certificate=freeze({
      promotionId:`GRAPH-PROMOTION-${ledger.length+1}`,
      stage,
      approvedBy,
      evidenceDigest,
      nodes:graph.nodes.length,
      edges:graph.edges.length,
      committed:true,
      rollbackCheckpoint:`GRAPH-RB-${ledger.length+1}`,
      productionWritesEnabled:stage==='PRODUCTION'&&productionEnabled
    });
    ledger.push(certificate);
    return freeze({status:'PROMOTED',certificate,committed:true});
  };

  return freeze({
    promote,
    ledger:()=>freeze([...ledger]),
    snapshot:()=>freeze({
      promotions:ledger.length,
      approvalRequired:true,
      rollbackCheckpoints:true,
      productionDefaultDenied:true
    })
  });
}
