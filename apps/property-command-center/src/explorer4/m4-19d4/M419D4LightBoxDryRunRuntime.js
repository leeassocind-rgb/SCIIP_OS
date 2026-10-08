import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION";
export const VERSION="4.0-m4.19d4";
export const APPROVED_FIELD="availableSf";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export const redact=v=>v?`<configured:${sha(String(v)).slice(0,10)}>`:"<unset>";

export function collectObjects(node,out=[]){
  if(Array.isArray(node)) for(const x of node) collectObjects(x,out);
  else if(node && typeof node==="object"){
    out.push(node);
    for(const v of Object.values(node)) collectObjects(v,out);
  }
  return out;
}
export function normNum(v){
  if(typeof v==="number"&&Number.isFinite(v)) return v;
  if(typeof v==="string"&&v.trim()!==""){
    const n=Number(v.replace(/,/g,"").replace(/[^\d.-]/g,""));
    return Number.isFinite(n)?n:null;
  }
  return null;
}
export function findAvailableSfCandidates(doc){
  const objs=collectObjects(doc,[]);
  const hits=[];
  const exactKeys=["availableSf","availableSF","available_sf","availableSqFt","availableSqft","availableSquareFeet"];
  for(const o of objs){
    for(const k of exactKeys){
      if(Object.prototype.hasOwnProperty.call(o,k)){
        const n=normNum(o[k]);
        if(n!==null) hits.push({pathKey:k,value:n,confidence:"EXACT_FIELD_NAME",record:o});
      }
    }
    for(const [k,v] of Object.entries(o)){
      const low=k.toLowerCase().replace(/[^a-z0-9]/g,"");
      if(low.includes("available")&&(low.includes("sf")||low.includes("sqft")||low.includes("squarefeet"))){
        const n=normNum(v);
        if(n!==null && !hits.some(h=>h.record===o&&h.pathKey===k))
          hits.push({pathKey:k,value:n,confidence:"NORMALIZED_FIELD_NAME",record:o});
      }
    }
  }
  return hits;
}
