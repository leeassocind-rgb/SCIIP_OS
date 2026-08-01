const freeze=v=>Object.freeze(v);
export function evaluateScalingPolicy({metrics={},policy={minWorkers:1,maxWorkers:10,scaleOutQueueDepth:100,scaleInQueueDepth:10}}={}){
 const current=Number(metrics.workers||policy.minWorkers);
 let recommended=current,reason='HOLD';
 if(Number(metrics.queueDepth||0)>=policy.scaleOutQueueDepth&&current<policy.maxWorkers){recommended=current+1;reason='SCALE_OUT'}
 else if(Number(metrics.queueDepth||0)<=policy.scaleInQueueDepth&&current>policy.minWorkers){recommended=current-1;reason='SCALE_IN'}
 return freeze({
  currentWorkers:current,recommendedWorkers:recommended,reason,
  withinBounds:recommended>=policy.minWorkers&&recommended<=policy.maxWorkers,
  approvalRequired:recommended!==current,
  autoScaleApplied:false,
  autonomousExecutionAllowed:false
 });
}
