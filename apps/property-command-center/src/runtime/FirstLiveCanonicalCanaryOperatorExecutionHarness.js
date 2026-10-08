// SCIIP Explorer 3.0 — M3.05
// First Live Canonical Canary Operator Execution Harness

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;

function stableId(parts,prefix='GH305'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

function exact(a,b){
  return clean(a)!=='UNAVAILABLE' && clean(a)===clean(b);
}

export function buildGovernedFirstLiveCanaryOperatorExecutionHarnessRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_05_FIRST_LIVE_CANONICAL_CANARY_OPERATOR_EXECUTION_HARNESS',
    version:'3.0-m3.05',
    status:'READY',
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    operatorExecutionSeparate:true,
    executionManifestRequired:true,
    explicitOperatorConfirmationRequired:true,
    m304ExecutionPlanRequired:true,
    m303RehearsalReceiptRequired:true,
    m302HandoffRequired:true,
    m301PreflightRequired:true,
    m298ReadinessRequired:true,
    m296OneUseAuthorityRequired:true,
    singleTransactionOnly:true,
    singlePropertyOnly:true,
    oneShotOnly:true,
    automaticRetryAllowed:false,
    authorityAutoRelock:true,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false,
    realCanonicalCommittedCountAtInstall:0
  });
}

export function buildFirstLiveCanaryOperatorExecutionManifest({
  m304ExecutionPlan={},
  m303Rehearsal={},
  m302Handoff={},
  m301Preflight={},
  m298Certification={},
  authorityRuntime={},
  currentCanonical={},
  proposedMutation={}
}={}){
  const consumer=clean(m301Preflight?.consumer);
  const auth=(authorityRuntime?.records||[]).find(r=>r?.consumer===consumer);

  const m304Ready=
    m304ExecutionPlan?.status==='READY' &&
    m304ExecutionPlan?.state==='FIRST_LIVE_CANARY_EXECUTION_READY' &&
    m304ExecutionPlan?.oneShot===true &&
    m304ExecutionPlan?.automaticRetryAllowed===false &&
    m304ExecutionPlan?.liveWriteExecuted===false &&
    m304ExecutionPlan?.canonicalCommitted===false;

  const m303Ready=
    m303Rehearsal?.status==='CERTIFIED' &&
    m303Rehearsal?.state==='FIRST_LIVE_CANARY_EXECUTION_REHEARSAL_CERTIFIED' &&
    m303Rehearsal?.rehearsalCertified===true &&
    clean(m303Rehearsal?.rehearsalReceiptId)!=='UNAVAILABLE';

  const m302Ready=
    m302Handoff?.status==='AUTHORIZED' &&
    m302Handoff?.state==='FIRST_LIVE_CANARY_EXECUTION_HANDOFF_AUTHORIZED' &&
    m302Handoff?.m299InvocationAuthorized===true &&
    clean(m302Handoff?.handoffId)!=='UNAVAILABLE';

  const m301Ready=
    m301Preflight?.status==='CERTIFIED' &&
    m301Preflight?.state==='FIRST_LIVE_CANARY_PREFLIGHT_CERTIFIED' &&
    m301Preflight?.preflightCertified===true &&
    clean(m301Preflight?.preflightCertificationReceiptId)!=='UNAVAILABLE';

  const m298Ready=
    m298Certification?.status==='READY' &&
    m298Certification?.state==='LIVE_CANARY_EXECUTION_READY' &&
    m298Certification?.liveCanaryExecutionReady===true &&
    clean(m298Certification?.readinessReceiptId)!=='UNAVAILABLE';

  const authorityReady=
    auth?.state==='CANARY_WRITE_AUTHORIZED' &&
    auth?.canaryWriteAuthorized===true &&
    clean(auth?.authorityLeaseId)!=='UNAVAILABLE' &&
    clean(auth?.oneUseAuthorizationToken)!=='UNAVAILABLE';

  const propertyId=clean(m304ExecutionPlan?.propertyId);
  const expectedVersion=clean(m304ExecutionPlan?.expectedVersion);
  const beforeHash=clean(m304ExecutionPlan?.beforeHash);
  const afterHash=clean(m304ExecutionPlan?.afterHash);

  const currentValue=proposedMutation?.currentValue;
  const proposedValue=proposedMutation?.proposedValue;
  const mutationField=clean(proposedMutation?.field);

  const exactScope=
    exact(propertyId,m303Rehearsal?.propertyId) &&
    exact(propertyId,m302Handoff?.request?.propertyId) &&
    exact(propertyId,m301Preflight?.propertyId) &&
    exact(propertyId,m298Certification?.propertyId) &&
    exact(propertyId,auth?.propertyId) &&
    exact(propertyId,currentCanonical?.propertyId) &&
    exact(expectedVersion,currentCanonical?.version) &&
    exact(beforeHash,currentCanonical?.hash) &&
    exact(expectedVersion,auth?.expectedVersion) &&
    exact(beforeHash,auth?.beforeHash) &&
    exact(afterHash,auth?.afterHash) &&
    exact(m304ExecutionPlan?.rehearsalReceiptId,m303Rehearsal?.rehearsalReceiptId) &&
    exact(m304ExecutionPlan?.handoffId,m302Handoff?.handoffId) &&
    exact(m304ExecutionPlan?.preflightCertificationReceiptId,m301Preflight?.preflightCertificationReceiptId) &&
    exact(m304ExecutionPlan?.readinessReceiptId,m298Certification?.readinessReceiptId) &&
    exact(m304ExecutionPlan?.authorityLeaseId,auth?.authorityLeaseId) &&
    exact(m304ExecutionPlan?.oneUseAuthorizationToken,auth?.oneUseAuthorizationToken);

  const mutationSafe=
    mutationField!=='UNAVAILABLE' &&
    proposedMutation?.singleField===true &&
    proposedMutation?.destructiveMutation!==true &&
    proposedMutation?.bulkWrite!==true &&
    proposedMutation?.multiProperty!==true &&
    proposedMutation?.persistentWriteAuthority!==true &&
    currentValue!==proposedValue;

  const ready=
    m304Ready && m303Ready && m302Ready && m301Ready &&
    m298Ready && authorityReady && exactScope && mutationSafe;

  let state;
  if(!m304Ready) state='M3_04_EXECUTION_PLAN_NOT_READY';
  else if(!m303Ready) state='M3_03_REHEARSAL_NOT_READY';
  else if(!m302Ready) state='M3_02_HANDOFF_NOT_READY';
  else if(!m301Ready) state='M3_01_PREFLIGHT_NOT_READY';
  else if(!m298Ready) state='M2_98_READINESS_NOT_READY';
  else if(!authorityReady) state='M2_96_AUTHORITY_NOT_READY';
  else if(!exactScope) state='OPERATOR_MANIFEST_SCOPE_MISMATCH';
  else if(!mutationSafe) state='OPERATOR_MANIFEST_MUTATION_REJECTED';
  else state='OPERATOR_EXECUTION_MANIFEST_READY';

  const manifestId=stableId([
    clean(m304ExecutionPlan?.executionPlanId),
    clean(m303Rehearsal?.rehearsalReceiptId),
    clean(m302Handoff?.handoffId),
    clean(m301Preflight?.preflightCertificationReceiptId),
    clean(m298Certification?.readinessReceiptId),
    clean(auth?.authorityLeaseId),
    clean(auth?.oneUseAuthorizationToken),
    propertyId,
    expectedVersion,
    beforeHash,
    afterHash,
    mutationField,
    String(currentValue),
    String(proposedValue),
    state
  ],'GHMF');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_05_FIRST_LIVE_CANARY_OPERATOR_EXECUTION_MANIFEST',
    version:'3.0-m3.05',
    status:ready?'READY':'BLOCKED',
    state,
    manifestId,
    propertyId,
    consumer,
    mutation:Object.freeze({
      field:mutationField,
      currentValue,
      proposedValue
    }),
    currentCanonical:Object.freeze({
      version:clean(currentCanonical?.version),
      hash:clean(currentCanonical?.hash),
      canonicalIdentityVerified:currentCanonical?.canonicalIdentityVerified===true
    }),
    proposed:Object.freeze({
      afterHash
    }),
    bindings:Object.freeze({
      m304ExecutionPlanId:clean(m304ExecutionPlan?.executionPlanId),
      m303RehearsalReceiptId:clean(m303Rehearsal?.rehearsalReceiptId),
      m302HandoffId:clean(m302Handoff?.handoffId),
      m301PreflightReceiptId:clean(m301Preflight?.preflightCertificationReceiptId),
      m298ReadinessReceiptId:clean(m298Certification?.readinessReceiptId),
      m296AuthorityLeaseId:clean(auth?.authorityLeaseId),
      m296OneUseAuthorizationToken:clean(auth?.oneUseAuthorizationToken)
    }),
    expectedVersion,
    beforeHash,
    afterHash,
    exactScope,
    mutationSafe,
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

export function authorizeOperatorExecution(manifest={},confirmation={}){
  const ready=
    manifest?.status==='READY' &&
    manifest?.state==='OPERATOR_EXECUTION_MANIFEST_READY' &&
    manifest?.oneShot===true &&
    manifest?.liveWriteExecuted===false &&
    manifest?.canonicalCommitted===false;

  const confirmed=
    confirmation?.explicitExecuteNow===true &&
    confirmation?.acknowledgeProperty===manifest?.propertyId &&
    confirmation?.acknowledgeMutationField===manifest?.mutation?.field &&
    confirmation?.acknowledgeBeforeHash===manifest?.beforeHash &&
    confirmation?.acknowledgeAfterHash===manifest?.afterHash &&
    confirmation?.acknowledgeSingleLiveMutation===true &&
    confirmation?.acknowledgeOneUseTokenConsumption===true &&
    confirmation?.acknowledgeRollbackOnVerificationFailure===true &&
    confirmation?.acknowledgeAutomaticRelock===true &&
    confirmation?.acknowledgeNoAutomaticRetry===true &&
    exact(confirmation?.manifestId,manifest?.manifestId);

  if(!ready){
    return Object.freeze({
      status:'BLOCKED',
      state:'OPERATOR_MANIFEST_NOT_READY',
      execute:false
    });
  }

  if(!confirmed){
    return Object.freeze({
      status:'BLOCKED',
      state:'OPERATOR_CONFIRMATION_INCOMPLETE',
      execute:false
    });
  }

  const operatorExecutionAuthorizationId=stableId([
    manifest.manifestId,
    manifest.propertyId,
    manifest.mutation.field,
    manifest.beforeHash,
    manifest.afterHash,
    'EXECUTE_NOW_ONE_SHOT'
  ],'GHOA');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_05_OPERATOR_EXECUTION_AUTHORIZATION',
    version:'3.0-m3.05',
    status:'AUTHORIZED',
    state:'FIRST_LIVE_CANARY_OPERATOR_EXECUTION_AUTHORIZED',
    operatorExecutionAuthorizationId,
    manifestId:manifest.manifestId,
    propertyId:manifest.propertyId,
    execute:true,
    oneShot:true,
    automaticRetryAllowed:false
  });
}

