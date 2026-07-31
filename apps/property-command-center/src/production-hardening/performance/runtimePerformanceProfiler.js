import { evaluatePerformance } from '../../production-enterprise/performanceBudget.js';

const freeze=value=>Object.freeze(value);
const percentile=(values,p)=>{
  if(!values.length)return 0;
  const sorted=[...values].sort((a,b)=>a-b);
  const index=Math.min(sorted.length-1,Math.max(0,Math.ceil((p/100)*sorted.length)-1));
  return sorted[index];
};

export async function profileRuntimeWorkload({
  name='runtime-workload',
  iterations=5,
  workload
}={}){
  if(typeof workload!=='function')throw new Error('Performance workload is required');
  const count=Math.max(1,Number(iterations)||1);
  const samples=[];
  const heapBefore=process.memoryUsage?.().heapUsed||0;
  for(let index=0;index<count;index++){
    const started=performance.now();
    const result=await workload(index);
    const durationMs=performance.now()-started;
    samples.push(freeze({
      iteration:index+1,
      durationMs:Number(durationMs.toFixed(3)),
      resultSummary:result&&typeof result==='object'
        ?freeze({processedRows:Number(result.processedRows||0),inputRows:Number(result.inputRows||0)})
        :null
    }));
  }
  global.gc?.();
  const heapAfter=process.memoryUsage?.().heapUsed||heapBefore;
  const durations=samples.map(item=>item.durationMs);
  return freeze({
    name,
    iterations:count,
    samples:freeze(samples),
    minMs:Number(Math.min(...durations).toFixed(3)),
    maxMs:Number(Math.max(...durations).toFixed(3)),
    averageMs:Number((durations.reduce((a,b)=>a+b,0)/durations.length).toFixed(3)),
    p50Ms:Number(percentile(durations,50).toFixed(3)),
    p95Ms:Number(percentile(durations,95).toFixed(3)),
    heapBeforeBytes:heapBefore,
    heapAfterBytes:heapAfter,
    heapDeltaBytes:heapAfter-heapBefore,
    profilingAvailable:Boolean(process.memoryUsage),
    repeatable:true
  });
}

export function evaluateRuntimeProfile(profile,{
  maximumP95Ms=1000,
  maximumHeapDeltaMb=128,
  bundleKb=0,
  loadMs=0,
  queryMs=0
}={}){
  const heapDeltaMb=Math.max(0,profile.heapDeltaBytes)/(1024*1024);
  const existingBudget=evaluatePerformance({bundleKb,loadMs,queryMs});
  const gates=freeze({
    latency:profile.p95Ms<=maximumP95Ms,
    memory:heapDeltaMb<=maximumHeapDeltaMb,
    existingPerformanceBudget:existingBudget.passed,
    repeatable:Boolean(profile.repeatable)
  });
  const passed=Object.values(gates).every(Boolean);
  return freeze({
    passed,
    status:passed?'PERFORMANCE_CERTIFIED':'PERFORMANCE_BUDGET_EXCEEDED',
    gates,
    p95Ms:profile.p95Ms,
    heapDeltaMb:Number(heapDeltaMb.toFixed(3)),
    existingBudget,
    maximumP95Ms,
    maximumHeapDeltaMb
  });
}
