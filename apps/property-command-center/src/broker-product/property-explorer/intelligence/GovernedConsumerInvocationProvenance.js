// SCIIP Explorer 3.0 — M2.77
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCCI'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedConsumerInvocationProvenance(consumerRuntime={}){
  const bindings=Array.isArray(consumerRuntime?.bindings)?consumerRuntime.bindings:[];
  const runtimeReady=
    consumerRuntime?.status==='BOUND'&&
    consumerRuntime?.runtimeState==='CONSUMER_CONTEXT_READY'&&
    consumerRuntime?.sharedTruth===true&&
    consumerRuntime?.independentTruthReconstruction===false&&
    consumerRuntime?.readOnly===true&&
    consumerRuntime?.executionAuthority===false;

  const invocations=CONSUMERS.map(consumer=>{
    const binding=bindings.find(item=>item?.consumer===consumer);
    const invocable=
      runtimeReady&&
      binding?.state==='BOUND'&&
      binding?.contextState==='CONTEXT_READY'&&
      binding?.sharedTruth===true&&
      binding?.independentTruthReconstruction===false&&
      binding?.readOnly===true&&
      binding?.executionAuthority===false;

    const invocationId=stableId([
      clean(consumerRuntime?.runtimeId),
      clean(consumerRuntime?.contextId),
      clean(consumerRuntime?.propertyId),
      consumer,
      clean(binding?.bindingKey)
    ],'GCIP');

    return Object.freeze({
      consumer,
      invocationId,
      provenanceKey:`M2.77:${clean(consumerRuntime?.propertyId)}:${consumer}`,
      runtimeId:clean(consumerRuntime?.runtimeId),
      contextId:clean(consumerRuntime?.contextId),
      propertyId:clean(consumerRuntime?.propertyId),
      bindingKey:clean(binding?.bindingKey),
      state:invocable?'INVOCABLE':'BLOCKED',
      provenanceState:invocable?'ATTRIBUTABLE':'BLOCKED',
      sharedTruth:true,
      independentTruthReconstruction:false,
      readOnly:true,
      executionAuthority:false
    });
  });

  const invocableCount=invocations.filter(i=>i.state==='INVOCABLE').length;
  const blockedCount=invocations.length-invocableCount;
  const ready=runtimeReady&&invocableCount===CONSUMERS.length;

  const provenanceId=stableId([
    clean(consumerRuntime?.runtimeId),
    ...invocations.map(i=>`${i.consumer}:${i.invocationId}:${i.state}`)
  ],'GCPR');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_77_GOVERNED_CONSUMER_CONTEXT_INVOCATION_PROVENANCE',
    version:'3.0-m2.77',
    status:ready?'READY':'BLOCKED',
    invocationState:ready?'INVOCATION_READY':'BLOCKED',
    provenanceId,
    runtimeId:clean(consumerRuntime?.runtimeId),
    contextId:clean(consumerRuntime?.contextId),
    propertyId:clean(consumerRuntime?.propertyId),
    basis:'M2.76_GOVERNED_CONSUMER_CONTEXT_RUNTIME',
    invocations:Object.freeze(invocations),
    invocableCount,
    blockedCount,
    consumerCount:CONSUMERS.length,
    sharedTruth:true,
    attributable:true,
    reproducible:true,
    independentTruthReconstruction:false,
    readOnly:true,
    appendOnly:true,
    propertyScoped:true,
    executionAuthority:false,
    canonicalMutation:false,
    governedMutation:false,
    automaticCanonicalWrites:false
  });
}
