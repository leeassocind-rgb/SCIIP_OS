// SCIIP Explorer 3.0 — M3.27
// Governed Production Lifecycle Closure & Canary-to-Operational Transition Certification Runtime

import fs from 'node:fs';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM327Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_27_GOVERNED_PRODUCTION_LIFECYCLE_CLOSURE_CANARY_TO_OPERATIONAL_TRANSITION_CERTIFICATION_RUNTIME',
    version:'3.0-m3.27',
    status:'READY',
    m324ACommitEvidenceRequired:true,
    m325PostCommitEvidenceRequired:true,
    m326PropagationEvidenceRequired:true,
    canonicalBaselineStabilityRequired:true,
    publicBaselineParityRequired:true,
    lifecycleEvidenceConsolidationRequired:true,
    writeAuthorityClosureRequired:true,
    syncAuthorityClosureRequired:true,
    canaryReferencePatternRequired:true,
    operationalTransitionGovernanceRequired:true,
    liveMutationAllowed:false,
    propagationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    automaticRetry:false,
    generalizedWriteAuthority:false,
    generalizedSyncAuthority:false,
    bulkWrites:false,
    multiPropertyWrites:false,
    multiDestinationWrites:false,
    persistentWriteAuthority:false
  });
}

export function certifyLifecycleEvidenceChain({m324A,m325,m326}={}){
  const c24=m324A?.status==='COMMITTED_AND_VERIFIED'&&m324A?.canonicalCommittedCount===1;
  const c25=m325?.status==='PASSED'&&m325?.authoritativeCertification?.status==='CERTIFIED'&&
    m325?.tokenReplayCertification?.status==='CERTIFIED'&&m325?.authorityRelock?.status==='CERTIFIED';
  const c26=m326?.status==='PASSED'&&m326?.postPropagationConsistency?.status==='CERTIFIED'&&
    m326?.syncAuthorityRelock?.status==='CERTIFIED';

  const eventMatch=
    c24 && c25 &&
    m324A.eventId===m325.authoritativeCertification?.currentState?.lastEventId;

  const stateMatch=
    c24 && c25 && c26 &&
    same(m324A.target?.afterValue,m325.postCommitBaseline?.targetCurrentValue) &&
    same(m324A.target?.afterValue,m326.postPropagationConsistency?.targetCurrentValue);

  const shaMatch=
    c25 && c26 &&
    m325.postCommitBaseline?.authoritativeSha256===m326.postPropagationConsistency?.authoritativeSha256 &&
    m326.postPropagationConsistency?.authoritativeSha256===m326.postPropagationConsistency?.publicSha256;

  const eventCountMatch=
    c25 && c26 &&
    m325.postCommitBaseline?.canonicalEventCount===m326.postPropagationConsistency?.authoritativeEventCount &&
    m326.postPropagationConsistency?.authoritativeEventCount===m326.postPropagationConsistency?.publicEventCount;

  const ok=c24&&c25&&c26&&eventMatch&&stateMatch&&shaMatch&&eventCountMatch;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'GOVERNED_PRODUCTION_LIFECYCLE_EVIDENCE_CHAIN_CERTIFIED':'GOVERNED_PRODUCTION_LIFECYCLE_EVIDENCE_CHAIN_BLOCKED',
    m324ACommitCertified:c24,
    m325PostCommitCertified:c25,
    m326PropagationCertified:c26,
    eventMatch,
    stateMatch,
    shaMatch,
    eventCountMatch
  });
}

export function certifyAuthorityClosure({m325,m326}={}){
  const writeClosed=
    m325?.authorityRelock?.status==='CERTIFIED' &&
    m325.authorityRelock.liveWriteAuthority===false &&
    m325.authorityRelock.generalizedWriteAuthority===false &&
    m325.authorityRelock.bulkWrites===false &&
    m325.authorityRelock.multiPropertyWrites===false &&
    m325.authorityRelock.persistentWriteAuthority===false;

  const syncClosed=
    m326?.syncAuthorityRelock?.status==='CERTIFIED' &&
    m326.syncAuthorityRelock.syncAuthority===false &&
    m326.syncAuthorityRelock.canonicalWriteAuthority===false &&
    m326.syncAuthorityRelock.generalizedSyncAuthority===false &&
    m326.syncAuthorityRelock.bulkWrites===false &&
    m326.syncAuthorityRelock.multiDestinationWrites===false;

  return freeze({
    status:writeClosed&&syncClosed?'CERTIFIED':'BLOCKED',
    state:writeClosed&&syncClosed?'ALL_TEMPORARY_AUTHORITIES_CLOSED':'TEMPORARY_AUTHORITY_CLOSURE_FAILED',
    writeAuthorityClosed:writeClosed,
    syncAuthorityClosed:syncClosed,
    liveWriteAuthority:false,
    generalizedWriteAuthority:false,
    syncAuthority:false,
    generalizedSyncAuthority:false,
    persistentWriteAuthority:false
  });
}

