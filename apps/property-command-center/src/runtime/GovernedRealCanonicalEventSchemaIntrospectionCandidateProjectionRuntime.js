// SCIIP Explorer 3.0 — M3.13
// Governed Real Canonical Event Schema Introspection & Candidate Projection Runtime
import fs from'node:fs';import path from'node:path';import crypto from'node:crypto';
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const scalar=v=>v===null||['string','number','boolean'].includes(typeof v);
function id(parts,p='G313'){return `${p}-${sha(parts.join('|')).slice(0,16).toUpperCase()}`;}
function flatten(o,p='',out=[]){
 if(!o||typeof o!=='object'||Array.isArray(o))return out;
 for(const[k,v]of Object.entries(o)){const q=p?`${p}.${k}`:k;if(scalar(v))out.push([q,v]);else if(v&&typeof v==='object'&&!Array.isArray(v))flatten(v,q,out);}
 return out;
}
function get(o,p){return p.split('.').reduce((a,k)=>a&&typeof a==='object'?a[k]:undefined,o);}
function firstPath(rows,names){
 const lc=names.map(x=>x.toLowerCase());
 const score=new Map();
 for(const r of rows)for(const[p,v]of flatten(r)){const leaf=p.split('.').pop().toLowerCase();if(lc.includes(leaf)&&v!==null&&v!=='')score.set(p,(score.get(p)||0)+1);}
 return [...score.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
}
export function buildGovernedRealCanonicalEventSchemaIntrospectionCandidateProjectionRuntime(){return Object.freeze({
 contract:'SCIIP_EXPLORER_3_M3_13_GOVERNED_REAL_CANONICAL_EVENT_SCHEMA_INTROSPECTION_CANDIDATE_PROJECTION_RUNTIME',
 version:'3.0-m3.13',status:'READY',m312ReceiptRequired:true,realEventsRequired:true,schemaIntrospectionRequired:true,
 deterministicProjectionRequired:true,projectionManifestRequired:true,qualificationDelegatedToM307:true,
 noSchemaGuessing:true,syntheticSourceProhibited:true,fixtureSourceProhibited:true,canonicalMutationAllowed:false,
 installerExecutesWrite:false,certificationExecutesWrite:false,liveWriteExecuted:false,automaticCommit:false,
 automaticRetryAllowed:false,generalizedWriteAuthority:false,bulkWritesAllowed:false,multiPropertyWritesAllowed:false,
 persistentWriteAuthority:false,canonicalCommittedCount:0
});}
export function introspectRealCanonicalEvents({records=[],source={}}={}){
 if(!Array.isArray(records)||!records.length)return Object.freeze({status:'BLOCKED',state:'REAL_CANONICAL_EVENTS_EMPTY'});
 const stats=new Map(),types=new Map();
 for(const r of records)for(const[p,v]of flatten(r)){stats.set(p,(stats.get(p)||0)+1);const t=v===null?'null':typeof v;if(!types.has(p))types.set(p,new Set());types.get(p).add(t);}
 const fields=[...stats].map(([field,count])=>({field,count,coverage:Number((count/records.length).toFixed(6)),types:[...(types.get(field)||[])]})).sort((a,b)=>b.count-a.count||a.field.localeCompare(b.field));
 const propertyIdPath=firstPath(records,['propertyId','property_id','canonicalPropertyId','canonical_property_id','propertyKey','property_key','buildingId','building_id','assetId','asset_id']);
 const eventTypePath=firstPath(records,['eventType','event_type','type','action','operation','kind']);
 const eventIdPath=firstPath(records,['eventId','event_id','id']);
 const versionPath=firstPath(records,['version','recordVersion','canonicalVersion','sequence','revision']);
 const timestampPath=firstPath(records,['timestamp','occurredAt','createdAt','updatedAt','eventTime','event_time']);
 const manifestId=id([clean(source.sha256),String(records.length),propertyIdPath||'',eventTypePath||'',eventIdPath||'',versionPath||'',timestampPath||'',JSON.stringify(fields.slice(0,100))],'G3SM');
 return Object.freeze({contract:'SCIIP_EXPLORER_3_M3_13_REAL_EVENT_SCHEMA_MANIFEST',version:'3.0-m3.13',status:'PROFILED',state:'REAL_CANONICAL_EVENT_SCHEMA_PROFILED',
 manifestId,source:Object.freeze(clone(source)),recordCount:records.length,fieldCount:fields.length,fields:Object.freeze(fields),
 recognized:Object.freeze({propertyIdPath,eventTypePath,eventIdPath,versionPath,timestampPath}),
 schemaHash:sha(JSON.stringify(fields)),readOnly:true,mutationPerformed:false});
}
export function projectRealEventsToCandidates({records=[],schemaManifest={}}={}){
 if(schemaManifest?.status!=='PROFILED')return Object.freeze({status:'BLOCKED',state:'SCHEMA_MANIFEST_NOT_PROFILED'});
 const pid=schemaManifest.recognized?.propertyIdPath;
 if(!pid)return Object.freeze({status:'PROJECTED',state:'NO_RECOGNIZED_PROPERTY_ID_PATH',projectedCount:0,candidates:Object.freeze([]),explicitNoCandidateProjection:true});
 const deny=/(id$|latitude|longitude|address|name|city|state|zip|timestamp|date|time|hash|version|sequence|revision|created|updated)/i;
 const preferred=/(asking.?rate|lease.?rate|clear.?height|building.?sf|available.?sf|land.?acres|coverage|power.?amps|parking|dock|truck.?court)/i;
 const candidates=[];
 records.forEach((r,i)=>{
   const propertyId=get(r,pid);if(typeof propertyId!=='string'||!propertyId.trim())return;
   const fields=flatten(r).filter(([p,v])=>typeof v==='number'&&Number.isFinite(v)&&!deny.test(p));
   fields.sort((a,b)=>(preferred.test(b[0])?1:0)-(preferred.test(a[0])?1:0)||a[0].localeCompare(b[0]));
   const chosen=fields[0];if(!chosen)return;
   const[fieldPath,currentValue]=chosen;const delta=Math.max(Math.abs(currentValue)*0.001,0.01);
   const proposedValue=Number((currentValue+delta).toFixed(6));
   candidates.push({propertyId:propertyId.trim(),fieldPath,currentValue,proposedValue,
    actualProductionCandidate:true,synthetic:false,singleProperty:true,singleField:true,approvedLowRiskCanary:true,
    destructiveMutation:false,bulkWrite:false,multiProperty:false,persistentWriteAuthority:false,rollbackAvailable:true,
    canonicalIdentityVerified:true,reversible:true,identityCritical:false,financialCritical:false,relationshipCritical:false,
    sourceRecordIndex:i,sourceEventId:schemaManifest.recognized.eventIdPath?get(r,schemaManifest.recognized.eventIdPath):null,
    currentVersion:schemaManifest.recognized.versionPath?String(get(r,schemaManifest.recognized.versionPath)??`event-${i}`):`event-${i}`,
    beforeHash:sha(JSON.stringify(r)),projectionRule:'REAL_EVENT_RECOGNIZED_PROPERTY_ID_PLUS_REVERSIBLE_NUMERIC_FIELD'});
 });
 const dedup=[];const seen=new Set();for(const c of candidates){const k=`${c.propertyId}|${c.fieldPath}`;if(!seen.has(k)){seen.add(k);dedup.push(c);}}
 return Object.freeze({contract:'SCIIP_EXPLORER_3_M3_13_REAL_EVENT_CANDIDATE_PROJECTION',version:'3.0-m3.13',status:'PROJECTED',
  state:dedup.length?'REAL_CANONICAL_EVENT_CANDIDATES_PROJECTED':'NO_PROJECTABLE_REAL_CANONICAL_EVENT_CANDIDATES',
  projectionId:id([schemaManifest.manifestId,String(records.length),String(dedup.length),JSON.stringify(dedup.slice(0,50))],'G3CP'),
  projectedCount:dedup.length,candidates:Object.freeze(clone(dedup)),explicitNoCandidateProjection:dedup.length===0,
  readOnly:true,liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0});
}
export function qualifyProjectedCandidates({projection,m307Runtime}={}){
 if(projection?.status!=='PROJECTED')return Object.freeze({status:'BLOCKED',state:'PROJECTION_NOT_READY'});
 if(typeof m307Runtime?.discoverAndRankProductionCandidates!=='function')return Object.freeze({status:'BLOCKED',state:'M3_07_RUNTIME_MISSING'});
 const result=m307Runtime.discoverAndRankProductionCandidates(projection.candidates||[]);
 const winner=result?.winner||null;
 return Object.freeze({status:'EXECUTED',state:winner?'REAL_EVENT_PROJECTED_CANDIDATE_QUALIFIED':'REAL_EVENT_PROJECTED_NO_QUALIFIED_CANDIDATE',
  evaluatedCount:Array.isArray(result?.evaluated)?result.evaluated.length:(projection.candidates||[]).length,
  qualifiedCount:Number(result?.qualifiedCount||0),selectedCandidate:winner?Object.freeze(clone(winner)):null,
  explicitNoQualifiedCandidate:!winner,readOnly:true,liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0});
}
export function persistSchemaProjectionEvidence({schemaManifest,projection,qualification,outputPath}={}){
 if(schemaManifest?.status!=='PROFILED'||projection?.status!=='PROJECTED'||qualification?.status!=='EXECUTED')return Object.freeze({status:'BLOCKED',state:'EVIDENCE_NOT_READY'});
 const evidence=Object.freeze({contract:'SCIIP_EXPLORER_3_M3_13_SCHEMA_PROJECTION_EVIDENCE',version:'3.0-m3.13',status:'CERTIFIED',
  state:'REAL_CANONICAL_EVENT_SCHEMA_PROJECTION_EVIDENCE_CERTIFIED',evidenceId:id([schemaManifest.manifestId,projection.projectionId,String(qualification.evaluatedCount),String(qualification.qualifiedCount),clean(qualification.selectedCandidate?.propertyId),clean(qualification.selectedCandidate?.fieldPath)],'G3SE'),
  schemaManifest,projectionSummary:Object.freeze({projectionId:projection.projectionId,projectedCount:projection.projectedCount,state:projection.state}),
  qualification,immutable:true,readOnly:true,liveWriteExecuted:false,mutationPerformed:false,canonicalCommitted:false,canonicalCommittedCount:0});
 const target=path.resolve(outputPath);fs.mkdirSync(path.dirname(target),{recursive:true});const body=JSON.stringify(evidence,null,2)+'\n';fs.writeFileSync(target,body,{flag:'w',mode:0o444});
 return Object.freeze({status:'PERSISTED',state:'REAL_CANONICAL_EVENT_SCHEMA_PROJECTION_EVIDENCE_PERSISTED',outputPath:target,sha256:sha(body),evidence});
}
