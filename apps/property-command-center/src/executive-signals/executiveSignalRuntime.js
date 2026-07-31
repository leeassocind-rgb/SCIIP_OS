import { createExecutiveSignalBus } from './executiveSignalBus.js';
import { getExecutiveSignalType, listExecutiveSignalTypes, registerExecutiveSignalType } from './executiveSignalRegistry.js';

export function createExecutiveSignalRuntime(options = {}) {
  const bus = options.bus || createExecutiveSignalBus(options.busOptions);
  const strictRegistry = options.strictRegistry !== false;
  let startedAt = null;

  const register = definition => registerExecutiveSignalType(definition);
  const publish = input => {
    const definition = getExecutiveSignalType(input.type);
    if (strictRegistry && !definition) throw new Error(`Unregistered executive signal type: ${String(input.type || '').toUpperCase()}`);
    return bus.publish({
      severity: definition?.defaultSeverity || 'INFO',
      source: definition?.source || input.source,
      ...input,
      metadata: { ...(definition?.metadata || {}), ...(input.metadata || {}) }
    });
  };

  return Object.freeze({
    start(definitions = []) {
      for (const definition of definitions) register(definition);
      startedAt ||= new Date().toISOString();
      return this.snapshot();
    },
    register,
    publish,
    subscribe: bus.subscribe,
    readSignals: bus.readHistory,
    snapshot() {
      return Object.freeze({
        status: startedAt ? 'OPERATIONAL' : 'READY',
        startedAt,
        strictRegistry,
        registeredTypes: listExecutiveSignalTypes(),
        bus: bus.metrics()
      });
    },
    bus
  });
}

let defaultRuntime;
export function getExecutiveSignalRuntime() {
  defaultRuntime ||= createExecutiveSignalRuntime();
  return defaultRuntime;
}
