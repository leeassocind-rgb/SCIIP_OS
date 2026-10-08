import{useMemo}from'react';
import{useLightBoxParcelEnrichment}from'./useLightBoxParcelEnrichment.js';
import{buildLiveGovernedPropertyIntelligence}from'../../intelligence/LiveGovernedPropertyIntelligence.js';
import{reconcileParcelIdentity}from'../../intelligence/ParcelIdentityReconciliation.js';

export function useLiveGovernedPropertyIntelligence(property){
  const parcelState=useLightBoxParcelEnrichment(property);
  const model=useMemo(
    ()=>reconcileParcelIdentity(property,parcelState,buildLiveGovernedPropertyIntelligence(property,parcelState)),
    [property,parcelState]
  );
  return{parcelState,model};
}
