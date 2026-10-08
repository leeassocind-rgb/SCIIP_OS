// SCIIP Explorer 3.0 — M2.78
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCAE'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function normalizeOccurredAt(value){
  if(value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if(typeof value==='string' && value.trim()){
    const d=new Date(value);
    if(!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return 'UNRECORDED';
}

export function buildGovernedConsumerInvocationAuditLedger(invocationProvenance={},occurredAt){
  const invocations=Array.isArray(invocationProvenance?.invocations)?invocationProvenance.invocations:[];
  const provenanceReady=
    invocationProvenance?.status==='READY'&&
    invocationProvenance?.invocationState==='INVOCATION_READY'&&
    invocationProvenance?.attributable===true&&
    invocationProvenance?.reproducible===true&&
    invocationProvenance?.readOnly===true&&
    invocationProvenance?.executionAuthority===false;

  const occurredAtIso=normalizeOccurredAt(occurredAt);

  const events=CONSUMERS.map(consumer=>{
    const invocation=invocations.find(item=>item?.consumer===consumer);
    const eventReady=
      provenanceReady&&
      invocation?.state==='INVOCABLE'&&
      invocation?.provenanceState==='ATTRIBUTABLE'&&
      invocation?.readOnly===true&&
      invocation?.executionAuthority===false;

    const eventId=stableId([
      clean(invocation?.invocationId),
      clean(invocation?.provenanceKey),
      clean(invocationProvenance?.runtimeId),
      clean(invocationProvenance?.contextId),
      clean(invocationProvenance?.propertyId),
      occurredAtIso
    ],'GCIE');

    return Object.freeze({
      consumer,
      eventId,
      eventKey:`M2.78:${clean(invocationProvenance?.propertyId)}:${consumer}`,
      occurredAt:occurredAtIso,
      invocationId:clean(invocation?.invocationId),
      provenanceKey:clean(invocation?.provenanceKey),
      runtimeId:clean(invocationProvenance?.runtimeId),
      contextId:clean(invocationProvenance?.contextId),
      propertyId:clean(invocationProvenance?.propertyId),
      bindingKey:clean(invocation?.bindingKey),
      state:eventReady?'RECORDED':'BLOCKED',
      auditState:eventReady?'APPEND_ONLY':'BLOCKED',
      attributable:true,
      reproducible:true,
      readOnly:true,
      appendOnly:true,
      executionAuthority:false
    });
  });

  const recordedCount=events.filter(event=>event.state==='RECORDED').length;
  const blockedCount=events.length-recordedCount;
  const ledgerReady=provenanceReady&&recordedCount===CONSUMERS.length;

  const ledgerId=stableId([
    clean(invocationProvenance?.provenanceId),
    occurredAtIso,
    ...events.map(event=>`${event.consumer}:${event.eventId}:${event.state}`)
  ],'GCAL');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_78_GOVERNED_CONSUMER_INVOCATION_AUDIT_EVENT_TEMPORAL_LEDGER',
    version:'3.0-m2.78',
    status:ledgerReady?'RECORDED':'BLOCKED',
    ledgerState:ledgerReady?'AUDIT_READY':'BLOCKED',
    ledgerId,
    occurredAt:occurredAtIso,
    provenanceId:clean(invocationProvenance?.provenanceId),
    runtimeId:clean(invocationProvenance?.runtimeId),
    contextId:clean(invocationProvenance?.contextId),
    propertyId:clean(invocationProvenance?.propertyId),
    basis:'M2.77_GOVERNED_CONSUMER_CONTEXT_INVOCATION_PROVENANCE',
    events:Object.freeze(events),
    recordedCount,
    blockedCount,
    consumerCount:CONSUMERS.length,
    attributable:true,
    reproducible:true,
    temporal:true,
    readOnly:true,
    appendOnly:true,
    propertyScoped:true,
    executionAuthority:false,
    canonicalMutation:false,
    governedMutation:false,
    automaticCanonicalWrites:false
  });
}
