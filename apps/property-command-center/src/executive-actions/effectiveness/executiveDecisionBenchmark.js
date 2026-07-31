import {calculateExecutiveDecisionKPIs} from './executiveDecisionKPIs.js';
export function benchmarkExecutiveDecisions(outcomes=[]) {
  const groups={}; for(const row of outcomes.filter(Boolean)){const key=row.decisionType||row.workflowType||'UNCLASSIFIED';(groups[key]||=[]).push(row);}
  const benchmarks=Object.entries(groups).map(([decisionType,rows])=>Object.freeze({decisionType,...calculateExecutiveDecisionKPIs(rows)})).sort((a,b)=>b.successRatePct-a.successRatePct||a.decisionType.localeCompare(b.decisionType));
  return Object.freeze(benchmarks.map((row,index)=>Object.freeze({...row,rank:index+1,percentile:benchmarks.length===1?100:Number((((benchmarks.length-index)/benchmarks.length)*100).toFixed(2))})));
}
