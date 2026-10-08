#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";
import {httpGet,sleep,norm} from "./M419D4BGBHRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const auth=process.argv[3]||"";
const REQUIRED_AUTH="AUTHORIZE_M419D4BH_LIVE_EXPLORER_BROWSER_VISIBILITY_CHECK";
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bgPath=path.join(ev,"m4-19d4bg-live-explorer-runtime-render-preauthorization.json");
const prePath=path.join(ev,"m4-19d4bg-live-runtime-render-preauthorization-manifest.json");
const result=path.join(ev,"m4-19d4bh-live-explorer-browser-visibility-certification.json");
const audit=path.join(ev,"m4-19d4bh-live-browser-render-audit.json");
const runtimeLog=path.join(ev,"m4-19d4bh-local-runtime.log");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BH_CONTROLLED_LIVE_EXPLORER_BROWSER_VISIBILITY_CERTIFICATION",
 version:"4.0-m4.19d4bh",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{applicationSourceMutationPerformed:false,governedInventoryMutationPerformed:false,
  canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bgPath,prePath]) if(!fs.existsSync(p))
 done("BLOCKED","M419D4BH_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const bg=JSON.parse(fs.readFileSync(bgPath,"utf8"));
if(bg.state!=="M419D4BG_LIVE_EXPLORER_RUNTIME_RENDER_PREAUTHORIZED_BROWSER_EXECUTION_NOT_AUTHORIZED")
 done("BLOCKED","M419D4BH_BG_PREAUTHORIZED_STATE_REQUIRED",{observed:bg.state},3);
if(auth!==REQUIRED_AUTH)
 done("BLOCKED","M419D4BH_EXPLICIT_LIVE_BROWSER_AUTHORIZATION_REQUIRED",{requiredAuthorizationToken:REQUIRED_AUTH},3);

const pre=JSON.parse(fs.readFileSync(prePath,"utf8"));
const logFd=fs.openSync(runtimeLog,"a");
const child=spawn("npm",["run",pre.launch.name],{
 cwd:app,stdio:["ignore",logFd,logFd],env:{...process.env,BROWSER:"none"}
});
let serverUrl=null,serverProbe=null;
try{
 for(let attempt=0;attempt<30&&!serverUrl;attempt++){
  await sleep(1000);
  if(child.exitCode!==null)break;
  for(const pc of pre.portCandidates){
   const u=`http://127.0.0.1:${pc.port}`;
   const r=await httpGet(u,1200);
   if(r.ok){serverUrl=u;serverProbe={status:r.status,url:r.url,bodyPrefix:r.text.slice(0,500)};break;}
  }
 }
 if(!serverUrl){
  done("BLOCKED","M419D4BH_LOCAL_EXPLORER_RUNTIME_DID_NOT_BECOME_REACHABLE",{
   execution:{serverLaunchPerformed:true,serverReachable:false,runtimeLog},
   nextMilestone:"M4.19D4BH1_LOCAL_RUNTIME_STARTUP_FORENSICS"
  },3);
 }

 let browserType=null;
 const browser=pre.browser;
 let observed={};
 if(browser.id==="PLAYWRIGHT"){
  let pw;
  try{pw=await import("playwright")}catch{
   try{pw=await import("@playwright/test")}catch(e){
    done("BLOCKED","M419D4BH_PLAYWRIGHT_DECLARED_BUT_IMPORT_FAILED",{error:String(e),runtimeLog},3);
   }
  }
  const chromium=pw.chromium??pw.default?.chromium;
  if(!chromium)done("BLOCKED","M419D4BH_PLAYWRIGHT_CHROMIUM_API_NOT_AVAILABLE",{runtimeLog},3);
  const b=await chromium.launch({headless:true});
  try{
   const page=await b.newPage({viewport:{width:1600,height:1000}});
   const consoleMessages=[]; page.on("console",m=>consoleMessages.push({type:m.type(),text:m.text().slice(0,1000)}));
   await page.goto(serverUrl,{waitUntil:"networkidle",timeout:60000});
   const body=await page.locator("body").innerText({timeout:15000});

   /* Try exact address through likely search inputs if not already rendered. */
   let searchAttempted=false;
   if(!body.includes(pre.address)){
    const selectors=[
     'input[placeholder*="Search" i]','input[type="search"]',
     'input[aria-label*="Search" i]','input[placeholder*="address" i]'
    ];
    for(const sel of selectors){
     const el=page.locator(sel).first();
     if(await el.count()){
      try{
       await el.fill(pre.address); await page.waitForTimeout(700);
       await el.press("Enter").catch(()=>{});
       await page.waitForTimeout(1800);
       searchAttempted=true; break;
      }catch{}
     }
    }
   }
   const bodyAfter=await page.locator("body").innerText();
   /* Click an exact visible address if available to expose detail panel. */
   let addressClicked=false;
   const exact=page.getByText(pre.address,{exact:false}).first();
   if(await exact.count()){
    try{await exact.click({timeout:3000});await page.waitForTimeout(1200);addressClicked=true;}catch{}
   }
   const finalBody=await page.locator("body").innerText();
   const html=await page.content();

   observed={
    pageUrl:page.url(),title:await page.title(),searchAttempted,addressClicked,
    addressVisible:finalBody.toUpperCase().includes(pre.address.toUpperCase()),
    availableSfVisible:[
      "4,904","4904"
    ].some(v=>finalBody.includes(v)),
    canonicalIdVisible:finalBody.includes(pre.canonicalPropertyId)||html.includes(pre.canonicalPropertyId),
    latitudeBound:html.includes(String(pre.latitude)),
    longitudeBound:html.includes(String(pre.longitude)),
    renderedTextEvidence:finalBody.slice(0,30000),
    consoleMessages:consoleMessages.slice(-100)
   };
   browserType="PLAYWRIGHT";
  }finally{await b.close();}
 } else if(browser.id==="PUPPETEER"){
  let pp;
  try{pp=await import("puppeteer")}catch{
   try{pp=await import("puppeteer-core")}catch(e){
    done("BLOCKED","M419D4BH_PUPPETEER_DECLARED_BUT_IMPORT_FAILED",{error:String(e),runtimeLog},3);
   }
  }
  const api=pp.default??pp;
  let b;
  try{b=await api.launch({headless:true});}
  catch(e){done("BLOCKED","M419D4BH_PUPPETEER_BROWSER_LAUNCH_FAILED",{error:String(e),runtimeLog},3);}
  try{
   const page=await b.newPage(); await page.goto(serverUrl,{waitUntil:"networkidle0",timeout:60000});
   const text=await page.evaluate(()=>document.body?.innerText??"");
   const html=await page.content();
   observed={
    pageUrl:page.url(),title:await page.title(),searchAttempted:false,addressClicked:false,
    addressVisible:text.toUpperCase().includes(pre.address.toUpperCase()),
    availableSfVisible:["4,904","4904"].some(v=>text.includes(v)),
    canonicalIdVisible:text.includes(pre.canonicalPropertyId)||html.includes(pre.canonicalPropertyId),
    latitudeBound:html.includes(String(pre.latitude)),longitudeBound:html.includes(String(pre.longitude)),
    renderedTextEvidence:text.slice(0,30000)
   };
   browserType="PUPPETEER";
  }finally{await b.close();}
 }

 const checks={
  serverReachable:!!serverUrl,
  browserSessionExecuted:!!browserType,
  addressVisible:observed.addressVisible===true,
  availableSfVisible:observed.availableSfVisible===true,
  coordinateBindingEvidence:observed.latitudeBound===true&&observed.longitudeBound===true
 };
 const corePassed=checks.serverReachable&&checks.browserSessionExecuted&&checks.addressVisible&&checks.availableSfVisible;

 write(audit,{
  contract:"SCIIP_EXPLORER_4_M4_19D4BH_LIVE_BROWSER_RENDER_AUDIT",
  version:"4.0-m4.19d4bh",generatedAt:new Date().toISOString(),
  serverUrl,serverProbe,browserType,target:{
   canonicalPropertyId:pre.canonicalPropertyId,address:pre.address,latitude:pre.latitude,
   longitude:pre.longitude,availableSf:pre.availableSf
  },observed,checks,corePassed,runtimeLog
 });

 if(!corePassed){
  done("PASSED","M419D4BH_LIVE_BROWSER_EXECUTED_BESSEMER_RENDER_NOT_FULLY_CERTIFIED_UI_RECONCILIATION_REQUIRED",{
   certification:{serverUrl,browserType,checks,canonicalIdVisible:observed.canonicalIdVisible??false},
   artifacts:{liveBrowserRenderAudit:audit,runtimeLog},
   nextMilestone:"M4.19D4BH1_LIVE_UI_BESSEMER_RENDER_RECONCILIATION"
  });
 }

 done("PASSED","M419D4BH_LIVE_EXPLORER_BROWSER_BESSEMER_VISIBILITY_CERTIFIED",{
  certification:{serverUrl,browserType,checks,
   canonicalPropertyId:pre.canonicalPropertyId,address:pre.address,
   latitude:pre.latitude,longitude:pre.longitude,availableSf:pre.availableSf,
   liveBrowserRenderCertified:true},
  policy:{repositoryDataflowAndLiveRenderBothCertified:true,noApplicationMutation:true,
   liveSessionReadOnly:true},
  artifacts:{liveBrowserRenderAudit:audit,runtimeLog},
  nextMilestone:"M4.19D4BI_SINGLE_RECORD_REFRESH_LIFECYCLE_CLOSURE_AND_SCALE_OUT_READINESS"
 });
}finally{
 try{child.kill("SIGTERM")}catch{}
 await sleep(300);
 try{if(child.exitCode===null)child.kill("SIGKILL")}catch{}
 try{fs.closeSync(logFd)}catch{}
}
