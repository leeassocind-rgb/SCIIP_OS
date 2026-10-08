// SCIIP Explorer 3.0 — M3.28
// Operational Ingestion Policy, Bounded Cohort Governance & Progressive Production Expansion Runtime

import crypto from 'node:crypto';
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const freeze=v=>Object.freeze(v);

export function buildM328Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_28_OPERATIONAL_INGESTION_POLICY_BOUNDED_COHORT_GOVERNANCE_PROGRESSIVE_PRODUCTION_EXPANSION_RUNTIME',
    version:'3.0-m3.28',
    status:'READY',
    m327LifecycleClosureRequired:true,
    mutationClassPolicyRequired:true,
    boundedCohortPolicyRequired:true,
    perRecordQualificationRequired:true,
    idempotencyRequired:true,
    replayProtectionRequired:true,
    atomicWriteBoundaryRequired:true,
    rollbackBoundaryRequired:true,
    failureContainmentRequired:true,
    auditEvidenceRequired:true,
    downstreamPropagationSeparated:true,
    authorityRelockRequired:true,
    progressiveRolloutRequired:true,
    operationalIngestionAuthorized:false,
    liveWriteAuthority:false,
    syncAuthority:false,
    automaticRetry:false,
    generalizedWriteAuthority:false,
    bulkWrites:false,
    persistentWriteAuthority:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false
  });
}

export function buildOperationalMutationClassPolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'OPERATIONAL_MUTATION_CLASS_POLICY_CERTIFIED',
    classes:freeze([
      freeze({
        classId:'CLASS_A_SINGLE_FIELD_NUMERIC',
        description:'Single-property single-field bounded numeric mutation',
        maxRecordsPerOperation:1,
        maxFieldsPerRecord:1,
        requiresExactBeforeState:true,
        requiresRollbackValue:true,
        riskTier:'LOWEST'
      }),
      freeze({
        classId:'CLASS_B_SMALL_COHORT_SINGLE_FIELD',
        description:'Small cohort using one approved field class',
        maxRecordsPerOperation:5,
        maxFieldsPerRecord:1,
        requiresExactBeforeState:true,
        requiresRollbackValue:true,
        riskTier:'LOW'
      }),
      freeze({
        classId:'CLASS_C_MULTI_FIELD_OR_LARGER_COHORT',
        description:'Multi-field or larger cohort operation',
        maxRecordsPerOperation:0,
        maxFieldsPerRecord:0,
        authorized:false,
        requiresFutureMilestone:true,
        riskTier:'NOT_AUTHORIZED'
      })
    ]),
    defaultOperationalClass:'CLASS_A_SINGLE_FIELD_NUMERIC',
    broaderClassesRequireFutureAuthorization:true
  });
}

export function buildBoundedCohortGovernance(){
  return freeze({
    status:'CERTIFIED',
    state:'BOUNDED_COHORT_GOVERNANCE_CERTIFIED',
    initialOperationalCohortLimit:3,
    hardMaximumWithoutNewMilestone:5,
    oneMutationClassPerCohort:true,
    deterministicRecordOrdering:true,
    preflightAllRecordsBeforeFirstWrite:true,
    haltOnFirstFailure:true,
    noPartialUnverifiedContinuation:true,
    perRecordReceiptRequired:true,
    cohortReceiptRequired:true,
    cohortRollbackPlanRequired:true
  });
}

export function buildPerRecordQualificationPolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'PER_RECORD_QUALIFICATION_POLICY_CERTIFIED',
    requirements:freeze([
      'canonical property identity resolved',
      'approved mutation class',
      'exact authoritative before-state read',
      'bounded proposed after-state',
      'non-no-op transition',
      'idempotency key derived',
      'replay token issued',
      'rollback value materialized',
      'source SHA bound',
      'record qualification hash persisted'
    ]),
    allRequirementsMandatory:true
  });
}

export function buildIdempotencyReplayPolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'IDEMPOTENCY_AND_REPLAY_POLICY_CERTIFIED',
    idempotencyScope:'PROPERTY_FIELD_BEFORE_AFTER_OPERATION_CLASS',
    duplicateIntentMustResolveToSameKey:true,
    consumedTokenReplayProhibited:true,
    duplicateCommittedTransitionMustNotRecommit:true,
    tokenSingleUseOnly:true,
    durableTokenLedgerRequired:true
  });
}

