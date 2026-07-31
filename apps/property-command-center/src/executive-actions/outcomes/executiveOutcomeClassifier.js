const TERMINAL = new Set(['COMPLETED','FAILED','CANCELLED']);

export function classifyExecutiveOutcome(input = {}) {
  const status = String(input.status || '').toUpperCase();
  if (!TERMINAL.has(status)) {
    return Object.freeze({
      classification: 'IN_PROGRESS',
      terminal: false,
      successful: false,
      requiresReview: false,
      confidence: 'HIGH'
    });
  }
  const evidenceCount = Number(input.evidenceCount || input.evidence?.length || 0);
  const completedSteps = Number(input.completedSteps || 0);
  const totalSteps = Number(input.totalSteps || 0);
  const partial = status !== 'COMPLETED' && completedSteps > 0 && totalSteps > 0;
  const classification = partial ? 'PARTIALLY_COMPLETED' : status;
  return Object.freeze({
    classification,
    terminal: true,
    successful: status === 'COMPLETED',
    requiresReview: status !== 'COMPLETED',
    evidenceSufficient: evidenceCount > 0,
    confidence: evidenceCount > 0 ? 'HIGH' : 'MEDIUM'
  });
}
