import { aggregateExecutiveState, buildExecutiveBriefing, executiveTimeline } from '../executiveEngine.js';
import { mapInsightsToExecutiveDecision } from './executiveDecisionMapper.js';

export function createExecutiveEngineSignalIntegration(options = {}) {
  const maxDecisions = Math.max(1, Number(options.maxDecisions || 100));
  const decisions = [];
  const fingerprints = new Set();
  let subscriber = null;
  let unsubscribe = null;
  let startedAt = null;
  let evaluations = 0;
  let duplicatesIgnored = 0;
  let evaluationFailures = 0;
  let latestDecision = mapInsightsToExecutiveDecision();

  const fingerprint = insights => JSON.stringify({
    generatedAt: insights?.generatedAt || null,
    sourceSignalIds: insights?.sourceSignalIds || [],
    headline: insights?.headline || '',
    recommendationCount: insights?.priorityRecommendations?.length || 0,
    criticalAlertCount: insights?.criticalAlerts?.length || 0
  });

  const evaluate = insights => {
    try {
      const key = fingerprint(insights);
      if (fingerprints.has(key)) {
        duplicatesIgnored += 1;
        return Object.freeze({ status: 'DUPLICATE_IGNORED', decision: latestDecision });
      }
      latestDecision = mapInsightsToExecutiveDecision(insights || {});
      decisions.push(latestDecision);
      fingerprints.add(key);
      while (decisions.length > maxDecisions) decisions.shift();
      evaluations += 1;
      return Object.freeze({ status: 'EVALUATED', decision: latestDecision });
    } catch (error) {
      evaluationFailures += 1;
      return Object.freeze({ status: 'EVALUATION_FAILED', message: error.message, decision: latestDecision });
    }
  };

  const poll = () => {
    if (!subscriber || typeof subscriber.getInsights !== 'function') {
      evaluationFailures += 1;
      return Object.freeze({ status: 'EVALUATION_FAILED', message: 'Executive Insight Signal Subscriber is required', decision: latestDecision });
    }
    return evaluate(subscriber.getInsights());
  };

  return Object.freeze({
    start(nextSubscriber, options = {}) {
      if (!nextSubscriber || typeof nextSubscriber.getInsights !== 'function') throw new Error('Executive Insight Signal Subscriber is required');
      if (unsubscribe) return this.snapshot();
      subscriber = nextSubscriber;
      startedAt ||= new Date().toISOString();
      poll();
      if (typeof options.subscribe === 'function') {
        unsubscribe = options.subscribe(() => poll());
      }
      return this.snapshot();
    },
    stop() {
      if (unsubscribe) unsubscribe();
      unsubscribe = null;
      subscriber = null;
      return this.snapshot();
    },
    evaluate,
    poll,
    getDecision: () => latestDecision,
    getDecisionHistory: () => Object.freeze([...decisions]),
    buildSnapshot(input = {}) {
      return Object.freeze({
        executiveState: aggregateExecutiveState(input),
        briefing: buildExecutiveBriefing(aggregateExecutiveState(input)),
        timeline: executiveTimeline(input),
        decision: latestDecision
      });
    },
    snapshot() {
      return Object.freeze({
        status: subscriber ? 'OPERATIONAL' : startedAt ? 'STOPPED' : 'READY',
        startedAt,
        evaluations,
        retainedDecisions: decisions.length,
        maxDecisions,
        duplicatesIgnored,
        evaluationFailures,
        decisionStatus: latestDecision.status,
        severity: latestDecision.severity,
        brokerReviewRequired: latestDecision.brokerReviewRequired,
        sourceSignalCount: latestDecision.sourceSignalIds.length
      });
    }
  });
}
