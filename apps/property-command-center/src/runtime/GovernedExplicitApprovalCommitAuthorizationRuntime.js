// SCIIP Explorer 3.0 — M2.93
// Explicit approval + governed commit authorization boundary. No canonical write occurs here.
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const stable=(v)=>JSON.stringify(v,Object.keys(v||{}).sort());
function stableId(parts,prefix='GCAA'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedExplicitApprovalCommitAuthorizationRuntime(readinessRuntime={}, approvalRequests={}){
  const upstreamReady=
    readinessRuntime?.status==='READY' &&
    readinessRuntime?.readinessState==='COMMIT_READINESS_RUNTIME_READY' &&
    readinessRuntime?.canonicalWriteAuthority===false &&
    readinessRuntime?.automaticCommit===false &&
    readinessRuntime?.commitExecutionEnabled===false &&
    readinessRuntime?.committedCount===0;

  const records=CONSUMERS.map(consumer=>{
    const upstream=(readinessRuntime?.records||[]).find(r=>r?.consumer===consumer)||{};
    const request=approvalRequests?.[consumer]||{};
    const approvalRequested=request?.authorize===true;
    const commitReady=upstream?.state==='COMMIT_READY'&&upstream?.commitReady===true;
    const approvalId=clean(request?.approvalId);
    const approvedBy=clean(request?.approvedBy);
    const approvedAt=clean(request?.approvedAt);
    const approvalReason=clean(request?.reason);
    const approvedCommitPlanId=clean(request?.commitPlanId);
    const scope=clean(request?.scope);
    const explicitApproval=request?.explicitApproval===true;
    const identityValid=approvalId!=='UNAVAILABLE'&&approvedBy!=='UNAVAILABLE'&&approvedAt!=='UNAVAILABLE';
    const reasonValid=approvalReason!=='UNAVAILABLE';
    const scopeValid=scope==='CANONICAL_COMMIT';
    const planBound=approvedCommitPlanId!=='UNAVAILABLE'&&approvedCommitPlanId===clean(upstream?.commitPlanId);
    const propertyBound=clean(request?.propertyId)===clean(upstream?.propertyId)&&clean(upstream?.propertyId)!=='UNAVAILABLE';
    const transactionBound=clean(request?.transactionId)===clean(upstream?.transactionId)&&clean(upstream?.transactionId)!=='UNAVAILABLE';
    const idempotencyBound=clean(request?.idempotencyKey)===clean(upstream?.idempotencyKey)&&clean(upstream?.idempotencyKey)!=='UNAVAILABLE';

    let state;
    if(!upstreamReady) state='BLOCKED';
    else if(!commitReady) state='NOT_COMMIT_READY';
    else if(!approvalRequested) state='AWAITING_EXPLICIT_APPROVAL';
    else if(!explicitApproval) state='EXPLICIT_APPROVAL_REQUIRED';
    else if(!identityValid) state='APPROVER_IDENTITY_INVALID';
    else if(!reasonValid) state='APPROVAL_REASON_REQUIRED';
    else if(!scopeValid) state='APPROVAL_SCOPE_INVALID';
    else if(!planBound) state='COMMIT_PLAN_MISMATCH';
    else if(!propertyBound) state='PROPERTY_BINDING_MISMATCH';
    else if(!transactionBound) state='TRANSACTION_BINDING_MISMATCH';
    else if(!idempotencyBound) state='IDEMPOTENCY_BINDING_MISMATCH';
    else state='COMMIT_AUTHORIZED';

    const authorized=state==='COMMIT_AUTHORIZED';
    const authorizationId=authorized?stableId([
      clean(readinessRuntime?.runtimeId),consumer,approvalId,approvedBy,approvedAt,
      approvalReason,scope,approvedCommitPlanId,clean(upstream?.propertyId),
      clean(upstream?.transactionId),clean(upstream?.idempotencyKey)
    ],'GCAU'):'UNAVAILABLE';
    const authorizationReceiptId=approvalRequested?stableId([
      consumer,state,approvalId,authorizationId,clean(upstream?.readinessReceiptId)
    ],'GCAR'):'UNAVAILABLE';

    return Object.freeze({
      consumer,propertyId:clean(upstream?.propertyId),transactionId:clean(upstream?.transactionId),
      idempotencyKey:clean(upstream?.idempotencyKey),commitPlanId:clean(upstream?.commitPlanId),
      rollbackPlanId:clean(upstream?.rollbackPlanId),readinessReceiptId:clean(upstream?.readinessReceiptId),
      approvalRequested,explicitApproval,approvalId,approvedBy,approvedAt,approvalReason,scope,
      identityValid,reasonValid,scopeValid,planBound,propertyBound,transactionBound,idempotencyBound,
      state,commitReady,commitAuthorized:authorized,authorizationId,authorizationReceiptId,
      transactionCommitted:false,canonicalWrite:false,canonicalWriteAuthority:false,
      automaticCommit:false,commitExecutionEnabled:false,canonicalMutation:false,governedMutation:false,
      readOnly:true,appendOnly:true
    });
  });

  const count=s=>records.filter(r=>r.state===s).length;
  const runtimeId=stableId([
    clean(readinessRuntime?.runtimeId),...records.map(r=>`${r.consumer}:${r.transactionId}:${r.state}:${r.authorizationId}`)
  ],'GCAA');
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_93_GOVERNED_EXPLICIT_APPROVAL_COMMIT_AUTHORIZATION_RUNTIME',
    version:'3.0-m2.93',status:upstreamReady?'READY':'BLOCKED',
    authorizationState:upstreamReady?'EXPLICIT_APPROVAL_RUNTIME_READY':'BLOCKED',runtimeId,
    readinessRuntimeId:clean(readinessRuntime?.runtimeId),propertyId:clean(readinessRuntime?.propertyId),
    records:Object.freeze(records),consumerCount:CONSUMERS.length,
    commitReadyCount:records.filter(r=>r.commitReady).length,
    awaitingApprovalCount:count('AWAITING_EXPLICIT_APPROVAL'),authorizedCount:count('COMMIT_AUTHORIZED'),
    committedCount:0,canonicalWriteAuthority:false,automaticCommit:false,commitExecutionEnabled:false,
    canonicalMutation:false,governedMutation:false,dryRunOnly:true,readOnly:true,appendOnly:true
  });
}
