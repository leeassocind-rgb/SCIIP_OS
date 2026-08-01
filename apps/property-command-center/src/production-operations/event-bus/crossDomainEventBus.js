const freeze=v=>Object.freeze(v);
export function createCrossDomainEventBus(){
 const subscribers=new Map(),history=[],seen=new Set();
 const publish=event=>{
  if(!event?.eventId)throw new Error('eventId is required');
  if(seen.has(event.eventId))return freeze({status:'DUPLICATE_SKIPPED',eventId:event.eventId});
  seen.add(event.eventId);history.push(freeze({...event}));
  for(const fn of subscribers.get(event.domain)||[])fn(event);
  for(const fn of subscribers.get('*')||[])fn(event);
  return freeze({status:'PUBLISHED',eventId:event.eventId});
 };
 const subscribe=(domain,fn)=>{
  if(!subscribers.has(domain))subscribers.set(domain,new Set());
  subscribers.get(domain).add(fn);
  return()=>subscribers.get(domain).delete(fn);
 };
 return freeze({publish,subscribe,replay:()=>freeze([...history]),snapshot:()=>freeze({
  events:history.length,duplicateSafe:true,replayable:true,crossDomain:true,autonomousExecutionAllowed:false
 })});
}
