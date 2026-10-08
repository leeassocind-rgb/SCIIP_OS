// SCIIP Explorer 3.0 — M3.15
// Governed Canonical Event Payload Property-State Reconstruction & Semantic Field Discovery Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
function id(parts,p='G315'){return `${p}-${sha(parts.join('|')).slice(0,16).toUpperCase()}`;}
const scalar=v=>v===null||['string','number','boolean'].includes(typeof v);

function flattenDeep(value, prefix='', out=[], depth=0){
  if(depth>12) return out;
  if(Array.isArray(value)){
    value.forEach((v,i)=>flattenDeep(v, prefix?`${prefix}[${i}]`:`[${i}]`, out, depth+1));
    return out;
  }
  if(value&&typeof value==='object'){
    for(const[k,v] of Object.entries(value)){
      const p=prefix?`${prefix}.${k}`:k;
      if(scalar(v)) out.push([p,v]);
      else flattenDeep(v,p,out,depth+1);
    }
  }
  return out;
}

function get(obj,pathExpr){
  if(!pathExpr) return undefined;
  const norm=pathExpr.replace(/\[(\d+)\]/g,'.$1');
  return norm.split('.').reduce((a,k)=>a&&typeof a==='object'?a[k]:undefined,obj);
}

function firstPresentPath(records, names){
  const aliases=names.map(x=>x.toLowerCase());
  const counts=new Map();
  for(const r of records){
    for(const[p,v] of flattenDeep(r)){
      const leaf=p.replace(/\[\d+\]/g,'').split('.').pop().toLowerCase();
      if(aliases.includes(leaf) && v!==null && v!=='') counts.set(p,(counts.get(p)||0)+1);
    }
  }
  return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||null;
}

function classifyDomainField(fieldPath){
  const f=clean(fieldPath);
  if(f==='UNAVAILABLE') return {classification:'UNKNOWN',reason:'UNAVAILABLE'};

  if(/(^|\.)(propertyId|property_id|eventId|event_id|id|canonicalPropertyId|canonical_property_id|assetId|asset_id|buildingId|building_id)$/i.test(f))
    return {classification:'IDENTITY',reason:'IDENTITY_FIELD'};

  if(/(^|\.)(source|sourceId|source_id|provenance|lineage|origin|originId|origin_id|dataset|datasetId|dataset_id)$/i.test(f))
    return {classification:'PROVENANCE',reason:'PROVENANCE_FIELD'};

  if(/(^|\.)(hash|sha256|version|revision|sequence|timestamp|createdAt|created_at|updatedAt|updated_at|eventType|event_type|page|citation|evidenceId|evidence_id)$/i.test(f))
    return {classification:'SYSTEM_OR_EVIDENCE_METADATA',reason:'SYSTEM_OR_EVIDENCE_METADATA_FIELD'};

  const mutablePatterns=[
    /asking.?rate/i,/lease.?rate/i,/clear.?height/i,/building.?sf/i,/available.?sf/i,
    /land.?acres/i,/coverage/i,/power.?amps/i,/parking/i,/truck.?court/i,/dock/i,
    /year.?built/i,/sprinkler/i,/office.?sf/i,/lot.?size/i,/ceiling.?height/i
  ];
  if(mutablePatterns.some(r=>r.test(f)))
    return {classification:'PROPERTY_DOMAIN_ATTRIBUTE',reason:'RECOGNIZED_PROPERTY_DOMAIN_ATTRIBUTE'};

  return {classification:'UNKNOWN',reason:'NO_RECOGNIZED_PROPERTY_DOMAIN_SEMANTIC'};
}

export function buildGovernedCanonicalEventPayloadPropertyStateReconstructionSemanticFieldDiscoveryRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_15_GOVERNED_CANONICAL_EVENT_PAYLOAD_PROPERTY_STATE_RECONSTRUCTION_SEMANTIC_FIELD_DISCOVERY_RUNTIME',
    version:'3.0-m3.15',
    status:'READY',
    m314EvidenceRequired:true,
    realCanonicalEventsRequired:true,
    deepPayloadIntrospectionRequired:true,
    nestedObjectTraversalRequired:true,
    nestedArrayTraversalRequired:true,
    propertyStateReconstructionRequired:true,
    domainFieldDiscoveryRequired:true,
    semanticClassificationRequired:true,
    explicitNoPropertyDomainFieldsOutcomeRequired:true,
    noWriteAuthorityIntroduced:true,
    canonicalMutationAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    liveWriteExecuted:false,
    automaticCommit:false,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    canonicalCommittedCount:0
  });
}

