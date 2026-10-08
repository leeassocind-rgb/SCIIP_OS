export function inspectProductionCanonicalStoreAdapterContract(sourceText=""){
  const hasFactory=/createCertifiedCanonicalPropertyStoreAdapter/.test(sourceText);
  const hasPhysicalAtomicWrite=/atomicWriteJson|writeAtomic/.test(sourceText);
  const hasReadBinding=/certifyCanonicalStoreReadBinding|read/i.test(sourceText);
  const hasAtomicInsertCallable=/\batomicInsert\b/.test(sourceText);
  const hasReadAfterWriteCallable=/\breadAfterWrite\b/.test(sourceText);
  const rejectsMissingTarget=/TARGET_NOT_FOUND/.test(sourceText);

  return Object.freeze({
    hasFactory,
    hasPhysicalAtomicWrite,
    hasReadBinding,
    hasAtomicInsertCallable,
    hasReadAfterWriteCallable,
    rejectsMissingTarget,
    existingAdapterDirectlySatisfiesFirstInsertContract:
      hasFactory && hasAtomicInsertCallable && hasReadAfterWriteCallable && !rejectsMissingTarget
  });
}

export function buildFirstInsertDryRunShadowStore(){
  const records=new Map();
  const bySource=new Map();
  const idempotency=new Set();
  const metrics={atomicInsertCalls:0,readAfterWriteCalls:0};

  return Object.freeze({
    metrics,
    async lookupBySourcePropertyId(sourcePropertyId){
      const canonicalPropertyId=bySource.get(sourcePropertyId);
      return canonicalPropertyId ? {found:true,canonicalPropertyId} : {found:false};
    },
    async lookupByCanonicalPropertyId(canonicalPropertyId){
      return records.has(canonicalPropertyId)
        ? {found:true,record:records.get(canonicalPropertyId)}
        : {found:false};
    },
    async atomicInsert({canonicalPropertyId,sourcePropertyId,normalizedAddress,event,idempotencyKey}){
      metrics.atomicInsertCalls++;
      if(records.has(canonicalPropertyId)) return {committed:false,state:"DUPLICATE_CANONICAL_PROPERTY_ID"};
      if(bySource.has(sourcePropertyId)) return {committed:false,state:"DUPLICATE_SOURCE_PROPERTY_ID"};
      if(idempotency.has(idempotencyKey)) return {committed:false,state:"IDEMPOTENCY_DUPLICATE"};
      records.set(canonicalPropertyId,{canonicalPropertyId,sourcePropertyId,normalizedAddress,event,idempotencyKey});
      bySource.set(sourcePropertyId,canonicalPropertyId);
      idempotency.add(idempotencyKey);
      return {committed:true,state:"SHADOW_FIRST_INSERT_COMMITTED"};
    },
    async readAfterWrite({canonicalPropertyId,sourcePropertyId,idempotencyKey}){
      metrics.readAfterWriteCalls++;
      const r=records.get(canonicalPropertyId);
      return {verified:Boolean(r&&r.sourcePropertyId===sourcePropertyId&&r.idempotencyKey===idempotencyKey)};
    },
    snapshot(){ return [...records.values()].map(x=>({...x})); }
  });
}
