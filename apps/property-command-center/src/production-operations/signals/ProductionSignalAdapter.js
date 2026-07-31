import { validateExecutiveSignal } from '../../executive-signals/signalContract.js';
import { PRODUCTION_EXECUTIVE_SIGNAL_DEFINITIONS } from './productionSignalDefinitions.js';
import { translateProductionEvent, translateProductionSourceHistory } from './productionSignalTranslator.js';

export function createProductionSignalAdapter({ runtime, strict = false } = {}) {
  if (!runtime || typeof runtime.publish !== 'function' || typeof runtime.register !== 'function') {
    throw new Error('Executive Signal Runtime is required');
  }

  const publishedIds = new Set();
  const metrics = { signalsPublished: 0, signalsDropped: 0, duplicatesIgnored: 0, translationFailures: 0 };
  let startedAt = null;

  const publishTranslated = input => {
    if (!input) {
      metrics.signalsDropped += 1;
      return Object.freeze({ status: 'DROPPED', reason: 'UNMAPPED_EVENT', signal: null });
    }
    if (publishedIds.has(input.id)) {
      metrics.duplicatesIgnored += 1;
      return Object.freeze({ status: 'DUPLICATE_IGNORED', reason: 'SIGNAL_ALREADY_PUBLISHED', signal: null });
    }
    const validation = validateExecutiveSignal(input);
    if (!validation.valid) {
      metrics.translationFailures += 1;
      if (strict) throw new Error(validation.errors.join('; '));
      return Object.freeze({ status: 'FAILED', reason: validation.errors.join('; '), signal: null });
    }
    const result = runtime.publish(validation.signal);
    publishedIds.add(validation.signal.id);
    metrics.signalsPublished += 1;
    return Object.freeze({ status: 'PUBLISHED', signal: result.envelope.signal, envelope: result.envelope, deliveryErrors: result.deliveryErrors });
  };

  return Object.freeze({
    start() {
      for (const definition of PRODUCTION_EXECUTIVE_SIGNAL_DEFINITIONS) runtime.register(definition);
      startedAt ||= new Date().toISOString();
      return this.snapshot();
    },
    publishEvent(source, event) {
      try { return publishTranslated(translateProductionEvent(source, event)); }
      catch (error) {
        metrics.translationFailures += 1;
        if (strict) throw error;
        return Object.freeze({ status: 'FAILED', reason: error.message, signal: null });
      }
    },
    publishSourceHistory(source) {
      return Object.freeze(translateProductionSourceHistory(source).map(publishTranslated));
    },
    publishLatest(source) {
      const events = source?.events || [];
      return this.publishEvent(source, events[events.length - 1] || null);
    },
    snapshot() {
      return Object.freeze({
        status: startedAt ? 'OPERATIONAL' : 'READY',
        adapterHealth: metrics.translationFailures === 0 ? 'HEALTHY' : 'DEGRADED',
        startedAt,
        registeredSignalTypes: PRODUCTION_EXECUTIVE_SIGNAL_DEFINITIONS.map(item => item.type),
        ...metrics,
        publishedSignalIds: Object.freeze([...publishedIds])
      });
    }
  });
}
