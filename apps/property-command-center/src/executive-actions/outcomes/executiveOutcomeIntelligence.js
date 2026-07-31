import { aggregateExecutiveOutcomeTimeline } from './executiveOutcomeTimelineAggregator.js';
import { calculateExecutiveOutcomeMetrics } from './executiveOutcomeMetrics.js';
import { createExecutiveOutcomeSignal } from './executiveOutcomeSignals.js';

export function createExecutiveOutcomeIntelligence(options = {}) {
  const maxOutcomes = Math.max(1, Number(options.maxOutcomes || 500));
  const outcomes = new Map();
  const seen = new Set();
  let startedAt = null, outcomesGenerated = 0, duplicatesIgnored = 0, nonTerminalIgnored = 0, failures = 0;
  const analyze = input => {
    try {
      const key = input.outcomeEventId || `${input.workflowRequestId}:${input.timeline?.at?.(-1)?.sequence || input.status || ''}`;
      if (seen.has(key)) { duplicatesIgnored++; return Object.freeze({status:'DUPLICATE_IGNORED',summary:outcomes.get(input.workflowRequestId) || null}); }
      const summary = aggregateExecutiveOutcomeTimeline(input);
      if (summary.classification === 'IN_PROGRESS') { nonTerminalIgnored++; return Object.freeze({status:'NON_TERMINAL_IGNORED',summary}); }
      seen.add(key); outcomes.set(summary.workflowRequestId,summary); outcomesGenerated++;
      while (outcomes.size > maxOutcomes) outcomes.delete(outcomes.keys().next().value);
      return Object.freeze({status:'OUTCOME_GENERATED',summary,signal:createExecutiveOutcomeSignal(summary)});
    } catch (error) { failures++; return Object.freeze({status:'OUTCOME_ANALYSIS_FAILED',message:error.message}); }
  };
  return Object.freeze({
    start(){ startedAt ||= new Date().toISOString(); return this.snapshot(); },
    stop(){ return this.snapshot('STOPPED'); },
    analyze,
    getOutcome: id => outcomes.get(id) || null,
    getOutcomes: () => Object.freeze([...outcomes.values()]),
    getMetrics: () => calculateExecutiveOutcomeMetrics([...outcomes.values()]),
    snapshot(forced){ return Object.freeze({status:forced || (startedAt?'OPERATIONAL':'READY'),startedAt,outcomesGenerated,retainedOutcomes:outcomes.size,maxOutcomes,duplicatesIgnored,nonTerminalIgnored,failures,workflowMutationAllowed:false,autonomousExecutionAllowed:false,decisionTraceability:true}); }
  });
}
