import{freezeDeep,normalizeStatus,uniq}from'./_shared.js';
export function createExecutiveRemediationEvidence(input={}){
  if(!input.id)throw new Error('Evidence id is required');
  if(!input.actionId)throw new Error('Evidence actionId is required');
  const status=normalizeStatus(input.status||'SUBMITTED');
  const accepted=['SUBMITTED','VERIFIED','REJECTED'];
  if(!accepted.includes(status))throw new Error(`Unsupported evidence status: ${status}`);
  return freezeDeep({
    id:String(input.id),
    actionId:String(input.actionId),
    type:String(input.type||'DOCUMENT'),
    status,
    submittedBy:String(input.submittedBy||'UNKNOWN'),
    submittedAt:input.submittedAt||new Date().toISOString(),
    verifiedBy:input.verifiedBy?String(input.verifiedBy):null,
    verifiedAt:input.verifiedAt||null,
    checksum:input.checksum||null,
    sourceSignalIds:uniq(input.sourceSignalIds),
    metadata:{...(input.metadata||{})}
  });
}
