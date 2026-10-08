// SCIIP Explorer 3.0 — M2.99
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GL99'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function assertAdapter(adapter){
  const required=['readCurrent','writeAtomic','rollback','consumeToken','persistReceipt','appendAudit'];
  for(const fn of required){
    if(typeof adapter?.[fn]!=='function'){
      throw new Error(`M2.99 production adapter missing ${fn}()`);
    }
  }
}

export async function executeFirstLiveCanonicalCanary({
  adapterCertification,
  authorityRuntime,
  executionRuntime,
  request,
  adapter
}={}){
  assertAdapter(adapter);

  const ready =
    adapterCertification?.status==='READY' &&
    adapterCertification?.state==='LIVE_CANARY_EXECUTION_READY' &&
    adapterCertification?.liveCanaryExecutionReady===true &&
    adapterCertification?.readinessReceiptId &&
    adapterCertification?.readinessReceiptId!=='UNAVAILABLE';

  if(!ready){
    return Object.freeze({
      status:'BLOCKED',
      state:'M2_98_LIVE_CANARY_READINESS_REQUIRED',
      writeAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  }

  const consumer=clean(adapterCertification?.consumer);
  const auth=(authorityRuntime?.records||[]).find(r=>r?.consumer===consumer);
  const exec=(executionRuntime?.records||[]).find(r=>r?.consumer===consumer);

  const exactScope =
    clean(request?.readinessReceiptId)===clean(adapterCertification?.readinessReceiptId) &&
    clean(request?.propertyId)===clean(adapterCertification?.propertyId) &&
    clean(request?.propertyId)===clean(auth?.propertyId) &&
    clean(request?.authorityLeaseId)===clean(auth?.authorityLeaseId) &&
    clean(request?.oneUseAuthorizationToken)===clean(auth?.oneUseAuthorizationToken) &&
    clean(request?.expectedVersion)===clean(auth?.expectedVersion) &&
    clean(request?.beforeHash)===clean(auth?.beforeHash) &&
    clean(request?.afterHash)===clean(auth?.afterHash) &&
    exec?.executionCapability===true &&
    exec?.state==='READY_FOR_SINGLE_CANARY_EXECUTION';

  if(!exactScope){
    return Object.freeze({
      status:'BLOCKED',
      state:'LIVE_CANARY_SCOPE_MISMATCH',
      writeAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  }

  if(request?.explicitLiveExecutionApproval!==true){
    return Object.freeze({
      status:'BLOCKED',
      state:'EXPLICIT_LIVE_EXECUTION_APPROVAL_REQUIRED',
      writeAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  }

  if(request?.bulkWrite===true || request?.multiProperty===true || request?.persistentWriteAuthority===true){
    return Object.freeze({
      status:'BLOCKED',
      state:'PROHIBITED_WRITE_SCOPE',
      writeAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  }

  const executionId=stableId([
    clean(adapterCertification?.certificationId),
    clean(adapterCertification?.readinessReceiptId),
    consumer,
    clean(request?.propertyId),
    clean(request?.expectedVersion),
    clean(request?.beforeHash),
    clean(request?.afterHash),
    clean(request?.oneUseAuthorizationToken)
  ],'GLCE');

  const before=await adapter.readCurrent({
    propertyId:request.propertyId,
    executionId,
    phase:'PRE_WRITE'
  });

  const preflightOk=
    clean(before?.version)===clean(request.expectedVersion) &&
    clean(before?.hash)===clean(request.beforeHash);

  if(!preflightOk){
    await adapter.appendAudit({
      event:'M2.99_LIVE_CANARY_BLOCKED_PREFLIGHT',
      executionId,
      propertyId:request.propertyId,
      expectedVersion:request.expectedVersion,
      observedVersion:clean(before?.version),
      expectedHash:request.beforeHash,
      observedHash:clean(before?.hash)
    });
    return Object.freeze({
      status:'BLOCKED',
      state:clean(before?.version)!==clean(request.expectedVersion)
        ?'LIVE_PREWRITE_VERSION_MISMATCH'
        :'LIVE_PREWRITE_HASH_MISMATCH',
      executionId,
      writeAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  }

  const token=await adapter.consumeToken({
    token:request.oneUseAuthorizationToken,
    authorityLeaseId:request.authorityLeaseId,
    readinessReceiptId:request.readinessReceiptId,
    executionId
  });

  if(token?.consumed!==true){
    await adapter.appendAudit({
      event:'M2.99_LIVE_CANARY_TOKEN_CONSUMPTION_FAILED',
      executionId,
      propertyId:request.propertyId
    });
    return Object.freeze({
      status:'BLOCKED',
      state:'LIVE_ONE_USE_TOKEN_CONSUMPTION_FAILED',
      executionId,
      writeAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  }

  let writeReceipt=null;
  let after=null;
  let rollbackReceipt=null;
  let writeSucceeded=false;
  let verificationSucceeded=false;
  let rollbackExecuted=false;
  let state='LIVE_WRITE_FAILED';

  try{
    writeReceipt=await adapter.writeAtomic({
      propertyId:request.propertyId,
      expectedVersion:request.expectedVersion,
      expectedBeforeHash:request.beforeHash,
      expectedAfterHash:request.afterHash,
      executionId,
      payload:request.payload
    });

    writeSucceeded=writeReceipt?.committed===true;
    if(!writeSucceeded){
      state='LIVE_WRITE_FAILED';
      throw new Error('M2.99 live atomic write did not commit');
    }

    after=await adapter.readCurrent({
      propertyId:request.propertyId,
      executionId,
      phase:'POST_WRITE'
    });

    verificationSucceeded=
      clean(after?.hash)===clean(request.afterHash) &&
      clean(after?.version)!==clean(request.expectedVersion);

    if(!verificationSucceeded){
      state='LIVE_POST_WRITE_VERIFICATION_FAILED';
      throw new Error('M2.99 live read-after-write verification failed');
    }

    state='LIVE_CANARY_COMMIT_VERIFIED';
  }catch(error){
    if(writeSucceeded){
      rollbackReceipt=await adapter.rollback({
        propertyId:request.propertyId,
        executionId,
        expectedBeforeHash:request.beforeHash,
        expectedVersion:request.expectedVersion,
        reason:state
      });
      rollbackExecuted=rollbackReceipt?.rolledBack===true;
      state=rollbackExecuted
        ?'LIVE_CANARY_ROLLED_BACK'
        :'LIVE_CANARY_ROLLBACK_FAILED';
    }
  }

  const durableCommitReceiptId=state==='LIVE_CANARY_COMMIT_VERIFIED'
    ?stableId([executionId,'LIVE_COMMIT',clean(request.afterHash)],'GLCR')
    :'UNAVAILABLE';

  const durableRollbackReceiptId=rollbackExecuted
    ?stableId([executionId,'LIVE_ROLLBACK',clean(request.beforeHash)],'GLRR')
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
  ],'GLPC');

  const receipt=Object.freeze({
    milestone:'M2.99',
    executionId,
    postCommitCertificationId,
    readinessReceiptId:request.readinessReceiptId,
    propertyId:request.propertyId,
    consumer,
    state,
    beforeVersion:clean(before?.version),
    beforeHash:clean(before?.hash),
    afterVersion:clean(after?.version),
    afterHash:clean(after?.hash),
    writeSucceeded,
    verificationSucceeded,
    rollbackExecuted,
    durableCommitReceiptId,
    durableRollbackReceiptId,
    oneUseTokenConsumed:true,
    authorityRelocked:true,
    persistentWriteAuthority:false,
    automaticCommit:false,
    bulkWrite:false,
    multiProperty:false
  });

  await adapter.persistReceipt(receipt);
  await adapter.appendAudit({
    event:'M2.99_FIRST_LIVE_CANARY_EXECUTION_COMPLETE',
    ...receipt
  });

  return Object.freeze({
    status:state==='LIVE_CANARY_COMMIT_VERIFIED'?'COMMITTED':'SAFE_TERMINAL',
    state,
    executionId,
    postCommitCertificationId,
    propertyId:request.propertyId,
    consumer,
    writeAttempted:true,
    writeSucceeded,
    verificationSucceeded,
    rollbackExecuted,
    durableCommitReceiptId,
    durableRollbackReceiptId,
    canonicalCommitted:state==='LIVE_CANARY_COMMIT_VERIFIED',
    authorityRelocked:true,
    oneUseTokenConsumed:true,
    persistentWriteAuthority:false,
    automaticCommit:false,
    bulkWrite:false,
    multiProperty:false
  });
}

export function buildGovernedFirstLiveCanonicalCanaryExecutionPostCommitCertificationRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_99_GOVERNED_FIRST_LIVE_CANONICAL_CANARY_EXECUTION_POST_COMMIT_CERTIFICATION_RUNTIME',
    version:'3.0-m2.99',
    status:'READY',
    installerExecutesWrite:false,
    liveExecutionRequiresExplicitInvocation:true,
    singleTransactionOnly:true,
    singlePropertyOnly:true,
    oneUseAuthorityOnly:true,
    authorityAutoRelock:true,
    rollbackOnVerificationFailure:true,
    readAfterWriteVerificationRequired:true,
    durableReceiptRequired:true,
    durableAuditRequired:true,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    realCanonicalCommittedCount:0
  });
}
