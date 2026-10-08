// SCIIP Explorer 3.0 — M3.35
// Live Micro-Cohort Lifecycle Closure & Progressive Expansion Readiness Certification Runtime

import fs from 'node:fs';
import crypto from 'node:crypto';

const freeze=v=>Object.freeze(v);
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function readJson(p){
  const bytes=fs.readFileSync(p);
  const corpus=JSON.parse(bytes.toString('utf8'));
  return {bytes,corpus,sha256:sha(bytes),eventCount:Array.isArray(corpus?.events)?corpus.events.length:0};
}

export function buildM335Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_35_LIVE_MICRO_COHORT_LIFECYCLE_CLOSURE_PROGRESSIVE_EXPANSION_READINESS_CERTIFICATION_RUNTIME',
    version:'3.0-m3.35',
    status:'READY',
    m331ThroughM334EvidenceRequired:true,
    canonicalAndPublicParityRequired:true,
    threeRecordLifecycleRequired:true,
    replayProtectionRequired:true,
    writeAuthorityClosedRequired:true,
    syncAuthorityClosedRequired:true,
    progressiveExpansionPolicyRequired:true,
    progressiveExpansionAuthorized:false,
    operationalIngestionAuthorized:false,
    generalizedProductionWritesAuthorized:false,
    liveMutationAllowed:false,
    propagationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false
  });
}

export function certifyLifecycle({m331,m332,m333,m334}={}){
  const preauthOk=m331?.status==='PASSED' || m331?.preauthorizationManifest?.status==='CERTIFIED' || m331?.manifest?.status==='CERTIFIED';
  const exec=m332?.result ?? m332;
  const execOk=(m332?.status==='PASSED'||exec?.status==='PASSED') &&
    exec?.canonicalCommits===3 && exec?.executedRecords===3 &&
    exec?.rolledBackRecords===0 && exec?.halted===false &&
    exec?.liveWriteAuthorityRelocked===true;
  const postOk=m333?.status==='PASSED' &&
    m333?.authoritativeCertification?.status==='CERTIFIED' &&
    m333?.replayProtectionAudit?.status==='CERTIFIED' &&
    m333?.authorityRelockCertification?.status==='CERTIFIED';
  const propOk=m334?.status==='PASSED' &&
    m334?.propagation?.status==='PASSED' &&
    m334?.postPropagationParity?.status==='CERTIFIED' &&
    m334?.syncAuthorityRelock?.status==='CERTIFIED';

  const ok=preauthOk&&execOk&&postOk&&propOk;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'LIVE_MICRO_COHORT_LIFECYCLE_EVIDENCE_CHAIN_CERTIFIED':'LIVE_MICRO_COHORT_LIFECYCLE_EVIDENCE_CHAIN_INCOMPLETE',
    m331PreauthorizationCertified:preauthOk,
    m332ExecutionCertified:execOk,
    m333PostCommitCertified:postOk,
    m334PropagationCertified:propOk,
    canonicalCommits:exec?.canonicalCommits??null,
    executedRecords:exec?.executedRecords??null,
    rolledBackRecords:exec?.rolledBackRecords??null
  });
}

export function certifyFinalParity({m333,m334}={}){
  const authPath=m333?.postMicroCohortBaseline?.authoritativeSource ??
    m333?.downstreamPropagationReadiness?.authoritativeSource;
  const pubPath=m333?.downstreamPropagationReadiness?.publicCopy ??
    m334?.propagation?.publicCopy;
  const expectedSha=m334?.postPropagationParity?.authoritativeSha256;
  const expectedCount=m334?.postPropagationParity?.authoritativeEventCount;

  try{
    const a=readJson(authPath),p=readJson(pubPath);
    const shaStable=a.sha256===expectedSha && p.sha256===expectedSha;
    const countStable=a.eventCount===expectedCount && p.eventCount===expectedCount;
    const byteParity=Buffer.compare(a.bytes,p.bytes)===0;
    const semanticParity=same(a.corpus,p.corpus);
    const ok=shaStable&&countStable&&byteParity&&semanticParity;
    return freeze({
      status:ok?'CERTIFIED':'BLOCKED',
      state:ok?'FINAL_CANONICAL_PUBLIC_BASELINE_PARITY_CERTIFIED':'FINAL_CANONICAL_PUBLIC_BASELINE_PARITY_FAILED',
      authoritativeSource:authPath,
      publicCopy:pubPath,
      authoritativeSha256:a.sha256,
      publicSha256:p.sha256,
      authoritativeEventCount:a.eventCount,
      publicEventCount:p.eventCount,
      shaStable,countStable,byteParity,semanticParity,
      publicCopyAuthoritative:false
    });
  }catch{
    return freeze({status:'BLOCKED',state:'FINAL_BASELINE_READ_FAILED'});
  }
}

