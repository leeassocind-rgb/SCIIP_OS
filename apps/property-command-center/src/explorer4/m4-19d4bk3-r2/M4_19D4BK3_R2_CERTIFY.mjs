#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const r1p=path.join(ev,"m4-19d4bk3-r1-interactive-search-read-path-reconciliation.json");
const ip=path.join(ev,"m4-19d4bk3-interactive-search-result.json");
if(!fs.existsSync(r1p)||!fs.existsSync(ip)) throw new Error("Required R1/BK3 interaction evidence missing");
const R1=JSON.parse(fs.readFileSync(r1p,"utf8")), I=JSON.parse(fs.readFileSync(ip,"utf8"));
if(R1.state!=="M419D4BK3_R1_SEARCH_READ_PATH_RECONCILIATION_BLOCKED") throw new Error("Unexpected R1 state");
const norm=s=>String(s??"").replace(/\s+/g," ").replace(/[–—]/g,"-").trim().toLowerCase();
const rows=(I.cohort||[]).map(r=>{
 const q=norm(r.address), cs=r.preSelection?.candidates||[];
 const matches=cs.filter(c=>norm(c.text).includes(q));
 return {
  cohortPosition:r.cohortPosition, canonicalPropertyId:r.canonicalPropertyId, sourcePropertyId:r.sourcePropertyId,
  address:r.address, queryTyped:r.typed?.ok===true&&r.typed?.value===r.address,
  candidateCount:cs.length, matchingRenderedCandidateCount:matches.length,
  matchingRenderedCandidateVisible:matches.length>0,
  matchingCandidateTag:matches[0]?.tag??null, matchingCandidateText:matches[0]?.text??null,
  selectionActivated:r.selection?.clicked===true,
  selectedCandidateMatchesQuery:norm(r.selection?.text).includes(q),
  postSelectionAddressVisible:r.postSelection?.addressVisible===true,
  screenshot:r.screenshot??null
 };
});
const checks={
 r1ExpectedBlockedState:R1.state==="M419D4BK3_R1_SEARCH_READ_PATH_RECONCILIATION_BLOCKED",
 exactFiveAttempted:rows.length===5,
 uniqueSearchControl:I.exactSearchControlCount===1,
 allQueriesTyped:rows.every(r=>r.queryTyped),
 allFiveHaveRenderedCandidates:rows.every(r=>r.candidateCount>0),
 allFiveHaveMatchingRenderedCandidates:rows.every(r=>r.matchingRenderedCandidateVisible),
 allFiveMatchingCandidatesAreButtons:rows.every(r=>r.matchingCandidateTag==="BUTTON"),
 allFiveSelectionControlsResolved:rows.every(r=>r.selectionActivated),
 allFiveSelectedCandidatesMatchQuery:rows.every(r=>r.selectedCandidateMatchesQuery),
 allFiveVisibleAfterSelection:rows.every(r=>r.postSelectionAddressVisible),
 screenshotsCaptured:rows.every(r=>r.screenshot&&fs.existsSync(r.screenshot))
};
const passed=Object.values(checks).every(Boolean);
const O={
 contract:"SCIIP_EXPLORER_4_M4_19D4BK3_R2_SEARCH_RESULT_RENDERING_DIAGNOSTIC_AND_EVIDENCE_RECONCILIATION",
 version:"4.0-m4.19d4bk3-r2",status:passed?"PASSED":"BLOCKED",
 state:passed?"M419D4BK3_R2_RENDERED_SEARCH_RESULT_EVIDENCE_RECONCILED_LIFECYCLE_CLOSURE_READY":"M419D4BK3_R2_RENDERING_DIAGNOSTIC_BLOCKED",
 certifiedAt:new Date().toISOString(),
 diagnosis:{
  r1ImplementationDefect:"R1_CERTIFIER_EXPECTED_PRESELECTION_CANDIDATEHASADDRESS_BUT_THE_BROWSER_EVIDENCE_SCHEMA_DID_NOT_EMIT_THAT_FIELD",
  authoritativeExistingEvidence:"PRESELECTION_CANDIDATES_ARRAY_CONTAINS_THE_EXACT_QUERY_ADDRESS_AND_SELECTION_CLICK_SUCCEEDED",
  reconciliationMethod:"NORMALIZE_QUERY_AND_RENDERED_CANDIDATE_TEXT_THEN_REQUIRE_EXACT_QUERY_CONTAINMENT_IN_A_RENDERED_BUTTON",
  explorerDefectFound:false, applicationChangeRequired:false, browserRerunRequired:false
 },
 cohort:rows,checks,
 policy:{evidenceReconciliationOnly:true,browserInteraction:false,applicationMutation:false,uiSourceMutation:false,canonicalMutation:false,eventMutation:false,governedInventoryMutation:false,temporalMutation:false,propagation:false,automaticRetry:false},
 nextMilestone:passed?"M4.19D4BL_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_RUNTIME_VISIBILITY_LIFECYCLE_CLOSURE":"M4.19D4BK3_R3_BROWSER_EVIDENCE_SCHEMA_INSTRUMENTATION",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false}
};
fs.writeFileSync(path.join(ev,"m4-19d4bk3-r2-search-result-rendering-diagnostic-and-evidence-reconciliation.json"),JSON.stringify(O,null,2)+"\n");
console.log(JSON.stringify(O,null,2)); if(!passed)process.exit(2);
