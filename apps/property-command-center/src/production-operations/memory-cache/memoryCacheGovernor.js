const freeze=v=>Object.freeze(v);
export function governMemoryAndCache({memory={},cache={},limits={memoryPct:85,minHitRatePct:80,maxEntries:10000}}={}){
 const actions=[];
 if(Number(memory.utilizationPct||0)>limits.memoryPct)actions.push('EVICT_NONCRITICAL_CACHE');
 if(Number(cache.hitRatePct||0)<limits.minHitRatePct)actions.push('REBALANCE_CACHE_KEYS');
 if(Number(cache.entries||0)>limits.maxEntries)actions.push('TRIM_CACHE_ENTRIES');
 return freeze({
  actions:freeze(actions),
  actionCount:actions.length,
  memoryWithinBudget:Number(memory.utilizationPct||0)<=limits.memoryPct,
  cacheHealthy:Number(cache.hitRatePct||0)>=limits.minHitRatePct&&Number(cache.entries||0)<=limits.maxEntries,
  policyDriven:true,
  approvalRequired:true,
  changesAutoApplied:false,
  autonomousExecutionAllowed:false
 });
}
