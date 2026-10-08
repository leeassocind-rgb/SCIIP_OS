import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D4D_LIGHTBOX_DATA_ROUTE_IMPLEMENTATION_TARGETED_FORENSICS";
export const VERSION="4.0-m4.19d4d";
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function extractFunctionBlocks(text="", marker="/api/lightbox/enrich"){
  const idx=text.indexOf(marker);
  if(idx<0) return [];
  const start=Math.max(0,idx-3000), end=Math.min(text.length,idx+12000);
  return [text.slice(start,end)];
}
export function semanticFlags(text=""){
  const low=text.toLowerCase();
  return {
    availableSf:/\bavailableSf\b|available[_\s-]?sf|available square feet|available square footage/.test(text),
    availability:/\bavailability\b|\bavailable\b/.test(low),
    enrich:/enrich/i.test(text),
    parcel:/parcel/i.test(text),
    sourceProvenance:/provenance|evidence|sourceSnapshot|provider|source/i.test(text),
    timestamp:/timestamp|observedAt|updatedAt|reportDate|asOf|date/i.test(text),
    listener:/\.listen\s*\(/.test(text),
    serverCreate:/createServer\s*\(|http\.createServer|https\.createServer/.test(text),
    routeSwitch:/pathname|req\.url|url\.pathname|switch\s*\(/.test(text)
  };
}
