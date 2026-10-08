import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AN1_ADDRESS_RESOLUTION_CALLER_TO_PROXY_REQUEST_SHAPE_FORENSICS";
export const VERSION="4.0-m4.19d4an1";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractFetches(text=""){
  const out=[];
  const re=/fetch\s*\(\s*([^,\n]+)(?:,\s*(\{[\s\S]{0,1200}?\}))?\s*\)/g;
  for(const m of text.matchAll(re)) out.push({urlExpr:m[1].trim(),optionsExpr:(m[2]||"").trim()});
  return out;
}
export function extractObjectAssignments(text=""){
  const out=[];
  const re=/(const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*\{([\s\S]{0,1600}?)\};/g;
  for(const m of text.matchAll(re)) out.push({name:m[2],body:m[3]});
  return out;
}
