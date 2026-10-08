// SCIIP Explorer 3.0 — M3.23A
// Manifest Source-Hash Rebinding & Semantic Equivalence Certification Runtime

import fs from 'node:fs';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM323ARuntime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_23A_MANIFEST_SOURCE_HASH_REBINDING_SEMANTIC_EQUIVALENCE_CERTIFICATION_RUNTIME',
    version:'3.0-m3.23a',
    status:'READY',
    m322EvidenceRequired:true,
    m323EvidenceRequired:true,
    oldManifestSupersessionRequired:true,
    semanticEquivalenceRequired:true,
    targetStateEquivalenceRequired:true,
    targetLineageEquivalenceRequired:true,
    currentSourceBindingRequired:true,
    replacementTokenRequired:true,
    oldTokenReuseProhibited:true,
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

export function certifySemanticEquivalence({
  previousSnapshot,
  currentAuthoritativeSource,
  target
}={}){
  if(!currentAuthoritativeSource||!fs.existsSync(currentAuthoritativeSource)){
    return freeze({status:'BLOCKED',state:'CURRENT_AUTHORITATIVE_SOURCE_MISSING'});
  }

  let currentCorpus;
  try{currentCorpus=JSON.parse(fs.readFileSync(currentAuthoritativeSource,'utf8'));}catch(e){
    return freeze({status:'BLOCKED',state:'CURRENT_AUTHORITATIVE_SOURCE_INVALID_JSON'});
  }

  const currentBytes=fs.readFileSync(currentAuthoritativeSource);
  const currentSha=sha(currentBytes);

  const currentLineage=extractTargetLineage(currentCorpus,target?.propertyId,target?.fieldName);
  const currentState=currentFromLineage(currentLineage);

  const previousLineage=Array.isArray(previousSnapshot?.targetLineage)?previousSnapshot.targetLineage:[];
  const previousState=previousSnapshot?.targetState||{};

  const stateEquivalent=
    previousState?.found===currentState.found &&
    same(previousState?.value,currentState.value);

  const lineageEquivalent=same(previousLineage,currentLineage);

  const targetBeforeStillCurrent=
    currentState.found===true &&
    same(currentState.value,target?.beforeValue);

  const exactSemanticEquivalence=
    stateEquivalent &&
    lineageEquivalent &&
    targetBeforeStillCurrent;

  return freeze({
    status:exactSemanticEquivalence?'CERTIFIED':'BLOCKED',
    state:exactSemanticEquivalence?'TARGET_SEMANTIC_EQUIVALENCE_CERTIFIED':'TARGET_SEMANTIC_EQUIVALENCE_BLOCKED',
    currentSource:currentAuthoritativeSource,
    currentSourceSha256:currentSha,
    previousSourceSha256:previousSnapshot?.sourceSha256||null,
    sourceHashChanged:clean(previousSnapshot?.sourceSha256)!==clean(currentSha),
    stateEquivalent,
    lineageEquivalent,
    targetBeforeStillCurrent,
    exactSemanticEquivalence,
    currentState:freeze(currentState),
    currentLineage:freeze(currentLineage)
  });
}

export function buildReplacementManifest({
  m322Evidence,
  m323Evidence,
  semanticEquivalence
}={}){
  const oldManifest=m322Evidence?.manifest;
  const oldGate=m323Evidence?.gate;
  const ok=
    m322Evidence?.status==='PASSED' &&
    oldManifest?.status==='CERTIFIED' &&
    m323Evidence?.status==='PASSED' &&
    oldGate?.status==='BLOCKED' &&
    semanticEquivalence?.status==='CERTIFIED';

  const target=oldManifest?.target;
  const replacementManifestId=`G323AM-${sha([
    clean(oldManifest?.manifestId),
    clean(semanticEquivalence?.currentSourceSha256),
    clean(target?.candidateId),
    clean(target?.qualificationHash),
    JSON.stringify(target?.beforeValue),
    JSON.stringify(target?.afterValue),
    JSON.stringify(target?.rollbackValue)
  ].join('|')).slice(0,16).toUpperCase()}`;

  const replacementToken=sha(`${replacementManifestId}|M3.23-RETRY|SINGLE_USE|SUPERSEDES:${clean(oldManifest?.manifestId)}`);

  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_23A_REBOUND_FRESH_CANARY_PREAUTHORIZATION_MANIFEST',
    version:'3.0-m3.23a',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'SOURCE_HASH_REBOUND_MANIFEST_CERTIFIED':'SOURCE_HASH_REBOUND_MANIFEST_BLOCKED',
    manifestId:replacementManifestId,
    supersedesManifestId:oldManifest?.manifestId||null,
    supersededToken:oldManifest?.singleUseToken||null,
    supersededTokenReusable:false,
    singleUseToken:ok?replacementToken:null,
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
    authoritativeSource:oldManifest?.authoritativeSource||null,
    authoritativeSourceSha256:semanticEquivalence?.currentSourceSha256||null,
    previousAuthoritativeSourceSha256:oldManifest?.authoritativeSourceSha256||null,
    semanticEquivalenceCertified:semanticEquivalence?.exactSemanticEquivalence===true,
    readyForM323GateRecertification:ok,
    liveWriteAuthorized:false,
    writeExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function buildM323ASnapshot({sourcePath,target}={}){
  if(!sourcePath||!fs.existsSync(sourcePath))return freeze({status:'BLOCKED',state:'SOURCE_MISSING'});
  const bytes=fs.readFileSync(sourcePath);
  const corpus=JSON.parse(bytes.toString('utf8'));
  const lineage=extractTargetLineage(corpus,target?.propertyId,target?.fieldName);
  const state=currentFromLineage(lineage);
  return freeze({
    status:'CERTIFIED',
    sourcePath,
    sourceSha256:sha(bytes),
    targetLineage:freeze(lineage),
    targetState:freeze(state)
  });
}
