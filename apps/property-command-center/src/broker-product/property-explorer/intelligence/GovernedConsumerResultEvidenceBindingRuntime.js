// SCIIP Explorer 3.0 — M2.82
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCEB'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function canonicalize(value){
  if(value===null||value===undefined)return '';
  if(typeof value==='string')return value;
  if(Array.isArray(value))return JSON.stringify(value);
  try{
    const sorted={};
    Object.keys(value||{}).sort().forEach(k=>{sorted[k]=value[k];});
    return JSON.stringify(sorted);
  }catch{return String(value);}
}

function digest(value,prefix='DIG'){
  const basis=canonicalize(value);
  if(!basis)return 'UNAVAILABLE';
  return stableId([basis],prefix);
}

function normalizeEvidenceRefs(refs){
  if(!Array.isArray(refs))return Object.freeze([]);
  return Object.freeze(refs.map((ref,index)=>Object.freeze({
    evidenceRefId:clean(ref?.evidenceRefId||ref?.id,`EVIDENCE-${index+1}`),
    sourceType:clean(ref?.sourceType),
    sourceId:clean(ref?.sourceId),
    sourceRecordKey:clean(ref?.sourceRecordKey),
    citation:clean(ref?.citation),
    lineageKey:clean(ref?.lineageKey),
    temporalKey:clean(ref?.temporalKey),
    readOnly:true
  })));
}

export function buildGovernedConsumerResultEvidenceBindingRuntime({
  resultCaptureRuntime={},
  consumerEvidence={}
}={}){
  const captureRecords=Array.isArray(resultCaptureRuntime?.records)?resultCaptureRuntime.records:[];
  const runtimeReady=
    resultCaptureRuntime?.status==='READY'&&
    resultCaptureRuntime?.captureState==='RESULT_CAPTURE_READY'&&
    resultCaptureRuntime?.readOnly===true&&
    resultCaptureRuntime?.appendOnly===true&&
    resultCaptureRuntime?.executionAuthority===false;

  const records=CONSUMERS.map(consumer=>{
    const capture=captureRecords.find(item=>item?.consumer===consumer);
    const baseReady=
      runtimeReady&&
      capture&&
      capture?.state!=='BLOCKED'&&
      capture?.readOnly===true&&
      capture?.appendOnly===true&&
      capture?.executionAuthority===false;

    const evidenceRefs=normalizeEvidenceRefs(consumerEvidence?.[consumer]);
    const hasResult=capture?.resultCaptured===true;
    const hasEvidence=evidenceRefs.length>0;
    const evidenceDigest=hasEvidence?digest(evidenceRefs,'EVDG'):'UNAVAILABLE';

    const state=!baseReady
      ?'BLOCKED'
      :!hasResult
        ?'AWAITING_RESULT'
        :hasEvidence
          ?'SEALED'
          :'PENDING_EVIDENCE';

    const bindingId=stableId([
      clean(capture?.captureId),
      clean(capture?.resultDigest),
      evidenceDigest
    ],'GCEB');

    return Object.freeze({
      consumer,
      bindingId,
      bindingKey:`M2.82:${clean(resultCaptureRuntime?.propertyId)}:${consumer}`,
      captureId:clean(capture?.captureId),
      captureKey:clean(capture?.captureKey),
      envelopeId:clean(capture?.envelopeId),
      envelopeKey:clean(capture?.envelopeKey),
      resultProvenanceId:clean(capture?.resultProvenanceId),
      resultKey:clean(capture?.resultKey),
      resultDigest:clean(capture?.resultDigest),
      evidenceDigest,
      evidenceRefs,
      evidenceCount:evidenceRefs.length,
      eventId:clean(capture?.eventId),
      invocationId:clean(capture?.invocationId),
      provenanceKey:clean(capture?.provenanceKey),
      runtimeId:clean(capture?.runtimeId),
      contextId:clean(capture?.contextId),
      propertyId:clean(capture?.propertyId||resultCaptureRuntime?.propertyId),
      consumerBindingKey:clean(capture?.bindingKey),
      occurredAt:clean(capture?.occurredAt,'UNRECORDED'),
      state,
      resultCaptured:hasResult,
      evidenceBound:hasEvidence,
      sealed:state==='SEALED',
      attributable:true,
      reproducible:true,
      temporal:true,
      readOnly:true,
      appendOnly:true,
      executionAuthority:false
    });
  });

  const sealedCount=records.filter(r=>r.state==='SEALED').length;
  const pendingEvidenceCount=records.filter(r=>r.state==='PENDING_EVIDENCE').length;
  const awaitingResultCount=records.filter(r=>r.state==='AWAITING_RESULT').length;
  const blockedCount=records.filter(r=>r.state==='BLOCKED').length;
  const ready=runtimeReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(resultCaptureRuntime?.runtimeId),
    ...records.map(r=>`${r.consumer}:${r.bindingId}:${r.state}`)
  ],'GEBR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_82_GOVERNED_CONSUMER_RESULT_EVIDENCE_BINDING_RUNTIME',
    version:'3.0-m2.82',
    status:ready?'READY':'BLOCKED',
    bindingState:ready?'EVIDENCE_BINDING_READY':'BLOCKED',
    runtimeId,
    captureRuntimeId:clean(resultCaptureRuntime?.runtimeId),
    envelopeSetId:clean(resultCaptureRuntime?.envelopeSetId),
    resultProvenanceId:clean(resultCaptureRuntime?.resultProvenanceId),
    ledgerId:clean(resultCaptureRuntime?.ledgerId),
    contextId:clean(resultCaptureRuntime?.contextId),
    propertyId:clean(resultCaptureRuntime?.propertyId),
    basis:'M2.81_GOVERNED_CONSUMER_RESULT_CAPTURE_RUNTIME',
    records:Object.freeze(records),
    sealedCount,
    pendingEvidenceCount,
    awaitingResultCount,
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
