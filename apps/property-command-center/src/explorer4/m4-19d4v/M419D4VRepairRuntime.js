import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4V_SERVER_OWNED_LIGHTBOX_CONFIG_BOUNDARY_REPAIR_AND_ISOLATED_SELF_TEST";
export const VERSION="4.0-m4.19d4v";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function clientLeakAudit(text=""){
  return {
    importMetaEnvRefs:[...(text||"").matchAll(/import\.meta\.env(?:\.([A-Z0-9_]+)|\[['"]([^'"]+)['"]\])/g)]
      .map(m=>m[1]||m[2]).filter(Boolean),
    viteLightBoxRefs:[...(text||"").matchAll(/\b(VITE_LIGHTBOX_[A-Z0-9_]+)\b/g)].map(m=>m[1]),
    serverOnlyRefs:[...(text||"").matchAll(/\b(LIGHTBOX_(?:API_KEY|CLIENT_ID|CLIENT_SECRET|BASE_URL|PROXY_PORT|TIMEOUT_MS|ALLOWED_ORIGINS))\b/g)].map(m=>m[1])
  };
}

export function serverBoundaryAudit(configText="",proxyText=""){
  const joined=configText+"\n"+proxyText;
  return {
    serverUsesImportMetaEnv:/import\.meta\.env/.test(joined),
    serverUsesVitePrefix:/\bVITE_LIGHTBOX_/i.test(joined),
    enrichErrorBoundaryPreserved:/LIGHTBOX_ENRICH_UPSTREAM_FAILURE/.test(proxyText)&&/catch\s*\(\s*error\s*\)/.test(proxyText),
    selfTestRoutePresent:/\/api\/lightbox\/self-test/.test(proxyText)
  };
}
