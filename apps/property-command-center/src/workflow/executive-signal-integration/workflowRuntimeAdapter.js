import { orchestrateOpportunity, actionCenterSnapshot } from '../actionCenterService.js';
import { registerWorkflowSignalTypes } from './workflowSignalDefinitions.js';
import { mapWorkflowToExecutiveSignals } from './workflowSignalMapper.js';

const actionable = signal => {
  if (!signal?.id || signal.source === 'workflow-engine') return false;
  if (signal.severity === 'HIGH' || signal.severity === 'CRITICAL') return true;
  return Array.isArray(signal.actions) && signal.actions.length > 0;
};

export function createWorkflowRuntimeAdapter({ signalBus, maxHistory = 100 } = {}) {
  registerWorkflowSignalTypes();
  const history = [];
  const seen = new Set();
  let consumed = 0, published = 0, duplicatesIgnored = 0, draftsCreated = 0, started = true, unsubscribe = null;

  const consume = signal => {
    if (!started) throw new Error('Workflow Runtime Adapter is stopped');
    if (!signal?.id) throw new Error('Executive signal id is required');
    if (seen.has(signal.id)) {
      duplicatesIgnored++;
      return Object.freeze({ status: 'DUPLICATE_IGNORED', signalId: signal.id });
    }
    seen.add(signal.id);

    if (!actionable(signal)) {
      const ignored = Object.freeze({ status: 'NON_ACTIONABLE_IGNORED', signalId: signal.id });
      history.push(ignored);
      consumed++;
      return ignored;
    }

    const result = orchestrateOpportunity({
      assignmentId: signal.assignmentId || 'UNASSIGNED',
      opportunityId: signal.id,
      workflowType: `EXECUTIVE_SIGNAL_${signal.type}`,
      title: signal.title || 'Executive signal review',
      priority: signal.severity || 'MEDIUM',
      evidenceRefs: (signal.evidence || []).map(item => item.id),
      tasks: [
        { title: 'Review executive signal evidence', kind: 'REVIEW' },
        { title: 'Confirm broker strategy', kind: 'DECISION' },
        { title: 'Approve workflow execution', kind: 'APPROVAL' }
      ]
    });
    if (result.created) draftsCreated++;

    const derivedSignals = mapWorkflowToExecutiveSignals({
      sourceSignal: signal,
      workflow: result.workflow,
      created: result.created,
      occurredAt: signal.occurredAt || new Date().toISOString()
    });
    const publications = derivedSignals.map(derivedSignal => {
      const publication = signalBus?.publish ? signalBus.publish(derivedSignal) : null;
      if (publication) published++;
      return Object.freeze({ status: publication ? 'PUBLISHED' : 'ADAPTER_READY', signal: derivedSignal, publication });
    });

    const record = Object.freeze({
      id: `workflow-runtime-adapter:${signal.id}`,
      sourceSignal: signal,
      workflow: result.workflow,
      created: result.created,
      duplicateSafe: result.duplicateSafe,
      derivedSignals,
      publications,
      executionAuthorized: false,
      workflowMutationAllowed: false,
      autonomousExecutionAllowed: false
    });
    history.push(record);
    while (history.length > maxHistory) history.shift();
    consumed++;
    return record;
  };

  const connect = () => {
    if (!signalBus?.subscribe || unsubscribe) return Boolean(unsubscribe);
    unsubscribe = signalBus.subscribe(signal => consume(signal), {
      id: 'workflow-runtime-adapter',
      filter: actionable
    });
    return true;
  };

  const disconnect = () => {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
  };

  return Object.freeze({
    consume, connect, disconnect,
    snapshot: assignmentId => Object.freeze({
      status: started ? 'OPERATIONAL' : 'STOPPED',
      consumed, published, duplicatesIgnored, draftsCreated,
      retainedRecords: history.length,
      connected: Boolean(unsubscribe),
      actionCenter: assignmentId ? actionCenterSnapshot(assignmentId) : null,
      executionAuthorized: false,
      workflowMutationAllowed: false,
      autonomousExecutionAllowed: false
    }),
    getHistory: () => Object.freeze([...history]),
    stop() { started = false; disconnect(); },
    start() { started = true; }
  });
}
