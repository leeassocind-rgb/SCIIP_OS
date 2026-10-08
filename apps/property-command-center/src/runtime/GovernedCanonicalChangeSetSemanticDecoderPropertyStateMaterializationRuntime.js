// SCIIP Explorer 3.0 — M3.16
// Governed Canonical Change-Set Semantic Decoder & Property-State Materialization Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const clone=v=>JSON.parse(JSON.stringify(v));
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
function id(parts,p='G316'){return `${p}-${sha(parts.join('|')).slice(0,16).toUpperCase()}`;}
const scalar=v=>v===null||['string','number','boolean'].includes(typeof v);

function normalizeKey(k){return String(k||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function firstKey(obj, aliases){
  if(!obj||typeof obj!=='object'||Array.isArray(obj)) return null;
  const wanted=new Set(aliases.map(normalizeKey));
  for(const k of Object.keys(obj)) if(wanted.has(normalizeKey(k))) return k;
  return null;
}

function classifyFieldName(fieldName){
  const f=clean(fieldName);
  if(f==='UNAVAILABLE') return {classification:'UNKNOWN',propertyDomain:false};

  if(/(^|\.)(propertyId|property_id|canonicalPropertyId|canonical_property_id|assetId|asset_id|buildingId|building_id|id)$/i.test(f))
    return {classification:'IDENTITY',propertyDomain:false};

  if(/(^|\.)(source|sourceId|source_id|provenance|origin|dataset|lineage)$/i.test(f))
    return {classification:'PROVENANCE',propertyDomain:false};

  if(/(^|\.)(hash|sha256|version|revision|sequence|timestamp|createdAt|updatedAt|eventType|page|citation|evidenceId)$/i.test(f))
    return {classification:'SYSTEM_OR_EVIDENCE_METADATA',propertyDomain:false};

  const mutable=[
    /asking.?rate/i,/lease.?rate/i,/clear.?height/i,/building.?sf/i,/available.?sf/i,
    /land.?acres/i,/coverage/i,/power.?amps/i,/parking/i,/truck.?court/i,/dock/i,
    /year.?built/i,/office.?sf/i,/sprinkler/i,/lot.?size/i,/ceiling.?height/i,
    /auto.?parking/i,/trailer.?parking/i,/dock.?high/i,/grade.?level/i
  ];
  if(mutable.some(r=>r.test(f)))
    return {classification:'PROPERTY_DOMAIN_ATTRIBUTE',propertyDomain:true};

  return {classification:'UNKNOWN',propertyDomain:false};
}

export function buildGovernedCanonicalChangeSetSemanticDecoderPropertyStateMaterializationRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_16_GOVERNED_CANONICAL_CHANGE_SET_SEMANTIC_DECODER_PROPERTY_STATE_MATERIALIZATION_RUNTIME',
    version:'3.0-m3.16',
    status:'READY',
    m315EvidenceRequired:true,
    realChangesArrayRequired:true,
    changeShapeIntrospectionRequired:true,
    fieldIdentityDecodingRequired:true,
    beforeAfterValueDecodingRequired:true,
    deterministicReplayRequired:true,
    propertyStateMaterializationRequired:true,
    semanticDomainClassificationRequired:true,
    explicitNoDecodableChangesOutcomeRequired:true,
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

export function introspectCanonicalChangeSetShape({events=[]}={}){
  if(!Array.isArray(events)||!events.length)
    return Object.freeze({status:'BLOCKED',state:'REAL_CANONICAL_EVENTS_EMPTY'});

  const changeEntries=[];
  let eventsWithChanges=0;
  let maxChangesPerEvent=0;

  events.forEach((event,eventIndex)=>{
    const changes=Array.isArray(event?.changes)?event.changes:[];
    if(changes.length){
      eventsWithChanges++;
      maxChangesPerEvent=Math.max(maxChangesPerEvent,changes.length);
    }
    changes.forEach((change,changeIndex)=>{
      if(change&&typeof change==='object'&&!Array.isArray(change)){
        changeEntries.push({eventIndex,changeIndex,change});
      }
    });
  });

  const keyCounts=new Map();
  for(const row of changeEntries){
    for(const key of Object.keys(row.change)){
      keyCounts.set(key,(keyCounts.get(key)||0)+1);
    }
  }

  const keys=[...keyCounts.entries()]
    .map(([key,count])=>({key,count,coverage:changeEntries.length?Number((count/changeEntries.length).toFixed(6)):0}))
    .sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));

  const sample=changeEntries.slice(0,25).map(x=>Object.freeze({
    eventIndex:x.eventIndex,
    changeIndex:x.changeIndex,
    keys:Object.keys(x.change),
    valueTypes:Object.fromEntries(Object.entries(x.change).map(([k,v])=>[k,Array.isArray(v)?'array':v===null?'null':typeof v]))
  }));

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_16_CANONICAL_CHANGE_SET_SHAPE_PROFILE',
    version:'3.0-m3.16',
    status:'PROFILED',
    state:changeEntries.length?'CANONICAL_CHANGE_SET_SHAPE_PROFILED':'NO_CANONICAL_CHANGE_ENTRIES_FOUND',
    profileId:id([String(events.length),String(eventsWithChanges),String(changeEntries.length),JSON.stringify(keys)],'G3CS'),
    eventCount:events.length,
    eventsWithChanges,
    changeEntryCount:changeEntries.length,
    maxChangesPerEvent,
    keys:Object.freeze(keys),
    sample:Object.freeze(sample),
    readOnly:true
  });
}

