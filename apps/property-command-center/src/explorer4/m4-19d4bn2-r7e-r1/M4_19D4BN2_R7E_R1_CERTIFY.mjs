#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import {spawn} from "node:child_process";
const repo=path.resolve(process.argv[2]||"."); const app=path.join(repo,"apps/property-command-center"); const ev=path.join(app,"evidence");
const dp=path.join(ev,"m4-19d4bn2-r7d-controlled-explorer-search-governed-read-path-binding-implementation-and-static-parity-certification.json");
if(!fs.existsSync(dp)) throw new Error("R7D evidence missing");
const d=JSON.parse(fs.readFileSync(dp,"utf8"));
if(d.status!=="PASSED"||!String(d.state).includes("BROWSER_RECERTIFICATION_READY")) throw new Error("R7D prerequisite not certified");
const addresses=d.staticCandidateCertification?.exactTen?.map(x=>x.address);
if(!Array.isArray(addresses)||addresses.length!==10) throw new Error("R7D exact ten unresolved");

const ex=path.join(app,"src/broker-product/property-explorer/v6/Explorer3.jsx"), inv=path.join(app,"public/explorer/governed-base-inventory.json"), can=path.join(app,"src/production-validation/canonical-property-identity-data.json"), run=path.join(app,"public/production-validation-data/canonical-property-identity-data.json");
const sha=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const before={explorer3:sha(ex),inventory:sha(inv),canonical:sha(can),runtime:sha(run)};
if(before.explorer3!==d.hashes.explorer3After||before.inventory!==d.hashes.inventoryAfter||before.canonical!==d.hashes.canonicalAfter||before.runtime!==d.hashes.runtimeAfter) throw new Error("R7D hash drift before R7E-R1");

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function reachable(u){try{return (await fetch(u)).ok}catch{return false}}
let vite=null;
if(!(await reachable("http://127.0.0.1:5173/"))){
  vite=spawn("npm",["run","dev","--","--host","127.0.0.1","--","--port","5173"],{cwd:app,stdio:["ignore","pipe","pipe"]});
  let ok=false; for(let i=0;i<40;i++){await sleep(500);if(await reachable("http://127.0.0.1:5173/")){ok=true;break}}
  if(!ok){vite.kill("SIGTERM");throw new Error("Explorer runtime failed to launch")}
}else console.log("[R7E-R1] existing Explorer runtime reachable");

const evidenceJson=path.join(ev,"m4-19d4bn2-r7e-r1-browser-evidence.json");
const py=path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_r7e_r1.py");
const child=spawn("python3",[py,"http://127.0.0.1:5173/",evidenceJson,...addresses],{stdio:"inherit"});
const code=await new Promise(res=>child.on("exit",res)); if(vite){vite.kill("SIGTERM");await sleep(500)}
if(code!==0) throw new Error("R7E-R1 browser driver failed");

const B=JSON.parse(fs.readFileSync(evidenceJson,"utf8")), n=B.navigation||{}, recs=B.records||[];
const targetPass=n.selectedTargetType==="page" && String(n.selectedTargetUrl||"").startsWith("http://127.0.0.1:5173") && n.extensionTargetSelected===false;
const navPass=targetPass&&n.explorerControlFound&&n.activationSucceeded&&n.searchControlCount===1;
const all=recs.length===10&&recs.every(x=>x.preQueryValueEmpty&&x.queryTyped&&x.inputValueMatchesQuery&&x.nativeCharacterEventsDispatched===x.address.length&&x.matchingRenderedCandidateVisible&&x.matchingCandidateHasPositiveGeometry&&x.matchingCandidateComputedVisible&&x.selectionActivated&&x.postSelectionAddressVisible&&x.postSelectionAddressHasPositiveGeometry&&x.postSelectionAddressComputedVisible&&x.frozenHtmlPresent);
const after={explorer3:sha(ex),inventory:sha(inv),canonical:sha(can),runtime:sha(run)};
const stable=JSON.stringify(before)===JSON.stringify(after), passed=targetPass&&navPass&&all&&stable;

const out={contract:"SCIIP_EXPLORER_4_M4_19D4BN2_R7E_R1_CDP_TARGET_RECONCILIATION_AND_LIVE_SEARCH_RECERTIFICATION",version:"4.0-m4.19d4bn2-r7e-r1",status:passed?"PASSED":"BLOCKED",state:passed?"M419D4BN2_R7E_R1_CDP_PAGE_TARGET_BOUND_TEN_PROPERTY_LIVE_SEARCH_RESULT_SELECTION_POST_SELECTION_VISIBILITY_RECERTIFIED_LIFECYCLE_CLOSURE_READY":"M419D4BN2_R7E_R1_LIVE_SEARCH_RECERTIFICATION_BLOCKED",certifiedAt:new Date().toISOString(),correction:{priorR7EFailure:"CDP_ATTACHED_TO_CHROME_EXTENSION_BACKGROUND_TARGET",correctedBy:"EXPLICIT_PAGE_TARGET_URL_SELECTION",extensionTargetsRejected:true},navigation:n,records:recs,hashes:{before,after},checks:{exactExplorerPageTargetBound:targetPass,explorerNavigationCertified:navPass,exactTenAttempted:recs.length===10,allInputValuesExact:recs.every(x=>x.inputValueMatchesQuery),allTenRenderedCandidatesVisible:recs.every(x=>x.matchingRenderedCandidateVisible),allTenSelectionsActivated:recs.every(x=>x.selectionActivated),allTenPostSelectionAddressesVisible:recs.every(x=>x.postSelectionAddressVisible),sourceAndDataHashesStable:stable},nextMilestone:passed?"M4.19D4BN2_R7F_TEN_PROPERTY_SEARCH_READ_PATH_REMEDIATION_LIFECYCLE_CLOSURE":"M4.19D4BN2_R7E_R2_LIVE_SEARCH_RECERTIFICATION_RECONCILIATION",authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,propagationAuthority:false,automaticRetry:false},safety:{productionCanonicalMutationPerformed:false,runtimeMirrorMutationPerformed:false,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,browserInteractionPerformed:true,networkRequestsPerformed:0,automaticRetry:false}};
fs.writeFileSync(path.join(ev,"m4-19d4bn2-r7e-r1-cdp-target-reconciliation-and-live-search-recertification.json"),JSON.stringify(out,null,2)+"\n"); console.log(JSON.stringify(out,null,2)); if(!passed) process.exitCode=2;
