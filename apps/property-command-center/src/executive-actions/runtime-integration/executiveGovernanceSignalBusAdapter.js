import{freezeDeep}from'./_shared.js';

export function publishExecutiveGovernanceSignal({signalBus,signal}={}){
  if(!signal?.id)throw new Error('Signal is required');
  if(!signalBus)return freezeDeep({published:false,signalId:signal.id,reason:'SIGNAL_BUS_NOT_CONNECTED'});
  const fn=signalBus.publish||signalBus.emit||signalBus.dispatch;
  if(typeof fn!=='function')return freezeDeep({published:false,signalId:signal.id,reason:'SIGNAL_BUS_API_UNSUPPORTED'});
  const result=fn.call(signalBus,signal.type,signal);
  return freezeDeep({published:true,signalId:signal.id,result:result??null});
}
