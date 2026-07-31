const pct=(n,d)=>d?Number(((n/d)*100).toFixed(2)):0;
export function calculateExecutiveDecisionKPIs(outcomes=[]) {
  const rows=outcomes.filter(Boolean), total=rows.length;
  const completed=rows.filter(r=>r.classification==='COMPLETED').length;
  const failed=rows.filter(r=>r.classification==='FAILED').length;
  const cancelled=rows.filter(r=>r.classification==='CANCELLED').length;
  const review=rows.filter(r=>r.requiresReview).length;
  const evidenceComplete=rows.filter(r=>Number(r.evidenceCount||0)>0).length;
  const durations=rows.map(r=>Number(r.durationMs||0)).filter(n=>n>=0);
  const avgDurationMs=durations.length?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length):0;
  return Object.freeze({total,completed,failed,cancelled,review,successRatePct:pct(completed,total),failureRatePct:pct(failed,total),cancellationRatePct:pct(cancelled,total),reviewRatePct:pct(review,total),evidenceCompletenessPct:pct(evidenceComplete,total),avgDurationMs});
}
