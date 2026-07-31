const round = value => Math.round(value * 100) / 100;

export function calculateExecutiveOutcomeMetrics(outcomes = []) {
  const rows = Array.isArray(outcomes) ? outcomes : [];
  const terminal = rows.filter(item => item?.terminal !== false && ['COMPLETED','FAILED','CANCELLED','PARTIALLY_COMPLETED'].includes(item?.classification || item?.status));
  const count = terminal.length;
  const completed = terminal.filter(item => (item.classification || item.status) === 'COMPLETED').length;
  const failed = terminal.filter(item => (item.classification || item.status) === 'FAILED').length;
  const cancelled = terminal.filter(item => (item.classification || item.status) === 'CANCELLED').length;
  const partial = terminal.filter(item => (item.classification || item.status) === 'PARTIALLY_COMPLETED').length;
  const durations = terminal.map(item => Number(item.durationMs || 0)).filter(value => Number.isFinite(value) && value >= 0);
  const averageDurationMs = durations.length ? Math.round(durations.reduce((a,b)=>a+b,0) / durations.length) : 0;
  const evidenceBacked = terminal.filter(item => Number(item.evidenceCount || 0) > 0 || item.evidenceSufficient === true).length;
  return Object.freeze({
    totalOutcomes: count,
    completed,
    failed,
    cancelled,
    partiallyCompleted: partial,
    successRatePct: count ? round((completed / count) * 100) : 0,
    reviewRatePct: count ? round(((failed + cancelled + partial) / count) * 100) : 0,
    evidenceCoveragePct: count ? round((evidenceBacked / count) * 100) : 0,
    averageDurationMs,
    throughput: count
  });
}
