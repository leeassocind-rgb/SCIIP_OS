#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bj4b2=path.join(ev,"m4-19d4bj4b2-controlled-five-property-canonical-identity-creation-reexecution-and-dual-store-post-commit-certification.json");
const bk1=path.join(ev,"m4-19d4bk1-r1-controlled-five-property-downstream-binding-execution-and-runtime-parity-certification.json");
const bk2=path.join(ev,"m4-19d4bk2-r2-r1-dependency-free-live-explorer-navigation-and-search-control-reconciliation.json");
const bk3=path.join(ev,"m4-19d4bk3-r2-search-result-rendering-diagnostic-and-evidence-reconciliation.json");
const out=path.join(ev,"m4-19d4bl-five-property-canonical-identity-creation-and-runtime-visibility-lifecycle-closure.json");

for(const p of [bj4b2,bk1,bk2,bk3]) if(!fs.existsSync(p)) throw new Error("required evidence missing: "+p);

const J=JSON.parse(fs.readFileSync(bj4b2,"utf8"));
const K1=JSON.parse(fs.readFileSync(bk1,"utf8"));
const K2=JSON.parse(fs.readFileSync(bk2,"utf8"));
const K3=JSON.parse(fs.readFileSync(bk3,"utf8"));

const expected={
 bj4b2:"M419D4BJ4B2_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_REEXECUTED_DUAL_STORE_POST_COMMIT_CERTIFIED_DOWNSTREAM_PROPAGATION_NOT_AUTHORIZED",
 bk1:"M419D4BK1_R1_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTED_RUNTIME_PARITY_CERTIFIED_BROWSER_VISIBILITY_CERTIFICATION_READY",
 bk2:"M419D4BK2_R2_R1_LIVE_EXPLORER_NAVIGATION_AND_EXACT_SEARCH_CONTROL_CERTIFIED_BK3_READY",
 bk3:"M419D4BK3_R2_RENDERED_SEARCH_RESULT_EVIDENCE_RECONCILED_LIFECYCLE_CLOSURE_READY"
};
if(J.state!==expected.bj4b2) throw new Error("BJ4B2 state mismatch");
if(K1.state!==expected.bk1) throw new Error("BK1-R1 state mismatch");
if(K2.state!==expected.bk2) throw new Error("BK2-R2-R1 state mismatch");
if(K3.state!==expected.bk3) throw new Error("BK3-R2 state mismatch");

const canonical=J.storageBinding?.canonicalStore;
const events=J.storageBinding?.eventStore;
const runtimeMirror=K1.execution?.target ? path.join(app,K1.execution.target) : path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const inventory=path.join(app,"public/explorer/governed-base-inventory.json");

for(const p of [canonical,events,runtimeMirror,inventory]) if(!p || !fs.existsSync(p)) throw new Error("bound production file missing: "+p);

const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const canonicalSha=sha(canonical), eventSha=sha(events), runtimeSha=sha(runtimeMirror), inventorySha=sha(inventory);

const cohort=J.execution?.committed||[];
if(cohort.length!==5) throw new Error("exact five committed cohort required");

