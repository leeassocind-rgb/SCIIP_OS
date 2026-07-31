import{freezeDeep}from'./_shared.js';

export function registerExecutiveGovernanceSignal({signalRegistry,signal}={}){
  if(!signal?.id)throw new Error('Signal is required');
  const descriptor=freezeDeep({
    id:signal.type,
    name:'Executive Governance Action Proposal Submitted',
    version:'2.25.0',
    domain:'EXECUTIVE_GOVERNANCE',
    source:signal.source,
    schemaVersion:'1.0.0',
    readOnly:true
  });
  if(!signalRegistry)return freezeDeep({registered:false,descriptor,reason:'REGISTRY_NOT_CONNECTED'});
  const fn=signalRegistry.register||signalRegistry.registerSignal||signalRegistry.add;
  if(typeof fn!=='function')return freezeDeep({registered:false,descriptor,reason:'REGISTRY_API_UNSUPPORTED'});
  const result=fn.call(signalRegistry,descriptor);
  return freezeDeep({registered:true,descriptor,result:result??null});
}
