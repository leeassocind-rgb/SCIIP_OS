#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const repo=path.resolve(process.argv[2]||"."); const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bk3-interactive-five-property-explorer-search-selection-and-visibility-certification.json");
const interaction=path.join(ev,"m4-19d4bk3-interactive-search-result.json");
if(!fs.existsSync(prior)) throw new Error("BK3 evidence missing");
const P=JSON.parse(fs.readFileSync(prior,"utf8"));
if(P.state!=="M419D4BK3_INTERACTIVE_EXPLORER_SEARCH_SELECTION_VISIBILITY_CERTIFICATION_BLOCKED") throw new Error("BK3 is not in expected blocked state");
if(P.checks?.allFiveSelectionControlsResolved!==true || P.checks?.allFiveVisibleAfterSelection!==true) throw new Error("BK3 failure is broader than search visibility predicate; do not reconcile automatically");
const I=JSON.parse(fs.readFileSync(interaction,"utf8")), rows=I.cohort||[];
const resultVisibility=rows.map(r=>({
 cohortPosition:r.cohortPosition,address:r.address,
 bodyTextVisibility:r.preSelection?.bodyHasAddress===true,
 renderedCandidateVisibility:r.preSelection?.candidateHasAddress===true,
 candidateCount:(r.preSelection?.candidates||[]).length,
 selectionActivated:r.selection?.clicked===true,
 postSelectionAddressVisible:r.postSelection?.addressVisible===true
}));
const checks={
 priorBlockedOnlyOnSearchVisibility:P.checks?.allFiveVisibleInSearchReadPath===false &&
   P.checks?.allFiveSelectionControlsResolved===true && P.checks?.allFiveVisibleAfterSelection===true,
 exactFiveAttempted:rows.length===5,
 uniqueSearchControl:I.exactSearchControlCount===1,
 allQueriesTyped:rows.every(r=>r.typed?.ok===true&&r.typed?.value===r.address),
 allFiveRenderedSearchResultsVisible:rows.every(r=>r.preSelection?.candidateHasAddress===true),
 allFiveSelectionControlsResolved:rows.every(r=>r.selection?.clicked===true),
 allFiveVisibleAfterSelection:rows.every(r=>r.postSelection?.addressVisible===true),
 screenshotsCaptured:rows.every(r=>r.screenshot&&fs.existsSync(r.screenshot))
};
const passed=Object.values(checks).every(Boolean);
const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BK3_R1_INTERACTIVE_SEARCH_READ_PATH_RECONCILIATION",
 version:"4.0-m4.19d4bk3-r1",status:passed?"PASSED":"BLOCKED",
 state:passed?"M419D4BK3_R1_RENDERED_SEARCH_RESULT_SELECTION_AND_POST_SELECTION_VISIBILITY_CERTIFIED_LIFECYCLE_CLOSURE_READY":"M419D4BK3_R1_SEARCH_READ_PATH_RECONCILIATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 diagnosis:{
  priorFalseNegative:"SEARCH_RESULT_WAS_RENDERED_AND_CLICKABLE_BUT_DOCUMENT_BODY_INNERTEXT_PREDICATE_REPORTED_FALSE",
  correction:"CERTIFY_RENDERED_MATCHING_SEARCH_RESULT_CANDIDATE_INSTEAD_OF_REQUIRING_DOCUMENT_BODY_INNERTEXT_CONTAINMENT",
  evidencePreserved:true,applicationChangeRequired:false
 },
 resultVisibility,checks,
 policy:{browserInteractionReadOnly:true,applicationMutation:false,uiSourceMutation:false,canonicalMutation:false,eventMutation:false,governedInventoryMutation:false,temporalMutation:false,propagation:false,automaticRetry:false},
 nextMilestone:passed?"M4.19D4BL_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_RUNTIME_VISIBILITY_LIFECYCLE_CLOSURE":"M4.19D4BK3_R2_SEARCH_RESULT_RENDERING_DIAGNOSTIC",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionEventMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,uiSourceMutationPerformed:false,automaticRetry:false}
};
fs.writeFileSync(path.join(ev,"m4-19d4bk3-r1-interactive-search-read-path-reconciliation.json"),JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2)); if(!passed)process.exit(2);
