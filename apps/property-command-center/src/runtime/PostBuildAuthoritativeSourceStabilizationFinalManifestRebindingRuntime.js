// SCIIP Explorer 3.0 — M3.23B
// Post-Build Authoritative Source Stabilization & Final Manifest Rebinding Runtime

import fs from 'node:fs';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM323BRuntime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_23B_POST_BUILD_AUTHORITATIVE_SOURCE_STABILIZATION_FINAL_MANIFEST_REBINDING_RUNTIME',
    version:'3.0-m3.23b',
    status:'READY',
    m323AEvidenceRequired:true,
    productionBuildMustPrecedeFinalBinding:true,
    postBuildAuthoritativeShaRequired:true,
    targetStateReconfirmationRequired:true,
    targetLineageReconfirmationRequired:true,
    finalManifestSupersessionRequired:true,
    priorReplacementTokenReuseProhibited:true,
    noBuildOrSyncAfterFinalBindingRequired:true,
    singleUseFinalTokenRequired:true,
    liveMutationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    automaticCommit:false,
    automaticRetry:false,
    generalizedWriteAuthority:false,
    bulkWrites:false,
    multiPropertyWrites:false,
    persistentWriteAuthority:false,
    canonicalCommittedCountAtInstall:0
  });
}

function pid(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function extractTargetLineage(corpus,propertyId,fieldName){
  const out=[];
  (Array.isArray(corpus?.events)?corpus.events:[]).forEach((e,i)=>{
    if(pid(e)!==propertyId)return;
    for(const c of (Array.isArray(e?.changes)?e.changes:[])){
      if(c?.field!==fieldName)continue;
      out.push({
        eventIndex:i,
        eventId:clean(e?.eventId||`event-${i}`),
        eventType:clean(e?.eventType),
        version:clean(e?.version||e?.revision||e?.sequence||e?.eventId||`event-${i}`),
        before:clone(c.before),
        after:clone(c.after)
      });
    }
  });
  return out;
}
function currentFromLineage(lineage){
  if(!lineage.length)return{found:false,value:undefined,lastEventId:'UNAVAILABLE',lastVersion:'UNAVAILABLE'};
  const last=lineage[lineage.length-1];
  return{found:true,value:clone(last.after),lastEventId:last.eventId,lastVersion:last.version};
}

export function capturePostBuildAuthoritativeSnapshot({sourcePath,target}={}){
  if(!sourcePath||!fs.existsSync(sourcePath))return freeze({status:'BLOCKED',state:'POST_BUILD_AUTHORITATIVE_SOURCE_MISSING'});
  const bytes=fs.readFileSync(sourcePath);
  let corpus;try{corpus=JSON.parse(bytes.toString('utf8'));}catch(e){return freeze({status:'BLOCKED',state:'POST_BUILD_AUTHORITATIVE_SOURCE_INVALID_JSON'});}
  const lineage=extractTargetLineage(corpus,target?.propertyId,target?.fieldName);
  const state=currentFromLineage(lineage);
  return freeze({
    status:'CERTIFIED',
    state:'POST_BUILD_AUTHORITATIVE_SNAPSHOT_CAPTURED',
    sourcePath,
    sourceSha256:sha(bytes),
    bytes:bytes.length,
    version:clean(corpus?.version||corpus?.datasetVersion||corpus?.corpusVersion),
    eventCount:Array.isArray(corpus?.events)?corpus.events.length:0,
    targetLineage:freeze(lineage),
    targetState:freeze(state)
  });
}

export function certifyPostBuildStability({
  m323AEvidence,
  postBuildSnapshot
}={}){
  const replacement=m323AEvidence?.replacementManifest;
  const eq=m323AEvidence?.semanticEquivalence;
  if(m323AEvidence?.status!=='PASSED'||replacement?.status!=='CERTIFIED'){
    return freeze({status:'BLOCKED',state:'M3_23A_REPLACEMENT_MANIFEST_NOT_CERTIFIED'});
  }

  const target=replacement?.target;
  const targetCurrent=
    postBuildSnapshot?.targetState?.found===true &&
    same(postBuildSnapshot?.targetState?.value,target?.beforeValue);

  const lineageEquivalent=
    Array.isArray(eq?.currentLineage) &&
    same(eq.currentLineage,postBuildSnapshot?.targetLineage||[]);

  const sourcePathMatch=clean(replacement?.authoritativeSource)===clean(postBuildSnapshot?.sourcePath);
  const postBuildShaDifferentFromM323A=
    clean(replacement?.authoritativeSourceSha256)!==clean(postBuildSnapshot?.sourceSha256);

  const ok=postBuildSnapshot?.status==='CERTIFIED'&&targetCurrent&&lineageEquivalent&&sourcePathMatch;

  return freeze({
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'POST_BUILD_AUTHORITATIVE_SOURCE_STABILITY_CERTIFIED':'POST_BUILD_AUTHORITATIVE_SOURCE_STABILITY_BLOCKED',
    targetCurrent,
    lineageEquivalent,
    sourcePathMatch,
    postBuildShaDifferentFromM323A,
    previousBoundSha256:replacement?.authoritativeSourceSha256||null,
    postBuildSha256:postBuildSnapshot?.sourceSha256||null,
    exactTargetState:clone(postBuildSnapshot?.targetState)
  });
}

export function buildFinalPostBuildManifest({
  m323AEvidence,
  postBuildSnapshot,
  stabilityCertification
}={}){
  const previous=m323AEvidence?.replacementManifest;
  const target=previous?.target;
  const ok=
    m323AEvidence?.status==='PASSED' &&
    previous?.status==='CERTIFIED' &&
    stabilityCertification?.status==='CERTIFIED';

  const manifestId=`G323BM-${sha([
    clean(previous?.manifestId),
    clean(postBuildSnapshot?.sourceSha256),
    clean(target?.candidateId),
    clean(target?.qualificationHash),
    JSON.stringify(target?.beforeValue),
    JSON.stringify(target?.afterValue),
    JSON.stringify(target?.rollbackValue)
  ].join('|')).slice(0,16).toUpperCase()}`;

  const finalToken=sha(`${manifestId}|M3.24|FINAL_SINGLE_USE|NO_BUILD_AFTER_BINDING`);

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_23B_FINAL_POST_BUILD_CANARY_MANIFEST',
    version:'3.0-m3.23b',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'FINAL_POST_BUILD_CANARY_MANIFEST_CERTIFIED':'FINAL_POST_BUILD_CANARY_MANIFEST_BLOCKED',
    manifestId,
    supersedesManifestId:previous?.manifestId||null,
    supersededToken:previous?.singleUseToken||null,
    supersededTokenReusable:false,
    singleUseToken:ok?finalToken:null,
    singleUseOnly:true,
    target:ok?freeze({
      propertyId:target.propertyId,
      fieldName:target.fieldName,
      beforeValue:clone(target.beforeValue),
      afterValue:clone(target.afterValue),
      rollbackValue:clone(target.rollbackValue),
      candidateId:target.candidateId,
      qualificationHash:target.qualificationHash
    }):null,
    authoritativeSource:postBuildSnapshot?.sourcePath||null,
    authoritativeSourceSha256:postBuildSnapshot?.sourceSha256||null,
    authoritativeSourceBytes:postBuildSnapshot?.bytes??null,
    authoritativeEventCount:postBuildSnapshot?.eventCount??null,
    buildCompletedBeforeBinding:true,
    noBuildOrSyncAfterBindingRequired:true,
    invalidateIfSourceShaChanges:true,
    readyForM324ExecutionGate:ok,
    liveWriteAuthorized:false,
    writeExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function verifyNoPostBindingDrift({finalManifest}={}){
  if(finalManifest?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'FINAL_MANIFEST_NOT_CERTIFIED'});
  if(!finalManifest.authoritativeSource||!fs.existsSync(finalManifest.authoritativeSource)){
    return freeze({status:'BLOCKED',state:'FINAL_AUTHORITATIVE_SOURCE_MISSING'});
  }
  const currentSha=sha(fs.readFileSync(finalManifest.authoritativeSource));
  const exact=clean(currentSha)===clean(finalManifest.authoritativeSourceSha256);
  return freeze({
    status:exact?'CERTIFIED':'BLOCKED',
    state:exact?'NO_POST_BINDING_SOURCE_DRIFT':'POST_BINDING_SOURCE_DRIFT_DETECTED',
    expectedSha256:finalManifest.authoritativeSourceSha256,
    observedSha256:currentSha,
    exactSourceBinding:exact
  });
}