export function buildM304InvocationEnvelope({
  manifest={},
  authorization={},
  m304ExecutionPlan={}
}={}){
  const authorized=
    authorization?.status==='AUTHORIZED' &&
    authorization?.state==='FIRST_LIVE_CANARY_OPERATOR_EXECUTION_AUTHORIZED' &&
    authorization?.execute===true &&
    exact(authorization?.manifestId,manifest?.manifestId) &&
    exact(manifest?.bindings?.m304ExecutionPlanId,m304ExecutionPlan?.executionPlanId);

  if(!authorized){
    return Object.freeze({
      status:'BLOCKED',
      state:'M3_04_INVOCATION_NOT_AUTHORIZED',
      invokeM304:false
    });
  }

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_05_M3_04_INVOCATION_ENVELOPE',
    version:'3.0-m3.05',
    status:'READY',
    state:'M3_04_LIVE_EXECUTION_INVOCATION_READY',
    invokeM304:true,
    operatorExecutionAuthorizationId:authorization.operatorExecutionAuthorizationId,
    executionPlan:m304ExecutionPlan,
    explicitExecution:Object.freeze({
      executeLiveCanary:true,
      acknowledgeProductionMutation:true,
      acknowledgeOneShotTokenConsumption:true,
      acknowledgeRollbackOnVerificationFailure:true,
      acknowledgeNoAutomaticRetry:true,
      executionPlanId:m304ExecutionPlan.executionPlanId
    })
  });
}

