const freeze=v=>Object.freeze(v);
export function optimizePerformance({baseline={},targets={}}={}){
 const recommendations=[];
 if(Number(baseline.apiLatencyMs||0)>Number(targets.apiLatencyMs||Infinity))recommendations.push('OPTIMIZE_API_PATH');
 if(Number(baseline.buildSeconds||0)>Number(targets.buildSeconds||Infinity))recommendations.push('OPTIMIZE_BUILD');
 if(Number(baseline.bundleKb||0)>Number(targets.bundleKb||Infinity))recommendations.push('REDUCE_BUNDLE');
 if(Number(baseline.interactionMs||0)>Number(targets.interactionMs||Infinity))recommendations.push('OPTIMIZE_INTERACTION');
 return freeze({
  recommendations:freeze(recommendations),
  recommendationCount:recommendations.length,
  baseline:freeze({...baseline}),
  targets:freeze({...targets}),
  status:recommendations.length?'OPTIMIZATION_REQUIRED':'OPTIMIZED',
  evidenceRequired:true,
  approvalRequired:true,
  changesAutoApplied:false
 });
}
