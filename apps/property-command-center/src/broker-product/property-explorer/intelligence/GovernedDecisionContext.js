// SCIIP Explorer 3.0 — M2.75
const CONSUMERS=Object.freeze(['COPILOT','ANALYZE','PRESENT','RECOMMENDED_ACTIONS']);
const REQUIRED_DIMENSIONS=Object.freeze(['PROVENANCE_STATUS','SOURCE_TYPE','SPATIAL_SOURCE']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts,prefix='GDCH'){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `${prefix}-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildGovernedDecisionContext({
  decisionUseContract={},
  property={}
}={}){
  const sourceRecords=Array.isArray(decisionUseContract?.records)?decisionUseContract.records:[];
  const propertyId=clean(property?.id||property?.propertyId);
  const eligible=
    decisionUseContract?.status==='PUBLISHED'&&
    decisionUseContract?.consumerState==='DECISION_USE_READY'&&
    decisionUseContract?.readOnly===true&&
    decisionUseContract?.executionAuthority===false&&
    propertyId!=='UNAVAILABLE';

  const dimensions=REQUIRED_DIMENSIONS.map(id=>{
    const record=sourceRecords.find(r=>r?.id===id);
    const ready=eligible&&record?.state==='ELIGIBLE'&&record?.consumerState==='DECISION_USE_READY';
    return Object.freeze({
      id,
      contextKey:`M2.75:${propertyId}:${id}`,
      useKey:clean(record?.useKey),
      authorityKey:clean(record?.authorityKey),
      state:ready?'READY':'BLOCKED',
      readOnly:true
    });
  });

  const readyCount=dimensions.filter(d=>d.state==='READY').length;
  const contextReady=eligible&&readyCount===REQUIRED_DIMENSIONS.length;

  const consumerBindings=CONSUMERS.map(consumer=>Object.freeze({
    consumer,
    state:contextReady?'AVAILABLE':'BLOCKED',
    executionAuthority:false,
    readOnly:true
  }));

  const contextId=stableId([
    propertyId,
    clean(decisionUseContract?.contractId),
    ...dimensions.map(d=>`${d.id}:${d.useKey}:${d.state}`)
  ]);

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_75_GOVERNED_DECISION_CONTEXT_CONSUMER_HANDOFF',
    version:'3.0-m2.75',
    status:contextReady?'PUBLISHED':'WITHHELD',
    contextState:contextReady?'CONTEXT_READY':'BLOCKED',
    contextId,
    propertyId,
    decisionUseContractId:clean(decisionUseContract?.contractId),
    basis:'M2.74_PRODUCTION_EVIDENCE_DECISION_USE_CONTRACT',
    dimensions:Object.freeze(dimensions),
    consumerBindings:Object.freeze(consumerBindings),
    readyCount,
    requiredCount:REQUIRED_DIMENSIONS.length,
    consumerCount:CONSUMERS.length,
    readOnly:true,
    appendOnly:true,
    propertyScoped:true,
    executionAuthority:false,
    canonicalMutation:false,
    governedMutation:false,
    automaticCanonicalWrites:false
  });
}
