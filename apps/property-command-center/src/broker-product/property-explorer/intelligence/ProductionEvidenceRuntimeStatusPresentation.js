// SCIIP Explorer 3.0 — M2.65
export function buildProductionEvidenceRuntimeStatusPresentation(consistency={}){
  const status=consistency?.status==='COMPLETE'?'COMPLETE':'DEGRADED';
  const missing=Array.isArray(consistency?.missing)?consistency.missing:[];
  return Object.freeze({
    contract:'SCIIP_EXPLORER_3_M2_65_PRODUCTION_EVIDENCE_RUNTIME_STATUS_PRESENTATION',
    version:'3.0-m2.65',status,
    tone:status==='COMPLETE'?'VERIFIED':'ATTENTION',
    label:status==='COMPLETE'?'Production evidence complete':'Production evidence degraded',
    detail:status==='COMPLETE'?'Provenance, source type, and spatial source are present.':`Missing production evidence: ${missing.join(', ')||'UNSPECIFIED'}.`,
    missing:Object.freeze([...missing]),readOnly:true,
    canonicalMutation:false,governedMutation:false,automaticCanonicalWrites:false
  });
}
