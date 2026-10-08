import fs from "node:fs";
import path from "node:path";

export function buildGovernedCanonicalFirstInsertProductionStoreAdapter({
  canonicalStorePath,
  eventLogPath,
  authorizationToken = null
} = {}) {
  if (!canonicalStorePath || !eventLogPath) throw new Error("canonicalStorePath and eventLogPath required");

  function readStore() {
    if (!fs.existsSync(canonicalStorePath)) return [];
    const x=JSON.parse(fs.readFileSync(canonicalStorePath,"utf8"));
    if (!Array.isArray(x)) throw new Error("canonical store must be an array");
    return x;
  }
  function readEvents() {
    if (!fs.existsSync(eventLogPath)) return [];
    const x=JSON.parse(fs.readFileSync(eventLogPath,"utf8"));
    if (!Array.isArray(x)) throw new Error("event log must be an array");
    return x;
  }
  function atomicWriteJson(file,value) {
    fs.mkdirSync(path.dirname(file),{recursive:true});
    const tmp=file+".tmp-"+process.pid+"-"+Date.now();
    fs.writeFileSync(tmp,JSON.stringify(value,null,2)+"\n");
    fs.renameSync(tmp,file);
  }
  function lookupBySourcePropertyId(sourcePropertyId) {
    return readStore().find(r=>r?.sourcePropertyId===sourcePropertyId) || null;
  }
  function lookupByCanonicalPropertyId(canonicalPropertyId) {
    return readStore().find(r=>r?.canonicalPropertyId===canonicalPropertyId) || null;
  }
  function atomicInsert(record,{requiredAuthorizationToken=null}={}) {
    if (!requiredAuthorizationToken || authorizationToken!==requiredAuthorizationToken)
      return {committed:false,state:"UNAUTHORIZED"};
    const store=readStore(), events=readEvents();
    if (store.some(r=>r?.canonicalPropertyId===record.canonicalPropertyId))
      return {committed:false,state:"DUPLICATE_CANONICAL_PROPERTY_ID"};
    if (store.some(r=>r?.sourcePropertyId===record.sourcePropertyId))
      return {committed:false,state:"DUPLICATE_SOURCE_PROPERTY_ID"};
    if (events.some(e=>e?.idempotencyKey===record.idempotencyKey))
      return {committed:false,state:"DUPLICATE_IDEMPOTENCY_KEY"};
    if (record.eventType!=="CANONICAL_IDENTITY_CREATED")
      return {committed:false,state:"INVALID_CREATION_EVENT_TYPE"};

    const nextRecord={...record};
    const event={
      eventType:"CANONICAL_IDENTITY_CREATED",
      canonicalPropertyId:record.canonicalPropertyId,
      sourcePropertyId:record.sourcePropertyId,
      normalizedAddress:record.normalizedAddress,
      idempotencyKey:record.idempotencyKey
    };
    // Isolated certification implementation: write store and event atomically per file.
    // Production execution remains separately gated and unauthorized.
    atomicWriteJson(canonicalStorePath,[...store,nextRecord]);
    atomicWriteJson(eventLogPath,[...events,event]);
    return {committed:true,state:"PRODUCTION_STORE_ADAPTER_FIRST_INSERT_COMMITTED",canonicalPropertyId:record.canonicalPropertyId};
  }
  function readAfterWrite({canonicalPropertyId,sourcePropertyId,idempotencyKey}) {
    const rec=lookupByCanonicalPropertyId(canonicalPropertyId);
    const ev=readEvents().find(e=>e?.idempotencyKey===idempotencyKey) || null;
    return {
      verified:!!rec && !!ev &&
        rec.sourcePropertyId===sourcePropertyId &&
        rec.idempotencyKey===idempotencyKey &&
        ev.canonicalPropertyId===canonicalPropertyId &&
        ev.sourcePropertyId===sourcePropertyId &&
        ev.eventType==="CANONICAL_IDENTITY_CREATED",
      record:rec,event:ev
    };
  }
  return {lookupBySourcePropertyId,lookupByCanonicalPropertyId,atomicInsert,readAfterWrite};
}
