// SCIIP Explorer 3.0 — M2.97
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GC97'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function assertAdapter(adapter){
  const required=['readCurrent','writeAtomic','rollback','appendAudit','persistReceipt','consumeToken'];
  for(const fn of required){
    if(typeof adapter?.[fn]!=='function'){
      throw new Error(`M2.97 persistence adapter missing ${fn}()`);
    }
  }
}

export async function executeGovernedSingleTransactionCanonicalCanary({
  authorityRuntime={},
  consumer,
  request={},
  adapter
}={}){
  assertAdapter(adapter);

  const row=(authorityRuntime?.records||[]).find(r=>r?.consumer===consumer);
  const authorityReady=
    authorityRuntime?.status==='READY' &&
    authorityRuntime?.singleTransactionOnly===true &&
    authorityRuntime?.singlePropertyOnly===true &&
    authorityRuntime?.oneUseAuthorityOnly===true &&
    authorityRuntime?.authorityAutoRelock===true &&
    authorityRuntime?.persistentWriteAuthority===false &&
    authorityRuntime?.automaticCommit===false &&
    authorityRuntime?.realCanonicalCommittedCount===0 &&
    row?.state==='CANARY_WRITE_AUTHORIZED' &&
    row?.canaryWriteAuthorized===true &&
    row?.authorityLeaseId &&
    row?.authorityLeaseId!=='UNAVAILABLE';

  if(!authorityReady){
    return Object.freeze({
      status:'BLOCKED',
      state:'AUTHORITY_NOT_READY',
      writeAttempted:false,
      writeSucceeded:false,
      verificationSucceeded:false,
      rollbackExecuted:false,
      authorityRelocked:true,
      canonicalCommitted:false
    });
  }

  const token=clean(request?.oneUseAuthorizationToken);
  const exactScope=
    token===clean(row?.oneUseAuthorizationToken) &&
    clean(request?.propertyId)===clean(row?.propertyId) &&
    clean(request?.authorityLeaseId)===clean(row?.authorityLeaseId) &&
    clean(request?.expectedVersion)===clean(row?.expectedVersion) &&
    clean(request?.beforeHash)===clean(row?.beforeHash) &&
    clean(request?.afterHash)===clean(row?.afterHash);

  if(!exactScope){
    return Object.freeze({
      status:'BLOCKED',
      state:'EXECUTION_SCOPE_MISMATCH',
      writeAttempted:false,
      writeSucceeded:false,
      verificationSucceeded:false,
      rollbackExecuted:false,
      authorityRelocked:true,
      canonicalCommitted:false
    });
  }

  const executionId=stableId([
    clean(authorityRuntime?.runtimeId),
    consumer,
    clean(row?.canaryId),
    clean(row?.authorityLeaseId),
    token,
    clean(row?.propertyId),
    clean(row?.expectedVersion),
    clean(row?.beforeHash),
    clean(row?.afterHash)
  ],'GCEX');

  const current=await adapter.readCurrent({
    propertyId:row.propertyId,
    executionId
  });

  const preflightVersionOk=clean(current?.version)===clean(row?.expectedVersion);
  const preflightHashOk=clean(current?.hash)===clean(row?.beforeHash);

  if(!preflightVersionOk || !preflightHashOk){
    await adapter.appendAudit({
      event:'M2.97_CANARY_BLOCKED_PREFLIGHT',
      executionId,
      propertyId:row.propertyId,
      preflightVersionOk,
      preflightHashOk
    });
    return Object.freeze({
      status:'BLOCKED',
      state:!preflightVersionOk?'PREWRITE_VERSION_MISMATCH':'PREWRITE_HASH_MISMATCH',
      executionId,
      writeAttempted:false,
      writeSucceeded:false,
      verificationSucceeded:false,
      rollbackExecuted:false,
      authorityRelocked:true,
      canonicalCommitted:false
    });
  }

  const tokenResult=await adapter.consumeToken({
    token,
    authorityLeaseId:row.authorityLeaseId,
    executionId
  });

  if(tokenResult?.consumed!==true){
    await adapter.appendAudit({
      event:'M2.97_CANARY_BLOCKED_TOKEN',
      executionId,
      propertyId:row.propertyId
    });
    return Object.freeze({
      status:'BLOCKED',
      state:'ONE_USE_TOKEN_CONSUMPTION_FAILED',
      executionId,
      writeAttempted:false,
      writeSucceeded:false,
      verificationSucceeded:false,
      rollbackExecuted:false,
      authorityRelocked:true,
      canonicalCommitted:false
    });
  }

  let writeReceipt=null;
  let rollbackReceipt=null;
  let verification=null;
  let state='WRITE_FAILED';
  let writeSucceeded=false;
  let verificationSucceeded=false;
  let rollbackExecuted=false;

  try{
    writeReceipt=await adapter.writeAtomic({
      propertyId:row.propertyId,
      expectedVersion:row.expectedVersion,
      expectedBeforeHash:row.beforeHash,
      expectedAfterHash:row.afterHash,
      executionId,
      payload:request?.payload
    });

    writeSucceeded=writeReceipt?.committed===true;

    if(!writeSucceeded){
      state='WRITE_FAILED';
      throw new Error('M2.97 atomic write did not commit');
    }

    verification=await adapter.readCurrent({
      propertyId:row.propertyId,
      executionId
    });

    verificationSucceeded=
      clean(verification?.hash)===clean(row.afterHash) &&
      clean(verification?.version)!==clean(row.expectedVersion);

    if(!verificationSucceeded){
      state='READ_AFTER_WRITE_VERIFICATION_FAILED';
      throw new Error('M2.97 read-after-write verification failed');
    }

    state='CANARY_COMMIT_VERIFIED';
  }catch(error){
    if(writeSucceeded){
      rollbackReceipt=await adapter.rollback({
        propertyId:row.propertyId,
        executionId,
        beforeHash:row.beforeHash,
        expectedVersion:row.expectedVersion,
        reason:state
      });
      rollbackExecuted=rollbackReceipt?.rolledBack===true;
      state=rollbackExecuted?'ROLLED_BACK_AFTER_VERIFICATION_FAILURE':'ROLLBACK_FAILED';
    }
  }

  const durableCommitReceiptId=
    state==='CANARY_COMMIT_VERIFIED'
      ?stableId([executionId,'DURABLE_COMMIT_RECEIPT',clean(row.afterHash)],'GCRC')
      :'UNAVAILABLE';

  const durableRollbackReceiptId=
    rollbackExecuted
      ?stableId([executionId,'DURABLE_ROLLBACK_RECEIPT',clean(row.beforeHash)],'GRRC')
      :'UNAVAILABLE';

  const durableReceipt=Object.freeze({
    milestone:'M2.97',
    executionId,
    propertyId:row.propertyId,
    consumer,
    authorityLeaseId:row.authorityLeaseId,
    state,
    writeSucceeded,
    verificationSucceeded,
    rollbackExecuted,
    durableCommitReceiptId,
    durableRollbackReceiptId,
    authorityRelocked:true,
    oneUseTokenConsumed:true,
    automaticCommit:false,
    persistentWriteAuthority:false,
    bulkWrite:false,
    multiProperty:false
  });

  await adapter.persistReceipt(durableReceipt);
  await adapter.appendAudit({
    event:'M2.97_CANARY_EXECUTION_COMPLETE',
    ...durableReceipt
  });

  return Object.freeze({
    status:state==='CANARY_COMMIT_VERIFIED'?'COMMITTED':'SAFE_TERMINAL',
    state,
    executionId,
    propertyId:row.propertyId,
    consumer,
    writeAttempted:true,
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
    multiProperty:false,
    canonicalCommitted:state==='CANARY_COMMIT_VERIFIED'
  });
}

