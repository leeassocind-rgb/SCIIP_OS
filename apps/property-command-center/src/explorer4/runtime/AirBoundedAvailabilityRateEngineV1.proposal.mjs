export const CONTRACT = "SCIIP_FULL_MARKET_BOUNDED_AVAILABILITY_RATE_V1";
export const SNAPSHOT_CONTRACT = "SCIIP_CERTIFIED_BOUNDED_AVAILABILITY_SNAPSHOT_V1";

function finiteNonNegative(name, value) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`invalid ${name}`);
}

export function computeFromCertifiedSnapshot(snapshot) {
  if (!snapshot || snapshot.contract !== SNAPSHOT_CONTRACT) throw new Error("certified snapshot contract required");
  if (snapshot.metricContract !== CONTRACT) throw new Error("bounded availability metric contract mismatch");
  const d=snapshot.existingCompetitiveStockSf;
  const lo=snapshot.leaseAvailableSfLowerBound;
  const hi=snapshot.leaseAvailableSfUpperBound;
  finiteNonNegative("existingCompetitiveStockSf",d);
  finiteNonNegative("leaseAvailableSfLowerBound",lo);
  finiteNonNegative("leaseAvailableSfUpperBound",hi);
  if (d<=0) throw new Error("existing competitive stock denominator must be > 0");
  if (lo>hi) throw new Error("lower numerator bound exceeds upper bound");
  if (snapshot.exactPointEstimateCertified !== false) throw new Error("point estimate must remain uncertified");
  if (snapshot.vacancyRateCertified !== false) throw new Error("vacancy rate must remain uncertified");
  return Object.freeze({
    contract: CONTRACT,
    snapshotFingerprintSha256: snapshot.snapshotFingerprintSha256,
    metricName: "Availability Rate",
    metricClass: "BOUNDED_INTERVAL",
    metricLevel: "PROPERTY_LEVEL",
    transactionScope: "LEASE_AND_SUBLEASE",
    asOfDate: snapshot.asOfDate,
    sourceCoverage: snapshot.sourceCoverage,
    existingCompetitiveStockBuildingCount: snapshot.existingCompetitiveStockBuildingCount,
    denominatorSf: d,
    lowerNumeratorSf: lo,
    upperNumeratorSf: hi,
    lowerRate: lo/d,
    upperRate: hi/d,
    quarantinedPropertyCount: snapshot.quarantinedPropertyCount,
    uncertaintySf: snapshot.uncertaintySf,
    exactPointEstimateCertified: false,
    vacancyRateCertified: false,
    readOnly: true,
    uiPublicationAuthorized: false
  });
}
