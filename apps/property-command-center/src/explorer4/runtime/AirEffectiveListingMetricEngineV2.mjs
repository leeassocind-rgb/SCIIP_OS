export const CONTRACT = "SCIIP_EFFECTIVE_LISTING_METRIC_ENGINE_V2";

function numeric(v){
  if(typeof v==="number" && Number.isFinite(v)) return v;
  if(v===null||v===undefined) return null;
  const m=String(v).replaceAll(",","").replaceAll("$","").match(/[-+]?\d+(?:\.\d+)?/);
  return m?Number(m[0]):null;
}
function rateBasis(v){
  const u=String(v??"").toUpperCase();
  if(u.includes("NNN")) return "NNN";
  if(u.includes("FSG")) return "FSG";
  if(/(^|\s)G($|\s)/.test(u)||u.includes("GROSS")) return "GROSS";
  return "UNSPECIFIED";
}
export function describeAirEffectiveListingMetricEngineV2(){
 return Object.freeze({
  contract:CONTRACT,readOnly:true,lifecycleAware:true,
  staleRateExclusionRequired:true,crossScopeAggregationForbidden:true,
  grossListingObservationAvailableSfIsNotVacancyNumerator:true,
  uiPublicationAuthorized:false
 });
}
export function computeEffectiveListingMetrics({lifecycleView, staleRateObservationIds=[]}){
 const listings=lifecycleView?.activeListings||[];
 if(listings.length!==700) throw new Error(`ACTIVE_LISTING_COUNT_MISMATCH:${listings.length}`);
 const stale=new Set(staleRateObservationIds);
 let available=0,availableNumeric=0;
 const leaseBasis={NNN:0,GROSS:0,FSG:0,UNSPECIFIED:0};
 const leaseUnknown={TBD:0,NFL:0,MISSING:0,OTHER:0};
 const sale={numeric:0,TBD:0,NFS:0,MISSING:0,OTHER:0};
 let staleExcluded=0;
 for(const l of listings){
  const p=l.payload||{};
  const av=numeric(p.availableSf);if(av!==null){available+=av;availableNumeric++;}
  if(l.sourceScope==="LEASE"){
    if(stale.has(l.listingCarrierId)){staleExcluded++;continue;}
    const raw=p.leaseRate;
    const n=numeric(raw);
    if(n!==null) leaseBasis[rateBasis(raw)]++;
    else {
      const k=String(raw??"").trim().toUpperCase();
      if(k==="TBD")leaseUnknown.TBD++;else if(k==="NFL")leaseUnknown.NFL++;else if(!k)leaseUnknown.MISSING++;else leaseUnknown.OTHER++;
    }
  }
  if(l.sourceScope==="SALE"){
    const raw=p.listPrice,n=numeric(raw);
    if(n!==null)sale.numeric++;
    else {const k=String(raw??"").trim().toUpperCase();if(k==="TBD")sale.TBD++;else if(k==="NFS")sale.NFS++;else if(!k)sale.MISSING++;else sale.OTHER++;}
  }
 }
 return Object.freeze({
  contract:CONTRACT,asOf:lifecycleView.asOf,activeListingCount:listings.length,
  availableSfNumericListingCount:availableNumeric,grossListingObservationAvailableSf:available,
  leaseRateNumericCountsByBasis:Object.freeze(leaseBasis),leaseRateUnknownCounts:Object.freeze(leaseUnknown),
  staleLeaseRateExcludedCount:staleExcluded,salePriceCounts:Object.freeze(sale),
  readOnly:true,uiPublicationAuthorized:false
 });
}
