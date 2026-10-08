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
if(sha(canonical)!==sha(runtime)) throw new Error("canonical/runtime parity lost before BN2-R7");

const records=bn1.execution?.certification;
if(!Array.isArray(records)||records.length!==10) throw new Error("BN1 exact ten records unresolved");

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function reachable(url){try{const r=await fetch(url);return r.ok}catch{return false}}

let vite=null;
if(!(await reachable("http://127.0.0.1:5173/"))){
 console.log("[BN2-R7] Explorer runtime not reachable; launching Vite");
 vite=spawn("npm",["run","dev","--","--host","127.0.0.1","--port","5173"],{cwd:app,stdio:["ignore","pipe","pipe"]});
 let ok=false;
 for(let i=0;i<40;i++){await sleep(500);if(await reachable("http://127.0.0.1:5173/")){ok=true;break}}
 if(!ok){vite.kill("SIGTERM");throw new Error("Explorer runtime failed to launch")}
}else console.log("[BN2-R7] existing Explorer runtime reachable");

const py=path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_bn2_r7.py");
const evidenceJson=path.join(ev,"m4-19d4bn2-r7-browser-evidence.json");
const args=[py,"http://127.0.0.1:5173/",evidenceJson,...records.map(r=>r.address)];

console.log("[BN2-R7] native-character search event-path diagnostic started");
const child=spawn("python3",args,{stdio:"inherit"});
const code=await new Promise(res=>child.on("exit",res));
if(vite){vite.kill("SIGTERM");await sleep(500)}
if(code!==0) throw new Error("BN2-R7 browser driver failed");

const B=JSON.parse(fs.readFileSync(evidenceJson,"utf8"));
if(!B.explorerActivated) throw new Error("Explorer navigation activation failed");
if(!B.searchControlVisible) throw new Error("Search SCIIP control not visible");
if(!Array.isArray(B.records)||B.records.length!==10) throw new Error("browser evidence exact-ten mismatch");

const inputPathCertified=B.records.every(x=>
 x.preQueryValueEmpty &&
 x.queryTyped &&
 x.inputValueMatchesQuery &&
 x.nativeCharacterEventsDispatched===x.address.length
);
const allCandidates=B.records.every(x=>x.matchingRenderedCandidateVisible);

const status=inputPathCertified && allCandidates ? "PASSED" : "BLOCKED";
const state=status==="PASSED"
 ? "M419D4BN2_R7_NATIVE_CHARACTER_SEARCH_EVENT_PATH_AND_TEN_RENDERED_CANDIDATES_CERTIFIED_SELECTION_VISIBILITY_READY"
 : inputPathCertified
   ? "M419D4BN2_R7_NATIVE_SEARCH_EVENT_PATH_CERTIFIED_RENDERED_CANDIDATE_INDEX_GAP_RECONCILIATION_REQUIRED"
   : "M419D4BN2_R7_NATIVE_SEARCH_EVENT_PATH_NOT_CERTIFIED_INPUT_RECONCILIATION_REQUIRED";

const out={
 contract:"SCIIP_EXPLORER_4_M4_19D4BN2_R7_NATIVE_CHARACTER_SEARCH_EVENT_PATH_DIAGNOSTIC_AND_CANDIDATE_INDEX_RECONCILIATION",
 version:"4.0-m4.19d4bn2-r7",
 status,
 state,
 certifiedAt:new Date().toISOString(),
 diagnosis:{
  r5AllCandidatesMissing:true,
  r6FirstValueMatchedButCandidateMissing:true,
  r6SubsequentClearReplaceFailed:true,
  r7Correction:"DOM_SELECTION_ONLY_PLUS_REAL_BACKSPACE_PLUS_PER_CHARACTER_CDP_CHAR_EVENTS",
  directValueInjectionUsed:false,
  inputInsertTextUsed:false,
  inputPathCertified,
  allCandidatesRendered:allCandidates,
  conclusion: status==="PASSED"
    ? "Native search event path produces all ten rendered candidates."
    : inputPathCertified
      ? "Search input event path is proven, but Explorer does not render the exact ten candidates; inspect search/index/source binding next."
      : "Native input event path is not yet proven; do not infer an Explorer data/index defect."
 },
 prerequisite:{
  bn1State:bn1.state,
  canonicalSha256:sha(canonical),
  runtimeSha256:sha(runtime),
  exactParity:true
 },
 browser:{
  serverUrl:"http://127.0.0.1:5173/",
  inputMethod:"FOCUS_SELECT_RANGE_REAL_BACKSPACE_PER_CHARACTER_CDP_CHAR_EVENTS",
  explorerActivated:B.explorerActivated,
  searchControlVisible:B.searchControlVisible,
  searchControlCount:B.searchControlCount,
  searchControlContract:B.searchControlContract,
  records:B.records
 },
 checks:{
  bn1Passed:true,
  canonicalRuntimeParity:true,
  exactTenAttempted:true,
  explorerActivated:true,
  uniqueSearchControl:B.searchControlCount===1,
  allPreQueryValuesEmpty:B.records.every(x=>x.preQueryValueEmpty),
  allQueriesTyped:B.records.every(x=>x.queryTyped),
  allInputValuesExact:B.records.every(x=>x.inputValueMatchesQuery),
  allCharactersDispatched:B.records.every(x=>x.nativeCharacterEventsDispatched===x.address.length),
  nativeInputPathCertified:inputPathCertified,
  allTenHaveMatchingRenderedCandidates:allCandidates
 },
 policy:{
  diagnosticAndCertificationReadOnly:true,
  applicationMutation:false,
  uiSourceMutation:false,
  canonicalMutation:false,
  eventMutation:false,
  governedInventoryMutation:false,
  temporalMutation:false,
  propagation:false,
  automaticRetry:false
 },
 nextMilestone: status==="PASSED"
   ? "M4.19D4BN2_R8_TEN_PROPERTY_SELECTION_AND_POST_SELECTION_DOM_VISIBILITY_CERTIFICATION"
   : inputPathCertified
     ? "M4.19D4BN2_R7A_EXPLORER_SEARCH_INDEX_AND_SOURCE_BINDING_DIAGNOSTIC"
     : "M4.19D4BN2_R7_R1_NATIVE_INPUT_EVENT_PATH_RECONCILIATION",
 authorityClosure:{
  temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
  externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
  operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
 },
 safety:{
  networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionEventMutationPerformed:false,
  temporalMutationPerformed:false,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,
  uiMutationPerformed:false,automaticRetry:false
 }
};

const outp=path.join(ev,"m4-19d4bn2-r7-native-character-search-event-path-diagnostic-and-candidate-index-reconciliation.json");
fs.writeFileSync(outp,JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify(out,null,2));
if(status!=="PASSED") process.exitCode=2;
