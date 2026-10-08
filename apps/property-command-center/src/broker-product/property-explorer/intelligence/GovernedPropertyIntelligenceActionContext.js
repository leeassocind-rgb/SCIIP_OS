// SCIIP Explorer 3.0 — M2.48
// Governed Property Intelligence Action Synchronization
//
// One read-only identity/context boundary for acquisition + evidence actions.
// This contract never performs acquisition, evidence, promotion, or canonical writes.

const freeze=x=>Object.freeze(x);

function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}

export function resolveGovernedPropertyIntelligenceActionContext({
  property,
  gaps=[],
  source='PROPERTY_INTELLIGENCE'
}={}){
  const normalizedGaps=Array.isArray(gaps)?gaps:[];
  return freeze({
    status:property?'ACTIVE':'NO_SELECTION',
    milestone:'M2.48',
    property,
    propertyId:propertyIdOf(property),
    gaps:freeze(normalizedGaps),
    source,
    invariants:freeze({
      governedPropertyIdentityAuthoritative:true,
      acquisitionPropertyGoverned:true,
      evidencePropertyGoverned:true,
      requestIdentitySynchronized:true,
      evidenceReviewIdentitySynchronized:true,
      verificationIdentitySynchronized:true,
      promotionIdentitySynchronized:true,
      acquisitionEngineMutation:false,
      evidenceEngineMutation:false,
      promotionEngineMutation:false,
      canonicalExecutionMutation:false,
      automaticCanonicalWrites:false
    })
  });
}
