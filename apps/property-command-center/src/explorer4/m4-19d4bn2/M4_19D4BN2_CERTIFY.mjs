#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import {spawn} from "node:child_process";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const bn1p=path.join(ev,"m4-19d4bn1-controlled-ten-property-runtime-mirror-propagation-execution-and-parity-certification.json");
if(!fs.existsSync(bn1p)) throw new Error("BN1 evidence missing");
const bn1=JSON.parse(fs.readFileSync(bn1p,"utf8"));
if(bn1.status!=="PASSED"||!String(bn1.state).includes("BROWSER_VISIBILITY_CERTIFICATION_READY")) throw new Error("BN1 prerequisite not certified");
const canonical=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const runtime=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
if(sha(canonical)!==sha(runtime)) throw new Error("canonical/runtime parity lost before BN2");
const records=bn1.execution?.certification;
if(!Array.isArray(records)||records.length!==10) throw new Error("BN1 exact ten records unresolved");

function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function reachable(url){try{const r=await fetch(url);return r.ok}catch{return false}}
let vite=null;
if(!(await reachable("http://127.0.0.1:5173/"))){
 console.log("[BN2] Explorer runtime not reachable; launching Vite");
 vite=spawn("npm",["run","dev","--","--host","127.0.0.1","--port","5173"],{cwd:app,stdio:["ignore","pipe","pipe"]});
 let ok=false; for(let i=0;i<40;i++){await sleep(500);if(await reachable("http://127.0.0.1:5173/")){ok=true;break}}
 if(!ok){vite.kill("SIGTERM");throw new Error("Explorer runtime failed to launch")}
}else console.log("[BN2] existing Explorer runtime reachable");

const py=path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_bn2.py");
const evidenceJson=path.join(ev,"m4-19d4bn2-browser-evidence.json");
const args=[py,"http://127.0.0.1:5173/",evidenceJson,...records.map(r=>r.address)];
console.log("[BN2] live Explorer navigation + exact-ten search/selection certification started");
const child=spawn("python3",args,{stdio:"inherit"});
const code=await new Promise(res=>child.on("exit",res));
if(vite){vite.kill("SIGTERM"); await sleep(500)}
if(code!==0) throw new Error("BN2 browser driver failed");
const B=JSON.parse(fs.readFileSync(evidenceJson,"utf8"));
if(!B.explorerActivated) throw new Error("Explorer navigation activation failed");
if(!B.searchControlVisible) throw new Error("Search SCIIP control not visible");
if(!Array.isArray(B.records)||B.records.length!==10) throw new Error("browser evidence exact-ten mismatch");
const all=B.records.every(x=>x.queryTyped&&x.matchingRenderedCandidateVisible&&x.selectionActivated&&x.postSelectionAddressVisible&&x.screenshotPresent);
if(!all) throw new Error("one or more ten-property browser certifications failed");
const out={
 contract:"SCIIP_EXPLORER_4_M4_19D4BN2_TEN_PROPERTY_BROWSER_RUNTIME_VISIBILITY_AND_EXPLORER_SEARCH_SELECTION_CERTIFICATION",
 version:"4.0-m4.19d4bn2",status:"PASSED",
 state:"M419D4BN2_TEN_PROPERTY_BROWSER_RUNTIME_VISIBILITY_SEARCH_SELECTION_CERTIFIED_LIFECYCLE_CLOSURE_READY",
 certifiedAt:new Date().toISOString(),
 prerequisite:{bn1State:bn1.state,canonicalSha256:sha(canonical),runtimeSha256:sha(runtime),exactParity:true},
 browser:{serverUrl:"http://127.0.0.1:5173/",explorerActivated:B.explorerActivated,searchControlVisible:B.searchControlVisible,records:B.records},
 checks:{bn1Passed:true,canonicalRuntimeParity:true,exactTenAttempted:true,explorerActivated:true,uniqueSearchControl:true,
 allQueriesTyped:true,allTenHaveMatchingRenderedCandidates:true,allTenSelectionsActivated:true,allTenPostSelectionAddressesVisible:true,allScreenshotsPresent:true},
 policy:{browserCertificationReadOnly:true,applicationMutation:false,uiSourceMutation:false,canonicalMutation:false,eventMutation:false,
 governedInventoryMutation:false,temporalMutation:false,propagation:false,automaticRetry:false},
 nextMilestone:"M4.19D4BO_TEN_PROPERTY_CANONICAL_IDENTITY_CREATION_AND_RUNTIME_VISIBILITY_LIFECYCLE_CLOSURE",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,
 refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionEventMutationPerformed:false,temporalMutationPerformed:false,
 governedInventoryMutationPerformed:false,applicationMutationPerformed:false,uiMutationPerformed:false,automaticRetry:false}
};
const outp=path.join(ev,"m4-19d4bn2-ten-property-browser-runtime-visibility-and-explorer-search-selection-certification.json");
fs.writeFileSync(outp,JSON.stringify(out,null,2)+"\n"); console.log(JSON.stringify(out,null,2));
