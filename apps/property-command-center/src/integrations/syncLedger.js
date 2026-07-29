let entries=[];let sequence=0;
export function appendSyncEvent(type,payload={},context={}){const event=Object.freeze({id:`SYNC-${String(++sequence).padStart(6,'0')}`,type,payload:Object.freeze({...payload}),organizationId:context.organizationId||'default',assignmentId:context.assignmentId||null,connectorId:context.connectorId||payload.connectorId||null,createdAt:new Date().toISOString()});entries=[...entries,event];return event}
export function readSyncLedger(filter={}){return entries.filter(e=>(!filter.organizationId||e.organizationId===filter.organizationId)&&(!filter.assignmentId||e.assignmentId===filter.assignmentId)&&(!filter.connectorId||e.connectorId===filter.connectorId))}
export function resetSyncLedger(){entries=[];sequence=0}
