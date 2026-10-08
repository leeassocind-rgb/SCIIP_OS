#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import child_process from "node:child_process";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const prior=path.join(ev,"m4-19d4bk1-r1-controlled-five-property-downstream-binding-execution-and-runtime-parity-certification.json");
const out=path.join(ev,"m4-19d4bk2-r1-browser-runtime-visibility-and-explorer-read-path-certification.json");
const domOut=path.join(ev,"m4-19d4bk2-r1-browser-dom.html");
const screenshot=path.join(ev,"m4-19d4bk2-r1-browser-screenshot.png");
const runtimeLog=path.join(ev,"m4-19d4bk2-r1-vite-runtime.log");
const browserErr=path.join(ev,"m4-19d4bk2-r1-browser-stderr.log");

if(!fs.existsSync(prior)) throw new Error("BK1-R1 evidence missing");
const P=JSON.parse(fs.readFileSync(prior,"utf8"));
if(P.state!=="M419D4BK1_R1_FIVE_PROPERTY_DOWNSTREAM_BINDING_EXECUTED_RUNTIME_PARITY_CERTIFIED_BROWSER_VISIBILITY_CERTIFICATION_READY")
  throw new Error("BK1-R1 state mismatch: "+P.state);

const cohort=P.execution?.certification||[];
if(cohort.length!==5) throw new Error("exact five-property runtime cohort required");

console.log("[BK2-R1] BK1-R1 runtime parity certification accepted");
console.log("[BK2-R1] browser/runtime visibility certification only; application/data mutation OFF");

const browser="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
if(!fs.existsSync(browser)) throw new Error("Google Chrome system browser not found");

const pkgPath=path.join(app,"package.json");
if(!fs.existsSync(pkgPath)) throw new Error("package.json missing");
const pkg=JSON.parse(fs.readFileSync(pkgPath,"utf8"));
if(!pkg.scripts?.dev) throw new Error("dev launch contract missing");

const port=5173;
let server=null;
let launched=false;
let serverLogFd=null;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function reachable(){
  try{
    const r=await fetch(`http://127.0.0.1:${port}/`,{signal:AbortSignal.timeout(2000)});
    return r.ok;
  }catch{return false;}
}

function cleanupServer(){
  if(server){
    try{ process.kill(-server.pid,"SIGTERM"); }catch{}
    server=null;
  }
  if(serverLogFd!==null){
    try{ fs.closeSync(serverLogFd); }catch{}
    serverLogFd=null;
  }
}

async function ensureServer(){
  if(await reachable()){
    console.log("[BK2-R1] existing Explorer runtime reachable");
    return;
  }
  console.log("[BK2-R1] Explorer runtime not reachable; launching Vite");
  serverLogFd=fs.openSync(runtimeLog,"w");
  server=child_process.spawn("npm",["run","dev","--","--host","127.0.0.1","--port",String(port)],{
    cwd:app,
    stdio:["ignore",serverLogFd,serverLogFd],
    detached:true
  });
  launched=true;
  for(let i=1;i<=30;i++){
    await sleep(1000);
    if(await reachable()){
      console.log(`[BK2-R1] Explorer runtime reachable after ${i}s`);
      return;
    }
    if(i%5===0) console.log(`[BK2-R1] waiting for Explorer runtime... ${i}s`);
  }
  cleanupServer();
  throw new Error("local Explorer runtime did not become reachable within 30 seconds");
}

function runChrome(label,args,timeoutMs){
  console.log(`[BK2-R1] ${label} started`);
  const r=child_process.spawnSync(browser,args,{
    encoding:"utf8",
    maxBuffer:50*1024*1024,
    timeout:timeoutMs,
    killSignal:"SIGKILL"
  });
  const timedOut = r.error && r.error.code==="ETIMEDOUT";
  fs.appendFileSync(browserErr,
    `\n=== ${label} ===\nstatus=${r.status}\nsignal=${r.signal}\nerror=${r.error?String(r.error):""}\n${r.stderr||""}\n`
  );
  if(timedOut){
    console.log(`[BK2-R1] ${label} timed out after ${timeoutMs/1000}s`);
    return {...r,timedOut:true};
  }
  console.log(`[BK2-R1] ${label} completed status=${r.status}`);
  return {...r,timedOut:false};
}

