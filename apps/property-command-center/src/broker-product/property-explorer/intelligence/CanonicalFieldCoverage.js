// M2.21c embedded canonical field coverage helper.
function present(v){return !(v===null||v===undefined||v==='');}
function normKey(k){return String(k||'').replace(/[^a-z0-9]/gi,'').toLowerCase();}
function scalar(v){
  if(v&&typeof v==='object'){
    for(const k of ['value','displayValue','canonicalValue','rawValue']){
      if(present(v[k]))return v[k];
    }
    return null;
  }
  return present(v)?v:null;
}
const ALIASES={
  parcelId:['parcelId','apn','parcelApn','parcelNumber'],
  buildingSf:['buildingSf','buildingSF','buildingSize','buildingSizeSf','sf','squareFeet','building_sqft'],
  landAcres:['landAcres','landAc','siteAcres','siteAreaAcres','acres','landArea'],
  clearHeight:['clearHeight','clearHt','clearHeightFt','clearHeightFeet','clear'],
  powerAmps:['powerAmps','power','amps','electricalAmps','powerCapacityAmps'],
  propertyType:['propertyType','buildingType','assetType','type'],
  landUse:['landUse','landUseCode','use','useType'],
  askingRate:['askingRate','askRate','rate','leaseRate','askingLeaseRate'],
  leaseCompRate:['leaseCompRate','compRate','leaseComparableRate'],
  assessedTotal:['assessedTotal','assessedValue','totalAssessedValue'],
  ownership:['ownership','owner','ownerName'],
  zoning:['zoning','zone','zoningCode'],
  yearBuilt:['yearBuilt','builtYear','constructionYear']
};
function findDeep(root,aliases,maxDepth=5){
  if(!root||typeof root!=='object')return null;
  const wanted=new Set(aliases.map(normKey));
  const seen=new Set(),q=[{v:root,d:0,path:''}];
  while(q.length){
    const {v,d,path}=q.shift();
    if(!v||typeof v!=='object'||seen.has(v)||d>maxDepth)continue;
    seen.add(v);
    for(const [k,val] of Object.entries(v)){
      if(wanted.has(normKey(k))){
        const s=scalar(val);
        if(present(s))return{value:s,path:path?`${path}.${k}`:k};
      }
      if(val&&typeof val==='object'&&d<maxDepth)q.push({v:val,d:d+1,path:path?`${path}.${k}`:k});
    }
  }
  return null;
}
export function resolveCanonicalFieldCoverage(property,field){
  if(present(field?.effectiveCanonicalValue))return Object.freeze({
    value:field.effectiveCanonicalValue,source:'GOVERNED_PROVENANCE',path:field?.key||null,repaired:false
  });
  const hit=findDeep(property,ALIASES[field?.key]||[field?.key]);
  if(hit)return Object.freeze({value:hit.value,source:'CANONICAL_PROPERTY_RECORD',path:hit.path,repaired:true});
  return Object.freeze({value:null,source:'UNRESOLVED',path:null,repaired:false});
}
export function applyCanonicalFieldCoverage(property,fields=[]){
  return Object.freeze(fields.map(field=>{
    const coverage=resolveCanonicalFieldCoverage(property,field);
    return Object.freeze({...field,effectiveCanonicalValue:coverage.value,canonicalCoverage:coverage});
  }));
}
