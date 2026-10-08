// SCIIP Explorer 3.0 — M2.71
const REQUIRED_DIMENSIONS=Object.freeze(['PROVENANCE_STATUS','SOURCE_TYPE','SPATIAL_SOURCE']);
export function buildProductionEvidenceCertificationGate(lineageIntegrity={}){
  const records=Array.isArray(lineageIntegrity?.records)?lineageIntegrity.records:[];
  const certifiedRecords=REQUIRED_DIMENSIONS.map(id=>{
    const record=records.find(item=>item?.id===id);
    const certified=Boolean(record)&&record.lineageState==='VERIFIED'&&record.continuity==='CONTINUOUS'&&record.readOnly===true;
    return Object.freeze({id,certificationKey:`M2.71:${id}`,lineageKey:record?.lineageKey||'UNAVAILABLE',state:certified?'CERTIFIED':record?'BLOCKED':'UNAVAILABLE',authority:record?.evidenceAuthority||'UNAVAILABLE',artifact:record?.sourceArtifact||'UNAVAILABLE',recordKey:record?.sourceRecordKey||'UNAVAILABLE',readOnly:true});
  });
  const certifiedCount=certifiedRecords.filter(r=>r.state==='CERTIFIED').length;
  const blockedCount=certifiedRecords.filter(r=>r.state==='BLOCKED').length;
  const unavailableCount=certifiedRecords.filter(r=>r.state==='UNAVAILABLE').length;
  const certified=certifiedCount===REQUIRED_DIMENSIONS.length&&lineageIntegrity?.status==='VERIFIED'&&lineageIntegrity?.continuityState==='CONTINUOUS';
  return Object.freeze({contract:'SCIIP_EXPLORER_3_M2_71_PRODUCTION_EVIDENCE_CERTIFICATION_GATE',version:'3.0-m2.71',status:certified?'CERTIFIED':'NOT_CERTIFIED',gateState:certified?'PASS':'BLOCK',records:Object.freeze(certifiedRecords),certifiedCount,blockedCount,unavailableCount,requiredCount:REQUIRED_DIMENSIONS.length,readOnly:true,canonicalMutation:false,governedMutation:false,automaticCanonicalWrites:false});
}
