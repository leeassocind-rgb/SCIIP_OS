// SCIIP Explorer 3.0 — M3.04
// Governed First Live Canonical Canary Execution Runtime

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
function stableId(parts,prefix='GX304'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}
function exact(a,b){ return clean(a)!=='UNAVAILABLE' && clean(a)===clean(b); }
function method(adapter,name){ return typeof adapter?.[name]==='function'; }

export function buildGovernedFirstLiveCanonicalCanaryExecutionRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_04_GOVERNED_FIRST_LIVE_CANONICAL_CANARY_EXECUTION_RUNTIME',
    version:'3.0-m3.04',
    status:'READY',
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    explicitLiveExecutionRequired:true,
    m303RehearsalReceiptRequired:true,
    m302HandoffRequired:true,
    m301PreflightRequired:true,
    m298ReadinessRequired:true,
    m296OneUseAuthorityRequired:true,
    freshPreWriteReadRequired:true,
    exactVersionRevalidationRequired:true,
    exactBeforeHashRevalidationRequired:true,
    atomicWriteRequired:true,
    readAfterWriteVerificationRequired:true,
    exactAfterHashVerificationRequired:true,
    rollbackOnVerificationFailure:true,
    durableCommitReceiptRequired:true,
    durableRollbackReceiptRequired:true,
    durableAuditRequired:true,
    tokenConsumptionRequired:true,
    authorityAutoRelock:true,
    singleTransactionOnly:true,
    singlePropertyOnly:true,
    oneShotOnly:true,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    realCanonicalCommittedCountAtInstall:0
  });
}

