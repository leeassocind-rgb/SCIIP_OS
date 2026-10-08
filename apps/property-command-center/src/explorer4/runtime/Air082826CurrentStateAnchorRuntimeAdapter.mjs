// SCIIP AIR 08/28/2026 current-state anchor runtime adapter.
// Browser-safe, read-only, no external API dependency.

const BASE = "/explorer/air-market-state-v1";

function invariant(condition, message) {
  if (!condition) throw new Error(`SCIIP_AIR_ANCHOR_INVARIANT: ${message}`);
}

async function readJson(fetchImpl, url) {
  invariant(typeof fetchImpl === "function", "fetch implementation required");
  const response = await fetchImpl(url, { cache: "no-store" });
  invariant(response && response.ok, `failed to load ${url}: ${response?.status ?? "NO_STATUS"}`);
  return response.json();
}

export async function loadAir082826CurrentStateAnchorRuntime(options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch?.bind(globalThis);

  const [observations, currentState, identityRegistry] = await Promise.all([
    readJson(fetchImpl, `${BASE}/anchor-observations.json`),
    readJson(fetchImpl, `${BASE}/current-state-anchor.json`),
    readJson(fetchImpl, `${BASE}/source-backed-identity-registry.json`)
  ]);

  invariant(observations.anchorId === "AIR_BASELINE_2026_08_28_V1", "observation anchorId mismatch");
  invariant(observations.observationDate === "2026-08-28", "observation date mismatch");
  invariant(observations.count === 696, "baseline observation count must equal 696");
  invariant(Array.isArray(observations.observations) && observations.observations.length === 696,
            "baseline observations array must contain 696 rows");

  const obsIds = new Set(observations.observations.map(x => x.observationId));
  invariant(obsIds.size === 696, "observation IDs must be unique");

  invariant(currentState.anchorId === "AIR_BASELINE_2026_08_28_V1", "state anchorId mismatch");
  invariant(currentState.asOf === "2026-08-28", "state asOf mismatch");
  invariant(Array.isArray(currentState.states), "state collection missing");
  invariant(currentState.derivedStateCount === currentState.states.length, "derived state count mismatch");
  invariant(currentState.absenceDoesNotMeanLeased === true, "absence semantic invariant lost");
  invariant(currentState.missingAvailabilityDoesNotMeanZero === true, "missing availability invariant lost");

  invariant(identityRegistry.count === 8, "source-backed identity registry must contain 8 subjects");
  invariant(Array.isArray(identityRegistry.identities) && identityRegistry.identities.length === 8,
            "source-backed identity registry array mismatch");
  invariant(identityRegistry.identities.every(x => x.canonicalIdentityClaim === false),
            "noncanonical identity unexpectedly claims canonical authority");

  return Object.freeze({
    contract: "SCIIP_AIR_082826_CURRENT_STATE_RUNTIME_V1",
    readOnly: true,
    anchorId: currentState.anchorId,
    asOf: currentState.asOf,
    baselineObservationCount: observations.count,
    derivedStateCount: currentState.derivedStateCount,
    sourceBackedIdentityCount: identityRegistry.count,
    observations,
    currentState,
    identityRegistry,
    semantics: Object.freeze({
      absenceDoesNotMeanLeased: true,
      missingAvailabilityDoesNotMeanZero: true,
      leaseAndSaleRemainDistinctSourceScopes: true,
      provisionalIdentityIsNotCanonicalIdentity: true
    })
  });
}

export function getAir082826RuntimeDescriptor() {
  return Object.freeze({
    contract: "SCIIP_AIR_082826_CURRENT_STATE_RUNTIME_V1",
    anchorId: "AIR_BASELINE_2026_08_28_V1",
    asOf: "2026-08-28",
    readOnly: true,
    lightBoxRequired: false,
    externalPropertyApiRequired: false
  });
}
