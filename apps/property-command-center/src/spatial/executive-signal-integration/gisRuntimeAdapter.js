import { spatialProperties, radiusSearch, nearestProperties, rankSpatialComparables } from '../spatialIndex.js';
import { rankSites } from '../siteSelection.js';
import { registerGisSignalTypes } from './gisSignalDefinitions.js';
import { mapGisAnalysisToExecutiveSignals } from './gisSignalMapper.js';

export function createGisRuntimeAdapter({ signalBus, maxHistory = 100 } = {}) {
  registerGisSignalTypes();
  const history = [];
  const seen = new Set();
  let processed = 0;
  let published = 0;
  let duplicatesIgnored = 0;
  let started = true;

  const analyze = input => {
    if (!started) throw new Error('GIS Runtime Adapter is stopped');
    const operationId = input?.operationId || input?.correlationId;
    if (!operationId) throw new Error('GIS operation id is required');
    if (seen.has(operationId)) {
      duplicatesIgnored++;
      return Object.freeze({ status: 'DUPLICATE_IGNORED', operationId });
    }
    seen.add(operationId);

    let properties = spatialProperties(input.graph || {}, input.assignmentId || '');
    const assignmentEdges = (input.graph?.edges || []).filter(edge => edge.type === 'SUPPORTS_ASSIGNMENT');
    const assignmentScopeFallback = Boolean(input.assignmentId && properties.length === 0 && assignmentEdges.length === 0);
    if (assignmentScopeFallback) properties = spatialProperties(input.graph || {}, '');
    const subject = properties.find(item => item.id === input.subjectId) || null;
    const invalidPropertyCount = (input.graph?.nodes || []).filter(node =>
      node.type === 'Property' && !properties.some(property => property.id === node.id)
    ).length;
    const radiusMiles = Number(input.radiusMiles || 10);
    const nearest = subject ? nearestProperties(
      properties.filter(item => item.id !== subject.id),
      subject.coordinates,
      Number(input.nearestLimit || 10)
    ) : [];
    const withinRadius = subject ? radiusSearch(
      properties.filter(item => item.id !== subject.id),
      subject.coordinates,
      radiusMiles
    ) : [];
    const comparableRanking = subject ? rankSpatialComparables(properties, subject.id, Number(input.comparableLimit || 10)) : [];
    const rankedSites = rankSites(
      nearest,
      input.criteria || {},
      input.weights
    );

    const analysis = Object.freeze({
      operationId,
      assignmentId: input.assignmentId || null,
      correlationId: input.correlationId || operationId,
      occurredAt: input.occurredAt || new Date().toISOString(),
      subject,
      properties,
      assignmentScopeFallback,
      invalidPropertyCount,
      radiusMiles,
      nearest,
      withinRadius,
      comparableRanking,
      rankedSites,
      mapContext: Object.freeze({
        subject,
        nearby: Object.freeze(withinRadius),
        shortlist: Object.freeze(rankedSites.slice(0, 10))
      }),
      readOnly: true,
      autonomousConsequentialActions: 'BLOCKED'
    });

    const signals = mapGisAnalysisToExecutiveSignals(analysis);
    const publications = signals.map(signal => {
      const publication = signalBus?.publish ? signalBus.publish(signal) : null;
      if (publication) published++;
      return Object.freeze({ status: publication ? 'PUBLISHED' : 'ADAPTER_READY', signal, publication });
    });

    const record = Object.freeze({
      id: `gis-runtime-adapter:${operationId}`,
      analysis,
      signals,
      publications,
      readOnly: true,
      autonomousConsequentialActions: 'BLOCKED'
    });
    history.push(record);
    while (history.length > maxHistory) history.shift();
    processed++;
    return record;
  };

  return Object.freeze({
    analyze,
    getHistory: () => Object.freeze([...history]),
    snapshot: () => Object.freeze({
      status: started ? 'OPERATIONAL' : 'STOPPED',
      processed,
      published,
      duplicatesIgnored,
      retainedRecords: history.length,
      maxHistory,
      signalBusIntegrated: Boolean(signalBus?.publish),
      mapContextCompatible: true,
      executiveInsightCompatible: true,
      executiveEngineCompatible: true,
      commandCenterCompatible: true,
      readOnly: true,
      autonomousConsequentialActions: 'BLOCKED'
    }),
    stop() { started = false; },
    start() { started = true; }
  });
}
