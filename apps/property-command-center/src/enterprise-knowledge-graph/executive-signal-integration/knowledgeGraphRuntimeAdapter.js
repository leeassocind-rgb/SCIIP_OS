import { registerKnowledgeGraphSignalTypes } from './knowledgeGraphSignalDefinitions.js';
import { projectExecutiveSignalToKnowledgeGraph } from './knowledgeGraphExecutiveSignalProjector.js';
import { mapKnowledgeGraphProjectionToExecutiveSignals } from './knowledgeGraphSignalMapper.js';

export function createKnowledgeGraphRuntimeAdapter({
  graphRuntime,
  signalBus,
  maxHistory = 100,
  consumeFilter = signal => signal.source !== 'enterprise-knowledge-graph'
} = {}) {
  if (!graphRuntime?.entities || !graphRuntime?.relationships || !graphRuntime?.ontology) {
    throw new Error('Enterprise Knowledge Graph runtime is required');
  }
  registerKnowledgeGraphSignalTypes();

  const history = [];
  const seen = new Set();
  let consumed = 0;
  let published = 0;
  let duplicatesIgnored = 0;
  let started = true;
  let unsubscribe = null;

  const consume = signal => {
    if (!started) throw new Error('Knowledge Graph Runtime Adapter is stopped');
    if (!signal?.id) throw new Error('Executive signal id is required');
    if (seen.has(signal.id)) {
      duplicatesIgnored++;
      return Object.freeze({ status: 'DUPLICATE_IGNORED', signalId: signal.id });
    }
    seen.add(signal.id);

    const projection = projectExecutiveSignalToKnowledgeGraph(graphRuntime, signal);
    const derivedSignals = mapKnowledgeGraphProjectionToExecutiveSignals({
      inputSignal: signal,
      projection,
      graphRuntime
    });
    const publications = derivedSignals.map(derivedSignal => {
      const publication = signalBus?.publish ? signalBus.publish(derivedSignal) : null;
      if (publication) published++;
      return Object.freeze({
        status: publication ? 'PUBLISHED' : 'ADAPTER_READY',
        signal: derivedSignal,
        publication
      });
    });

    const record = Object.freeze({
      id: `knowledge-graph-runtime-adapter:${signal.id}`,
      sourceSignal: signal,
      projection,
      derivedSignals,
      publications,
      readOnly: true,
      appendOnly: true,
      autonomousConsequentialActions: 'BLOCKED'
    });
    history.push(record);
    while (history.length > maxHistory) history.shift();
    consumed++;
    return record;
  };

  const connect = () => {
    if (!signalBus?.subscribe) return false;
    if (unsubscribe) return true;
    unsubscribe = signalBus.subscribe(
      signal => { if (consumeFilter(signal)) consume(signal); },
      { id: 'knowledge-graph-runtime-adapter', filter: consumeFilter }
    );
    return true;
  };

  const disconnect = () => {
    if (unsubscribe) unsubscribe();
    unsubscribe = null;
  };

  return Object.freeze({
    consume,
    connect,
    disconnect,
    getHistory: () => Object.freeze([...history]),
    snapshot: () => Object.freeze({
      status: started ? 'OPERATIONAL' : 'STOPPED',
      consumed,
      published,
      duplicatesIgnored,
      retainedRecords: history.length,
      maxHistory,
      connected: Boolean(unsubscribe),
      graphStatus: graphRuntime.status,
      ontologyTerms: graphRuntime.ontology.all().length,
      entities: graphRuntime.entities.all().length,
      relationships: graphRuntime.relationships.all().length,
      readOnly: true,
      appendOnly: true,
      autonomousConsequentialActions: 'BLOCKED'
    }),
    stop() { started = false; disconnect(); },
    start() { started = true; }
  });
}
