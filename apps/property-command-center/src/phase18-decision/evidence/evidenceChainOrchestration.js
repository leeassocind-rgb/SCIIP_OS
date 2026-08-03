const freeze=v=>Object.freeze(v);

export function orchestrateEvidenceChains({claims=[],evidence=[],links=[]}={}) {
  const evidenceMap=new Map(evidence.map(item=>[item.evidenceId,item]));
  const chains=claims.map(claim=>{
    const claimLinks=links.filter(link=>link.claimId===claim.claimId);
    const linkedEvidence=claimLinks.map(link=>evidenceMap.get(link.evidenceId)).filter(Boolean);
    const confidence=linkedEvidence.length
      ? Number((linkedEvidence.reduce((sum,item)=>sum+Number(item.confidence||0),0)/linkedEvidence.length).toFixed(3))
      : 0;

    return freeze({
      claimId:claim.claimId,
      evidenceIds:freeze(linkedEvidence.map(item=>item.evidenceId)),
      evidenceCount:linkedEvidence.length,
      confidence,
      status:linkedEvidence.length?'SUPPORTED':'UNSUPPORTED',
      chainPreserved:true
    });
  });

  return freeze({
    chains:freeze(chains),
    total:chains.length,
    supported:chains.filter(c=>c.status==='SUPPORTED').length,
    unsupported:chains.filter(c=>c.status==='UNSUPPORTED').length,
    chainOfCustodyPreserved:true,
    autonomousEvidenceMutationAllowed:false
  });
}
