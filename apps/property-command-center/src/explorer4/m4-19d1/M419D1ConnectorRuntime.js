import crypto from "node:crypto";
export const CONTRACT="SCIIP_EXPLORER_4_M4_19D1_EXTERNAL_REFRESH_SOURCE_CONNECTOR_CONFIGURATION_ACQUISITION_HARNESS";
export const VERSION="4.0-m4.19d1";
export const EXPECTED_PREAUTHORIZED_ROWS=400;
export const REQUIRED=["canonicalPropertyId","sourcePropertyId","observationId","observationTimestamp","observedAvailableSf","sourceProvenance","sourceSnapshotEvidence"];
export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");
export function validateEvidence(r){
  const missing=REQUIRED.filter(k=>r?.[k]===undefined||r?.[k]===null||r?.[k]==="");
  const n=Number(String(r?.observedAvailableSf??"").replace(/,/g,""));
  const ts=Date.parse(r?.observationTimestamp||"");
  return {ok:missing.length===0&&Number.isFinite(n)&&Number.isFinite(ts),missing,observedAvailableSf:Number.isFinite(n)?n:null,timestampValid:Number.isFinite(ts)};
}
