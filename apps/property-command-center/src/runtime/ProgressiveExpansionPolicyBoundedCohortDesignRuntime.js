// SCIIP Explorer 3.0 — M3.36
// Progressive Expansion Policy & Bounded Cohort Design Runtime

import fs from 'node:fs';
import crypto from 'node:crypto';

const freeze=v=>Object.freeze(v);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const deepFreeze=v=>{
  if(v && typeof v==='object' && !Object.isFrozen(v)){
    Object.freeze(v);
    for(const k of Object.keys(v)) deepFreeze(v[k]);
  }
  return v;
};

export const M336_POLICY=deepFreeze({
  contract:'SCIIP_EXPLORER_3_M3_36_PROGRESSIVE_EXPANSION_POLICY_BOUNDED_COHORT_DESIGN',
  version:'3.0-m3.36',
  milestone:'M3.36',
  evidenceType:'PROGRESSIVE_EXPANSION_POLICY_CERTIFICATION',
  status:'READY',
  referenceLifecycle:{
    cohortSize:3,
    mutationClass:'CLASS_B_SMALL_COHORT_SINGLE_FIELD',
    requiredClosureState:'FIRST_LIVE_MICRO_COHORT_LIFECYCLE_CLOSED'
  },
  nextBoundedCohort:{
    mutationClass:'CLASS_B_EXPANDED_COHORT_SINGLE_FIELD',
    maximumRecords:10,
    maximumFieldsPerRecord:1,
    oneApprovedFieldPerCohort:true,
    candidateSelectionRequired:true,
    candidatePreauthorizationRequired:true,
    executionAuthorized:false
  },
  authorization:{
    freshManifestRequired:true,
    freshAuthoritativeSourceShaRequired:true,
    exactBeforeStatePerRecord:true,
    rollbackValueMaterializedPerRecord:true,
    freshSingleUseTokenPerRecord:true,
    freshIdempotencyKeyPerRecord:true,
    sourceShaDriftInvalidatesManifest:true,
    targetStateDriftInvalidatesRecord:true,
    generalizedWriteAuthority:false,
    persistentWriteAuthority:false,
    operationalIngestionAuthority:false
  },
  executionSemantics:{
    cohortWidePreflightBeforeFirstWrite:true,
    deterministicOrdering:true,
    concurrencyAllowed:false,
    strictlySequential:true,
    perRecordTransactionBoundary:true,
    atomicCanonicalWrite:true,
    readAfterWriteRequired:true,
    haltOnFirstFailure:true,
    rollbackFailedRecordOnly:true,
    priorSuccessfulRecordsRemainCommitted:true,
    laterUnexecutedRecordsRemainUntouched:true,
    automaticRetry:false,
    retryRequiresFreshManifest:true,
    retryRequiresFreshTokens:true,
    retryRequiresFreshSourceBinding:true
  },
  evidenceAndObservability:{
    perRecordPreflightEvidence:true,
    cohortPreflightCertificate:true,
    perRecordExecutionReceipt:true,
    cohortTerminalReceipt:true,
    tokenConsumptionEvidence:true,
    idempotencyCommitEvidence:true,
    replayAuditRequired:true,
    authorityRelockEvidence:true,
    propagationParityEvidence:true,
    deterministicSequenceNumbers:true,
    contractDrivenEvidenceIdentityPreferred:true,
    filenameFallbackAllowedForCertifiedLegacyEvidence:true
  },
  propagation:{
    separateAuthorityDomain:true,
    canonicalWriteAndPropagationCombined:false,
    propagationRequiresSeparateMilestone:true,
    canonicalEventsCreatedByPropagation:0,
    canonicalMutationDuringPropagation:false,
    syncAuthorityMustRelock:true
  },
  stopConditions:[
    'missing or ambiguous authoritative source',
    'missing required lifecycle evidence',
    'source SHA drift after binding',
    'candidate before-state drift',
    'invalid or consumed token',
    'duplicate committed idempotency key',
    'ambiguous candidate identity',
    'cohort-wide preflight failure',
    'write verification failure',
    'rollback verification failure',
    'unexpected authority state'
  ],
  advancement:{
    referenceCohortSize:3,
    currentCeiling:10,
    provisionalLaterCeiling:25,
    provisionalLaterCeilingAuthorized:false,
    requiresCompleteTenRecordLifecycleClosure:true,
    requiredCriteria:[
      '100_PERCENT_PREFLIGHT_SUCCESS',
      'ZERO_UNEXPLAINED_SOURCE_OR_TARGET_DRIFT',
      'ZERO_DUPLICATE_CANONICAL_EVENTS',
      'ZERO_REPLAY_ACCEPTANCE',
      'ZERO_DUPLICATE_COMMIT_ACCEPTANCE',
      'ZERO_UNEXPLAINED_ROLLBACKS_OR_HALTS',
      'DETERMINISTIC_EVENT_AND_EVIDENCE_ORDERING',
      'READ_AFTER_WRITE_VERIFIED_FOR_EVERY_COMMIT',
      'CANONICAL_PUBLIC_PARITY_RESTORED_AFTER_SEPARATE_PROPAGATION',
      'ZERO_CANONICAL_EVENTS_CREATED_BY_PROPAGATION',
      'ALL_TEMPORARY_AUTHORITIES_CLOSED',
      'NO_GENERALIZED_OR_PERSISTENT_AUTHORITY'
    ],
    nextExpansionAutomatic:false,
    newPolicyMilestoneRequired:true
  },
  safety:{
    canonicalMutationAllowed:false,
    productionDataWriteAllowed:false,
    propagationAllowed:false,
    liveTokenIssuanceAllowed:false,
    progressiveExpansionExecutionAuthorized:false,
    operationalIngestionAuthorized:false,
    generalizedProductionWritesAuthorized:false,
    persistentWriteAuthority:false
  },
  nextMilestone:'M3.37_EXPANDED_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZATION'
});

