import { classifyExecutiveOutcome } from './executiveOutcomeClassifier.js';
import { createExecutiveOutcomeSummary } from './executiveOutcomeSummary.js';

export function aggregateExecutiveOutcomeTimeline(input = {}) {
  const timeline = Array.isArray(input.timeline) ? [...input.timeline] : [];
  timeline.sort((a,b) => Number(a.sequence || 0) - Number(b.sequence || 0) || String(a.occurredAt || '').localeCompare(String(b.occurredAt || '')));
  const last = timeline.at(-1) || {};
  const evidenceIds = new Set(timeline.flatMap(item => item.evidenceIds || []));
  const firstRunning = timeline.find(item => item.status === 'RUNNING');
  const terminal = [...timeline].reverse().find(item => ['COMPLETED','FAILED','CANCELLED'].includes(item.status));
  const started = Date.parse(firstRunning?.occurredAt || timeline[0]?.occurredAt || '');
  const ended = Date.parse(terminal?.occurredAt || last?.occurredAt || '');
  const durationMs = Number.isFinite(started) && Number.isFinite(ended) && ended >= started ? ended - started : Number(input.durationMs || 0);
  const classification = classifyExecutiveOutcome({
    status: last.status,
    evidenceCount: input.evidenceCount ?? evidenceIds.size,
    completedSteps: input.completedSteps,
    totalSteps: input.totalSteps
  });
  return createExecutiveOutcomeSummary({
    ...last,
    ...input,
    classification: classification.classification,
    requiresReview: classification.requiresReview,
    evidenceCount: input.evidenceCount ?? evidenceIds.size,
    durationMs,
    sourceSignalIds: last.sourceSignalIds || input.sourceSignalIds || []
  });
}
