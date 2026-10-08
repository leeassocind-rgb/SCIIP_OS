import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4W_SERVER_RUNTIME_READINESS_CONFIG_SOURCE_EXACT_BINDING";
export const VERSION="4.0-m4.19d4w";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function findAssignments(text=""){
  const props=["enabled","baseUrl","apiKey","port","timeoutMs","allowedOrigins"];
  const out=[];
  for(const p of props){
    const patterns=[
      new RegExp(`\\b${p}\\s*:\\s*([^,\\n}]+)`,"g"),
      new RegExp(`\\b${p}\\s*=\\s*([^;\\n]+)`,"g"),
      new RegExp(`\\bthis\\.${p}\\s*=\\s*([^;\\n]+)`,"g")
    ];
    for(const re of patterns){
      for(const m of text.matchAll(re)) out.push({property:p,expression:(m[1]||"").trim().slice(0,600),index:m.index});
    }
  }
  return out;
}

export function findCallsites(text=""){
  const out=[];
  const patterns=[
    /new\s+([A-Za-z0-9_]*(?:LightBox|Lightbox)[A-Za-z0-9_]*)\s*\(([^)]*)\)/g,
    /(?:create|build|load|resolve)([A-Za-z0-9_]*(?:LightBox|Lightbox)[A-Za-z0-9_]*)\s*\(([^)]*)\)/g,
    /(?:start|listen|bootstrap|init|initialize)\s*\(([^)]*)\)/g
  ];
  for(const re of patterns){
    for(const m of text.matchAll(re)) out.push({callee:m[1]||m[0].split("(")[0],args:(m[2]||m[1]||"").trim().slice(0,700),index:m.index});
  }
  return out;
}

export function classifyExpression(expr=""){
  const e=expr.trim();
  const classes=[];
  if(/process\.env/.test(e)) classes.push("PROCESS_ENV");
  if(/import\.meta\.env/.test(e)) classes.push("IMPORT_META_ENV");
  if(/\bconfig\b|\bsettings\b|\boptions\b/.test(e)) classes.push("CONFIG_OBJECT");
  if(/localhost|127\.0\.0\.1|https?:\/\//i.test(e)) classes.push("LITERAL_OR_DEFAULT_URL");
  if(/true|false/.test(e)) classes.push("BOOLEAN_LITERAL_OR_DERIVATION");
  if(/Number\(|parseInt|parseFloat|\d+/.test(e)) classes.push("NUMERIC_LITERAL_OR_DERIVATION");
  if(/\.{3}[A-Za-z_]/.test(e)) classes.push("OBJECT_SPREAD");
  if(/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(e)) classes.push("IDENTIFIER");
  if(classes.length===0) classes.push("OTHER");
  return classes;
}
