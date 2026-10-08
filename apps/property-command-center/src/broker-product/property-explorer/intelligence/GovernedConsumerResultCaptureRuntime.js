// SCIIP Explorer 3.0 — M2.81
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCRC'){
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

function digest(value,prefix='RSLT'){
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
    readOnly:true
  })));
}

export function buildGovernedConsumerResultCaptureRuntime({
  resultEvidenceEnvelope={},
  consumerResults={},
  consumerEvidence={}
}={}){
  const envelopes=Array.isArray(resultEvidenceEnvelope?.envelopes)?resultEvidenceEnvelope.envelopes:[];
  const envelopeReady=
    resultEvidenceEnvelope?.status==='READY'&&
    resultEvidenceEnvelope?.envelopeState==='EVIDENCE_ENVELOPE_READY'&&
    resultEvidenceEnvelope?.readOnly===true&&
    resultEvidenceEnvelope?.appendOnly===true&&
    resultEvidenceEnvelope?.executionAuthority===false;

  const records=CONSUMERS.map(consumer=>{
    const envelope=envelopes.find(item=>item?.consumer===consumer);
    const baseReady=
      envelopeReady&&
      envelope&&
      envelope?.state!=='BLOCKED'&&
      envelope?.readOnly===true&&
      envelope?.appendOnly===true&&
      envelope?.executionAuthority===false;

    const hasResult=
      consumerResults&&
      Object.prototype.hasOwnProperty.call(consumerResults,consumer)&&
      consumerResults[consumer]!==undefined&&
      consumerResults[consumer]!==null;

    const evidenceRefs=normalizeEvidenceRefs(consumerEvidence?.[consumer]);
    const hasEvidence=evidenceRefs.length>0;
    const resultDigest=hasResult?digest(consumerResults[consumer],'RSLT'):'UNAVAILABLE';
    const evidenceDigest=hasEvidence?digest(evidenceRefs,'EVDG'):'UNAVAILABLE';

    const state=!baseReady
      ?'BLOCKED'
      :!hasResult
        ?'AWAITING_RESULT'
        :hasEvidence
          ?'SEALED'
          :'PENDING_EVIDENCE';

    const captureId=stableId([
      clean(envelope?.envelopeId),
      clean(envelope?.resultProvenanceId),
      resultDigest,
      evidenceDigest
    ],'GCCR');

    return Object.freeze({
      consumer,
      captureId,
      captureKey:`M2.81:${clean(resultEvidenceEnvelope?.propertyId)}:${consumer}`,
      envelopeId:clean(envelope?.envelopeId),
      envelopeKey:clean(envelope?.envelopeKey),
      resultProvenanceId:clean(envelope?.resultProvenanceId),
      resultKey:clean(envelope?.resultKey),
      resultDigest,
      evidenceDigest,
      evidenceRefs,
      evidenceCount:evidenceRefs.length,
      eventId:clean(envelope?.eventId),
      invocationId:clean(envelope?.invocationId),
      provenanceKey:clean(envelope?.provenanceKey),
      runtimeId:clean(envelope?.runtimeId||resultEvidenceEnvelope?.runtimeId),
      contextId:clean(envelope?.contextId||resultEvidenceEnvelope?.contextId),
      propertyId:clean(envelope?.propertyId||resultEvidenceEnvelope?.propertyId),
      bindingKey:clean(envelope?.bindingKey),
      occurredAt:clean(envelope?.occurredAt,'UNRECORDED'),
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

  const capturedCount=records.filter(r=>r.resultCaptured).length;
  const sealedCount=records.filter(r=>r.state==='SEALED').length;
  const pendingEvidenceCount=records.filter(r=>r.state==='PENDING_EVIDENCE').length;
  const awaitingResultCount=records.filter(r=>r.state==='AWAITING_RESULT').length;
  const blockedCount=records.filter(r=>r.state==='BLOCKED').length;
  const ready=envelopeReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(resultEvidenceEnvelope?.envelopeSetId),
    ...records.map(r=>`${r.consumer}:${r.captureId}:${r.state}`)
  ],'GCRT');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_81_GOVERNED_CONSUMER_RESULT_CAPTURE_RUNTIME',
    version:'3.0-m2.81',
    status:ready?'READY':'BLOCKED',
    captureState:ready?'RESULT_CAPTURE_READY':'BLOCKED',
    runtimeId,
    envelopeSetId:clean(resultEvidenceEnvelope?.envelopeSetId),
    resultProvenanceId:clean(resultEvidenceEnvelope?.resultProvenanceId),
    ledgerId:clean(resultEvidenceEnvelope?.ledgerId),
    contextId:clean(resultEvidenceEnvelope?.contextId),
    propertyId:clean(resultEvidenceEnvelope?.propertyId),
    basis:'M2.80_GOVERNED_CONSUMER_RESULT_EVIDENCE_ENVELOPE',
    records:Object.freeze(records),
    capturedCount,
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