export function inferCanonicalChangeSemantics({events=[],shapeProfile={}}={}){
  if(shapeProfile?.status!=='PROFILED')
    return Object.freeze({status:'BLOCKED',state:'CHANGE_SET_SHAPE_NOT_PROFILED'});

  const aliases={
    field:['field','fieldName','field_name','path','fieldPath','field_path','property','propertyField','attribute','attributeName','key','name'],
    before:['before','old','oldValue','old_value','previous','previousValue','previous_value','from'],
    after:['after','new','newValue','new_value','value','current','currentValue','current_value','to']
  };

  const examples=[];
  let fieldKeyCounts=new Map(),beforeKeyCounts=new Map(),afterKeyCounts=new Map();

  for(const event of events){
    for(const change of (Array.isArray(event?.changes)?event.changes:[])){
      if(!change||typeof change!=='object'||Array.isArray(change)) continue;
      const fk=firstKey(change,aliases.field);
      const bk=firstKey(change,aliases.before);
      const ak=firstKey(change,aliases.after);

      if(fk) fieldKeyCounts.set(fk,(fieldKeyCounts.get(fk)||0)+1);
      if(bk) beforeKeyCounts.set(bk,(beforeKeyCounts.get(bk)||0)+1);
      if(ak) afterKeyCounts.set(ak,(afterKeyCounts.get(ak)||0)+1);

      if(examples.length<50 && fk){
        examples.push({
          fieldKey:fk,
          beforeKey:bk,
          afterKey:ak,
          fieldValue:change[fk],
          beforeValue:bk?change[bk]:undefined,
          afterValue:ak?change[ak]:undefined
        });
      }
    }
  }

  function winner(map){
    return [...map.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||null;
  }

  const fieldKey=winner(fieldKeyCounts);
  const beforeKey=winner(beforeKeyCounts);
  const afterKey=winner(afterKeyCounts);
  const decodable=!!fieldKey && !!afterKey;

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_16_CANONICAL_CHANGE_SEMANTICS',
    version:'3.0-m3.16',
    status:'INFERRED',
    state:decodable?'CANONICAL_CHANGE_SEMANTICS_INFERRED':'CANONICAL_CHANGE_SEMANTICS_NOT_DECODABLE',
    semanticsId:id([shapeProfile.profileId,fieldKey||'',beforeKey||'',afterKey||'',JSON.stringify(examples.slice(0,20))],'G3SM'),
    fieldKey,
    beforeKey,
    afterKey,
    decodable,
    examples:Object.freeze(examples),
    readOnly:true
  });
}

