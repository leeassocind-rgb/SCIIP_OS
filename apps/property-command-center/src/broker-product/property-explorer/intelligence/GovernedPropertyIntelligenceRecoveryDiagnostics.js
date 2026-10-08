// SCIIP Explorer 3.0 — M2.58 REPAIR
// Read-only diagnostics derived from M2.57 append-only recovery audit.
export function buildGovernedRecoveryAuditDiagnostics(audit=[]){
  const events=Array.isArray(audit)?audit:[];
  const latest=events.at(-1)||null;
  const count=t=>events.filter(e=>e?.type===t).length;
  const unresolved=!!latest&&['ACTION_FAILED','RETRY_STARTED','RETRY_FAILED'].includes(latest.type);
  return Object.freeze({
    eventCount:events.length,
    failures:count('ACTION_FAILED')+count('RETRY_FAILED'),
    recoveries:count('RECOVERED'),
    latestType:latest?.type||'NONE',
    latestAt:latest?.at||latest?.timestamp||latest?.occurredAt||null,
    state:unresolved?'ATTENTION':count('RECOVERED')?'RECOVERED':'CLEAR',
    automaticCanonicalWrites:false
  });
}
export function formatGovernedRecoveryAuditEvent(event={}){
  return Object.freeze({
    type:event.type||'UNKNOWN',
    label:String(event.type||'UNKNOWN').replaceAll('_',' '),
    state:event.state||null,
    at:event.at||event.timestamp||event.occurredAt||null
  });
}