export function buildCanaryReferencePattern({m324A,m325,m326}={}){
  if(!m324A?.eventId||m325?.status!=='PASSED'||m326?.status!=='PASSED'){
    return freeze({status:'BLOCKED',state:'CANARY_REFERENCE_PATTERN_INPUTS_INCOMPLETE'});
  }

  const pattern={
    patternId:`G327P-${sha([
      m324A.eventId,
      m324A.target?.propertyId,
      m324A.target?.fieldName,
      m325.postCommitBaseline?.authoritativeSha256
    ].join('|')).slice(0,16).toUpperCase()}`,
    lifecycle:[
      'construct intent',
      'qualify mutation',
      'stabilize authoritative source',
      'bind single-use manifest',
      'explicit operator approval',
      'single canonical commit',
      'read-after-write verification',
      'post-commit certification',
      'controlled downstream propagation',
      'authority relock'
    ],
    referenceEventId:m324A.eventId,
    referenceTarget:clone(m324A.target),
    authoritativePostCommitSha256:m325.postCommitBaseline?.authoritativeSha256,
    canonicalEventCount:m325.postCommitBaseline?.canonicalEventCount,
    propagationParityCertified:m326.postPropagationConsistency?.status==='CERTIFIED',
    tokenReplayLocked:m325.tokenReplayCertification?.replayAllowed===false,
    authorityRelocked:m325.authorityRelock?.liveWriteAuthority===false&&m326.syncAuthorityRelock?.syncAuthority===false
  };

  const ok=pattern.propagationParityCertified&&pattern.tokenReplayLocked&&pattern.authorityRelocked;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'PRODUCTION_CANARY_REFERENCE_PATTERN_CERTIFIED':'PRODUCTION_CANARY_REFERENCE_PATTERN_BLOCKED',
    pattern:freeze(pattern)
  });
}

export function certifyOperationalTransitionReadiness({
  lifecycleCertification,
  authorityClosure,
  canaryReferencePattern
}={}){
  const base=
    lifecycleCertification?.status==='CERTIFIED' &&
    authorityClosure?.status==='CERTIFIED' &&
    canaryReferencePattern?.status==='CERTIFIED';

  const requirements=[
    'new operational write policy must be explicitly scoped',
    'new authorization manifest required for every write class',
    'idempotency and replay protection required',
    'atomic write and rollback required',
    'read-after-write verification required',
    'bounded batch size required before multi-record operation',
    'observability and durable audit receipts required',
    'downstream propagation must remain separate from canonical authority',
    'write and sync authority must relock after every bounded operation',
    'progressive rollout must begin with a small explicitly approved cohort'
  ];

  return freeze({
    status:base?'CERTIFIED':'BLOCKED',
    state:base?'CANARY_TO_OPERATIONAL_TRANSITION_GOVERNANCE_CERTIFIED':'CANARY_TO_OPERATIONAL_TRANSITION_GOVERNANCE_BLOCKED',
    operationalIngestionAuthorized:false,
    generalizedProductionWritesAuthorized:false,
    additionalCanaryAuthorized:false,
    transitionRequirements:freeze(requirements),
    nextPhaseRequiresNewMilestone:true
  });
}

export function buildLifecycleClosureCertificate({
  lifecycleCertification,
  authorityClosure,
  canaryReferencePattern,
  operationalTransitionReadiness,
  m324A,m325,m326
}={}){
  const ok=
    lifecycleCertification?.status==='CERTIFIED' &&
    authorityClosure?.status==='CERTIFIED' &&
    canaryReferencePattern?.status==='CERTIFIED' &&
    operationalTransitionReadiness?.status==='CERTIFIED';

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_27_GOVERNED_PRODUCTION_LIFECYCLE_CLOSURE_CERTIFICATE',
    version:'3.0-m3.27',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'FIRST_GOVERNED_PRODUCTION_LIFECYCLE_CLOSED':'PRODUCTION_LIFECYCLE_CLOSURE_BLOCKED',
    lifecycleId:ok?`G327L-${sha([
      m324A?.eventId,
      m325?.postCommitBaseline?.authoritativeSha256,
      m326?.postPropagationConsistency?.publicSha256
    ].join('|')).slice(0,16).toUpperCase()}`:null,
    referenceEventId:m324A?.eventId||null,
    finalCanonicalSha256:m325?.postCommitBaseline?.authoritativeSha256||null,
    finalPublicSha256:m326?.postPropagationConsistency?.publicSha256||null,
    finalCanonicalEventCount:m325?.postCommitBaseline?.canonicalEventCount??null,
    finalPublicEventCount:m326?.postPropagationConsistency?.publicEventCount??null,
    finalTargetValue:m325?.postCommitBaseline?.targetCurrentValue,
    allAuthoritiesClosed:authorityClosure?.status==='CERTIFIED',
    liveWriteAuthority:false,
    syncAuthority:false,
    operationalIngestionAuthorized:false,
    additionalCanonicalCommitsDuringM327:0
  });
}
