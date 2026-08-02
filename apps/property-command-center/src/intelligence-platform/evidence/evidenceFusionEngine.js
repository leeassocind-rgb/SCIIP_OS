const freeze = value => Object.freeze(value);

export function fuseEvidence({ evidence = [], minimumConfidence = 0.6 } = {}) {
  const grouped = new Map();

  for (const item of evidence) {
    const key = item.subjectId || 'UNKNOWN';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(item);
  }

  const fused = [...grouped.entries()].map(([subjectId, items]) => {
    const confidence = items.length
      ? Number((items.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / items.length).toFixed(3))
      : 0;
    const sourceTypes = [...new Set(items.map(item => item.sourceType))];
    return freeze({
      subjectId,
      confidence,
      evidenceCount: items.length,
      sourceTypes: freeze(sourceTypes),
      corroborated: sourceTypes.length >= 2,
      status: confidence >= minimumConfidence ? 'SUPPORTED' : 'INSUFFICIENT_CONFIDENCE',
      evidence: freeze(items.map(item => freeze({ ...item })))
    });
  });

  return freeze({
    fused: freeze(fused),
    subjects: fused.length,
    supported: fused.filter(item => item.status === 'SUPPORTED').length,
    corroborated: fused.filter(item => item.corroborated).length,
    provenancePreserved: true,
    conflictsVisible: true,
    autonomousExecutionAllowed: false
  });
}
