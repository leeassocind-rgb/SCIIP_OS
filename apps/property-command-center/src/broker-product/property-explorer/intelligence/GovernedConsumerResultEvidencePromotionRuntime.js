// SCIIP Explorer 3.0 — M2.84
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCRP'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedConsumerResultEvidencePromotionRuntime(
  evidenceVerificationRuntime={}
){
  const verificationRecords=Array.isArray(evidenceVerificationRuntime?.records)
    ?evidenceVerificationRuntime.records:[];
  const upstreamReady=
    evidenceVerificationRuntime?.status==='READY'&&
    evidenceVerificationRuntime?.verificationState==='EVIDENCE_VERIFICATION_READY'&&
    evidenceVerificationRuntime?.readOnly===true&&
    evidenceVerificationRuntime?.appendOnly===true&&
    evidenceVerificationRuntime?.executionAuthority===false;

  const records=CONSUMERS.map(consumer=>{
    const verification=verificationRecords.find(item=>item?.consumer===consumer);

    const lineageComplete=
      clean(verification?.evidenceBindingKey).startsWith('M2.82:')&&
      clean(verification?.captureKey).startsWith('M2.81:')&&
      clean(verification?.envelopeKey).startsWith('M2.80:')&&
      clean(verification?.resultKey).startsWith('M2.79:')&&
      clean(verification?.provenanceKey).startsWith('M2.77:')&&
      clean(verification?.consumerBindingKey).startsWith('M2.76:');

    const identityComplete=
      clean(verification?.propertyId)!=='UNAVAILABLE'&&
      clean(verification?.contextId)!=='UNAVAILABLE'&&
      clean(verification?.runtimeId)!=='UNAVAILABLE';

    const verified=
      upstreamReady&&
      verification?.state==='VERIFIED'&&
      verification?.verified===true&&
      verification?.lineageComplete===true&&
      verification?.identityComplete===true&&
      verification?.temporalValid===true&&
      verification?.evidenceRefsValid===true&&
      verification?.tamperDetected===false&&
      verification?.readOnly===true&&
      verification?.appendOnly===true&&
      verification?.executionAuthority===false;

    const eligible=verified&&lineageComplete&&identityComplete;

    const state=!upstreamReady
      ?'BLOCKED'
      :verification?.state==='REJECTED'
        ?'REJECTED'
        :eligible
          ?'ELIGIBLE'
          :verification?.state==='VERIFIED'
            ?'REVIEW_REQUIRED'
            :'NOT_READY';

    const promotionId=stableId([
      clean(verification?.verificationId),
      clean(verification?.evidenceBindingId),
      clean(verification?.resultDigest),
      clean(verification?.evidenceDigest),
      clean(verification?.propertyId),
      clean(verification?.contextId),
      state
    ],'GPRC');

    return Object.freeze({
      consumer,
      promotionId,
      promotionKey:`M2.84:${clean(evidenceVerificationRuntime?.propertyId)}:${consumer}`,
      verificationId:clean(verification?.verificationId),
      verificationKey:clean(verification?.verificationKey),
      evidenceBindingId:clean(verification?.evidenceBindingId),
      evidenceBindingKey:clean(verification?.evidenceBindingKey),
      captureId:clean(verification?.captureId),
      captureKey:clean(verification?.captureKey),
      envelopeId:clean(verification?.envelopeId),
      envelopeKey:clean(verification?.envelopeKey),
      resultProvenanceId:clean(verification?.resultProvenanceId),
      resultKey:clean(verification?.resultKey),
      resultDigest:clean(verification?.resultDigest),
      evidenceDigest:clean(verification?.evidenceDigest),
      eventId:clean(verification?.eventId),
      invocationId:clean(verification?.invocationId),
      provenanceKey:clean(verification?.provenanceKey),
      runtimeId:clean(verification?.runtimeId),
      contextId:clean(verification?.contextId),
      propertyId:clean(verification?.propertyId||evidenceVerificationRuntime?.propertyId),
      consumerBindingKey:clean(verification?.consumerBindingKey),
      occurredAt:clean(verification?.occurredAt,'UNRECORDED'),
      state,
      eligible,
      promotionAuthority:false,
      promoted:false,
      lineageComplete,
      identityComplete,
      attributable:true,
      reproducible:true,
      temporal:true,
      readOnly:true,
      appendOnly:true,
      executionAuthority:false
    });
  });

  const eligibleCount=records.filter(r=>r.state==='ELIGIBLE').length;
  const notReadyCount=records.filter(r=>r.state==='NOT_READY').length;
  const reviewRequiredCount=records.filter(r=>r.state==='REVIEW_REQUIRED').length;
  const rejectedCount=records.filter(r=>r.state==='REJECTED').length;
  const blockedCount=records.filter(r=>r.state==='BLOCKED').length;
  const ready=upstreamReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(evidenceVerificationRuntime?.runtimeId),
    ...records.map(r=>`${r.consumer}:${r.promotionId}:${r.state}`)
  ],'GPRR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_84_GOVERNED_CONSUMER_RESULT_EVIDENCE_PROMOTION_RUNTIME',
    version:'3.0-m2.84',
    status:ready?'READY':'BLOCKED',
    promotionState:ready?'PROMOTION_ELIGIBILITY_READY':'BLOCKED',
    runtimeId,
    verificationRuntimeId:clean(evidenceVerificationRuntime?.runtimeId),
    evidenceBindingRuntimeId:clean(evidenceVerificationRuntime?.evidenceBindingRuntimeId),
    captureRuntimeId:clean(evidenceVerificationRuntime?.captureRuntimeId),
    envelopeSetId:clean(evidenceVerificationRuntime?.envelopeSetId),
    resultProvenanceId:clean(evidenceVerificationRuntime?.resultProvenanceId),
    ledgerId:clean(evidenceVerificationRuntime?.ledgerId),
    contextId:clean(evidenceVerificationRuntime?.contextId),
    propertyId:clean(evidenceVerificationRuntime?.propertyId),
    basis:'M2.83_GOVERNED_CONSUMER_RESULT_EVIDENCE_VERIFICATION_RUNTIME',
    records:Object.freeze(records),
    eligibleCount,
    notReadyCount,
    reviewRequiredCount,
    rejectedCount,
    blockedCount,
    consumerCount:CONSUMERS.length,
    promotionAuthority:false,
    promotedCount:0,
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
