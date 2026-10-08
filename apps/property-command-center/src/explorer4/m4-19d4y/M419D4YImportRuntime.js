import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4Y_PROXY_BOOTSTRAP_CONFIG_IMPORT_CALLSITE_FORENSICS";
export const VERSION="4.0-m4.19d4y";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function imports(text=""){
  const out=[];
  for(const m of text.matchAll(/import\s+([^;]+?)\s+from\s+["']([^"']+)["']/g)){
    out.push({clause:m[1].trim(),specifier:m[2],index:m.index});
  }
  for(const m of text.matchAll(/await\s+import\(\s*["']([^"']+)["']\s*\)/g)){
    out.push({clause:"DYNAMIC_IMPORT",specifier:m[1],index:m.index});
  }
  return out;
}

export function configIdentifiers(text=""){
  const ids=new Set();
  for(const m of text.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:load|create|resolve|get)?[A-Za-z0-9_$]*Config\s*\(/g)) ids.add(m[1]);
  for(const m of text.matchAll(/\b([A-Za-z_$][A-Za-z0-9_$]*)\.(?:port|allowedOrigins|baseUrl|apiKey|timeoutMs|enabled)\b/g)) ids.add(m[1]);
  return [...ids];
}

export function callsites(text=""){
  const out=[];
  const lines=text.split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(/config|lightbox|listen\(|createServer|new\s+|orchestrator|service|port|allowedOrigins/i.test(line)){
      out.push({line:i+1,snippet:line.trim().slice(0,900)});
    }
  }
  return out;
}
