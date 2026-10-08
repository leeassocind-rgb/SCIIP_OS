const CONTRACT = "SCIIP_EFFECTIVE_LISTING_METRIC_ENGINE_V1";

function arr(v){ return v==null?[]:(Array.isArray(v)?v:[v]); }
function clone(v){ return JSON.parse(JSON.stringify(v)); }

function parseNumericLiteral(v) {
  if (v == null) return {kind:"BLANK_UNKNOWN",value:null,raw:v};
  const s=String(v).trim();
  if (!s) return {kind:"BLANK_UNKNOWN",value:null,raw:v};
  const u=s.toUpperCase();
  if (["TBD","NFL","NFS"].includes(u)) return {kind:"SOURCE_SENTINEL_UNKNOWN",value:null,raw:v};
  const m=s.replaceAll(",","").replaceAll("$","").match(/[-+]?\d+(?:\.\d+)?/);
  if (!m) return {kind:"UNPARSEABLE_QUARANTINED",value:null,raw:v};
  return {kind:"PARSED_NUMERIC",value:Number(m[0]),raw:v};
}

function rateBasis(v) {
  const s=String(v??"").toUpperCase();
  if (s.includes("NNN")) return "NNN";
  if (s.includes("FSG")) return "FSG";
  if (s.includes("GROSS") || /(^|\s)G($|\s)/.test(s)) return "GROSS";
  return "UNSPECIFIED";
}

export function describeAirEffectiveListingMetricEngine(){
  return Object.freeze({
    contract:CONTRACT,
    inputProjectorContract:"SCIIP_EFFECTIVE_CURRENT_MARKET_STATE_PROJECTOR_V2",
    metricLevel:"LISTING_OBSERVATION",
    scopeSeparated:true,
    readOnly:true,
    uiPublicationAuthorized:false,
    vacancyRatePublicationAuthorized:false,
    availabilityRatePublicationAuthorized:false,
    absorptionPublicationAuthorized:false,
    leasingVelocityPublicationAuthorized:false
  });
}

export function computeAirEffectiveListingMetricDiagnostics({effectiveState,source0831}) {
  if (!effectiveState || effectiveState.contract!=="SCIIP_EFFECTIVE_CURRENT_MARKET_STATE_PROJECTOR_V2")
    throw new Error("listing metric engine projector contract mismatch");
  if (effectiveState.effectiveActiveIdentityStateCount!==576)
    throw new Error("listing metric engine active identity count mismatch");

  const observations=[];
  for (const s of effectiveState.activeIdentityStates||[]) {
    for (const r of s.fullFidelityObservations||[]) observations.push(r);
  }
  if (observations.length!==696) throw new Error(`expected 696 anchor listing observations, got ${observations.length}`);

  const scopeCounts={LEASE:0,SALE:0};
  const available=[];
  const leaseRate={NNN:[],GROSS:[],FSG:[],UNSPECIFIED:[]};
  const leaseUnknown={};
  const salePrices=[];
  const saleUnknown={};

  for (const r of observations) {
    const scope=r.sourceScope;
    if (!(scope in scopeCounts)) throw new Error(`unknown source scope ${scope}`);
    scopeCounts[scope]++;
    const p=r.payload||{};
    const a=parseNumericLiteral(p.availableSf);
    if (a.kind==="PARSED_NUMERIC") available.push(a.value);

    if (scope==="LEASE") {
      const pr=parseNumericLiteral(p.leaseRate);
      if (pr.kind==="PARSED_NUMERIC") leaseRate[rateBasis(p.leaseRate)].push(pr.value);
      else leaseUnknown[String(p.leaseRate??"BLANK").toUpperCase()] = (leaseUnknown[String(p.leaseRate??"BLANK").toUpperCase()]||0)+1;
    }
    if (scope==="SALE") {
      const pp=parseNumericLiteral(p.listPrice);
      if (pp.kind==="PARSED_NUMERIC") salePrices.push(pp.value);
      else saleUnknown[String(p.listPrice??"BLANK").toUpperCase()] = (saleUnknown[String(p.listPrice??"BLANK").toUpperCase()]||0)+1;
    }
  }
  if (scopeCounts.LEASE!==445 || scopeCounts.SALE!==251)
    throw new Error(`scope parity mismatch ${JSON.stringify(scopeCounts)}`);

  const ev=source0831?.events||[];
  if (ev.length!==60) throw new Error("8/31 source observation count mismatch");
  const num=v=>{
    if(v==null)return null;
    const m=String(v).replaceAll(",","").replaceAll("$","").match(/[-+]?\d+(?:\.\d+)?/);
    return m?Number(m[0]):null;
  };
  const inScope=ev.filter(x=>{const b=num(x.buildingSf);return b!=null && b>=50000;});
  const rateEvents=inScope.filter(x=>arr(x.eventFamilies).includes("RATE_CHANGE"));
  if (inScope.length!==6) throw new Error(`8/31 >=50k scope mismatch ${inScope.length}`);
  if (rateEvents.length!==1) throw new Error(`8/31 in-scope rate-change mismatch ${rateEvents.length}`);

  return Object.freeze({
    contract:CONTRACT,
    asOf:"2026-09-01",
    readOnly:true,
    sourceCoverage:{
      anchorListingObservationCount:696,
      anchorLeaseObservationCount:445,
      anchorSaleObservationCount:251,
      incrementalSourceObservationCount:60,
      incrementalInScopeObservationCount:6
    },
    diagnostics:{
      availableSfNumericObservationCount:available.length,
      availableSfRawAnchorSumDiagnostic:available.reduce((a,b)=>a+b,0),
      leaseRateNumericCountsByBasis:Object.fromEntries(Object.entries(leaseRate).map(([k,v])=>[k,v.length])),
      leaseRateUnknownLiteralCounts:leaseUnknown,
      salePriceNumericObservationCount:salePrices.length,
      salePriceUnknownLiteralCounts:saleUnknown,
      inScope0831UnresolvedRateChangeEventCount:1
    },
    publicationReadiness:{
      sourceCountsAndFreshness:true,
      identityConfidenceCoverage:true,
      activeListingCount:"BLOCKED_PENDING_EFFECTIVE_LISTING_LIFECYCLE_APPLICATION",
      availableSf:"BLOCKED_PENDING_EFFECTIVE_LISTING_LIFECYCLE_APPLICATION",
      askingLeaseRate:"BLOCKED_PENDING_EVENT_ONLY_RATE_STALENESS_APPLICATION",
      askingSalePrice:"BLOCKED_PENDING_EFFECTIVE_LISTING_LIFECYCLE_APPLICATION",
      vacancyRate:"BLOCKED_CERTIFIED_EXISTING_COMPETITIVE_STOCK_DENOMINATOR_REQUIRED",
      availabilityRate:"BLOCKED_CERTIFIED_EXISTING_COMPETITIVE_STOCK_DENOMINATOR_REQUIRED",
      absorption:"BLOCKED_HISTORICAL_RECONSTRUCTION_REQUIRED",
      leasingVelocity:"BLOCKED_HISTORICAL_EXPLICIT_EVENT_SERIES_REQUIRED"
    },
    safeguards:{
      rawAnchorSumsAreDiagnosticsNotPublishedEffectiveMetrics:true,
      eventCarrierExcludedFromActiveListingMetrics:true,
      missingNeverBecomesZero:true,
      leaseSaleScopesSeparated:true,
      unresolvedRateChangeMustBeStaleOrUnknown:true
    }
  });
}

export default computeAirEffectiveListingMetricDiagnostics;
