// SCIIP Explorer 3.0 — M3.33
// Post-Micro-Cohort Certification, Token/Idempotency Replay Audit & Downstream Propagation Readiness

import fs from 'node:fs';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM333Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_33_POST_MICRO_COHORT_CERTIFICATION_TOKEN_IDEMPOTENCY_REPLAY_AUDIT_DOWNSTREAM_PROPAGATION_READINESS_RUNTIME',
    version:'3.0-m3.33',
    status:'READY',
    m332TerminalReceiptRequired:true,
    allCommittedEventsVerificationRequired:true,
    allCurrentStatesVerificationRequired:true,
    tokenReplayAuditRequired:true,
    idempotencyReplayAuditRequired:true,
    finalAuthoritativeShaCertificationRequired:true,
    liveWriteAuthorityRelockVerificationRequired:true,
    downstreamPropagationReadinessRequired:true,
    propagationExecuted:false,
    liveMutationAllowed:false,
    generalizedWriteAuthority:false,
    persistentWriteAuthority:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    automaticRetry:false
  });
}

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function project(corpus,propertyId,fieldName){
  let found=false,value,lastEventId=null,lastEventType=null;
  for(const e of (Array.isArray(corpus?.events)?corpus.events:[])){
    if(pid(e)!==propertyId)continue;
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(c?.field!==fieldName)continue;
      found=true;value=clone(c.after);lastEventId=e?.eventId??null;lastEventType=e?.eventType??null;
    }
  }
  return {found,value,lastEventId,lastEventType};
}

export function certifyPostMicroCohort({
  sourcePath,
  terminalReceipt
}={}){
  if(!sourcePath||!fs.existsSync(sourcePath))return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_MISSING'});
  if(terminalReceipt?.status!=='PASSED'||terminalReceipt?.state!=='LIVE_MICRO_COHORT_COMMITTED_AND_VERIFIED')
    return freeze({status:'BLOCKED',state:'M332_TERMINAL_RECEIPT_NOT_SUCCESSFUL'});
  if(terminalReceipt?.canonicalCommits!==3||terminalReceipt?.records?.length!==3)
    return freeze({status:'BLOCKED',state:'M332_TERMINAL_RECEIPT_NOT_THREE_RECORD_SUCCESS'});

  const bytes=fs.readFileSync(sourcePath);
  let corpus;try{corpus=JSON.parse(bytes.toString('utf8'));}catch{return freeze({status:'BLOCKED',state:'AUTHORITATIVE_JSON_INVALID'});}

  const checks=terminalReceipt.records.map(r=>{
    const event=(Array.isArray(corpus.events)?corpus.events:[]).find(e=>e?.eventId===r.eventId);
    const eventExact=!!event &&
      pid(event)===r.propertyId &&
      event?.eventType==='GOVERNED_LIVE_MICRO_COHORT_FIELD_UPDATE' &&
      Array.isArray(event?.changes) &&
      event.changes.some(c=>c?.field===r.fieldName&&same(c.before,r.beforeValue)&&same(c.after,r.afterValue));

    const current=project(corpus,r.propertyId,r.fieldName);
    const stateExact=current.found&&same(current.value,r.afterValue)&&current.lastEventId===r.eventId;

    return freeze({
      sequence:r.sequence,
      propertyId:r.propertyId,
      fieldName:r.fieldName,
      eventId:r.eventId,
      eventExact,
      stateExact,
      observedCurrentValue:clone(current.value),
      lastEventId:current.lastEventId
    });
  });

  const allEventsExact=checks.length===3&&checks.every(x=>x.eventExact);
  const allStatesExact=checks.length===3&&checks.every(x=>x.stateExact);
  const finalSha256=sha(bytes);
  const shaExact=finalSha256===terminalReceipt.finalAuthoritativeSha256;
  const eventCount=Array.isArray(corpus.events)?corpus.events.length:0;
  const eventCountExact=eventCount===terminalReceipt.finalCanonicalEventCount;
  const ok=allEventsExact&&allStatesExact&&shaExact&&eventCountExact;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'POST_MICRO_COHORT_AUTHORITATIVE_CERTIFICATION_COMPLETE':'POST_MICRO_COHORT_AUTHORITATIVE_CERTIFICATION_FAILED',
    allEventsExact,
    allStatesExact,
    shaExact,
    eventCountExact,
    finalAuthoritativeSha256:finalSha256,
    finalCanonicalEventCount:eventCount,
    checks:freeze(checks)
  });
}

