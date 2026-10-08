// SCIIP Explorer 3.0 — M3.20A
// Canonical Property Store Physical Storage Resolution & Production Adapter Runtime

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const clone=v=>JSON.parse(JSON.stringify(v));
const clean=(v,f='UNAVAILABLE')=>typeof v==='string'&&v.trim()?v.trim():f;
const sha=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const id=(p,parts)=>`${p}-${sha(parts.join('|')).slice(0,16).toUpperCase()}`;

function atomicWriteJson(filePath,data){
  const dir=path.dirname(filePath);
  fs.mkdirSync(dir,{recursive:true});
  const temp=`${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{encoding:'utf8'});
  fs.renameSync(temp,filePath);
}

function fileSha(filePath){
  return sha(fs.readFileSync(filePath));
}

export function buildCanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime(){
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M3_20A_CANONICAL_PROPERTY_STORE_PHYSICAL_STORAGE_RESOLUTION_PRODUCTION_ADAPTER_RUNTIME',
    version:'3.0-m3.20a',
    status:'READY',
    canonicalStoreName:'SCIIP_CANONICAL_PROPERTY_STORE',
    physicalStorageResolutionRequired:true,
    readConsistencyVerificationRequired:true,
    sixMethodAdapterRequired:true,
    liveMutationDisabledUntilCertifiedBinding:true,
    onePropertyOneFieldExecutionOnly:true,
    tokenConsumptionRequired:true,
    durableReceiptRequired:true,
    durableAuditRequired:true,
    atomicWriteRequired:true,
    rollbackRequired:true,
    generalizedWriteAuthority:false,
    bulkWritesAllowed:false,
    multiPropertyWritesAllowed:false,
    persistentWriteAuthority:false,
    automaticRetryAllowed:false,
    installerExecutesWrite:false,
    certificationExecutesWrite:false,
    canonicalCommittedCountAtInstall:0
  });
}

export function resolveCanonicalPropertyStorePhysicalStorage({repoRoot,explicitPath}={}){
  const repo=path.resolve(repoRoot||'.');
  const candidates=[];
  if(explicitPath) candidates.push(path.resolve(explicitPath));

  candidates.push(
    path.join(repo,'apps','property-command-center','public','production-validation-data','canonical-property-identity-data.json'),
    path.join(repo,'apps','property-command-center','public','data','canonical-property-identity-data.json'),
    path.join(repo,'apps','property-command-center','src','data','canonical-property-identity-data.json'),
    path.join(repo,'data','canonical-property-identity-data.json')
  );

  const existing=[...new Set(candidates.filter(p=>fs.existsSync(p)&&fs.statSync(p).isFile()))];
  if(!existing.length){
    return Object.freeze({
      status:'BLOCKED',
      state:'CANONICAL_PROPERTY_STORE_PHYSICAL_STORAGE_NOT_FOUND',
      canonicalStoreName:'SCIIP_CANONICAL_PROPERTY_STORE'
    });
  }

  const primary=existing[0];
  let parsed;
  try{parsed=JSON.parse(fs.readFileSync(primary,'utf8'));}catch(e){
    return Object.freeze({
      status:'BLOCKED',
      state:'CANONICAL_PROPERTY_STORE_JSON_INVALID',
      filePath:primary,
      error:String(e?.message||e)
    });
  }

  const events=Array.isArray(parsed?.events)?parsed.events:null;
  if(!events){
    return Object.freeze({
      status:'BLOCKED',
      state:'CANONICAL_PROPERTY_STORE_EVENTS_ARRAY_MISSING',
      filePath:primary
    });
  }

  return Object.freeze({
    status:'RESOLVED',
    state:'CANONICAL_PROPERTY_STORE_PHYSICAL_STORAGE_RESOLVED',
    canonicalStoreName:'SCIIP_CANONICAL_PROPERTY_STORE',
    provider:'LOCAL_JSON_CANONICAL_EVENT_STORE',
    filePath:primary,
    bytes:fs.statSync(primary).size,
    sha256:fileSha(primary),
    corpusVersion:clean(parsed?.version||parsed?.datasetVersion||parsed?.corpusVersion),
    eventCount:events.length,
    duplicateCandidates:Object.freeze(existing.slice(1)),
    readOnlyVerificationMode:true,
    mutationEnabled:false
  });
}

function latestFieldStateFromEvents(events,propertyId,fieldName){
  let value=undefined,version='UNAVAILABLE',eventId='UNAVAILABLE';
  let found=false;

  for(let i=0;i<events.length;i++){
    const event=events[i];
    const pid=event?.canonicalPropertyId??event?.propertyId??event?.canonical_property_id??event?.property_id;
    if(pid!==propertyId) continue;

    for(const change of (Array.isArray(event?.changes)?event.changes:[])){
      if(change?.field===fieldName){
        value=clone(change?.after);
        version=clean(event?.version||event?.revision||event?.sequence||event?.eventId||`event-${i}`);
        eventId=clean(event?.eventId||`event-${i}`);
        found=true;
      }
    }
  }

  return {found,value,version,eventId};
}

export function certifyCanonicalStoreReadBinding({resolvedStorage,expectedTarget}={}){
  if(resolvedStorage?.status!=='RESOLVED'){
    return Object.freeze({status:'BLOCKED',state:'CANONICAL_STORAGE_NOT_RESOLVED'});
  }

  let parsed;
  try{parsed=JSON.parse(fs.readFileSync(resolvedStorage.filePath,'utf8'));}catch(e){
    return Object.freeze({status:'BLOCKED',state:'CANONICAL_STORAGE_READ_FAILED'});
  }

  const events=Array.isArray(parsed?.events)?parsed.events:[];
  const state=latestFieldStateFromEvents(events,expectedTarget?.propertyId,expectedTarget?.fieldName);

  const targetFound=state.found===true;
  const beforeMatches=targetFound && JSON.stringify(state.value)===JSON.stringify(expectedTarget?.expectedBeforeValue);

  return Object.freeze({
    status:targetFound?'CERTIFIED':'BLOCKED',
    state:targetFound?'CANONICAL_STORE_READ_BINDING_CERTIFIED':'CANONICAL_STORE_TARGET_NOT_FOUND',
    targetFound,
    beforeMatches,
    observedValue:clone(state.value),
    observedVersion:state.version,
    observedEventId:state.eventId,
    expectedBeforeValue:clone(expectedTarget?.expectedBeforeValue),
    exactReadConsistency:beforeMatches,
    provider:resolvedStorage.provider,
    filePath:resolvedStorage.filePath,
    sha256:resolvedStorage.sha256,
    bytes:resolvedStorage.bytes,
    eventCount:resolvedStorage.eventCount,
    mutationEnabled:false
  });
}

export function createCertifiedCanonicalPropertyStoreAdapter({
  resolvedStorage,
  bindingCertification,
  adapterStatePath,
  receiptPath,
  auditPath
}={}){
  if(resolvedStorage?.status!=='RESOLVED'){
    throw new Error('M3.20A: resolved canonical storage required');
  }
  if(bindingCertification?.status!=='CERTIFIED'){
    throw new Error('M3.20A: certified read binding required');
  }

  const stateFile=path.resolve(adapterStatePath);
  const receiptFile=path.resolve(receiptPath);
  const auditFile=path.resolve(auditPath);

  const load=()=>JSON.parse(fs.readFileSync(resolvedStorage.filePath,'utf8'));
  const save=data=>atomicWriteJson(resolvedStorage.filePath,data);

  const ensureState=()=>{
    if(!fs.existsSync(stateFile)){
      atomicWriteJson(stateFile,{consumedTokens:[],receipts:[],audit:[]});
    }
    return JSON.parse(fs.readFileSync(stateFile,'utf8'));
  };

  const adapter={
    async readCurrent({propertyId,fieldName}={}){
      const parsed=load();
      const events=Array.isArray(parsed?.events)?parsed.events:[];
      const s=latestFieldStateFromEvents(events,propertyId,fieldName);
      return {
        propertyId,
        fieldName,
        fieldValue:clone(s.value),
        version:s.version,
        eventId:s.eventId,
        found:s.found
      };
    },

    async writeAtomic({
      propertyId,fieldName,expectedVersion,expectedBeforeValue,
      executionManifestId,executionId,idempotencyKey,payload
    }={}){
      const state=ensureState();
      if(state.consumedTokens.includes(idempotencyKey)){
        return {committed:false,state:'TOKEN_ALREADY_CONSUMED'};
      }

      const parsed=load();
      const events=Array.isArray(parsed?.events)?parsed.events:[];
      const current=latestFieldStateFromEvents(events,propertyId,fieldName);

      if(!current.found) return {committed:false,state:'TARGET_NOT_FOUND'};
      if(JSON.stringify(current.value)!==JSON.stringify(expectedBeforeValue)){
        return {committed:false,state:'BEFORE_STATE_MISMATCH'};
      }
      if(clean(current.version)!==clean(expectedVersion)){
        return {committed:false,state:'VERSION_MISMATCH'};
      }

      const newVersion=`M3.20A-${Date.now()}`;
      const event={
        eventId:`M3.20A-${sha(`${executionId}|${propertyId}|${fieldName}|${newVersion}`).slice(0,20)}`,
        eventType:'CANONICAL_CANARY_COMMIT',
        canonicalPropertyId:propertyId,
        version:newVersion,
        executionManifestId,
        executionId,
        changes:[{
          field:fieldName,
          before:clone(expectedBeforeValue),
          after:clone(payload?.value)
        }]
      };

      parsed.events=[...events,event];
      save(parsed);

      return {
        committed:true,
        state:'ATOMIC_CANONICAL_EVENT_APPENDED',
        version:newVersion,
        eventId:event.eventId,
        eventHash:sha(JSON.stringify(event))
      };
    },

    async rollback({propertyId,fieldName,executionManifestId,executionId,restoreValue,reason}={}){
      const parsed=load();
      const events=Array.isArray(parsed?.events)?parsed.events:[];
      const current=latestFieldStateFromEvents(events,propertyId,fieldName);
      if(!current.found) return {rolledBack:false,state:'ROLLBACK_TARGET_NOT_FOUND'};

      const newVersion=`M3.20A-RB-${Date.now()}`;
      const event={
        eventId:`M3.20A-RB-${sha(`${executionId}|${propertyId}|${fieldName}|${newVersion}`).slice(0,20)}`,
        eventType:'CANONICAL_CANARY_ROLLBACK',
        canonicalPropertyId:propertyId,
        version:newVersion,
        executionManifestId,
        executionId,
        rollbackReason:reason,
        changes:[{
          field:fieldName,
          before:clone(current.value),
          after:clone(restoreValue)
        }]
      };

      parsed.events=[...events,event];
      save(parsed);

      return {
        rolledBack:true,
        state:'CANONICAL_ROLLBACK_EVENT_APPENDED',
        version:newVersion,
        eventId:event.eventId
      };
    },

    async consumeToken({token,executionManifestId,executionId}={}){
      const state=ensureState();
      if(state.consumedTokens.includes(token)) return {consumed:false,state:'TOKEN_REUSE_BLOCKED'};
      state.consumedTokens.push(token);
      state.lastTokenConsumption={token,executionManifestId,executionId};
      atomicWriteJson(stateFile,state);
      return {consumed:true,state:'TOKEN_CONSUMED'};
    },

    async persistReceipt(receipt){
      const state=ensureState();
      state.receipts.push(clone(receipt));
      atomicWriteJson(stateFile,state);
      fs.mkdirSync(path.dirname(receiptFile),{recursive:true});
      fs.writeFileSync(receiptFile,JSON.stringify(receipt,null,2)+'\n');
      return {persisted:true};
    },

    async appendAudit(entry){
      const state=ensureState();
      state.audit.push(clone(entry));
      atomicWriteJson(stateFile,state);
      fs.mkdirSync(path.dirname(auditFile),{recursive:true});
      fs.appendFileSync(auditFile,JSON.stringify(entry)+'\n');
      return {persisted:true};
    }
  };

  return Object.freeze({
    status:'READY',
    state:'CERTIFIED_CANONICAL_PROPERTY_STORE_ADAPTER_READY',
    adapter,
    descriptor:Object.freeze({
      canonicalStoreName:'SCIIP_CANONICAL_PROPERTY_STORE',
      provider:resolvedStorage.provider,
      filePath:resolvedStorage.filePath,
      bindingSha256:resolvedStorage.sha256,
      stateFile,
      receiptFile,
      auditFile,
      sixMethodContract:true
    })
  });
}