export function readJsonState(p){
  const bytes=fs.readFileSync(p);
  const corpus=JSON.parse(bytes.toString('utf8'));
  return {path:p,bytes,corpus,sha256:sha(bytes),eventCount:Array.isArray(corpus?.events)?corpus.events.length:0};
}

export function findEvidenceByContract(evidenceDir, contracts, legacyNames=[]){
  const wanted=new Set(Array.isArray(contracts)?contracts:[contracts]);
  const hits=[];
  if(fs.existsSync(evidenceDir)){
    for(const name of fs.readdirSync(evidenceDir).filter(n=>n.endsWith('.json')).sort()){
      const p=`${evidenceDir}/${name}`;
      try{
        const data=JSON.parse(fs.readFileSync(p,'utf8'));
        const candidates=[data?.contract,data?.framework,data?.lifecycleClosureCertificate?.contract,data?.progressiveExpansionReadiness?.contract];
        if(candidates.some(c=>wanted.has(c))) hits.push({name,path:p,data,resolution:'CONTRACT'});
      }catch{}
    }
  }
  if(hits.length===1) return hits[0];
  if(hits.length>1){
    // Prefer exact M3.35 lifecycle closure evidence if one candidate has the closure state.
    const exact=hits.filter(h=>h.data?.lifecycleClosureCertificate?.state==='FIRST_LIVE_MICRO_COHORT_LIFECYCLE_CLOSED');
    if(exact.length===1) return exact[0];
    return {ambiguous:true,hits};
  }
  for(const name of legacyNames){
    const p=`${evidenceDir}/${name}`;
    if(fs.existsSync(p)){
      try{return {name,path:p,data:JSON.parse(fs.readFileSync(p,'utf8')),resolution:'LEGACY_FILENAME'};}catch{}
    }
  }
  return null;
}

