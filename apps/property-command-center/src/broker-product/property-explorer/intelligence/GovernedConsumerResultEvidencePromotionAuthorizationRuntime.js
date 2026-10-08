// SCIIP Explorer 3.0 — M2.85
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GPAU'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function normalizeDecision(value){
  const v=clean(value,'PENDING').toUpperCase();
  return ['AUTHORIZED','DENIED','PENDING'].includes(v)?v:'PENDING';
}

export function buildGovernedConsumerResultEvidencePromotionAuthorizationRuntime(
  promotionRuntime={},
  authorizationDecisions={}
){
  const promotionRecords=Array.isArray(promotionRuntime?.records)?promotionRuntime.records:[];
  const upstreamReady=
    promotionRuntime?.status==='READY'&&
    promotionRuntime?.promotionState==='PROMOTION_ELIGIBILITY_READY'&&
    promotionRuntime?.promotionAuthority===false&&
    promotionRuntime?.readOnly===true&&
    promotionRuntime?.appendOnly===true&&
    promotionRuntime?.executionAuthority===false;

  const records=CONSUMERS.map(consumer=>{
    const promotion=promotionRecords.find(item=>item?.consumer===consumer);
    const eligible=
      upstreamReady&&
      promotion?.state==='ELIGIBLE'&&
      promotion?.eligible===true&&
      promotion?.promotionAuthority===false&&
      promotion?.promoted===false&&
      promotion?.lineageComplete===true&&
      promotion?.identityComplete===true&&
      promotion?.readOnly===true&&
      promotion?.appendOnly===true&&
      promotion?.executionAuthority===false;

    const rawDecision=authorizationDecisions?.[consumer];
    const decision=normalizeDecision(
      typeof rawDecision==='string'?rawDecision:rawDecision?.decision
    );
    const approverId=clean(
      typeof rawDecision==='object'?rawDecision?.approverId:undefined,
      'UNASSIGNED'
    );
    const reason=clean(
      typeof rawDecision==='object'?rawDecision?.reason:undefined,
      'UNSPECIFIED'
    );

    const explicitAuthorization=eligible&&decision==='AUTHORIZED';
    const explicitDenial=eligible&&decision==='DENIED';

    const state=!upstreamReady
      ?'BLOCKED'
      :promotion?.state==='REJECTED'
        ?'REJECTED'
        :!eligible
          ?'NOT_ELIGIBLE'
          :explicitAuthorization
            ?'AUTHORIZED'
            :explicitDenial
              ?'DENIED'
              :'PENDING_AUTHORIZATION';

    const authorizationId=stableId([
      clean(promotion?.promotionId),
      clean(promotion?.verificationId),
      clean(promotion?.resultDigest),
      clean(promotion?.evidenceDigest),
      clean(promotion?.propertyId),
      clean(promotion?.contextId),
      decision,
      approverId,
      reason,
      state
    ],'GPAU');

    return Object.freeze({
      consumer,
      authorizationId,
      authorizationKey:`M2.85:${clean(promotionRuntime?.propertyId)}:${consumer}`,
      promotionId:clean(promotion?.promotionId),
      promotionKey:clean(promotion?.promotionKey),
      verificationId:clean(promotion?.verificationId),
      verificationKey:clean(promotion?.verificationKey),
      evidenceBindingId:clean(promotion?.evidenceBindingId),
      evidenceBindingKey:clean(promotion?.evidenceBindingKey),
      captureId:clean(promotion?.captureId),
      captureKey:clean(promotion?.captureKey),
      envelopeId:clean(promotion?.envelopeId),
      envelopeKey:clean(promotion?.envelopeKey),
      resultProvenanceId:clean(promotion?.resultProvenanceId),
      resultKey:clean(promotion?.resultKey),
      resultDigest:clean(promotion?.resultDigest),
      evidenceDigest:clean(promotion?.evidenceDigest),
      eventId:clean(promotion?.eventId),
      invocationId:clean(promotion?.invocationId),
      provenanceKey:clean(promotion?.provenanceKey),
      runtimeId:clean(promotion?.runtimeId),
      contextId:clean(promotion?.contextId),
      propertyId:clean(promotion?.propertyId||promotionRuntime?.propertyId),
      consumerBindingKey:clean(promotion?.consumerBindingKey),
      occurredAt:clean(promotion?.occurredAt,'UNRECORDED'),
      decision,
      approverId,
      reason,
      state,
      eligible,
      authorized:state==='AUTHORIZED',
      denied:state==='DENIED',
      promotionAuthority:false,
      promotionExecuted:false,
      canonicalWriteAuthorized:false,
      governedMutationAuthorized:false,
      attributable:true,
      reproducible:true,
      temporal:true,
      readOnly:true,
      appendOnly:true,
      executionAuthority:false
    });
  });

  const authorizedCount=records.filter(r=>r.state==='AUTHORIZED').length;
  const pendingAuthorizationCount=records.filter(r=>r.state==='PENDING_AUTHORIZATION').length;
  const deniedCount=records.filter(r=>r.state==='DENIED').length;
  const notEligibleCount=records.filter(r=>r.state==='NOT_ELIGIBLE').length;
  const rejectedCount=records.filter(r=>r.state==='REJECTED').length;
  const blockedCount=records.filter(r=>r.state==='BLOCKED').length;
  const ready=upstreamReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(promotionRuntime?.runtimeId),
    ...records.map(r=>`${r.consumer}:${r.authorizationId}:${r.state}`)
  ],'GPAR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_85_GOVERNED_CONSUMER_RESULT_EVIDENCE_PROMOTION_AUTHORIZATION_RUNTIME',
    version:'3.0-m2.85',
    status:ready?'READY':'BLOCKED',
    authorizationState:ready?'PROMOTION_AUTHORIZATION_READY':'BLOCKED',
    runtimeId,
    promotionRuntimeId:clean(promotionRuntime?.runtimeId),
    verificationRuntimeId:clean(promotionRuntime?.verificationRuntimeId),
    evidenceBindingRuntimeId:clean(promotionRuntime?.evidenceBindingRuntimeId),
    captureRuntimeId:clean(promotionRuntime?.captureRuntimeId),
    envelopeSetId:clean(promotionRuntime?.envelopeSetId),
    resultProvenanceId:clean(promotionRuntime?.resultProvenanceId),
    ledgerId:clean(promotionRuntime?.ledgerId),
    contextId:clean(promotionRuntime?.contextId),
    propertyId:clean(promotionRuntime?.propertyId),
    basis:'M2.84_GOVERNED_CONSUMER_RESULT_EVIDENCE_PROMOTION_RUNTIME',
    records:Object.freeze(records),
    authorizedCount,
    pendingAuthorizationCount,
    deniedCount,
    notEligibleCount,
    rejectedCount,
    blockedCount,
    consumerCount:CONSUMERS.length,
    promotionAuthority:false,
    promotionExecutedCount:0,
    canonicalWriteAuthority:false,
    governedMutationAuthority:false,
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
