import{freezeDeep,normalize,uniq}from'./_shared.js';

export function createExecutiveGovernanceEvidence(input={}){
  if(!input.id)throw new Error('Evidence id is required');
  if(!input.type)throw new Error('Evidence type is required');
  const status=normalize(input.status||'VERIFIED');
  if(!['VERIFIED','REJECTED','PENDING'].includes(status))throw new Error(`Unsupported evidence status: ${status}`);
  return freezeDeep({
    id:String(input.id),
    type:normalize(input.type),
    status,
    source:String(input.source||'UNKNOWN'),
    checksum:input.checksum||null,
    verifiedBy:input.verifiedBy?String(input.verifiedBy):null,
    verifiedAt:input.verifiedAt||null,
    sourceSignalIds:uniq(input.sourceSignalIds),
    metadata:{...(input.metadata||{})}
  });
}

export function buildExecutiveGovernanceEvidenceChain(evidence=[]){
  const normalized=evidence.map(createExecutiveGovernanceEvidence);
  const verified=normalized.filter(item=>item.status==='VERIFIED');
  return freezeDeep({
    evidence:normalized,
    evidenceIds:normalized.map(item=>item.id),
    verifiedEvidenceIds:verified.map(item=>item.id),
    rejectedEvidenceIds:normalized.filter(item=>item.status==='REJECTED').map(item=>item.id),
    pendingEvidenceIds:normalized.filter(item=>item.status==='PENDING').map(item=>item.id),
    complete:normalized.length>0&&verified.length===normalized.length,
    sourceSignalIds:uniq(normalized.flatMap(item=>item.sourceSignalIds))
  });
}
