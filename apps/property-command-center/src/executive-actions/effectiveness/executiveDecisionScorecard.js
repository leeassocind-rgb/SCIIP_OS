import {calculateExecutiveDecisionKPIs} from './executiveDecisionKPIs.js';
import {analyzeExecutiveDecisionTrend} from './executiveDecisionTrendAnalyzer.js';
export function createExecutiveDecisionScorecard({decisionId,decisionType='UNCLASSIFIED',outcomes=[]}={}) {
  const kpis=calculateExecutiveDecisionKPIs(outcomes),trend=analyzeExecutiveDecisionTrend(outcomes);
  const evidence=Number(kpis.evidenceCompletenessPct||0), success=Number(kpis.successRatePct||0), reviewPenalty=Math.min(20,Number(kpis.reviewRatePct||0)*0.2);
  const score=Math.max(0,Math.min(100,Number((success*0.7+evidence*0.3-reviewPenalty).toFixed(2))));
  const confidence=outcomes.length>=5?'HIGH':outcomes.length>=2?'MEDIUM':'LOW';
  return Object.freeze({scorecardId:`SCORECARD:${decisionId||decisionType}`,decisionId:decisionId||null,decisionType,kpis,trend,effectivenessScore:score,confidence,generatedAt:new Date().toISOString(),immutable:true,readOnly:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false,decisionTraceability:true});
}
