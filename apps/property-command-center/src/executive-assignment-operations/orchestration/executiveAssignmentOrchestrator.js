const freeze = value => Object.freeze(value);

export function orchestrateExecutiveAssignment({
  assignmentId,
  objectives = [],
  workstreams = [],
  approvals = []
} = {}) {
  if (!assignmentId) throw new Error('assignmentId is required');

  const assignments = workstreams.map((workstream, index) => {
    const objective = objectives.find(item => item.objectiveId === workstream.objectiveId);
    const approval = approvals.find(item => item.workstreamId === workstream.workstreamId);
    const readiness = Number((
      Number(workstream.completionPct || 0) * .45 +
      Number(workstream.evidenceCoveragePct || 0) * .35 +
      Number(workstream.ownerConfidencePct || 0) * .20
    ).toFixed(2));

    return freeze({
      workstreamId: workstream.workstreamId || `WS-${String(index + 1).padStart(4, '0')}`,
      objectiveId: workstream.objectiveId,
      objective: objective?.label || null,
      readiness,
      status: readiness >= 80 ? 'READY' : readiness >= 60 ? 'WATCH' : 'AT_RISK',
      approvalStatus: approval?.status || 'NOT_REQUIRED',
      evidenceRequired: true,
      autoExecute: false
    });
  }).sort((a,b) => b.readiness - a.readiness);

  return freeze({
    assignmentId,
    workstreams: freeze(assignments),
    total: assignments.length,
    ready: assignments.filter(item => item.status === 'READY').length,
    atRisk: assignments.filter(item => item.status === 'AT_RISK').length,
    executiveReviewRequired: assignments.some(item => item.status !== 'READY'),
    evidenceRequired: true,
    permanentHistory: true,
    autonomousExecutionAllowed: false
  });
}
