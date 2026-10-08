import fs from 'node:fs';
import crypto from 'node:crypto';

export const CONTRACT='SCIIP_EXPLORER_3_M3_38_EXPLICIT_GOVERNED_EXPANDED_COHORT_EXECUTION';
export const VERSION='3.0-m3.38';
export const AUTH_PHRASE='AUTHORIZE_M338_LIVE_WRITE';
export const EVENT_TYPE='GOVERNED_EXPANDED_COHORT_FIELD_UPDATE';
export const FIELD='availableSf';

export function shaBytes(b){return crypto.createHash('sha256').update(b).digest('hex')}
export function shaJson(v){return shaBytes(Buffer.from(JSON.stringify(v)))}
export function readJson(p){return JSON.parse(fs.readFileSync(p,'utf8'))}
export function fileSha(p){return shaBytes(fs.readFileSync(p))}
export function atomicWriteJson(p,obj){
 const tmp=p+'.m338.tmp';
 fs.writeFileSync(tmp,JSON.stringify(obj,null,2)+'\n');
 fs.renameSync(tmp,p);
}
export function observationIndex(temporal){
 const m=new Map();
 for(const snap of temporal?.snapshots||[]) for(const o of snap?.observations||[]){
   if(typeof o?.observationId==='string') m.set(o.observationId,o);
 }
 return m;
}
export function deterministicEventId(rec,manifestFingerprint){
 return 'EVENT-M338-'+shaJson({
   purpose:'M338_EVENT_ID',
   manifestFingerprint,
   sequence:rec.sequence,
   canonicalPropertyId:rec.canonicalPropertyId,
   idempotencyKey:rec.idempotencyKey
 }).slice(0,20).toUpperCase();
}
export function buildEvent(rec,manifestFingerprint){
 const eventId=deterministicEventId(rec,manifestFingerprint);
 return {
   eventId,
   eventType:EVENT_TYPE,
   canonicalPropertyId:rec.canonicalPropertyId,
   version:eventId,
   milestone:'M3.38',
   cohortManifestId:'G338M-'+manifestFingerprint.slice(0,16).toUpperCase(),
   cohortSequence:rec.sequence,
   idempotencyKey:rec.idempotencyKey,
   qualificationHash:rec.qualificationHash,
   sourceObservationId:rec.currentObservationId,
   sourceObservationEventId:rec.currentEventId ?? null,
   changes:[{field:FIELD,before:rec.before,after:rec.after}]
 };
}
export function validateManifest(m){
 const c=m?.cohort||[];
 const ids=new Set(c.map(x=>x.canonicalPropertyId));
 const toks=new Set(c.map(x=>x.singleUseToken));
 const keys=new Set(c.map(x=>x.idempotencyKey));
 const ok=
   m?.contract==='SCIIP_EXPLORER_3_M3_37F_OBSERVATION_BOUND_CURRENT_STATE_CANDIDATE_PREAUTHORIZATION' &&
   m?.version==='3.0-m3.37f' &&
   m?.status==='PREAUTHORIZED' &&
   m?.state==='M337F_EXPANDED_COHORT_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED' &&
   c.length===10 && ids.size===10 && toks.size===10 && keys.size===10 &&
   c.every((x,i)=>x.sequence===i+1 && x.field===FIELD &&
     Number.isFinite(x.before) && x.before>0 &&
     Number.isFinite(x.after) && x.after>=0 && x.after<x.before &&
     x.rollbackValue===x.before &&
     typeof x.currentObservationId==='string' && x.currentObservationId.startsWith('OBS-') &&
     typeof x.singleUseToken==='string' && x.singleUseToken.length>=32 &&
     x.tokenState==='ISSUED_NOT_CONSUMED' &&
     typeof x.idempotencyKey==='string' && x.idempotencyKey.length>=16 &&
     typeof x.qualificationHash==='string' && x.qualificationHash.length>=16) &&
   m?.authorization?.executionAuthorized===false &&
   m?.authorization?.liveWriteAuthority===false &&
   m?.authorization?.canonicalWriteAuthority===false &&
   m?.authorization?.syncAuthority===false &&
   m?.safety?.tokensConsumed===0;
 return {status:ok?'CERTIFIED':'BLOCKED',state:ok?'M337F_MANIFEST_CERTIFIED_FOR_M338':'M337F_MANIFEST_INVALID_FOR_M338'};
}
export function cohortPreflight(manifest,temporal,canonical){
 const obs=observationIndex(temporal);
 const existingEvents=new Map((canonical?.events||[]).map(e=>[e?.idempotencyKey,e]));
 const rows=[];
 for(const rec of manifest.cohort){
   const o=obs.get(rec.currentObservationId);
   const exactBefore=!!o && Object.is(o[FIELD],rec.before);
   const observationPropertyMatches=!o ? false :
     (!rec.propertyId || !o.propertyId || rec.propertyId===o.propertyId);
   const duplicate=existingEvents.get(rec.idempotencyKey)||null;
   rows.push({
     sequence:rec.sequence,
     canonicalPropertyId:rec.canonicalPropertyId,
     currentObservationId:rec.currentObservationId,
     observationFound:!!o,
     exactBefore,
     observationPropertyMatches,
     duplicateIdempotencyKey:!!duplicate,
     duplicateEventId:duplicate?.eventId??null
   });
 }
 const ok=rows.length===10 && rows.every(x=>x.observationFound&&x.exactBefore&&x.observationPropertyMatches&&!x.duplicateIdempotencyKey);
 return {status:ok?'CERTIFIED':'BLOCKED',state:ok?'M338_COHORT_WIDE_PREFLIGHT_CERTIFIED':'M338_COHORT_WIDE_PREFLIGHT_BLOCKED',rows};
}
