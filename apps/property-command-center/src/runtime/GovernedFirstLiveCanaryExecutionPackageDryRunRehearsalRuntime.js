// SCIIP Explorer 3.0 — M3.03
// Governed First Live Canary Execution Package & Dry-Run Rehearsal Runtime

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GR303'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function exact(a,b){
  return clean(a)!=='UNAVAILABLE' && clean(a)===clean(b);
}

function hasMethod(adapter,name){
  return typeof adapter?.[name]==='function';
}

export function buildFirstLiveCanaryExecutionPackage({
  m302Handoff={},
  m301Preflight={},
  adapterCertification={},
  authorityRuntime={},
  payload
}={}){
  const consumer=clean(m301Preflight?.consumer);
  const auth=(authorityRuntime?.records||[]).find(r=>r?.consumer===consumer);

  const handoffReady=
    m302Handoff?.status==='AUTHORIZED' &&
    m302Handoff?.state==='FIRST_LIVE_CANARY_EXECUTION_HANDOFF_AUTHORIZED' &&
    m302Handoff?.m299InvocationAuthorized===true &&
    m302Handoff?.oneShot===true &&
    m302Handoff?.liveWriteExecuted===false &&
    m302Handoff?.canonicalCommitted===false &&
    clean(m302Handoff?.handoffId)!=='UNAVAILABLE';

  const preflightReady=
    m301Preflight?.status==='CERTIFIED' &&
    m301Preflight?.state==='FIRST_LIVE_CANARY_PREFLIGHT_CERTIFIED' &&
    m301Preflight?.preflightCertified===true &&
    m301Preflight?.liveWriteExecuted===false &&
    m301Preflight?.canonicalCommitted===false;

  const adapterReady=
    adapterCertification?.status==='READY' &&
    adapterCertification?.state==='LIVE_CANARY_EXECUTION_READY' &&
    adapterCertification?.liveCanaryExecutionReady===true;

  const authorityReady=
    auth?.state==='CANARY_WRITE_AUTHORIZED' &&
    auth?.canaryWriteAuthorized===true &&
    clean(auth?.authorityLeaseId)!=='UNAVAILABLE' &&
    clean(auth?.oneUseAuthorizationToken)!=='UNAVAILABLE';

  const request=m302Handoff?.request||{};

  const propertyExact=
    exact(request?.propertyId,m301Preflight?.propertyId) &&
    exact(request?.propertyId,adapterCertification?.propertyId) &&
    exact(request?.propertyId,auth?.propertyId);

  const versionExact=
    exact(request?.expectedVersion,m301Preflight?.evidence?.canonicalBefore?.version) &&
    exact(request?.expectedVersion,auth?.expectedVersion);

  const beforeHashExact=
    exact(request?.beforeHash,m301Preflight?.evidence?.canonicalBefore?.hash) &&
    exact(request?.beforeHash,auth?.beforeHash);

  const afterHashExact=
    exact(request?.afterHash,m301Preflight?.evidence?.canonicalAfter?.hash) &&
    exact(request?.afterHash,auth?.afterHash);

  const receiptExact=
    exact(request?.readinessReceiptId,adapterCertification?.readinessReceiptId);

  const authorityExact=
    exact(request?.authorityLeaseId,auth?.authorityLeaseId) &&
    exact(request?.oneUseAuthorizationToken,auth?.oneUseAuthorizationToken);

  const safeScope=
    request?.explicitLiveExecutionApproval===true &&
    request?.bulkWrite!==true &&
    request?.multiProperty!==true &&
    request?.persistentWriteAuthority!==true;

  const ready=
    handoffReady && preflightReady && adapterReady && authorityReady &&
    propertyExact && versionExact && beforeHashExact && afterHashExact &&
    receiptExact && authorityExact && safeScope;

  let state;
  if(!handoffReady) state='M3_02_HANDOFF_NOT_READY';
  else if(!preflightReady) state='M3_01_PREFLIGHT_NOT_READY';
  else if(!adapterReady) state='M2_98_ADAPTER_NOT_READY';
  else if(!authorityReady) state='M2_96_AUTHORITY_NOT_READY';
  else if(!propertyExact) state='EXECUTION_PACKAGE_PROPERTY_MISMATCH';
  else if(!versionExact) state='EXECUTION_PACKAGE_VERSION_MISMATCH';
  else if(!beforeHashExact) state='EXECUTION_PACKAGE_BEFORE_HASH_MISMATCH';
  else if(!afterHashExact) state='EXECUTION_PACKAGE_AFTER_HASH_MISMATCH';
  else if(!receiptExact) state='EXECUTION_PACKAGE_READINESS_RECEIPT_MISMATCH';
  else if(!authorityExact) state='EXECUTION_PACKAGE_AUTHORITY_MISMATCH';
  else if(!safeScope) state='EXECUTION_PACKAGE_SCOPE_PROHIBITED';
  else state='FIRST_LIVE_CANARY_EXECUTION_PACKAGE_READY';

  const executionPackageId=stableId([
    clean(m302Handoff?.handoffId),
    clean(m301Preflight?.preflightCertificationReceiptId),
    clean(adapterCertification?.readinessReceiptId),
    clean(auth?.authorityLeaseId),
    clean(auth?.oneUseAuthorizationToken),
    clean(request?.propertyId),
    clean(request?.expectedVersion),
    clean(request?.beforeHash),
    clean(request?.afterHash),
    state
  ],'GREP');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_03_GOVERNED_FIRST_LIVE_CANARY_EXECUTION_PACKAGE',
    version:'3.0-m3.03',
    status:ready?'READY':'BLOCKED',
    state,
    executionPackageId,
    propertyId:clean(request?.propertyId),
    consumer,
    readinessReceiptId:clean(request?.readinessReceiptId),
    authorityLeaseId:clean(request?.authorityLeaseId),
    oneUseAuthorizationToken:clean(request?.oneUseAuthorizationToken),
    expectedVersion:clean(request?.expectedVersion),
    beforeHash:clean(request?.beforeHash),
    afterHash:clean(request?.afterHash),
    payload,
    handoffId:clean(m302Handoff?.handoffId),
    preflightCertificationReceiptId:clean(m301Preflight?.preflightCertificationReceiptId),
    propertyExact,
    versionExact,
    beforeHashExact,
    afterHashExact,
    receiptExact,
    authorityExact,
    safeScope,
    writeEnabled:false,
    dryRunOnly:true,
    liveWriteExecuted:false,
    canonicalCommitted:false,
    oneShot:true,
    automaticRetryAllowed:false,
    authorityRelocked:true,
    generalizedWriteAuthority:false,
    bulkWrite:false,
    multiProperty:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export async function rehearseFirstLiveCanaryExecutionPackage({
  executionPackage={},
  adapter
}={}){
  const packageReady=
    executionPackage?.status==='READY' &&
    executionPackage?.state==='FIRST_LIVE_CANARY_EXECUTION_PACKAGE_READY' &&
    executionPackage?.writeEnabled===false &&
    executionPackage?.dryRunOnly===true &&
    executionPackage?.liveWriteExecuted===false &&
    executionPackage?.canonicalCommitted===false &&
    executionPackage?.oneShot===true;

  if(!packageReady){
    return Object.freeze({
      status:'BLOCKED',
      state:'EXECUTION_PACKAGE_NOT_READY',
      rehearsalCertified:false,
      writeAttempted:false,
      canonicalCommitted:false
    });
  }

  const methods={
    readCurrent:hasMethod(adapter,'readCurrent'),
    writeAtomic:hasMethod(adapter,'writeAtomic'),
    rollback:hasMethod(adapter,'rollback'),
    consumeToken:hasMethod(adapter,'consumeToken'),
    persistReceipt:hasMethod(adapter,'persistReceipt'),
    appendAudit:hasMethod(adapter,'appendAudit'),
    probeWrite:hasMethod(adapter,'probeWrite')
  };

  const methodsReady=Object.values(methods).every(Boolean);
  if(!methodsReady){
    return Object.freeze({
      status:'BLOCKED',
      state:'PRODUCTION_ADAPTER_CONTRACT_INCOMPLETE',
      methods,
      rehearsalCertified:false,
      writeAttempted:false,
      canonicalCommitted:false
    });
  }

  const rehearsalId=stableId([
    executionPackage.executionPackageId,
    executionPackage.propertyId,
    executionPackage.expectedVersion,
    executionPackage.beforeHash,
    executionPackage.afterHash,
    'DRY_RUN_REHEARSAL'
  ],'GRRH');

  const before=await adapter.readCurrent({
    propertyId:executionPackage.propertyId,
    executionId:rehearsalId,
    mode:'DRY_RUN',
    phase:'PRE_WRITE'
  });

  const liveVersionExact=exact(before?.version,executionPackage.expectedVersion);
  const liveHashExact=exact(before?.hash,executionPackage.beforeHash);

  if(!liveVersionExact || !liveHashExact){
    await adapter.appendAudit({
      event:'M3.03_REHEARSAL_BLOCKED_LIVE_STATE',
      rehearsalId,
      propertyId:executionPackage.propertyId,
      liveVersionExact,
      liveHashExact
    });
    return Object.freeze({
      status:'BLOCKED',
      state:!liveVersionExact?'REHEARSAL_LIVE_VERSION_MISMATCH':'REHEARSAL_LIVE_HASH_MISMATCH',
      rehearsalId,
      liveVersionExact,
      liveHashExact,
      rehearsalCertified:false,
      writeAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  }

  const tokenProbe=await adapter.consumeToken({
    token:executionPackage.oneUseAuthorizationToken,
    authorityLeaseId:executionPackage.authorityLeaseId,
    executionId:rehearsalId,
    mode:'DRY_RUN_VALIDATE_ONLY'
  });

  const tokenContractValid=
    tokenProbe?.valid===true &&
    tokenProbe?.consumed!==true &&
    tokenProbe?.mutationPerformed!==true;

  if(!tokenContractValid){
    await adapter.appendAudit({
      event:'M3.03_REHEARSAL_TOKEN_CONTRACT_FAILED',
      rehearsalId,
      propertyId:executionPackage.propertyId
    });
    return Object.freeze({
      status:'BLOCKED',
      state:'REHEARSAL_TOKEN_CONTRACT_FAILED',
      rehearsalId,
      rehearsalCertified:false,
      writeAttempted:false,
      canonicalCommitted:false,
      authorityRelocked:true
    });
  }

  const writeProbe=await adapter.probeWrite({
    propertyId:executionPackage.propertyId,
    expectedVersion:executionPackage.expectedVersion,
    expectedBeforeHash:executionPackage.beforeHash,
    expectedAfterHash:executionPackage.afterHash,
    executionId:rehearsalId,
    payload:executionPackage.payload,
    mode:'DRY_RUN_NO_MUTATION'
  });

  const writePathValid=
    writeProbe?.ok===true &&
    writeProbe?.mutationPerformed!==true &&
    writeProbe?.wouldCommit===true &&
    writeProbe?.atomic===true;

  const rollbackPathValid=
    writeProbe?.rollbackAvailable===true &&
    writeProbe?.rollbackWouldRestoreBeforeHash===true;

  const verificationPathValid=
    writeProbe?.readAfterWriteVerificationAvailable===true &&
    writeProbe?.expectedAfterHash===executionPackage.afterHash;

  const receiptPathValid=
    writeProbe?.durableReceiptAvailable===true;

  const auditPathValid=
    writeProbe?.durableAuditAvailable===true;

  const relockPathValid=
    writeProbe?.authorityAutoRelockAvailable===true;

  let state;
  if(!writePathValid) state='REHEARSAL_WRITE_PATH_FAILED';
  else if(!rollbackPathValid) state='REHEARSAL_ROLLBACK_PATH_FAILED';
  else if(!verificationPathValid) state='REHEARSAL_VERIFICATION_PATH_FAILED';
  else if(!receiptPathValid) state='REHEARSAL_RECEIPT_PATH_FAILED';
  else if(!auditPathValid) state='REHEARSAL_AUDIT_PATH_FAILED';
  else if(!relockPathValid) state='REHEARSAL_RELOCK_PATH_FAILED';
  else state='FIRST_LIVE_CANARY_EXECUTION_REHEARSAL_CERTIFIED';

  const certified=state==='FIRST_LIVE_CANARY_EXECUTION_REHEARSAL_CERTIFIED';

  const rehearsalReceiptId=certified
    ?stableId([
        rehearsalId,
        executionPackage.executionPackageId,
        executionPackage.propertyId,
        executionPackage.beforeHash,
        executionPackage.afterHash,
        'CERTIFIED_ZERO_WRITE'
      ],'GRRC')
    :'UNAVAILABLE';

  const receipt=Object.freeze({
    milestone:'M3.03',
    rehearsalId,
    rehearsalReceiptId,
    executionPackageId:executionPackage.executionPackageId,
    propertyId:executionPackage.propertyId,
    state,
    liveVersionExact,
    liveHashExact,
    tokenContractValid,
    writePathValid,
    rollbackPathValid,
    verificationPathValid,
    receiptPathValid,
    auditPathValid,
    relockPathValid,
    writeAttempted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    authorityRelocked:true
  });

  await adapter.persistReceipt(receipt);
  await adapter.appendAudit({
    event:'M3.03_FIRST_LIVE_CANARY_DRY_RUN_REHEARSAL_COMPLETE',
    ...receipt
  });

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_03_GOVERNED_FIRST_LIVE_CANARY_EXECUTION_DRY_RUN_REHEARSAL',
    version:'3.0-m3.03',
    status:certified?'CERTIFIED':'BLOCKED',
    state,
    rehearsalId,
    rehearsalReceiptId,
    executionPackageId:executionPackage.executionPackageId,
    propertyId:executionPackage.propertyId,
    methods:Object.freeze(methods),
    liveVersionExact,
    liveHashExact,
    tokenContractValid,
    writePathValid,
    rollbackPathValid,
    verificationPathValid,
    receiptPathValid,
    auditPathValid,
    relockPathValid,
    rehearsalCertified:certified,
    liveWriteExecuted:false,
    writeAttempted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0,
    authorityRelocked:true,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export function buildGovernedFirstLiveCanaryExecutionPackageDryRunRehearsalRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_03_GOVERNED_FIRST_LIVE_CANARY_EXECUTION_PACKAGE_DRY_RUN_REHEARSAL_RUNTIME',
    version:'3.0-m3.03',
    status:'READY',
    installerExecutesWrite:false,
    executionPackageRequired:true,
    dryRunRehearsalRequired:true,
    productionAdapterPathRequired:true,
    productionWriteMethodMustRemainUninvoked:true,
    liveStateRevalidationRequired:true,
    tokenValidationWithoutConsumptionRequired:true,
    rollbackPathRequired:true,
    readAfterWriteVerificationPathRequired:true,
    durableReceiptPathRequired:true,
    durableAuditPathRequired:true,
    authorityAutoRelockPathRequired:true,
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
