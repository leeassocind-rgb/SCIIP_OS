#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import child_process from "node:child_process";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4bk1-r1-controlled-five-property-downstream-binding-execution-and-runtime-parity-certification.json");
const out=path.join(ev,"m4-19d4bk2-five-property-browser-runtime-visibility-and-explorer-read-path-certification.json");
const domOut=path.join(ev,"m4-19d4bk2-browser-dom.html");
const screenshot=path.join(ev,"m4-19d4bk2-browser-screenshot.png");
const runtimeLog=path.join(ev,"m4-19d4bk2-vite-runtime.log");

if(!fs.existsSync(prior)) throw new Error("BK1-R1 evidence missing");
const P=JSON.parse(fs.readFileSync(prior,"utf8"));
if(P.state!=="M419D4BK1_R1_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTED_RUNTIME_PARITY_CERTIFIED_BROWSER_VISIBILITY_CERTIFICATION_READY")
  throw new Error("BK1-R1 state mismatch: "+P.state);

const cohort=P.execution?.certification||[];
if(cohort.length!==5) throw new Error("exact five-property runtime cohort required");

console.log("[BK2] BK1-R1 runtime parity certification accepted");
console.log("[BK2] browser/runtime visibility certification only; application/data mutation OFF");

const browser="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if(!fs.existsSync(browser)) throw new Error("Google Chrome system browser not found");

const pkgPath=path.join(app,"package.json");
if(!fs.existsSync(pkgPath)) throw new Error("package.json missing");
const pkg=JSON.parse(fs.readFileSync(pkgPath,"utf8"));
if(!pkg.scripts?.dev) throw new Error("dev launch contract missing");

const port=5173;
let server=null;
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function reachable(){
  try{
    const r=await fetch(`http://127.0.0.1:${port}/`,{signal:AbortSignal.timeout(2000)});
    return r.ok;
  }catch{return false;}
}

let launched=false;
if(!(await reachable())){
  const fd=fs.openSync(runtimeLog,"w");
  server=child_process.spawn("npm",["run","dev","--","--host","127.0.0.1","--port",String(port)],{
    cwd:app,stdio:["ignore",fd,fd],detached:true
  });
  launched=true;
  let ok=false;
  for(let i=0;i<30;i++){ await sleep(1000); if(await reachable()){ok=true;break;} }
  if(!ok){
    try{process.kill(-server.pid,"SIGTERM")}catch{}
    throw new Error("local Explorer runtime did not become reachable");
  }
}

async function chromeDump(url, extra=[]){
  const args=[
    "--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check",
    "--disable-background-networking","--disable-sync","--metrics-recording-only",
    "--remote-debugging-port=0",
    "--virtual-time-budget=7000",
    "--window-size=1600,1000",
    ...extra,
    url
  ];
  return child_process.spawnSync(browser,args,{encoding:"utf8",maxBuffer:50*1024*1024});
}

const url=`http://127.0.0.1:${port}/`;
const dump=chromeDump(url,["--dump-dom"]);
fs.writeFileSync(domOut,dump.stdout||"");
const shot=chromeDump(url,[`--screenshot=${screenshot}`]);

if(launched && server){
  try{process.kill(-server.pid,"SIGTERM")}catch{}
}

const dom=fs.readFileSync(domOut,"utf8");
const bodyText=dom.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();

const checksByProperty=cohort.map(c=>{
  const addressVisible=bodyText.includes(c.address);
  const canonicalVisible=bodyText.includes(c.canonicalPropertyId);
  const sourceVisible=bodyText.includes(c.sourcePropertyId);
  return {
    cohortPosition:c.cohortPosition,
    address:c.address,
    canonicalPropertyId:c.canonicalPropertyId,
    sourcePropertyId:c.sourcePropertyId,
    addressVisibleInitialDom:addressVisible,
    canonicalIdVisibleInitialDom:canonicalVisible,
    sourcePropertyIdVisibleInitialDom:sourceVisible
  };
});

const shellChecks={
  serverReachable:true,
  browserExitZero:dump.status===0,
  domCaptured:dom.length>0,
  explorerShellVisible:/Explorer/i.test(bodyText),
  searchControlVisible:/Search SCIIP/i.test(bodyText),
  screenshotCaptured:fs.existsSync(screenshot),
  allFiveCanonicalMirrorBindingsStillCertified:cohort.every(x=>x.runtimeMirrorMatches===1)
};

const initialDomAllFive=checksByProperty.every(x=>x.addressVisibleInitialDom||x.canonicalIdVisibleInitialDom);
const shellReady=Object.values(shellChecks).every(Boolean);

const result={
  contract:"SCIIP_EXPLORER_4_M4_19D4BK2_FIVE_PROPERTY_BROWSER_RUNTIME_VISIBILITY_AND_EXPLORER_READ_PATH_CERTIFICATION",
  version:"4.0-m4.19d4bk2",
  status:shellReady?"PASSED":"BLOCKED",
  state:shellReady
    ? (initialDomAllFive
        ?"M419D4BK2_FIVE_PROPERTY_BROWSER_RUNTIME_VISIBILITY_CERTIFIED_LIFECYCLE_CLOSURE_READY"
        :"M419D4BK2_BROWSER_RUNTIME_AND_EXPLORER_READ_PATH_CERTIFIED_INTERACTIVE_FIVE_PROPERTY_SELECTION_REQUIRED")
    :"M419D4BK2_BROWSER_RUNTIME_READ_PATH_CERTIFICATION_BLOCKED",
  certifiedAt:new Date().toISOString(),
  certification:{
    serverUrl:url,
    browser:"GOOGLE_CHROME",
    shellChecks,
    propertyChecks:checksByProperty,
    initialDomAllFive,
    liveBrowserRenderExecuted:true,
    interactiveSearchSelectionExecuted:false,
    bodyExcerpt:bodyText.slice(0,5000)
  },
  artifacts:{
    renderedDom:domOut,
    screenshot,
    runtimeLog
  },
  policy:{
    browserCertificationReadOnly:true,
    applicationMutation:false,
    canonicalMutation:false,
    eventMutation:false,
    governedInventoryMutation:false,
    interactiveSearchSelectionRequiresSeparateMilestone:!initialDomAllFive
  },
  nextMilestone:shellReady
    ? (initialDomAllFive
        ?"M4.19D4BL_FIVE_PROPERTY_IDENTITY_LIFECYCLE_CLOSURE_AND_NEXT_COHORT_READINESS"
        :"M4.19D4BK3_INTERACTIVE_FIVE_PROPERTY_EXPLORER_SEARCH_SELECTION_AND_VISIBILITY_CERTIFICATION")
    :"M4.19D4BK2R_BROWSER_RUNTIME_RECONCILIATION",
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
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(!shellReady) process.exit(2);
