const freeze=v=>Object.freeze(v);

export function evaluateComplianceReadiness({requirements=[],controls=[],evidencePackages=[]}={}) {
  const controlMap=new Map(controls.map(c=>[c.controlId,c]));
  const evidenceMap=new Map(evidencePackages.map(p=>[p.controlId,p]));
  const results=requirements.map(req=>{
    const linked=(req.controlIds||[]).map(id=>controlMap.get(id)).filter(Boolean);
    const implemented=linked.filter(c=>c.passed).length;
    const evidenceComplete=(req.controlIds||[]).every(id=>evidenceMap.get(id)?.complete);
    const readinessPct=req.controlIds?.length?Number((implemented/req.controlIds.length*100).toFixed(2)):0;
    return freeze({
      requirementId:req.requirementId,
      readinessPct,
      evidenceComplete,
      status:readinessPct===100&&evidenceComplete?'READY':'NOT_READY'
    });
  });

  return freeze({
    requirements:freeze(results),
    total:results.length,
    ready:results.filter(r=>r.status==='READY').length,
    readinessVisible:true,
    executiveReviewRequired:true,
    autonomousAttestationAllowed:false
  });
}
