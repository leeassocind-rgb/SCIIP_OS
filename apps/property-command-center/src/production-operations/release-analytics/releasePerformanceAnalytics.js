const freeze=v=>Object.freeze(v);
export function analyzeReleasePerformance({before={},after={}}={}){
 const delta=(field)=>Number((Number(after[field]||0)-Number(before[field]||0)).toFixed(2));
 const metrics=freeze({apiLatencyDeltaMs:delta('apiLatencyMs'),buildDeltaSeconds:delta('buildSeconds'),bundleDeltaKb:delta('bundleKb'),errorRateDeltaPct:delta('errorRatePct')});
 const regressions=Object.entries(metrics).filter(([,value])=>value>0).map(([key])=>key);
 return freeze({
  metrics,
  regressions:freeze(regressions),
  regressionCount:regressions.length,
  status:regressions.length?'REGRESSION_DETECTED':'IMPROVED',
  releaseApprovalRequired:regressions.length>0,
  evidenceBacked:true,
  autonomousRollbackAllowed:false
 });
}
