import{freezeDeep,normalize,uniq}from'./_shared.js';

export function createExecutiveGovernancePolicy(input={}){
  if(!input.id)throw new Error('Governance policy id is required');
  const rules=(input.rules||[]).map(rule=>{
    if(!rule.id)throw new Error('Governance rule id is required');
    return freezeDeep({
      id:String(rule.id),
      description:String(rule.description||rule.id),
      required:Boolean(rule.required!==false),
      severity:normalize(rule.severity||'HIGH'),
      evidenceTypes:uniq(rule.evidenceTypes),
      evaluator:typeof rule.evaluator==='function'?rule.evaluator:null
    });
  });
  return freezeDeep({
    id:String(input.id),
    name:String(input.name||input.id),
    version:String(input.version||'1.0.0'),
    domain:String(input.domain||'ENTERPRISE'),
    status:normalize(input.status||'ACTIVE'),
    rules,
    sourceSignalIds:uniq(input.sourceSignalIds)
  });
}

export function createExecutiveGovernancePolicyEngine({policies=[]}={}){
  const registry=new Map();
  for(const policy of policies){
    const normalized=createExecutiveGovernancePolicy(policy);
    registry.set(normalized.id,normalized);
  }
  return Object.freeze({
    register(policy){
      const normalized=createExecutiveGovernancePolicy(policy);
      if(registry.has(normalized.id))return{duplicate:true,policy:registry.get(normalized.id)};
      registry.set(normalized.id,normalized);
      return{duplicate:false,policy:normalized};
    },
    get(id){return registry.get(id)||null},
    list(){return[...registry.values()]},
    getStatus(){return freezeDeep({status:'OPERATIONAL',policies:registry.size,readOnly:true})}
  });
}
