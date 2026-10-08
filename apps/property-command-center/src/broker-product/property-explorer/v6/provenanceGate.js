export const SOURCE_TYPES=Object.freeze({
  BASE_INVENTORY:'BASE_INVENTORY',
  SUPERSHEET:'SUPERSHEET',
  ASSIGNMENT:'ASSIGNMENT',
  COMPARABLE:'COMPARABLE',
  SYNTHETIC:'SYNTHETIC'
});

const normalize=value=>String(value??'').trim();
const hasFiniteCoordinate=value=>Number.isFinite(Number(value));

function hasSourceEvidence(property){
  const p=property?.provenance||{};
  const ids=[...(p.evidenceIds||[]),...(property?.sourceEvidenceIds||[])].filter(Boolean);
  const files=[...(p.sourceFiles||[])].filter(row=>row?.file);
  if(p.sourceType===SOURCE_TYPES.BASE_INVENTORY)return files.length>0&&Boolean(p.geometrySource?.file);
  if(p.sourceType===SOURCE_TYPES.SUPERSHEET){
    return ids.length>0||files.some(row=>/supersheet/i.test(row.file));
  }
  if(p.sourceType===SOURCE_TYPES.ASSIGNMENT)return ids.length>0;
  if(p.sourceType===SOURCE_TYPES.COMPARABLE)return ids.length>0||files.length>0;
  return false;
}

export function evaluatePropertyProvenance(property){
  const sourceType=property?.provenance?.sourceType||SOURCE_TYPES.SYNTHETIC;
  const reasons=[];
  if(!property?.id)reasons.push('MISSING_ID');
  if(!normalize(property?.address))reasons.push('MISSING_ADDRESS');
  if(!hasFiniteCoordinate(property?.lat)||!hasFiniteCoordinate(property?.lng))reasons.push('MISSING_SPATIAL_IDENTITY');
  if(sourceType===SOURCE_TYPES.SYNTHETIC)reasons.push('SYNTHETIC_SOURCE');
  if(!hasSourceEvidence(property))reasons.push('MISSING_SOURCE_EVIDENCE');
  if(property?.source==='SUPERSHEET'&&sourceType!==SOURCE_TYPES.SUPERSHEET)reasons.push('FALSE_SUPERSHEET_LABEL');
  return Object.freeze({
    eligible:reasons.length===0,
    sourceType,
    reasons:Object.freeze(reasons)
  });
}

export function gateProductionProperties(properties,{allowSynthetic=false}={}){
  const accepted=[];
  const rejected=[];
  for(const property of properties||[]){
    const result=evaluatePropertyProvenance(property);
    const synthetic=result.sourceType===SOURCE_TYPES.SYNTHETIC;
    if(result.eligible||(allowSynthetic&&synthetic)){
      accepted.push(Object.freeze({...property,provenance:Object.freeze({...property.provenance,gateStatus:result.eligible?'VERIFIED':'DEVELOPMENT_ONLY'})}));
    }else{
      rejected.push(Object.freeze({id:property?.id,address:property?.address,reasons:result.reasons}));
    }
  }
  return Object.freeze({accepted:Object.freeze(accepted),rejected:Object.freeze(rejected)});
}

export function dedupeGovernedProperties(properties){
  const byIdentity=new Map();
  for(const property of properties||[]){
    const key=normalize(property?.provenance?.identityKey)||`${normalize(property?.address).toUpperCase()}|${normalize(property?.city).toUpperCase()}|${normalize(property?.zip)}`;
    const existing=byIdentity.get(key);
    if(!existing){byIdentity.set(key,property);continue;}
    const priority={ASSIGNMENT:4,SUPERSHEET:3,COMPARABLE:2,BASE_INVENTORY:1,SYNTHETIC:0};
    const currentPriority=priority[property?.provenance?.sourceType]??0;
    const existingPriority=priority[existing?.provenance?.sourceType]??0;
    if(currentPriority>existingPriority)byIdentity.set(key,property);
  }
  return [...byIdentity.values()];
}
