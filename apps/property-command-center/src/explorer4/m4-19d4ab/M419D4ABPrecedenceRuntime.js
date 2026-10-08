import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4AB_SERVER_CONFIG_PRECEDENCE_AND_EFFECTIVE_RUNTIME_BINDING_CERTIFICATION";
export const VERSION="4.0-m4.19d4ab";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractConfigFunction(text=""){
  const idx=text.indexOf("getLightBoxConfig");
  if(idx<0) return "";
  const start=text.lastIndexOf("export",idx);
  let depth=0, seenBrace=false;
  for(let i=Math.max(0,start);i<text.length;i++){
    if(text[i]==="{"){depth++;seenBrace=true}
    else if(text[i]==="}"){depth--; if(seenBrace&&depth===0) return text.slice(Math.max(0,start),i+1)}
  }
  return text.slice(Math.max(0,start));
}

export function propertyExpressions(text=""){
  const props=["apiKey","baseUrl","port","allowedOrigins","enabled","timeoutMs"];
  const out={};
  for(const p of props){
    out[p]=[];
    const patterns=[
      new RegExp(`\\b(?:const|let|var)\\s+${p}\\s*=\\s*([^;\\n]+)`,"g"),
      new RegExp(`\\b${p}\\s*:\\s*([^,\\n}]+)`,"g")
    ];
    for(const re of patterns){
      for(const m of text.matchAll(re)){
        out[p].push({expression:(m[1]||"").trim().slice(0,900),index:m.index});
      }
    }
  }
  return out;
}

export function classifyPrecedence(expr=""){
  const e=expr;
  const sources=[];
  if(/env\.LIGHTBOX_[A-Z0-9_]+/.test(e)) sources.push("SERVER_ENV_INPUT");
  if(/\|\|/.test(e)||/\?\?/.test(e)) sources.push("FALLBACK_OR_DEFAULT");
  if(/https?:\/\//i.test(e)) sources.push("URL_DEFAULT");
  if(/\b8787\b/.test(e)) sources.push("PORT_DEFAULT_8787");
  if(/localhost:5173|localhost:5174/.test(e)) sources.push("LOCAL_ORIGIN_DEFAULT");
  if(/Boolean\(/.test(e)) sources.push("DERIVED_BOOLEAN");
  if(/Math\.max|Number\(/.test(e)) sources.push("NORMALIZED_NUMERIC");
  if(/normalize\(/.test(e)) sources.push("NORMALIZED_STRING");
  return sources.length?sources:["OTHER"];
}
