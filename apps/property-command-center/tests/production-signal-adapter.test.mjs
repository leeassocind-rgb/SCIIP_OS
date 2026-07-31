import assert from 'node:assert/strict';
import { createExecutiveSignalRuntime } from '../src/executive-signals/executiveSignalRuntime.js';
import { resetExecutiveSignalRegistry } from '../src/executive-signals/executiveSignalRegistry.js';
import { createProductionSignalAdapter } from '../src/production-operations/signals/ProductionSignalAdapter.js';
import { translateProductionEvent } from '../src/production-operations/signals/productionSignalTranslator.js';

resetExecutiveSignalRegistry();
const runtime = createExecutiveSignalRuntime({ busOptions: { maxHistory: 20 } });
runtime.start();
const adapter = createProductionSignalAdapter({ runtime });
adapter.start();

const source = Object.freeze({
  sourceId: 'SRC-001', batchId: 'BAT-001', assignmentId: 'ASG-001', propertyId: 'PROP-001', fileName: 'supersheet.xlsx',
  rowCount: 100, exceptionCount: 2, sizeBytes: 2048, evidenceId: 'EVD-001', fingerprint: 'abc123', status: 'REVIEW_REQUIRED',
  events: Object.freeze([
    Object.freeze({ eventId: 'SRC-001:1', from: 'VALIDATED', to: 'REVIEW_REQUIRED', occurredAt: '2026-07-31T12:00:00.000Z', actor: 'SCIIP_SYSTEM', reason: 'Two exceptions' }),
    Object.freeze({ eventId: 'SRC-001:2', from: 'REVIEW_REQUIRED', to: 'CERTIFIED', occurredAt: '2026-07-31T12:05:00.000Z', actor: 'BROKER', reason: 'Reviewed' }),
    Object.freeze({ eventId: 'SRC-001:3', from: 'PROMOTION_READY', to: 'PROMOTED', occurredAt: '2026-07-31T12:10:00.000Z', actor: 'BROKER', reason: 'Approved' })
  ])
});

const translated = translateProductionEvent(source, source.events[0]);
assert.equal(translated.type, 'PRODUCTION_BATCH_REVIEW_REQUIRED');
assert.equal(translated.assignmentId, 'ASG-001');
assert.equal(translated.propertyId, 'PROP-001');
assert.equal(translated.metadata.productionEvent.eventId, 'SRC-001:1');
assert.equal(translated.metrics.exceptionCount, 2);

const results = adapter.publishSourceHistory(source);
assert.equal(results.length, 3);
assert.ok(results.every(item => item.status === 'PUBLISHED'));
assert.equal(runtime.readSignals().length, 3);
assert.equal(runtime.readSignals()[0].signal.type, 'PRODUCTION_BATCH_REVIEW_REQUIRED');

const duplicate = adapter.publishEvent(source, source.events[0]);
assert.equal(duplicate.status, 'DUPLICATE_IGNORED');

const ignored = adapter.publishEvent(source, Object.freeze({ eventId: 'SRC-001:4', from: 'CERTIFIED', to: 'PROMOTION_READY', occurredAt: '2026-07-31T12:06:00.000Z' }));
assert.equal(ignored.status, 'DROPPED');

let delivered = 0;
runtime.subscribe(() => { delivered += 1; }, { id: 'replay-check', filter: { source: 'production-operations' }, replay: true });
assert.equal(delivered, 3);

const snapshot = adapter.snapshot();
assert.equal(snapshot.status, 'OPERATIONAL');
assert.equal(snapshot.adapterHealth, 'HEALTHY');
assert.equal(snapshot.signalsPublished, 3);
assert.equal(snapshot.duplicatesIgnored, 1);
assert.equal(snapshot.signalsDropped, 1);
assert.equal(snapshot.translationFailures, 0);
assert.equal(snapshot.registeredSignalTypes.length, 6);

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE1_SPRINT2_PRODUCTION_SIGNAL_ADAPTER',
  status: 'PASSED',
  testsRun: 12,
  result: snapshot
}, null, 2));
