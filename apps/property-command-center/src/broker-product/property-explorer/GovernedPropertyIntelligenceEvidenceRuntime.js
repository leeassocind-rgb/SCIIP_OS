// SCIIP Explorer 3.0 — M2.47
// Governed Property Intelligence Evidence Runtime Synchronization
//
// Normalizes the evidence-facing presentation identity to the same governed
// Property Intelligence runtime property established by M2.46.
//
// Evidence, acquisition, promotion, and canonical execution engines remain
// separate governed systems and are not mutated here.

const freeze=x=>Object.freeze(x);

function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}

export function resolveGovernedPropertyIntelligenceEvidenceRuntime({
  property,
  governedConsumerRuntime=null,
  liveGovernedIntelligence=null,
  governedEvidence=null
}={}){
  const runtimeProperty=
    governedConsumerRuntime?.property||
    governedConsumerRuntime?.effectiveProperty||
    property||
    null;

  return freeze({
    ...(governedEvidence||{}),
    status:'ACTIVE',
    milestone:'M2.47',
    property:runtimeProperty,
    propertyId:propertyIdOf(runtimeProperty),
    governedConsumerRuntime,
    liveGovernedIntelligence,
    invariants:freeze({
      governedPropertyIdentityAuthoritative:true,
      evidencePresentationSynchronized:true,
      evidenceEngineMutation:false,
      acquisitionEngineMutation:false,
      promotionEngineMutation:false,
      canonicalExecutionMutation:false,
      sourceInventoryMutation:false,
      filterMutation:false,
      formulaMutation:false,
      automaticCanonicalWrites:false
    })
  });
}
