export function buildAiReadinessIndex({
  graphStaging,
  evidence = [],
  observations = []
} = {}) {
  const evidenceById = new Map(evidence.map(item => [item.evidenceId, item]));
  const supportedObservations = observations.filter(item =>
    item.sourceEvidenceId && evidenceById.has(item.sourceEvidenceId)
  );

  return {
    framework: 'SCIIP_AI_READINESS_INDEX',
    version: 'v1',
    generatedAt: new Date().toISOString(),
    queryMode: 'GOVERNED_STRUCTURED_EVIDENCE_ONLY',
    rawDocumentReasoningEnabled: false,
    graphCommitEnabled: false,
    metrics: {
      graphNodes: graphStaging?.nodeCount || 0,
      graphEdges: graphStaging?.edgeCount || 0,
      evidenceRecords: evidence.length,
      observations: observations.length,
      supportedObservations: supportedObservations.length,
      unsupportedObservations: observations.length - supportedObservations.length
    },
    readinessStatus:
      observations.length > 0 &&
      supportedObservations.length === observations.length
        ? 'READY_FOR_GOVERNED_QUERY'
        : 'FOUNDATION_READY_NO_POPULATED_OBSERVATIONS'
  };
}