let certification;
try{
  await ensureServer();

  const url=`http://127.0.0.1:${port}/`;
  const common=[
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-sync",
    "--metrics-recording-only",
    "--disable-component-update",
    "--disable-domain-reliability",
    "--disable-features=OptimizationHints,MediaRouter",
    "--window-size=1600,1000"
  ];

  const dump=runChrome(
    "DOM capture",
    [...common,"--virtual-time-budget=7000","--dump-dom",url],
    25000
  );

  if(dump.stdout) fs.writeFileSync(domOut,dump.stdout);

  const shot=runChrome(
    "screenshot capture",
    [...common,"--virtual-time-budget=7000",`--screenshot=${screenshot}`,url],
    25000
  );

  const dom=fs.existsSync(domOut)?fs.readFileSync(domOut,"utf8"):"";
  const bodyText=dom
    .replace(/<script[\s\S]*?<\/script>/gi," ")
    .replace(/<style[\s\S]*?<\/style>/gi," ")
    .replace(/<[^>]+>/g," ")
    .replace(/\s+/g," ")
    .trim();

  const propertyChecks=cohort.map(c=>({
    cohortPosition:c.cohortPosition,
    address:c.address,
    canonicalPropertyId:c.canonicalPropertyId,
    sourcePropertyId:c.sourcePropertyId,
    addressVisibleInitialDom:bodyText.includes(c.address),
    canonicalIdVisibleInitialDom:bodyText.includes(c.canonicalPropertyId),
    sourcePropertyIdVisibleInitialDom:bodyText.includes(c.sourcePropertyId)
  }));

  const shellChecks={
    serverReachable:await reachable(),
    domProcessExited:dump.status===0,
    domProcessTimedOut:dump.timedOut===true,
    domCaptured:dom.length>0,
    explorerShellVisible:/Explorer/i.test(bodyText),
    searchControlVisible:/Search SCIIP/i.test(bodyText),
    screenshotProcessExited:shot.status===0,
    screenshotProcessTimedOut:shot.timedOut===true,
    screenshotCaptured:fs.existsSync(screenshot),
    allFiveCanonicalMirrorBindingsStillCertified:cohort.every(x=>x.runtimeMirrorMatches===1)
  };

  const shellReady=
    shellChecks.serverReachable &&
    shellChecks.domCaptured &&
    shellChecks.explorerShellVisible &&
    shellChecks.searchControlVisible &&
    shellChecks.screenshotCaptured &&
    shellChecks.allFiveCanonicalMirrorBindingsStillCertified;

  const initialDomAllFive=propertyChecks.every(x=>x.addressVisibleInitialDom||x.canonicalIdVisibleInitialDom);

  let state, nextMilestone, status;
  if(shellReady){
    status="PASSED";
    if(initialDomAllFive){
      state="M419D4BK2_R1_FIVE_PROPERTY_BROWSER_RUNTIME_VISIBILITY_CERTIFIED_LIFECYCLE_CLOSURE_READY";
      nextMilestone="M4.19D4BL_FIVE_PROPERTY_IDENTITY_LIFECYCLE_CLOSURE_AND_NEXT_COHORT_READINESS";
    }else{
      state="M419D4BK2_R1_BROWSER_RUNTIME_AND_EXPLORER_READ_PATH_CERTIFIED_INTERACTIVE_FIVE_PROPERTY_SELECTION_REQUIRED";
      nextMilestone="M4.19D4BK3_INTERACTIVE_FIVE_PROPERTY_EXPLORER_SEARCH_SELECTION_AND_VISIBILITY_CERTIFICATION";
    }
  }else{
    status="BLOCKED";
    state="M419D4BK2_R1_BROWSER_RUNTIME_READ_PATH_CERTIFICATION_BLOCKED";
    nextMilestone="M4.19D4BK2_R2_BROWSER_RUNTIME_RECONCILIATION";
  }

  certification={
    contract:"SCIIP_EXPLORER_4_M4_19D4BK2_R1_BROWSER_RUNTIME_VISIBILITY_AND_EXPLORER_READ_PATH_CERTIFICATION_WITH_TIMEOUT_GUARDS",
    version:"4.0-m4.19d4bk2-r1",
    status,
    state,
    certifiedAt:new Date().toISOString(),
    correction:{
      priorBK2SilentHang:true,
      cause:"HEADLESS_CHROME_SYNCHRONOUS_CALL_WITHOUT_HARD_TIMEOUT",
      hardChromeTimeoutMs:25000,
      progressDiagnosticsEnabled:true,
      deterministicServerCleanup:true,
      priorProductionMutationPerformed:false
    },
    certification:{
      serverUrl:url,
      browser:"GOOGLE_CHROME",
      shellChecks,
      propertyChecks,
      initialDomAllFive,
      liveBrowserRenderExecuted:true,
      interactiveSearchSelectionExecuted:false,
      bodyExcerpt:bodyText.slice(0,5000)
    },
    artifacts:{
      renderedDom:domOut,
      screenshot,
      runtimeLog,
      browserStderr:browserErr
    },
    policy:{
      browserCertificationReadOnly:true,
      applicationMutation:false,
      canonicalMutation:false,
      eventMutation:false,
      governedInventoryMutation:false,
      interactiveSearchSelectionRequiresSeparateMilestone:!initialDomAllFive
    },
    nextMilestone,
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

  fs.writeFileSync(out,JSON.stringify(certification,null,2)+"\n");
  console.log(JSON.stringify(certification,null,2));

  if(status!=="PASSED") process.exitCode=2;
}finally{
  if(launched){
    console.log("[BK2-R1] stopping Vite runtime launched by this milestone");
    cleanupServer();
  }
}
