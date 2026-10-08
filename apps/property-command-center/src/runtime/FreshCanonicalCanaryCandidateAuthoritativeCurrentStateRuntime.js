// SCIIP Explorer 3.0 — M3.21
// Fresh Canonical Canary Candidate Selection Against Authoritative Current State
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const freeze=v=>Object.freeze(v);

export function buildM321Runtime(){
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_21_FRESH_CANONICAL_CANARY_CANDIDATE_AUTHORITATIVE_CURRENT_STATE_RUNTIME',
    version:'3.0-m3.21',
    status:'READY',
    authoritativeSourceRequired:true,
    publicValidationWritable:false,
    projectedCurrentStateRequired:true,
    historicalBeforeValueCannotImplyCurrentState:true,
    realizedTransitionsExcluded:true,
    exactOneCandidateRequired:true,
    finalReadBeforeAuthorizationRequired:true,
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

export function resolveAuthoritativeCanonicalCorpus({repoRoot}={}){
  const repo=path.resolve(repoRoot||'.');
  const source=path.join(repo,'apps','property-command-center','src','production-validation','canonical-property-identity-data.json');
  const publicCopy=path.join(repo,'apps','property-command-center','public','production-validation-data','canonical-property-identity-data.json');
  if(!fs.existsSync(source)) return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_MISSING',source});
  let corpus; try{corpus=JSON.parse(fs.readFileSync(source,'utf8'));}catch(e){return freeze({status:'BLOCKED',state:'AUTHORITATIVE_SOURCE_INVALID_JSON',error:e.message});}
  const bytes=fs.statSync(source).size;
  const hash=sha(fs.readFileSync(source));
  return freeze({
    status:'CERTIFIED',
    state:'AUTHORITATIVE_CANONICAL_CORPUS_RESOLVED',
    source,
    publicCopy,
    publicCopyIsWritableAuthority:false,
    bytes,sha256:hash,
    version:clean(corpus?.version||corpus?.datasetVersion||corpus?.corpusVersion),
    eventCount:Array.isArray(corpus?.events)?corpus.events.length:0,
    corpus
  });
}

function eventPropertyId(e){return e?.canonicalPropertyId??e?.propertyId??e?.canonical_property_id??e?.property_id??null;}
function eventVersion(e,i){return e?.sequence??e?.revision??e?.version??i;}
function changes(e){
  if(Array.isArray(e?.changes)) return e.changes;
  if(e?.field!==undefined) return [{field:e.field,before:e.before,after:e.after}];
  return [];
}

export function projectCurrentCanonicalState({corpus}={}){
  const events=Array.isArray(corpus?.events)?corpus.events:[];
  const state=new Map();
  const lineage=[];
  events.forEach((e,i)=>{
    const pid=eventPropertyId(e); if(!pid)return;
    let p=state.get(pid); if(!p){p={};state.set(pid,p);}
    for(const c of changes(e)){
      if(!c?.field)continue;
      p[c.field]=c.after;
      lineage.push({eventIndex:i,eventId:clean(e?.eventId||`event-${i}`),eventType:clean(e?.eventType),propertyId:pid,field:c.field,before:c.before,after:c.after,version:eventVersion(e,i)});
    }
  });
  return freeze({
    status:'PROJECTED',
    state:'AUTHORITATIVE_CURRENT_STATE_PROJECTED',
    propertyCount:state.size,
    transitionCount:lineage.length,
    currentState:Object.fromEntries(state),
    lineage
  });
}

export function discoverFreshCandidates({projection,allowedFields=['availableSf']}={}){
  const lineage=projection?.lineage||[];
  const current=projection?.currentState||{};
  const candidates=[];
  for(const t of lineage){
    if(!allowedFields.includes(t.field)) continue;
    // A historical transition is only a candidate if its BEFORE value is the CURRENT value.
    // If current equals AFTER, that transition is already realized and is excluded.
    const now=current?.[t.propertyId]?.[t.field];
    if(same(now,t.after)) continue;
    if(!same(now,t.before)) continue;
    if(same(t.before,t.after)) continue;
    candidates.push({...t,currentValue:now,candidateId:`G3C-${sha([t.propertyId,t.field,t.before,t.after,t.eventId].join('|')).slice(0,16).toUpperCase()}`});
  }
  return freeze({
    status:'DISCOVERED',
    state:'FRESH_CANONICAL_CANDIDATES_DISCOVERED',
    allowedFields,
    candidateCount:candidates.length,
    candidates
  });
}

export function selectExactlyOneFreshCandidate({discovery}={}){
  const cs=discovery?.candidates||[];
  if(cs.length===0)return freeze({status:'BLOCKED',state:'NO_FRESH_UNAPPLIED_CANONICAL_CANDIDATE',selectedCandidate:null});
  if(cs.length!==1)return freeze({status:'BLOCKED',state:'MULTIPLE_FRESH_CANONICAL_CANDIDATES_REQUIRE_DISAMBIGUATION',candidateCount:cs.length,selectedCandidate:null});
  return freeze({status:'CERTIFIED',state:'EXACTLY_ONE_FRESH_CANONICAL_CANDIDATE_SELECTED',candidateCount:1,selectedCandidate:cs[0]});
}

export function finalReadBeforeAuthorization({source,selection}={}){
  if(selection?.status!=='CERTIFIED')return freeze({status:'BLOCKED',state:'SELECTION_NOT_CERTIFIED'});
  let corpus;try{corpus=JSON.parse(fs.readFileSync(source,'utf8'));}catch(e){return freeze({status:'BLOCKED',state:'FINAL_READ_FAILED',error:e.message});}
  const projection=projectCurrentCanonicalState({corpus});
  const c=selection.selectedCandidate;
  const observed=projection.currentState?.[c.propertyId]?.[c.field];
  const exact=same(observed,c.before);
  return freeze({
    status:exact?'CERTIFIED':'BLOCKED',
    state:exact?'FINAL_AUTHORITATIVE_READ_MATCHES_CANDIDATE_BEFORE_STATE':'FINAL_AUTHORITATIVE_READ_STATE_CHANGED',
    propertyId:c.propertyId,field:c.field,expectedBefore:c.before,observedCurrent:observed,
    exactReadConsistency:exact,
    sourceSha256:sha(fs.readFileSync(source))
  });
}

export function buildM321AuthorizationManifest({sourceResolution,selection,finalRead}={}){
  const ok=sourceResolution?.status==='CERTIFIED'&&selection?.status==='CERTIFIED'&&finalRead?.status==='CERTIFIED';
  const c=selection?.selectedCandidate||{};
  return freeze({
    contract:'SCIIP_EXPLORER_3_M3_21_FRESH_CANONICAL_CANARY_PREAUTHORIZATION_MANIFEST',
    version:'3.0-m3.21',
    status:ok?'CERTIFIED':'BLOCKED',
    state:ok?'FRESH_CANONICAL_CANARY_READY_FOR_SEPARATE_GOVERNED_WRITE_AUTHORIZATION':'FRESH_CANONICAL_CANARY_NOT_AUTHORIZED',
    manifestId:`G321-${sha([clean(c.candidateId),clean(sourceResolution?.sha256),clean(finalRead?.sourceSha256)].join('|')).slice(0,16).toUpperCase()}`,
    target:ok?{
      propertyId:c.propertyId,fieldName:c.field,beforeValue:c.before,afterValue:c.after,
      sourceEventId:c.eventId,candidateId:c.candidateId
    }:null,
    authoritativeSource:sourceResolution?.source||null,
    publicValidationWritableAuthority:false,
    finalReadConsistency:finalRead?.exactReadConsistency===true,
    liveWriteAuthorized:false,
    separateWriteAuthorizationRequired:true,
    writeExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}
