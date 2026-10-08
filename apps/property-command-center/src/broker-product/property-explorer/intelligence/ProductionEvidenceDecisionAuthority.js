// SCIIP Explorer 3.0 — M2.73
const REQUIRED_DIMENSIONS=Object.freeze(['PROVENANCE_STATUS','SOURCE_TYPE','SPATIAL_SOURCE']);
function clean(value,fallback='UNAVAILABLE'){return typeof value==='string'&&value.trim()?value.trim():fallback;}

export function buildProductionEvidenceDecisionAuthority(certificationAttestation={}){
  const records=Array.isArray(certificationAttestation?.records)?certificationAttestation.records:[];
  const authorityRecords=REQUIRED_DIMENSIONS.map(id=>{
    const record=records.find(item=>item?.id===id);
    const attested=record?.state==='ATTESTED'&&record?.readOnly===true;
    return Object.freeze({
      id,
      authorityKey:`M2.73:${id}`,
      attestationKey:clean(record?.attestationKey),
      certificationKey:clean(record?.certificationKey),
      lineageKey:clean(record?.lineageKey),
      authority:clean(record?.authority),
      state:attested?'AUTHORIZED':record?'WITHHELD':'UNAVAILABLE',
      decisionState:attested?'DECISION_READY':'BLOCK',
      readOnly:true
    });
  });
  const authorizedCount=authorityRecords.filter(r=>r.state==='AUTHORIZED').length;
  const withheldCount=authorityRecords.filter(r=>r.state==='WITHHELD').length;
  const unavailableCount=authorityRecords.filter(r=>r.state==='UNAVAILABLE').length;
  const authorized=
    certificationAttestation?.status==='ATTESTED'&&
    certificationAttestation?.auditState==='COMPLETE'&&
    certificationAttestation?.readOnly===true&&
    authorizedCount===REQUIRED_DIMENSIONS.length;

  const basisKey=[
    clean(certificationAttestation?.attestationId),
    ...authorityRecords.map(r=>`${r.id}:${r.attestationKey}:${r.state}`)
  ].join('|');

  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_73_PRODUCTION_EVIDENCE_DECISION_AUTHORITY',
    version:'3.0-m2.73',
    status:authorized?'AUTHORIZED':'WITHHELD',
    decisionState:authorized?'DECISION_READY':'BLOCK',
    authorityId:`PEDA-${basisKey.split('').reduce((h,c)=>((h*33+c.charCodeAt(0))>>>0),5381).toString(16).toUpperCase().padStart(8,'0')}`,
    basis:'M2.72_PRODUCTION_EVIDENCE_CERTIFICATION_ATTESTATION',
    attestationId:clean(certificationAttestation?.attestationId),
    records:Object.freeze(authorityRecords),
    authorizedCount,
    withheldCount,
    unavailableCount,
    requiredCount:REQUIRED_DIMENSIONS.length,
    readOnly:true,
    appendOnly:true,
    canonicalMutation:false,
    governedMutation:false,
    automaticCanonicalWrites:false
  });
}