export function buildGovernedSingleTransactionCanonicalCanaryCommitExecutionVerificationRuntime(
  authorityRuntime={}
){
  const rows=Array.isArray(authorityRuntime?.records)?authorityRuntime.records:[];
  const records=CONSUMERS.map(consumer=>{
    const row=rows.find(r=>r?.consumer===consumer);
    const executable=
      authorityRuntime?.status==='READY' &&
      row?.state==='CANARY_WRITE_AUTHORIZED' &&
      row?.canaryWriteAuthorized===true &&
      row?.authorityLeaseId &&
      row?.authorityLeaseId!=='UNAVAILABLE';

    return Object.freeze({
      consumer,
      state:executable?'READY_FOR_SINGLE_CANARY_EXECUTION':'AWAITING_CANARY_AUTHORITY',
      authorityLeaseId:clean(row?.authorityLeaseId),
      propertyId:clean(row?.propertyId||authorityRuntime?.propertyId),
      executionCapability:executable,
      executionAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  });

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_97_GOVERNED_SINGLE_TRANSACTION_CANONICAL_CANARY_COMMIT_EXECUTION_VERIFICATION_RUNTIME',
    version:'3.0-m2.97',
    status:'READY',
    runtimeId:stableId([
      clean(authorityRuntime?.runtimeId),
      ...records.map(r=>`${r.consumer}:${r.state}:${r.authorityLeaseId}`)
    ],'GC97'),
    propertyId:clean(authorityRuntime?.propertyId),
    records:Object.freeze(records),
    consumerCount:CONSUMERS.length,
    executionReadyCount:records.filter(r=>r.executionCapability).length,
    singleTransactionOnly:true,
    singlePropertyOnly:true,
    oneUseAuthorityOnly:true,
    authorityAutoRelock:true,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    installerExecutesWrite:false,
    realCanonicalCommittedCount:0
  });
}
