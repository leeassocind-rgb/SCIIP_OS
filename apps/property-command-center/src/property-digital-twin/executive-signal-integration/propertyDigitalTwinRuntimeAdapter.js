import { createPropertyDigitalTwin } from '../twinRuntime.js';
import { registerPropertyDigitalTwinSignalTypes } from './propertyDigitalTwinSignalDefinitions.js';
import { mapPropertyDigitalTwinToExecutiveSignals } from './propertyDigitalTwinSignalMapper.js';

export function createPropertyDigitalTwinRuntimeAdapter({
  signalBus,
  maxHistory = 100
} = {}) {
  registerPropertyDigitalTwinSignalTypes();
  const history = [];
  const seen = new Set();
  let processed = 0;
  let published = 0;
  let duplicatesIgnored = 0;
  let started = true;

  const process = input => {
    if (!started) throw new Error('Property Digital Twin Runtime Adapter is stopped');
    const operationId = input?.operationId || input?.correlationId || input?.property?.propertyId || input?.property?.id;
    if (!operationId) throw new Error('Property Digital Twin adapter operation id is required');
    if (seen.has(operationId)) {
      duplicatesIgnored++;
      return Object.freeze({ status: 'DUPLICATE_IGNORED', operationId });
    }
    seen.add(operationId);

    const twin = createPropertyDigitalTwin(input);
    const sourceRecords = Array.isArray(input.sourceRecords) ? input.sourceRecords : [];
    const acceptedSources = sourceRecords.filter(item => item && item.authoritative !== false).length;
    const rejectedSources = sourceRecords.length - acceptedSources;
    const synchronization = Object.freeze({
      status: rejectedSources ? 'REVIEW_REQUIRED' : 'SYNCHRONIZED',
      acceptedSources,
      rejectedSources
    });
    const signals = mapPropertyDigitalTwinToExecutiveSignals({
      twin,
      synchronization,
      assignmentId: input.assignmentId,
      correlationId: input.correlationId || operationId,
      occurredAt: input.occurredAt
    });
    const publications = signals.map(signal => {
      const publication = signalBus?.publish ? signalBus.publish(signal) : null;
      if (publication) published++;
      return Object.freeze({
        status: publication ? 'PUBLISHED' : 'ADAPTER_READY',
        signal,
        publication
      });
    });

    const record = Object.freeze({
      id: `property-digital-twin-runtime-adapter:${operationId}`,
      operationId,
      twin,
      synchronization,
      signals,
      publications,
      readOnly: true,
      appendOnlyStateHistory: true,
      autonomousConsequentialActions: 'BLOCKED'
    });
    history.push(record);
    while (history.length > maxHistory) history.shift();
    processed++;
    return record;
  };

  return Object.freeze({
    process,
    getHistory: () => Object.freeze([...history]),
    snapshot: () => Object.freeze({
      status: started ? 'OPERATIONAL' : 'STOPPED',
      processed,
      published,
      duplicatesIgnored,
      retainedRecords: history.length,
      maxHistory,
      signalBusIntegrated: Boolean(signalBus?.publish),
      readOnly: true,
      appendOnlyStateHistory: true,
      evidenceLineageRequired: true,
      autonomousConsequentialActions: 'BLOCKED'
    }),
    stop() { started = false; },
    start() { started = true; }
  });
}
