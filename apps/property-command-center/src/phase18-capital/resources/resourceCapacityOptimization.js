const freeze=v=>Object.freeze(v);

export function optimizeResourceCapacity({resources=[],demands=[]}={}) {
  const capacity=new Map(resources.map(r=>[r.resourceId,Number(r.capacity||0)]));
  const usage=new Map(resources.map(r=>[r.resourceId,0]));

  const rows=demands.map(demand=>{
    const available=capacity.get(demand.resourceId)||0;
    const used=usage.get(demand.resourceId)||0;
    const required=Number(demand.required||0);
    const allocated=Math.max(0,Math.min(required,available-used));
    usage.set(demand.resourceId,used+allocated);
    return freeze({
      ...demand,
      required,
      allocated,
      shortfall:Number((required-allocated).toFixed(2)),
      status:allocated===required?'CAPACITY_MET':'CAPACITY_CONSTRAINED'
    });
  });

  return freeze({
    demands:freeze(rows),
    total:rows.length,
    met:rows.filter(r=>r.status==='CAPACITY_MET').length,
    constrained:rows.filter(r=>r.status==='CAPACITY_CONSTRAINED').length,
    resourceUsage:freeze(Object.fromEntries(usage)),
    humanOverrideRequired:true,
    autonomousResourceReassignmentAllowed:false
  });
}
