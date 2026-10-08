// SCIIP Explorer 3.0 — M2.72
const REQUIRED_DIMENSIONS=Object.freeze(['PROVENANCE_STATUS','SOURCE_TYPE','SPATIAL_SOURCE']);
function clean(value,fallback='UNAVAILABLE'){return typeof value==='string'&&value.trim()?value.trim():fallback;}
export function buildProductionEvidenceCertificationAttestation(certificationGate={}){
  const records=Array.isArray(certificationGate?.records)?certificationGate.records:[];
  const attestedRecords=REQUIRED_DIMENSIONS.map(id=>{
    const record=records.find(item=>item?.id===id);
    const certified=record?.state==='CERTIFIED'&&record?.readOnly===true;
    return Object.freeze({
      id,
      attestationKey:`M2.72:${id}`,
      certificationKey:clean(record?.certificationKey),
      lineageKey:clean(record?.lineageKey),
      state:certified?'ATTESTED':record?'NOT_ATTESTED':'UNAVAILABLE',
      certificationState:clean(record?.state),
      authority:clean(record?.authority),
      artifact:clean(record?.artifact),
      recordKey:clean(record?.recordKey),
      readOnly:true
    });
  });
  const attestedCount=attestedRecords.filter(r=>r.state==='ATTESTED').length;
  const notAttestedCount=attestedRecords.filter(r=>r.state==='NOT_ATTESTED').length;
  const unavailableCount=attestedRecords.filter(r=>r.state==='UNAVAILABLE').length;
  const attested=certificationGate?.status==='CERTIFIED'&&certificationGate?.gateState==='PASS'&&attestedCount===REQUIRED_DIMENSIONS.length;
  const basisKey=attestedRecords.map(r=>`${r.id}:${r.certificationKey}:${r.lineageKey}:${r.state}`).join('|');
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_72_PRODUCTION_EVIDENCE_CERTIFICATION_ATTESTATION',
    version:'3.0-m2.72',
    status:attested?'ATTESTED':'NOT_ATTESTED',
    auditState:attested?'COMPLETE':'BLOCKED',
    attestationId:`PECA-${basisKey.split('').reduce((h,c)=>((h*31+c.charCodeAt(0))>>>0),2166136261).toString(16).toUpperCase().padStart(8,'0')}`,
    basis:'M2.71_PRODUCTION_EVIDENCE_CERTIFICATION_GATE',
    records:Object.freeze(attestedRecords),
    attestedCount,notAttestedCount,unavailableCount,requiredCount:REQUIRED_DIMENSIONS.length,
    readOnly:true,appendOnly:true,canonicalMutation:false,governedMutation:false,automaticCanonicalWrites:false
  });
}
