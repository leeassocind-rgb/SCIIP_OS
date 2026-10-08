import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function clone(x){ return JSON.parse(JSON.stringify(x)); }
function atomicWriteJson(file,value){
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const tmp=file+".tmp-"+process.pid+"-"+Date.now();
  fs.writeFileSync(tmp,JSON.stringify(value,null,2)+"\n");
  fs.renameSync(tmp,file);
}
function readObjectStore(file){
  if(!fs.existsSync(file)) throw new Error("canonicalStorePath missing");
  const x=JSON.parse(fs.readFileSync(file,"utf8"));
  if(!x || typeof x!=="object" || Array.isArray(x)) throw new Error("canonical object store required");
  for(const k of ["identities","aliasLedger","events"]){
    if(!Array.isArray(x[k])) throw new Error("canonical object store missing array: "+k);
  }
  return x;
}
function sha256(x){ return crypto.createHash("sha256").update(String(x)).digest("hex"); }

export function buildGovernedCanonicalObjectStoreFirstInsertBridge({
  canonicalStorePath,
  authorizationToken=null
} = {}){
  if(!canonicalStorePath || typeof canonicalStorePath!=="string") throw new Error("canonicalStorePath required");

  function lookupBySourcePropertyId(sourcePropertyId){
    const s=readObjectStore(canonicalStorePath);
    const alias=s.aliasLedger.find(x=>x?.sourcePropertyId===sourcePropertyId);
    if(alias) return alias;
    const ev=s.events.find(x=>x?.sourcePropertyId===sourcePropertyId);
    return ev || null;
  }

  function lookupByCanonicalPropertyId(canonicalPropertyId){
    const s=readObjectStore(canonicalStorePath);
    const identity=s.identities.find(x=>x?.canonicalPropertyId===canonicalPropertyId);
    if(identity) return identity;
    const alias=s.aliasLedger.find(x=>x?.canonicalPropertyId===canonicalPropertyId);
    if(alias) return alias;
    const ev=s.events.find(x=>x?.canonicalPropertyId===canonicalPropertyId);
    return ev || null;
  }

  function preflightFirstInsert(input={}){
    const required=["canonicalPropertyId","sourcePropertyId","normalizedAddress","sourceProvenance","identityEvidence","authorityReference","derivationHash","idempotencyKey","observationTimestamp"];
    for(const k of required){
      if(input[k]===undefined || input[k]===null || input[k]==="") return {ready:false,state:"MISSING_"+k.toUpperCase()};
    }
    const s=readObjectStore(canonicalStorePath);
    const dupCanonical=[
      ...s.identities,
      ...s.aliasLedger,
      ...s.events
    ].find(x=>x?.canonicalPropertyId===input.canonicalPropertyId);
    if(dupCanonical) return {ready:false,state:"DUPLICATE_CANONICAL_PROPERTY_ID",existing:dupCanonical};

    const dupSource=[
      ...s.aliasLedger,
      ...s.events
    ].find(x=>x?.sourcePropertyId===input.sourcePropertyId);
    if(dupSource) return {ready:false,state:"DUPLICATE_SOURCE_PROPERTY_ID",existing:dupSource};

    return {
      ready:true,
      state:"OBJECT_STORE_FIRST_INSERT_PREFLIGHT_READY",
      canonicalPropertyId:input.canonicalPropertyId,
      sourcePropertyId:input.sourcePropertyId,
      idempotencyKey:input.idempotencyKey
    };
  }

  function atomicInsertCanonicalIdentity(input={}){
    const preflight=preflightFirstInsert(input);
    if(!preflight.ready) return {committed:false,...preflight};

    if(!authorizationToken){
      return {committed:false,state:"UNAUTHORIZED"};
    }

    const before=readObjectStore(canonicalStorePath);
    const next=clone(before);

    const identity={
      canonicalPropertyId:input.canonicalPropertyId,
      normalizedAddress:input.normalizedAddress,
      authorityReference:input.authorityReference,
      derivationHash:input.derivationHash,
      sourceProvenance:clone(input.sourceProvenance),
      identityEvidence:clone(input.identityEvidence),
      createdAt:input.observationTimestamp
    };
    const alias={
      sourcePropertyId:input.sourcePropertyId,
      canonicalPropertyId:input.canonicalPropertyId,
      normalizedAddress:input.normalizedAddress,
      authorityReference:input.authorityReference,
      idempotencyKey:input.idempotencyKey,
      createdAt:input.observationTimestamp
    };
    const event={
      eventType:"CANONICAL_IDENTITY_CREATED",
      canonicalPropertyId:input.canonicalPropertyId,
      sourcePropertyId:input.sourcePropertyId,
      normalizedAddress:input.normalizedAddress,
      idempotencyKey:input.idempotencyKey,
      observationTimestamp:input.observationTimestamp,
      authorityReference:input.authorityReference,
      derivationHash:input.derivationHash,
      sourceProvenance:clone(input.sourceProvenance),
      identityEvidence:clone(input.identityEvidence)
    };

    next.identities.push(identity);
    next.aliasLedger.push(alias);
    next.events.push(event);

    const backup=canonicalStorePath+".pre-first-insert.bak";
    fs.copyFileSync(canonicalStorePath,backup);
    atomicWriteJson(canonicalStorePath,next);

    const verified=readAfterWrite({
      canonicalPropertyId:input.canonicalPropertyId,
      sourcePropertyId:input.sourcePropertyId,
      idempotencyKey:input.idempotencyKey
    });

    if(!verified.verified){
      fs.copyFileSync(backup,canonicalStorePath);
      return {committed:false,state:"READ_AFTER_WRITE_FAILED_ROLLED_BACK",backup};
    }

    return {
      committed:true,
      state:"OBJECT_STORE_FIRST_INSERT_COMMITTED",
      canonicalPropertyId:input.canonicalPropertyId,
      sourcePropertyId:input.sourcePropertyId,
      idempotencyKey:input.idempotencyKey,
      backup,
      readAfterWriteVerified:true
    };
  }

  function readAfterWrite({canonicalPropertyId,sourcePropertyId,idempotencyKey}={}){
    const s=readObjectStore(canonicalStorePath);
    const identities=s.identities.filter(x=>x?.canonicalPropertyId===canonicalPropertyId);
    const aliases=s.aliasLedger.filter(x=>x?.canonicalPropertyId===canonicalPropertyId && x?.sourcePropertyId===sourcePropertyId);
    const events=s.events.filter(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED" && x?.canonicalPropertyId===canonicalPropertyId && x?.sourcePropertyId===sourcePropertyId && x?.idempotencyKey===idempotencyKey);
    return {
      verified:identities.length===1 && aliases.length===1 && events.length===1,
      identityCount:identities.length,
      aliasCount:aliases.length,
      eventCount:events.length,
      identity:identities[0]||null,
      alias:aliases[0]||null,
      event:events[0]||null
    };
  }

  return {
    contract:"GOVERNED_CANONICAL_OBJECT_STORE_FIRST_INSERT_BRIDGE_V1",
    lookupBySourcePropertyId,
    lookupByCanonicalPropertyId,
    preflightFirstInsert,
    atomicInsertCanonicalIdentity,
    readAfterWrite
  };
}
