const freeze = value => Object.freeze(value);
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

export const PHASE5_REPORT_TYPES = Object.freeze({
  APPROVAL: 'APPROVAL', CANARY: 'CANARY', PROMOTION: 'PROMOTION', BUILD: 'BUILD'
});

function normalizeEnvelope(report, type, source = 'UNKNOWN') {
  if (!report || typeof report !== 'object') throw new Error(`Invalid ${type} report`);
  const generatedAt = report.generatedAt || report.completedAt || report.timestamp || null;
  return freeze({ type, source, generatedAt, framework: report.framework || null, status: report.status || 'UNKNOWN', payload: clone(report) });
}

export function createActivationEvidenceHydrator({ runtime, now = () => new Date() } = {}) {
  if (!runtime?.hydrate) throw new Error('Activation runtime with hydrate() required');
  const hydrateReports = ({ approval, canary, promotion, build, sources = {} } = {}) => {
    const envelopes = [];
    if (approval) envelopes.push(normalizeEnvelope(approval, PHASE5_REPORT_TYPES.APPROVAL, sources.approval));
    if (canary) envelopes.push(normalizeEnvelope(canary, PHASE5_REPORT_TYPES.CANARY, sources.canary));
    if (promotion) envelopes.push(normalizeEnvelope(promotion, PHASE5_REPORT_TYPES.PROMOTION, sources.promotion));
    if (build) envelopes.push(normalizeEnvelope(build, PHASE5_REPORT_TYPES.BUILD, sources.build));
    const hydrated = runtime.hydrate({ approvalReport: approval, canaryReport: canary, promotionReport: promotion, buildReport: build });
    return freeze({ status: 'HYDRATED', hydratedAt: now().toISOString(), reports: envelopes, runtimeRevision: hydrated.revision, state: hydrated });
  };
  return freeze({ hydrateReports, snapshot: () => freeze({ status:'OPERATIONAL', supportedReports:Object.values(PHASE5_REPORT_TYPES), productionWritesEnabled:false }) });
}
