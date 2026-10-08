export const SCIIP_ASKING_MARKET_METRIC_UI_DISCLOSURE_VIEW_MODEL_V1 =
  "SCIIP_ASKING_MARKET_METRIC_UI_DISCLOSURE_VIEW_MODEL_V1";

const freeze = (x) => Object.freeze(x);

export function buildAskingMarketMetricUiDisclosureViewModelV1(runtimeDisclosure) {
  if (!runtimeDisclosure || runtimeDisclosure.publicationAuthorized !== false) {
    throw new Error("ASKING_RUNTIME_DISCLOSURE_PUBLICATION_BOUNDARY_INVALID");
  }
  const lease = runtimeDisclosure.askingLeaseRate;
  const sale = runtimeDisclosure.askingSalePrice;
  if (!lease || !sale) throw new Error("ASKING_RUNTIME_DISCLOSURE_INCOMPLETE");
  if (lease.valueMode !== "SEGMENTED_BY_RATE_BASIS") throw new Error("LEASE_RATE_BASIS_SEGMENTATION_REQUIRED");
  if (lease.numericCurrentCount !== 239) throw new Error("LEASE_NUMERIC_CURRENT_COUNT_DRIFT");
  if (lease.staleExcludedCount !== 1) throw new Error("STALE_RATE_EXCLUSION_REQUIRED");
  if (lease.crossBasisPointEstimateAuthorized !== false) throw new Error("CROSS_BASIS_POINT_ESTIMATE_FORBIDDEN");
  if (sale.transactionScope !== "SALE_ONLY") throw new Error("SALE_SCOPE_ONLY_REQUIRED");
  if (sale.leaseScopeListPriceExcluded !== true) throw new Error("LEASE_SCOPE_LIST_PRICE_EXCLUSION_REQUIRED");
  if (runtimeDisclosure.vacancyRateAuthorized !== false) throw new Error("VACANCY_RATE_PUBLICATION_FORBIDDEN");
  return freeze({
    contract: SCIIP_ASKING_MARKET_METRIC_UI_DISCLOSURE_VIEW_MODEL_V1,
    asOfDate: runtimeDisclosure.asOfDate,
    sourceCoverage: runtimeDisclosure.sourceCoverage,
    lease: freeze({
      label: "Asking Lease Rate",
      valueMode: "SEGMENTED_BY_RATE_BASIS",
      numericCountsByBasis: freeze({...lease.numericCountsByBasis}),
      numericCurrentCount: lease.numericCurrentCount,
      tbdCount: lease.tbdCount,
      staleExcludedCount: lease.staleExcludedCount,
      crossBasisPointEstimateAuthorized: false
    }),
    sale: freeze({
      label: "Asking Sale Price",
      transactionScope: "SALE_ONLY",
      numericCount: sale.numericCount,
      tbdCount: sale.tbdCount,
      nfsCount: sale.nfsCount,
      leaseScopeListPriceExcluded: true
    }),
    vacancyRateAuthorized: false,
    publicationAuthorized: false
  });
}
