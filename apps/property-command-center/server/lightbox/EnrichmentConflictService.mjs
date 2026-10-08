import{propertyEvidenceMatrix}from'./EnrichmentEvidence.mjs';
import{extractSciipEvidence}from'./SciipEvidenceExtractor.mjs';
import{extractParcelEvidence}from'./LightBoxEvidenceExtractor.mjs';

export function buildPropertyConflictReport(property,lightBoxResolution){
  const canonical=extractSciipEvidence(property);
  const top=lightBoxResolution?.top||null;
  const external=top?extractParcelEvidence(top.parcel,{matchScore:top.score}):[];
  const matrix=propertyEvidenceMatrix([...canonical,...external]);
  const conflicts=matrix.filter(row=>row.status==='CONFLICT');
  return{
    propertyId:property?.id||null,
    status:conflicts.length?'REVIEW_REQUIRED':'ALIGNED',
    canonicalEvidenceCount:canonical.length,
    externalEvidenceCount:external.length,
    conflictCount:conflicts.length,
    conflicts,
    matrix
  };
}

export function buildConflictReviewQueue(reports=[]){
  return reports.filter(report=>report?.status==='REVIEW_REQUIRED')
    .sort((a,b)=>b.conflictCount-a.conflictCount||String(a.propertyId).localeCompare(String(b.propertyId)));
}
