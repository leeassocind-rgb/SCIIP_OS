import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4Z_PROXY_BOOTSTRAP_FACTORY_ORCHESTRATOR_CONFIG_CHAIN_FORENSICS";
export const VERSION="4.0-m4.19d4z";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function imports(text=""){
  const out=[];
  for(const m of text.matchAll(/import\s+([^;]+?)\s+from\s+["']([^"']+)["']/g)){
    out.push({clause:m[1].trim(),specifier:m[2],index:m.index});
  }
  return out;
}
export function declarations(text=""){
  const out=[];
  const pats=[
    /\b(?:const|let|var)\s+(config)\s*=\s*([^;\n]+)/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*([A-Za-z_$][A-Za-z0-9_$]*)\(([^)]*)\)/g,
    /\bnew\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(([^)]*)\)/g
  ];
  for(const re of pats){
    for(const m of text.matchAll(re)) out.push({match:m[0].trim().slice(0,900),groups:m.slice(1),index:m.index});
  }
  return out;
}
export function configFlows(text=""){
  const out=[];
  const lines=text.split(/\r?\n/);
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(/\bconfig\b|LightBox|Lightbox|orchestrator|service|proxy|bootstrap|create|factory|getLightBoxConfig|publicLightBoxConfig/i.test(line)){
      out.push({line:i+1,snippet:line.trim().slice(0,1000)});
    }
  }
  return out;
}
