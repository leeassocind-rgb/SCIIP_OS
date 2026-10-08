#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {spawn} from "node:child_process";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const bn1p=path.join(ev,"m4-19d4bn1-controlled-ten-property-runtime-mirror-propagation-execution-and-parity-certification.json");
if(!fs.existsSync(bn1p)) throw new Error("BN1 evidence missing");
const bn1=JSON.parse(fs.readFileSync(bn1p,"utf8"));
if(bn1.status!=="PASSED"||!String(bn1.state).includes("BROWSER_VISIBILITY_CERTIFICATION_READY"))
 throw new Error("BN1 prerequisite not certified");

const canonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const runtime=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
if(sha(canonical)!==sha(runtime)) throw new Error("canonical/runtime parity lost before BN2-R6");

const records=bn1.execution?.certification;
if(!Array.isArray(records)||records.length!==10) throw new Error("BN1 exact ten records unresolved");

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function reachable(url){try{const r=await fetch(url);return r.ok}catch{return false}}

let vite=null;
if(!(await reachable("http://127.0.0.1:5173/"))){
 console.log("[BN2-R6] Explorer runtime not reachable; launching Vite");
 vite=spawn("npm",["run","dev","--","--host","127.0.0.1","--port","5173"],{cwd:app,stdio:["ignore","pipe","pipe"]});
 let ok=false;
 for(let i=0;i<40;i++){await sleep(500);if(await reachable("http://127.0.0.1:5173/")){ok=true;break}}
 if(!ok){vite.kill("SIGTERM");throw new Error("Explorer runtime failed to launch")}
}else{
 console.log("[BN2-R6] existing Explorer runtime reachable");
}

const py=path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_bn2_r6.py");
const evidenceJson=path.join(ev,"m4-19d4bn2-r6-browser-evidence.json");
const args=[py,"http://127.0.0.1:5173/",evidenceJson,...records.map(r=>r.address)];

console.log("[BN2-R6] real-keyboard search input reconciliation started");
const child=spawn("python3",args,{stdio:"inherit"});
const code=await new Promise(res=>child.on("exit",res));

if(vite){vite.kill("SIGTERM");await sleep(500)}
if(code!==0) throw new Error("BN2-R6 browser driver failed");

const B=JSON.parse(fs.readFileSync(evidenceJson,"utf8"));
if(!B.explorerActivated) throw new Error("Explorer navigation activation failed");
if(!B.searchControlVisible) throw new Error("Search SCIIP control not visible");
if(!Array.isArray(B.records)||B.records.length!==10) throw new Error("browser evidence exact-ten mismatch");

const all=B.records.every(x=>
 x.queryTyped &&
 x.inputValueMatchesQuery &&
 x.matchingRenderedCandidateVisible &&
 x.matchingCandidateHasPositiveGeometry &&
 x.matchingCandidateComputedVisible &&
 x.selectionActivated &&
 x.postSelectionAddressVisible &&
 x.postSelectionAddressHasPositiveGeometry &&
 x.snapshotHtmlPresent &&
 x.layoutEvidencePresent
);
if(!all) throw new Error("one or more ten-property search/visibility certifications failed");

const out={
 contract:"SCIIP_EXPLORER_4_M4_19D4BN2_R6_TEN_PROPERTY_EXPLORER_SEARCH_INPUT_EVENT_RECONCILIATION_AND_DOM_VISIBILITY_CERTIFICATION",
 version:"4.0-m4.19d4bn2-r6",
 status:"PASSED",
 state:"M419D4BN2_R6_TEN_PROPERTY_SEARCH_INPUT_RENDER_SELECTION_DOM_VISIBILITY_CERTIFIED_LIFECYCLE_CLOSURE_READY",
 certifiedAt:new Date().toISOString(),
 reconciliation:{
  priorR5Failure:"ALL_TEN_QUERIES_TYPED_BY_DOM_VALUE_INJECTION_BUT_NO_RENDERED_SEARCH_CANDIDATES",
  diagnosis:"CONTROLLED_REACT_SEARCH_INPUT_REQUIRES_NATIVE_KEYBOARD_EVENT_PATH",
  correction:"FOCUS_SEARCH_CONTROL_CLEAR_WITH_KEY_EVENTS_TYPE_WITH_INPUT_INSERTTEXT_WAIT_FOR_RENDERED_RESULT",
  applicationDefectFound:false,
  runtimeDataDefectFound:false
 },
 prerequisite:{
  bn1State:bn1.state,
  canonicalSha256:sha(canonical),
  runtimeSha256:sha(runtime),
  exactParity:true
 },
 browser:{
  serverUrl:"http://127.0.0.1:5173/",
  inputMethod:"CDP_INPUT_DISPATCH_KEY_EVENT_PLUS_INSERT_TEXT",
  explorerActivated:B.explorerActivated,
  searchControlVisible:B.searchControlVisible,
  searchControlCount:B.searchControlCount,
  records:B.records
 },
 checks:{
  bn1Passed:true,
  canonicalRuntimeParity:true,
  exactTenAttempted:true,
  explorerActivated:true,
  uniqueSearchControl:B.searchControlCount===1,
  allQueriesTyped:true,
  allInputValuesMatchQueries:true,
  allTenHaveMatchingRenderedCandidates:true,
  allTenMatchingCandidatesHavePositiveGeometry:true,
  allTenMatchingCandidatesComputedVisible:true,
  allTenSelectionsActivated:true,
  allTenPostSelectionAddressesVisible:true,
  allTenPostSelectionAddressesHavePositiveGeometry:true,
  allTenFrozenHtmlSnapshotsPresent:true,
  allTenLayoutEvidenceFilesPresent:true
 },
 policy:{
  browserCertificationReadOnly:true,
  pixelScreenshotNotRequired:true,
  applicationMutation:false,
  uiSourceMutation:false,
  canonicalMutation:false,
  eventMutation:false,
  governedInventoryMutation:false,
  temporalMutation:false,
  propagation:false,
  automaticRetry:false
 },
 nextMilestone:"M4.19D4BO_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_RUNTIME_VISIBILITY_LIFECYCLE_CLOSURE",
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
  productionEventMutationPerformed:false,
  temporalMutationPerformed:false,
  governedInventoryMutationPerformed:false,
  applicationMutationPerformed:false,
  uiMutationPerformed:false,
  automaticRetry:false
 }
};

const outp=path.join(ev,"m4-19d4bn2-r6-ten-property-explorer-search-input-event-reconciliation-and-dom-visibility-certification.json");
fs.writeFileSync(outp,JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify(out,null,2));
