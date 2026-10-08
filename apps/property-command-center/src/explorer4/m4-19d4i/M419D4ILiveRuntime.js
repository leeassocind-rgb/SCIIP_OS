import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4I_LIGHTBOX_SINGLE_RECORD_POST_DRY_RUN_EXECUTION_AND_SOURCE_NATIVE_AVAILABLE_SF_QUALIFICATION";
export const VERSION="4.0-m4.19d4i";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function collect(node,out=[]){
  if(Array.isArray(node)){ for(const x of node) collect(x,out); }
  else if(node && typeof node==="object"){
    out.push(node);
    for(const v of Object.values(node)) collect(v,out);
  }
  return out;
}
export function numberLike(v){
  if(typeof v==="number"&&Number.isFinite(v)) return v;
  if(typeof v==="string"&&v.trim()!==""){
    const n=Number(v.replace(/,/g,"").replace(/[^\d.-]/g,""));
    return Number.isFinite(n)?n:null;
  }
  return null;
}
export function findAvailableSf(doc){
  const hits=[];
  const exact=["availableSf","availableSF","available_sf","availableSqFt","availableSqft","availableSquareFeet"];
  for(const o of collect(doc,[])){
    for(const [k,v] of Object.entries(o)){
      const n=numberLike(v);
      if(n===null) continue;
      if(exact.includes(k)) hits.push({field:k,value:n,confidence:"EXACT_FIELD_NAME"});
      else{
        const low=k.toLowerCase().replace(/[^a-z0-9]/g,"");
        if(low.includes("available")&&(low.includes("sf")||low.includes("sqft")||low.includes("squarefeet")))
          hits.push({field:k,value:n,confidence:"NORMALIZED_FIELD_NAME"});
      }
    }
  }
  return hits;
}
export function firstEvidence(doc,keys){
  for(const o of collect(doc,[])) for(const k of keys)
    if(o?.[k]!==undefined&&o?.[k]!==null&&o?.[k]!=="") return {field:k,value:o[k]};
  return null;
}
