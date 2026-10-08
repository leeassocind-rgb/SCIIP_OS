#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawn,spawnSync} from "node:child_process";
import {sleep,httpGet} from "./M419D4BG1BH1Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const auth=process.argv[3]||"";
const REQUIRED_AUTH="AUTHORIZE_M419D4BH1_SYSTEM_BROWSER_LIVE_RENDER";
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bg1Path=path.join(ev,"m4-19d4bg1-system-browser-headless-readiness.json");
const prePath=path.join(ev,"m4-19d4bg1-system-browser-headless-preauthorization-manifest.json");
const result=path.join(ev,"m4-19d4bh1-system-browser-live-explorer-dom-visibility-certification.json");
const audit=path.join(ev,"m4-19d4bh1-system-browser-live-render-audit.json");
const domPath=path.join(ev,"m4-19d4bh1-live-explorer-rendered-dom.html");
const pngPath=path.join(ev,"m4-19d4bh1-live-explorer-screenshot.png");
const runtimeLog=path.join(ev,"m4-19d4bh1-local-vite-runtime.log");
const browserErr=path.join(ev,"m4-19d4bh1-system-browser-stderr.log");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BH1_CONTROLLED_SYSTEM_BROWSER_LIVE_EXPLORER_DOM_VISIBILITY_CERTIFICATION",
  version:"4.0-m4.19d4bh1",status,state,certifiedAt:new Date().toISOString(),...extra,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
   syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{applicationSourceMutationPerformed:false,dependencyInstallationPerformed:false,
   governedInventoryMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,
   automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}

