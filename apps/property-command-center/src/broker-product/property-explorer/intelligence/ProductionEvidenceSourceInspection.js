// SCIIP Explorer 3.0 — M2.68
const SOURCE_LEVEL_DIMENSIONS=Object.freeze([
  Object.freeze({id:'PROVENANCE_STATUS',label:'Provenance',runtimePath:'property.provenance.gateStatus || property.provenance.status',evidenceClass:'GOVERNED_PROVENANCE'}),
  Object.freeze({id:'SOURCE_TYPE',label:'Source Type',runtimePath:'property.provenance.sourceType',evidenceClass:'SOURCE_CLASSIFICATION'}),
  Object.freeze({id:'SPATIAL_SOURCE',label:'Spatial Source',runtimePath:'property.provenance.geometrySource.file',evidenceClass:'SPATIAL_PROVENANCE'})
]);

function presentValue(value){
  if(value===null||value===undefined||value===''||value==='UNVERIFIED')return 'MISSING';
  return String(value);
}

export function buildProductionEvidenceSourceInspection({inspection={},provenanceStatus,sourceType,spatialSource}={}){
  const values={PROVENANCE_STATUS:provenanceStatus,SOURCE_TYPE:sourceType,SPATIAL_SOURCE:spatialSource};
  const dimensionStatus=new Map((Array.isArray(inspection?.dimensions)?inspection.dimensions:[]).map(d=>[d.id,d.status]));
  const records=SOURCE_LEVEL_DIMENSIONS.map(d=>{
    const value=values[d.id];
    const available=dimensionStatus.get(d.id)==='READY'&&presentValue(value)!=='MISSING';
    return Object.freeze({...d,status:available?'AVAILABLE':'MISSING',value:presentValue(value),readOnly:true});
  });
  const availableCount=records.filter(r=>r.status==='AVAILABLE').length;
  const missingCount=records.length-availableCount;
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_68_PRODUCTION_EVIDENCE_SOURCE_LEVEL_INSPECTION',
    version:'3.0-m2.68',status:missingCount===0?'COMPLETE':'DEGRADED',
    records:Object.freeze(records),availableCount,missingCount,readOnly:true,
    canonicalMutation:false,governedMutation:false,automaticCanonicalWrites:false
  });
}