export function introspectCanonicalEventPayloads({records=[],source={}}={}){
  if(!Array.isArray(records)||!records.length)
    return Object.freeze({status:'BLOCKED',state:'REAL_CANONICAL_EVENTS_EMPTY'});

  const fieldStats=new Map();
  const typeStats=new Map();

  for(const r of records){
    for(const[p,v] of flattenDeep(r)){
      fieldStats.set(p,(fieldStats.get(p)||0)+1);
      if(!typeStats.has(p)) typeStats.set(p,new Set());
      typeStats.get(p).add(v===null?'null':typeof v);
    }
  }

  const fields=[...fieldStats.entries()]
    .map(([field,count])=>({
      field,count,coverage:Number((count/records.length).toFixed(6)),
      types:[...(typeStats.get(field)||[])]
    }))
    .sort((a,b)=>b.count-a.count||a.field.localeCompare(b.field));

  const propertyIdPath=firstPresentPath(records,[
    'propertyId','property_id','canonicalPropertyId','canonical_property_id','propertyKey','property_key',
    'buildingId','building_id','assetId','asset_id'
  ]);

  const payloadRootCandidates=fields
    .map(x=>x.field.split('.').slice(0,-1).join('.'))
    .filter(Boolean);

  const rootCounts={};
  for(const r of payloadRootCandidates) rootCounts[r]=(rootCounts[r]||0)+1;
  const payloadRoots=Object.entries(rootCounts)
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
    .slice(0,25)
    .map(([root,count])=>({root,count}));

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_15_REAL_CANONICAL_PAYLOAD_INTROSPECTION',
    version:'3.0-m3.15',
    status:'PROFILED',
    state:'REAL_CANONICAL_EVENT_PAYLOADS_PROFILED',
    profileId:id([clean(source.sha256),String(records.length),propertyIdPath||'',JSON.stringify(fields.slice(0,250))],'G3PI'),
    source:Object.freeze(clone(source)),
    recordCount:records.length,
    fieldCount:fields.length,
    propertyIdPath,
    fields:Object.freeze(fields),
    payloadRoots:Object.freeze(payloadRoots),
    schemaHash:sha(JSON.stringify(fields)),
    readOnly:true,
    mutationPerformed:false
  });
}

