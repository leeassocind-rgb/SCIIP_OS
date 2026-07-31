import { createEmptyExecutiveCommandCenterState, normalizeExecutiveCommandCenterState } from './executiveCommandCenterState.js';

export function createExecutiveCommandCenterAdapter(options = {}) {
  const maxSnapshots = Math.max(1, Number(options.maxSnapshots || 50));
  const history = [];
  const listeners = new Set();
  let integration = null;
  let unsubscribe = null;
  let latest = createEmptyExecutiveCommandCenterState();
  let refreshes = 0;
  let duplicatesIgnored = 0;
  let refreshFailures = 0;
  let startedAt = null;
  let fingerprint = '';

  const notify = () => {
    for (const listener of [...listeners]) {
      try { listener(latest); } catch { /* isolate UI subscribers */ }
    }
  };

  const refresh = snapshot => {
    try {
      const source = snapshot || integration?.buildSnapshot?.({}) || {};
      const next = normalizeExecutiveCommandCenterState(source);
      const nextFingerprint = JSON.stringify({
        generatedAt: next.generatedAt,
        status: next.status,
        severity: next.severity,
        sourceSignalIds: next.sourceSignalIds
      });
      if (nextFingerprint === fingerprint) {
        duplicatesIgnored += 1;
        return Object.freeze({ status: 'DUPLICATE_IGNORED', state: latest });
      }
      fingerprint = nextFingerprint;
      latest = next;
      history.push(next);
      while (history.length > maxSnapshots) history.shift();
      refreshes += 1;
      notify();
      return Object.freeze({ status: 'REFRESHED', state: latest });
    } catch (error) {
      refreshFailures += 1;
      return Object.freeze({ status: 'REFRESH_FAILED', message: error.message, state: latest });
    }
  };

  return Object.freeze({
    start(nextIntegration, startOptions = {}) {
      if (!nextIntegration || typeof nextIntegration.buildSnapshot !== 'function') throw new Error('Executive Engine Signal Integration is required');
      if (integration) return this.snapshot();
      integration = nextIntegration;
      startedAt ||= new Date().toISOString();
      refresh(startOptions.initialSnapshot);
      if (typeof startOptions.subscribe === 'function') unsubscribe = startOptions.subscribe(snapshot => refresh(snapshot));
      return this.snapshot();
    },
    stop() {
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      integration = null;
      return this.snapshot();
    },
    refresh,
    subscribe(listener) {
      if (typeof listener !== 'function') throw new Error('Listener must be a function');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getState: () => latest,
    getHistory: () => Object.freeze([...history]),
    snapshot() {
      return Object.freeze({
        status: integration ? 'OPERATIONAL' : startedAt ? 'STOPPED' : 'READY',
        startedAt,
        refreshes,
        retainedSnapshots: history.length,
        maxSnapshots,
        duplicatesIgnored,
        refreshFailures,
        listenerCount: listeners.size,
        executiveHealth: latest.health,
        severity: latest.severity,
        brokerReviewRequired: latest.brokerReviewRequired,
        traceable: latest.traceable
      });
    }
  });
}
