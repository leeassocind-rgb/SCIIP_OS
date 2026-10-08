import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4H_LIGHTBOX_ENRICH_REQUEST_CONTRACT_CERTIFICATION_AND_SINGLE_RECORD_DRY_RUN_REPAIR";
export const VERSION="4.0-m4.19d4h";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function routeWindow(text="", route="/api/lightbox/enrich", radius=9000){
  const i=text.indexOf(route);
  if(i<0) return "";
  return text.slice(Math.max(0,i-radius),Math.min(text.length,i+radius));
}
export function inferMethod(block=""){
  if(/url\.pathname\s*===?\s*["']\/api\/lightbox\/enrich["'][\s\S]{0,120}req\.method\s*===?\s*["']POST["']/i.test(block)) return "POST";
  if(/readJsonBody\(req\)/.test(block)) return "POST";
  return null;
}
export function inferBodyContract(block=""){
  return {
    subjectRequired:/const\s+subject\s*=\s*body\.subject|body\.subject/.test(block),
    subjectIdRequired:/if\s*\(\s*!subject\.id\s*\)/.test(block),
    requestedArraySupported:/Array\.isArray\(body\.requested\)/.test(block),
    defaultRequestedParcels:/\[['"]parcels['"]\]/.test(block)
  };
}
export function collectRequestedLiterals(text=""){
  const out=new Set();
  for(const m of text.matchAll(/requested\s*:\s*\[([^\]]+)\]/g)){
    for(const q of m[1].matchAll(/["']([^"']+)["']/g)) out.add(q[1]);
  }
  for(const m of text.matchAll(/requested\??\.includes\(\s*["']([^"']+)["']\s*\)/g)) out.add(m[1]);
  for(const m of text.matchAll(/case\s+["']([^"']+)["']\s*:/g)) out.add(m[1]);
  return [...out].sort();
}
