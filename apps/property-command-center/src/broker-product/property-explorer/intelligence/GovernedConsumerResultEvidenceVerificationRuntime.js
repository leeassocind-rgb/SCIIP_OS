// SCIIP Explorer 3.0 — M2.83
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCEV'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function isIsoTimestamp(value){
  if(typeof value!=='string'||!value.trim())return false;
  const d=new Date(value);
  return !Number.isNaN(d.getTime())&&d.toISOString()===value;
}

export function buildGovernedConsumerResultEvidenceVerificationRuntime(
  evidenceBindingRuntime={}
){
  const bindings=Array.isArray(evidenceBindingRuntime?.records)?evidenceBindingRuntime.records:[];
  const upstreamReady=
    evidenceBindingRuntime?.status==='READY'&&
    evidenceBindingRuntime?.bindingState==='EVIDENCE_BINDING_READY'&&
    evidenceBindingRuntime?.readOnly===true&&
    evidenceBindingRuntime?.appendOnly===true&&
    evidenceBindingRuntime?.executionAuthority===false;

  const records=CONSUMERS.map(consumer=>{
    const binding=bindings.find(item=>item?.consumer===consumer);

    const lineageComplete=
      clean(binding?.captureKey).startsWith('M2.81:')&&
      clean(binding?.envelopeKey).startsWith('M2.80:')&&
      clean(binding?.resultKey).startsWith('M2.79:')&&
      clean(binding?.provenanceKey).startsWith('M2.77:')&&
      clean(binding?.consumerBindingKey).startsWith('M2.76:');

    const identityComplete=
      clean(binding?.propertyId)!=='UNAVAILABLE'&&
      clean(binding?.contextId)!=='UNAVAILABLE'&&
      clean(binding?.runtimeId)!=='UNAVAILABLE';

    const temporalValid=isIsoTimestamp(binding?.occurredAt);

    const hasResult=binding?.resultCaptured===true&&clean(binding?.resultDigest)!=='UNAVAILABLE';
    const hasEvidence=binding?.evidenceBound===true&&
      Array.isArray(binding?.evidenceRefs)&&
      binding.evidenceRefs.length>0&&
      clean(binding?.evidenceDigest)!=='UNAVAILABLE';

    const evidenceRefsValid=hasEvidence&&binding.evidenceRefs.every(ref=>
      clean(ref?.evidenceRefId)!=='UNAVAILABLE'&&
      clean(ref?.sourceType)!=='UNAVAILABLE'&&
      clean(ref?.sourceId)!=='UNAVAILABLE'&&
      clean(ref?.lineageKey)!=='UNAVAILABLE'&&
      ref?.readOnly===true
    );

    const upstreamSealed=binding?.state==='SEALED'&&binding?.sealed===true;
    const tamperDetected=Boolean(
      binding?.tampered===true||
      binding?.digestMismatch===true||
      binding?.identityMismatch===true
    );

    const verified=
      upstreamReady&&
      upstreamSealed&&
      hasResult&&
      hasEvidence&&
      evidenceRefsValid&&
      lineageComplete&&
      identityComplete&&
      temporalValid&&
      !tamperDetected&&
      binding?.readOnly===true&&
      binding?.appendOnly===true&&
      binding?.executionAuthority===false;

    const waitingForResult=upstreamReady&&!hasResult&&!tamperDetected;
    const waitingForEvidence=upstreamReady&&hasResult&&!hasEvidence&&!tamperDetected;

    const state=!upstreamReady
      ?'BLOCKED'
      :tamperDetected
        ?'REJECTED'
        :verified
          ?'VERIFIED'
          :waitingForResult
            ?'AWAITING_RESULT'
            :waitingForEvidence
              ?'PENDING_EVIDENCE'
              :'REVIEW_REQUIRED';

    const verificationId=stableId([
      clean(binding?.bindingId),
      clean(binding?.captureId),
      clean(binding?.resultDigest),
      clean(binding?.evidenceDigest),
      clean(binding?.propertyId),
      clean(binding?.contextId),
      clean(binding?.occurredAt,'UNRECORDED'),
      state
    ],'GCEV');

    return Object.freeze({
      consumer,
      verificationId,
      verificationKey:`M2.83:${clean(evidenceBindingRuntime?.propertyId)}:${consumer}`,
      evidenceBindingId:clean(binding?.bindingId),
      evidenceBindingKey:clean(binding?.bindingKey),
      captureId:clean(binding?.captureId),
      captureKey:clean(binding?.captureKey),
      envelopeId:clean(binding?.envelopeId),
      envelopeKey:clean(binding?.envelopeKey),
      resultProvenanceId:clean(binding?.resultProvenanceId),
      resultKey:clean(binding?.resultKey),
      resultDigest:clean(binding?.resultDigest),
      evidenceDigest:clean(binding?.evidenceDigest),
      eventId:clean(binding?.eventId),
      invocationId:clean(binding?.invocationId),
      provenanceKey:clean(binding?.provenanceKey),
      runtimeId:clean(binding?.runtimeId),
      contextId:clean(binding?.contextId),
      propertyId:clean(binding?.propertyId||evidenceBindingRuntime?.propertyId),
      consumerBindingKey:clean(binding?.consumerBindingKey),
      occurredAt:clean(binding?.occurredAt,'UNRECORDED'),
      evidenceCount:Array.isArray(binding?.evidenceRefs)?binding.evidenceRefs.length:0,
      state,
      verified,
      lineageComplete,
      identityComplete,
      temporalValid,
      evidenceRefsValid,
      tamperDetected,
      attributable:true,
      reproducible:true,
      readOnly:true,
      appendOnly:true,
      executionAuthority:false
    });
  });

  const verifiedCount=records.filter(r=>r.state==='VERIFIED').length;
  const awaitingResultCount=records.filter(r=>r.state==='AWAITING_RESULT').length;
  const pendingEvidenceCount=records.filter(r=>r.state==='PENDING_EVIDENCE').length;
  const reviewRequiredCount=records.filter(r=>r.state==='REVIEW_REQUIRED').length;
  const rejectedCount=records.filter(r=>r.state==='REJECTED').length;
  const blockedCount=records.filter(r=>r.state==='BLOCKED').length;

  const ready=upstreamReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(evidenceBindingRuntime?.runtimeId),
    ...records.map(r=>`${r.consumer}:${r.verificationId}:${r.state}`)
  ],'GEVR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_83_GOVERNED_CONSUMER_RESULT_EVIDENCE_VERIFICATION_RUNTIME',
    version:'3.0-m2.83',
    status:ready?'READY':'BLOCKED',
    verificationState:ready?'EVIDENCE_VERIFICATION_READY':'BLOCKED',
    runtimeId,
    evidenceBindingRuntimeId:clean(evidenceBindingRuntime?.runtimeId),
    captureRuntimeId:clean(evidenceBindingRuntime?.captureRuntimeId),
    envelopeSetId:clean(evidenceBindingRuntime?.envelopeSetId),
    resultProvenanceId:clean(evidenceBindingRuntime?.resultProvenanceId),
    ledgerId:clean(evidenceBindingRuntime?.ledgerId),
    contextId:clean(evidenceBindingRuntime?.contextId),
    propertyId:clean(evidenceBindingRuntime?.propertyId),
    basis:'M2.82_GOVERNED_CONSUMER_RESULT_EVIDENCE_BINDING_RUNTIME',
    records:Object.freeze(records),
    verifiedCount,
    awaitingResultCount,
    pendingEvidenceCount,
    reviewRequiredCount,
    rejectedCount,
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
