export const selectExecutiveHealth = state => state?.health || 'OPERATIONAL';
export const selectExecutiveSeverity = state => state?.severity || 'INFO';
export const selectCriticalDecisions = state => state?.status === 'ATTENTION_REQUIRED' ? Object.freeze([state]) : Object.freeze([]);
export const selectActiveAlerts = state => Object.freeze([...(state?.alerts || [])]);
export const selectPriorityRecommendationCount = state => Number(state?.recommendationCount || 0);
export const selectBrokerReviewRequired = state => Boolean(state?.brokerReviewRequired);
export const selectDecisionTraceability = state => Object.freeze({
  traceable: Boolean(state?.traceable),
  sourceSignalIds: Object.freeze([...(state?.sourceSignalIds || [])])
});
export const selectExecutiveHeadline = state => state?.headline || 'Executive operations are stable';
export const selectImmediateExecutiveAction = state => state?.immediateAction || null;
