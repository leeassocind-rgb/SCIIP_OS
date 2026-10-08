// SCIIP Explorer 3.0 — M2.76
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GCCR'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedConsumerContextRuntime(decisionContext={}){
  const contextReady=
    decisionContext?.status==='PUBLISHED'&&
    decisionContext?.contextState==='CONTEXT_READY'&&
    decisionContext?.propertyScoped===true&&
    decisionContext?.readOnly===true&&
    decisionContext?.executionAuthority===false;

  const sourceBindings=Array.isArray(decisionContext?.consumerBindings)
    ?decisionContext.consumerBindings:[];

  const bindings=CONSUMERS.map(consumer=>{
    const source=sourceBindings.find(item=>item?.consumer===consumer);
    const bound=
      contextReady&&
      source?.state==='AVAILABLE'&&
      source?.readOnly===true&&
      source?.executionAuthority===false;

    return Object.freeze({
      consumer,
      bindingKey:`M2.76:${clean(decisionContext?.propertyId)}:${consumer}`,
      contextId:clean(decisionContext?.contextId),
      propertyId:clean(decisionContext?.propertyId),
      state:bound?'BOUND':'BLOCKED',
      contextState:bound?'CONTEXT_READY':'BLOCKED',
      sharedTruth:true,
      independentTruthReconstruction:false,
      readOnly:true,
      executionAuthority:false
    });
  });

  const boundCount=bindings.filter(b=>b.state==='BOUND').length;
  const blockedCount=bindings.length-boundCount;
  const runtimeReady=contextReady&&boundCount===CONSUMERS.length;

  const runtimeId=stableId([
    clean(decisionContext?.contextId),
    clean(decisionContext?.propertyId),
    ...bindings.map(b=>`${b.consumer}:${b.state}`)
  ]);

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_76_GOVERNED_CONSUMER_CONTEXT_RUNTIME',
    version:'3.0-m2.76',
    status:runtimeReady?'BOUND':'BLOCKED',
    runtimeState:runtimeReady?'CONSUMER_CONTEXT_READY':'BLOCKED',
    runtimeId,
    contextId:clean(decisionContext?.contextId),
    propertyId:clean(decisionContext?.propertyId),
    basis:'M2.75_GOVERNED_DECISION_CONTEXT',
    bindings:Object.freeze(bindings),
    boundCount,
    blockedCount,
    consumerCount:CONSUMERS.length,
    sharedTruth:true,
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
