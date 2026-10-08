// SCIIP Explorer 3.0 — M3.20
// Governed Single-Use Six-Field Canonical Canary Commit Execution & Read-After-Write Verification Runtime

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));

function stableId(parts,prefix='G320'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function exactValue(a,b){
  return JSON.stringify(a)===JSON.stringify(b);
}

function assertAdapter(adapter){
  const required=['readCurrent','writeAtomic','rollback','consumeToken','persistReceipt','appendAudit'];
  for(const fn of required){
    if(typeof adapter?.[fn]!=='function'){
      throw new Error(`M3.20 production adapter missing ${fn}()`);
    }
  }
}

export function buildGovernedSingleUseSixFieldCanonicalCanaryCommitExecutionReadAfterWriteVerificationRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_20_GOVERNED_SINGLE_USE_SIX_FIELD_CANONICAL_CANARY_COMMIT_EXECUTION_READ_AFTER_WRITE_VERIFICATION_RUNTIME',
    version:'3.0-m3.20',
    status:'READY',
    m319EvidenceRequired:true,
    explicitLiveInvocationRequired:true,
    exactManifestBindingRequired:true,
    exactPropertyRequired:true,
    exactFieldRequired:true,
    exactBeforeValueRequired:true,
    expectedVersionRequired:true,
    oneUseTokenRequired:true,
    oneTransactionOnly:true,
    singlePropertyOnly:true,
    singleFieldOnly:true,
    readAfterWriteVerificationRequired:true,
    rollbackOnVerificationFailure:true,
    durableCommitReceiptRequired:true,
    durableRollbackReceiptRequired:true,
    durableAuditRequired:true,
    authorityAutoRelock:true,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    realCanonicalCommittedCountAtInstall:0
  });
}

function verifyManifestBinding(m319Evidence,request){
  const pre=m319Evidence?.preCommitCertification;
  if(!pre) return {ok:false,state:'M3_19_PRECOMMIT_CERTIFICATION_MISSING'};

  const gates=pre?.gates||{};
  const allGates=Object.values(gates).every(Boolean);

  const exact =
    m319Evidence?.status==='CERTIFIED' &&
    m319Evidence?.state==='CANARY_SELECTION_PRE_COMMIT_EVIDENCE_CERTIFIED' &&
    pre?.status==='CERTIFIED' &&
    pre?.state==='SINGLE_CANARY_PRE_COMMIT_CERTIFIED' &&
    pre?.readyForM320Execution===true &&
    pre?.singleUseOnly===true &&
    allGates &&
    clean(request?.executionManifestId)===clean(pre?.executionManifestId) &&
    clean(request?.singleUseToken)===clean(pre?.singleUseToken) &&
    clean(request?.propertyId)===clean(pre?.target?.propertyId) &&
    clean(request?.fieldName)===clean(pre?.target?.fieldName) &&
    exactValue(request?.expectedBeforeValue,pre?.target?.beforeValue) &&
    exactValue(request?.expectedAfterValue,pre?.target?.afterValue) &&
    clean(request?.expectedVersion)===clean(pre?.target?.currentVersion) &&
    clean(request?.cryptographicBinding)===clean(pre?.cryptographicBinding);

  return {
    ok:exact,
    state:exact?'M3_19_MANIFEST_BINDING_VERIFIED':'M3_19_MANIFEST_BINDING_MISMATCH',
    pre
  };
}