export function decodeCanonicalChanges({events=[],changeSemantics={}}={}){
  if(changeSemantics?.status!=='INFERRED'||changeSemantics?.decodable!==true)
    return Object.freeze({status:'DECODED',state:'NO_DECODABLE_CANONICAL_CHANGES',decodedCount:0,decodedChanges:Object.freeze([]),explicitNoDecodableChanges:true});

  const decoded=[];
  const fk=changeSemantics.fieldKey;
  const bk=changeSemantics.beforeKey;
  const ak=changeSemantics.afterKey;

  events.forEach((event,eventIndex)=>{
    const propertyId=
      event?.canonicalPropertyId ??
      event?.propertyId ??
      event?.canonical_property_id ??
      event?.property_id;

    if(typeof propertyId!=='string'||!propertyId.trim()) return;

    (Array.isArray(event?.changes)?event.changes:[]).forEach((change,changeIndex)=>{
      if(!change||typeof change!=='object'||Array.isArray(change)) return;
      const fieldName=change[fk];
      if(typeof fieldName!=='string'||!fieldName.trim()) return;

      const beforeValue=bk?change[bk]:undefined;
      const afterValue=change[ak];

      if(afterValue===undefined) return;

      const semantic=classifyFieldName(fieldName.trim());

      decoded.push(Object.freeze({
        propertyId:propertyId.trim(),
        eventIndex,
        changeIndex,
        fieldName:fieldName.trim(),
        beforeValue,
        afterValue,
        semanticClassification:semantic.classification,
        propertyDomainAttribute:semantic.propertyDomain,
        eventHash:sha(JSON.stringify(event)),
        changeHash:sha(JSON.stringify(change))
      }));
    });
  });

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_16_DECODED_CANONICAL_CHANGES',
    version:'3.0-m3.16',
    status:'DECODED',
    state:decoded.length?'CANONICAL_CHANGES_DECODED':'NO_DECODABLE_CANONICAL_CHANGES',
    decodedId:id([changeSemantics.semanticsId,String(decoded.length),JSON.stringify(decoded.slice(0,100))],'G3DC'),
    decodedCount:decoded.length,
    propertyDomainDecodedCount:decoded.filter(x=>x.propertyDomainAttribute).length,
    decodedChanges:Object.freeze(decoded),
    explicitNoDecodableChanges:decoded.length===0,
    readOnly:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function materializePropertyStateFromDecodedChanges({decodedChanges={}}={}){
  if(decodedChanges?.status!=='DECODED')
    return Object.freeze({status:'BLOCKED',state:'DECODED_CHANGES_NOT_READY'});

  const byProperty=new Map();

  for(const change of decodedChanges.decodedChanges||[]){
    if(!byProperty.has(change.propertyId)){
      byProperty.set(change.propertyId,{
        propertyId:change.propertyId,
        appliedChangeCount:0,
        propertyDomainChangeCount:0,
        state:{},
        provenance:{}
      });
    }
    const p=byProperty.get(change.propertyId);
    p.appliedChangeCount++;
    if(change.propertyDomainAttribute) p.propertyDomainChangeCount++;
    p.state[change.fieldName]=clone(change.afterValue);
    p.provenance[change.fieldName]={
      eventIndex:change.eventIndex,
      changeIndex:change.changeIndex,
      eventHash:change.eventHash,
      changeHash:change.changeHash,
      semanticClassification:change.semanticClassification
    };
  }

  const properties=[...byProperty.values()]
    .map(p=>Object.freeze({
      propertyId:p.propertyId,
      appliedChangeCount:p.appliedChangeCount,
      propertyDomainChangeCount:p.propertyDomainChangeCount,
      state:Object.freeze(clone(p.state)),
      provenance:Object.freeze(clone(p.provenance))
    }))
    .sort((a,b)=>a.propertyId.localeCompare(b.propertyId));

  const domainFields=new Map();
  for(const p of properties){
    for(const[fieldName,value] of Object.entries(p.state)){
      const semantic=classifyFieldName(fieldName);
      if(!semantic.propertyDomain) continue;
      if(!domainFields.has(fieldName)) domainFields.set(fieldName,{fieldName,propertyCount:0,types:new Set(),sampleValues:[]});
      const d=domainFields.get(fieldName);
      d.propertyCount++;
      d.types.add(Array.isArray(value)?'array':value===null?'null':typeof value);
      if(d.sampleValues.length<5) d.sampleValues.push(value);
    }
  }

  const discoveredDomainFields=[...domainFields.values()]
    .map(x=>Object.freeze({
      fieldName:x.fieldName,
      propertyCount:x.propertyCount,
      types:[...x.types],
      sampleValues:x.sampleValues,
      classification:'PROPERTY_DOMAIN_ATTRIBUTE'
    }))
    .sort((a,b)=>b.propertyCount-a.propertyCount||a.fieldName.localeCompare(b.fieldName));

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_16_MATERIALIZED_PROPERTY_STATE',
    version:'3.0-m3.16',
    status:'MATERIALIZED',
    state:properties.length?'PROPERTY_STATE_MATERIALIZED_FROM_CANONICAL_CHANGE_SET':'NO_PROPERTY_STATE_MATERIALIZED',
    materializationId:id([decodedChanges.decodedId,String(properties.length),JSON.stringify(discoveredDomainFields)],'G3PM'),
    propertyCount:properties.length,
    properties:Object.freeze(properties),
    domainFieldCount:discoveredDomainFields.length,
    domainFields:Object.freeze(discoveredDomainFields),
    explicitNoPropertyDomainFields:discoveredDomainFields.length===0,
    readOnly:true,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0
  });
}

