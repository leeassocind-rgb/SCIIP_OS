// SCIIP Explorer 3.0 — M2.92
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const stable=(v)=>JSON.stringify(v,Object.keys(v||{}).sort());
function stableId(parts,prefix='GCR'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedCanonicalPersistenceTransactionValidationCommitReadinessRuntime(
  dryRunRuntime={}, validationRequests={}
){
  const upstreamReady=
    dryRunRuntime?.status==='READY' &&
    dryRunRuntime?.dryRunState==='DRY_RUN_RUNTIME_READY' &&
    dryRunRuntime?.dryRunOnly===true &&
    dryRunRuntime?.canonicalWriteAuthority===false &&
    dryRunRuntime?.automaticCommit===false &&
    dryRunRuntime?.committedCount===0;

  const records=CONSUMERS.map(consumer=>{
    const upstream=(dryRunRuntime?.records||[]).find(r=>r?.consumer===consumer)||{};
    const request=validationRequests?.[consumer]||{};
    const requested=request?.validate===true;
    const schemaValid=request?.schemaValid!==false;
    const targetValid=request?.targetValid!==false;
    const preconditionsValid=request?.preconditionsValid!==false;
    const idempotencyValid=request?.idempotencyValid!==false && clean(upstream?.idempotencyKey)!=='UNAVAILABLE';
    const expectedVersion=clean(request?.expectedVersion,clean(upstream?.expectedVersion,'UNSPECIFIED'));
    const currentVersion=clean(request?.currentVersion,clean(upstream?.currentVersion,'UNSPECIFIED'));
    const versionValid=expectedVersion!=='UNSPECIFIED'&&currentVersion!=='UNSPECIFIED'&&expectedVersion===currentVersion;
    const dryRunValidated=upstream?.state==='DRY_RUN_VALIDATED'&&upstream?.transactionPrepared===true&&upstream?.transactionCommitted===false;
    const conflict=upstream?.versionConflict===true||!versionValid;

    const before=request?.before&&typeof request.before==='object'?request.before:{};
    const after=request?.after&&typeof request.after==='object'?request.after:{};
    const mutationKeys=Array.from(new Set([...Object.keys(before),...Object.keys(after)])).sort()
      .filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k]));
    const mutationDiff=Object.freeze(mutationKeys.map(field=>Object.freeze({field,before:before[field]??null,after:after[field]??null})));

    let state;
    if(!upstreamReady) state='BLOCKED';
    else if(!requested) state='AWAITING_VALIDATION_REQUEST';
    else if(!dryRunValidated) state='DRY_RUN_NOT_VALIDATED';
    else if(!schemaValid) state='SCHEMA_INVALID';
    else if(!targetValid) state='TARGET_INVALID';
    else if(!preconditionsValid) state='PRECONDITION_FAILED';
    else if(!idempotencyValid) state='IDEMPOTENCY_INVALID';
    else if(conflict) state='VERSION_CONFLICT';
    else state='COMMIT_READY';

    const commitPlanId=state==='COMMIT_READY'?stableId([
      clean(dryRunRuntime?.runtimeId),consumer,clean(upstream?.transactionId),
      clean(upstream?.idempotencyKey),expectedVersion,currentVersion,stable(before),stable(after)
    ],'GCPL'):'UNAVAILABLE';
    const rollbackPlanId=state==='COMMIT_READY'?stableId([commitPlanId,'ROLLBACK',stable(before)],'GRPL'):'UNAVAILABLE';
    const readinessReceiptId=requested?stableId([
      clean(upstream?.transactionId),consumer,state,commitPlanId,rollbackPlanId
    ],'GCRR'):'UNAVAILABLE';

    return Object.freeze({
      consumer, transactionId:clean(upstream?.transactionId), receiptId:clean(upstream?.receiptId),
      propertyId:clean(upstream?.propertyId||dryRunRuntime?.propertyId), idempotencyKey:clean(upstream?.idempotencyKey),
      expectedVersion,currentVersion,requested,state,
      schemaValid,targetValid,preconditionsValid,idempotencyValid,versionValid,dryRunValidated,
      mutationDiff:Object.freeze(mutationDiff), mutationCount:mutationDiff.length,
      commitPlanId,rollbackPlanId,readinessReceiptId,
      commitReady:state==='COMMIT_READY', transactionCommitted:false, canonicalWrite:false,
      canonicalWriteAuthority:false,automaticCommit:false,canonicalMutation:false,governedMutation:false,
      readOnly:true,appendOnly:true
    });
  });

  const count=s=>records.filter(r=>r.state===s).length;
  const runtimeId=stableId([
    clean(dryRunRuntime?.runtimeId),...records.map(r=>`${r.consumer}:${r.transactionId}:${r.state}:${r.commitPlanId}`)
  ],'GCRR');
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_92_GOVERNED_CANONICAL_PERSISTENCE_TRANSACTION_VALIDATION_COMMIT_READINESS_RUNTIME',
    version:'3.0-m2.92',status:upstreamReady?'READY':'BLOCKED',
    readinessState:upstreamReady?'COMMIT_READINESS_RUNTIME_READY':'BLOCKED',runtimeId,
    dryRunRuntimeId:clean(dryRunRuntime?.runtimeId),propertyId:clean(dryRunRuntime?.propertyId),
    records:Object.freeze(records),consumerCount:CONSUMERS.length,commitReadyCount:count('COMMIT_READY'),
    awaitingValidationCount:count('AWAITING_VALIDATION_REQUEST'),blockedCount:records.filter(r=>!['COMMIT_READY','AWAITING_VALIDATION_REQUEST'].includes(r.state)).length,
    committedCount:0,canonicalWriteAuthority:false,automaticCommit:false,canonicalMutation:false,governedMutation:false,
    commitExecutionEnabled:false,dryRunOnly:true,readOnly:true,appendOnly:true
  });
}
