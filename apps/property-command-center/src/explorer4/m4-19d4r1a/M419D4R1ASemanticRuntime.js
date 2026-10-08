export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4R1A_CONFIG_KEY_SEMANTIC_FILTERING_RUNTIME_FIX";
export const VERSION="4.0-m4.19d4r1a";

export function envKeys(text=""){
  const out=new Set();
  const patterns=[
    /process\.env\.([A-Z][A-Z0-9_]*)/g,
    /process\.env\[['"]([A-Z][A-Z0-9_]*)['"]\]/g,
    /\b(?:env|getEnv|readEnv|requireEnv|optionalEnv)\(\s*["']([A-Z][A-Z0-9_]*)["']/g
  ];
  for(const re of patterns) for(const m of text.matchAll(re)) out.add(m[1]);
  return [...out].sort();
}

export function literalLightBoxTokens(text=""){
  const out=new Set();
  for(const m of text.matchAll(/["'](LIGHTBOX_[A-Z0-9_]+)["']/g)) out.add(m[1]);
  return [...out].sort();
}

export function classifyLiteralToken(token=""){
  if(/_(FAILED|FAILURE|ERROR|NOT_CONFIGURED|REQUIRED|READY|BLOCKED|INVALID|UNAVAILABLE)$/.test(token))
    return "STATUS_OR_ERROR_CODE";
  if(/_(API_KEY|CLIENT_ID|CLIENT_SECRET|BASE_URL|PROXY_PORT|TIMEOUT_MS|ALLOWED_ORIGINS|PROXY_URL)$/.test(token))
    return "POSSIBLE_CONFIG_NAME";
  return "UNCLASSIFIED_LITERAL";
}
