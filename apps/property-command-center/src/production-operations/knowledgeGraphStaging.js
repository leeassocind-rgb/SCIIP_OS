import crypto from 'node:crypto';

const stableId = (prefix, value) =>
  `${prefix}-${crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 20)}`;

export function buildGraphStaging({
  propertyClusters = [],
  observations = [],
  evidence = []
} = {}) {
  const nodes = [];
  const edges = [];

  for (const cluster of propertyClusters) {
    nodes.push({
      nodeId: cluster.candidatePropertyId,
      nodeType: 'PROPERTY_CANDIDATE',
      properties: {
        memberCount: cluster.memberCount,
        status: cluster.status
      },
      commitStatus: 'NOT_COMMITTED'
    });
  }

  for (const item of evidence) {
    nodes.push({
      nodeId: item.evidenceId,
      nodeType: 'EVIDENCE',
      properties: {
        documentClass: item.documentClass,
        parserId: item.parserId,
        sourcePath: item.sourcePath,
        confidence: item.confidence
      },
      commitStatus: 'NOT_COMMITTED'
    });
  }

  for (const observation of observations) {
    nodes.push({
      nodeId: observation.observationId,
      nodeType: 'OBSERVATION',
      properties: observation,
      commitStatus: 'NOT_COMMITTED'
    });

    if (observation.entityId) {
      edges.push({
        edgeId: stableId('EDGE', `${observation.entityId}|HAS_OBSERVATION|${observation.observationId}`),
        from: observation.entityId,
        type: 'HAS_OBSERVATION',
        to: observation.observationId,
        commitStatus: 'NOT_COMMITTED'
      });
    }

    if (observation.sourceEvidenceId) {
      edges.push({
        edgeId: stableId('EDGE', `${observation.observationId}|SUPPORTED_BY|${observation.sourceEvidenceId}`),
        from: observation.observationId,
        type: 'SUPPORTED_BY',
        to: observation.sourceEvidenceId,
        commitStatus: 'NOT_COMMITTED'
      });
    }
  }

  return {
    framework: 'SCIIP_KNOWLEDGE_GRAPH_STAGING',
    version: 'v1',
    generatedAt: new Date().toISOString(),
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    graphCommitEnabled: false
  };
}
