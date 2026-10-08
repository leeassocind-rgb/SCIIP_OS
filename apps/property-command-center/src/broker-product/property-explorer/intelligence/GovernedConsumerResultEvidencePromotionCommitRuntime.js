// SCIIP Explorer 3.0 — M2.87 Governed Promotion Commit Runtime
// Creates deterministic append-only commit candidates. It NEVER mutates canonical truth.
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
function stableId(parts,prefix='GPCC'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}
export function buildGovernedConsumerResultEvidencePromotionCommitRuntime(executionRuntime={}){
  const rows=Array.isArray(executionRuntime?.records)?executionRuntime.records:[];
  const upstreamReady=executionRuntime?.status==='READY'&&
    executionRuntime?.executionState==='PROMOTION_EXECUTION_READY'&&
    executionRuntime?.canonicalWriteAuthority===false&&
    executionRuntime?.governedMutationAuthority===false&&
    executionRuntime?.automaticCanonicalWrites===false&&
    executionRuntime?.readOnly===true&&executionRuntime?.appendOnly===true&&
    executionRuntime?.executionAuthority===false;
  const records=CONSUMERS.map(consumer=>{
    const e=rows.find(r=>r?.consumer===consumer);
    const executed=upstreamReady&&e?.state==='EXECUTED_APPEND_ONLY'&&e?.executed===true&&
      e?.canonicalWrite===false&&e?.governedMutation===false&&e?.readOnly===true&&e?.appendOnly===true;
    const state=!upstreamReady?'BLOCKED':!executed?'AWAITING_PROMOTION_EXECUTION':'AWAITING_COMMIT_APPROVAL';
    const commitCandidateId=stableId([
      clean(e?.artifactId),clean(e?.executionId),clean(e?.authorizationId),clean(e?.promotionId),
      clean(e?.verificationId),clean(e?.resultDigest),clean(e?.evidenceDigest),clean(e?.propertyId),consumer,state
    ],'GPCC');
    return Object.freeze({
      consumer,commitCandidateId,commitCandidateKey:`M2.87:${clean(executionRuntime?.propertyId)}:${consumer}`,
      executionId:clean(e?.executionId),executionKey:clean(e?.executionKey),artifactId:clean(e?.artifactId),
      authorizationId:clean(e?.authorizationId),promotionId:clean(e?.promotionId),verificationId:clean(e?.verificationId),
      evidenceBindingId:clean(e?.evidenceBindingId),captureId:clean(e?.captureId),envelopeId:clean(e?.envelopeId),
      resultProvenanceId:clean(e?.resultProvenanceId),resultDigest:clean(e?.resultDigest),evidenceDigest:clean(e?.evidenceDigest),
      eventId:clean(e?.eventId),invocationId:clean(e?.invocationId),runtimeId:clean(e?.runtimeId),
      contextId:clean(e?.contextId),propertyId:clean(e?.propertyId||executionRuntime?.propertyId),
      consumerBindingKey:clean(e?.consumerBindingKey),occurredAt:clean(e?.occurredAt,'UNRECORDED'),
      state,commitCandidate:executed,commitApproved:false,committed:false,conflictState:'NOT_EVALUATED',
      beforeValue:'CANONICAL_READ_ONLY',afterValue:'PROMOTION_ARTIFACT_PENDING_APPROVAL',
      canonicalWrite:false,governedMutation:false,baseCanonicalOverwrite:false,automaticCommit:false,
      attributable:true,reproducible:true,temporal:true,readOnly:true,appendOnly:true,commitAuthority:false
    });
  });
  const count=s=>records.filter(r=>r.state===s).length;
  const blockedCount=count('BLOCKED'),ready=upstreamReady&&blockedCount===0;
  const runtimeId=stableId([clean(executionRuntime?.runtimeId),...records.map(r=>`${r.consumer}:${r.commitCandidateId}:${r.state}`)],'GPCR');
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_87_GOVERNED_PROMOTION_COMMIT_RUNTIME',version:'3.0-m2.87',
    status:ready?'READY':'BLOCKED',commitState:ready?'COMMIT_CANDIDATE_RUNTIME_READY':'BLOCKED',runtimeId,
    executionRuntimeId:clean(executionRuntime?.runtimeId),authorizationRuntimeId:clean(executionRuntime?.authorizationRuntimeId),
    promotionRuntimeId:clean(executionRuntime?.promotionRuntimeId),verificationRuntimeId:clean(executionRuntime?.verificationRuntimeId),
    evidenceBindingRuntimeId:clean(executionRuntime?.evidenceBindingRuntimeId),captureRuntimeId:clean(executionRuntime?.captureRuntimeId),
    envelopeSetId:clean(executionRuntime?.envelopeSetId),resultProvenanceId:clean(executionRuntime?.resultProvenanceId),
    ledgerId:clean(executionRuntime?.ledgerId),contextId:clean(executionRuntime?.contextId),propertyId:clean(executionRuntime?.propertyId),
    basis:'M2.86_GOVERNED_CONSUMER_RESULT_EVIDENCE_PROMOTION_EXECUTION_RUNTIME',records:Object.freeze(records),
    candidateCount:count('AWAITING_COMMIT_APPROVAL'),awaitingPromotionExecutionCount:count('AWAITING_PROMOTION_EXECUTION'),
    blockedCount,consumerCount:CONSUMERS.length,commitCandidatesAppendOnly:true,commitApprovalRequired:true,
    canonicalWriteAuthority:false,governedMutationAuthority:false,baseCanonicalOverwriteAuthority:false,
    automaticCanonicalWrites:false,automaticCommit:false,canonicalMutation:false,governedMutation:false,
    attributable:true,reproducible:true,temporal:true,readOnly:true,appendOnly:true,propertyScoped:true,commitAuthority:false
  });
}