export function buildTransactionFailurePolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'TRANSACTION_AND_FAILURE_CONTAINMENT_POLICY_CERTIFIED',
    transactionBoundary:'PER_RECORD',
    atomicWriteRequired:true,
    readAfterWriteRequired:true,
    rollbackOnVerificationFailure:true,
    failureContainment:'STOP_COHORT_ON_FIRST_FAILURE',
    automaticRetry:false,
    retryRequiresNewAuthorization:true,
    unverifiedRecordMayNotAdvanceCohort:true
  });
}

export function buildEvidencePropagationPolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'EVIDENCE_AND_PROPAGATION_POLICY_CERTIFIED',
    perRecordAuditReceiptRequired:true,
    cohortManifestRequired:true,
    cohortTerminalReceiptRequired:true,
    canonicalAuthoritySeparatedFromPropagation:true,
    publicCopyNonAuthoritative:true,
    propagationOnlyAfterCanonicalCohortCertification:true,
    propagationRequiresSeparateExplicitGate:true,
    syncAuthorityRelockAfterPropagation:true
  });
}

export function buildProgressiveRolloutPolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'PROGRESSIVE_PRODUCTION_EXPANSION_POLICY_CERTIFIED',
    stages:freeze([
      freeze({stage:'SIMULATED_COHORT',maxRecords:5,liveWrites:false}),
      freeze({stage:'LIVE_MICRO_COHORT',maxRecords:3,liveWrites:false,requiresFutureAuthorization:true}),
      freeze({stage:'LIVE_BOUNDED_COHORT',maxRecords:5,liveWrites:false,requiresFutureAuthorization:true}),
      freeze({stage:'BROADER_OPERATIONAL_INGESTION',maxRecords:0,liveWrites:false,requiresFutureMilestone:true})
    ]),
    currentAuthorizedStage:'SIMULATED_COHORT',
    liveExpansionAuthorized:false
  });
}

export function certifyM328OperationalPolicy({
  lifecycleClosure,
  mutationClassPolicy,
  cohortGovernance,
  qualificationPolicy,
  idempotencyReplayPolicy,
  transactionFailurePolicy,
  evidencePropagationPolicy,
  progressiveRolloutPolicy
}={}){
  const lifecycleOk=
    lifecycleClosure?.status==='PASSED' &&
    lifecycleClosure?.lifecycleClosureCertificate?.status==='CERTIFIED' &&
    lifecycleClosure?.lifecycleClosureCertificate?.state==='FIRST_GOVERNED_PRODUCTION_LIFECYCLE_CLOSED' &&
    lifecycleClosure?.lifecycleClosureCertificate?.allAuthoritiesClosed===true;

  const modules=[
    mutationClassPolicy,cohortGovernance,qualificationPolicy,idempotencyReplayPolicy,
    transactionFailurePolicy,evidencePropagationPolicy,progressiveRolloutPolicy
  ];
  const modulesOk=modules.every(x=>x?.status==='CERTIFIED');
  const ok=lifecycleOk&&modulesOk;

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_28_OPERATIONAL_INGESTION_POLICY_CERTIFICATION',
    version:'3.0-m3.28',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'OPERATIONAL_INGESTION_POLICY_AND_BOUNDED_COHORT_GOVERNANCE_CERTIFIED':'OPERATIONAL_INGESTION_POLICY_CERTIFICATION_BLOCKED',
    lifecycleClosureVerified:lifecycleOk,
    allPolicyModulesCertified:modulesOk,
    policyId:ok?`G328P-${sha([
      lifecycleClosure?.lifecycleClosureCertificate?.lifecycleId,
      mutationClassPolicy?.defaultOperationalClass,
      cohortGovernance?.initialOperationalCohortLimit
    ].join('|')).slice(0,16).toUpperCase()}`:null,
    simulatedCohortAuthorized:ok,
    operationalIngestionAuthorized:false,
    liveWritesAuthorized:false,
    generalizedProductionWritesAuthorized:false,
    nextMilestone:'M3.29_SIMULATED_BOUNDED_COHORT_EXECUTION_CERTIFICATION'
  });
}
