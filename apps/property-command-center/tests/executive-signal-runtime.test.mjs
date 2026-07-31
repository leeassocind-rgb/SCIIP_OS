import assert from 'node:assert/strict';
import { createExecutiveSignalRuntime, resetExecutiveSignalRegistry } from '../src/executive-signals/index.js';

resetExecutiveSignalRegistry();
const runtime = createExecutiveSignalRuntime({ busOptions: { maxHistory: 2 } });
const snapshot = runtime.start([{ type: 'PRODUCTION_BATCH_REVIEW_REQUIRED', source: 'production-operations', defaultSeverity: 'HIGH', consequential: true }]);
assert.equal(snapshot.status, 'OPERATIONAL');
assert.equal(snapshot.registeredTypes.length, 1);

const received = [];
const unsubscribe = runtime.subscribe(signal => received.push(signal), { filter: { assignmentId: 'A-1' } });
const result = runtime.publish({ type: 'PRODUCTION_BATCH_REVIEW_REQUIRED', assignmentId: 'A-1', title: 'Review required', metrics: { exceptions: 3 } });
assert.equal(result.envelope.signal.source, 'production-operations');
assert.equal(result.envelope.signal.severity, 'HIGH');
assert.equal(received.length, 1);
assert.equal(Object.isFrozen(result.envelope.signal), true);

runtime.publish({ type: 'PRODUCTION_BATCH_REVIEW_REQUIRED', assignmentId: 'A-2' });
runtime.publish({ type: 'PRODUCTION_BATCH_REVIEW_REQUIRED', assignmentId: 'A-3' });
assert.equal(runtime.readSignals().length, 2);
unsubscribe();
assert.throws(() => runtime.publish({ type: 'UNKNOWN' }), /Unregistered executive signal type/);
console.log(JSON.stringify({ framework: 'SCIIP_PHASE1_SPRINT1_EXECUTIVE_SIGNAL_RUNTIME', status: 'PASSED', testsRun: 9, result: runtime.snapshot() }, null, 2));
