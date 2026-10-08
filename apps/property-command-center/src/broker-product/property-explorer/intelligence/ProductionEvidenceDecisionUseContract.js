// SCIIP Explorer 3.0 — M2.74
const REQUIRED_DIMENSIONS=Object.freeze(['PROVENANCE_STATUS','SOURCE_TYPE','SPATIAL_SOURCE']);

function clean(value,fallback='UNAVAILABLE'){
  return typeof value==='string'&&value.trim()?value.trim():fallback;
}

function stableId(parts){
  const basis=parts.join('|');
  const hash=basis.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381);
  return `PEDU-${hash.toString(16).toUpperCase().padStart(8,'0')}`;
}

export function buildProductionEvidenceDecisionUseContract(decisionAuthority={}){
  const authorityRecords=Array.isArray(decisionAuthority?.records)?decisionAuthority.records:[];
  const records=REQUIRED_DIMENSIONS.map(id=>{
    const authorityRecord=authorityRecords.find(item=>item?.id===id);
    const eligible=
      authorityRecord?.state==='AUTHORIZED'&&
      authorityRecord?.decisionState==='DECISION_READY'&&
      authorityRecord?.readOnly===true;

    return Object.freeze({
      id,
      useKey:`M2.74:${id}`,
      authorityKey:clean(authorityRecord?.authorityKey),
      attestationKey:clean(authorityRecord?.attestationKey),
      certificationKey:clean(authorityRecord?.certificationKey),
      lineageKey:clean(authorityRecord?.lineageKey),
      state:eligible?'ELIGIBLE':'INELIGIBLE',
      consumerState:eligible?'DECISION_USE_READY':'BLOCKED',
      readOnly:true
    });
  });

  const eligibleCount=records.filter(r=>r.state==='ELIGIBLE').length;
  const ineligibleCount=records.length-eligibleCount;
  const published=
    decisionAuthority?.status==='AUTHORIZED'&&
    decisionAuthority?.decisionState==='DECISION_READY'&&
    decisionAuthority?.readOnly===true&&
    eligibleCount===REQUIRED_DIMENSIONS.length;

  const contractId=stableId([
    clean(decisionAuthority?.authorityId),
    ...records.map(r=>`${r.id}:${r.authorityKey}:${r.state}`)
  ]);

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_74_PRODUCTION_EVIDENCE_DECISION_USE_CONTRACT',
    version:'3.0-m2.74',
    status:published?'PUBLISHED':'WITHHELD',
    consumerState:published?'DECISION_USE_READY':'BLOCKED',
    contractId,
    basis:'M2.73_PRODUCTION_EVIDENCE_DECISION_AUTHORITY',
    authorityId:clean(decisionAuthority?.authorityId),
    records:Object.freeze(records),
    eligibleCount,
    ineligibleCount,
    requiredCount:REQUIRED_DIMENSIONS.length,
    readOnly:true,
    appendOnly:true,
    executionAuthority:false,
    canonicalMutation:false,
    governedMutation:false,
    automaticCanonicalWrites:false
  });
}
