export function createExecutiveOutcomeSummary(input = {}) {
  const classification = String(input.classification || input.status || 'IN_PROGRESS').toUpperCase();
  const sourceSignalIds = Object.freeze([...(input.sourceSignalIds || [])]);
  const title = input.title || `Workflow ${input.workflowRequestId || 'Unknown'} ${classification.replaceAll('_',' ').toLowerCase()}`;
  const narrative = input.narrative || [
    `Outcome: ${classification}.`,
    `Duration: ${Number(input.durationMs || 0)} ms.`,
    `Evidence items: ${Number(input.evidenceCount || 0)}.`
  ].join(' ');
  return Object.freeze({
    outcomeId: input.outcomeId || `OUTCOME:${input.workflowRequestId || 'UNKNOWN'}`,
    workflowRequestId: input.workflowRequestId || null,
    workflowId: input.workflowId || null,
    proposalId: input.proposalId || null,
    approvalId: input.approvalId || null,
    sourceSignalIds,
    classification,
    title,
    narrative,
    durationMs: Number(input.durationMs || 0),
    evidenceCount: Number(input.evidenceCount || 0),
    requiresReview: Boolean(input.requiresReview),
    generatedAt: input.generatedAt || new Date().toISOString(),
    immutable: true
  });
}
