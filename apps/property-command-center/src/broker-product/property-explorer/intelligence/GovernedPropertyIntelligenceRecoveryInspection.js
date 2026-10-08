// SCIIP Explorer 3.0 — M2.59
export function buildGovernedRecoveryEventInspection(event=null){
  if(!event)return Object.freeze({visible:false,type:'NONE',label:'No event selected',state:null,action:null,retryCount:0,retryOf:null,authoritative:false,at:null,message:null,automaticCanonicalWrites:false});
  const type=String(event.type||'UNKNOWN');
  return Object.freeze({
    visible:true,
    eventId:event.eventId||event.id||null,
    propertyId:event.propertyId||null,
    type,
    label:type.replaceAll('_',' '),
    state:event.state||null,
    action:event.action||event.actionType||null,
    retryCount:Number(event.retryCount||0),
    retryOf:event.retryOf||null,
    authoritative:!!event.authoritative,
    at:event.occurredAt||event.at||event.timestamp||null,
    message:event.message||event.error||event.metadata?.error||null,
    automaticCanonicalWrites:false
  });
}
export function latestGovernedRecoveryEvent(audit){
  const events=Array.isArray(audit)?audit:(Array.isArray(audit?.events)?audit.events:[]);
  return events.at(-1)||null;
}
