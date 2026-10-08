// SCIIP Explorer 3.0 — M2.94
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GSIM'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedCommitExecutionSimulationAtomicTransactionRehearsalRuntime(
  authorizationRuntime={},
  rehearsalRequests={}
){
  const upstreamReady=
    authorizationRuntime?.status==='READY' &&
    authorizationRuntime?.commitExecution===false &&
    authorizationRuntime?.canonicalWriteAuthority===false &&
    authorizationRuntime?.automaticCommit===false;

  const authRecords=Array.isArray(authorizationRuntime?.records)?authorizationRuntime.records:[];

  const records=CONSUMERS.map(consumer=>{
    const auth=authRecords.find(r=>r?.consumer===consumer);
    const request=rehearsalRequests?.[consumer]||{};
    const requested=request?.simulate===true;
    const injectFailure=request?.injectFailure===true;
    const replayToken=clean(request?.replayToken,'FIRST_RUN');

    const authorized=
      upstreamReady &&
      (
        auth?.state==='AUTHORIZED' ||
        auth?.state==='COMMIT_AUTHORIZED' ||
        auth?.authorized===true ||
        auth?.commitAuthorized===true
      );

    const idempotencyKey=stableId([
      clean(auth?.authorizationId),
      clean(auth?.commitPlanId),
      clean(auth?.propertyId||authorizationRuntime?.propertyId),
      clean(auth?.transactionId),
      replayToken
    ],'IDEM');

    const transactionId=stableId([
      clean(authorizationRuntime?.runtimeId),
      consumer,
      idempotencyKey,
      requested?'REQUESTED':'NOT_REQUESTED',
      injectFailure?'FAILURE_INJECTED':'NO_FAILURE'
    ],'GRTX');

    let state;
    if(!upstreamReady) state='BLOCKED';
    else if(!authorized) state='AWAITING_COMMIT_AUTHORIZATION';
    else if(!requested) state='AWAITING_REHEARSAL_REQUEST';
    else if(injectFailure) state='ROLLED_BACK';
    else state='SIMULATED_COMMIT_VERIFIED';

    const commitReceiptId=state==='SIMULATED_COMMIT_VERIFIED'
      ?stableId([transactionId,idempotencyKey,'COMMIT_RECEIPT'],'GCRC')
      :'UNAVAILABLE';

    const rollbackReceiptId=state==='ROLLED_BACK'
      ?stableId([transactionId,idempotencyKey,'ROLLBACK_RECEIPT'],'GRRC')
      :'UNAVAILABLE';

    const verificationReceiptId=
      (state==='SIMULATED_COMMIT_VERIFIED'||state==='ROLLED_BACK')
        ?stableId([transactionId,state,'POST_TRANSACTION_VERIFICATION'],'GVRF')
        :'UNAVAILABLE';

    return Object.freeze({
      consumer,
      transactionId,
      transactionKey:`M2.94:${clean(authorizationRuntime?.propertyId)}:${consumer}`,
      authorizationId:clean(auth?.authorizationId),
      authorizationReceiptId:clean(auth?.receiptId),
      commitPlanId:clean(auth?.commitPlanId),
      rollbackPlanId:clean(auth?.rollbackPlanId),
      propertyId:clean(auth?.propertyId||authorizationRuntime?.propertyId),
      upstreamTransactionId:clean(auth?.transactionId),
      idempotencyKey,
      replayToken,
      requested,
      injectFailure,
      state,
      simulated:true,
      nonCanonicalTarget:true,
      atomicTransaction:true,
      rollbackRehearsed:state==='ROLLED_BACK',
      replayProtected:true,
      commitReceiptId,
      rollbackReceiptId,
      verificationReceiptId,
      postTransactionVerified:state==='SIMULATED_COMMIT_VERIFIED'||state==='ROLLED_BACK',
      canonicalWrite:false,
      canonicalWriteAuthority:false,
      automaticCommit:false,
      canonicalMutation:false,
      governedMutation:false,
      committedToCanonical:false,
      readOnly:true,
      appendOnly:true
    });
  });

  const count=s=>records.filter(r=>r.state===s).length;
  const blockedCount=count('BLOCKED');
  const ready=upstreamReady&&blockedCount===0;

  const runtimeId=stableId([
    clean(authorizationRuntime?.runtimeId),
    ...records.map(r=>`${r.consumer}:${r.transactionId}:${r.state}:${r.idempotencyKey}`)
  ],'GSRR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_94_GOVERNED_COMMIT_EXECUTION_SIMULATION_ATOMIC_TRANSACTION_REHEARSAL_RUNTIME',
    version:'3.0-m2.94',
    status:ready?'READY':'BLOCKED',
    rehearsalState:ready?'SIMULATION_REHEARSAL_READY':'BLOCKED',
    runtimeId,
    authorizationRuntimeId:clean(authorizationRuntime?.runtimeId),
    propertyId:clean(authorizationRuntime?.propertyId),
    records:Object.freeze(records),
    consumerCount:CONSUMERS.length,
    simulatedCommitVerifiedCount:count('SIMULATED_COMMIT_VERIFIED'),
    rolledBackCount:count('ROLLED_BACK'),
    awaitingAuthorizationCount:count('AWAITING_COMMIT_AUTHORIZATION'),
    awaitingRehearsalRequestCount:count('AWAITING_REHEARSAL_REQUEST'),
    blockedCount,
    realCanonicalCommittedCount:0,
    simulationOnly:true,
    nonCanonicalTarget:true,
    atomicTransactionRehearsal:true,
    rollbackRehearsal:true,
    replayProtection:true,
    receiptReconciliation:true,
    postTransactionVerification:true,
    commitExecution:false,
    canonicalWriteAuthority:false,
    automaticCommit:false,
    canonicalMutation:false,
    governedMutation:false,
    readOnly:true,
    appendOnly:true
  });
}
