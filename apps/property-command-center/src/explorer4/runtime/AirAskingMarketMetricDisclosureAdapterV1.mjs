export const SCIIP_ASKING_MARKET_METRIC_DISCLOSURE_CONTRACT_V1 =
  "SCIIP_ASKING_MARKET_METRIC_DISCLOSURE_CONTRACT_V1";

const freeze = (x) => Object.freeze(x);

export function buildAskingMarketMetricDisclosureV1(input) {
  if (!input || input.asOfDate !== "2026-09-01") throw new Error("AS_OF_DATE_NOT_CERTIFIED");
  const lease = input.askingLeaseRate;
  const sale = input.askingSalePrice;
  if (!lease || !sale) throw new Error("ASKING_METRIC_INPUT_MISSING");
  if (lease.staleObservationId !== "AIROBS-98E5F38392A1AD7807C18BD8") throw new Error("STALE_RATE_MASK_NOT_CERTIFIED");
  if (lease.staleExcludedCount !== 1) throw new Error("STALE_RATE_EXCLUSION_COUNT_DRIFT");
  if (lease.singleCrossBasisPointEstimateAuthorized !== false) throw new Error("CROSS_BASIS_POINT_ESTIMATE_FORBIDDEN");
  if (sale.leaseScopeListPriceExcluded !== true) throw new Error("LEASE_SCOPE_LIST_PRICE_MUST_BE_EXCLUDED");
  const b=lease.numericCountsByBasis||{};
  for (const k of ["NNN","GROSS","FSG","UNSPECIFIED"]) {
    if (!Number.isInteger(b[k]) || b[k] < 0) throw new Error(`INVALID_${k}_COUNT`);
  }
  if ((b.NNN+b.GROSS+b.FSG+b.UNSPECIFIED)!==239) throw new Error("LEASE_NUMERIC_COUNT_DRIFT");
  if (lease.tbdCount!==205) throw new Error("LEASE_TBD_COUNT_DRIFT");
  if (sale.saleScopeNumericCount!==96 || sale.tbdCount!==154 || sale.nfsCount!==1) throw new Error("SALE_SCOPE_COUNT_DRIFT");
  return freeze({
    contract: SCIIP_ASKING_MARKET_METRIC_DISCLOSURE_CONTRACT_V1,
    asOfDate: input.asOfDate,
    sourceCoverage: "AIR 2026-08-28 baseline + certified 2026-08-31 incremental state",
    askingLeaseRate: freeze({
      valueMode: "SEGMENTED_BY_RATE_BASIS",
      numericCountsByBasis: freeze({...b}),
      numericCurrentCount: 239,
      tbdCount: 205,
      staleExcludedCount: 1,
      staleObservationId: lease.staleObservationId,
      crossBasisPointEstimateAuthorized: false
    }),
    askingSalePrice: freeze({
      transactionScope: "SALE_ONLY",
      numericCount: 96,
      tbdCount: 154,
      nfsCount: 1,
      leaseScopeListPriceExcluded: true
    }),
    vacancyRateAuthorized: false,
    publicationAuthorized: false
  });
}
