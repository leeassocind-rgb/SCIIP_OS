import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLER_4_M4_19D4AG_LIGHTBOX_UPSTREAM_REQUEST_PAYLOAD_CONTRACT_FORENSICS";
export const VERSION="4.0-m4.19d4ag";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function linesWith(text="",re){
  return text.split(/\r?\n/).map((line,i)=>({line:i+1,text:line.trim()})).filter(x=>re.test(x.text));
}

export function imports(text=""){
  const out=[];
  const patterns=[
    /\bimport\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g,
    /\bimport\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s*["']([^"']+)["']/g
  ];
  for(const re of patterns){
    for(const m of text.matchAll(re)) out.push({clause:m[1].trim(),specifier:m[2],index:m.index});
  }
  return out;
}

export function urlAndBodyEvidence(text=""){
  const urlLines=linesWith(text,/(fetch\(|request\(|axios\.|\/parcels\/|\/property|\/properties|geometry|by-point|resolve|enrich)/i);
  const bodyLines=linesWith(text,/(JSON\.stringify|body\s*:|payload|subject|lat|lng|latitude|longitude|address|countryCode|bufferDistance|bufferUnit|limit)/i);
  return {urlLines,bodyLines};
}
