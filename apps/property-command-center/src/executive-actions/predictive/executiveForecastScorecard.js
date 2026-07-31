import {forecastExecutiveTrend} from './executiveTrendForecaster.js';
import {forecastExecutiveRisk} from './executiveRiskForecast.js';
import {modelExecutiveScenarios} from './executiveScenarioModel.js';
import {detectExecutiveLeadingIndicators} from './executiveLeadingIndicators.js';
export function createExecutiveForecastScorecard({portfolioId='ENTERPRISE',history=[]}={}){
  const health=forecastExecutiveTrend(history,'healthScore',3); const risk=forecastExecutiveRisk(history);
  const baseline=health.forecast[0]??Number(history.at(-1)?.healthScore||0);
  return Object.freeze({portfolioId,generatedAt:new Date(0).toISOString(),healthForecast:health,riskForecast:risk,scenarios:modelExecutiveScenarios({baselineScore:baseline,volatility:5}),leadingIndicators:detectExecutiveLeadingIndicators(history),confidence:history.length>=5?'HIGH':history.length>=3?'MEDIUM':'LOW',readOnly:true,advisoryOnly:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false,decisionTraceability:true});
}
