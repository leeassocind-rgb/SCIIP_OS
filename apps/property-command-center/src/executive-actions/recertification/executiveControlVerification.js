import{freezeDeep,normalizeStatus,uniq}from'./_shared.js';
export function verifyExecutiveControl(input={}){
  if(!input.id)throw new Error('Control id is required');
  const status=normalizeStatus(input.status||'NOT_TESTED');
  const accepted=['PASSED','FAILED','NOT_TESTED','WAIVED'];
  if(!accepted.includes(status))throw new Error(`Unsupported control status: ${status}`);
  return freezeDeep({
    id:String(input.id),
    actionId:String(input.actionId||'UNASSIGNED'),
    name:String(input.name||input.id),
    status,
    critical:Boolean(input.critical),
    testedBy:input.testedBy?String(input.testedBy):null,
    testedAt:input.testedAt||null,
    evidenceIds:uniq(input.evidenceIds),
    findings:[...(input.findings||[])],
    sourceSignalIds:uniq(input.sourceSignalIds)
  });
}