export function certifyFirstLiveCanaryOperatorExecutionOutcome({
  manifest={},
  authorization={},
  m304Result={}
}={}){
  const authorized=
    authorization?.status==='AUTHORIZED' &&
    authorization?.execute===true &&
    exact(authorization?.manifestId,manifest?.manifestId);

  if(!authorized){
    return Object.freeze({
      status:'BLOCKED',
      state:'OPERATOR_EXECUTION_NOT_AUTHORIZED',
      canonicalCommittedCount:0,
      authorityRelocked:true
    });
  }

  const sameProperty=exact(manifest?.propertyId,m304Result?.propertyId);
  const relocked=m304Result?.authorityRelocked===true;

  const committed=
    m304Result?.state==='FIRST_LIVE_CANARY_COMMIT_VERIFIED' &&
    m304Result?.canonicalCommitted===true &&
    m304Result?.canonicalCommittedCount===1 &&
    m304Result?.verificationSucceeded===true &&
    clean(m304Result?.durableCommitReceiptId)!=='UNAVAILABLE' &&
    clean(m304Result?.postCommitCertificationId)!=='UNAVAILABLE' &&
    sameProperty &&
    relocked;

  const rolledBack=
    m304Result?.state==='FIRST_LIVE_CANARY_ROLLED_BACK' &&
    m304Result?.rollbackExecuted===true &&
    m304Result?.canonicalCommittedCount===0 &&
    clean(m304Result?.durableRollbackReceiptId)!=='UNAVAILABLE' &&
    sameProperty &&
    relocked;

  const blocked=
    m304Result?.state==='FIRST_LIVE_CANARY_BLOCKED' &&
    m304Result?.canonicalCommittedCount===0 &&
    relocked;

  let state='OPERATOR_EXECUTION_OUTCOME_NOT_CERTIFIED';
  let canonicalCommittedCount=0;
  if(committed){
    state='FIRST_LIVE_CANARY_COMMIT_VERIFIED';
    canonicalCommittedCount=1;
  }else if(rolledBack){
    state='FIRST_LIVE_CANARY_ROLLED_BACK';
  }else if(blocked){
    state='FIRST_LIVE_CANARY_BLOCKED';
  }

  const certified=committed||rolledBack||blocked;

  const outcomeReceiptId=certified
    ?stableId([
        manifest.manifestId,
        authorization.operatorExecutionAuthorizationId,
        clean(m304Result?.executionId),
        state,
        String(canonicalCommittedCount)
      ],'GHOR')
    :'UNAVAILABLE';

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_05_OPERATOR_EXECUTION_OUTCOME_CERTIFICATION',
    version:'3.0-m3.05',
    status:certified?'CERTIFIED':'BLOCKED',
    state,
    outcomeReceiptId,
    propertyId:manifest.propertyId,
    liveWriteExecuted:committed||rolledBack||m304Result?.writeAttempted===true,
    canonicalCommittedCount,
    readAfterWriteVerified:committed,
    authorityRelocked:relocked,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticCommit:false
  });
}
