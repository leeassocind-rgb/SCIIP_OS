
const ROOT='/reports/release-5.6/wave-2.8.1';
async function get(name){const response=await fetch(`${ROOT}/${name}`,{cache:'no-store'});if(!response.ok)throw new Error(`Unable to load ${name}: ${response.status}`);return response.json()}
export const loadRecommendationEvidenceBundles=()=>get('recommendation-evidence-bundles.json');
export const loadProvenanceGraphV4=()=>get('provenance-graph-v4.json');
export const loadReconciledDecisionQueue=()=>get('decision-queue-evidence-reconciled.json');
export const loadCanonicalCollapseReviewQueueV2=()=>get('canonical-collapse-review-queue-v2.json');
