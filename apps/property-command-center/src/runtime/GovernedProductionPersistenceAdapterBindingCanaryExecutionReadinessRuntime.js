// SCIIP Explorer 3.0 — M2.98
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GP98'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function validateMethod(adapter,name){
  return typeof adapter?.[name]==='function';
}

export async function certifyGovernedProductionPersistenceAdapterBinding({
  executionRuntime={},
  consumer,
  adapter,
  descriptor={}
}={}){
  const row=(executionRuntime?.records||[]).find(r=>r?.consumer===consumer);

  const executionReady=
    executionRuntime?.status==='READY' &&
    executionRuntime?.singleTransactionOnly===true &&
    executionRuntime?.singlePropertyOnly===true &&
    executionRuntime?.oneUseAuthorityOnly===true &&
    executionRuntime?.authorityAutoRelock===true &&
    executionRuntime?.bulkWritesAllowed===false &&
    executionRuntime?.multiPropertyWritesAllowed===false &&
    executionRuntime?.persistentWriteAuthority===false &&
    executionRuntime?.automaticCommit===false &&
    executionRuntime?.installerExecutesWrite===false &&
    row?.executionCapability===true &&
    row?.state==='READY_FOR_SINGLE_CANARY_EXECUTION';

  const methods={
    readCurrent:validateMethod(adapter,'readCurrent'),
    writeAtomic:validateMethod(adapter,'writeAtomic'),
    rollback:validateMethod(adapter,'rollback'),
    appendAudit:validateMethod(adapter,'appendAudit'),
    persistReceipt:validateMethod(adapter,'persistReceipt'),
    consumeToken:validateMethod(adapter,'consumeToken')
  };

  const allMethodsBound=Object.values(methods).every(Boolean);

  const environmentId=clean(descriptor?.environmentId);
  const expectedEnvironmentId=clean(descriptor?.expectedEnvironmentId);
  const environmentValid=
    environmentId!=='UNAVAILABLE' &&
    expectedEnvironmentId!=='UNAVAILABLE' &&
    environmentId===expectedEnvironmentId &&
    descriptor?.production===true;

  const productionTargetId=clean(descriptor?.productionTargetId);
  const canonicalTargetId=clean(descriptor?.canonicalTargetId);
  const targetValid=
    productionTargetId!=='UNAVAILABLE' &&
    canonicalTargetId!=='UNAVAILABLE' &&
    productionTargetId===canonicalTargetId;

  const credentialScopeValid=
    descriptor?.credentialScope==='SINGLE_PROPERTY_CANARY_WRITE' &&
    descriptor?.bulkWriteCredential===false &&
    descriptor?.multiPropertyCredential===false &&
    descriptor?.persistentWriteCredential===false;

  const atomicCapability=descriptor?.supportsAtomicWrite===true;
  const rollbackCapability=descriptor?.supportsRollback===true;
  const readAfterWriteCapability=descriptor?.supportsReadAfterWrite===true;
  const tokenCapability=descriptor?.supportsOneUseTokenConsumption===true;
  const durableReceiptCapability=descriptor?.supportsDurableReceiptStore===true;
  const durableAuditCapability=descriptor?.supportsDurableAuditAppend===true;
  const expectedVersionCapability=descriptor?.supportsExpectedVersion===true;
  const idempotencyCapability=descriptor?.supportsIdempotency===true;

  const probeAllowed=descriptor?.allowNonMutatingProbe===true;
  let probeResult={ok:false,state:'PROBE_NOT_RUN'};

  if(allMethodsBound && probeAllowed && typeof adapter?.probe==='function'){
    const p=await adapter.probe({
      mode:'NON_MUTATING',
      propertyId:clean(row?.propertyId||executionRuntime?.propertyId),
      environmentId,
      productionTargetId
    });
    probeResult={
      ok:p?.ok===true &&
         p?.mutationPerformed!==true &&
         p?.environmentId===environmentId &&
         p?.targetId===productionTargetId,
      state:p?.ok===true?'PROBE_OK':'PROBE_FAILED',
      mutationPerformed:p?.mutationPerformed===true,
      reportedEnvironmentId:clean(p?.environmentId),
      reportedTargetId:clean(p?.targetId)
    };
  }

  const liveReady=
    executionReady &&
    allMethodsBound &&
    environmentValid &&
    targetValid &&
    credentialScopeValid &&
    atomicCapability &&
    rollbackCapability &&
    readAfterWriteCapability &&
    tokenCapability &&
    durableReceiptCapability &&
    durableAuditCapability &&
    expectedVersionCapability &&
    idempotencyCapability &&
    probeResult.ok===true &&
    probeResult.mutationPerformed===false;

  let state;
  if(!executionReady) state='M2_97_EXECUTION_NOT_READY';
  else if(!allMethodsBound) state='ADAPTER_METHOD_BINDING_INCOMPLETE';
  else if(!environmentValid) state='PRODUCTION_ENVIRONMENT_IDENTITY_INVALID';
  else if(!targetValid) state='CANONICAL_TARGET_IDENTITY_INVALID';
  else if(!credentialScopeValid) state='CREDENTIAL_SCOPE_INVALID';
  else if(!atomicCapability) state='ATOMIC_WRITE_CAPABILITY_MISSING';
  else if(!rollbackCapability) state='ROLLBACK_CAPABILITY_MISSING';
  else if(!readAfterWriteCapability) state='READ_AFTER_WRITE_CAPABILITY_MISSING';
  else if(!tokenCapability) state='ONE_USE_TOKEN_CAPABILITY_MISSING';
  else if(!durableReceiptCapability) state='DURABLE_RECEIPT_CAPABILITY_MISSING';
  else if(!durableAuditCapability) state='DURABLE_AUDIT_CAPABILITY_MISSING';
  else if(!expectedVersionCapability) state='EXPECTED_VERSION_CAPABILITY_MISSING';
  else if(!idempotencyCapability) state='IDEMPOTENCY_CAPABILITY_MISSING';
  else if(!probeAllowed) state='NON_MUTATING_PROBE_NOT_ALLOWED';
  else if(typeof adapter?.probe!=='function') state='NON_MUTATING_PROBE_METHOD_MISSING';
  else if(!probeResult.ok) state='NON_MUTATING_PROBE_FAILED';
  else state='LIVE_CANARY_EXECUTION_READY';

  const certificationId=stableId([
    clean(executionRuntime?.runtimeId),
    consumer,
    clean(row?.authorityLeaseId),
    environmentId,
    productionTargetId,
    canonicalTargetId,
    descriptor?.credentialScope||'UNAVAILABLE',
    state
  ],'GPBC');

  const readinessReceiptId=state==='LIVE_CANARY_EXECUTION_READY'
    ?stableId([certificationId,'LIVE_CANARY_EXECUTION_READINESS'],'GPRC')
    :'UNAVAILABLE';

  return Object.freeze({
    milestone:'M2.98',
    status:state==='LIVE_CANARY_EXECUTION_READY'?'READY':'BLOCKED',
    state,
    certificationId,
    readinessReceiptId,
    consumer,
    propertyId:clean(row?.propertyId||executionRuntime?.propertyId),
    authorityLeaseId:clean(row?.authorityLeaseId),
    environmentId,
    productionTargetId,
    canonicalTargetId,
    methods:Object.freeze(methods),
    allMethodsBound,
    environmentValid,
    targetValid,
    credentialScopeValid,
    atomicCapability,
    rollbackCapability,
    readAfterWriteCapability,
    tokenCapability,
    durableReceiptCapability,
    durableAuditCapability,
    expectedVersionCapability,
    idempotencyCapability,
    probeResult:Object.freeze(probeResult),
    liveCanaryExecutionReady:state==='LIVE_CANARY_EXECUTION_READY',
    canonicalWriteExecuted:false,
    installerExecutedWrite:false,
    automaticCommit:false,
    persistentWriteAuthority:false,
    bulkWriteAuthority:false,
    multiPropertyWriteAuthority:false
  });
}

