export function buildBoundedAvailabilityUiDisclosureViewModel(runtimeSnapshot) {
  if (!runtimeSnapshot || runtimeSnapshot.runtimeContract !== "SCIIP_BOUNDED_AVAILABILITY_V2_RUNTIME_ADAPTER_V1") {
    throw new Error("Certified Bounded Availability V2 runtime snapshot required");
  }
  if (runtimeSnapshot.disclosureBoundAutomatically !== true) {
    throw new Error("Automatic disclosure binding required");
  }
  if (runtimeSnapshot.availabilityRatePublicationAuthorized !== false) {
    throw new Error("Unexpected publication authorization state");
  }

  const d = runtimeSnapshot.disclosure;
  const c = d.identityMembershipCoverage;
  if (!d || !c) throw new Error("Mandatory disclosure payload missing");
  if (d.vacancySemantics !== "NOT_A_VACANCY_RATE") throw new Error("Vacancy semantic boundary missing");
  if (d.arithmeticPartitionEqualityAloneSufficient !== false) throw new Error("Arithmetic partition caveat missing");

  return Object.freeze({
    contract: "SCIIP_BOUNDED_AVAILABILITY_V2_UI_DISCLOSURE_VIEW_MODEL_V1",
    title: "Availability",
    valueMode: "BOUNDED_INTERVAL",
    rateLower: d.availabilityRateLowerBound,
    rateUpper: d.availabilityRateUpperBound,
    availableSfLower: d.leaseAvailableSfLowerBound,
    availableSfUpper: d.leaseAvailableSfUpperBound,
    denominatorSf: d.existingCompetitiveStockSf,
    asOfDate: d.asOfDate,
    sourceCoverage: d.sourceCoverage,
    metricLevel: d.metricLevel,
    transactionScope: d.transactionScope,
    identityMembershipCoverage: c,
    uncertaintySf: d.uncertaintySf,
    arithmeticPartitionCaveatRequired: true,
    vacancySemantics: d.vacancySemantics,
    pointEstimateAuthorized: false,
    vacancyRateAuthorized: false,
    uiPublicationAuthorized: false
  });
}
