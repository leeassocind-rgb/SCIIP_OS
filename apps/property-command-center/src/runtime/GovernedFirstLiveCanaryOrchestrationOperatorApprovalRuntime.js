// SCIIP Explorer 3.0 — M3.00
// Governed First Live Canary Orchestration & Operator Approval Runtime
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GO300'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function exact(a,b){ return clean(a)===clean(b) && clean(a)!=='UNAVAILABLE'; }

export function prepareGovernedFirstLiveCanaryOperatorApproval({
  m299Runtime={},
  adapterCertification={},
  authorityRuntime={},
  executionRuntime={},
  candidate={},
  currentCanonical={},
  proposedCanonical={}
}={}){
  const consumer=clean(adapterCertification?.consumer);
  const auth=(authorityRuntime?.records||[]).find(r=>r?.consumer===consumer);
  const exec=(executionRuntime?.records||[]).find(r=>r?.consumer===consumer);

  const m299Ready=
    m299Runtime?.status==='READY' &&
    m299Runtime?.installerExecutesWrite===false &&
    m299Runtime?.liveExecutionRequiresExplicitInvocation===true &&
    m299Runtime?.singleTransactionOnly===true &&
    m299Runtime?.singlePropertyOnly===true &&
    m299Runtime?.oneUseAuthorityOnly===true &&
    m299Runtime?.authorityAutoRelock===true &&
    m299Runtime?.bulkWritesAllowed===false &&
    m299Runtime?.multiPropertyWritesAllowed===false &&
    m299Runtime?.persistentWriteAuthority===false &&
    m299Runtime?.automaticCommit===false &&
    m299Runtime?.realCanonicalCommittedCount===0;

  const m298Ready=
    adapterCertification?.status==='READY' &&
    adapterCertification?.state==='LIVE_CANARY_EXECUTION_READY' &&
    adapterCertification?.liveCanaryExecutionReady===true &&
    clean(adapterCertification?.readinessReceiptId)!=='UNAVAILABLE';

  const authorityReady=
    auth?.state==='CANARY_WRITE_AUTHORIZED' &&
    auth?.canaryWriteAuthorized===true &&
    clean(auth?.authorityLeaseId)!=='UNAVAILABLE' &&
    clean(auth?.oneUseAuthorizationToken)!=='UNAVAILABLE';

  const executionReady=
    exec?.state==='READY_FOR_SINGLE_CANARY_EXECUTION' &&
    exec?.executionCapability===true;

  const propertyId=clean(candidate?.propertyId);
  const propertyScopeExact=
    exact(propertyId,adapterCertification?.propertyId) &&
    exact(propertyId,auth?.propertyId) &&
    exact(propertyId,exec?.propertyId);

  const beforeVersion=clean(currentCanonical?.version);
  const beforeHash=clean(currentCanonical?.hash);
  const afterHash=clean(proposedCanonical?.hash);

  const beforeScopeExact=
    exact(beforeVersion,auth?.expectedVersion) &&
    exact(beforeHash,auth?.beforeHash);

  const afterScopeExact=exact(afterHash,auth?.afterHash);

  const lowRiskCandidate=
    candidate?.approvedLowRiskCanary===true &&
    candidate?.singleProperty===true &&
    candidate?.bulkWrite!==true &&
    candidate?.multiProperty!==true &&
    candidate?.destructiveMutation!==true;

  const diff=Object.freeze({
    propertyId,
    beforeVersion,
    beforeHash,
    afterHash,
    changedFields:Array.isArray(candidate?.changedFields)
      ?Object.freeze([...candidate.changedFields])
      :Object.freeze([]),
    mutationSummary:clean(candidate?.mutationSummary)
  });

  const preparable=
    m299Ready && m298Ready && authorityReady && executionReady &&
    propertyScopeExact && beforeScopeExact && afterScopeExact && lowRiskCandidate;

  let state;
  if(!m299Ready) state='M2_99_RUNTIME_NOT_READY';
  else if(!m298Ready) state='M2_98_READINESS_NOT_READY';
  else if(!authorityReady) state='M2_96_AUTHORITY_NOT_READY';
  else if(!executionReady) state='M2_97_EXECUTION_NOT_READY';
  else if(!propertyScopeExact) state='PROPERTY_SCOPE_MISMATCH';
  else if(!beforeScopeExact) state='BEFORE_STATE_MISMATCH';
  else if(!afterScopeExact) state='AFTER_STATE_MISMATCH';
  else if(!lowRiskCandidate) state='CANARY_RISK_SCOPE_REJECTED';
  else state='AWAITING_FINAL_OPERATOR_APPROVAL';

  const orchestrationId=stableId([
    clean(m299Runtime?.version),
    clean(adapterCertification?.certificationId),
    clean(adapterCertification?.readinessReceiptId),
    consumer,
    propertyId,
    beforeVersion,
    beforeHash,
    afterHash,
    clean(auth?.authorityLeaseId),
    state
  ],'GO3O');

  const approvalChallengeId=preparable
    ?stableId([orchestrationId,'FINAL_OPERATOR_APPROVAL'], 'GOAP')
    :'UNAVAILABLE';

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_00_GOVERNED_FIRST_LIVE_CANARY_ORCHESTRATION_OPERATOR_APPROVAL_RUNTIME',
    version:'3.0-m3.00',
    status:preparable?'READY':'BLOCKED',
    state,
    orchestrationId,
    approvalChallengeId,
    consumer,
    propertyId,
    diff,
    m299Ready,
    m298Ready,
    authorityReady,
    executionReady,
    propertyScopeExact,
    beforeScopeExact,
    afterScopeExact,
    lowRiskCandidate,
    readinessReceiptId:clean(adapterCertification?.readinessReceiptId),
    authorityLeaseId:clean(auth?.authorityLeaseId),
    oneUseAuthorizationToken:clean(auth?.oneUseAuthorizationToken),
    expectedVersion:clean(auth?.expectedVersion),
    beforeHash:clean(auth?.beforeHash),
    afterHash:clean(auth?.afterHash),
    finalOperatorApproval:false,
    liveExecutionInvoked:false,
    canonicalCommitted:false,
    authorityRelocked:true,
    bulkWrite:false,
    multiProperty:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export function authorizeGovernedFirstLiveCanaryExecution(prepared={},approval={}){
  const challengeExact=
    exact(approval?.approvalChallengeId,prepared?.approvalChallengeId);
  const orchestrationExact=
    exact(approval?.orchestrationId,prepared?.orchestrationId);
  const explicitApproval=approval?.explicitFinalOperatorApproval===true;
  const acknowledgement=
    approval?.acknowledgeSingleLiveCanonicalMutation===true &&
    approval?.acknowledgeAutomaticRelock===true &&
    approval?.acknowledgeRollbackOnVerificationFailure===true;

  const approved=
    prepared?.status==='READY' &&
    prepared?.state==='AWAITING_FINAL_OPERATOR_APPROVAL' &&
    challengeExact &&
    orchestrationExact &&
    explicitApproval &&
    acknowledgement;

  let state;
  if(prepared?.status!=='READY') state='ORCHESTRATION_NOT_READY';
  else if(!challengeExact) state='APPROVAL_CHALLENGE_MISMATCH';
  else if(!orchestrationExact) state='ORCHESTRATION_ID_MISMATCH';
  else if(!explicitApproval) state='FINAL_OPERATOR_APPROVAL_REQUIRED';
  else if(!acknowledgement) state='OPERATOR_ACKNOWLEDGEMENT_REQUIRED';
  else state='LIVE_CANARY_EXECUTION_AUTHORIZED';

  const executionAuthorizationId=approved
    ?stableId([
        prepared.orchestrationId,
        prepared.approvalChallengeId,
        prepared.propertyId,
        prepared.beforeHash,
        prepared.afterHash,
        'ONE_SHOT'
      ],'GOEA')
    :'UNAVAILABLE';

  return Object.freeze({
    ...prepared,
    status:approved?'AUTHORIZED':'BLOCKED',
    state,
    finalOperatorApproval:approved,
    executionAuthorizationId,
    liveExecutionInvoked:false,
    canonicalCommitted:false,
    authorityRelocked:true
  });
}

export function buildM299InvocationEnvelope(authorized={},payload){
  if(
    authorized?.status!=='AUTHORIZED' ||
    authorized?.state!=='LIVE_CANARY_EXECUTION_AUTHORIZED' ||
    authorized?.finalOperatorApproval!==true ||
    clean(authorized?.executionAuthorizationId)==='UNAVAILABLE'
  ){
    return Object.freeze({
      status:'BLOCKED',
      state:'LIVE_EXECUTION_NOT_AUTHORIZED',
      invokeM299:false
    });
  }

  return Object.freeze({
    status:'READY',
    state:'M2_99_INVOCATION_ENVELOPE_READY',
    invokeM299:true,
    executionAuthorizationId:authorized.executionAuthorizationId,
    request:Object.freeze({
      readinessReceiptId:authorized.readinessReceiptId,
      propertyId:authorized.propertyId,
      authorityLeaseId:authorized.authorityLeaseId,
      oneUseAuthorizationToken:authorized.oneUseAuthorizationToken,
      expectedVersion:authorized.expectedVersion,
      beforeHash:authorized.beforeHash,
      afterHash:authorized.afterHash,
      explicitLiveExecutionApproval:true,
      bulkWrite:false,
      multiProperty:false,
      persistentWriteAuthority:false,
      payload
    })
  });
}

export function certifyM299LiveCanaryOutcome(authorized={},m299Result={}){
  const sameProperty=exact(authorized?.propertyId,m299Result?.propertyId);
  const relocked=m299Result?.authorityRelocked===true;
  const committed=
    m299Result?.state==='LIVE_CANARY_COMMIT_VERIFIED' &&
    m299Result?.canonicalCommitted===true &&
    m299Result?.verificationSucceeded===true &&
    clean(m299Result?.durableCommitReceiptId)!=='UNAVAILABLE' &&
    clean(m299Result?.postCommitCertificationId)!=='UNAVAILABLE' &&
    relocked &&
    sameProperty;

  const rolledBack=
    m299Result?.state==='LIVE_CANARY_ROLLED_BACK' &&
    m299Result?.rollbackExecuted===true &&
    clean(m299Result?.durableRollbackReceiptId)!=='UNAVAILABLE' &&
    relocked &&
    sameProperty;

  const blocked=
    m299Result?.status==='BLOCKED' &&
    m299Result?.writeAttempted===false &&
    relocked;

  let state;
  let canonicalCommittedCount=0;
  if(committed){
    state='LIVE_CANARY_COMMIT_VERIFIED';
    canonicalCommittedCount=1;
  }else if(rolledBack){
    state='LIVE_CANARY_ROLLED_BACK';
  }else if(blocked){
    state='LIVE_CANARY_BLOCKED';
  }else{
    state='LIVE_CANARY_OUTCOME_NOT_CERTIFIED';
  }

  const certified=committed||rolledBack||blocked;
  const outcomeCertificationId=certified
    ?stableId([
        clean(authorized?.orchestrationId),
        clean(authorized?.executionAuthorizationId),
        clean(m299Result?.executionId),
        state,
        String(canonicalCommittedCount)
      ],'GOOC')
    :'UNAVAILABLE';

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_00_GOVERNED_FIRST_LIVE_CANARY_OUTCOME_CERTIFICATION',
    version:'3.0-m3.00',
    status:certified?'CERTIFIED':'BLOCKED',
    state,
    outcomeCertificationId,
    propertyId:clean(authorized?.propertyId),
    canonicalCommittedCount,
    authorityRelocked:relocked,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}

export function buildGovernedFirstLiveCanaryOrchestrationOperatorApprovalRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_00_GOVERNED_FIRST_LIVE_CANARY_ORCHESTRATION_OPERATOR_APPROVAL_RUNTIME',
    version:'3.0-m3.00',
    status:'READY',
    installerExecutesWrite:false,
    operatorApprovalRequired:true,
    mutationDiffRequired:true,
    m298ReadinessRequired:true,
    m296OneUseAuthorityRequired:true,
    m299ExplicitInvocationRequired:true,
    singleTransactionOnly:true,
    singlePropertyOnly:true,
    lowRiskCanaryOnly:true,
    authorityAutoRelock:true,
    rollbackOnVerificationFailure:true,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    realCanonicalCommittedCountAtInstall:0
  });
}