function collect(x,out=[]){
 if(Array.isArray(x)){ for(const v of x) collect(v,out); }
 else if(x&&typeof x==="object"){ out.push(x); for(const v of Object.values(x)) if(v&&typeof v==="object") collect(v,out); }
 return out;
}
const canonicalObjects=collect(JSON.parse(fs.readFileSync(canonical,"utf8")));
const runtimeObjects=collect(JSON.parse(fs.readFileSync(runtimeMirror,"utf8")));
const eventRows=fs.readFileSync(events,"utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);

const perRecord=cohort.map(c=>{
 const canon=canonicalObjects.filter(x=>x?.canonicalPropertyId===c.canonicalPropertyId && x?.sourcePropertyId===c.sourcePropertyId);
 const mirror=runtimeObjects.filter(x=>x?.canonicalPropertyId===c.canonicalPropertyId && x?.sourcePropertyId===c.sourcePropertyId);
 const evs=eventRows.filter(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED" && x?.canonicalPropertyId===c.canonicalPropertyId && x?.sourcePropertyId===c.sourcePropertyId);
 const vis=(K3.cohort||[]).find(x=>x.canonicalPropertyId===c.canonicalPropertyId && x.sourcePropertyId===c.sourcePropertyId);
 return {
  cohortPosition:c.cohortPosition,address:c.address,canonicalPropertyId:c.canonicalPropertyId,sourcePropertyId:c.sourcePropertyId,
  canonicalRecordCount:canon.length,runtimeMirrorCount:mirror.length,creationEventCount:evs.length,
  queryTyped:vis?.queryTyped===true,
  renderedSearchCandidateVisible:vis?.matchingRenderedCandidateVisible===true,
  selectionActivated:vis?.selectionActivated===true,
  postSelectionAddressVisible:vis?.postSelectionAddressVisible===true,
  screenshotPresent:!!(vis?.screenshot && fs.existsSync(vis.screenshot))
 };
});

const checks={
 exactFiveLifecycleRecords:perRecord.length===5,
 eachCanonicalExactlyOnce:perRecord.every(r=>r.canonicalRecordCount===1),
 eachRuntimeMirrorExactlyOnce:perRecord.every(r=>r.runtimeMirrorCount===1),
 eachCreationEventExactlyOnce:perRecord.every(r=>r.creationEventCount===1),
 allQueriesTyped:perRecord.every(r=>r.queryTyped),
 allRenderedCandidatesVisible:perRecord.every(r=>r.renderedSearchCandidateVisible),
 allSelectionsActivated:perRecord.every(r=>r.selectionActivated),
 allPostSelectionAddressesVisible:perRecord.every(r=>r.postSelectionAddressVisible),
 allScreenshotsPresent:perRecord.every(r=>r.screenshotPresent),
 canonicalMatchesBJ4B2PostCommitHash:canonicalSha===J.storageBinding?.canonicalSha256After,
 eventMatchesBJ4B2PostCommitHash:eventSha===J.storageBinding?.eventSha256After,
 runtimeMirrorMatchesCanonical:runtimeSha===canonicalSha,
 governedInventoryUnchangedFromBK1:inventorySha===K1.storageHashes?.after?.inventory,
 bk3AllChecksPassed:Object.values(K3.checks||{}).every(Boolean)
};
const passed=Object.values(checks).every(Boolean);

const completedStages=[
 "five-property canonical identity creation preauthorization",
 "governed production canonical-ID authority implementation",
 "canonical first-insert adapter implementation",
 "canonical creation-event adapter implementation",
 "five-property canonical identity production commit",
 "five canonical creation events appended",
 "dual-store post-commit certification",
 "runtime mirror downstream binding",
 "runtime mirror parity certification",
 "live Explorer navigation activation",
 "exact Search SCIIP control certification",
 "five-property interactive search",
 "five-property rendered search-result certification",
 "five-property selection activation",
 "five-property post-selection visibility certification"
];

const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BL_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_RUNTIME_VISIBILITY_LIFECYCLE_CLOSURE",
 version:"4.0-m4.19d4bl",
 status:passed?"PASSED":"BLOCKED",
 state:passed
  ?"M419D4BL_FIVE_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_RUNTIME_VISIBILITY_LIFECYCLE_CLOSED_NEXT_CONTROLLED_COHORT_READY"
  :"M419D4BL_LIFECYCLE_CLOSURE_BLOCKED_RECONCILIATION_REQUIRED",
 certifiedAt:new Date().toISOString(),
 closure:{
  completedStages,
  completedStageCount:completedStages.length,
  cohortSize:5,
  cohortHash:J.authorization?.cohortHash,
  canonicalCreationsCommitted:J.execution?.canonicalCreationsCommitted,
  creationEventsCommitted:J.execution?.creationEventsCommitted,
  runtimeMirrorParityCertified:K1.status==="PASSED",
  liveExplorerNavigationCertified:K2.status==="PASSED",
  interactiveExplorerVisibilityCertified:K3.status==="PASSED",
  perRecord
 },
 storageParity:{
  canonicalStore:canonical,
  canonicalSha256:canonicalSha,
  creationEventStore:events,
  creationEventSha256:eventSha,
  runtimeMirror,
  runtimeMirrorSha256:runtimeSha,
  governedInventory:inventory,
  governedInventorySha256:inventorySha
 },
 checks,
 readiness:{
  controlledCohortReady:passed,
  recommendedNextCohortSize:passed?10:null,
  expansionFactor:passed?2:null,
  broadScaleOutAuthorized:false,
  nextCohortMustRemainBounded:true,
  identityCreationAndVisibilityLifecycleReusable:true
 },
 policy:{
  lifecycleClosed:passed,
  canonicalIdentityCreationAuthorityClosed:true,
  creationEventAppendAuthorityClosed:true,
  runtimeMirrorPropagationAuthorityClosed:true,
  browserInteractionAuthorityClosed:true,
  temporalMutationNotAuthorized:true,
  governedInventoryMutationNotAuthorized:true,
  broadScaleOutNotAuthorized:true,
  nextCohortRequiresSeparateSelectionAndPreauthorization:true,
  haltOnFirstFailureRetained:true,
  strictSequentialExecutionRetained:true,
  readAfterWriteRetained:true,
  postPropagationBrowserCertificationRetained:true
 },
 nextMilestone:passed
  ?"M4.19D4BM_NEXT_CONTROLLED_TEN_PROPERTY_COHORT_READINESS_AND_SELECTION"
  :"M4.19D4BL_R1_LIFECYCLE_CLOSURE_RECONCILIATION",
 authorityClosure:{
  temporalWriteAuthority:false,
  canonicalWriteAuthority:false,
  identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,
  refreshExecutionAuthority:false,
  operationalIngestionAuthority:false,
  syncAuthority:false,
  propagationAuthority:false,
  automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,
  productionCanonicalMutationPerformed:false,
  productionIdentityMutationPerformed:false,
  productionEventMutationPerformed:false,
  temporalMutationPerformed:false,
  governedInventoryMutationPerformed:false,
  downstreamPropagationPerformed:false,
  applicationMutationPerformed:false,
  uiSourceMutationPerformed:false,
  automaticRetry:false
 }
};

fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
if(!passed) process.exit(2);
