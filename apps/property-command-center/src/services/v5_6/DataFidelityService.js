
const ROOT='/reports/release-5.6/wave-2.6';
async function get(name){const r=await fetch(`${ROOT}/${name}`,{cache:'no-store'});if(!r.ok)throw new Error(`Unable to load ${name}: ${r.status}`);return r.json()}
export const loadDataQualityScorecard=()=>get('data-quality-scorecard.json');
export const loadCanonicalRegistry=()=>get('canonical-property-registry.json');
export const loadSpatialProperties=()=>get('canonical-spatial-properties.json');
export const loadEvidenceLinks=()=>get('recommendation-evidence-links.json');
export const loadFidelityKpis=()=>get('executive-data-fidelity-kpis.json');
