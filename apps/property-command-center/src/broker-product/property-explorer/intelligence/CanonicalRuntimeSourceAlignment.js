// M2.21c — runtime alignment
function present(v){return !(v===null||v===undefined||v==='');}
function scalar(v){
  if(v&&typeof v==='object'){
    for(const k of ['value','displayValue','canonicalValue','rawValue']){
      if(present(v[k]))return v[k];
    }
    return null;
  }
  return present(v)?v:null;
}
function normalizeKey(k){return String(k||'').replace(/[^a-z0-9]/gi,'').toLowerCase();}
const FIELD_KEYS={
  parcelId:['parcelId','parcel','apn','parcelApn','parcelNumber'],
  buildingSf:['buildingSf','buildingSF','buildingSize','buildingSizeSf','sf','squareFeet'],
  landAcres:['landAcres','landAc','acres','siteAcres','siteAreaAcres','landArea'],
  clearHeight:['clearHeight','clearHt','clearHeightFt','clearHeightFeet','clear'],
  powerAmps:['powerAmps','power','amps','electricalAmps','powerCapacityAmps'],
  propertyType:['propertyType','buildingType','assetType','type'],
  landUse:['landUse','landUseCode','use','useType'],
  assessedTotal:['assessedTotal','assessedValue','totalAssessedValue'],
  zoning:['zoning','zone','zoningCode'],
  ownership:['ownership','owner','ownerName'],
  yearBuilt:['yearBuilt','builtYear','constructionYear'],
  askingRate:['askingRate','askRate','rate','leaseRate'],
  leaseCompRate:['leaseCompRate','compRate','leaseComparableRate']
};
function directObjectHit(obj,aliases){
  if(!obj||typeof obj!=='object')return null;
  const wanted=new Set(aliases.map(normalizeKey));
  for(const [k,v] of Object.entries(obj)){
    if(!wanted.has(normalizeKey(k)))continue;
    const s=scalar(v);
    if(present(s))return{value:s,key:k};
  }
  return null;
}
export function runtimeCanonicalSources(property,model){
  return [
    {name:'MODEL_PROPERTY',value:model?.property},
    {name:'SELECTED_PROPERTY',value:model?.selectedProperty},
    {name:'CANONICAL_PROPERTY',value:model?.canonicalProperty},
    {name:'PROPERTY_RECORD',value:model?.propertyRecord},
    {name:'ROOT_MODEL',value:model},
    {name:'PROPERTY_ARGUMENT',value:property}
  ].filter(x=>x.value&&typeof x.value==='object');
}
export function resolveRuntimeCanonicalValue(property,model,fieldKey){
  const aliases=FIELD_KEYS[fieldKey]||[fieldKey];
  for(const source of runtimeCanonicalSources(property,model)){
    const hit=directObjectHit(source.value,aliases);
    if(hit)return Object.freeze({value:hit.value,source:source.name,runtimeKey:hit.key});
  }
  return Object.freeze({value:null,source:'UNRESOLVED',runtimeKey:null});
}
export function alignCanonicalRuntimeFields(property,model,fields=[]){
  return Object.freeze(fields.map(field=>{
    if(present(field?.effectiveCanonicalValue)){
      return Object.freeze({...field,canonicalRuntimeAlignment:Object.freeze({
        value:field.effectiveCanonicalValue,source:'GOVERNED_PROVENANCE',runtimeKey:field.key,aligned:true
      })});
    }
    const runtime=resolveRuntimeCanonicalValue(property,model,field.key);
    return Object.freeze({
      ...field,
      effectiveCanonicalValue:present(runtime.value)?runtime.value:field?.effectiveCanonicalValue??null,
      canonicalRuntimeAlignment:Object.freeze({...runtime,aligned:present(runtime.value)})
    });
  }));
}
export function assertNoKnownCanonicalMissing(gaps,fields){
  const byKey=new Map((fields||[]).map(x=>[x.key,x]));
  const violations=(gaps||[]).filter(g=>{
    if(g.type!=='MISSING')return false;
    const f=byKey.get(g.fieldKey);
    return present(f?.effectiveCanonicalValue);
  });
  return Object.freeze({valid:violations.length===0,violations:Object.freeze(violations.map(x=>x.fieldKey))});
}