export function certifyM335Closure(m335){
  const cert=m335?.lifecycleClosureCertificate;
  const safety=m335?.safety;
  const ok=m335?.status==='PASSED' &&
    cert?.status==='CERTIFIED' &&
    cert?.state==='FIRST_LIVE_MICRO_COHORT_LIFECYCLE_CLOSED' &&
    cert?.cohortSize===3 && cert?.canonicalCommits===3 &&
    cert?.allAuthoritiesClosed===true &&
    cert?.replayProtectionCertified===true &&
    cert?.canonicalPublicParityCertified===true &&
    cert?.progressiveExpansionReadinessCertified===true &&
    cert?.progressiveExpansionAuthorized===false &&
    cert?.operationalIngestionAuthorized===false &&
    safety?.liveWriteAuthority===false && safety?.syncAuthority===false &&
    safety?.writeExecuted===false && safety?.propagationExecuted===false &&
    safety?.additionalCanonicalCommits===0;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'M335_LIFECYCLE_CLOSURE_ACCEPTED':'M335_LIFECYCLE_CLOSURE_NOT_CERTIFIED',
    referenceCohortSize:cert?.cohortSize??null,
    canonicalCommits:cert?.canonicalCommits??null,
    progressiveExpansionReadinessCertified:cert?.progressiveExpansionReadinessCertified===true,
    progressiveExpansionAuthorized:false
  });
}

export function certifyBaseline({m335,authoritative,publicCopy}){
  const cert=m335?.lifecycleClosureCertificate;
  const expectedSha=cert?.finalCanonicalSha256;
  const expectedCount=cert?.canonicalEventCount;
  const ok=authoritative.sha256===expectedSha && publicCopy.sha256===expectedSha &&
    authoritative.eventCount===expectedCount && publicCopy.eventCount===expectedCount &&
    Buffer.compare(authoritative.bytes,publicCopy.bytes)===0;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'M336_BASELINE_STABILITY_AND_PARITY_CERTIFIED':'M336_BASELINE_STABILITY_OR_PARITY_FAILED',
    authoritativeSource:authoritative.path,
    publicCopy:publicCopy.path,
    authoritativeSha256:authoritative.sha256,
    publicSha256:publicCopy.sha256,
    authoritativeEventCount:authoritative.eventCount,
    publicEventCount:publicCopy.eventCount,
    shaMatchesM335:authoritative.sha256===expectedSha && publicCopy.sha256===expectedSha,
    eventCountMatchesM335:authoritative.eventCount===expectedCount && publicCopy.eventCount===expectedCount,
    byteParity:Buffer.compare(authoritative.bytes,publicCopy.bytes)===0,
    publicCopyAuthoritative:false
  });
}

export function certifyPolicy(policy=M336_POLICY){
  const n=policy.nextBoundedCohort;
  const a=policy.authorization;
  const e=policy.executionSemantics;
  const p=policy.propagation;
  const s=policy.safety;
  const ok=n.maximumRecords===10 && n.maximumFieldsPerRecord===1 &&
    n.executionAuthorized===false &&
    a.freshManifestRequired && a.freshAuthoritativeSourceShaRequired &&
    a.exactBeforeStatePerRecord && a.rollbackValueMaterializedPerRecord &&
    a.freshSingleUseTokenPerRecord && a.freshIdempotencyKeyPerRecord &&
    a.generalizedWriteAuthority===false && a.persistentWriteAuthority===false &&
    e.cohortWidePreflightBeforeFirstWrite && e.strictlySequential && e.concurrencyAllowed===false &&
    e.readAfterWriteRequired && e.haltOnFirstFailure && e.rollbackFailedRecordOnly &&
    e.priorSuccessfulRecordsRemainCommitted && e.laterUnexecutedRecordsRemainUntouched &&
    e.automaticRetry===false && e.retryRequiresFreshManifest &&
    p.separateAuthorityDomain && p.canonicalWriteAndPropagationCombined===false &&
    p.propagationRequiresSeparateMilestone && p.canonicalEventsCreatedByPropagation===0 &&
    s.canonicalMutationAllowed===false && s.productionDataWriteAllowed===false &&
    s.propagationAllowed===false && s.liveTokenIssuanceAllowed===false &&
    s.progressiveExpansionExecutionAuthorized===false && s.operationalIngestionAuthorized===false;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'M336_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED':'M336_PROGRESSIVE_EXPANSION_POLICY_INVALID',
    nextBoundedCohortCeiling:n.maximumRecords,
    mutationClass:n.mutationClass,
    concurrencyAllowed:e.concurrencyAllowed,
    executionAuthorized:n.executionAuthorized,
    operationalIngestionAuthorized:s.operationalIngestionAuthorized
  });
}
