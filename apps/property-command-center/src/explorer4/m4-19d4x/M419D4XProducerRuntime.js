import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4X_SERVER_CONFIG_OBJECT_PRODUCER_EXACT_BINDING";
export const VERSION="4.0-m4.19d4x";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function lineNumber(text,index){
  return text.slice(0,index).split(/\r?\n/).length;
}
export function assignments(text=""){
  const props=["enabled","baseUrl","apiKey","port","timeoutMs","allowedOrigins"];
  const out=[];
  for(const p of props){
    const pats=[
      new RegExp(`\\b${p}\\s*:\\s*([^,\\n}]+)`,"g"),
      new RegExp(`\\b${p}\\s*=\\s*([^;\\n]+)`,"g"),
      new RegExp(`\\bthis\\.${p}\\s*=\\s*([^;\\n]+)`,"g")
    ];
    for(const re of pats){
      for(const m of text.matchAll(re)){
        out.push({property:p,expression:(m[1]||"").trim().slice(0,700),index:m.index,line:lineNumber(text,m.index)});
      }
    }
  }
  return out.sort((a,b)=>a.index-b.index);
}
export function configObjectNames(text=""){
  const out=new Set();
  for(const m of text.matchAll(/\b(const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*\{/g)) out.add(m[2]);
  return [...out];
}
export function exportedNames(text=""){
  const out=new Set();
  for(const m of text.matchAll(/\bexport\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) out.add(m[1]);
  for(const m of text.matchAll(/\bexport\s*\{\s*([^}]+)\}/g)){
    for(const part of m[1].split(",")){
      const n=part.trim().split(/\s+as\s+/)[0];
      if(n) out.add(n);
    }
  }
  return [...out];
}
