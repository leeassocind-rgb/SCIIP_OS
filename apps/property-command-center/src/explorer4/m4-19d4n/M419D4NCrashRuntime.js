import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4N_LIGHTBOX_PROXY_CRASH_CONFIRMATION_AND_ERROR_BOUNDARY_REPAIR_QUALIFICATION";
export const VERSION="4.0-m4.19d4n";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function routeWindow(text="", route="/api/lightbox/enrich", radius=5000){
  const i=text.indexOf(route); if(i<0) return "";
  return text.slice(Math.max(0,i-radius),Math.min(text.length,i+radius));
}
export function analyzeBoundary(text=""){
  const w=routeWindow(text);
  return {
    routePresent:!!w,
    postOnly:/req\.method\s*===?\s*['"]POST['"]/.test(w),
    awaitsOrchestrator:/await\s+orchestrator\.enrichSelectedProperty/.test(w),
    localTryCatch:/try\s*\{[\s\S]*?orchestrator\.enrichSelectedProperty[\s\S]*?\}\s*catch\s*\(/.test(w),
    topLevelTryCatch:/try\s*\{[\s\S]*?\/api\/lightbox\/enrich[\s\S]*?\}\s*catch\s*\(/.test(text),
    uncaughtHandlers:/uncaughtException|unhandledRejection/.test(text)
  };
}