export function buildGovernedProductionPersistenceAdapterBindingCanaryExecutionReadinessRuntime(
  executionRuntime={}
){
  const rows=Array.isArray(executionRuntime?.records)?executionRuntime.records:[];
  const records=CONSUMERS.map(consumer=>{
    const r=rows.find(x=>x?.consumer===consumer);
    const capability=
      executionRuntime?.status==='READY' &&
      r?.executionCapability===true &&
      r?.state==='READY_FOR_SINGLE_CANARY_EXECUTION';

    return Object.freeze({
      consumer,
      propertyId:clean(r?.propertyId||executionRuntime?.propertyId),
      authorityLeaseId:clean(r?.authorityLeaseId),
      state:capability?'AWAITING_PRODUCTION_ADAPTER_CERTIFICATION':'M2_97_EXECUTION_NOT_READY',
      productionAdapterCertificationReady:capability,
      liveCanaryExecutionReady:false,
      canonicalWriteExecuted:false
    });
  });

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_98_GOVERNED_PRODUCTION_PERSISTENCE_ADAPTER_BINDING_CANARY_EXECUTION_READINESS_RUNTIME',
    version:'3.0-m2.98',
    status:'READY',
    runtimeId:stableId([
      clean(executionRuntime?.runtimeId),
      ...records.map(r=>`${r.consumer}:${r.state}:${r.authorityLeaseId}`)
    ],'GP98'),
    propertyId:clean(executionRuntime?.propertyId),
    records:Object.freeze(records),
    consumerCount:CONSUMERS.length,
    adapterCertificationReadyCount:records.filter(r=>r.productionAdapterCertificationReady).length,
    liveCanaryExecutionReadyCount:0,
    productionAdapterBindingRequired:true,
    nonMutatingProbeRequired:true,
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
