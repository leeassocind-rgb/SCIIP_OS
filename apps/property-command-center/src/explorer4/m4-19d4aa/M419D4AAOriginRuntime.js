import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AA_CONFIG_IDENTIFIER_ORIGIN_EXACT_BINDING";
export const VERSION="4.0-m4.19d4aa";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function parseImports(text=""){
  const out=[];
  const patterns=[
    /\bimport\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g,
    /\bimport\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+from\s*["']([^"']+)["']/g,
    /\bimport\s*\*\s*as\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*from\s*["']([^"']+)["']/g
  ];
  for(const re of patterns){
    for(const m of text.matchAll(re)){
      out.push({
        clause:(m[1]||"").trim(),
        specifier:m[2],
        index:m.index
      });
    }
  }
  return out.sort((a,b)=>a.index-b.index);
}

export function parseConfigBinding(text=""){
  const out=[];
  const patterns=[
    /\bconst\s+config\s*=\s*getLightBoxConfig\s*\(\s*\)\s*;?/g,
    /\blet\s+config\s*=\s*getLightBoxConfig\s*\(\s*\)\s*;?/g,
    /\bvar\s+config\s*=\s*getLightBoxConfig\s*\(\s*\)\s*;?/g
  ];
  for(const re of patterns){
    for(const m of text.matchAll(re)){
      out.push({index:m.index,statement:m[0].trim()});
    }
  }
  return out;
}

export function configUsages(text=""){
  const out=[];
  for(const m of text.matchAll(/\bconfig\.(enabled|baseUrl|apiKey|port|timeoutMs|allowedOrigins)\b/g)){
    out.push({property:m[1],index:m.index});
  }
  return out;
}
