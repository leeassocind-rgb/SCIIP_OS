export const CONTRACT = "SCIIP_EFFECTIVE_LISTING_LIFECYCLE_PROJECTOR_V1";
const clone=v=>JSON.parse(JSON.stringify(v));
export function describeAirEffectiveListingLifecycleProjector(){
 return Object.freeze({
  contract:CONTRACT,inputProjectorContract:"SCIIP_EFFECTIVE_CURRENT_MARKET_STATE_PROJECTOR_V2",
  metricEngineContract:"SCIIP_EFFECTIVE_LISTING_METRIC_ENGINE_V1",readOnly:true,
  sourceObservationsImmutable:true,missingNeverBecomesZero:true,
  listingLevelLeaseDoesNotCloseWholeBuilding:true,
  unresolvedRateChangeDisposition:"STALE_UNKNOWN_FOR_CURRENT_ASKING_RATE_METRIC",
  uiPublicationAuthorized:false
 });
}
export function projectEffectiveListingLifecycle({fullFidelity,source0831}){
 const anchor=(fullFidelity?.records||[]).map(r=>({
  listingCarrierId:r.observationId,sourceScope:r.sourceScope,origin:"AIR_BASELINE_2026_08_28",
  active:true,observationDate:"2026-08-28",payload:clone(r.payload||{}),
  rateStatus:"SOURCE_CURRENT_AS_OF_ANCHOR"
 }));
 const events=(source0831?.events||[]).filter(e=>Number(e.buildingSf)>=50000);
 const newly=events.filter(e=>(e.eventFamilies||[]).includes("NEWLY_AVAILABLE"));
 const leases=events.filter(e=>(e.eventFamilies||[]).includes("LEASE"));
 const rates=events.filter(e=>(e.eventFamilies||[]).includes("RATE_CHANGE"));
 if(anchor.length!==696||newly.length!==4||leases.length!==1||rates.length!==1) throw new Error("LIFECYCLE_INPUT_CARDINALITY_MISMATCH");
 const additions=newly.map(e=>({
  listingCarrierId:`AIRLIST-${String(e.eventId).replace("AIREVT-","")}`,identityRef:e.identityRef,
  sourceScope:"UNKNOWN_SOURCE_SCOPE_POST_ANCHOR",origin:"AIR_SUPERSHEET_2026_08_31_NEWLY_AVAILABLE",
  active:true,observationDate:e.observationDate,
  payload:{address:e.address??null,city:e.city??null,postalCode:e.postalCode??null,buildingSf:e.buildingSf??null,availableSf:e.availableSf??null},
  rateStatus:"UNKNOWN_UNLESS_EXPLICIT_SOURCE_VALUE_CERTIFIED"
 }));
 const activeListings=[...anchor,...additions];
 if(activeListings.length!==700||new Set(activeListings.map(x=>x.listingCarrierId)).size!==700) throw new Error("ACTIVE_LISTING_CARRIER_CERTIFICATION_FAILED");
 return Object.freeze({contract:CONTRACT,asOf:"2026-09-01",activeListings:Object.freeze(activeListings),
  activeListingCount:700,nonactiveListingEventCarrierCount:1,unresolvedRateChangeCount:1,
  rateChangeDisposition:"STALE_UNKNOWN_FOR_CURRENT_ASKING_RATE_METRIC",
  sourceObservationsImmutable:true,readOnly:true,uiPublicationAuthorized:false});
}
