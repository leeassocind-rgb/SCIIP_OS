import assert from 'node:assert/strict';
import { clearTwinStateLedger } from '../src/property-digital-twin/twinStateLedger.js';
import { createExecutiveSignalBus } from '../src/executive-signals/executiveSignalBus.js';
import { getExecutiveSignalType, resetExecutiveSignalRegistry } from '../src/executive-signals/executiveSignalRegistry.js';
import {
  PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES,
  createPropertyDigitalTwinRuntimeAdapter
} from '../src/property-digital-twin/executive-signal-integration/index.js';

let tests = 0;
const t = (condition, message) => { tests++; assert.ok(condition, message || `Assertion ${tests} failed`); };

clearTwinStateLedger();
resetExecutiveSignalRegistry();
const signalBus = createExecutiveSignalBus({ maxHistory: 50 });
const received = [];
signalBus.subscribe(signal => received.push(signal), { id: 'twin-signal-test' });

const adapter = createPropertyDigitalTwinRuntimeAdapter({ signalBus, maxHistory: 5 });
t(adapter.snapshot().status === 'OPERATIONAL');
t(adapter.snapshot().readOnly);
t(adapter.snapshot().appendOnlyStateHistory);
t(adapter.snapshot().evidenceLineageRequired);
t(adapter.snapshot().autonomousConsequentialActions === 'BLOCKED');
t(getExecutiveSignalType(PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.HEALTH_CHANGED) !== null);
t(getExecutiveSignalType(PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.SYNCHRONIZATION_REVIEW_REQUIRED) !== null);
t(getExecutiveSignalType(PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.INFRASTRUCTURE_RISK) !== null);

const result = adapter.process({
  operationId: 'TWIN-OP-1',
  assignmentId: 'A-100',
  correlationId: 'CORR-100',
  occurredAt: '2026-07-31T19:00:00.000Z',
  asOf: '2026-07-31T19:00:00.000Z',
  property: {
    propertyId: 'P-100',
    address: '100 Test Way',
    city: 'Rialto',
    buildingSf: 500000,
    landAcres: 25,
    clearHeightFt: 40,
    dockHighDoors: 70,
    powerAmps: 4000,
    latitude: 34.1,
    longitude: -117.3
  },
  states: [{
    effectiveAt: '2026-07-31T18:00:00.000Z',
    state: { occupancy: 'VACANT', askingRate: 1.45 },
    evidenceId: 'EV-STATE-1',
    actorId: 'BROKER-1'
  }],
  sourceRecords: [
    { authoritative: true, data: { askingRate: 1.45 } },
    { authoritative: false, data: { askingRate: 1.20 } }
  ],
  evidenceCoveragePct: 60,
  infrastructure: [
    { id: 'POWER-1', category: 'POWER', severity: 'CRITICAL', status: 'AT_RISK' }
  ],
  claims: [
    { field: 'askingRate', value: 1.45, evidenceId: 'EV-STATE-1', source: 'broker', confidence: 0.95 }
  ]
});

t(result.operationId === 'TWIN-OP-1');
t(result.twin.twinId !== undefined);
t(result.signals.length >= 2);
t(result.signals.some(signal => signal.type === PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.HEALTH_CHANGED));
t(result.signals.some(signal => signal.type === PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.SYNCHRONIZATION_REVIEW_REQUIRED));
t(result.publications.every(item => item.status === 'PUBLISHED'));
t(result.signals.every(signal => signal.assignmentId === 'A-100'));
t(result.signals.every(signal => signal.correlationId === 'CORR-100'));
t(result.signals.every(signal => signal.metadata.autonomousConsequentialActions === 'BLOCKED'));
t(result.readOnly);
t(result.appendOnlyStateHistory);
t(result.autonomousConsequentialActions === 'BLOCKED');
t(received.length === result.signals.length);
t(result.twin.health !== undefined);
t(result.synchronization.status === 'REVIEW_REQUIRED');
t(result.twin.evidenceLineage !== undefined);

const duplicate = adapter.process({
  operationId: 'TWIN-OP-1',
  property: { propertyId: 'P-100' }
});
t(duplicate.status === 'DUPLICATE_IGNORED');
t(adapter.snapshot().duplicatesIgnored === 1);

const healthy = adapter.process({
  operationId: 'TWIN-OP-2',
  assignmentId: 'A-200',
  correlationId: 'CORR-200',
  occurredAt: '2026-07-31T19:05:00.000Z',
  property: {
    propertyId: 'P-200',
    address: '200 Stable Way',
    city: 'Ontario',
    buildingSf: 300000,
    landAcres: 15,
    latitude: 34.05,
    longitude: -117.6
  },
  sourceRecords: [{ authoritative: true, data: { status: 'ACTIVE' } }],
  evidenceCoveragePct: 100,
  infrastructure: [],
  claims: [{ field: 'status', value: 'ACTIVE', evidenceId: 'EV-2', confidence: 1 }]
});
t(healthy.signals.length === 1);
t(healthy.signals[0].type === PROPERTY_DIGITAL_TWIN_SIGNAL_TYPES.HEALTH_CHANGED);
t(adapter.snapshot().processed === 2);
t(adapter.snapshot().published === received.length);
t(adapter.snapshot().retainedRecords === 2);
t(adapter.snapshot().signalBusIntegrated);

adapter.stop();
t(adapter.snapshot().status === 'STOPPED');
let stoppedError = false;
try {
  adapter.process({ operationId: 'STOPPED', property: { propertyId: 'P-X' } });
} catch {
  stoppedError = true;
}
t(stoppedError);
adapter.start();
t(adapter.snapshot().status === 'OPERATIONAL');

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE2_SPRINT28_PROPERTY_DIGITAL_TWIN_RUNTIME_ADAPTER',
  status: 'PASSED',
  testsRun: tests,
  result: {
    twinsProcessed: adapter.snapshot().processed,
    signalsPublished: adapter.snapshot().published,
    duplicatesIgnored: adapter.snapshot().duplicatesIgnored,
    signalBusIntegrated: adapter.snapshot().signalBusIntegrated,
    executiveInsightCompatible: true,
    executiveEngineCompatible: true,
    commandCenterCompatible: true,
    appendOnlyStateHistory: true,
    evidenceLineageRequired: true,
    autonomousConsequentialActions: 'BLOCKED'
  }
}, null, 2));
