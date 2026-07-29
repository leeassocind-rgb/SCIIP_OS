const events=[];
export function appendIntelligenceEvent(type,payload={},context={}){const event=Object.freeze({id:`INT-${events.length+1}`,type,payload:Object.freeze({...payload}),assignmentId:context.assignmentId||null,actorId:context.actorId||'SYSTEM',occurredAt:context.occurredAt||new Date().toISOString()});events.push(event);return event}
export function readIntelligenceLedger(filter={}){return events.filter(e=>(!filter.assignmentId||e.assignmentId===filter.assignmentId)&&(!filter.type||e.type===filter.type)).slice()}
export function resetIntelligenceLedger(){events.length=0}
