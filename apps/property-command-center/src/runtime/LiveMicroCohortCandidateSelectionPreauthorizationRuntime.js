// SCIIP Explorer 3.0 — M3.31
// Live Micro-Cohort Candidate Selection & Preauthorization Runtime
import fs from 'node:fs';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM331Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_31_LIVE_MICRO_COHORT_CANDIDATE_SELECTION_PREAUTHORIZATION_RUNTIME',
    version:'3.0-m3.31',
    status:'READY',
    m330ReadinessRequired:true,
    maximumCandidateCount:3,
    oneMutationClassOnly:true,
    exactCurrentStateReadRequired:true,
    authoritativeSourceShaBindingRequired:true,
    idempotencyKeyRequired:true,
    singleUseTokenRequired:true,
    rollbackValueRequired:true,
    perRecordQualificationHashRequired:true,
    cohortManifestRequired:true,
    finalCohortPreflightRequired:true,
    liveExecutionAuthorized:false,
    operationalIngestionAuthorized:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    automaticRetry:false,
    generalizedWriteAuthority:false,
    persistentWriteAuthority:false
  });
}

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function project(corpus){
  const current={};
  const lastEvent={};
  for(const e of (Array.isArray(corpus?.events)?corpus.events:[])){
    const propertyId=pid(e);
    if(!propertyId)continue;
    current[propertyId] ||= {};
    lastEvent[propertyId] ||= {};
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(!c?.field)continue;
      current[propertyId][c.field]=clone(c.after);
      lastEvent[propertyId][c.field]=e?.eventId??null;
    }
  }
  return {current,lastEvent};
}

function proposalForAvailableSf(v){
  if(typeof v!=='number'||!Number.isFinite(v)||v<=100)return null;
  const delta=Math.max(1,Math.round(v*0.0025));
  const after=v-delta;
  if(after<0||after===v)return null;
  return {after,delta,deltaPct:delta/v};
}

export function selectCandidates({
  corpus,
  fieldName='availableSf',
  maxRecords=3
}={}){
  if(maxRecords!==3)return freeze({status:'BLOCKED',state:'M3_31_REQUIRES_THREE_RECORD_MAXIMUM'});
  const projected=project(corpus||{});
  const records=[];

  for(const propertyId of Object.keys(projected.current).sort()){
    const before=projected.current[propertyId]?.[fieldName];
    const proposal=proposalForAvailableSf(before);
    if(!proposal)continue;

    records.push(freeze({
      propertyId,
      fieldName,
      beforeValue:before,
      afterValue:proposal.after,
      rollbackValue:before,
      delta:proposal.delta,
      deltaPct:proposal.deltaPct,
      mutationClass:'CLASS_B_SMALL_COHORT_SINGLE_FIELD',
      lastEventId:projected.lastEvent[propertyId]?.[fieldName]??null
    }));
    if(records.length===maxRecords)break;
  }

  return freeze({
    status:records.length===maxRecords?'CERTIFIED':'BLOCKED',
    state:records.length===maxRecords?'LIVE_MICRO_COHORT_CANDIDATES_SELECTED':'INSUFFICIENT_LIVE_MICRO_COHORT_CANDIDATES',
    candidateCount:records.length,
    records:freeze(records),
    deterministicOrdering:true
  });
}

