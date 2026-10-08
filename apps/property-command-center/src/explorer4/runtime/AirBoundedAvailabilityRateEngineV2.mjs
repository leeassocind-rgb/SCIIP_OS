const CONTRACT = "SCIIP_FULL_MARKET_BOUNDED_AVAILABILITY_RATE_V2";

function finiteNonNegative(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number`);
  }
}

export function computeBoundedAvailabilityV2({
  asOfDate,
  existingCompetitiveStockSf,
  leaseAvailableSfLowerBound,
  leaseAvailableSfUpperBound,
  correctedLeaseContributorCount,
  deterministicallyStatusAlignedCount,
  unresolvedMembershipCount,
  snapshotFingerprint
}) {
  finiteNonNegative(existingCompetitiveStockSf, "existingCompetitiveStockSf");
  finiteNonNegative(leaseAvailableSfLowerBound, "leaseAvailableSfLowerBound");
  finiteNonNegative(leaseAvailableSfUpperBound, "leaseAvailableSfUpperBound");
  if (existingCompetitiveStockSf <= 0) throw new Error("denominator must be > 0");
  if (leaseAvailableSfUpperBound < leaseAvailableSfLowerBound) throw new Error("upper bound < lower bound");
  if (!asOfDate) throw new Error("asOfDate required");
  if (!snapshotFingerprint) throw new Error("snapshotFingerprint required");
  if (correctedLeaseContributorCount !== 400) throw new Error("unexpected corrected contributor count");
  if (deterministicallyStatusAlignedCount !== 337) throw new Error("unexpected aligned contributor count");
  if (unresolvedMembershipCount !== 63) throw new Error("unexpected unresolved contributor count");

  return Object.freeze({
    contract: CONTRACT,
    asOfDate,
    denominatorDefinition: "Certified Existing competitive-stock building SF only",
    existingCompetitiveStockSf,
    leaseAvailableSfLowerBound,
    leaseAvailableSfUpperBound,
    availabilityRateLowerBound: leaseAvailableSfLowerBound / existingCompetitiveStockSf,
    availabilityRateUpperBound: leaseAvailableSfUpperBound / existingCompetitiveStockSf,
    uncertaintySf: leaseAvailableSfUpperBound - leaseAvailableSfLowerBound,
    metricLevel: "PROPERTY_BOUNDED",
    transactionScope: "LEASE_AND_SUBLEASE_ONLY",
    identityMembershipCoverage: Object.freeze({
      correctedLeaseContributorCount,
      deterministicallyStatusAlignedCount,
      deterministicallyStatusAlignedPercent:
        deterministicallyStatusAlignedCount / correctedLeaseContributorCount * 100,
      unresolvedMembershipCount
    }),
    pointEstimateAuthorized: false,
    vacancyRateEquivalent: false,
    snapshotFingerprint,
    readOnly: true,
    uiPublicationAuthorized: false
  });
}

export const boundedAvailabilityV2Contract = CONTRACT;