export async function executeGovernedSingleUseSixFieldCanonicalCanary({
  m319Evidence,
  request,
  adapter
}={}){
  assertAdapter(adapter);

  const binding=verifyManifestBinding(m319Evidence,request);
  if(!binding.ok){
    return Object.freeze({
      status:'BLOCKED',
      state:binding.state,
      writeAttempted:false,
      canonicalCommitted:false,
      oneUseTokenConsumed:false,
      authorityRelocked:true
    });
  }

  if(request?.explicitLiveExecutionApproval!==true){
    return Object.freeze({
      status:'BLOCKED',
      state:'EXPLICIT_LIVE_EXECUTION_APPROVAL_REQUIRED',
      writeAttempted:false,
      canonicalCommitted:false,
      oneUseTokenConsumed:false,
      authorityRelocked:true
    });
  }

  if(request?.bulkWrite===true||request?.multiProperty===true||request?.multiField===true||request?.persistentWriteAuthority===true){
    return Object.freeze({
      status:'BLOCKED',
      state:'PROHIBITED_WRITE_SCOPE',
      writeAttempted:false,
      canonicalCommitted:false,
      oneUseTokenConsumed:false,
      authorityRelocked:true
    });
  }

  const pre=binding.pre;
  const executionId=stableId([
    clean(pre?.executionManifestId),
    clean(pre?.singleUseToken),
    clean(pre?.target?.propertyId),
    clean(pre?.target?.fieldName),
    JSON.stringify(pre?.target?.beforeValue),
    JSON.stringify(pre?.target?.afterValue),
    clean(pre?.target?.currentVersion),
    clean(pre?.cryptographicBinding)
  ],'G3EX');

  const before=await adapter.readCurrent({
    propertyId:request.propertyId,
    fieldName:request.fieldName,
    executionId,
    phase:'PRE_WRITE'
  });

  const observedBeforeValue =
    before?.fieldValue!==undefined ? before.fieldValue :
    before?.value!==undefined ? before.value :
    before?.fields?.[request.fieldName];

  const versionOk=clean(before?.version)===clean(request.expectedVersion);
  const beforeValueOk=exactValue(observedBeforeValue,request.expectedBeforeValue);
  const propertyOk=clean(before?.propertyId,request.propertyId)===clean(request.propertyId);
  const fieldOk=clean(before?.fieldName,request.fieldName)===clean(request.fieldName);

  if(!(versionOk&&beforeValueOk&&propertyOk&&fieldOk)){
    await adapter.appendAudit({
      event:'M3.20_PREWRITE_VERIFICATION_BLOCKED',
      executionId,
      propertyId:request.propertyId,
      fieldName:request.fieldName,
      expectedVersion:request.expectedVersion,
      observedVersion:clean(before?.version),
      expectedBeforeValue:clone(request.expectedBeforeValue),
      observedBeforeValue:clone(observedBeforeValue),
      versionOk,beforeValueOk,propertyOk,fieldOk
    });

    return Object.freeze({
      status:'BLOCKED',
      state:!versionOk?'PREWRITE_VERSION_MISMATCH':
            !beforeValueOk?'PREWRITE_BEFORE_VALUE_MISMATCH':
            !propertyOk?'PREWRITE_PROPERTY_MISMATCH':'PREWRITE_FIELD_MISMATCH',
      executionId,
      writeAttempted:false,
      canonicalCommitted:false,
      oneUseTokenConsumed:false,
      authorityRelocked:true
    });
  }

  const token=await adapter.consumeToken({
    token:request.singleUseToken,
    executionManifestId:request.executionManifestId,
    executionId
  });

  if(token?.consumed!==true){
    await adapter.appendAudit({
      event:'M3.20_SINGLE_USE_TOKEN_CONSUMPTION_FAILED',
      executionId,
      propertyId:request.propertyId,
      fieldName:request.fieldName
    });

    return Object.freeze({
      status:'BLOCKED',
      state:'SINGLE_USE_TOKEN_CONSUMPTION_FAILED',
      executionId,
      writeAttempted:false,
      canonicalCommitted:false,
      oneUseTokenConsumed:false,
      authorityRelocked:true
    });
  }

  let writeReceipt=null;
  let after=null;
  let rollbackReceipt=null;
  let writeSucceeded=false;
  let verificationSucceeded=false;
  let rollbackExecuted=false;
  let state='CANONICAL_WRITE_FAILED';

  try{
    writeReceipt=await adapter.writeAtomic({
      propertyId:request.propertyId,
      fieldName:request.fieldName,
      expectedVersion:request.expectedVersion,
      expectedBeforeValue:clone(request.expectedBeforeValue),
      executionManifestId:request.executionManifestId,
      executionId,
      idempotencyKey:request.singleUseToken,
      payload:Object.freeze({
        fieldName:request.fieldName,
        value:clone(request.expectedAfterValue)
      })
    });

    writeSucceeded=writeReceipt?.committed===true;
    if(!writeSucceeded){
      state='CANONICAL_WRITE_FAILED';
      throw new Error('M3.20 atomic write did not commit');
    }

    after=await adapter.readCurrent({
      propertyId:request.propertyId,
      fieldName:request.fieldName,
      executionId,
      phase:'POST_WRITE'
    });

    const observedAfterValue =
      after?.fieldValue!==undefined ? after.fieldValue :
      after?.value!==undefined ? after.value :
      after?.fields?.[request.fieldName];

    const afterPropertyOk=clean(after?.propertyId,request.propertyId)===clean(request.propertyId);
    const afterFieldOk=clean(after?.fieldName,request.fieldName)===clean(request.fieldName);
    const afterValueOk=exactValue(observedAfterValue,request.expectedAfterValue);
    const versionAdvanced=clean(after?.version)!==clean(request.expectedVersion);

    verificationSucceeded=afterPropertyOk&&afterFieldOk&&afterValueOk&&versionAdvanced;

    if(!verificationSucceeded){
      state='READ_AFTER_WRITE_VERIFICATION_FAILED';
      throw new Error('M3.20 read-after-write verification failed');
    }

    state='SINGLE_CANARY_COMMIT_VERIFIED';
  }catch(error){
    if(writeSucceeded){
      rollbackReceipt=await adapter.rollback({
        propertyId:request.propertyId,
        fieldName:request.fieldName,
        executionManifestId:request.executionManifestId,
        executionId,
        restoreValue:clone(pre?.rollbackMaterial?.restoreValue),
        sourceEventHash:clean(pre?.rollbackMaterial?.sourceEventHash),
        sourceChangeHash:clean(pre?.rollbackMaterial?.sourceChangeHash),
        reason:state
      });

      rollbackExecuted=rollbackReceipt?.rolledBack===true;
      state=rollbackExecuted?'SINGLE_CANARY_ROLLED_BACK':'SINGLE_CANARY_ROLLBACK_FAILED';
    }
  }

  const durableCommitReceiptId=state==='SINGLE_CANARY_COMMIT_VERIFIED'
    ? stableId([executionId,'COMMIT',clean(request.propertyId),clean(request.fieldName),JSON.stringify(request.expectedAfterValue)],'G3CR')
    : 'UNAVAILABLE';

  const durableRollbackReceiptId=rollbackExecuted
    ? stableId([executionId,'ROLLBACK',clean(request.propertyId),clean(request.fieldName),JSON.stringify(pre?.rollbackMaterial?.restoreValue)],'G3RR')
    : 'UNAVAILABLE';

  const certificationId=stableId([
    executionId,state,durableCommitReceiptId,durableRollbackReceiptId
  ],'G3PC');

  const receipt=Object.freeze({
    milestone:'M3.20',
    executionId,
    postCommitCertificationId:certificationId,
    executionManifestId:request.executionManifestId,
    propertyId:request.propertyId,
    fieldName:request.fieldName,
    expectedBeforeValue:clone(request.expectedBeforeValue),
    expectedAfterValue:clone(request.expectedAfterValue),
    expectedVersion:request.expectedVersion,
    state,
    writeSucceeded,
    verificationSucceeded,
    rollbackExecuted,
    durableCommitReceiptId,
    durableRollbackReceiptId,
    oneUseTokenConsumed:true,
    authorityRelocked:true,
    singleTransaction:true,
    singleProperty:true,
    singleField:true,
    persistentWriteAuthority:false,
    automaticCommit:false,
    automaticRetry:false,
    bulkWrite:false,
    multiProperty:false
  });

  await adapter.persistReceipt(receipt);
  await adapter.appendAudit({
    event:'M3.20_SINGLE_USE_CANARY_EXECUTION_COMPLETE',
    ...receipt
  });

  return Object.freeze({
    status:state==='SINGLE_CANARY_COMMIT_VERIFIED'?'COMMITTED':'SAFE_TERMINAL',
    state,
    executionId,
    postCommitCertificationId:certificationId,
    propertyId:request.propertyId,
    fieldName:request.fieldName,
    writeAttempted:true,
    writeSucceeded,
    verificationSucceeded,
    rollbackExecuted,
    durableCommitReceiptId,
    durableRollbackReceiptId,
    canonicalCommitted:state==='SINGLE_CANARY_COMMIT_VERIFIED',
    canonicalCommittedCount:state==='SINGLE_CANARY_COMMIT_VERIFIED'?1:0,
    oneUseTokenConsumed:true,
    authorityRelocked:true,
    persistentWriteAuthority:false,
    automaticCommit:false,
    automaticRetry:false,
    bulkWrite:false,
    multiProperty:false,
    multiField:false
  });
}
