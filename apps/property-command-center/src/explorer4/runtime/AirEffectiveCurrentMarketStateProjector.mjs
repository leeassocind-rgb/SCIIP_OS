const CONTRACT = "SCIIP_EFFECTIVE_CURRENT_MARKET_STATE_PROJECTOR_V2";

function asArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function stableEventOrder(a,b) {
  const da=String(a?.observationDate ?? "");
  const db=String(b?.observationDate ?? "");
  if (da<db) return -1;
  if (da>db) return 1;
  return String(a?.eventId ?? "").localeCompare(String(b?.eventId ?? ""));
}

function buildFullFidelityMap(fullFidelity) {
  if (!fullFidelity || fullFidelity.contract !== "SCIIP_AIR_082826_FULL_FIDELITY_MARKET_PAYLOAD_V1") {
    throw new Error("SCIIP effective projector full-fidelity contract mismatch");
  }
  if (fullFidelity.observationCount !== 696 || !Array.isArray(fullFidelity.records) || fullFidelity.records.length !== 696) {
    throw new Error("SCIIP effective projector full-fidelity count mismatch");
  }
  const m=new Map();
  for (const r of fullFidelity.records) {
    if (!r?.observationId) throw new Error("SCIIP effective projector missing observationId");
    if (m.has(r.observationId)) throw new Error(`SCIIP effective projector duplicate observationId ${r.observationId}`);
    m.set(r.observationId,r);
  }
  return m;
}

export function describeAirEffectiveCurrentMarketStateProjector() {
  return Object.freeze({
    contract: CONTRACT,
    baseStateLevel: "IDENTITY",
    fullFidelityJoin: "identityRef state -> leaseObservationIds/saleObservationIds -> observationId",
    stateClasses: Object.freeze(["ACTIVE_IDENTITY_STATE","NONACTIVE_SOURCE_BACKED_EVENT_CARRIER"]),
    latestCertifiedObservationDate: "2026-09-01",
    readOnly: true,
    listingMarketMetricPublicationAuthorized: false,
    vacancyRatePublicationAuthorized: false,
    availabilityRatePublicationAuthorized: false,
    lightBoxRequired: false
  });
}

export function projectAirEffectiveCurrentMarketState(input) {
  const {anchorState,fullFidelity,incrementalDelta,incrementalIdentityDelta}=input||{};
  const anchorStates=anchorState?.states ?? anchorState?.currentStates;
  if (!Array.isArray(anchorStates) || anchorStates.length !== 572) {
    throw new Error(`SCIIP effective projector anchor state count mismatch: ${anchorStates?.length ?? "NONE"}`);
  }
  if (!incrementalDelta || incrementalDelta.appliedDerivedDeltaCount !== 5 || !Array.isArray(incrementalDelta.deltas) || incrementalDelta.deltas.length !== 5) {
    throw new Error("SCIIP effective projector incremental delta mismatch");
  }

  const ff=buildFullFidelityMap(fullFidelity);
  const active=new Map();
  const ownedObs=new Map();

  for (const s0 of anchorStates) {
    const s=clone(s0);
    const iid=s.identityRef;
    if (!iid || active.has(iid)) throw new Error(`SCIIP effective projector invalid/duplicate anchor identity ${iid}`);
    const leaseIds=asArray(s.leaseObservationIds);
    const saleIds=asArray(s.saleObservationIds);
    const observations=[];
    for (const [scope,oid] of [...leaseIds.map(x=>["LEASE",x]),...saleIds.map(x=>["SALE",x])]) {
      const r=ff.get(oid);
      if (!r) throw new Error(`SCIIP effective projector missing full-fidelity observation ${oid}`);
      if (r.sourceScope !== scope) throw new Error(`SCIIP effective projector source-scope mismatch ${oid}`);
      if (ownedObs.has(oid)) throw new Error(`SCIIP effective projector observation referenced by multiple states ${oid}`);
      ownedObs.set(oid,iid);
      observations.push(clone(r));
    }
    s.fullFidelityObservations=observations;
    s.incrementalOverlays=[];
    s.stateClass="ACTIVE_IDENTITY_STATE";
    active.set(iid,s);
  }
  if (ownedObs.size !== 696) throw new Error(`SCIIP effective projector incomplete observation linkage: ${ownedObs.size}`);

  const identityRows=incrementalIdentityDelta?.identities ?? incrementalIdentityDelta?.records ?? [];
  const identityMap=new Map(identityRows.filter(x=>x?.identityRef).map(x=>[x.identityRef,x]));
  const carriers=new Map();

  for (const z0 of [...incrementalDelta.deltas].sort(stableEventOrder)) {
    const z=clone(z0);
    const iid=z.identityRef;
    const fam=new Set(asArray(z.eventFamilies));

    if (active.has(iid)) {
      active.get(iid).incrementalOverlays.push(z);
      active.get(iid).asOf=z.observationDate;
      continue;
    }

    if (fam.has("NEWLY_AVAILABLE")) {
      active.set(iid,{
        identityRef:iid,
        asOf:z.observationDate,
        stateClass:"POST_ANCHOR_ACTIVE_IDENTITY_STATE",
        stateOrigin:"EXPLICIT_NEWLY_AVAILABLE",
        marketStatuses:[],
        leaseObservationIds:[],
        saleObservationIds:[],
        fullFidelityObservations:[],
        incrementalOverlays:[z]
      });
      continue;
    }

    if (fam.has("LEASE") &&
        z.listingLevelLeaseOnly === true &&
        z.buildingWideUnavailableInference === false &&
        identityMap.has(iid)) {
      carriers.set(iid,{
        identityRef:iid,
        asOf:z.observationDate,
        stateClass:"NONACTIVE_SOURCE_BACKED_EVENT_CARRIER",
        identityEvidence:clone(identityMap.get(iid)),
        eventOverlays:[z],
        activeMarketListingClaim:false,
        buildingWideUnavailableClaim:false,
        availableSfZeroClaim:false
      });
      continue;
    }

    throw new Error(`SCIIP effective projector unresolved delta target ${z.eventId ?? "NO_EVENT_ID"} ${iid ?? "NO_IDENTITY"}`);
  }

  return Object.freeze({
    contract: CONTRACT,
    asOf:"2026-09-01",
    readOnly:true,
    anchorIdentityStateCount:572,
    effectiveActiveIdentityStateCount:active.size,
    nonactiveEventCarrierStateCount:carriers.size,
    linkedFullFidelityObservationCount:ownedObs.size,
    appliedIncrementalDeltaCount:5,
    activeIdentityStates:Object.freeze([...active.values()]),
    nonactiveEventCarrierStates:Object.freeze([...carriers.values()]),
    semantics:Object.freeze({
      activeAndEventCarrierStatesSeparated:true,
      leaseSaleScopesRemainDistinct:true,
      eventCarrierExcludedFromActiveListingMetrics:true,
      eventOnlyChangesDoNotInventValues:true,
      missingNeverBecomesZero:true,
      listingLevelLeaseDoesNotCloseWholeBuilding:true,
      canonicalIdentityMutation:false,
      baseInventoryMutation:false
    })
  });
}

export default projectAirEffectiveCurrentMarketState;
