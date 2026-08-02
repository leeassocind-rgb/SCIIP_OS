const freeze = value => Object.freeze(value);

export function evaluateBrokerWorkflow({assignmentId,tasks=[],dependencies=[]}={}) {
  if (!assignmentId) throw new Error('assignmentId is required');

  const dependencyMap = new Map();
  for (const edge of dependencies) {
    if (!dependencyMap.has(edge.to)) dependencyMap.set(edge.to, []);
    dependencyMap.get(edge.to).push(edge.from);
  }

  const evaluated = tasks.map(task => {
    const blockers = (dependencyMap.get(task.taskId) || []).filter(id => {
      const dependency = tasks.find(item => item.taskId === id);
      return dependency?.status !== 'COMPLETED';
    });
    const overdue = Boolean(task.dueAt && new Date(task.dueAt).getTime() < new Date(task.now || task.dueAt).getTime() && task.status !== 'COMPLETED');

    return freeze({
      ...task,
      blockers: freeze(blockers),
      blockerCount: blockers.length,
      overdue,
      status: blockers.length ? 'BLOCKED' : overdue ? 'OVERDUE' : task.status || 'READY',
      brokerControlled: true,
      autoComplete: false
    });
  });

  return freeze({
    assignmentId,
    tasks: freeze(evaluated),
    total: evaluated.length,
    blocked: evaluated.filter(item=>item.status==='BLOCKED').length,
    overdue: evaluated.filter(item=>item.status==='OVERDUE').length,
    workflowVisible: true,
    permanentHistory: true,
    brokerControlled: true,
    autonomousExecutionAllowed: false
  });
}
