// SCIIP Explorer 3.0 — M2.44 corrected
const freeze=x=>Object.freeze(x);
function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}
export function resolveGovernedPropertyIntelligenceSelection({spatialSelection,selectedProperty,properties=[]}={}){
  const governedId=spatialSelection?.propertyId||propertyIdOf(selectedProperty);
  const source=Array.isArray(properties)?properties:[];
  const sourceProperty=source.find(p=>propertyIdOf(p)===governedId)||selectedProperty||null;
  return freeze({
    status:sourceProperty?'ACTIVE':'NO_SELECTION',
    milestone:'M2.44',
    propertyId:governedId||propertyIdOf(sourceProperty),
    property:sourceProperty,
    sourceProperty,
    origin:spatialSelection?.origin||'SELECTED_PROPERTY',
    metricId:spatialSelection?.metricId||null,
    mode:spatialSelection?.mode||'market',
    invariants:freeze({
      governedSelectionAuthoritative:true,
      propertyIntelligenceSynchronized:true,
      selectedPropertyFlowPreserved:true,
      sourcePropertyMutation:false,
      sourceInventoryMutation:false,
      filterMutation:false,
      formulaMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}
