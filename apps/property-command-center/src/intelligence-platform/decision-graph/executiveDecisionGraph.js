const freeze = value => Object.freeze(value);

export function buildExecutiveDecisionGraph({ decisionId, alternatives = [], evidence = [], dependencies = [] } = {}) {
  if (!decisionId) throw new Error('decisionId is required');

  const evidenceByAlternative = new Map();
  for (const item of evidence) {
    if (!evidenceByAlternative.has(item.alternativeId)) evidenceByAlternative.set(item.alternativeId, []);
    evidenceByAlternative.get(item.alternativeId).push(item);
  }

  const nodes = alternatives.map(alternative => {
    const linkedEvidence = evidenceByAlternative.get(alternative.alternativeId) || [];
    return freeze({
      ...alternative,
      evidenceCount: linkedEvidence.length,
      confidence: linkedEvidence.length
        ? Number((linkedEvidence.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / linkedEvidence.length).toFixed(3))
        : 0
    });
  });

  return freeze({
    decisionId,
    nodes: freeze(nodes),
    edges: freeze(dependencies.map(item => freeze({ ...item }))),
    nodeCount: nodes.length,
    edgeCount: dependencies.length,
    evidenceLinked: true,
    permanentHistory: true,
    explainable: true,
    productionExecutionAuthorized: false
  });
}
