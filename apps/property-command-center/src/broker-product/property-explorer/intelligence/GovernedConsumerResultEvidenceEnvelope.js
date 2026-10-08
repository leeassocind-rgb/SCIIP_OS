// SCIIP Explorer 3.0 — M2.80
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCEE'){
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

function digest(value,prefix='EV'){
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

export function buildGovernedConsumerResultEvidenceEnvelope(
  resultProvenance={},
  consumerResults={},
  consumerEvidence={}
){
  const provenanceRecords=Array.isArray(resultProvenance?.records)?resultProvenance.records:[];
  const provenanceReady=
    resultProvenance?.status==='READY'&&
    resultProvenance?.provenanceState==='RESULT_PROVENANCE_READY'&&
    resultProvenance?.attributable===true&&
    resultProvenance?.reproducible===true&&
    resultProvenance?.readOnly===true&&
    resultProvenance?.appendOnly===true&&
    resultProvenance?.executionAuthority===false;

  const envelopes=CONSUMERS.map(consumer=>{
    const provenance=provenanceRecords.find(item=>item?.consumer===consumer);
    const provenanceRecordReady=
      provenanceReady&&
      provenance?.state==='PROVENANCE_READY'&&
      provenance?.readOnly===true&&
      provenance?.appendOnly===true&&
      provenance?.executionAuthority===false;

    const hasResult=
      consumerResults&&
      Object.prototype.hasOwnProperty.call(consumerResults,consumer)&&
      consumerResults[consumer]!==undefined&&
      consumerResults[consumer]!==null;

    const evidenceRefs=normalizeEvidenceRefs(consumerEvidence?.[consumer]);
    const evidenceReady=hasResult&&evidenceRefs.length>0;
    const resultDigest=hasResult?digest(consumerResults[consumer],'RSLT'):'UNAVAILABLE';
    const evidenceDigest=evidenceReady?digest(evidenceRefs,'EVDG'):'UNAVAILABLE';

    const state=!provenanceRecordReady
      ?'BLOCKED'
      :!hasResult
        ?'AWAITING_RESULT'
        :!evidenceReady
          ?'AWAITING_EVIDENCE'
          :'SEALED';

    const envelopeId=stableId([
      clean(provenance?.resultId),
      clean(provenance?.eventId),
      clean(provenance?.invocationId),
      resultDigest,
      evidenceDigest
    ],'GCEN');

    return Object.freeze({
      consumer,
      envelopeId,
      envelopeKey:`M2.80:${clean(resultProvenance?.propertyId)}:${consumer}`,
      resultProvenanceId:clean(provenance?.resultId),
      resultKey:clean(provenance?.resultKey),
      resultDigest,
      evidenceDigest,
      evidenceRefs,
      evidenceCount:evidenceRefs.length,
      eventId:clean(provenance?.eventId),
      invocationId:clean(provenance?.invocationId),
      provenanceKey:clean(provenance?.provenanceKey),
      runtimeId:clean(provenance?.runtimeId||resultProvenance?.runtimeId),
      contextId:clean(provenance?.contextId||resultProvenance?.contextId),
      propertyId:clean(provenance?.propertyId||resultProvenance?.propertyId),
      bindingKey:clean(provenance?.bindingKey),
      occurredAt:clean(provenance?.occurredAt||resultProvenance?.occurredAt,'UNRECORDED'),
      state,
      resultCaptured:hasResult,
      evidenceBound:evidenceReady,
      sealed:state==='SEALED',
      attributable:true,
      reproducible:true,
      temporal:true,
      readOnly:true,
      appendOnly:true,
      executionAuthority:false
    });
  });

  const sealedCount=envelopes.filter(e=>e.state==='SEALED').length;
  const awaitingResultCount=envelopes.filter(e=>e.state==='AWAITING_RESULT').length;
  const awaitingEvidenceCount=envelopes.filter(e=>e.state==='AWAITING_EVIDENCE').length;
  const blockedCount=envelopes.filter(e=>e.state==='BLOCKED').length;
  const ready=provenanceReady&&blockedCount===0;

  const envelopeSetId=stableId([
    clean(resultProvenance?.provenanceId),
    ...envelopes.map(e=>`${e.consumer}:${e.envelopeId}:${e.state}`)
  ],'GCES');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_80_GOVERNED_CONSUMER_RESULT_EVIDENCE_ENVELOPE',
    version:'3.0-m2.80',
    status:ready?'READY':'BLOCKED',
    envelopeState:ready?'EVIDENCE_ENVELOPE_READY':'BLOCKED',
    envelopeSetId,
    resultProvenanceId:clean(resultProvenance?.provenanceId),
    ledgerId:clean(resultProvenance?.ledgerId),
    runtimeId:clean(resultProvenance?.runtimeId),
    contextId:clean(resultProvenance?.contextId),
    propertyId:clean(resultProvenance?.propertyId),
    basis:'M2.79_GOVERNED_CONSUMER_INVOCATION_OUTCOME_RESULT_PROVENANCE',
    envelopes:Object.freeze(envelopes),
    sealedCount,
    awaitingResultCount,
    awaitingEvidenceCount,
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
