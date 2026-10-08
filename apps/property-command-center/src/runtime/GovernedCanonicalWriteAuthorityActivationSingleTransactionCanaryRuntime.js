// SCIIP Explorer 3.0 — M2.96
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GCAN'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedCanonicalWriteAuthorityActivationSingleTransactionCanaryRuntime(
  readinessRuntime={},
  canaryRequests={}
){
  const upstreamReady=
    readinessRuntime?.status==='READY' &&
    readinessRuntime?.productionWriteCertificationOnly===true &&
    readinessRuntime?.productionWriteExecution===false &&
    readinessRuntime?.canonicalWriteAuthority===false &&
    readinessRuntime?.automaticCommit===false &&
    readinessRuntime?.realCanonicalCommittedCount===0;

  const rows=Array.isArray(readinessRuntime?.records)?readinessRuntime.records:[];

  const requestedConsumers=CONSUMERS.filter(c=>canaryRequests?.[c]?.executeCanary===true);
  const singleRequestOnly=requestedConsumers.length<=1;

  const records=CONSUMERS.map(consumer=>{
    const ready=rows.find(r=>r?.consumer===consumer);
    const req=canaryRequests?.[consumer]||{};
    const requested=req?.executeCanary===true;

    const readinessCertified=
      ready?.state==='PRODUCTION_WRITE_READY' &&
      ready?.productionWriteReady===true &&
      ready?.readinessReceiptId &&
      ready?.readinessReceiptId!=='UNAVAILABLE' &&
      ready?.writeExecuted===false &&
      ready?.realCanonicalCommitted===false;

    const oneUseToken=clean(req?.oneUseAuthorizationToken);
    const tokenValid=
      requested &&
      oneUseToken!=='UNAVAILABLE' &&
      req?.tokenConsumed!==true;

    const propertyExact=
      clean(req?.propertyId)===clean(ready?.propertyId);

    const transactionExact=
      clean(req?.certificationId)===clean(ready?.certificationId);

    const versionExact=
      clean(req?.expectedVersion)===clean(ready?.expectedVersion) &&
      clean(req?.currentVersion)===clean(ready?.currentVersion);

    const hashesExact=
      clean(req?.beforeHash)===clean(ready?.beforeHash) &&
      clean(req?.afterHash)===clean(ready?.afterHash);

    const atomicAdapter=req?.atomicAdapterBound===true;
    const rollbackBound=req?.rollbackHandlerBound===true;
    const readAfterWriteBound=req?.readAfterWriteVerifierBound===true;
    const durableReceiptBound=req?.durableReceiptStoreBound===true;
    const explicitHumanApproval=req?.explicitHumanApproval===true;
    const persistentAuthorityRequested=req?.persistentWriteAuthority===true;
    const bulkRequested=req?.bulkWrite===true;
    const multiPropertyRequested=req?.multiProperty===true;

    const safeScope=
      singleRequestOnly &&
      !persistentAuthorityRequested &&
      !bulkRequested &&
      !multiPropertyRequested;

    const canAttempt=
      upstreamReady &&
      readinessCertified &&
      requested &&
      tokenValid &&
      propertyExact &&
      transactionExact &&
      versionExact &&
      hashesExact &&
      atomicAdapter &&
      rollbackBound &&
      readAfterWriteBound &&
      durableReceiptBound &&
      explicitHumanApproval &&
      safeScope;

    let state;
    if(!upstreamReady) state='BLOCKED';
    else if(!readinessCertified) state='READINESS_NOT_CERTIFIED';
    else if(!requested) state='AWAITING_CANARY_REQUEST';
    else if(!singleRequestOnly) state='MULTIPLE_CANARY_REQUESTS_BLOCKED';
    else if(persistentAuthorityRequested) state='PERSISTENT_AUTHORITY_PROHIBITED';
    else if(bulkRequested) state='BULK_WRITE_PROHIBITED';
    else if(multiPropertyRequested) state='MULTI_PROPERTY_PROHIBITED';
    else if(!tokenValid) state='ONE_USE_TOKEN_INVALID';
    else if(!explicitHumanApproval) state='HUMAN_APPROVAL_REQUIRED';
    else if(!propertyExact) state='PROPERTY_SCOPE_MISMATCH';
    else if(!transactionExact) state='CERTIFICATION_SCOPE_MISMATCH';
    else if(!versionExact) state='VERSION_MISMATCH';
    else if(!hashesExact) state='HASH_MISMATCH';
    else if(!atomicAdapter) state='ATOMIC_ADAPTER_NOT_BOUND';
    else if(!rollbackBound) state='ROLLBACK_HANDLER_NOT_BOUND';
    else if(!readAfterWriteBound) state='READ_AFTER_WRITE_VERIFIER_NOT_BOUND';
    else if(!durableReceiptBound) state='DURABLE_RECEIPT_STORE_NOT_BOUND';
    else state='CANARY_WRITE_AUTHORIZED';

    const canaryId=stableId([
      clean(readinessRuntime?.runtimeId),
      consumer,
      clean(ready?.certificationId),
      clean(ready?.readinessReceiptId),
      oneUseToken,
      state
    ],'GCNY');

    const authorityLeaseId=state==='CANARY_WRITE_AUTHORIZED'
      ?stableId([canaryId,'SINGLE_USE_WRITE_AUTHORITY'],'GAUT')
      :'UNAVAILABLE';

    return Object.freeze({
      consumer,
      canaryId,
      canaryKey:`M2.96:${clean(readinessRuntime?.propertyId)}:${consumer}`,
      authorityLeaseId,
      readinessCertificationId:clean(ready?.certificationId),
      readinessReceiptId:clean(ready?.readinessReceiptId),
      propertyId:clean(ready?.propertyId||readinessRuntime?.propertyId),
      expectedVersion:clean(ready?.expectedVersion),
      currentVersion:clean(ready?.currentVersion),
      beforeHash:clean(ready?.beforeHash),
      afterHash:clean(ready?.afterHash),
      state,
      requested,
      oneUseAuthorizationToken:oneUseToken,
      tokenValid,
      explicitHumanApproval,
      safeScope,
      atomicAdapter,
      rollbackBound,
      readAfterWriteBound,
      durableReceiptBound,
      canaryWriteAuthorized:state==='CANARY_WRITE_AUTHORIZED',
      writeAttempted:false,
      writeSucceeded:false,
      verificationSucceeded:false,
      rollbackExecuted:false,
      durableCommitReceiptId:'UNAVAILABLE',
      durableRollbackReceiptId:'UNAVAILABLE',
      canonicalWriteAuthorityActive:state==='CANARY_WRITE_AUTHORIZED',
      persistentWriteAuthority:false,
      automaticCommit:false,
      bulkWrite:false,
      multiProperty:false,
      authorityAutoRelock:true,
      canonicalCommitted:false,
      appendOnly:true
    });
  });

  const count=s=>records.filter(r=>r.state===s).length;
  const blockedCount=count('BLOCKED');
  const ready=upstreamReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(readinessRuntime?.runtimeId),
    ...records.map(r=>`${r.consumer}:${r.canaryId}:${r.state}`)
  ],'GCNR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_96_GOVERNED_CANONICAL_WRITE_AUTHORITY_ACTIVATION_SINGLE_TRANSACTION_CANARY_RUNTIME',
    version:'3.0-m2.96',
    status:ready?'READY':'BLOCKED',
    canaryState:ready?'SINGLE_TRANSACTION_CANARY_READY':'BLOCKED',
    runtimeId,
    readinessRuntimeId:clean(readinessRuntime?.runtimeId),
    propertyId:clean(readinessRuntime?.propertyId),
    records:Object.freeze(records),
    consumerCount:CONSUMERS.length,
    canaryWriteAuthorizedCount:count('CANARY_WRITE_AUTHORIZED'),
    awaitingCanaryRequestCount:count('AWAITING_CANARY_REQUEST'),
    blockedCount,
    singleTransactionOnly:true,
    singlePropertyOnly:true,
    oneUseAuthorityOnly:true,
    authorityAutoRelock:true,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    realCanonicalCommittedCount:0,
    appendOnly:true
  });
}
