/**
 * SCIIP Explorer 3.0 — M2.41
 * Governed Market Metric Detail Consumer Binding
 *
 * Read-only presentation contract. It does not rewrite formulas, filters,
 * source inventory, radius state, or canonical property state.
 */
export function buildGovernedMarketMetricDetailContract(activeMetric, ribbonContext) {
  const metrics = Array.isArray(ribbonContext?.metrics) ? ribbonContext.metrics : [];
  const metricId = activeMetric?.id ?? null;
  const governedMetric = metricId ? metrics.find(item => item?.id === metricId) : null;
  const metric = governedMetric || activeMetric || null;

  return Object.freeze({
    contract: 'SCIIP_EXPLORER_3_GOVERNED_MARKET_METRIC_DETAIL',
    version: 'v1.0',
    readOnly: true,
    authoritative: Boolean(governedMetric),
    radiusMiles: ribbonContext?.radiusMiles ?? null,
    metric,
    metricId: metric?.id ?? null,
    rows: Array.isArray(metric?.rows) ? metric.rows : [],
    presentationAuthority: governedMetric ? 'GOVERNED_MARKET_CONTEXT_RIBBON' : 'LEGACY_COMPATIBILITY_FALLBACK',
    automaticCanonicalWrites: false
  });
}
