const normalize=value=>String(value??'').trim();
const normCompare=value=>normalize(value).toUpperCase().replace(/[^A-Z0-9.]+/g,' ').replace(/\s+/g,' ').trim();

export const SOURCE_PRECEDENCE=Object.freeze({
  SCIIP_CANONICAL:100,
  ASSIGNMENT:95,
  SUPERSHEET:90,
  BASE_INVENTORY:80,
  COMPARABLE:75,
  LIGHTBOX_VERIFIED:70,
  LIGHTBOX_UNVERIFIED:30,
  SYNTHETIC:0
});

export function evidenceRecord({
  field,
  value,
  sourceType,
  sourceId=null,
  sourceFile=null,
  provider=null,
  confidence=null,
  observedAt=null,
  contractId=null,
  status='OBSERVED'
}){
  return Object.freeze({
    field,
    value,
    sourceType,
    sourceId,
    sourceFile,
    provider,
    confidence,
    observedAt,
    contractId,
    status,
    precedence:SOURCE_PRECEDENCE[sourceType]??0
  });
}

export function valuesConflict(a,b){
  if(a===null||a===undefined||b===null||b===undefined)return false;
  if(typeof a==='number'&&typeof b==='number'){
    const scale=Math.max(Math.abs(a),Math.abs(b),1);
    return Math.abs(a-b)/scale>.005;
  }
  return normCompare(a)!==normCompare(b);
}

export function fieldEvidenceSummary(field,records=[]){
  const rows=records.filter(row=>row.field===field).sort((a,b)=>b.precedence-a.precedence);
  const authoritative=rows[0]||null;
  const conflicts=authoritative?rows.slice(1).filter(row=>valuesConflict(authoritative.value,row.value)):[];
  return{
    field,
    authoritative,
    evidenceCount:rows.length,
    conflictCount:conflicts.length,
    conflicts,
    status:conflicts.length?'CONFLICT':'ALIGNED'
  };
}

export function propertyEvidenceMatrix(records=[]){
  const fields=[...new Set(records.map(row=>row.field).filter(Boolean))];
  return fields.map(field=>fieldEvidenceSummary(field,records))
    .sort((a,b)=>String(a.field).localeCompare(String(b.field)));
}
