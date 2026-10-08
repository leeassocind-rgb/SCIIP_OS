// SCIIP Explorer 3.0 — M2.60
// Read-only recovery audit filtering and operator focus.

export const RECOVERY_FILTERS=Object.freeze({
  ALL:'ALL',
  FAILURES:'FAILURES',
  RETRIES:'RETRIES',
  RECOVERIES:'RECOVERIES',
  AUTHORITATIVE:'AUTHORITATIVE'
});

export function filterGovernedRecoveryAudit(events=[],filter='ALL'){
  const rows=Array.isArray(events)?events:[];
  switch(filter){
    case RECOVERY_FILTERS.FAILURES:
      return rows.filter(e=>['ACTION_FAILED','RETRY_FAILED'].includes(e?.type));
    case RECOVERY_FILTERS.RETRIES:
      return rows.filter(e=>['RETRY_STARTED','RETRY_FAILED'].includes(e?.type));
    case RECOVERY_FILTERS.RECOVERIES:
      return rows.filter(e=>['RECOVERED','RECOVERY_SESSION_CLEARED'].includes(e?.type));
    case RECOVERY_FILTERS.AUTHORITATIVE:
      return rows.filter(e=>e?.authoritative===true);
    default:
      return rows;
  }
}

export function summarizeGovernedRecoveryFilter(events=[],filter='ALL'){
  const filtered=filterGovernedRecoveryAudit(events,filter);
  return Object.freeze({
    filter,
    total:Array.isArray(events)?events.length:0,
    visible:filtered.length,
    hidden:Math.max(0,(Array.isArray(events)?events.length:0)-filtered.length),
    automaticCanonicalWrites:false
  });
}
