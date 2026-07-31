const freezeObject = value => Object.freeze({ ...(value || {}) });
export function createExecutiveExecutionEvidence(input = {}) {
  if (!input.workflowRequestId) throw new Error('workflowRequestId is required');
  if (!input.type) throw new Error('Evidence type is required');
  if (!input.uri && input.value == null) throw new Error('Evidence uri or value is required');
  const collectedAt = input.collectedAt || new Date().toISOString();
  return Object.freeze({
    evidenceId: input.evidenceId || `evidence-${input.workflowRequestId}-${collectedAt}`,
    workflowRequestId: input.workflowRequestId,
    type: String(input.type).toUpperCase(),
    uri: input.uri || null,
    value: input.value ?? null,
    checksum: input.checksum || null,
    collectedBy: input.collectedBy || 'workflow-engine',
    collectedAt,
    metadata: freezeObject(input.metadata)
  });
}
