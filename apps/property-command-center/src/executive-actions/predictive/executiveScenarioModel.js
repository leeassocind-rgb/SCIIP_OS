const clamp=n=>Math.max(0,Math.min(100,Math.round(n*100)/100));
export function modelExecutiveScenarios({baselineScore=0,volatility=5}={}){
  return Object.freeze([
    Object.freeze({scenario:'CONSERVATIVE',projectedScore:clamp(baselineScore-volatility),probabilityWeight:.25}),
    Object.freeze({scenario:'BASELINE',projectedScore:clamp(baselineScore),probabilityWeight:.5}),
    Object.freeze({scenario:'OPTIMISTIC',projectedScore:clamp(baselineScore+volatility),probabilityWeight:.25})
  ]);
}
