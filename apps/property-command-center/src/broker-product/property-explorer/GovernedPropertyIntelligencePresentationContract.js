// SCIIP Explorer 3.0 — M2.45 corrected
const freeze=x=>Object.freeze(x);

function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}

export function buildGovernedPropertyIntelligencePresentation(selection,fallbackProperty=null){
  const property=selection?.property||fallbackProperty||null;
  return freeze({
    status:property?'ACTIVE':'NO_SELECTION',
    milestone:'M2.45',
    property,
    propertyId:selection?.propertyId||propertyIdOf(property),
    address:property?.address||property?.name||'Selected Property',
    origin:selection?.origin||'SELECTED_PROPERTY',
    metricId:selection?.metricId||null,
    mode:selection?.mode||'market',
    invariants:freeze({
      governedSelectionAuthoritative:true,
      headerBodyIdentityUnified:true,
      propertyIntelligenceReadOnly:true,
      sourcePropertyMutation:false,
      sourceInventoryMutation:false,
      filterMutation:false,
      formulaMutation:false,
      eventStoreMutation:false,
      automaticCanonicalWrites:false
    })
  });
}
