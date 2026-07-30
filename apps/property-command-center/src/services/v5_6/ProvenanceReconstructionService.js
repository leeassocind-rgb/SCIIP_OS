
const ROOT='/reports/release-5.6/wave-2.8';
async function get(name){const r=await fetch(`${ROOT}/${name}`,{cache:'no-store'});if(!r.ok)throw new Error(`Unable to load ${name}: ${r.status}`);return r.json()}
export const loadReconstructedEvidenceLinks=()=>get('reconstructed-recommendation-evidence-links.json');
export const loadProvenanceReviewQueue=()=>get('provenance-review-queue.json');
export const loadProvenanceGraphV3=()=>get('provenance-graph-v3.json');
export const loadCanonicalCollapseReviewQueue=()=>get('canonical-collapse-review-queue.json');
