// SCIIP Explorer 3.0 — M2.46
// Governed Property Intelligence Derived Runtime Synchronization
//
// Creates a read-only derived-runtime identity contract from the governed
// Property Intelligence presentation property. Consumers may use this identity
// to ensure spatial/live derived data is attached to the same governed property.

const freeze=x=>Object.freeze(x);

function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}

export function resolveGovernedPropertyIntelligenceDerivedRuntime(presentation,fallbackProperty=null){
  const property=presentation?.property||fallbackProperty||null;
  return freeze({
    status:property?'ACTIVE':'NO_SELECTION',
    milestone:'M2.46',
    property,
    propertyId:presentation?.propertyId||propertyIdOf(property),
    origin:presentation?.origin||'PROPERTY_INTELLIGENCE',
    mode:presentation?.mode||'market',
    invariants:freeze({
      presentationAuthoritative:true,
      derivedRuntimeSynchronized:true,
      spatialIdentitySynchronized:true,
      liveGovernedIntelligenceSynchronized:true,
      sourcePropertyMutation:false,
      sourceInventoryMutation:false,
      filterMutation:false,
      formulaMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}
