#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const repo=path.resolve(process.argv[2]||"."); const app=path.join(repo,"apps/property-command-center"); const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bk2-r2-r1-dependency-free-live-explorer-navigation-and-search-control-reconciliation.json");
const interaction=path.join(ev,"m4-19d4bk3-interactive-search-result.json");
if(!fs.existsSync(prior)) throw new Error("BK2-R2-R1 evidence missing");
const P=JSON.parse(fs.readFileSync(prior,"utf8"));
if(P.state!=="M419D4BK2_R2_R1_LIVE_EXPLORER_NAVIGATION_AND_EXACT_SEARCH_CONTROL_CERTIFIED_BK3_READY") throw new Error("BK2-R2-R1 state mismatch");
const I=JSON.parse(fs.readFileSync(interaction,"utf8"));
const rows=I.cohort||[];
const checks={
 priorReady:true,
 uniqueSearchControl:I.exactSearchControlCount===1,
 exactFiveAttempted:rows.length===5,
 allQueriesTyped:rows.every(r=>r.typed?.ok===true && r.typed?.value===r.address),
 allFiveVisibleInSearchReadPath:rows.every(r=>r.preSelection?.bodyHasAddress===true),
 allFiveSelectionControlsResolved:rows.every(r=>r.selection?.clicked===true),
 allFiveVisibleAfterSelection:rows.every(r=>r.postSelection?.addressVisible===true),
 screenshotsCaptured:rows.every(r=>fs.existsSync(r.screenshot))
};
const passed=Object.values(checks).every(Boolean);
const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BK3_INTERACTIVE_FIVE_PROPERTY_EXPLORER_SEARCH_SELECTION_AND_VISIBILITY_CERTIFICATION",
 version:"4.0-m4.19d4bk3",status:passed?"PASSED":"BLOCKED",
 state:passed?"M419D4BK3_FIVE_PROPERTY_INTERACTIVE_EXPLORER_SEARCH_SELECTION_VISIBILITY_CERTIFIED_LIFECYCLE_CLOSURE_READY":"M419D4BK3_INTERACTIVE_EXPLORER_SEARCH_SELECTION_VISIBILITY_CERTIFICATION_BLOCKED",
 certifiedAt:new Date().toISOString(),
 execution:{mode:"READ_ONLY_BROWSER_INTERACTION",propertiesAttempted:rows.length,results:rows.map(r=>({
  cohortPosition:r.cohortPosition,address:r.address,canonicalPropertyId:r.canonicalPropertyId,sourcePropertyId:r.sourcePropertyId,
  queryTyped:r.typed?.ok===true,searchVisibility:r.preSelection?.bodyHasAddress===true,selectionActivated:r.selection?.clicked===true,
  postSelectionAddressVisible:r.postSelection?.addressVisible===true,
  canonicalIdVisibleInUI:r.postSelection?.canonicalVisible===true,sourcePropertyIdVisibleInUI:r.postSelection?.sourceVisible===true
 }))},
 checks,
 policy:{browserInteractionReadOnly:true,canonicalMutation:false,eventMutation:false,governedInventoryMutation:false,temporalMutation:false,propagation:false,uiSourceMutation:false,automaticRetry:false},
 nextMilestone:passed?"M4.19D4BL_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_RUNTIME_VISIBILITY_LIFECYCLE_CLOSURE":"M4.19D4BK3_R1_INTERACTIVE_SEARCH_READ_PATH_RECONCILIATION",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionEventMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,uiSourceMutationPerformed:false,automaticRetry:false}
};
const out=path.join(ev,"m4-19d4bk3-interactive-five-property-explorer-search-selection-and-visibility-certification.json");
fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n"); console.log(JSON.stringify(R,null,2)); if(!passed)process.exit(2);
