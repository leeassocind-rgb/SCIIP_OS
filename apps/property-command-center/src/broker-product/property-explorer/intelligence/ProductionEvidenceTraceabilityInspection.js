// SCIIP Explorer 3.0 — M2.69
const TRACEABILITY_SCHEMA=Object.freeze({
  PROVENANCE_STATUS:Object.freeze({originType:'GOVERNANCE',authority:'SCIIP_GOVERNED_PROVENANCE'}),
  SOURCE_TYPE:Object.freeze({originType:'SOURCE_CLASSIFICATION',authority:'SCIIP_SOURCE_CLASSIFICATION'}),
  SPATIAL_SOURCE:Object.freeze({originType:'SPATIAL_ARTIFACT',authority:'SCIIP_SPATIAL_PROVENANCE'})
});

function normalize(value){
  if(value===null||value===undefined||value===''||value==='MISSING')return 'UNAVAILABLE';
  return String(value);
}

export function buildProductionEvidenceTraceabilityInspection(sourceInspection={}){
  const sourceRecords=Array.isArray(sourceInspection?.records)?sourceInspection.records:[];
  const records=sourceRecords.map(record=>{
    const schema=TRACEABILITY_SCHEMA[record.id]||{originType:'EVIDENCE_RECORD',authority:'SCIIP_GOVERNED_RUNTIME'};
    const available=record.status==='AVAILABLE'&&normalize(record.value)!=='UNAVAILABLE';
    const sourceArtifact=record.id==='SPATIAL_SOURCE'?normalize(record.value):normalize(record.evidenceClass);
    return Object.freeze({
      id:record.id,label:record.label,traceKey:`M2.69:${record.id}`,
      sourceRecordKey:record.id,sourceArtifact,
      evidenceAuthority:schema.authority,originType:schema.originType,
      originPath:normalize(record.runtimePath),originValue:normalize(record.value),
      traceabilityState:available?'TRACEABLE':'DEGRADED',readOnly:true
    });
  });
  const traceableCount=records.filter(r=>r.traceabilityState==='TRACEABLE').length;
  const degradedCount=records.length-traceableCount;
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_69_PRODUCTION_EVIDENCE_RECORD_TRACEABILITY_ORIGIN_INSPECTION',
    version:'3.0-m2.69',status:records.length===3&&degradedCount===0?'TRACEABLE':'DEGRADED',
    records:Object.freeze(records),traceableCount,degradedCount,readOnly:true,
    canonicalMutation:false,governedMutation:false,automaticCanonicalWrites:false
  });
}
