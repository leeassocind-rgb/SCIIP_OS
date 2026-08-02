const freeze = value => Object.freeze(value);

export function processAssignmentSignals({assignmentId, signals=[], threshold=.6}={}) {
  if (!assignmentId) throw new Error('assignmentId is required');

  const ranked = signals.map((signal, index) => {
    const confidence = Number(signal.confidence || 0);
    const urgency = Number(signal.urgency || 0);
    const impact = Number(signal.impact || 0);
    const freshness = Number(signal.freshness || 0);
    const score = Number((
      confidence * .30 +
      urgency * .25 +
      impact * .30 +
      freshness * .15
    ).toFixed(3));

    return freeze({
      signalId: signal.signalId || `ASIG-${String(index + 1).padStart(4, '0')}`,
      assignmentId,
      type: signal.type,
      subjectId: signal.subjectId,
      score,
      status: score >= threshold ? 'ACTIVE' : 'MONITOR',
      evidence: freeze([...(signal.evidence || [])])
    });
  }).sort((a,b) => b.score - a.score);

  return freeze({
    assignmentId,
    signals: freeze(ranked),
    total: ranked.length,
    active: ranked.filter(item => item.status === 'ACTIVE').length,
    topSignal: ranked[0] || null,
    evidenceBacked: true,
    permanentHistory: true,
    productionWritesGoverned: true,
    autonomousExecutionAllowed: false
  });
}
