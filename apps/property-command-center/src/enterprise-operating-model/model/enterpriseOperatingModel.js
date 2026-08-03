const freeze=v=>Object.freeze(v);

export function buildEnterpriseOperatingModel({domains=[],roles=[],cadences=[]}={}) {
  const roleMap=new Map();
  for(const role of roles){
    if(!roleMap.has(role.domainId)) roleMap.set(role.domainId,[]);
    roleMap.get(role.domainId).push(role);
  }
  const cadenceMap=new Map();
  for(const cadence of cadences){
    if(!cadenceMap.has(cadence.domainId)) cadenceMap.set(cadence.domainId,[]);
    cadenceMap.get(cadence.domainId).push(cadence);
  }

  const model=domains.map(domain=>{
    const domainRoles=roleMap.get(domain.domainId)||[];
    const domainCadences=cadenceMap.get(domain.domainId)||[];
    return freeze({
      ...domain,
      roleCount:domainRoles.length,
      cadenceCount:domainCadences.length,
      accountableOwner:domainRoles.find(r=>r.accountability==='ACCOUNTABLE')?.name||null,
      status:domainRoles.length&&domainCadences.length?'DEFINED':'INCOMPLETE'
    });
  });

  return freeze({
    domains:freeze(model),
    total:model.length,
    defined:model.filter(d=>d.status==='DEFINED').length,
    incomplete:model.filter(d=>d.status==='INCOMPLETE').length,
    accountabilityVisible:true,
    operatingCadenceVisible:true,
    autonomousAuthorityChangesAllowed:false
  });
}
