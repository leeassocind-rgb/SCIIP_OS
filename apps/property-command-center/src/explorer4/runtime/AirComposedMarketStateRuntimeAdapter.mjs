const CONTRACT = "SCIIP_AIR_MARKET_STATE_COMPOSED_RUNTIME_V1";

const DEFAULT_PATHS = Object.freeze({
  anchorState: "/explorer/air-market-state-v1/current-state-anchor.json",
  fullFidelity: "/explorer/air-market-state-v1/full-fidelity/2026-08-28/anchor-market-payload.json",
  incrementalDelta: "/explorer/air-market-state-v1/incremental/2026-08-31/derived-state-delta.json",
  incrementalEvents: "/explorer/air-market-state-v1/incremental/2026-08-31/source-observations.json",
  incrementalIdentityDelta: "/explorer/air-market-state-v1/incremental/2026-08-31/noncanonical-identity-delta.json"
});

async function readJson(path, fetchImpl) {
  const response = await fetchImpl(path, { cache: "no-store" });
  if (!response || !response.ok) {
    throw new Error(`SCIIP composed runtime failed to load ${path}: ${response?.status ?? "NO_RESPONSE"}`);
  }
  return response.json();
}

function validateInputs(anchorState, fullFidelity, incrementalDelta, incrementalEvents, incrementalIdentityDelta) {
  const anchorCount = anchorState?.derivedStateCount ??
    (Array.isArray(anchorState?.states) ? anchorState.states.length :
      (Array.isArray(anchorState?.currentStates) ? anchorState.currentStates.length : null));

  if (anchorState?.anchorId !== "AIR_BASELINE_2026_08_28_V1") throw new Error("SCIIP composed runtime anchorId mismatch");
  if (anchorCount !== 572) throw new Error(`SCIIP composed runtime anchor state count mismatch: ${anchorCount}`);
  if (fullFidelity?.contract !== "SCIIP_AIR_082826_FULL_FIDELITY_MARKET_PAYLOAD_V1") throw new Error("SCIIP full-fidelity contract mismatch");
  if (fullFidelity?.observationCount !== 696 || !Array.isArray(fullFidelity?.records) || fullFidelity.records.length !== 696) throw new Error("SCIIP full-fidelity count mismatch");
  if (incrementalDelta?.contract !== "SCIIP_AIR_083126_DERIVED_STATE_DELTA_V1") throw new Error("SCIIP incremental delta contract mismatch");
  if (incrementalDelta?.appliedDerivedDeltaCount !== 5 || !Array.isArray(incrementalDelta?.deltas) || incrementalDelta.deltas.length !== 5) throw new Error("SCIIP incremental delta count mismatch");
  if (incrementalEvents?.sourceObservationCount !== 60 || !Array.isArray(incrementalEvents?.events) || incrementalEvents.events.length !== 60) throw new Error("SCIIP incremental event count mismatch");
  if (incrementalIdentityDelta?.identityCount !== 1) throw new Error("SCIIP incremental identity delta count mismatch");
}

export function describeAirComposedMarketStateRuntime() {
  return Object.freeze({
    contract: CONTRACT,
    anchorId: "AIR_BASELINE_2026_08_28_V1",
    anchorAsOf: "2026-08-28",
    latestObservationDate: "2026-08-31",
    readOnly: true,
    fullFidelityEnabled: true,
    orderedIncrementalComposition: true,
    lightBoxRequired: false,
    externalPropertyApiRequired: false,
    statisticsAndUiMarketMetricPublicationAuthorized: false,
    paths: DEFAULT_PATHS
  });
}

export async function loadAirComposedMarketStateRuntime(options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") throw new Error("SCIIP composed runtime requires fetch");

  const paths = { ...DEFAULT_PATHS, ...(options.paths || {}) };
  const [anchorState, fullFidelity, incrementalDelta, incrementalEvents, incrementalIdentityDelta] =
    await Promise.all([
      readJson(paths.anchorState, fetchImpl),
      readJson(paths.fullFidelity, fetchImpl),
      readJson(paths.incrementalDelta, fetchImpl),
      readJson(paths.incrementalEvents, fetchImpl),
      readJson(paths.incrementalIdentityDelta, fetchImpl)
    ]);

  validateInputs(anchorState, fullFidelity, incrementalDelta, incrementalEvents, incrementalIdentityDelta);

  return Object.freeze({
    contract: CONTRACT,
    anchorId: "AIR_BASELINE_2026_08_28_V1",
    anchorAsOf: "2026-08-28",
    latestObservationDate: "2026-08-31",
    readOnly: true,
    anchorState,
    fullFidelity,
    incremental: Object.freeze({
      partitions: Object.freeze(["2026-08-31"]),
      sourceObservations: incrementalEvents,
      derivedStateDelta: incrementalDelta,
      noncanonicalIdentityDelta: incrementalIdentityDelta
    }),
    semantics: Object.freeze({
      compositionOrder: Object.freeze(["2026-08-28 anchor", "2026-08-28 full-fidelity", "2026-08-31 delta"]),
      eventOnlyRowsDoNotInventStateFields: true,
      outOfScopeEvidenceOnlyRowsDoNotEnterCertifiedGe50000CurrentState: true,
      missingAvailabilityDoesNotMeanZero: true,
      missingRateDoesNotMeanZero: true,
      absenceDoesNotMeanLease: true,
      buildingWideLeaseInference: false,
      canonicalIdentityMutation: false,
      baseInventoryMutation: false
    })
  });
}

export default loadAirComposedMarketStateRuntime;