export function prepareFirstLiveCanonicalCanaryExecution({
  m303Rehearsal={},
  m302Handoff={},
  m301Preflight={},
  m298Certification={},
  authorityRuntime={},
  payload
}={}){
  const consumer=clean(m301Preflight?.consumer);
  const auth=(authorityRuntime?.records||[]).find(r=>r?.consumer===consumer);

  const rehearsalReady=
    m303Rehearsal?.status==='CERTIFIED' &&
    m303Rehearsal?.state==='FIRST_LIVE_CANARY_EXECUTION_REHEARSAL_CERTIFIED' &&
    m303Rehearsal?.rehearsalCertified===true &&
    m303Rehearsal?.liveWriteExecuted===false &&
    m303Rehearsal?.mutationPerformed===false &&
    m303Rehearsal?.canonicalCommitted===false &&
    m303Rehearsal?.canonicalCommittedCount===0 &&
    clean(m303Rehearsal?.rehearsalReceiptId)!=='UNAVAILABLE';

  const handoffReady=
    m302Handoff?.status==='AUTHORIZED' &&
    m302Handoff?.state==='FIRST_LIVE_CANARY_EXECUTION_HANDOFF_AUTHORIZED' &&
    m302Handoff?.m299InvocationAuthorized===true &&
    m302Handoff?.oneShot===true &&
    m302Handoff?.liveWriteExecuted===false &&
    clean(m302Handoff?.handoffId)!=='UNAVAILABLE';

  const preflightReady=
    m301Preflight?.status==='CERTIFIED' &&
    m301Preflight?.state==='FIRST_LIVE_CANARY_PREFLIGHT_CERTIFIED' &&
    m301Preflight?.preflightCertified===true &&
    m301Preflight?.liveWriteExecuted===false &&
    m301Preflight?.canonicalCommitted===false;

  const adapterReady=
    m298Certification?.status==='READY' &&
    m298Certification?.state==='LIVE_CANARY_EXECUTION_READY' &&
    m298Certification?.liveCanaryExecutionReady===true &&
    clean(m298Certification?.readinessReceiptId)!=='UNAVAILABLE';

  const authorityReady=
    auth?.state==='CANARY_WRITE_AUTHORIZED' &&
    auth?.canaryWriteAuthorized===true &&
    clean(auth?.authorityLeaseId)!=='UNAVAILABLE' &&
    clean(auth?.oneUseAuthorizationToken)!=='UNAVAILABLE';

  const req=m302Handoff?.request||{};
  const propertyId=clean(req?.propertyId);

  const exactBindings=
    exact(propertyId,m301Preflight?.propertyId) &&
    exact(propertyId,m298Certification?.propertyId) &&
    exact(propertyId,auth?.propertyId) &&
    exact(req?.readinessReceiptId,m298Certification?.readinessReceiptId) &&
    exact(req?.authorityLeaseId,auth?.authorityLeaseId) &&
    exact(req?.oneUseAuthorizationToken,auth?.oneUseAuthorizationToken) &&
    exact(req?.expectedVersion,m301Preflight?.evidence?.canonicalBefore?.version) &&
    exact(req?.expectedVersion,auth?.expectedVersion) &&
    exact(req?.beforeHash,m301Preflight?.evidence?.canonicalBefore?.hash) &&
    exact(req?.beforeHash,auth?.beforeHash) &&
    exact(req?.afterHash,m301Preflight?.evidence?.canonicalAfter?.hash) &&
    exact(req?.afterHash,auth?.afterHash);

  const safeScope=
    req?.explicitLiveExecutionApproval===true &&
    req?.bulkWrite!==true &&
    req?.multiProperty!==true &&
    req?.persistentWriteAuthority!==true;

  const ready=
    rehearsalReady && handoffReady && preflightReady &&
    adapterReady && authorityReady && exactBindings && safeScope;

  let state;
  if(!rehearsalReady) state='M3_03_REHEARSAL_NOT_CERTIFIED';
  else if(!handoffReady) state='M3_02_HANDOFF_NOT_AUTHORIZED';
  else if(!preflightReady) state='M3_01_PREFLIGHT_NOT_CERTIFIED';
  else if(!adapterReady) state='M2_98_LIVE_READINESS_NOT_READY';
  else if(!authorityReady) state='M2_96_AUTHORITY_NOT_READY';
  else if(!exactBindings) state='LIVE_EXECUTION_BINDING_MISMATCH';
  else if(!safeScope) state='LIVE_EXECUTION_SCOPE_PROHIBITED';
  else state='FIRST_LIVE_CANARY_EXECUTION_READY';

  const executionPlanId=stableId([
    clean(m303Rehearsal?.rehearsalReceiptId),
    clean(m302Handoff?.handoffId),
    clean(m301Preflight?.preflightCertificationReceiptId),
    clean(m298Certification?.readinessReceiptId),
    clean(auth?.authorityLeaseId),
    clean(auth?.oneUseAuthorizationToken),
    propertyId,
    clean(req?.expectedVersion),
    clean(req?.beforeHash),
    clean(req?.afterHash),
    state
  ],'GXPL');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_04_FIRST_LIVE_CANARY_EXECUTION_PLAN',
    version:'3.0-m3.04',
    status:ready?'READY':'BLOCKED',
    state,
    executionPlanId,
    consumer,
    propertyId,
    rehearsalReceiptId:clean(m303Rehearsal?.rehearsalReceiptId),
    handoffId:clean(m302Handoff?.handoffId),
    preflightCertificationReceiptId:clean(m301Preflight?.preflightCertificationReceiptId),
    readinessReceiptId:clean(m298Certification?.readinessReceiptId),
    authorityLeaseId:clean(auth?.authorityLeaseId),
    oneUseAuthorizationToken:clean(auth?.oneUseAuthorizationToken),
    expectedVersion:clean(req?.expectedVersion),
    beforeHash:clean(req?.beforeHash),
    afterHash:clean(req?.afterHash),
    payload,
    exactBindings,
    safeScope,
    oneShot:true,
    automaticRetryAllowed:false,
    liveWriteExecuted:false,
    canonicalCommitted:false,
    authorityRelocked:true,
    generalizedWriteAuthority:false,
    bulkWrite:false,
    multiProperty:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export async function executeGovernedFirstLiveCanonicalCanary({
  executionPlan={},
  explicitExecution={},
  adapter
}={}){
  const planReady=
    executionPlan?.status==='READY' &&
    executionPlan?.state==='FIRST_LIVE_CANARY_EXECUTION_READY' &&
    executionPlan?.oneShot===true &&
    executionPlan?.automaticRetryAllowed===false &&
    executionPlan?.liveWriteExecuted===false &&
    executionPlan?.canonicalCommitted===false;

  if(!planReady){
    return Object.freeze({
      status:'BLOCKED',
      state:'LIVE_EXECUTION_PLAN_NOT_READY',
      writeAttempted:false,
      canonicalCommitted:false,
      canonicalCommittedCount:0,
      authorityRelocked:true
    });
  }

  const explicit=
    explicitExecution?.executeLiveCanary===true &&
    explicitExecution?.acknowledgeProductionMutation===true &&
    explicitExecution?.acknowledgeOneShotTokenConsumption===true &&
    explicitExecution?.acknowledgeRollbackOnVerificationFailure===true &&
    explicitExecution?.acknowledgeNoAutomaticRetry===true &&
    exact(explicitExecution?.executionPlanId,executionPlan?.executionPlanId);

  if(!explicit){
    return Object.freeze({
      status:'BLOCKED',
      state:'EXPLICIT_LIVE_EXECUTION_CONFIRMATION_REQUIRED',
      writeAttempted:false,
      canonicalCommitted:false,
      canonicalCommittedCount:0,
      authorityRelocked:true
    });
  }

  const required=['readCurrent','writeAtomic','rollback','consumeToken','persistReceipt','appendAudit'];
  const missing=required.filter(fn=>!method(adapter,fn));
  if(missing.length){
    return Object.freeze({
      status:'BLOCKED',
      state:'PRODUCTION_ADAPTER_CONTRACT_INCOMPLETE',
      missingMethods:Object.freeze(missing),
      writeAttempted:false,
      canonicalCommitted:false,
      canonicalCommittedCount:0,
      authorityRelocked:true
    });
  }

  const executionId=stableId([
    executionPlan.executionPlanId,
    executionPlan.rehearsalReceiptId,
    executionPlan.handoffId,
    executionPlan.propertyId,
    executionPlan.expectedVersion,
    executionPlan.beforeHash,
    executionPlan.afterHash,
    'FIRST_LIVE_CANARY'
  ],'GXEX');

  const before=await adapter.readCurrent({
    propertyId:executionPlan.propertyId,
    executionId,
    phase:'PRE_WRITE'
  });

  const versionExact=exact(before?.version,executionPlan.expectedVersion);
  const beforeHashExact=exact(before?.hash,executionPlan.beforeHash);
  const identityExact=
    before?.canonicalIdentityVerified===true &&
    exact(before?.propertyId,executionPlan.propertyId);

  if(!identityExact || !versionExact || !beforeHashExact){
    await adapter.appendAudit({
      event:'M3.04_FIRST_LIVE_CANARY_BLOCKED_PREWRITE',
      executionId,
      propertyId:executionPlan.propertyId,
      identityExact,
      versionExact,
      beforeHashExact
    });
    return Object.freeze({
      status:'BLOCKED',
      state:!identityExact
        ?'LIVE_PREWRITE_IDENTITY_MISMATCH'
        :(!versionExact?'LIVE_PREWRITE_VERSION_MISMATCH':'LIVE_PREWRITE_HASH_MISMATCH'),
      executionId,
      writeAttempted:false,
      canonicalCommitted:false,
      canonicalCommittedCount:0,
      authorityRelocked:true
    });
  }

  const token=await adapter.consumeToken({
    token:executionPlan.oneUseAuthorizationToken,
    authorityLeaseId:executionPlan.authorityLeaseId,
    executionId,
    mode:'LIVE_CONSUME_ONCE'
  });

  if(token?.consumed!==true || token?.alreadyConsumed===true){
    await adapter.appendAudit({
      event:'M3.04_FIRST_LIVE_CANARY_TOKEN_BLOCKED',
      executionId,
      propertyId:executionPlan.propertyId
    });
    return Object.freeze({
      status:'BLOCKED',
      state:'LIVE_ONE_USE_TOKEN_CONSUMPTION_FAILED',
      executionId,
      writeAttempted:false,
      canonicalCommitted:false,
      canonicalCommittedCount:0,
      authorityRelocked:true
    });
  }

  let writeSucceeded=false;
  let verificationSucceeded=false;
  let rollbackExecuted=false;
  let after=null;
  let writeReceipt=null;
  let rollbackReceipt=null;
  let state='LIVE_WRITE_FAILED';

  try{
    writeReceipt=await adapter.writeAtomic({
      propertyId:executionPlan.propertyId,
      expectedVersion:executionPlan.expectedVersion,
      expectedBeforeHash:executionPlan.beforeHash,
      expectedAfterHash:executionPlan.afterHash,
      executionId,
      payload:executionPlan.payload
    });

    writeSucceeded=writeReceipt?.committed===true;

    if(!writeSucceeded){
      state='LIVE_WRITE_FAILED';
      throw new Error('M3.04 atomic write did not commit');
    }

    after=await adapter.readCurrent({
      propertyId:executionPlan.propertyId,
      executionId,
      phase:'POST_WRITE'
    });

    verificationSucceeded=
      exact(after?.propertyId,executionPlan.propertyId) &&
      after?.canonicalIdentityVerified===true &&
      exact(after?.hash,executionPlan.afterHash) &&
      clean(after?.version)!==clean(executionPlan.expectedVersion);

    if(!verificationSucceeded){
      state='LIVE_POST_WRITE_VERIFICATION_FAILED';
      throw new Error('M3.04 post-write verification failed');
    }

    state='FIRST_LIVE_CANARY_COMMIT_VERIFIED';
  }catch(error){
    if(writeSucceeded){
      rollbackReceipt=await adapter.rollback({
        propertyId:executionPlan.propertyId,
        executionId,
        beforeVersion:executionPlan.expectedVersion,
        beforeHash:executionPlan.beforeHash,
        reason:state
      });
      rollbackExecuted=rollbackReceipt?.rolledBack===true;
      state=rollbackExecuted
        ?'FIRST_LIVE_CANARY_ROLLED_BACK'
        :'FIRST_LIVE_CANARY_ROLLBACK_FAILED';
    }else{
      state='FIRST_LIVE_CANARY_BLOCKED';
    }
  }

  const durableCommitReceiptId=state==='FIRST_LIVE_CANARY_COMMIT_VERIFIED'
    ?stableId([executionId,'COMMIT',executionPlan.afterHash],'GXCR')
    :'UNAVAILABLE';

  const durableRollbackReceiptId=rollbackExecuted
    ?stableId([executionId,'ROLLBACK',executionPlan.beforeHash],'GXRR')
    :'UNAVAILABLE';

  const postCommitCertificationId=stableId([
    executionId,
    state,
    clean(before?.version),
    clean(before?.hash),
    clean(after?.version),
    clean(after?.hash),
    durableCommitReceiptId,
    durableRollbackReceiptId
  ],'GXPC');

  const canonicalCommitted=state==='FIRST_LIVE_CANARY_COMMIT_VERIFIED';
  const canonicalCommittedCount=canonicalCommitted?1:0;

  const receipt=Object.freeze({
    milestone:'M3.04',
    executionId,
    executionPlanId:executionPlan.executionPlanId,
    postCommitCertificationId,
    propertyId:executionPlan.propertyId,
    state,
    writeSucceeded,
    verificationSucceeded,
    rollbackExecuted,
    durableCommitReceiptId,
    durableRollbackReceiptId,
    oneUseTokenConsumed:true,
    authorityRelocked:true,
    canonicalCommitted,
    canonicalCommittedCount,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWrite:false,
    multiProperty:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });

  await adapter.persistReceipt(receipt);
  await adapter.appendAudit({
    event:'M3.04_FIRST_LIVE_CANARY_EXECUTION_COMPLETE',
    ...receipt
  });

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_04_GOVERNED_FIRST_LIVE_CANARY_EXECUTION_RESULT',
    version:'3.0-m3.04',
    status:canonicalCommitted?'COMMITTED':(rollbackExecuted?'SAFE_TERMINAL':'BLOCKED'),
    state,
    executionId,
    executionPlanId:executionPlan.executionPlanId,
    propertyId:executionPlan.propertyId,
    writeAttempted:true,
    writeSucceeded,
    verificationSucceeded,
    rollbackExecuted,
    durableCommitReceiptId,
    durableRollbackReceiptId,
    postCommitCertificationId,
    oneUseTokenConsumed:true,
    authorityRelocked:true,
    canonicalCommitted,
    canonicalCommittedCount,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}
