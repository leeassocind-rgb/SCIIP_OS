const freeze=v=>Object.freeze(v);
export function createGovernedExecutiveEventStream({maximumEvents=10000}={}){
 const events=[],subscribers=new Set(),keys=new Set();
 const publish=event=>{
  const key=event.eventKey||`${event.type}:${event.subjectId||''}:${event.occurredAt||''}`;
  if(keys.has(key))return freeze({status:'DUPLICATE_SKIPPED',eventKey:key});
  const stored=freeze({...event,eventId:event.eventId||`EXEC-EVENT-${events.length+1}`,eventKey:key,sequence:events.length+1,ingestedAt:new Date().toISOString(),productionExecutionAuthorized:false});
  events.push(stored);keys.add(key);if(events.length>maximumEvents){const removed=events.shift();keys.delete(removed.eventKey)}
  subscribers.forEach(fn=>fn(stored));return freeze({status:'PUBLISHED',event:stored});
 };
 return freeze({publish,read:()=>freeze([...events]),subscribe:fn=>{subscribers.add(fn);return()=>subscribers.delete(fn)},snapshot:()=>freeze({status:'OPERATIONAL',events:events.length,subscribers:subscribers.size,duplicateSafe:true,eventSourced:true,productionExecutionAuthorized:false})});
}