export function auditReplayProtection({
  ledgerPath,
  terminalReceipt,
  m331Evidence
}={}){
  if(!ledgerPath||!fs.existsSync(ledgerPath))return freeze({status:'BLOCKED',state:'M332_TOKEN_LEDGER_MISSING'});
  let ledger;try{ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8'));}catch{return freeze({status:'BLOCKED',state:'M332_TOKEN_LEDGER_INVALID'});}

  const manifestRecords=m331Evidence?.preauthorizationManifest?.records||[];
  if(manifestRecords.length!==3)return freeze({status:'BLOCKED',state:'M331_MANIFEST_RECORDS_MISSING'});

  const consumedTokens=new Set(Array.isArray(ledger?.consumedTokens)?ledger.consumedTokens:[]);
  const committedKeys=new Set(Array.isArray(ledger?.idempotencyKeys)?ledger.idempotencyKeys:[]);

  const checks=manifestRecords.map(r=>freeze({
    propertyId:r.propertyId,
    token:r.singleUseToken,
    idempotencyKey:r.idempotencyKey,
    tokenConsumed:consumedTokens.has(r.singleUseToken),
    idempotencyCommitted:committedKeys.has(r.idempotencyKey),
    tokenReplayAllowed:false,
    duplicateCommitAllowed:false
  }));

  const allTokensConsumed=checks.length===3&&checks.every(x=>x.tokenConsumed);
  const allIdempotencyCommitted=checks.length===3&&checks.every(x=>x.idempotencyCommitted);
  const uniqueTokens=consumedTokens.size>=3&&new Set(checks.map(x=>x.token)).size===3;
  const uniqueKeys=committedKeys.size>=3&&new Set(checks.map(x=>x.idempotencyKey)).size===3;
  const ok=allTokensConsumed&&allIdempotencyCommitted&&uniqueTokens&&uniqueKeys;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'TOKEN_AND_IDEMPOTENCY_REPLAY_AUDIT_CERTIFIED':'TOKEN_AND_IDEMPOTENCY_REPLAY_AUDIT_FAILED',
    consumedTokenCount:consumedTokens.size,
    committedIdempotencyKeyCount:committedKeys.size,
    allTokensConsumed,
    allIdempotencyCommitted,
    uniqueTokens,
    uniqueKeys,
    replayAllowed:false,
    duplicateCommitAllowed:false,
    checks:freeze(checks)
  });
}

export function certifyAuthorityRelock({terminalReceipt}={}){
  const ok=
    terminalReceipt?.liveWriteAuthorityRelocked===true &&
    terminalReceipt?.propagationExecuted===false &&
    terminalReceipt?.canonicalCommits===3;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'POST_MICRO_COHORT_LIVE_WRITE_AUTHORITY_RELOCK_CERTIFIED':'POST_MICRO_COHORT_LIVE_WRITE_AUTHORITY_RELOCK_FAILED',
    liveWriteAuthority:false,
    generalizedWriteAuthority:false,
    persistentWriteAuthority:false,
    automaticRetry:false,
    propagationExecuted:false
  });
}

export function buildPropagationReadiness({
  authoritativeCertification,
  replayAudit,
  authorityRelock,
  sourcePath,
  publicPath
}={}){
  const ok=
    authoritativeCertification?.status==='CERTIFIED' &&
    replayAudit?.status==='CERTIFIED' &&
    authorityRelock?.status==='CERTIFIED';

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_33_DOWNSTREAM_PROPAGATION_READINESS',
    version:'3.0-m3.33',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'DOWNSTREAM_PROPAGATION_READINESS_CERTIFIED':'DOWNSTREAM_PROPAGATION_READINESS_BLOCKED',
    authoritativeSource:sourcePath||null,
    authoritativeSha256:authoritativeCertification?.finalAuthoritativeSha256||null,
    authoritativeEventCount:authoritativeCertification?.finalCanonicalEventCount??null,
    publicCopy:publicPath||null,
    publicCopyAuthoritative:false,
    propagationAuthorized:false,
    separateExplicitPropagationMilestoneRequired:'M3.34',
    canonicalMutationAuthorized:false,
    liveWriteAuthority:false
  });
}
