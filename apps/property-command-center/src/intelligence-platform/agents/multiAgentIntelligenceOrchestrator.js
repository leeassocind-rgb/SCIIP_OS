const freeze = value => Object.freeze(value);

export function orchestrateIntelligenceAgents({ missionId, agents = [], work = [] } = {}) {
  if (!missionId) throw new Error('missionId is required');

  const assignments = work.map(item => {
    const eligible = agents
      .filter(agent => (item.requiredCapabilities || []).every(capability => agent.capabilities?.includes(capability)))
      .sort((a, b) => Number(b.confidence || 0) - Number(a.confidence || 0));
    const selected = eligible[0] || null;

    return freeze({
      workId: item.workId,
      agentId: selected?.agentId || null,
      status: selected ? 'ASSIGNED' : 'UNASSIGNED',
      evidenceRequired: true,
      approvalRequired: Boolean(item.consequential),
      autoExecute: false
    });
  });

  return freeze({
    missionId,
    assignments: freeze(assignments),
    assigned: assignments.filter(item => item.agentId).length,
    unassigned: assignments.filter(item => !item.agentId).length,
    sharedContext: true,
    conflictResolutionRequired: true,
    governed: true,
    autonomousExecutionAllowed: false
  });
}
