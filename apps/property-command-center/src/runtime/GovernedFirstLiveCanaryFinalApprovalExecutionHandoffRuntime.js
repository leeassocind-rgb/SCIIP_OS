// SCIIP Explorer 3.0 — M3.02
// Governed First Live Canary Final Approval & Execution Handoff Runtime

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GH302'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function exact(a,b){
  return clean(a)!=='UNAVAILABLE' && clean(a)===clean(b);
}

function isIso(v){
  if(typeof v!=='string'||!v.trim()) return false;
  return !Number.isNaN(new Date(v).getTime());
}

export function prepareFinalLiveCanaryApprovalRecord({
  m301Preflight={},
  m300Authorized={},
  m298Certification={},
  authorityRuntime={},
  liveCanonicalSnapshot={},
  operatorApproval={}
}={}){
  const consumer=clean(m301Preflight?.consumer);
  const auth=(authorityRuntime?.records||[]).find(r=>r?.consumer===consumer);

  const preflightCertified=
    m301Preflight?.status==='CERTIFIED' &&
    m301Preflight?.state==='FIRST_LIVE_CANARY_PREFLIGHT_CERTIFIED' &&
    m301Preflight?.preflightCertified===true &&
    m301Preflight?.liveWriteExecuted===false &&
    m301Preflight?.canonicalCommitted===false &&
    clean(m301Preflight?.preflightCertificationReceiptId)!=='UNAVAILABLE' &&
    clean(m301Preflight?.evidencePackageId)!=='UNAVAILABLE';

  const orchestrationAuthorized=
    m300Authorized?.status==='AUTHORIZED' &&
    m300Authorized?.state==='LIVE_CANARY_EXECUTION_AUTHORIZED' &&
    m300Authorized?.finalOperatorApproval===true &&
    clean(m300Authorized?.executionAuthorizationId)!=='UNAVAILABLE';

  const adapterReady=
    m298Certification?.status==='READY' &&
    m298Certification?.state==='LIVE_CANARY_EXECUTION_READY' &&
    m298Certification?.liveCanaryExecutionReady===true &&
    clean(m298Certification?.readinessReceiptId)!=='UNAVAILABLE';

  const authorityReady=
    auth?.state==='CANARY_WRITE_AUTHORIZED' &&
    auth?.canaryWriteAuthorized===true &&
    clean(auth?.authorityLeaseId)!=='UNAVAILABLE' &&
    clean(auth?.oneUseAuthorizationToken)!=='UNAVAILABLE';

  const propertyId=clean(m301Preflight?.propertyId);
  const propertyScopeExact=
    exact(propertyId,m300Authorized?.propertyId) &&
    exact(propertyId,m298Certification?.propertyId) &&
    exact(propertyId,auth?.propertyId) &&
    exact(propertyId,liveCanonicalSnapshot?.propertyId);

  const expectedVersion=clean(m301Preflight?.evidence?.canonicalBefore?.version);
  const beforeHash=clean(m301Preflight?.evidence?.canonicalBefore?.hash);
  const afterHash=clean(m301Preflight?.evidence?.canonicalAfter?.hash);

  const liveVersionExact=exact(liveCanonicalSnapshot?.version,expectedVersion);
  const liveHashExact=exact(liveCanonicalSnapshot?.hash,beforeHash);
  const liveCanonicalIdentityVerified=liveCanonicalSnapshot?.canonicalIdentityVerified===true;

  const preflightBindingsExact=
    exact(m301Preflight?.evidence?.bindings?.m300OrchestrationId,m300Authorized?.orchestrationId) &&
    exact(m301Preflight?.evidence?.bindings?.m300ApprovalChallengeId,m300Authorized?.approvalChallengeId) &&
    exact(m301Preflight?.evidence?.bindings?.m298ReadinessReceiptId,m298Certification?.readinessReceiptId) &&
    exact(m301Preflight?.evidence?.bindings?.m296AuthorityLeaseId,auth?.authorityLeaseId) &&
    exact(m301Preflight?.evidence?.bindings?.m296OneUseAuthorizationToken,auth?.oneUseAuthorizationToken);

  const operatorId=clean(operatorApproval?.operatorId);
  const approvedAt=clean(operatorApproval?.approvedAt);
  const finalApprovalValid=
    operatorApproval?.explicitFinalLiveApproval===true &&
    operatorId!=='UNAVAILABLE' &&
    isIso(approvedAt) &&
    operatorApproval?.acknowledgeSingleCanonicalMutation===true &&
    operatorApproval?.acknowledgeOneUseAuthorityConsumption===true &&
    operatorApproval?.acknowledgeReadAfterWriteVerification===true &&
    operatorApproval?.acknowledgeRollbackOnVerificationFailure===true &&
    operatorApproval?.acknowledgeAutomaticRelock===true &&
    operatorApproval?.acknowledgeNoAutomaticRetry===true;

  let state;
  if(!preflightCertified) state='M3_01_PREFLIGHT_NOT_CERTIFIED';
  else if(!orchestrationAuthorized) state='M3_00_EXECUTION_NOT_AUTHORIZED';
  else if(!adapterReady) state='M2_98_LIVE_READINESS_NOT_READY';
  else if(!authorityReady) state='M2_96_AUTHORITY_NOT_READY';
  else if(!propertyScopeExact) state='FINAL_PROPERTY_SCOPE_MISMATCH';
  else if(!liveCanonicalIdentityVerified) state='LIVE_CANONICAL_IDENTITY_UNVERIFIED';
  else if(!liveVersionExact) state='FINAL_LIVE_VERSION_MISMATCH';
  else if(!liveHashExact) state='FINAL_LIVE_HASH_MISMATCH';
  else if(!preflightBindingsExact) state='PREFLIGHT_BINDING_MISMATCH';
  else if(!finalApprovalValid) state='FINAL_OPERATOR_APPROVAL_INCOMPLETE';
  else state='FINAL_OPERATOR_APPROVAL_RECORDED';

  const approved=state==='FINAL_OPERATOR_APPROVAL_RECORDED';

  const approvalRecordId=stableId([
    clean(m301Preflight?.preflightCertificationReceiptId),
    clean(m301Preflight?.evidencePackageId),
    clean(m300Authorized?.executionAuthorizationId),
    clean(m298Certification?.readinessReceiptId),
    clean(auth?.authorityLeaseId),
    clean(auth?.oneUseAuthorizationToken),
    propertyId,
    expectedVersion,
    beforeHash,
    afterHash,
    operatorId,
    approvedAt,
    state
  ],'GHFA');

  const approvalReceiptId=approved
    ?stableId([approvalRecordId,'IMMUTABLE_FINAL_OPERATOR_APPROVAL'],'GHFR')
    :'UNAVAILABLE';

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_02_GOVERNED_FIRST_LIVE_CANARY_FINAL_APPROVAL_RECORD',
    version:'3.0-m3.02',
    status:approved?'APPROVED':'BLOCKED',
    state,
    approvalRecordId,
    approvalReceiptId,
    propertyId,
    consumer,
    operatorId,
    approvedAt,
    preflightCertificationReceiptId:clean(m301Preflight?.preflightCertificationReceiptId),
    evidencePackageId:clean(m301Preflight?.evidencePackageId),
    executionAuthorizationId:clean(m300Authorized?.executionAuthorizationId),
    readinessReceiptId:clean(m298Certification?.readinessReceiptId),
    authorityLeaseId:clean(auth?.authorityLeaseId),
    oneUseAuthorizationToken:clean(auth?.oneUseAuthorizationToken),
    expectedVersion,
    beforeHash,
    afterHash,
    liveVersion:clean(liveCanonicalSnapshot?.version),
    liveHash:clean(liveCanonicalSnapshot?.hash),
    liveCanonicalIdentityVerified,
    propertyScopeExact,
    liveVersionExact,
    liveHashExact,
    preflightBindingsExact,
    finalApprovalValid,
    immutable:true,
    oneShot:true,
    liveWriteExecuted:false,
    canonicalCommitted:false,
    authorityRelocked:true,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWrite:false,
    multiProperty:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export function buildM299FinalExecutionHandoff({
  finalApproval={},
  payload,
  handoffRequest={}
}={}){
  const approvalReady=
    finalApproval?.status==='APPROVED' &&
    finalApproval?.state==='FINAL_OPERATOR_APPROVAL_RECORDED' &&
    finalApproval?.immutable===true &&
    finalApproval?.oneShot===true &&
    finalApproval?.liveWriteExecuted===false &&
    finalApproval?.canonicalCommitted===false &&
    clean(finalApproval?.approvalReceiptId)!=='UNAVAILABLE';

  const explicitHandoff=
    handoffRequest?.explicitExecutionHandoff===true &&
    handoffRequest?.acknowledgeM299PerformsLiveWrite===true &&
    handoffRequest?.acknowledgeOneShotNoRetry===true;

  if(!approvalReady){
    return Object.freeze({
      status:'BLOCKED',
      state:'FINAL_APPROVAL_RECORD_NOT_READY',
      m299InvocationAuthorized:false,
      liveWriteExecuted:false
    });
  }
  if(!explicitHandoff){
    return Object.freeze({
      status:'BLOCKED',
      state:'EXPLICIT_EXECUTION_HANDOFF_REQUIRED',
      m299InvocationAuthorized:false,
      liveWriteExecuted:false
    });
  }

  const handoffId=stableId([
    finalApproval.approvalRecordId,
    finalApproval.approvalReceiptId,
    finalApproval.propertyId,
    finalApproval.expectedVersion,
    finalApproval.beforeHash,
    finalApproval.afterHash,
    'ONE_SHOT_M2_99_HANDOFF'
  ],'GHEX');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_02_GOVERNED_FIRST_LIVE_CANARY_EXECUTION_HANDOFF',
    version:'3.0-m3.02',
    status:'AUTHORIZED',
    state:'FIRST_LIVE_CANARY_EXECUTION_HANDOFF_AUTHORIZED',
    handoffId,
    approvalRecordId:finalApproval.approvalRecordId,
    approvalReceiptId:finalApproval.approvalReceiptId,
    m299InvocationAuthorized:true,
    oneShot:true,
    automaticRetryAllowed:false,
    request:Object.freeze({
      readinessReceiptId:finalApproval.readinessReceiptId,
      propertyId:finalApproval.propertyId,
      authorityLeaseId:finalApproval.authorityLeaseId,
      oneUseAuthorizationToken:finalApproval.oneUseAuthorizationToken,
      expectedVersion:finalApproval.expectedVersion,
      beforeHash:finalApproval.beforeHash,
      afterHash:finalApproval.afterHash,
      explicitLiveExecutionApproval:true,
      bulkWrite:false,
      multiProperty:false,
      persistentWriteAuthority:false,
      payload
    }),
    liveWriteExecuted:false,
    canonicalCommitted:false,
    authorityRelocked:true,
    generalizedWriteAuthority:false,
    bulkWrite:false,
    multiProperty:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export function certifyExecutionHandoffConsumption(handoff={},m299Result={}){
  const authorized=
    handoff?.status==='AUTHORIZED' &&
    handoff?.state==='FIRST_LIVE_CANARY_EXECUTION_HANDOFF_AUTHORIZED' &&
    handoff?.m299InvocationAuthorized===true &&
    handoff?.oneShot===true;

  if(!authorized){
    return Object.freeze({
      status:'BLOCKED',
      state:'HANDOFF_NOT_AUTHORIZED',
      consumed:false,
      canonicalCommittedCount:0,
      authorityRelocked:true
    });
  }

  const sameProperty=exact(handoff?.request?.propertyId,m299Result?.propertyId);
  const relocked=m299Result?.authorityRelocked===true;

  const committed=
    m299Result?.state==='LIVE_CANARY_COMMIT_VERIFIED' &&
    m299Result?.canonicalCommitted===true &&
    m299Result?.verificationSucceeded===true &&
    clean(m299Result?.durableCommitReceiptId)!=='UNAVAILABLE' &&
    clean(m299Result?.postCommitCertificationId)!=='UNAVAILABLE' &&
    sameProperty &&
    relocked;

  const rolledBack=
    m299Result?.state==='LIVE_CANARY_ROLLED_BACK' &&
    m299Result?.rollbackExecuted===true &&
    clean(m299Result?.durableRollbackReceiptId)!=='UNAVAILABLE' &&
    sameProperty &&
    relocked;

  const blocked=
    m299Result?.status==='BLOCKED' &&
    m299Result?.writeAttempted===false &&
    relocked;

  let state='HANDOFF_OUTCOME_NOT_CERTIFIED';
  let canonicalCommittedCount=0;
  if(committed){
    state='FIRST_LIVE_CANARY_COMMIT_VERIFIED';
    canonicalCommittedCount=1;
  }else if(rolledBack){
    state='FIRST_LIVE_CANARY_ROLLED_BACK';
  }else if(blocked){
    state='FIRST_LIVE_CANARY_BLOCKED';
  }

  const consumed=committed||rolledBack||blocked;
  const handoffConsumptionReceiptId=consumed
    ?stableId([
        clean(handoff?.handoffId),
        clean(m299Result?.executionId),
        state,
        String(canonicalCommittedCount)
      ],'GHCR')
    :'UNAVAILABLE';

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_02_GOVERNED_FIRST_LIVE_CANARY_HANDOFF_OUTCOME_CERTIFICATION',
    version:'3.0-m3.02',
    status:consumed?'CERTIFIED':'BLOCKED',
    state,
    handoffConsumptionReceiptId,
    consumed,
    canonicalCommittedCount,
    authorityRelocked:relocked,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export function buildGovernedFirstLiveCanaryFinalApprovalExecutionHandoffRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_02_GOVERNED_FIRST_LIVE_CANARY_FINAL_APPROVAL_EXECUTION_HANDOFF_RUNTIME',
    version:'3.0-m3.02',
    status:'READY',
    installerExecutesWrite:false,
    finalLiveCanonicalRevalidationRequired:true,
    immutableFinalOperatorApprovalRequired:true,
    explicitExecutionHandoffRequired:true,
    oneShotHandoffOnly:true,
    automaticRetryAllowed:false,
    m301PreflightRequired:true,
    m300ExecutionAuthorizationRequired:true,
    m298LiveReadinessRequired:true,
    m296OneUseAuthorityRequired:true,
    m299ExplicitExecutionRequired:true,
    singleTransactionOnly:true,
    singlePropertyOnly:true,
    authorityAutoRelock:true,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    realCanonicalCommittedCountAtInstall:0
  });
}
