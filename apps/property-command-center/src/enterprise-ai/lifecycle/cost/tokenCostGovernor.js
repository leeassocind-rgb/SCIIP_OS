const freeze=v=>Object.freeze(v);
export function governTokenAndCost({usage={},budgets={dailyUsd:100,dailyTokens:1000000}}={}){
 const costPct=budgets.dailyUsd?Number((Number(usage.costUsd||0)/budgets.dailyUsd*100).toFixed(2)):0;
 const tokenPct=budgets.dailyTokens?Number((Number(usage.tokens||0)/budgets.dailyTokens*100).toFixed(2)):0;
 const alerts=[];
 if(costPct>=100)alerts.push('COST_BUDGET_EXCEEDED');else if(costPct>=80)alerts.push('COST_BUDGET_WARNING');
 if(tokenPct>=100)alerts.push('TOKEN_BUDGET_EXCEEDED');else if(tokenPct>=80)alerts.push('TOKEN_BUDGET_WARNING');
 return freeze({costPct,tokenPct,alerts:freeze(alerts),alertCount:alerts.length,status:alerts.some(a=>a.endsWith('EXCEEDED'))?'BLOCKED':alerts.length?'WATCH':'HEALTHY',approvalRequired:alerts.length>0,autoThrottle:false,autonomousExecutionAllowed:false});
}
