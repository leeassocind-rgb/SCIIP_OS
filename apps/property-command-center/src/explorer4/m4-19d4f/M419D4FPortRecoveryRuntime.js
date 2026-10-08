import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4F_LIGHTBOX_LISTENER_PORT_SOURCE_OF_TRUTH_AND_RUNTIME_BOOTSTRAP_RECOVERY";
export const VERSION="4.0-m4.19d4f";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractPorts(text=""){
  const out=new Set();
  for(const m of text.matchAll(/\b(4\d{3}|5\d{3}|8\d{3}|9\d{3})\b/g)){
    const n=Number(m[1]);
    if(n>=1024&&n<=65535) out.add(n);
  }
  return [...out].sort((a,b)=>a-b);
}
export function extractEnvNames(text=""){
  const out=new Set();
  for(const m of text.matchAll(/(?:process\.env\.|import\.meta\.env\.)([A-Z][A-Z0-9_]*)/g)) out.add(m[1]);
  for(const m of text.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s*=/gm)) out.add(m[1]);
  return [...out].sort();
}
export function extractLaunchCommands(text=""){
  const out=[];
  for(const line of text.split(/\r?\n/)){
    if(/lightbox|proxy-server|LIGHTBOX_PROXY_PORT|node .*server/i.test(line)) out.push(line.trim());
  }
  return out.slice(0,100);
}
