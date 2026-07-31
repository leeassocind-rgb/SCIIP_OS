import { generateExecutiveInsights } from '../executiveInsightEngine.js';
import { mapExecutiveSignalToInsightInput } from './executiveSignalInsightMapper.js';

export function createExecutiveInsightSignalSubscriber(options = {}) {
  const maxSignals = Math.max(1, Number(options.maxSignals || 250));
  const signalIds = new Set();
  const records = [];
  let unsubscribe = null;
  let refreshes = 0;
  let duplicatesIgnored = 0;
  let mappingFailures = 0;
  let latestInsights = generateExecutiveInsights();
  let startedAt = null;

  const refresh = () => {
    const recommendations = records.flatMap(record => record.recommendations);
    const correlations = records.flatMap(record => record.correlations);
    const alerts = records.flatMap(record => record.alerts);
    latestInsights = Object.freeze({
      ...generateExecutiveInsights({ recommendations, correlations, alerts }),
      sourceSignalCount: records.length,
      sourceSignalIds: Object.freeze(records.map(record => record.signalId))
    });
    refreshes += 1;
    return latestInsights;
  };

  const consume = signal => {
    if (!signal || typeof signal !== 'object') {
      mappingFailures += 1;
      return Object.freeze({ status: 'MAPPING_FAILED', message: 'Executive signal is required', insights: latestInsights });
    }
    if (signalIds.has(signal.id)) {
      duplicatesIgnored += 1;
      return Object.freeze({ status: 'DUPLICATE_IGNORED', signalId: signal.id, insights: latestInsights });
    }

    try {
      const mapped = mapExecutiveSignalToInsightInput(signal);
      signalIds.add(signal.id);
      records.push(Object.freeze({ signalId: signal.id, ...mapped }));
      while (records.length > maxSignals) {
        const removed = records.shift();
        signalIds.delete(removed.signalId);
      }
      return Object.freeze({ status: 'CONSUMED', signalId: signal.id, insights: refresh() });
    } catch (error) {
      mappingFailures += 1;
      return Object.freeze({ status: 'MAPPING_FAILED', message: error.message, insights: latestInsights });
    }
  };

  return Object.freeze({
    start(runtime, options = {}) {
      if (!runtime || typeof runtime.subscribe !== 'function') throw new Error('Executive Signal Runtime is required');
      if (unsubscribe) return this.snapshot();
      startedAt ||= new Date().toISOString();
      unsubscribe = runtime.subscribe(consume, {
        id: options.subscriptionId || 'executive-insight-engine-subscriber',
        replay: options.replay !== false,
        filter: options.filter || null
      });
      return this.snapshot();
    },
    stop() {
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      return this.snapshot();
    },
    consume,
    getInsights: () => latestInsights,
    snapshot() {
      return Object.freeze({
        status: unsubscribe ? 'OPERATIONAL' : startedAt ? 'STOPPED' : 'READY',
        startedAt,
        retainedSignals: records.length,
        maxSignals,
        refreshes,
        duplicatesIgnored,
        mappingFailures,
        brokerReviewRequired: Boolean(latestInsights.brokerReviewRequired),
        priorityRecommendations: latestInsights.priorityRecommendations.length,
        criticalAlerts: latestInsights.criticalAlerts.length
      });
    }
  });
}
