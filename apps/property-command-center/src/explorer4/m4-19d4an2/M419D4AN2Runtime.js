import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AN2_LIGHTBOX_INTERNAL_ADDRESS_RESOLUTION_FACTORY_AND_PROVIDER_CONTRACT_FORENSICS";
export const VERSION="4.0-m4.19d4an2";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function fnSigs(text=""){
  const out=[];
  const re=/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)|(?:async\s+)?([A-Za-z0-9_$]+)\s*\(([^)]*)\)\s*\{/g;
  for(const m of text.matchAll(re)) out.push({name:m[1]||m[3],args:(m[2]||m[4]||"").trim()});
  return out;
}
export function imports(text=""){
  return [...text.matchAll(/import\s+(?:[^'"]+from\s+)?['"]([^'"]+)['"]/g)].map(m=>m[1]);
}
