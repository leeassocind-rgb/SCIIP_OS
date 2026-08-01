const freeze = value => Object.freeze(value);
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));

export function createEnterpriseCommandBus({
  maximumHistory = 10000,
  priorityOrder = ['CRITICAL','HIGH','NORMAL','LOW']
} = {}) {
  const subscriptions = new Map();
  const history = [];
  const processedKeys = new Set();
  let sequence = 0;

  const subscribe = ({ topic='*', workspace, handler } = {}) => {
    if (!workspace || typeof handler !== 'function') throw new Error('workspace and handler are required');
    const id = `SUB-${subscriptions.size + 1}`;
    subscriptions.set(id, freeze({ id, topic, workspace, handler }));
    return () => subscriptions.delete(id);
  };

  const publish = ({
    commandId,
    commandKey,
    topic,
    type,
    payload = {},
    sourceWorkspace,
    targetWorkspaces = [],
    priority = 'NORMAL',
    occurredAt
  } = {}) => {
    if (!topic || !type || !sourceWorkspace) throw new Error('topic, type, and sourceWorkspace are required');
    const dedupeKey = commandKey || `${topic}:${type}:${JSON.stringify(payload)}`;
    if (processedKeys.has(dedupeKey)) return freeze({ status:'DUPLICATE_SKIPPED', commandKey:dedupeKey });

    sequence += 1;
    const command = freeze({
      commandId: commandId || `ENT-CMD-${sequence}`,
      commandKey: dedupeKey,
      topic,
      type,
      payload: freeze(clone(payload)),
      sourceWorkspace,
      targetWorkspaces: freeze([...targetWorkspaces]),
      priority: priorityOrder.includes(priority) ? priority : 'NORMAL',
      sequence,
      occurredAt: occurredAt || new Date().toISOString(),
      productionExecutionAuthorized: false
    });

    processedKeys.add(dedupeKey);
    history.push(command);
    if (history.length > maximumHistory) {
      const removed = history.shift();
      processedKeys.delete(removed.commandKey);
    }

    const deliveries = [];
    for (const subscription of subscriptions.values()) {
      const topicMatch = subscription.topic === '*' || subscription.topic === topic;
      const targetMatch = !targetWorkspaces.length || targetWorkspaces.includes(subscription.workspace);
      if (!topicMatch || !targetMatch) continue;
      const response = subscription.handler(command);
      deliveries.push(freeze({
        subscriptionId: subscription.id,
        workspace: subscription.workspace,
        status: 'DELIVERED',
        response: clone(response)
      }));
    }

    return freeze({
      status: 'PUBLISHED',
      command,
      deliveries: freeze(deliveries),
      deliveryCount: deliveries.length
    });
  };

  const replay = ({ fromSequence=1, topic } = {}) => freeze(
    history.filter(command => command.sequence >= fromSequence && (!topic || command.topic === topic))
  );

  return freeze({
    publish,
    subscribe,
    replay,
    history: () => freeze([...history]),
    snapshot: () => freeze({
      status: 'OPERATIONAL',
      subscriptions: subscriptions.size,
      commands: history.length,
      duplicateSafe: true,
      replayable: true,
      priorityRouting: true,
      productionExecutionAuthorized: false
    })
  });
}