export function certifyAuthorityClosure({m333,m334}={}){
  const w=m333?.authorityRelockCertification;
  const s=m334?.syncAuthorityRelock;
  const ok=w?.status==='CERTIFIED' &&
    w?.liveWriteAuthority===false &&
    w?.generalizedWriteAuthority===false &&
    w?.persistentWriteAuthority===false &&
    s?.status==='CERTIFIED' &&
    s?.syncAuthority===false &&
    s?.canonicalWriteAuthority===false &&
    s?.generalizedSyncAuthority===false;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'ALL_MICRO_COHORT_TEMPORARY_AUTHORITIES_CLOSED':'MICRO_COHORT_AUTHORITY_CLOSURE_FAILED',
    liveWriteAuthority:false,
    generalizedWriteAuthority:false,
    persistentWriteAuthority:false,
    canonicalWriteAuthority:false,
    syncAuthority:false,
    generalizedSyncAuthority:false,
    automaticRetry:false
  });
}

export function certifyReplayAndEvidence({m333,m334}={}){
  const r=m333?.replayProtectionAudit;
  const p=m334?.propagation;
  const ok=r?.status==='CERTIFIED' &&
    r?.consumedTokenCount===3 &&
    r?.committedIdempotencyKeyCount===3 &&
    r?.allTokensConsumed===true &&
    r?.allIdempotencyCommitted===true &&
    r?.replayAllowed===false &&
    r?.duplicateCommitAllowed===false &&
    p?.canonicalEventsCreated===0 &&
    p?.authoritativeMutationPerformed===false;
  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'MICRO_COHORT_REPLAY_AND_EVIDENCE_CLOSURE_CERTIFIED':'MICRO_COHORT_REPLAY_AND_EVIDENCE_CLOSURE_FAILED',
    consumedTokenCount:r?.consumedTokenCount??null,
    committedIdempotencyKeyCount:r?.committedIdempotencyKeyCount??null,
    replayAllowed:false,
    duplicateCommitAllowed:false,
    propagationCanonicalEventsCreated:p?.canonicalEventsCreated??null,
    authoritativeMutationDuringPropagation:p?.authoritativeMutationPerformed??null
  });
}

export function buildProgressiveExpansionReadiness({lifecycle,parity,authority,replay}={}){
  const ready=[lifecycle,parity,authority,replay].every(x=>x?.status==='CERTIFIED');
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_35_PROGRESSIVE_EXPANSION_READINESS_CERTIFICATION',
    version:'3.0-m3.35',
    status:ready?'CERTIFIED':'BLOCKED',
    state:ready?'PROGRESSIVE_EXPANSION_READINESS_CERTIFIED':'PROGRESSIVE_EXPANSION_READINESS_BLOCKED',
    referenceCohortSize:3,
    referenceMutationClass:'CLASS_B_SMALL_COHORT_SINGLE_FIELD',
    referenceLifecycleClosed:ready,
    nextCohortAuthorized:false,
    progressiveExpansionAuthorized:false,
    operationalIngestionAuthorized:false,
    generalizedProductionWritesAuthorized:false,
    persistentWriteAuthority:false,
    nextPhaseRequiresNewMilestone:true,
    nextMilestone:'M3.36_PROGRESSIVE_EXPANSION_POLICY_AND_BOUNDED_COHORT_DESIGN',
    requirements:freeze([
      'define the next bounded cohort size explicitly',
      'retain one approved mutation class per cohort',
      're-qualify every candidate against current authoritative state',
      'bind a fresh authoritative source SHA',
      'issue fresh per-record single-use tokens and idempotency keys',
      'perform cohort-wide preflight before the first write',
      'retain strictly sequential per-record execution',
      'halt on first failure and do not continue to later records',
      'require read-after-write verification for every committed record',
      'retain durable per-record and cohort terminal receipts',
      'keep downstream propagation separate from canonical write authority',
      'relock write and sync authority after every bounded operation'
    ])
  });
}

export function buildLifecycleClosureCertificate({lifecycle,parity,authority,replay,readiness}={}){
  const ok=[lifecycle,parity,authority,replay,readiness].every(x=>x?.status==='CERTIFIED');
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_35_LIVE_MICRO_COHORT_LIFECYCLE_CLOSURE_CERTIFICATE',
    version:'3.0-m3.35',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'FIRST_LIVE_MICRO_COHORT_LIFECYCLE_CLOSED':'LIVE_MICRO_COHORT_LIFECYCLE_CLOSURE_BLOCKED',
    canonicalEventCount:parity?.authoritativeEventCount??null,
    publicEventCount:parity?.publicEventCount??null,
    finalCanonicalSha256:parity?.authoritativeSha256??null,
    finalPublicSha256:parity?.publicSha256??null,
    cohortSize:lifecycle?.executedRecords??null,
    canonicalCommits:lifecycle?.canonicalCommits??null,
    allAuthoritiesClosed:authority?.status==='CERTIFIED',
    replayProtectionCertified:replay?.status==='CERTIFIED',
    canonicalPublicParityCertified:parity?.status==='CERTIFIED',
    progressiveExpansionReadinessCertified:readiness?.status==='CERTIFIED',
    progressiveExpansionAuthorized:false,
    operationalIngestionAuthorized:false,
    additionalCanonicalCommitsDuringM335:0
  });
}
