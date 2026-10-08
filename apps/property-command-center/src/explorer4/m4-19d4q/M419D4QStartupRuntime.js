import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4Q_LIGHTBOX_REPAIRED_PROXY_STARTUP_FAILURE_FORENSICS";
export const VERSION="4.0-m4.19d4q";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function classifyLog(text=""){
  const t=text||"", low=t.toLowerCase();
  const classes=[];
  if(/eaddrinuse/.test(low)) classes.push("PORT_CONFLICT");
  if(/cannot find module|module_not_found/.test(low)) classes.push("MODULE_LOAD_FAILURE");
  if(/syntaxerror/.test(low)) classes.push("SYNTAX_FAILURE");
  if(/referenceerror|typeerror/.test(low)) classes.push("RUNTIME_EXCEPTION");
  if(/credential|api[_ ]?key|client[_ ]?id|client[_ ]?secret|unauthoriz|forbidden/.test(low)) classes.push("CREDENTIAL_OR_AUTH_FAILURE");
  if(/base[_ ]?url|endpoint|invalid url|url required/.test(low)) classes.push("ENDPOINT_CONFIGURATION_FAILURE");
  if(/configured.*false|not configured|configuration required/.test(low)) classes.push("CONFIGURATION_NOT_READY");
  if(/timeout|aborterror|etimedout/.test(low)) classes.push("STARTUP_TIMEOUT_OR_ABORT");
  if(/listen|server started|ready|127\.0\.0\.1/.test(low)) classes.push("LISTENER_OR_STARTUP_SIGNAL");
  return [...new Set(classes)];
}

export function extractEnvContract(text=""){
  const out=new Set();
  for(const m of (text||"").matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) out.add(m[1]);
  return [...out].sort();
}
