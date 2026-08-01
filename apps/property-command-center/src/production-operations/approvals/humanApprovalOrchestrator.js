const freeze=v=>Object.freeze(v);
export function orchestrateHumanApprovals({requestId,requiredRoles=[],decisions=[]}={}){
 const normalized=requiredRoles.map(role=>{
  const d=decisions.find(item=>item.role===role);
  return freeze({role,status:d?.status||'PENDING',reviewer:d?.reviewer||null});
 });
 const approved=normalized.filter(item=>item.status==='APPROVED').length;
 const rejected=normalized.some(item=>item.status==='REJECTED');
 return freeze({
  requestId,
  decisions:freeze(normalized),
  approved,
  required:requiredRoles.length,
  status:rejected?'REJECTED':approved===requiredRoles.length?'APPROVED':'PENDING',
  quorumReached:!rejected&&approved===requiredRoles.length,
  humanControlled:true,
  autonomousExecutionAllowed:false
 });
}
