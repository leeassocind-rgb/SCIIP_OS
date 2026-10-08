// SCIIP Explorer 3.0 — M2.79
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCOR'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function canonicalize(value){
  if(value===null||value===undefined)return '';
  if(typeof value==='string')return value;
  try{return JSON.stringify(value,Object.keys(value||{}).sort());}
  catch{return String(value);}
}

function digest(value){
  const basis=canonicalize(value);
  if(!basis)return 'UNAVAILABLE';
  return stableId([basis],'RSLT');
}

export function buildGovernedConsumerInvocationResultProvenance(
  invocationAuditLedger={},
  consumerResults={}
){
  const events=Array.isArray(invocationAuditLedger?.events)?invocationAuditLedger.events:[];
  const ledgerReady=
    invocationAuditLedger?.status==='RECORDED'&&
    invocationAuditLedger?.ledgerState==='AUDIT_READY'&&
    invocationAuditLedger?.attributable===true&&
    invocationAuditLedger?.reproducible===true&&
    invocationAuditLedger?.readOnly===true&&
    invocationAuditLedger?.appendOnly===true&&
    invocationAuditLedger?.executionAuthority===false;

  const records=CONSUMERS.map(consumer=>{
    const event=events.find(item=>item?.consumer===consumer);
    const eventReady=
      ledgerReady&&
      event?.state==='RECORDED'&&
      event?.auditState==='APPEND_ONLY'&&
      event?.readOnly===true&&
      event?.appendOnly===true&&
      event?.executionAuthority===false;

    const hasResult=
      consumerResults&&
      Object.prototype.hasOwnProperty.call(consumerResults,consumer)&&
      consumerResults[consumer]!==undefined&&
      consumerResults[consumer]!==null;

    const resultDigest=hasResult?digest(consumerResults[consumer]):'UNAVAILABLE';
    const resultId=stableId([
      clean(event?.eventId),
      clean(event?.invocationId),
      clean(event?.provenanceKey),
      resultDigest
    ],'GCRS');

    return Object.freeze({
      consumer,
      resultId,
      resultKey:`M2.79:${clean(invocationAuditLedger?.propertyId)}:${consumer}`,
      eventId:clean(event?.eventId),
      eventKey:clean(event?.eventKey),
      occurredAt:clean(event?.occurredAt,'UNRECORDED'),
      invocationId:clean(event?.invocationId),
      provenanceKey:clean(event?.provenanceKey),
      runtimeId:clean(event?.runtimeId||invocationAuditLedger?.runtimeId),
      contextId:clean(event?.contextId||invocationAuditLedger?.contextId),
      propertyId:clean(event?.propertyId||invocationAuditLedger?.propertyId),
      bindingKey:clean(event?.bindingKey),
      state:eventReady?'PROVENANCE_READY':'BLOCKED',
      resultState:eventReady?(hasResult?'RESULT_CAPTURED':'AWAITING_CONSUMER_RESULT'):'BLOCKED',
      resultDigest,
      resultCaptured:hasResult,
      attributable:true,
      reproducible:true,
      temporal:true,
      readOnly:true,
      appendOnly:true,
      executionAuthority:false
    });
  });

  const provenanceReadyCount=records.filter(record=>record.state==='PROVENANCE_READY').length;
  const capturedCount=records.filter(record=>record.resultCaptured===true).length;
  const awaitingCount=records.filter(record=>record.resultState==='AWAITING_CONSUMER_RESULT').length;
  const blockedCount=records.filter(record=>record.state==='BLOCKED').length;
  const ready=ledgerReady&&provenanceReadyCount===CONSUMERS.length;

  const provenanceId=stableId([
    clean(invocationAuditLedger?.ledgerId),
    ...records.map(record=>`${record.consumer}:${record.resultId}:${record.state}:${record.resultState}`)
  ],'GCOP');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_79_GOVERNED_CONSUMER_INVOCATION_OUTCOME_RESULT_PROVENANCE',
    version:'3.0-m2.79',
    status:ready?'READY':'BLOCKED',
    provenanceState:ready?'RESULT_PROVENANCE_READY':'BLOCKED',
    provenanceId,
    ledgerId:clean(invocationAuditLedger?.ledgerId),
    occurredAt:clean(invocationAuditLedger?.occurredAt,'UNRECORDED'),
    runtimeId:clean(invocationAuditLedger?.runtimeId),
    contextId:clean(invocationAuditLedger?.contextId),
    propertyId:clean(invocationAuditLedger?.propertyId),
    basis:'M2.78_GOVERNED_CONSUMER_INVOCATION_AUDIT_EVENT_TEMPORAL_LEDGER',
    records:Object.freeze(records),
    provenanceReadyCount,
    capturedCount,
    awaitingCount,
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
