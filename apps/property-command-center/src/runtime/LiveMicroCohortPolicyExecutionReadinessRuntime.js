// SCIIP Explorer 3.0 — M3.30
// Live Micro-Cohort Policy & Execution Readiness Runtime
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const freeze=v=>Object.freeze(v);

export function buildM330Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_30_LIVE_MICRO_COHORT_POLICY_EXECUTION_READINESS_RUNTIME',
    version:'3.0-m3.30',
    status:'READY',
    m329SimulationCertificationRequired:true,
    maxLiveMicroCohortSize:3,
    oneMutationClassPerCohort:true,
    fullCohortPreflightRequired:true,
    exactBeforeStateRequired:true,
    perRecordSourceShaBindingRequired:true,
    perRecordSingleUseTokenRequired:true,
    perRecordIdempotencyRequired:true,
    perRecordAtomicCommitRequired:true,
    perRecordReadAfterWriteRequired:true,
    stopOnFirstFailureRequired:true,
    rollbackContainmentRequired:true,
    durablePerRecordReceiptRequired:true,
    durableCohortReceiptRequired:true,
    downstreamPropagationSeparated:true,
    authorityRelockRequired:true,
    liveMicroCohortAuthorized:false,
    operationalIngestionAuthorized:false,
    generalizedProductionWritesAuthorized:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    automaticRetry:false
  });
}

export function buildLiveMicroCohortPolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'LIVE_MICRO_COHORT_POLICY_CERTIFIED',
    mutationClass:'CLASS_B_SMALL_COHORT_SINGLE_FIELD',
    maxRecords:3,
    maxFieldsPerRecord:1,
    sameFieldClassAcrossCohort:true,
    deterministicOrdering:true,
    allRecordsMustPreflightBeforeFirstWrite:true,
    exactBeforeStatePerRecord:true,
    rollbackValuePerRecord:true,
    sourceShaBoundPerRecord:true,
    idempotencyKeyPerRecord:true,
    singleUseTokenPerRecord:true,
    replayProhibited:true,
    duplicateCommittedTransitionMustNotRecommit:true
  });
}

export function buildExecutionBoundaryPolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'LIVE_MICRO_COHORT_EXECUTION_BOUNDARY_POLICY_CERTIFIED',
    transactionBoundary:'PER_RECORD',
    writeSequence:'STRICTLY_SEQUENTIAL',
    atomicWriteRequired:true,
    readAfterWriteRequired:true,
    tokenConsumedImmediatelyBeforeWrite:true,
    haltOnFirstFailure:true,
    rollbackFailedRecord:true,
    noContinuationAfterFailure:true,
    noAutomaticRetry:true,
    retryRequiresNewManifest:true,
    completedPriorRecordsRemainCertified:true,
    unexecutedLaterRecordsRemainUnmodified:true
  });
}

export function buildCohortEvidencePolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'LIVE_MICRO_COHORT_EVIDENCE_POLICY_CERTIFIED',
    cohortManifestRequired:true,
    manifestBindsAllRecordQualificationHashes:true,
    manifestBindsAuthoritativeBaselineSha:true,
    perRecordPreWriteReceiptRequired:true,
    perRecordPostWriteReceiptRequired:true,
    perRecordRollbackReceiptRequiredOnFailure:true,
    cohortTerminalReceiptRequired:true,
    tokenLedgerRequired:true,
    auditLogRequired:true,
    canonicalEventIdsRecorded:true
  });
}

export function buildPropagationAndRelockPolicy(){
  return freeze({
    status:'CERTIFIED',
    state:'LIVE_MICRO_COHORT_PROPAGATION_AND_RELOCK_POLICY_CERTIFIED',
    canonicalCertificationMustCompleteBeforePropagation:true,
    propagationRequiresSeparateExplicitGate:true,
    generatedCopiesRemainNonAuthoritative:true,
    propagationParityRequired:true,
    syncAuthorityRelockRequired:true,
    writeAuthorityRelockRequired:true,
    generalizedWriteAuthorityNeverGranted:true,
    persistentWriteAuthorityNeverGranted:true
  });
}

export function certifyM330Readiness({
  m329Evidence,
  microPolicy,
  executionPolicy,
  evidencePolicy,
  propagationPolicy
}={}){
  const m329ok=
    m329Evidence?.status==='PASSED' &&
    m329Evidence?.certification?.status==='CERTIFIED' &&
    m329Evidence?.certification?.normalPathCertified===true &&
    m329Evidence?.certification?.failureContainmentCertified===true &&
    m329Evidence?.certification?.replayRejectionCertified===true &&
    m329Evidence?.certification?.canonicalCommits===0 &&
    m329Evidence?.certification?.liveMicroCohortAuthorized===false;

  const modules=[microPolicy,executionPolicy,evidencePolicy,propagationPolicy];
  const modulesOk=modules.every(x=>x?.status==='CERTIFIED');
  const ok=m329ok&&modulesOk;

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_30_LIVE_MICRO_COHORT_EXECUTION_READINESS_CERTIFICATION',
    version:'3.0-m3.30',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'LIVE_MICRO_COHORT_POLICY_AND_EXECUTION_READINESS_CERTIFIED':'LIVE_MICRO_COHORT_READINESS_BLOCKED',
    readinessId:ok?`G330R-${sha([
      m329Evidence?.certification?.certificationId,
      microPolicy?.mutationClass,
      microPolicy?.maxRecords
    ].join('|')).slice(0,16).toUpperCase()}`:null,
    simulationEvidenceAccepted:m329ok,
    allReadinessModulesCertified:modulesOk,
    maxFutureLiveMicroCohortSize:3,
    liveMicroCohortAuthorized:false,
    operationalIngestionAuthorized:false,
    explicitFutureAuthorizationRequired:true,
    nextMilestone:'M3.31_LIVE_MICRO_COHORT_CANDIDATE_SELECTION_AND_PREAUTHORIZATION'
  });
}

export function buildLiveMicroCohortPreauthorizationRequirements(){
  return freeze({
    status:'CERTIFIED',
    state:'LIVE_MICRO_COHORT_PREAUTHORIZATION_REQUIREMENTS_CERTIFIED',
    requirements:freeze([
      'select no more than three qualified records',
      'all records share one approved mutation class',
      're-read exact authoritative before-state for every record',
      'bind authoritative source SHA before issuing manifest',
      'derive unique idempotency key for every record',
      'issue unique single-use token for every record',
      'materialize rollback value for every record',
      'persist per-record qualification hash',
      'construct one cohort manifest binding all records',
      'perform final authoritative cohort-wide preflight',
      'require explicit operator approval in a later milestone',
      'grant no generalized or persistent write authority'
    ]),
    requirementsCount:12,
    m330GrantsLiveAuthority:false
  });
}