export function buildM316Evidence({shapeProfile,changeSemantics,decodedChanges,materialization}={}){
  if(shapeProfile?.status!=='PROFILED'||changeSemantics?.status!=='INFERRED'||decodedChanges?.status!=='DECODED'||materialization?.status!=='MATERIALIZED')
    return Object.freeze({status:'BLOCKED',state:'M3_16_EVIDENCE_NOT_READY'});

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_16_CANONICAL_CHANGE_SET_DECODER_PROPERTY_STATE_EVIDENCE',
    version:'3.0-m3.16',
    status:'CERTIFIED',
    state:'CANONICAL_CHANGE_SET_DECODER_PROPERTY_STATE_EVIDENCE_CERTIFIED',
    evidenceId:id([
      shapeProfile.profileId,
      changeSemantics.semanticsId,
      decodedChanges.decodedId,
      materialization.materializationId,
      String(materialization.domainFieldCount)
    ],'G3EV'),
    shapeProfileSummary:Object.freeze({
      eventCount:shapeProfile.eventCount,
      eventsWithChanges:shapeProfile.eventsWithChanges,
      changeEntryCount:shapeProfile.changeEntryCount,
      keys:shapeProfile.keys
    }),
    changeSemantics:Object.freeze(clone(changeSemantics)),
    decodedSummary:Object.freeze({
      decodedCount:decodedChanges.decodedCount,
      propertyDomainDecodedCount:decodedChanges.propertyDomainDecodedCount,
      explicitNoDecodableChanges:decodedChanges.explicitNoDecodableChanges
    }),
    materializationSummary:Object.freeze({
      propertyCount:materialization.propertyCount,
      domainFieldCount:materialization.domainFieldCount,
      domainFields:materialization.domainFields,
      explicitNoPropertyDomainFields:materialization.explicitNoPropertyDomainFields
    }),
    immutable:true,
    readOnly:true,
    canonicalMutationAllowed:false,
    liveWriteExecuted:false,
    mutationPerformed:false,
    canonicalCommitted:false,
    canonicalCommittedCount:0,
    automaticCommit:false,
    automaticRetryAllowed:false,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false
  });
}

export function persistM316Evidence({evidence,outputPath}={}){
  if(evidence?.status!=='CERTIFIED')
    return Object.freeze({status:'BLOCKED',state:'UNCERTIFIED_M3_16_EVIDENCE_NOT_PERSISTED'});
  const target=path.resolve(outputPath);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const body=JSON.stringify(evidence,null,2)+'\n';
  fs.writeFileSync(target,body,{flag:'w',mode:0o444});
  return Object.freeze({
    status:'PERSISTED',
    state:'M3_16_EVIDENCE_PERSISTED',
    outputPath:target,
    sha256:sha(body)
  });
}
