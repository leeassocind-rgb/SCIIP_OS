// SCIIP Explorer 3.0 — M2.66 FINAL
export function buildProductionEvidenceRuntimeDisclosure(presentation={}){
  const status=presentation?.status==='COMPLETE'?'COMPLETE':'DEGRADED';
  const missing=Array.isArray(presentation?.missing)?presentation.missing:[];
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_66_PRODUCTION_EVIDENCE_RUNTIME_STATUS_UI_DISCLOSURE',
    version:'3.0-m2.66',
    status,
    badge:status==='COMPLETE'?'VERIFIED':'ATTENTION',
    title:status==='COMPLETE'?'Production Evidence Verified':'Production Evidence Degraded',
    message:status==='COMPLETE'?'Provenance, source type, and spatial source are available.':`Missing: ${missing.join(', ')||'UNSPECIFIED'}`,
    missing:Object.freeze([...missing]),
    readOnly:true,
    canonicalMutation:false,
    governedMutation:false,
    automaticCanonicalWrites:false
  });
}
