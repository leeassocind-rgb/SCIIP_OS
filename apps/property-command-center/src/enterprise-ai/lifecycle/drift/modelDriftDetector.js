const freeze=v=>Object.freeze(v);
export function detectModelDrift({baseline={},current={},thresholds={quality:.05,latency:.2,cost:.2}}={}){
 const delta=(field)=>Number((Number(current[field]||0)-Number(baseline[field]||0)).toFixed(4));
 const qualityDrop=Number((Number(baseline.quality||0)-Number(current.quality||0)).toFixed(4));
 const latencyIncrease=baseline.latencyMs?Number(((current.latencyMs-baseline.latencyMs)/baseline.latencyMs).toFixed(4)):0;
 const costIncrease=baseline.costUsd?Number(((current.costUsd-baseline.costUsd)/baseline.costUsd).toFixed(4)):0;
 const findings=[];
 if(qualityDrop>=thresholds.quality)findings.push('QUALITY_DRIFT');
 if(latencyIncrease>=thresholds.latency)findings.push('LATENCY_DRIFT');
 if(costIncrease>=thresholds.cost)findings.push('COST_DRIFT');
 return freeze({findings:freeze(findings),findingCount:findings.length,qualityDrop,latencyIncrease,costIncrease,status:findings.length?'DRIFT_DETECTED':'STABLE',evaluationRequired:findings.length>0,autoRollback:false,autonomousExecutionAllowed:false});
}
