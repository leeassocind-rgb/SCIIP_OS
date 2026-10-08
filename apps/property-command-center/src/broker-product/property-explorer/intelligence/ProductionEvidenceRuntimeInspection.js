// SCIIP Explorer 3.0 — M2.67
const DIMENSIONS=Object.freeze([
  Object.freeze({id:'PROVENANCE_STATUS',label:'Provenance'}),
  Object.freeze({id:'SOURCE_TYPE',label:'Source Type'}),
  Object.freeze({id:'SPATIAL_SOURCE',label:'Spatial Source'})
]);

export function buildProductionEvidenceRuntimeInspection(disclosure={}){
  const missing=new Set(Array.isArray(disclosure?.missing)?disclosure.missing:[]);
  const dimensions=DIMENSIONS.map(d=>Object.freeze({...d,status:missing.has(d.id)?'MISSING':'READY'}));
  const missingCount=dimensions.filter(d=>d.status==='MISSING').length;
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_67_PRODUCTION_EVIDENCE_RUNTIME_DIMENSION_INSPECTION',
    version:'3.0-m2.67',
    status:missingCount===0?'COMPLETE':'DEGRADED',
    dimensions:Object.freeze(dimensions),
    readyCount:dimensions.length-missingCount,
    missingCount,
    readOnly:true,
    canonicalMutation:false,
    governedMutation:false,
    automaticCanonicalWrites:false
  });
}
