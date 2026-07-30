
const ROOT='/reports/release-5.6/wave-2.7';
async function get(name){const r=await fetch(`${ROOT}/${name}`,{cache:'no-store'});if(!r.ok)throw new Error(`Unable to load ${name}: ${r.status}`);return r.json()}
export const loadSemanticEvidenceLinks=()=>get('semantic-recommendation-evidence-links.json');
export const loadEvidenceReviewQueue=()=>get('evidence-review-queue.json');
export const loadProvenanceGraph=()=>get('provenance-graph-rebuilt.json');
export const loadExecutiveEvidenceKpis=()=>get('executive-evidence-kpis.json');
export const loadDataFidelityScorecardV2=()=>get('data-fidelity-scorecard-v2.json');
