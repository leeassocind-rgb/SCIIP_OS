import{evidenceRecord}from'./EnrichmentEvidence.mjs';

export function extractSciipEvidence(property){
  if(!property)return[];
  const provenance=property.provenance||{};
  const sourceType=provenance.sourceType==='SUPERSHEET'?'SUPERSHEET':
    provenance.sourceType==='ASSIGNMENT'?'ASSIGNMENT':
    provenance.sourceType==='BASE_INVENTORY'?'BASE_INVENTORY':'SCIIP_CANONICAL';

  const fields=['address','city','zip','buildingSf','landAcres','clearHeightFt','powerAmps','owner','zoning','parcelId','status'];
  return fields.flatMap(field=>{
    const value=property[field];
    if(value===undefined||value===null||value==='')return[];
    return[evidenceRecord({
      field,value,
      sourceType,
      sourceId:property.id,
      sourceFile:provenance.sourceFiles?.[0]?.file||provenance.geometrySource?.file||null,
      provider:'SCIIP',
      confidence:100,
      status:'CANONICAL'
    })];
  });
}
