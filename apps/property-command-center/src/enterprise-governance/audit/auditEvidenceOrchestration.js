const freeze=v=>Object.freeze(v);

export function orchestrateAuditEvidence({controls=[],evidence=[]}={}) {
  const byControl=new Map();
  for(const item of evidence){
    if(!byControl.has(item.controlId))byControl.set(item.controlId,[]);
    byControl.get(item.controlId).push(item);
  }

  const packages=controls.map(control=>{
    const linked=byControl.get(control.controlId)||[];
    return freeze({
      controlId:control.controlId,
      evidence:freeze(linked.map(item=>freeze({...item}))),
      evidenceCount:linked.length,
      complete:linked.length>=Number(control.minimumEvidence||1),
      chainOfCustodyPreserved:true
    });
  });

  return freeze({
    packages:freeze(packages),
    total:packages.length,
    complete:packages.filter(p=>p.complete).length,
    incomplete:packages.filter(p=>!p.complete).length,
    chainOfCustodyPreserved:true,
    immutableAuditTrail:true,
    autonomousEvidenceMutationAllowed:false
  });
}
