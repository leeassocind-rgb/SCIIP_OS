// SCIIP Explorer 3.0 — M2.70
const REQUIRED_DIMENSIONS=Object.freeze(['PROVENANCE_STATUS','SOURCE_TYPE','SPATIAL_SOURCE']);

function normalize(value){
  if(value===null||value===undefined||value===''||value==='UNAVAILABLE'||value==='MISSING')return 'UNAVAILABLE';
  return String(value);
}

export function buildProductionEvidenceLineageIntegrity(traceabilityInspection={}){
  const sourceRecords=Array.isArray(traceabilityInspection?.records)?traceabilityInspection.records:[];
  const records=REQUIRED_DIMENSIONS.map(id=>{
    const record=sourceRecords.find(item=>item?.id===id);
    const present=Boolean(record);
    const traceable=present&&record.traceabilityState==='TRACEABLE';
    const artifact=normalize(record?.sourceArtifact);
    const recordKey=normalize(record?.sourceRecordKey);
    const authority=normalize(record?.evidenceAuthority);
    const originPath=normalize(record?.originPath);
    const originValue=normalize(record?.originValue);
    const complete=traceable&&artifact!=='UNAVAILABLE'&&recordKey!=='UNAVAILABLE'&&authority!=='UNAVAILABLE'&&originPath!=='UNAVAILABLE'&&originValue!=='UNAVAILABLE';
    return Object.freeze({
      id,label:record?.label||id,lineageKey:`M2.70:${id}`,
      sourceTraceKey:normalize(record?.traceKey),sourceArtifact:artifact,sourceRecordKey:recordKey,
      evidenceAuthority:authority,originPath,originValue,
      lineageState:complete?'VERIFIED':present?'DEGRADED':'BROKEN',
      continuity:complete?'CONTINUOUS':'INTERRUPTED',readOnly:true
    });
  });
  const verifiedCount=records.filter(r=>r.lineageState==='VERIFIED').length;
  const degradedCount=records.filter(r=>r.lineageState==='DEGRADED').length;
  const brokenCount=records.filter(r=>r.lineageState==='BROKEN').length;
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_70_PRODUCTION_EVIDENCE_LINEAGE_INTEGRITY_VERIFICATION',
    version:'3.0-m2.70',status:verifiedCount===3?'VERIFIED':'DEGRADED',
    records:Object.freeze(records),verifiedCount,degradedCount,brokenCount,
    continuityState:verifiedCount===3?'CONTINUOUS':'INTERRUPTED',readOnly:true,
    canonicalMutation:false,governedMutation:false,automaticCanonicalWrites:false
  });
}
