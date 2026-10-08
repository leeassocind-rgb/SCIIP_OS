import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AM_LIGHTBOX_ADDRESS_IDENTIFIER_RESOLUTION_REQUEST_RESPONSE_CONTRACT_FORENSICS";
export const VERSION="4.0-m4.19d4am";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractRoutes(text=""){
  const out=[];
  const re=/url\.pathname\s*===\s*['"`]([^'"`]+)['"`]\s*&&\s*req\.method\s*===\s*['"`]([A-Z]+)['"`]/g;
  for(const m of text.matchAll(re)) out.push({route:m[1],method:m[2]});
  return out;
}
export function hasAny(text="",terms=[]){
  const s=String(text);
  return terms.some(t=>s.toLowerCase().includes(String(t).toLowerCase()));
}
