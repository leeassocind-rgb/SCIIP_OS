import { computeBoundedAvailabilityV2 } from "./AirBoundedAvailabilityRateEngineV2.mjs";

export function buildBoundedAvailabilityV2RuntimeSnapshot(certifiedInput) {
  const metric = computeBoundedAvailabilityV2(certifiedInput);

  const disclosure = Object.freeze({
    asOfDate: metric.asOfDate,
    sourceCoverage:
      "AIR 2026-08-28 baseline + certified 2026-08-31 incremental event state; Existing stock denominator from refined AIR inventory",
    metricLevel: metric.metricLevel,
    transactionScope: metric.transactionScope,
    identityMembershipCoverage: metric.identityMembershipCoverage,
    existingCompetitiveStockSf: metric.existingCompetitiveStockSf,
    leaseAvailableSfLowerBound: metric.leaseAvailableSfLowerBound,
    leaseAvailableSfUpperBound: metric.leaseAvailableSfUpperBound,
    availabilityRateLowerBound: metric.availabilityRateLowerBound,
    availabilityRateUpperBound: metric.availabilityRateUpperBound,
    uncertaintySf: metric.uncertaintySf,
    arithmeticPartitionEqualityAloneSufficient: false,
    vacancySemantics: "NOT_A_VACANCY_RATE"
  });

  return Object.freeze({
    runtimeContract: "SCIIP_BOUNDED_AVAILABILITY_V2_RUNTIME_ADAPTER_V1",
    metric,
    disclosure,
    disclosureBoundAutomatically: true,
    staleOrPartialDisclosureOverrideAllowed: false,
    pointEstimateAuthorized: false,
    vacancyRatePublicationAuthorized: false,
    availabilityRatePublicationAuthorized: false,
    readOnly: true
  });
}
