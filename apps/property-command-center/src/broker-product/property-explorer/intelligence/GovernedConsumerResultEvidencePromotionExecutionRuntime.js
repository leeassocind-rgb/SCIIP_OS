// SCIIP Explorer 3.0 — M2.86 REPAIRED
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
function stableId(parts,prefix='GPEX'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}
export function buildGovernedConsumerResultEvidencePromotionExecutionRuntime(authorizationRuntime={},executionRequests={}){
  const rows=Array.isArray(authorizationRuntime?.records)?authorizationRuntime.records:[];
  const upstreamReady=
    authorizationRuntime?.status==='READY'&&
    authorizationRuntime?.authorizationState==='PROMOTION_AUTHORIZATION_READY'&&
    authorizationRuntime?.promotionAuthority===false&&
    authorizationRuntime?.canonicalWriteAuthority===false&&
    authorizationRuntime?.governedMutationAuthority===false&&
    authorizationRuntime?.readOnly===true&&
    authorizationRuntime?.appendOnly===true&&
    authorizationRuntime?.executionAuthority===false;
  const records=CONSUMERS.map(consumer=>{
    const a=rows.find(r=>r?.consumer===consumer), req=executionRequests?.[consumer];
    const requested=req===true||(typeof req==='object'&&req?.execute===true);
    const requestId=clean(typeof req==='object'?req?.requestId:undefined,requested?`REQUEST-${consumer}`:'UNREQUESTED');
    const authorized=upstreamReady&&a?.state==='AUTHORIZED'&&a?.authorized===true&&
      a?.promotionAuthority===false&&a?.promotionExecuted===false&&
      a?.canonicalWriteAuthorized===false&&a?.governedMutationAuthorized===false&&
      a?.readOnly===true&&a?.appendOnly===true&&a?.executionAuthority===false;
    const state=!upstreamReady?'BLOCKED':
      a?.state==='DENIED'?'DENIED':
      a?.state==='REJECTED'?'REJECTED':
      !authorized?'NOT_AUTHORIZED':
      !requested?'AWAITING_EXECUTION_REQUEST':'EXECUTED_APPEND_ONLY';
    const executionId=stableId([
      clean(a?.authorizationId),clean(a?.promotionId),clean(a?.verificationId),
      clean(a?.resultDigest),clean(a?.evidenceDigest),clean(a?.propertyId),
      clean(a?.contextId),requestId,state
    ],'GPEX');
    const artifactId=state==='EXECUTED_APPEND_ONLY'
      ?stableId([executionId,clean(a?.promotionId),clean(a?.resultDigest),clean(a?.evidenceDigest)],'GPAR')
      :'UNAVAILABLE';
    return Object.freeze({
      consumer,executionId,executionKey:`M2.86:${clean(authorizationRuntime?.propertyId)}:${consumer}`,
      artifactId,requestId,
      authorizationId:clean(a?.authorizationId),authorizationKey:clean(a?.authorizationKey),
      promotionId:clean(a?.promotionId),promotionKey:clean(a?.promotionKey),
      verificationId:clean(a?.verificationId),verificationKey:clean(a?.verificationKey),
      evidenceBindingId:clean(a?.evidenceBindingId),evidenceBindingKey:clean(a?.evidenceBindingKey),
      captureId:clean(a?.captureId),captureKey:clean(a?.captureKey),
      envelopeId:clean(a?.envelopeId),envelopeKey:clean(a?.envelopeKey),
      resultProvenanceId:clean(a?.resultProvenanceId),resultKey:clean(a?.resultKey),
      resultDigest:clean(a?.resultDigest),evidenceDigest:clean(a?.evidenceDigest),
      eventId:clean(a?.eventId),invocationId:clean(a?.invocationId),provenanceKey:clean(a?.provenanceKey),
      runtimeId:clean(a?.runtimeId),contextId:clean(a?.contextId),
      propertyId:clean(a?.propertyId||authorizationRuntime?.propertyId),
      consumerBindingKey:clean(a?.consumerBindingKey),occurredAt:clean(a?.occurredAt,'UNRECORDED'),
      state,authorized,explicitlyRequested:requested,executed:state==='EXECUTED_APPEND_ONLY',
      executionMode:state==='EXECUTED_APPEND_ONLY'?'APPEND_ONLY_ARTIFACT':'NONE',
      canonicalWrite:false,governedMutation:false,baseCanonicalOverwrite:false,
      attributable:true,reproducible:true,temporal:true,readOnly:true,appendOnly:true,executionAuthority:false
    });
  });
  const count=s=>records.filter(r=>r.state===s).length;
  const blockedCount=count('BLOCKED'), ready=upstreamReady&&blockedCount===0;
  const runtimeId=stableId([clean(authorizationRuntime?.runtimeId),...records.map(r=>`${r.consumer}:${r.executionId}:${r.state}`)],'GPER');
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_86_GOVERNED_CONSUMER_RESULT_EVIDENCE_PROMOTION_EXECUTION_RUNTIME',
    version:'3.0-m2.86-repaired',status:ready?'READY':'BLOCKED',
    executionState:ready?'PROMOTION_EXECUTION_READY':'BLOCKED',runtimeId,
    authorizationRuntimeId:clean(authorizationRuntime?.runtimeId),
    promotionRuntimeId:clean(authorizationRuntime?.promotionRuntimeId),
    verificationRuntimeId:clean(authorizationRuntime?.verificationRuntimeId),
    evidenceBindingRuntimeId:clean(authorizationRuntime?.evidenceBindingRuntimeId),
    captureRuntimeId:clean(authorizationRuntime?.captureRuntimeId),
    envelopeSetId:clean(authorizationRuntime?.envelopeSetId),
    resultProvenanceId:clean(authorizationRuntime?.resultProvenanceId),
    ledgerId:clean(authorizationRuntime?.ledgerId),contextId:clean(authorizationRuntime?.contextId),
    propertyId:clean(authorizationRuntime?.propertyId),
    basis:'M2.85_GOVERNED_CONSUMER_RESULT_EVIDENCE_PROMOTION_AUTHORIZATION_RUNTIME',
    records:Object.freeze(records),executedCount:count('EXECUTED_APPEND_ONLY'),
    awaitingExecutionRequestCount:count('AWAITING_EXECUTION_REQUEST'),
    notAuthorizedCount:count('NOT_AUTHORIZED'),deniedCount:count('DENIED'),
    rejectedCount:count('REJECTED'),blockedCount,consumerCount:CONSUMERS.length,
    executionArtifactsAppendOnly:true,canonicalWriteAuthority:false,governedMutationAuthority:false,
    baseCanonicalOverwriteAuthority:false,automaticCanonicalWrites:false,
    attributable:true,reproducible:true,temporal:true,readOnly:true,appendOnly:true,
    propertyScoped:true,executionAuthority:false,canonicalMutation:false,governedMutation:false
  });
}