export function reconstructPropertyStateFromEvents({records=[],payloadProfile={}}={}){
  if(payloadProfile?.status!=='PROFILED')
    return Object.freeze({status:'BLOCKED',state:'PAYLOAD_PROFILE_NOT_READY'});

  const pidPath=payloadProfile.propertyIdPath;
  if(!pidPath)
    return Object.freeze({status:'RECONSTRUCTED',state:'NO_RECOGNIZED_PROPERTY_ID_PATH',propertyCount:0,properties:Object.freeze([])});

  const byProperty=new Map();

  records.forEach((event,index)=>{
    const propertyId=get(event,pidPath);
    if(typeof propertyId!=='string'||!propertyId.trim()) return;

    if(!byProperty.has(propertyId.trim())){
      byProperty.set(propertyId.trim(),{
        propertyId:propertyId.trim(),
        eventCount:0,
        latestEventIndex:-1,
        reconstructedFields:{},
        fieldSources:{}
      });
    }

    const state=byProperty.get(propertyId.trim());
    state.eventCount++;
    state.latestEventIndex=Math.max(state.latestEventIndex,index);

    for(const[fieldPath,value] of flattenDeep(event)){
      if(fieldPath===pidPath) continue;
      const semantic=classifyDomainField(fieldPath);
      if(semantic.classification!=='PROPERTY_DOMAIN_ATTRIBUTE') continue;
      if(!scalar(value)) continue;

      state.reconstructedFields[fieldPath]=value;
      state.fieldSources[fieldPath]={
        eventIndex:index,
        beforeHash:sha(JSON.stringify(event))
      };
    }
  });

  const properties=[...byProperty.values()]
    .map(p=>Object.freeze({
      propertyId:p.propertyId,
      eventCount:p.eventCount,
      latestEventIndex:p.latestEventIndex,
      reconstructedFields:Object.freeze(clone(p.reconstructedFields)),
      fieldSources:Object.freeze(clone(p.fieldSources))
    }))
    .sort((a,b)=>a.propertyId.localeCompare(b.propertyId));

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_15_RECONSTRUCTED_PROPERTY_STATE',
    version:'3.0-m3.15',
    status:'RECONSTRUCTED',
    state:properties.length?'PROPERTY_STATE_RECONSTRUCTED_FROM_CANONICAL_EVENTS':'NO_PROPERTY_STATE_RECONSTRUCTED',
    reconstructionId:id([payloadProfile.profileId,String(properties.length),JSON.stringify(properties.slice(0,100))],'G3RS'),
    propertyCount:properties.length,
    properties:Object.freeze(properties),
    readOnly:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function discoverSemanticPropertyDomainFields({payloadProfile={},reconstruction={}}={}){
  if(payloadProfile?.status!=='PROFILED'||reconstruction?.status!=='RECONSTRUCTED')
    return Object.freeze({status:'BLOCKED',state:'PROPERTY_STATE_DISCOVERY_PREREQUISITES_MISSING'});

  const observed=new Map();

  for(const p of reconstruction.properties||[]){
    for(const[fieldPath,value] of Object.entries(p.reconstructedFields||{})){
      if(!observed.has(fieldPath)){
        observed.set(fieldPath,{
          fieldPath,
          classification:'PROPERTY_DOMAIN_ATTRIBUTE',
          occurrences:0,
          propertyCount:0,
          types:new Set(),
          sampleValues:[]
        });
      }
      const item=observed.get(fieldPath);
      item.occurrences++;
      item.propertyCount++;
      item.types.add(value===null?'null':typeof value);
      if(item.sampleValues.length<5) item.sampleValues.push(value);
    }
  }

  const fields=[...observed.values()]
    .map(x=>Object.freeze({
      fieldPath:x.fieldPath,
      classification:x.classification,
      occurrences:x.occurrences,
      propertyCount:x.propertyCount,
      types:[...x.types],
      sampleValues:x.sampleValues,
      canaryCandidateSurface:true
    }))
    .sort((a,b)=>b.propertyCount-a.propertyCount||a.fieldPath.localeCompare(b.fieldPath));

  const state=fields.length
    ?'PROPERTY_DOMAIN_FIELDS_DISCOVERED'
    :'NO_PROPERTY_DOMAIN_FIELDS_DISCOVERED';

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_15_PROPERTY_DOMAIN_FIELD_DISCOVERY',
    version:'3.0-m3.15',
    status:'DISCOVERED',
    state,
    discoveryId:id([payloadProfile.profileId,reconstruction.reconstructionId,JSON.stringify(fields)],'G3DF'),
    fieldCount:fields.length,
    fields:Object.freeze(fields),
    explicitNoPropertyDomainFields:fields.length===0,
    readOnly:true,
    canonicalMutationAllowed:false
  });
}

export function buildM315Evidence({payloadProfile,reconstruction,domainDiscovery}={}){
  if(payloadProfile?.status!=='PROFILED'||reconstruction?.status!=='RECONSTRUCTED'||domainDiscovery?.status!=='DISCOVERED')
    return Object.freeze({status:'BLOCKED',state:'M3_15_EVIDENCE_NOT_READY'});

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_15_CANONICAL_PAYLOAD_PROPERTY_STATE_DISCOVERY_EVIDENCE',
    version:'3.0-m3.15',
    status:'CERTIFIED',
    state:'CANONICAL_EVENT_PAYLOAD_PROPERTY_STATE_DISCOVERY_EVIDENCE_CERTIFIED',
    evidenceId:id([
      payloadProfile.profileId,
      reconstruction.reconstructionId,
      domainDiscovery.discoveryId,
      String(domainDiscovery.fieldCount)
    ],'G3EV'),
    payloadProfileSummary:Object.freeze({
      profileId:payloadProfile.profileId,
      recordCount:payloadProfile.recordCount,
      fieldCount:payloadProfile.fieldCount,
      propertyIdPath:payloadProfile.propertyIdPath,
      schemaHash:payloadProfile.schemaHash
    }),
    reconstructionSummary:Object.freeze({
      reconstructionId:reconstruction.reconstructionId,
      propertyCount:reconstruction.propertyCount,
      state:reconstruction.state
    }),
    domainFieldDiscovery:Object.freeze(clone(domainDiscovery)),
    immutable:true,
    readOnly:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0,
    canonicalMutationAllowed:false,
    automaticCommit:false,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false
  });
}

export function persistM315Evidence({evidence,outputPath}={}){
  if(evidence?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'UNCERTIFIED_M3_15_EVIDENCE_NOT_PERSISTED'});
  const target=path.resolve(outputPath);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const body=JSON.stringify(evidence,null,2)+'\n';
  fs.writeFileSync(target,body,{flag:'w',mode:0o444});
  return Object.freeze({
    status:'PERSISTED',
    state:'M3_15_EVIDENCE_PERSISTED',
    outputPath:target,
    sha256:sha(body)
  });
}
