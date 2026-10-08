import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4J_LIGHTBOX_POST_SOCKET_HANGUP_FAILURE_FORENSICS_AND_RECOVERY_POLICY";
export const VERSION="4.0-m4.19d4j";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function flags(text=""){
  return {
    tryCatch:/\btry\s*\{/.test(text)&&/\bcatch\s*\(/.test(text),
    requestErrorHandler:/\.on\(\s*["']error["']/.test(text),
    timeout:/timeout|AbortController|setTimeout|LIGHTBOX_TIMEOUT_MS/i.test(text),
    upstreamFetch:/fetch\s*\(|https?\.request|axios/i.test(text),
    processExit:/process\.exit|throw\s+new\s+Error|uncaughtException|unhandledRejection/.test(text),
    enrichRoute:/\/api\/lightbox\/enrich/.test(text),
    orchestrator:/enrichSelectedProperty/.test(text),
    sourceNative:/LightBox|lightbox/i.test(text)
  };
}
