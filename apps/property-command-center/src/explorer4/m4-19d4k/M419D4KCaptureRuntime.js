import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4K_LIGHTBOX_PROXY_RUNTIME_ERROR_CAPTURE_AND_CONTROLLED_SINGLE_POST_RETRY_GATE";
export const VERSION="4.0-m4.19d4k";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function classifyLog(text=""){
  const low=text.toLowerCase();
  if(/eaddrinuse/.test(low)) return "TEMP_PROXY_PORT_CONFLICT";
  if(/uncaught|unhandled|throw er|socket hang up|econnreset/.test(low)) return "UNCAUGHT_OR_CONNECTION_ABORT";
  if(/401|403|unauthoriz|forbidden|credential|api key|client secret/.test(low)) return "UPSTREAM_AUTHENTICATION_OR_CREDENTIAL_FAILURE";
  if(/timeout|aborted|aborterror|etimedout/.test(low)) return "UPSTREAM_TIMEOUT_OR_ABORT";
  if(/enotfound|econnrefused|network|fetch failed|dns/.test(low)) return "UPSTREAM_NETWORK_FAILURE";
  if(/invalid|bad request|400/.test(low)) return "REQUEST_OR_UPSTREAM_VALIDATION_FAILURE";
  return text.trim() ? "RUNTIME_ERROR_CAPTURED_UNCLASSIFIED" : "NO_RUNTIME_ERROR_TEXT_CAPTURED";
}
