import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AN1A_ORIGINAL_SOURCE_CALLER_TO_PROXY_REQUEST_SHAPE_CERTIFICATION";
export const VERSION="4.0-m4.19d4an1a";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function isAdmissiblePath(p=""){
  const s=String(p).replaceAll("\\","/");
  if(/\/src\/explorer4\//i.test(s)) return false;
  if(/\/evidence\//i.test(s)) return false;
  if(/\/__tests__\//i.test(s)) return false;
  if(/\.test\.[cm]?[jt]sx?$/i.test(s)) return false;
  if(/\.spec\.[cm]?[jt]sx?$/i.test(s)) return false;
  if(/\/test\//i.test(s)||/\/tests\//i.test(s)) return false;
  return true;
}

export function extractFetches(text=""){
  const out=[];
  const re=/fetch\s*\(\s*([^,\n]+)(?:,\s*(\{[\s\S]{0,1800}?\}))?\s*\)/g;
  for(const m of text.matchAll(re)) out.push({urlExpr:m[1].trim(),optionsExpr:(m[2]||"").trim()});
  return out;
}
