// SCIIP Explorer 3.0 — M2.91
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GDRY'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedCanonicalPersistenceAdapterBindingDryRunTransactionRuntime(
  persistenceBoundaryRuntime={},
  adapterDescriptor={},
  dryRunRequests={}
){
  const upstreamReady=
    persistenceBoundaryRuntime?.status==='READY' &&
    persistenceBoundaryRuntime?.boundaryState==='PERSISTENCE_BOUNDARY_READY' &&
    persistenceBoundaryRuntime?.canonicalWriteAuthority===false &&
    persistenceBoundaryRuntime?.automaticCommit===false;

  const adapter=Object.freeze({
    adapterId:clean(adapterDescriptor?.adapterId,'CANONICAL-PERSISTENCE-DRYRUN'),
    adapterType:clean(adapterDescriptor?.adapterType,'SCIIP_CANONICAL_PROPERTY_STORE'),
    bindingMode:'DRY_RUN_ONLY',
    bound:adapterDescriptor?.bound===true,
    supportsExpectedVersion:adapterDescriptor?.supportsExpectedVersion!==false,
    supportsIdempotency:adapterDescriptor?.supportsIdempotency!==false,
    supportsAtomicTransaction:adapterDescriptor?.supportsAtomicTransaction!==false,
    supportsRollbackReceipt:adapterDescriptor?.supportsRollbackReceipt!==false
  });

  const records=CONSUMERS.map(consumer=>{
    const upstream=(persistenceBoundaryRuntime?.records||[]).find(r=>r?.consumer===consumer);
    const request=dryRunRequests?.[consumer]||{};
    const requested=request?.dryRun===true;
    const expectedVersion=clean(request?.expectedVersion,clean(upstream?.expectedVersion,'UNSPECIFIED'));
    const currentVersion=clean(request?.currentVersion,clean(upstream?.currentVersion,'UNSPECIFIED'));

    const versionConflict=
      requested &&
      expectedVersion!=='UNSPECIFIED' &&
      currentVersion!=='UNSPECIFIED' &&
      expectedVersion!==currentVersion;

    const upstreamEligible=
      upstreamReady &&
      (
        upstream?.state==='READY_FOR_ATOMIC_COMMIT' ||
        upstream?.state==='PERSISTENCE_NOT_BOUND' ||
        upstream?.state==='AWAITING_COMMIT_REQUEST'
      );

    let state;
    if(!upstreamReady) state='BLOCKED';
    else if(!upstreamEligible) state='NOT_READY';
    else if(!requested) state='AWAITING_DRY_RUN_REQUEST';
    else if(!adapter.bound) state='ADAPTER_NOT_BOUND';
    else if(versionConflict) state='VERSION_CONFLICT';
    else state='DRY_RUN_VALIDATED';

    const transactionId=stableId([
      clean(persistenceBoundaryRuntime?.runtimeId),
      consumer,
      clean(upstream?.boundaryId),
      clean(upstream?.idempotencyKey),
      expectedVersion,
      currentVersion,
      state
    ],'GDTX');

    const receiptId=state==='DRY_RUN_VALIDATED'
      ?stableId([transactionId,'DRY_RUN_RECEIPT'],'GDRC')
      :'UNAVAILABLE';

    return Object.freeze({
      consumer,
      transactionId,
      transactionKey:`M2.91:${clean(persistenceBoundaryRuntime?.propertyId)}:${consumer}`,
      receiptId,
      boundaryId:clean(upstream?.boundaryId),
      idempotencyKey:clean(upstream?.idempotencyKey),
      commitIntentId:clean(upstream?.commitIntentId),
      propertyId:clean(upstream?.propertyId||persistenceBoundaryRuntime?.propertyId),
      expectedVersion,
      currentVersion,
      versionConflict,
      state,
      requested,
      dryRun:true,
      transactionPrepared:state==='DRY_RUN_VALIDATED',
      transactionCommitted:false,
      canonicalWrite:false,
      canonicalWriteAuthority:false,
      automaticCommit:false,
      rollbackRequired:false,
      rollbackReceiptId:'UNAVAILABLE',
      readOnly:true,
      appendOnly:true
    });
  });

  const count=s=>records.filter(r=>r.state===s).length;
  const blockedCount=count('BLOCKED');
  const ready=upstreamReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(persistenceBoundaryRuntime?.runtimeId),
    adapter.adapterId,
    adapter.bound?'BOUND':'UNBOUND',
    ...records.map(r=>`${r.consumer}:${r.transactionId}:${r.state}`)
  ],'GDRR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_91_GOVERNED_CANONICAL_PERSISTENCE_ADAPTER_BINDING_DRY_RUN_TRANSACTION_RUNTIME',
    version:'3.0-m2.91',
    status:ready?'READY':'BLOCKED',
    dryRunState:ready?'DRY_RUN_RUNTIME_READY':'BLOCKED',
    runtimeId,
    persistenceBoundaryRuntimeId:clean(persistenceBoundaryRuntime?.runtimeId),
    propertyId:clean(persistenceBoundaryRuntime?.propertyId),
    adapter,
    records:Object.freeze(records),
    consumerCount:CONSUMERS.length,
    dryRunValidatedCount:count('DRY_RUN_VALIDATED'),
    awaitingDryRunRequestCount:count('AWAITING_DRY_RUN_REQUEST'),
    adapterNotBoundCount:count('ADAPTER_NOT_BOUND'),
    versionConflictCount:count('VERSION_CONFLICT'),
    committedCount:0,
    canonicalWriteAuthority:false,
    automaticCommit:false,
    canonicalMutation:false,
    governedMutation:false,
    dryRunOnly:true,
    readOnly:true,
    appendOnly:true
  });
}
