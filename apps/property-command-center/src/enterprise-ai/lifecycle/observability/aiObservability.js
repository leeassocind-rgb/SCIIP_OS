const freeze=v=>Object.freeze(v);
export function observeAIRuntime({requests=[],windowMinutes=60}={}){
 const total=requests.length;
 const avg=f=>total?Number((requests.reduce((s,r)=>s+Number(r[f]||0),0)/total).toFixed(3)):0;
 const failures=requests.filter(r=>r.status==='FAILED').length;
 return freeze({
  windowMinutes,totalRequests:total,failedRequests:failures,
  failureRate:total?Number((failures/total).toFixed(3)):0,
  averageLatencyMs:avg('latencyMs'),
  averageTokens:avg('tokens'),
  averageCostUsd:avg('costUsd'),
  modelUsage:freeze(Object.entries(requests.reduce((m,r)=>{m[r.modelId]=(m[r.modelId]||0)+1;return m},{})).map(([modelId,count])=>freeze({modelId,count}))),
  realTime:true,traceable:true,productionWritesGoverned:true,autonomousExecutionAllowed:false
 });
}
