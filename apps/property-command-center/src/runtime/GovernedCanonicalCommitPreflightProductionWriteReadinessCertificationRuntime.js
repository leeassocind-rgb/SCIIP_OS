// SCIIP Explorer 3.0 — M2.95
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GPRD'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function isIso(value){
  if(typeof value!=='string'||!value.trim()) return false;
  const d=new Date(value);
  return !Number.isNaN(d.getTime());
}

export function buildGovernedCanonicalCommitPreflightProductionWriteReadinessCertificationRuntime(
  rehearsalRuntime={},
  preflightRequests={}
){
  const upstreamReady=
    rehearsalRuntime?.status==='READY' &&
    rehearsalRuntime?.simulationOnly===true &&
    rehearsalRuntime?.nonCanonicalTarget===true &&
    rehearsalRuntime?.commitExecution===false &&
    rehearsalRuntime?.canonicalWriteAuthority===false &&
    rehearsalRuntime?.automaticCommit===false &&
    rehearsalRuntime?.realCanonicalCommittedCount===0;

  const rows=Array.isArray(rehearsalRuntime?.records)?rehearsalRuntime.records:[];

  const records=CONSUMERS.map(consumer=>{
    const rehearsal=rows.find(r=>r?.consumer===consumer);
    const req=preflightRequests?.[consumer]||{};
    const requested=req?.certify===true;

    const productionTargetId=clean(req?.productionTargetId);
    const expectedVersion=clean(req?.expectedVersion);
    const currentVersion=clean(req?.currentVersion);
    const beforeHash=clean(req?.beforeHash);
    const afterHash=clean(req?.afterHash);
    const authorizationId=clean(req?.authorizationId,clean(rehearsal?.authorizationId));
    const authorizationIssuedAt=clean(req?.authorizationIssuedAt,'UNAVAILABLE');
    const now=clean(req?.now,'UNAVAILABLE');
    const idempotencyKey=clean(req?.idempotencyKey,clean(rehearsal?.idempotencyKey));
    const auditChainId=clean(req?.auditChainId);
    const rollbackPlanId=clean(req?.rollbackPlanId,clean(rehearsal?.rollbackPlanId));
    const isolationLevel=clean(req?.isolationLevel);

    const rehearsalVerified =
      rehearsal?.state==='SIMULATED_COMMIT_VERIFIED' &&
      rehearsal?.postTransactionVerified===true &&
      rehearsal?.nonCanonicalTarget===true &&
      rehearsal?.canonicalWrite===false &&
      rehearsal?.committedToCanonical===false;

    const targetValid=productionTargetId!=='UNAVAILABLE';
    const versionValid=
      expectedVersion!=='UNAVAILABLE' &&
      currentVersion!=='UNAVAILABLE' &&
      expectedVersion===currentVersion;

    const hashesValid=
      beforeHash!=='UNAVAILABLE' &&
      afterHash!=='UNAVAILABLE' &&
      beforeHash!==afterHash;

    const authorizationValid=
      authorizationId!=='UNAVAILABLE' &&
      isIso(authorizationIssuedAt) &&
      isIso(now) &&
      Math.abs(new Date(now).getTime()-new Date(authorizationIssuedAt).getTime()) <= 60*60*1000;

    const idempotencyValid=idempotencyKey!=='UNAVAILABLE' && req?.idempotencyPreviouslyCommitted!==true;
    const rollbackValid=rollbackPlanId!=='UNAVAILABLE' && req?.rollbackRecoverable===true;
    const auditValid=auditChainId!=='UNAVAILABLE' && req?.auditChainContinuous===true;
    const isolationValid=['SERIALIZABLE','REPEATABLE_READ'].includes(isolationLevel);
    const writeAuthorityPrereq=req?.writeAuthorityPrerequisite===true;
    const productionFreshnessValid=req?.productionFreshnessValidated===true;

    const allChecks =
      upstreamReady &&
      rehearsalVerified &&
      requested &&
      targetValid &&
      versionValid &&
      hashesValid &&
      authorizationValid &&
      idempotencyValid &&
      rollbackValid &&
      auditValid &&
      isolationValid &&
      writeAuthorityPrereq &&
      productionFreshnessValid;

    let state;
    if(!upstreamReady) state='BLOCKED';
    else if(!rehearsalVerified) state='REHEARSAL_NOT_VERIFIED';
    else if(!requested) state='AWAITING_PREFLIGHT_REQUEST';
    else if(!targetValid) state='TARGET_INVALID';
    else if(!versionValid) state='VERSION_CONFLICT';
    else if(!hashesValid) state='HASH_VALIDATION_FAILED';
    else if(!authorizationValid) state='AUTHORIZATION_STALE_OR_INVALID';
    else if(!idempotencyValid) state='IDEMPOTENCY_BLOCKED';
    else if(!rollbackValid) state='ROLLBACK_NOT_RECOVERABLE';
    else if(!auditValid) state='AUDIT_CHAIN_BROKEN';
    else if(!isolationValid) state='ISOLATION_INSUFFICIENT';
    else if(!writeAuthorityPrereq) state='WRITE_AUTHORITY_PREREQUISITE_MISSING';
    else if(!productionFreshnessValid) state='PRODUCTION_FRESHNESS_FAILED';
    else state='PRODUCTION_WRITE_READY';

    const certificationId=stableId([
      clean(rehearsalRuntime?.runtimeId),
      consumer,
      productionTargetId,
      expectedVersion,
      currentVersion,
      beforeHash,
      afterHash,
      authorizationId,
      idempotencyKey,
      auditChainId,
      rollbackPlanId,
      isolationLevel,
      state
    ],'GPRC');

    const readinessReceiptId=state==='PRODUCTION_WRITE_READY'
      ?stableId([certificationId,'PRODUCTION_WRITE_READINESS_RECEIPT'],'GPRR')
      :'UNAVAILABLE';

    return Object.freeze({
      consumer,
      certificationId,
      certificationKey:`M2.95:${clean(rehearsalRuntime?.propertyId)}:${consumer}`,
      readinessReceiptId,
      rehearsalTransactionId:clean(rehearsal?.transactionId),
      rehearsalCommitReceiptId:clean(rehearsal?.commitReceiptId),
      rehearsalVerificationReceiptId:clean(rehearsal?.verificationReceiptId),
      propertyId:clean(rehearsal?.propertyId||rehearsalRuntime?.propertyId),
      productionTargetId,
      expectedVersion,
      currentVersion,
      beforeHash,
      afterHash,
      authorizationId,
      authorizationIssuedAt,
      idempotencyKey,
      auditChainId,
      rollbackPlanId,
      isolationLevel,
      state,
      requested,
      rehearsalVerified,
      targetValid,
      versionValid,
      hashesValid,
      authorizationValid,
      idempotencyValid,
      rollbackValid,
      auditValid,
      isolationValid,
      writeAuthorityPrereq,
      productionFreshnessValid,
      productionWriteReady:state==='PRODUCTION_WRITE_READY',
      writeExecuted:false,
      canonicalWrite:false,
      canonicalWriteAuthority:false,
      automaticCommit:false,
      canonicalMutation:false,
      governedMutation:false,
      realCanonicalCommitted:false,
      readOnly:true,
      appendOnly:true
    });
  });

  const count=s=>records.filter(r=>r.state===s).length;
  const blockedCount=count('BLOCKED');
  const ready=upstreamReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(rehearsalRuntime?.runtimeId),
    ...records.map(r=>`${r.consumer}:${r.certificationId}:${r.state}`)
  ],'GPRD');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_95_GOVERNED_CANONICAL_COMMIT_PREFLIGHT_PRODUCTION_WRITE_READINESS_CERTIFICATION_RUNTIME',
    version:'3.0-m2.95',
    status:ready?'READY':'BLOCKED',
    certificationState:ready?'PRODUCTION_WRITE_READINESS_CERTIFICATION_READY':'BLOCKED',
    runtimeId,
    rehearsalRuntimeId:clean(rehearsalRuntime?.runtimeId),
    propertyId:clean(rehearsalRuntime?.propertyId),
    records:Object.freeze(records),
    consumerCount:CONSUMERS.length,
    productionWriteReadyCount:count('PRODUCTION_WRITE_READY'),
    awaitingPreflightRequestCount:count('AWAITING_PREFLIGHT_REQUEST'),
    blockedCount,
    realCanonicalCommittedCount:0,
    productionWriteCertificationOnly:true,
    productionWriteExecution:false,
    canonicalWriteAuthority:false,
    automaticCommit:false,
    canonicalMutation:false,
    governedMutation:false,
    readOnly:true,
    appendOnly:true
  });
}