export function qualifyCandidates({
  selection,
  sourcePath,
  sourceSha256
}={}){
  if(selection?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'CANDIDATE_SELECTION_NOT_CERTIFIED'});
  const records=selection.records.map((r,index)=>{
    const idempotencyKey=sha([
      r.propertyId,r.fieldName,r.beforeValue,r.afterValue,
      'CLASS_B_SMALL_COHORT_SINGLE_FIELD','LIVE_MICRO_COHORT'
    ].join('|'));
    const singleUseToken=sha(`${idempotencyKey}|M3.31|LIVE_MICRO_COHORT|SINGLE_USE`);
    const qualificationHash=sha([
      r.propertyId,r.fieldName,r.beforeValue,r.afterValue,r.rollbackValue,
      sourceSha256,idempotencyKey,singleUseToken
    ].join('|'));
    const checks={
      propertyIdentity:typeof r.propertyId==='string'&&r.propertyId.length>0,
      approvedClass:r.mutationClass==='CLASS_B_SMALL_COHORT_SINGLE_FIELD',
      exactBefore:typeof r.beforeValue==='number'&&Number.isFinite(r.beforeValue),
      boundedAfter:typeof r.afterValue==='number'&&r.afterValue>=0&&r.afterValue<r.beforeValue,
      nonNoOp:r.afterValue!==r.beforeValue,
      rollback:r.rollbackValue===r.beforeValue,
      sourceBound:typeof sourceSha256==='string'&&sourceSha256.length===64,
      idempotencyKey:idempotencyKey.length===64,
      singleUseToken:singleUseToken.length===64,
      qualificationHash:qualificationHash.length===64
    };
    return freeze({
      index:index+1,
      ...clone(r),
      authoritativeSource:sourcePath,
      authoritativeSourceSha256:sourceSha256,
      idempotencyKey,
      singleUseToken,
      qualificationHash,
      qualified:Object.values(checks).every(Boolean),
      checks:freeze(checks)
    });
  });

  const allQualified=records.length===3&&records.every(r=>r.qualified);
  return freeze({
    status:allQualified?'CERTIFIED':'BLOCKED',
    state:allQualified?'LIVE_MICRO_COHORT_CANDIDATES_QUALIFIED':'LIVE_MICRO_COHORT_CANDIDATE_QUALIFICATION_FAILED',
    allQualified,
    records:freeze(records)
  });
}

export function buildCohortManifest({
  readinessEvidence,
  qualification,
  sourcePath,
  sourceSha256
}={}){
  const readiness=readinessEvidence?.readinessCertification;
  const ok=
    readinessEvidence?.status==='PASSED' &&
    readiness?.status==='CERTIFIED' &&
    readiness?.maxFutureLiveMicroCohortSize===3 &&
    readiness?.liveMicroCohortAuthorized===false &&
    qualification?.status==='CERTIFIED' &&
    qualification?.records?.length===3;

  const manifestId=`G331M-${sha([
    readiness?.readinessId,
    sourceSha256,
    ...(qualification?.records||[]).map(r=>r.qualificationHash)
  ].join('|')).slice(0,16).toUpperCase()}`;

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_31_LIVE_MICRO_COHORT_PREAUTHORIZATION_MANIFEST',
    version:'3.0-m3.31',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'LIVE_MICRO_COHORT_PREAUTHORIZATION_MANIFEST_CERTIFIED':'LIVE_MICRO_COHORT_PREAUTHORIZATION_MANIFEST_BLOCKED',
    manifestId,
    readinessId:readiness?.readinessId??null,
    authoritativeSource:sourcePath,
    authoritativeSourceSha256:sourceSha256,
    cohortSize:qualification?.records?.length??0,
    mutationClass:'CLASS_B_SMALL_COHORT_SINGLE_FIELD',
    records:ok?freeze(qualification.records):freeze([]),
    allRecordQualificationHashesBound:ok,
    allRecordTokensSingleUse:true,
    deterministicOrdering:true,
    fullCohortPreflightRequiredImmediatelyBeforeExecution:true,
    liveExecutionAuthorized:false,
    explicitExecutionMilestoneRequired:'M3.32',
    generalizedWriteAuthority:false,
    persistentWriteAuthority:false
  });
}

export function finalCohortPreflight({
  manifest,
  corpus,
  sourceSha256
}={}){
  if(manifest?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'COHORT_MANIFEST_NOT_CERTIFIED'});
  if(sourceSha256!==manifest.authoritativeSourceSha256){
    return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_SHA_DRIFT'});
  }
  const projected=project(corpus||{});
  const checks=(manifest.records||[]).map(r=>{
    const current=projected.current?.[r.propertyId]?.[r.fieldName];
    const stateOk=same(current,r.beforeValue);
    return freeze({propertyId:r.propertyId,fieldName:r.fieldName,expectedBefore:r.beforeValue,observedCurrent:clone(current),stateOk});
  });
  const allStateCurrent=checks.length===3&&checks.every(x=>x.stateOk);
  return freeze({
    status:allStateCurrent?'CERTIFIED':'BLOCKED',
    state:allStateCurrent?'FINAL_LIVE_MICRO_COHORT_PREFLIGHT_CERTIFIED':'FINAL_LIVE_MICRO_COHORT_PREFLIGHT_BLOCKED',
    allStateCurrent,
    checks:freeze(checks),
    liveExecutionAuthorized:false
  });
}