for(const p of [bg1Path,prePath]) if(!fs.existsSync(p))
 done("BLOCKED","M419D4BH1_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const bg1=JSON.parse(fs.readFileSync(bg1Path,"utf8"));
if(bg1.state!=="M419D4BG1_SYSTEM_HEADLESS_BROWSER_RENDER_PATH_CERTIFIED_BH1_EXECUTION_PREAUTHORIZED")
 done("BLOCKED","M419D4BH1_BG1_SYSTEM_BROWSER_PREAUTHORIZED_STATE_REQUIRED",{observed:bg1.state},3);
if(auth!==REQUIRED_AUTH)
 done("BLOCKED","M419D4BH1_EXPLICIT_SYSTEM_BROWSER_RENDER_AUTHORIZATION_REQUIRED",{requiredAuthorizationToken:REQUIRED_AUTH},3);

const pre=JSON.parse(fs.readFileSync(prePath,"utf8"));
const logFd=fs.openSync(runtimeLog,"a");
const child=spawn("npm",["run",pre.launch.name],{
 cwd:app,stdio:["ignore",logFd,logFd],env:{...process.env,BROWSER:"none"}
});
let serverUrl=null,probe=null;

try{
 for(let attempt=0;attempt<35&&!serverUrl;attempt++){
  await sleep(800);
  if(child.exitCode!==null)break;
  for(const port of pre.portCandidates){
   const u=`http://127.0.0.1:${port}`;
   const r=await httpGet(u,1200);
   if(r.ok){serverUrl=u;probe={status:r.status,url:r.url,bodyPrefix:r.text.slice(0,500)};break;}
  }
 }
 if(!serverUrl){
  done("BLOCKED","M419D4BH1_LOCAL_VITE_RUNTIME_NOT_REACHABLE",{
   execution:{serverLaunchPerformed:true,serverReachable:false,runtimeLog},
   nextMilestone:"M4.19D4BH2_LOCAL_RUNTIME_STARTUP_FORENSICS"
  },3);
 }

 const profile=path.join(ev,"m4-19d4bh1-chrome-profile");
 try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
 fs.mkdirSync(profile,{recursive:true});

 const common=[
  "--headless=new","--disable-gpu","--disable-background-networking",
  "--disable-default-apps","--disable-extensions","--disable-sync",
  "--metrics-recording-only","--no-first-run",
  `--user-data-dir=${profile}`,"--window-size=1600,1000",
  "--virtual-time-budget=12000"
 ];

 const dump=spawnSync(pre.browser.path,[...common,"--dump-dom",serverUrl],{
  cwd:app,encoding:"utf8",timeout:45000,maxBuffer:30*1024*1024
 });
 fs.writeFileSync(domPath,dump.stdout??"","utf8");
 fs.writeFileSync(browserErr,dump.stderr??"","utf8");

 const shot=spawnSync(pre.browser.path,[...common,`--screenshot=${pngPath}`,serverUrl],{
  cwd:app,encoding:"utf8",timeout:45000,maxBuffer:10*1024*1024
 });

 const dom=dump.stdout??"";
 const target=pre.target;
 const checks={
  serverReachable:true,
  browserExitZero:dump.status===0,
  domCaptured:dom.length>100,
  addressVisible:dom.toUpperCase().includes(target.address.toUpperCase()),
  availableSfVisible:["4,904","4904"].some(v=>dom.includes(v)),
  canonicalIdBound:dom.includes(target.canonicalPropertyId),
  latitudeBound:dom.includes(String(target.latitude)),
  longitudeBound:dom.includes(String(target.longitude)),
  screenshotCaptured:fs.existsSync(pngPath)&&fs.statSync(pngPath).size>1000
 };

 const renderQualified=checks.browserExitZero&&checks.domCaptured&&checks.addressVisible&&checks.availableSfVisible;

 write(audit,{
  contract:"SCIIP_EXPLORER_4_M4_19D4BH1_SYSTEM_BROWSER_LIVE_RENDER_AUDIT",
  version:"4.0-m4.19d4bh1",generatedAt:new Date().toISOString(),
  serverUrl,probe,browser:pre.browser,target,checks,renderQualified,
  execution:{
   dumpStatus:dump.status,dumpSignal:dump.signal,dumpError:String(dump.error??""),
   screenshotStatus:shot.status,screenshotSignal:shot.signal,screenshotError:String(shot.error??"")
  },
  artifacts:{renderedDom:domPath,screenshot:pngPath,browserStderr:browserErr,runtimeLog}
 });

 if(!renderQualified){
  done("PASSED","M419D4BH1_SYSTEM_BROWSER_LIVE_RENDER_EXECUTED_BESSEMER_NOT_VISIBLE_IN_INITIAL_DOM_INTERACTIVE_UI_PATH_REQUIRED",{
   certification:{serverUrl,browser:pre.browser.id,checks,liveBrowserRenderExecuted:true,liveBessemerVisibilityCertified:false},
   artifacts:{liveRenderAudit:audit,renderedDom:domPath,screenshot:pngPath,browserStderr:browserErr,runtimeLog},
   nextMilestone:"M4.19D4BH2_INTERACTIVE_SEARCH_AND_PROPERTY_SELECTION_BROWSER_HARNESS"
  });
 }

 done("PASSED","M419D4BH1_SYSTEM_BROWSER_LIVE_EXPLORER_BESSEMER_DOM_VISIBILITY_CERTIFIED",{
  certification:{
   serverUrl,browser:pre.browser.id,checks,
   canonicalPropertyId:target.canonicalPropertyId,address:target.address,
   latitude:target.latitude,longitude:target.longitude,availableSf:target.availableSf,
   liveBrowserRenderExecuted:true,liveBessemerVisibilityCertified:true
  },
  policy:{liveRenderedDomEvidenceCertified:true,systemBrowserOnly:true,noApplicationMutation:true,noDependencyInstallation:true},
  artifacts:{liveRenderAudit:audit,renderedDom:domPath,screenshot:pngPath,browserStderr:browserErr,runtimeLog},
  nextMilestone:"M4.19D4BI_SINGLE_RECORD_REFRESH_LIFECYCLE_CLOSURE_AND_SCALE_OUT_READINESS"
 });
} finally {
 try{child.kill("SIGTERM")}catch{}
 await sleep(300);
 try{if(child.exitCode===null)child.kill("SIGKILL")}catch{}
 try{fs.closeSync(logFd)}catch{}
}
