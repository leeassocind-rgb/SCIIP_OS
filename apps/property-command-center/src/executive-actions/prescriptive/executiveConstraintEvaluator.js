export function evaluateExecutiveConstraints(alternative={},constraints={}){
  const violations=[];
  const estimatedCost=Number(alternative.estimatedCost||0), estimatedDays=Number(alternative.estimatedDays||0), riskScore=Number(alternative.riskScore||0);
  if(Number.isFinite(Number(constraints.maxCost))&&estimatedCost>Number(constraints.maxCost))violations.push('MAX_COST_EXCEEDED');
  if(Number.isFinite(Number(constraints.maxDays))&&estimatedDays>Number(constraints.maxDays))violations.push('MAX_DURATION_EXCEEDED');
  if(Number.isFinite(Number(constraints.maxRiskScore))&&riskScore>Number(constraints.maxRiskScore))violations.push('MAX_RISK_EXCEEDED');
  const required=[...(constraints.requiredCapabilities||[])]; const capabilities=[...(alternative.capabilities||[])];
  for(const item of required)if(!capabilities.includes(item))violations.push(`MISSING_CAPABILITY:${item}`);
  return Object.freeze({feasible:violations.length===0,violations:Object.freeze(violations),evaluatedConstraints:Object.freeze({...constraints})});
}
