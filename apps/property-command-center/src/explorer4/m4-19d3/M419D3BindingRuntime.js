import crypto from "node:crypto";

export const CONTRACT =
  "SCIIP_EXPLORER_4_M4_19D3_EXTERNAL_SOURCE_CONFIGURATION_PLAN_AND_BINDING_SCAFFOLD";
export const VERSION="4.0-m4.19d3";
export const APPROVED_FIELD="availableSf";

export const LIGHTBOX_RELATIVE_CANDIDATES=[
  "apps/property-command-center/server/lightbox/proxy-server.mjs",
  "apps/property-command-center/server/lightbox/EnrichmentEvidence.mjs",
  "apps/property-command-center/server/lightbox/LightBoxEnrichmentOrchestrator.mjs",
  "apps/property-command-center/server/lightbox/LightBoxEnrichmentService.mjs",
  "apps/property-command-center/server/lightbox/LightBoxEvidenceExtractor.mjs",
  "apps/property-command-center/server/lightbox/LightBoxParcelAdapter.mjs",
  "apps/property-command-center/server/lightbox/LightBoxParcelResolution.mjs",
  "apps/property-command-center/server/lightbox/SciipEvidenceExtractor.mjs",
  "apps/property-command-center/src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js",
  "apps/property-command-center/src/broker-product/property-explorer/integrations/lightbox/LightBoxEnrichmentRegistry.js"
];

export const sha=x=>crypto.createHash("sha256").update(typeof x==="string"?x:JSON.stringify(x)).digest("hex");

export function inspectSourceText(text=""){
  const low=text.toLowerCase();
  const exactAvailableSf=/\bavailableSf\b/.test(text);
  const normalizedAvailable=/available[_\s-]?sf|available square feet|available square footage/.test(low);
  const availabilityTerms=/\bavailability\b|\bavailable\b/.test(low);
  const provenanceTerms=/provenance|evidence|source|snapshot|provider/.test(low);
  const timestampTerms=/timestamp|observedat|reportdate|updatedat|asof|date/.test(low);
  const networkTerms=/fetch\s*\(|axios|https?\.request|http\.request|new URL\(/i.test(text);
  return {exactAvailableSf,normalizedAvailable,availabilityTerms,provenanceTerms,timestampTerms,networkTerms};
}

export function scoreSemanticFit(x){
  let s=0;
  if(x.exactAvailableSf) s+=6;
  if(x.normalizedAvailable) s+=4;
  if(x.availabilityTerms) s+=2;
  if(x.provenanceTerms) s+=2;
  if(x.timestampTerms) s+=2;
  if(x.networkTerms) s+=1;
  return s;
}
