import assert from 'node:assert/strict';
import { createExecutiveSignalBus } from '../src/executive-signals/executiveSignalBus.js';
import { getExecutiveSignalType, resetExecutiveSignalRegistry } from '../src/executive-signals/executiveSignalRegistry.js';
import {
  GIS_SIGNAL_TYPES,
  createGisRuntimeAdapter
} from '../src/spatial/executive-signal-integration/index.js';

let tests = 0;
const t = (condition, message) => { tests++; assert.ok(condition, message || `Assertion ${tests} failed`); };

resetExecutiveSignalRegistry();
const signalBus = createExecutiveSignalBus({ maxHistory: 50 });
const received = [];
signalBus.subscribe(signal => received.push(signal), { id: 'gis-test-listener' });

const adapter = createGisRuntimeAdapter({ signalBus, maxHistory: 5 });
t(adapter.snapshot().status === 'OPERATIONAL');
t(adapter.snapshot().readOnly);
t(adapter.snapshot().mapContextCompatible);
t(adapter.snapshot().autonomousConsequentialActions === 'BLOCKED');
t(getExecutiveSignalType(GIS_SIGNAL_TYPES.PROXIMITY_OPPORTUNITY) !== null);
t(getExecutiveSignalType(GIS_SIGNAL_TYPES.SITE_SHORTLIST_READY) !== null);
t(getExecutiveSignalType(GIS_SIGNAL_TYPES.SPATIAL_DATA_REVIEW_REQUIRED) !== null);

const graph = {
  nodes: [
    { id: 'property:P-1', type: 'Property', attributes: { propertyId: 'P-1', latitude: 34.1000, longitude: -117.3000, buildingSf: 500000, powerAmps: 4000, clearHeight: 40, status: 'Available' } },
    { id: 'property:P-2', type: 'Property', attributes: { propertyId: 'P-2', latitude: 34.1200, longitude: -117.3200, buildingSf: 475000, powerAmps: 3500, clearHeight: 38, status: 'Available' } },
    { id: 'property:P-3', type: 'Property', attributes: { propertyId: 'P-3', latitude: 34.2500, longitude: -117.5000, buildingSf: 300000, powerAmps: 2500, clearHeight: 36, status: 'Existing' } },
    { id: 'property:P-BAD', type: 'Property', attributes: { propertyId: 'P-BAD', latitude: null, longitude: null, buildingSf: 250000 } }
  ],
  edges: []
};

const result = adapter.analyze({
  operationId: 'GIS-OP-1',
  assignmentId: 'A-100',
  correlationId: 'CORR-100',
  occurredAt: '2026-07-31T20:00:00.000Z',
  graph,
  subjectId: 'property:P-1',
  radiusMiles: 20,
  nearestLimit: 5,
  criteria: { buildingSf: 450000, powerAmps: 3000, clearHeight: 36, maxDistanceMiles: 30 }
});

t(result.analysis.subject.id === 'property:P-1');
t(result.analysis.properties.length === 3);
t(result.analysis.invalidPropertyCount === 1);
t(result.analysis.nearest.length === 2);
t(result.analysis.withinRadius.length >= 1);
t(result.analysis.comparableRanking.length === 2);
t(result.analysis.rankedSites.length === 2);
t(result.analysis.rankedSites[0].siteScore.score >= result.analysis.rankedSites[1].siteScore.score);
t(result.analysis.mapContext.subject.id === 'property:P-1');
t(result.analysis.mapContext.shortlist.length === 2);
t(result.signals.length === 3);
t(result.signals.some(signal => signal.type === GIS_SIGNAL_TYPES.PROXIMITY_OPPORTUNITY));
t(result.signals.some(signal => signal.type === GIS_SIGNAL_TYPES.SITE_SHORTLIST_READY));
t(result.signals.some(signal => signal.type === GIS_SIGNAL_TYPES.SPATIAL_DATA_REVIEW_REQUIRED));
t(result.publications.every(item => item.status === 'PUBLISHED'));
t(result.signals.every(signal => signal.assignmentId === 'A-100'));
t(result.signals.every(signal => signal.correlationId === 'CORR-100'));
t(result.signals.every(signal => signal.metadata.autonomousConsequentialActions === 'BLOCKED'));
t(received.length === 3);
t(result.readOnly);
t(result.autonomousConsequentialActions === 'BLOCKED');

const duplicate = adapter.analyze({ operationId: 'GIS-OP-1', graph });
t(duplicate.status === 'DUPLICATE_IGNORED');
t(adapter.snapshot().duplicatesIgnored === 1);

const cleanGraph = {
  nodes: [
    { id: 'property:S-1', type: 'Property', attributes: { propertyId: 'S-1', latitude: 33.90, longitude: -117.20, buildingSf: 200000, powerAmps: 2000, clearHeight: 32, status: 'Available' } },
    { id: 'property:S-2', type: 'Property', attributes: { propertyId: 'S-2', latitude: 33.91, longitude: -117.21, buildingSf: 210000, powerAmps: 2200, clearHeight: 32, status: 'Available' } }
  ],
  edges: []
};
const clean = adapter.analyze({
  operationId: 'GIS-OP-2',
  assignmentId: 'A-200',
  graph: cleanGraph,
  subjectId: 'property:S-1',
  criteria: { buildingSf: 200000, powerAmps: 2000, clearHeight: 32, maxDistanceMiles: 10 }
});
t(clean.signals.length === 2);
t(!clean.signals.some(signal => signal.type === GIS_SIGNAL_TYPES.SPATIAL_DATA_REVIEW_REQUIRED));
t(adapter.snapshot().processed === 2);
t(adapter.snapshot().published === 5);
t(adapter.snapshot().signalBusIntegrated);
t(adapter.snapshot().executiveInsightCompatible);
t(adapter.snapshot().executiveEngineCompatible);
t(adapter.snapshot().commandCenterCompatible);

adapter.stop();
t(adapter.snapshot().status === 'STOPPED');
let stoppedError = false;
try { adapter.analyze({ operationId: 'STOPPED', graph: cleanGraph }); } catch { stoppedError = true; }
t(stoppedError);
adapter.start();
t(adapter.snapshot().status === 'OPERATIONAL');

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE2_SPRINT29_GIS_RUNTIME_ADAPTER',
  status: 'PASSED',
  testsRun: tests,
  result: {
    analysesProcessed: adapter.snapshot().processed,
    signalsPublished: adapter.snapshot().published,
    duplicatesIgnored: adapter.snapshot().duplicatesIgnored,
    mapContextCompatible: adapter.snapshot().mapContextCompatible,
    signalBusIntegrated: adapter.snapshot().signalBusIntegrated,
    executiveInsightCompatible: adapter.snapshot().executiveInsightCompatible,
    executiveEngineCompatible: adapter.snapshot().executiveEngineCompatible,
    commandCenterCompatible: adapter.snapshot().commandCenterCompatible,
    readOnly: true,
    autonomousConsequentialActions: 'BLOCKED'
  }
}, null, 2));
