const TERMINAL = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);
export const EXECUTION_STATUSES = Object.freeze(['ACCEPTED','RUNNING','PAUSED','COMPLETED','FAILED','CANCELLED']);
export function createExecutiveWorkflowExecutionSnapshot(input = {}) {
  if (!input.workflowRequestId) throw new Error('workflowRequestId is required');
  if (!input.proposalId) throw new Error('proposalId is required');
  if (!input.approvalId) throw new Error('approvalId is required');
  const status = String(input.status || 'ACCEPTED').toUpperCase();
  if (!EXECUTION_STATUSES.includes(status)) throw new Error(`Unsupported execution status: ${status}`);
  const occurredAt = input.occurredAt || new Date().toISOString();
  return Object.freeze({
    snapshotId: input.snapshotId || `exec-${input.workflowRequestId}-${status.toLowerCase()}-${occurredAt}`,
    workflowRequestId: input.workflowRequestId,
    workflowId: input.workflowId || input.workflowRequestId,
    proposalId: input.proposalId,
    approvalId: input.approvalId,
    status,
    terminal: TERMINAL.has(status),
    actorId: input.actorId || 'workflow-engine',
    actorType: input.actorType || 'SYSTEM',
    reason: input.reason || null,
    error: input.error || null,
    sourceSignalIds: Object.freeze([...(input.sourceSignalIds || [])]),
    evidenceIds: Object.freeze([...(input.evidenceIds || [])]),
    sequence: Number(input.sequence || 1),
    occurredAt,
    recordedAt: input.recordedAt || new Date().toISOString()
  });
}
