import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AE_CONTROLLED_SINGLE_RECORD_ENRICH_READ_EXECUTION_AND_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION";
export const VERSION="4.0-m4.19d4ae";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function walk(value,path=[] ,out=[]){
  if(Array.isArray(value)){
    value.forEach((v,i)=>walk(v,[...path,String(i)],out));
    return out;
  }
  if(value && typeof value==="object"){
    for(const [k,v] of Object.entries(value)){
      out.push({path:[...path,k].join("."),key:k,value:v});
      walk(v,[...path,k],out);
    }
  }
  return out;
}

export function semanticHits(doc){
  const rows=walk(doc);
  const available=[];
  const provenance=[];
  const timestamps=[];
  const sourceNative=[];
  for(const r of rows){
    const key=r.key.toLowerCase();
    if(/available.*sf|availablesf|available_square|availablesquare|availablearea|availarea/.test(key)){
      available.push(r);
    }
    if(/source|provider|provenance|recordid|parcelid|propertyid|lightbox/.test(key)){
      provenance.push(r);
    }
    if(/timestamp|observed|updated|retrieved|effective|asof|date/.test(key)){
      timestamps.push(r);
    }
    if(/raw|source|provider|lightbox|parcel|property/.test(key)){
      sourceNative.push(r);
    }
  }
  return {available,provenance,timestamps,sourceNative};
}

export function finiteSf(v){
  const n=Number(v);
  return Number.isFinite(n) && n>=0 ? n : null;
}
