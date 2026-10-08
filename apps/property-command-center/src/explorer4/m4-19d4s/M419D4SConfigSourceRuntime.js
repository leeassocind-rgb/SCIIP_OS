import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4S_LIGHTBOX_CONFIG_OBJECT_DEFAULTS_AND_SECRET_SOURCE_FORENSICS";
export const VERSION="4.0-m4.19d4s";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function classifyLine(line=""){
  const l=line.toLowerCase();
  const out=[];
  if(/config|configuration|options|settings|defaults?/.test(l)) out.push("CONFIG_OBJECT_OR_DEFAULT");
  if(/secret|credential|api[_-]?key|client[_-]?id|client[_-]?secret|token/.test(l)) out.push("SECRET_OR_CREDENTIAL");
  if(/constructor\s*\(|new\s+[A-Za-z0-9_]+\s*\(/.test(line)) out.push("CONSTRUCTOR_OR_INJECTION");
  if(/readiness|configured|isconfigured|not_configured/.test(l)) out.push("READINESS_LOGIC");
  if(/dotenv|keychain|keytar|secretmanager|vault|launchctl|process\.env/.test(l)) out.push("EXTERNAL_SECRET_PROVIDER_OR_ENV");
  if(/import|from\s+['"]|require\(/.test(line)) out.push("DEPENDENCY_EDGE");
  return [...new Set(out)];
}

export function likelyConfigProps(text=""){
  const out=new Set();
  const patterns=[
    /\b(?:config|options|settings)\.([A-Za-z_][A-Za-z0-9_]*)/g,
    /\bthis\.([A-Za-z_][A-Za-z0-9_]*)\s*=/g,
    /\b(?:baseUrl|apiKey|clientId|clientSecret|timeoutMs|allowedOrigins|proxyPort)\b/g
  ];
  for(const re of patterns){
    for(const m of text.matchAll(re)) out.add(m[1]||m[0]);
  }
  return [...out].sort();
}
