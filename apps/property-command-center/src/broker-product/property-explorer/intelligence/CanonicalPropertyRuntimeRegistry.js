// SCIIP Explorer 3.0 — M2.21g.2
// Read-only canonical runtime bridge between the property metric rail and
// downstream intelligence/governance consumers.
//
// This registry does NOT write canonical data. It only publishes the already
// selected property runtime values that Explorer itself is rendering.

const REGISTRY_KEY='__SCIIP_CANONICAL_PROPERTY_RUNTIME_REGISTRY__';

function registry(){
  if(!globalThis[REGISTRY_KEY]){
    Object.defineProperty(globalThis,REGISTRY_KEY,{
      value:new Map(),
      configurable:false,
      enumerable:false,
      writable:false
    });
  }
  return globalThis[REGISTRY_KEY];
}

function present(v){
  return !(v===null||v===undefined||v==='');
}

function normalizeAddress(v){
  return String(v??'').trim().toLowerCase().replace(/\s+/g,' ');
}

function identityCandidates(property={}){
  return [
    property?.id,
    property?.propertyId,
    property?.canonicalPropertyId,
    property?.parcelId,
    property?.apn,
    normalizeAddress(property?.address),
    normalizeAddress(property?.streetAddress)
  ].filter(present).map(String);
}

export function publishCanonicalPropertyRuntime(property,snapshot){
  if(!property||typeof property!=='object'||!snapshot||typeof snapshot!=='object')return null;

  const record=Object.freeze({
    property:Object.freeze({...property}),
    snapshot:Object.freeze({...snapshot}),
    publishedAt:Date.now()
  });

  for(const key of identityCandidates(property)){
    registry().set(key,record);
  }

  return record;
}

export function readCanonicalPropertyRuntime(property){
  for(const key of identityCandidates(property||{})){
    const hit=registry().get(key);
    if(hit)return hit;
  }
  return null;
}

export function clearCanonicalPropertyRuntimeRegistryForTests(){
  registry().clear();
}
